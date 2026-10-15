import { useEffect, useState } from 'react';
import Editor, { loader, type EditorProps } from '@monaco-editor/react';

let initialization: Promise<void> | null = null;

function initialize(): Promise<void> {
  if (!initialization) {
    // Keep Monaco out of the dashboard's initial payload. Configure the shared
    // React loader before any Editor mounts so it never requests CDN scripts.
    initialization = import('monaco-editor').then((monaco) => {
      loader.config({ monaco });
    }).catch((error) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}

export default function LocalMonacoEditor(props: EditorProps) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void initialize().then(() => { if (active) setReady(true); }).catch((error) => {
      console.error('[Editor] Could not load Monaco:', error);
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, []);
  if (!ready) {
    return <div role="status" style={{ height: props.height ?? '100%', width: props.width ?? '100%' }}
      className="flex items-center justify-center text-sm text-content-muted">
      {failed ? 'Could not load the editor. Reload to retry.' : 'Loading editor…'}
    </div>;
  }
  return <Editor {...props} />;
}
