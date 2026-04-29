// src/components/dashboard/CalendarCard.jsx

import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CalendarCard = ({ selectedDate, setSelectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-full text-[var(--color-text-default)] hover:bg-[var(--color-bg-interactive-subtle)] transition-colors">
        <ChevronLeft size={20} />
      </motion.button>
      <h2 className="text-lg font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)]">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-full text-[var(--color-text-default)] hover:bg-[var(--color-bg-interactive-subtle)] transition-colors">
        <ChevronRight size={20} />
      </motion.button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday start

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-xs font-semibold text-center text-[var(--color-text-muted)] uppercase">
          {format(addDays(weekStart, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayClone = day;
        const isCurrentMonth = day.getMonth() === monthStart.getMonth();
        const isSelectedDate = format(day, 'yyyy-MM-dd') === selectedDate;
        const isCurrentDay = isToday(day);
        
        let cellClasses = 'relative text-sm h-9 w-9 flex items-center justify-center rounded-full transition-all duration-200';

        if (isCurrentMonth) {
            cellClasses += isSelectedDate 
                ? ' bg-[var(--color-primary)] text-[var(--color-text-on-primary)] font-bold shadow-lg' 
                : ' text-[var(--color-text-strong)] hover:bg-[var(--color-primary-bg-subtle)] cursor-pointer';
        } else {
            cellClasses += ' text-[var(--color-text-subtle)] cursor-not-allowed';
        }

        days.push(
          <div
            key={day.toString()}
            onClick={() => isCurrentMonth && setSelectedDate(format(dayClone, 'yyyy-MM-dd'))}
            className={cellClasses}
          >
            {isCurrentDay && !isSelectedDate && (
                <span className="absolute w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full -bottom-1"></span>
            )}
            {format(day, 'd')}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7 place-items-center" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-[var(--color-bg-surface)] rounded-2xl shadow-xl border-2 border-[var(--color-border-default)] p-6 font-[var(--font-secondary)]"
    >
      <h3 className="text-lg font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-3">Select Date</h3>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </motion.div>
  );
};

export default CalendarCard;