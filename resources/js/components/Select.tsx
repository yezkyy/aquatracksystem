import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps {
    value: string | number;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

export default function Select({
    value,
    onChange,
    options,
    placeholder = 'Pilih salah satu...',
    error,
    leftIcon
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Find the currently selected option to show its label
    const selectedOption = options.find(opt => String(opt.value) === String(value));

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectOption = (optValue: string | number) => {
        onChange(String(optValue));
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative w-full text-left">
            {/* Clickable Select Field */}
            <div
                onClick={() => setIsOpen(prev => !prev)}
                className={`w-full h-11 pr-4 rounded-input border flex items-center justify-between bg-white text-sm cursor-pointer select-none transition-all relative ${
                    leftIcon ? 'pl-10' : 'pl-4'
                } ${
                    isOpen ? 'border-primary ring-2 ring-primary/20' : error ? 'border-danger-app' : 'border-border-app'
                }`}
            >
                {/* Left Icon (Optional) */}
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-app/70">
                        {leftIcon}
                    </div>
                )}

                {/* Display Value / Placeholder */}
                <span className={`truncate mr-2 ${selectedOption ? 'text-fg-app font-medium' : 'text-muted-app/60 font-medium'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>

                {/* Right Arrow Icon */}
                <ChevronDown className={`h-4.5 w-4.5 text-muted-app/70 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-primary' : ''
                }`} />
            </div>

            {/* Dropdown Options List */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute z-50 mt-1.5 w-full bg-white border border-border-app/80 rounded-card p-1.5 shadow-[0_10px_30px_rgba(23,32,34,0.08)] max-h-60 overflow-y-auto"
                    >
                        {options.length === 0 ? (
                            <div className="py-2.5 px-3.5 text-xs text-muted-app font-medium italic">
                                Tidak ada pilihan tersedia
                            </div>
                        ) : (
                            options.map(opt => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelectOption(opt.value)}
                                        className={`w-full py-2.5 px-3.5 rounded-lg flex items-center justify-between text-left text-xs font-semibold transition-all cursor-pointer ${
                                            isSelected 
                                                ? 'bg-primary-light text-primary font-bold' 
                                                : 'text-fg-app hover:bg-bg-app hover:text-fg-app'
                                        }`}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                                    </button>
                                );
                            })
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
