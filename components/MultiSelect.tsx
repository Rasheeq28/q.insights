"use client";

import { useState, useRef, useEffect } from "react";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  label,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.toLowerCase().includes(search.toLowerCase()) && !selected.includes(opt)
  );

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
    setSearch("");
  };

  const removeOption = (option: string) => {
    onChange(selected.filter((item) => item !== option));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
          {label}
        </label>
      )}
      <div
        className={`min-h-[42px] w-full bg-slate-900/80 border rounded-lg px-2 py-1.5 flex flex-wrap gap-1.5 cursor-text transition-all ${
          isOpen ? "border-brand-emerald/50 ring-1 ring-brand-emerald/20" : "border-white/10"
        }`}
        onClick={() => setIsOpen(true)}
      >
        {selected.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1 bg-brand-emerald/10 text-brand-emerald text-xs font-bold px-2 py-1 rounded-md border border-brand-emerald/20"
          >
            {item}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeOption(item);
              }}
              className="hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[60px] bg-transparent border-none outline-none text-sm text-white placeholder-slate-600 h-7"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
          {filteredOptions.length > 0 ? (
            <div className="p-1">
              {filteredOptions.slice(0, 50).map((option) => (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-brand-emerald/10 hover:text-brand-emerald rounded-md transition-colors flex items-center justify-between group"
                >
                  {option}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              ))}
              {filteredOptions.length > 50 && (
                <div className="px-3 py-2 text-[10px] text-slate-500 text-center italic border-t border-white/5">
                  Type to see more results...
                </div>
              )}
            </div>
          ) : (
            <div className="px-3 py-4 text-center text-slate-500 text-xs italic">
              {search ? "No matches found" : "No more options available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
