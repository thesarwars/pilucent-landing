import { toast } from '@/lib/ToastService';
import { cn } from '@/lib/utils';
import moment from 'moment';
import React, { useState, useEffect, useRef } from 'react';
import { MdOutlineCalendarToday } from 'react-icons/md';

interface DatePickerProps {
  view?: boolean;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  ClassName?: string;
  calenderClassName?: string;
  isPrevious?: boolean;
  required?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'DD/MM/YY',
  ClassName,
  view = false,
  calenderClassName = 'left-[-40px]',
  isPrevious = false,
  required = false,
}) => {
  const dateRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value).getMonth() : today.getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    value ? new Date(value).getFullYear() : today.getFullYear()
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fn = async () => {
      if (value) {
        const date = new Date(value);
        setSelectedDate(date);
        setCurrentMonth(date.getMonth());
        setCurrentYear(date.getFullYear());
      }
    };
    fn();
  }, [value]);

  const generateDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day, 12); // Set time to noon
    if (!isPrevious && new Date(newDate).getDate() < new Date().getDate()) {
      toast.error("Can't select previous date!");
      return;
    }
    setSelectedDate(newDate);
    onChange(moment(newDate).format('YYYY-MM-DD'));
    setShowCalendar(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <div className="relative w-full flex-1" ref={dateRef}>
      <input
        onClick={() => !view && setShowCalendar(!showCalendar)}
        type="text"
        className={cn(
          `h-12 w-full rounded-lg px-6 py-2 outline-none placeholder:text-accent_granite`,
          ClassName
        )}
        placeholder={placeholder}
        // readOnly
        required={required}
        value={value ? moment(value).format('DD/MM/YYYY') : ''}
      />

      <MdOutlineCalendarToday
        //  style={{
        //   position: 'absolute',
        //   top: '55%',
        //   right: '10px',
        //   transform: 'translateY(-50%)',
        //   pointerEvents: 'none',
        // }}
        onClick={() => !view && setShowCalendar(!showCalendar)}
        className="absolute right-8 top-[50%] -translate-y-1/2 text-xl text-accent_granite"
      />

      {showCalendar && (
        <div
          className={`w-73 absolute top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white p-4 shadow-lg ${calenderClassName}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              type="button" // Prevent form submission
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-sm font-semibold">
              {months[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              type="button" // Prevent form submission
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateDays().map((day: any, index) => (
              <button
                type="button"
                key={index}
                // disabled={day === null}
                onClick={() => {
                  day !== null && handleDateClick(day);
                }}
                className={`h-8 w-8 text-sm ${day ? 'hover:bg-blue-50 hover:text-blue-600' : ''} ${
                  selectedDate &&
                  day === selectedDate.getDate() &&
                  currentMonth === selectedDate.getMonth() &&
                  currentYear === selectedDate.getFullYear()
                    ? 'rounded-full bg-blue-600 text-white'
                    : ''
                } `}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
