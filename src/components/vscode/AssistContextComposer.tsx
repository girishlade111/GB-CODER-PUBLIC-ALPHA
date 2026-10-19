import React, { useMemo, useRef, useState } from 'react';
import { MultiFileProject } from '../../types/files';
import { ContextBuilder, isSensitiveFilePath, isIgnoredBuildPath, isBinaryFilePath } from '../../services/ai/contextBuilder';

interface Props {
  project: MultiFileProject;
  paths: string[];
  prompt: string;
  setPrompt: (value: string) => void;
  toggle: (path: string) => void;
  clear: () => void;
  onSend: () => void;
  provider: string;
  budgetTokens: number;
  activePath?: string | null;
  isDirty?: (path: string) => boolean;
}

export function AssistContextComposer({ project, paths, prompt, setPrompt, toggle, clear, onSend, provider, budgetTokens, activePath, isDirty }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [mention, setMention] = useState<{ start: number; end: number; query: string } | null>(null);
  const [index, setIndex] = useState(0);
  const entries = useMemo(() => {
    const all = new Set<string>();
    for (const file of project.files) {
      if (isSensitiveFilePath(file.path) || isIgnoredBuildPath(file.path) || isBinaryFilePath(file.path)) continue;
      all.add(file.path);
      const parts = file.path.split('/');
      for (let i = 1; i < parts.length; i++) all.add(parts.slice(0, i).join('/') + '/');
    }
    return [...all].sort();
  }, [project.files]);
  const matches = entries.filter((path) => path.toLowerCase().includes((mention?.query ?? query).toLowerCase()));
  const visible = matches.filter((path) => {
    if (query || mention) return true;
    const parts = path.replace(/\/$/, '').split('/');
    return parts.slice(0, -1).every((_, i) => expanded.has(parts.slice(0, i + 1).join('/') + '/'));
  }).slice(0, 100);
  const context = ContextBuilder.assembleContext(project, activePath, paths, prompt, budgetTokens);
  const attachMention = (path: string) => {
    if (!paths.includes(path)) toggle(path);
    if (mention) {
      const caret = mention.start;
      setPrompt(prompt.slice(0, caret) + prompt.slice(mention.end));
      requestAnimationFrame(() => { inputRef.current?.focus(); inputRef.current?.setSelectionRange(caret, caret); });
    }
    setMention(null);
  };
  const label = (path: string, q: string) => {
    const start = path.toLowerCase().indexOf(q.toLowerCase());
    return q && start >= 0 ? <>{path.slice(0, start)}<mark>{path.slice(start, start + q.length)}</mark>{path.slice(start + q.length)}</> : path;
  };
  return <div className="space-y-2" data-testid="assist-context-composer">
    <div className="flex flex-wrap gap-1">
      <button type="button" onClick={() => setOpen(!open)} className="text-cyan-300" aria-expanded={open}>Attach Context</button>
      {paths.map((path) => {
        const exists = entries.includes(path);
        return <span key={path} title={path} className="rounded border border-white/20 px-1" data-testid="context-attachment-chip">
          {path.endsWith('/') ? '📁' : '📄'} {path}{!exists && ' (missing or protected)'}
          {isDirty?.(path) && ' (unsaved)'} <button type="button" aria-label={`Remove ${path}`} onClick={() => toggle(path)}>×</button>
        </span>;
      })}
      {!!paths.length && <button type="button" onClick={clear}>Clear attachments</button>}
    </div>
    <details className="text-[10px] text-slate-400" data-testid="context-preview">
      <summary>Review context sent to {provider}: {context.summary}</summary>
      <p>Sensitive, generated and binary files are excluded. Folder context is limited to 40 files, depth 16 and the token budget.</p>
      {context.files.map((file) => <details key={file.path}><summary>{file.path} {isDirty?.(file.path) && '(unsaved buffer)'} {file.isTruncated && '(truncated)'}</summary><pre className="max-h-40 overflow-auto whitespace-pre-wrap select-text">{file.content}</pre></details>)}
    </details>
    {open && <div role="dialog" aria-label="Files and folders" className="border border-white/20 p-2 space-y-1">
      <input aria-label="Search project paths" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent border border-white/20 p-1" />
      <div className="max-h-40 overflow-auto">
        {!visible.length && <p>No matching project paths</p>}
        {visible.map((path) => <div key={path} className="flex gap-1">
          {path.endsWith('/') && <button type="button" aria-label={`Toggle ${path}`} aria-expanded={expanded.has(path)} onClick={() => setExpanded((prev) => {
            const next = new Set(prev); if (next.has(path)) next.delete(path); else next.add(path); return next;
          })}>{expanded.has(path) ? '▾' : '▸'}</button>}
          <label><input type="checkbox" checked={selected.includes(path)} onChange={() => setSelected((prev) => prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path])} /> {path.endsWith('/') ? '📁' : '📄'} {label(path, query)}</label>
        </div>)}
      </div>
      <p className="text-[10px]">Showing up to 100 paths. Search to narrow results.</p>
      <button type="button" onClick={() => setSelected([])}>Clear selection</button>{' · '}
      <button type="button" onClick={() => { selected.forEach((path) => { if (!paths.includes(path)) toggle(path); }); setSelected([]); setOpen(false); }}>Attach selected items</button>
    </div>}
    {mention && <div role="listbox" aria-label="Mention project context" className="max-h-40 overflow-auto border border-white/20">
      {!visible.length && <p>No matching paths</p>}
      {visible.map((path, i) => <button type="button" role="option" aria-selected={i === index} key={path}
        onMouseDown={(e) => e.preventDefault()} onClick={() => attachMention(path)}
        className={`block w-full text-left p-1 ${i === index ? 'bg-cyan-900' : ''}`}>{path.endsWith('/') ? '📁' : '📄'} {label(path, mention.query)}</button>)}
    </div>}
    <textarea ref={inputRef} rows={2} value={prompt} data-testid="ai-prompt-input" aria-label="Ask GB Assist"
      className="w-full resize-none bg-transparent text-xs text-white focus:outline-none"
      placeholder="Ask GB Assist, @file or @folder…"
      onChange={(e) => {
        setPrompt(e.target.value);
        const end = e.target.selectionStart;
        const match = /(?:^|\s)@([^\s@]*)$/.exec(e.target.value.slice(0, end));
        setMention(match ? { start: end - match[1].length - 1, end, query: match[1] } : null); setIndex(0);
      }}
      onKeyDown={(e) => {
        if (mention) {
          if (e.key === 'Escape') { e.preventDefault(); setMention(null); return; }
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + Math.max(visible.length, 1)) % Math.max(visible.length, 1)); return; }
          if (e.key === 'Enter') { e.preventDefault(); if (visible[index]) attachMention(visible[index]); return; }
        }
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
      }} />
  </div>;
}
