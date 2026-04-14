"use client";

interface SelectionChipsProps {
    label: string;
    options: string[];
    selected: string | string[];
    onSelect: (option: string) => void;
}

export function SelectionChips({ label, options, selected, onSelect }: SelectionChipsProps) {
    return (
        <div className="flex flex-col gap-3">
            <span className="font-inter font-bold text-[13px] text-[#2F2F2F]">{label}</span>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                    const isSelected = Array.isArray(selected) ? selected.includes(opt) : selected === opt;
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => onSelect(opt)}
                            className={`px-4 py-2 rounded-full border transition-all text-[14px] font-inter font-medium
                                ${isSelected 
                                    ? 'bg-[#D1FC00] border-[#D1FC00] text-[#000000] scale-[1.02] shadow-sm' 
                                    : 'bg-[#F6F6F6] border-[#1C1917]/5 text-[#5B5B5B] hover:border-[#D1FC00] hover:bg-white'
                                }`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
