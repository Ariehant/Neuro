import { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
};

export function InlineEditable({ value, onChange, multiline, className = '', placeholder }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    if (draft !== value) onChange(draft);
  }

  if (!editing) {
    return (
      <div
        className={`${className} cursor-text`}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
      >
        {value || <span className="opacity-50">{placeholder}</span>}
      </div>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            commit();
          }
        }}
        onClick={(e) => e.stopPropagation()}
        rows={Math.max(2, Math.min(8, draft.split('\n').length))}
        className={`${className} w-full resize-none rounded border border-sky-400 bg-white/90 px-1 outline-none dark:bg-slate-900/90`}
      />
    );
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setDraft(value);
          setEditing(false);
        } else if (e.key === 'Enter') {
          commit();
        }
      }}
      onClick={(e) => e.stopPropagation()}
      className={`${className} w-full rounded border border-sky-400 bg-white/90 px-1 outline-none dark:bg-slate-900/90`}
    />
  );
}
