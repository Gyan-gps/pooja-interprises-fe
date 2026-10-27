import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Plus } from "lucide-react";
import type { SelectOption } from "./FormField";

interface ComboBoxProps {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  /** When set, typing a value not in the list offers an "Add" item that calls this with the typed text. */
  onCreate?: (label: string) => void;
}

/** Searchable select. Type to filter; Enter picks the first match (or adds a new entry when onCreate is set). */
export function ComboBox({ label, value, options, onChange, placeholder = "Search...", error, onCreate }: ComboBoxProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [listStyle, setListStyle] = useState<CSSProperties>({});
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = options.find(o => o.value === value);
  const q = query.trim().toLowerCase();
  const matches = q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
  const canCreate = Boolean(onCreate && q && !options.some(o => o.label.toLowerCase() === q));
  const itemCount = matches.length + (canCreate ? 1 : 0);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // The list is portalled to <body> with fixed positioning so scrollable parents (e.g. Modal) don't clip it.
  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const r = inputRef.current?.getBoundingClientRect();
      if (!r) return;
      const maxHeight = 224;
      const below = window.innerHeight - r.bottom;
      const flip = below < maxHeight + 8 && r.top > below;
      setListStyle({
        position: "fixed",
        left: r.left,
        width: r.width,
        maxHeight: Math.min(maxHeight, (flip ? r.top : below) - 8),
        ...(flip ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
      });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  function openList() {
    setQuery("");
    setActive(0);
    setOpen(true);
  }

  function pick(index: number) {
    if (index < matches.length) onChange(matches[index].value);
    else if (canCreate) onCreate!(query.trim());
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") { e.preventDefault(); openList(); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(itemCount - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (itemCount) pick(active); }
    // Stop propagation so Escape only closes the list, not the surrounding Modal.
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); }
  }

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id} className="text-xs font-semibold text-muted-foreground block mb-1">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-invalid={Boolean(error)}
          autoComplete="off"
          className={`w-full border border-border rounded-lg pl-3 pr-8 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30 ${error ? "border-destructive" : ""}`}
          placeholder={selected ? selected.label : placeholder}
          value={open ? query : selected?.label ?? ""}
          onFocus={openList}
          onClick={() => !open && openList()}
          onChange={e => { setQuery(e.target.value); setActive(0); setOpen(true); }}
          onKeyDown={onKeyDown}
        />
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
      {open && createPortal(
        <ul ref={listRef} role="listbox" style={listStyle} className="z-[100] overflow-auto bg-white border border-border rounded-lg shadow-lg py-1">
          {matches.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseDown={e => { e.preventDefault(); pick(i); }}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer ${i === active ? "bg-muted" : ""}`}
            >
              {o.label}
              {o.value === value && <Check size={13} className="text-[#E84C1E]" />}
            </li>
          ))}
          {canCreate && (
            <li
              role="option"
              aria-selected={false}
              onMouseDown={e => { e.preventDefault(); pick(matches.length); }}
              onMouseEnter={() => setActive(matches.length)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#E84C1E] cursor-pointer ${active === matches.length ? "bg-muted" : ""}`}
            >
              <Plus size={13} /> Add "{query.trim()}"
            </li>
          )}
          {itemCount === 0 && <li className="px-3 py-2 text-xs text-muted-foreground">No matches.</li>}
        </ul>
,
        document.body
      )}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
