import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { SerializedValue } from '../../services/consoleBridge';

/**
 * Chrome-DevTools-style value renderer.
 *
 * Primitives render inline and syntax-coloured; objects, arrays, Maps and Sets
 * render as a one-line preview that expands into a nested tree on click,
 * collapsed by default. The previous console flattened every object to the
 * literal text `[Object]`.
 */

interface ConsoleValueTreeProps {
  value: SerializedValue;
  /** Nesting level, used to cap auto-expansion and indent children. */
  depth?: number;
  /** Property name shown before the value inside a tree. */
  label?: string;
}

/** Inline, non-expandable rendering for primitives. */
const Primitive: React.FC<{ value: SerializedValue }> = ({ value }) => {
  switch (value.kind) {
    case 'string':
      return (
        <span className="text-amber-300">
          &quot;{value.value}
          {value.truncated && <span className="text-gray-500">… (truncated)</span>}&quot;
        </span>
      );
    case 'number':
      return <span className="text-sky-300">{value.value}</span>;
    case 'bigint':
      return <span className="text-sky-300">{value.value}n</span>;
    case 'boolean':
      return <span className="text-violet-300">{String(value.value)}</span>;
    case 'null':
      return <span className="text-gray-500">null</span>;
    case 'undefined':
      return <span className="text-gray-500">undefined</span>;
    case 'symbol':
      return <span className="text-emerald-300">{value.value}</span>;
    case 'function':
      return (
        <span className="text-violet-300 italic">
          {value.isClass ? 'class' : 'ƒ'} {value.name}
          {value.isClass ? '' : '()'}
        </span>
      );
    case 'date':
      return <span className="text-teal-300">{value.value}</span>;
    case 'regexp':
      return <span className="text-rose-300">{value.value}</span>;
    case 'node':
      return <span className="text-orange-300">{value.preview}</span>;
    case 'circular':
      return <span className="text-gray-500 italic">[Circular]</span>;
    case 'max-depth':
      return <span className="text-gray-500 italic">{value.preview} …</span>;
    case 'unserializable':
      return <span className="text-gray-500 italic">[{value.preview}]</span>;
    case 'error':
      /* The stack renders below the row as clickable frames, not inline here. */
      return (
        <span className="text-red-300">
          {value.name}: {value.message}
        </span>
      );
    default:
      return null;
  }
};

/** True when the value has children worth expanding. */
const isExpandable = (
  value: SerializedValue,
): value is Extract<SerializedValue, { kind: 'array' | 'object' | 'collection' }> =>
  value.kind === 'array' || value.kind === 'object' || value.kind === 'collection';

/** Collapsed one-line summary, mirroring devtools' preview text. */
const summaryOf = (value: SerializedValue): string => {
  switch (value.kind) {
    case 'array':
      return `Array(${value.length})`;
    case 'collection':
      return `${value.ctor}(${value.size})`;
    case 'object': {
      const keys = value.entries.slice(0, 3).map((entry) => entry.key);
      const suffix = value.entries.length > 3 || value.truncated ? ', …' : '';
      const prefix = value.ctor && value.ctor !== 'Object' ? `${value.ctor} ` : '';
      return `${prefix}{${keys.length ? ` ${keys.join(', ')}${suffix} ` : ''}}`;
    }
    default:
      return '';
  }
};

const ConsoleValueTree: React.FC<ConsoleValueTreeProps> = ({ value, depth = 0, label }) => {
  // Collapsed by default at every level, as the brief requires.
  const [isOpen, setIsOpen] = useState(false);

  if (!isExpandable(value)) {
    return (
      <span>
        {label !== undefined && <span className="text-purple-300">{label}: </span>}
        <Primitive value={value} />
      </span>
    );
  }

  const { entries, truncated } = value;

  return (
    <span className="inline-block align-top">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-start gap-0.5 text-left hover:bg-white/5 rounded px-0.5 -mx-0.5"
        aria-expanded={isOpen}
        title={isOpen ? 'Collapse' : 'Expand'}
      >
        {isOpen ? (
          <ChevronDown className="w-3 h-3 mt-[3px] flex-shrink-0 text-gray-400" />
        ) : (
          <ChevronRight className="w-3 h-3 mt-[3px] flex-shrink-0 text-gray-400" />
        )}
        {label !== undefined && <span className="text-purple-300">{label}: </span>}
        <span className="text-gray-300">{summaryOf(value)}</span>
      </button>

      {isOpen && (
        <div className="ml-4 border-l border-gray-700/60 pl-2 mt-0.5 space-y-0.5">
          {entries.map((entry) => (
            <div key={entry.key} className="leading-relaxed">
              <ConsoleValueTree value={entry.value} depth={depth + 1} label={entry.key} />
            </div>
          ))}
          {truncated && (
            <div className="text-gray-500 italic text-xs">
              … more entries not captured (limit reached)
            </div>
          )}
        </div>
      )}
    </span>
  );
};

export default ConsoleValueTree;
