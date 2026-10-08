// src/components/ui/SearchSelect.tsx
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

type Option = {
  value: string | number;
  label: string;       // primary line (e.g. name)
  sublabel?: string;   // secondary line (e.g. email)
};

type Props = {
  options: Option[];
  value: string | number | "";
  onChange: (value: string | number | "") => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyText?: string;
};

const SearchSelect = ({
  options,
  value,
  onChange,
  placeholder = "— Select —",
  disabled = false,
  loading = false,
  emptyText = "No options available",
}: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = query.trim()
    ? options.filter((o) => {
        const q = query.toLowerCase();
        return (
          o.label.toLowerCase().includes(q) ||
          (o.sublabel ?? "").toLowerCase().includes(q)
        );
      })
    : options;

  /* Close on outside click */
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  /* Focus input when opened */
  useEffect(() => {
    if (open) {
      // tiny delay so the input exists in the DOM
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const handlePick = (opt: Option) => {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2 border rounded-lg text-left text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2d67] ${
          disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
        }`}
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {loading
            ? "Loading…"
            : selected
            ? selected.label
            : placeholder}
        </span>

        <span className="flex items-center gap-1 shrink-0">
          {selected && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Clear"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border rounded-lg shadow-lg overflow-hidden">
          {/* Search box */}
          <div className="p-2 border-b bg-gray-50">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
              />
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">
                {options.length === 0 ? emptyText : "No matches"}
              </li>
            ) : (
              filtered.map((opt) => {
                const isSelected =
                  String(opt.value) === String(value);
                return (
                  <li
                    key={opt.value}
                    onClick={() => handlePick(opt)}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                      isSelected ? "bg-blue-50 text-[#0c2d67] font-medium" : ""
                    }`}
                  >
                    <div className="truncate">{opt.label}</div>
                    {opt.sublabel && (
                      <div className="text-xs text-gray-500 truncate">
                        {opt.sublabel}
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchSelect;