import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
}

export default function DatePicker({
    value,
    onChange,
    placeholder = 'Pilih tanggal...',
    error,
    required = false
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial state based on selected date or today
    const initialDate = value ? new Date(value) : new Date();
    const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

    // Month names in Indonesian
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Day labels
    const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    // Close calendar on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Short month names for input display to fit compact layouts
    const shortMonths = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    // Format YYYY-MM-DD date to Indonesian date string
    const formatIndonesianDate = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        const monthIndex = parseInt(month) - 1;
        if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return dateStr;
        return `${parseInt(day)} ${shortMonths[monthIndex]} ${year}`;
    };

    // Calendar generation helpers
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const handleSelectDay = (day: number, isCurrentMonth: boolean, offset: 'prev' | 'curr' | 'next') => {
        let selectMonth = currentMonth;
        let selectYear = currentYear;

        if (offset === 'prev') {
            if (currentMonth === 0) {
                selectMonth = 11;
                selectYear = currentYear - 1;
            } else {
                selectMonth = currentMonth - 1;
            }
        } else if (offset === 'next') {
            if (currentMonth === 11) {
                selectMonth = 0;
                selectYear = currentYear + 1;
            } else {
                selectMonth = currentMonth + 1;
            }
        }

        const paddedMonth = String(selectMonth + 1).padStart(2, '0');
        const paddedDay = String(day).padStart(2, '0');
        const formattedDate = `${selectYear}-${paddedMonth}-${paddedDay}`;
        
        onChange(formattedDate);
        setIsOpen(false);
    };

    const handleSelectToday = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const today = new Date();
        const paddedMonth = String(today.getMonth() + 1).padStart(2, '0');
        const paddedDay = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${today.getFullYear()}-${paddedMonth}-${paddedDay}`;
        onChange(formattedDate);
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
        setIsOpen(false);
    };

    const handleClearDate = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onChange('');
        setIsOpen(false);
    };

    // Render calendar days grid
    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

        // Previous month filler days
        const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = getDaysInMonth(prevYear, prevMonthIndex);
        
        const calendarCells = [];

        // 1. Fill previous month's ending days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            calendarCells.push({ day: dayNum, offset: 'prev' as const });
        }

        // 2. Fill current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            calendarCells.push({ day: i, offset: 'curr' as const });
        }

        // 3. Fill next month's starting days to complete the 6-row grid (42 cells)
        const totalCells = 42;
        const remainingCells = totalCells - calendarCells.length;
        for (let i = 1; i <= remainingCells; i++) {
            calendarCells.push({ day: i, offset: 'next' as const });
        }

        return calendarCells.map((cell, idx) => {
            const isSelected = value === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}` && cell.offset === 'curr';
            
            const today = new Date();
            const isToday = today.getDate() === cell.day && 
                            today.getMonth() === currentMonth && 
                            today.getFullYear() === currentYear && 
                            cell.offset === 'curr';

            let cellClass = 'h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all relative cursor-pointer ';
            
            if (cell.offset !== 'curr') {
                cellClass += 'text-muted-app/30 hover:bg-bg-app hover:text-fg-app';
            } else if (isSelected) {
                cellClass += 'bg-primary text-white font-extrabold shadow-sm shadow-primary/30 scale-105';
            } else if (isToday) {
                cellClass += 'border border-primary text-primary font-bold';
            } else {
                cellClass += 'text-fg-app hover:bg-bg-app hover:text-fg-app';
            }

            return (
                <button
                    key={`${cell.offset}-${cell.day}-${idx}`}
                    type="button"
                    onClick={() => handleSelectDay(cell.day, cell.offset === 'curr', cell.offset)}
                    className={cellClass}
                >
                    {cell.day}
                </button>
            );
        });
    };

    return (
        <div ref={containerRef} className="relative w-full text-left">
            {/* Input field wrapper */}
            <div 
                onClick={() => setIsOpen(prev => !prev)}
                className={`w-full h-11 pl-10 pr-3 rounded-input border flex items-center justify-between bg-white text-sm cursor-pointer select-none transition-all relative ${
                    isOpen ? 'border-primary ring-2 ring-primary/20' : error ? 'border-danger-app' : 'border-border-app'
                }`}
            >
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-app/70">
                    <CalendarIcon className="h-4 w-4" />
                </div>
                
                <span className={`truncate mr-2 ${value ? 'text-fg-app font-medium' : 'text-muted-app/60 font-medium'}`}>
                    {value ? formatIndonesianDate(value) : placeholder}
                </span>

                {value && (
                    <button 
                        type="button"
                        onClick={handleClearDate}
                        className="text-[10px] font-black text-muted-app hover:text-danger-app hover:bg-red-50/55 px-2 py-0.5 rounded transition-colors uppercase tracking-wider shrink-0"
                    >
                        Hapus
                    </button>
                )}
            </div>

            {/* Dropdown Calendar Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute z-50 mt-1.5 w-[280px] bg-white border border-border-app/80 rounded-card p-4 shadow-[0_10px_30px_rgba(23,32,34,0.08)] right-0 md:left-0"
                    >
                        {/* Month/Year Switcher Header */}
                        <div className="flex items-center justify-between mb-3.5 select-none">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="h-7 w-7 rounded-lg border border-border-app flex items-center justify-center text-muted-app hover:text-fg-app hover:bg-bg-app transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-extrabold text-fg-app tracking-tight">
                                {months[currentMonth]} {currentYear}
                            </span>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="h-7 w-7 rounded-lg border border-border-app flex items-center justify-center text-muted-app hover:text-fg-app hover:bg-bg-app transition-colors cursor-pointer"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-1.5 select-none">
                            {daysOfWeek.map((day, idx) => (
                                <span 
                                    key={day} 
                                    className={`text-[9px] font-black uppercase tracking-wider ${
                                        idx === 0 ? 'text-red-500/80' : 'text-muted-app/60'
                                    }`}
                                >
                                    {day}
                                </span>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 justify-items-center">
                            {renderCalendarDays()}
                        </div>

                        {/* Footer Shortcuts */}
                        <div className="flex items-center justify-between border-t border-border-app/40 pt-3 mt-3">
                            <button
                                type="button"
                                onClick={handleSelectToday}
                                className="text-[10px] font-black text-primary hover:bg-primary-light px-2.5 py-1 rounded transition-colors uppercase tracking-widest"
                            >
                                Hari Ini
                            </button>
                            <span className="text-[9px] text-muted-app/45 font-semibold select-none">
                                AquaTrack
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
