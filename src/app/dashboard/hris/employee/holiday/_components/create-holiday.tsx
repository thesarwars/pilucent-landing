'use client';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Clock,
  CalendarDays,
  Globe,
  Plus,
  Check,
  X,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import fedHolidays from '@18f/us-federal-holidays';
import { toast } from '@/lib/ToastService';
import { VioletButton } from '@/components/violet';
import { cn } from '@/lib/utils';
import {
  deleteHolidayDetail,
  fetchSingleHoliday,
  patchHoliday,
  patchHolidayDetail,
  postHoliday,
  postHolidayDetail,
} from '@/app/helpers/backend';
import moment from 'moment';
import DotSpinner from '../../employees/_components/dot-spinner';

interface Holiday {
  id: string;
  date: string;
  type: string;
  name: string;
  isEditing?: boolean;
  No?: number;
}

/* Violet field styles (UI only) */
const FIELD =
  'w-full rounded-[11px] border border-v-border bg-white px-3.5 py-2.5 text-[13px] font-medium text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const SMALL =
  'w-full rounded-[9px] border border-[#C9B6FF] bg-white px-2.5 py-1.5 text-[12px] font-medium text-v-ink900 outline-none transition-shadow focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const LABEL = 'mb-1.5 block text-[12px] font-semibold text-v-ink600';

const COLORS = [
  { name: 'Green', hex: '#1FA97A' },
  { name: 'Red', hex: '#D2483E' },
  { name: 'Violet', hex: '#7C4DFF' },
  { name: 'Amber', hex: '#F5B22E' },
  { name: 'Teal', hex: '#0E7490' },
];

const typeChip = (type?: string) => {
  const t = `${type || ''}`.toUpperCase();
  if (t === 'WEEKEND') return { bg: '#E0F2F7', fg: '#0E7490' };
  if (t === 'HOLIDAY' || t === 'PUBLIC_HOLIDAY') return { bg: '#FCE8E8', fg: '#D2483E' };
  return { bg: '#DEF5E9', fg: '#137A57' };
};

const LEDGER_GRID = '44px 130px 130px minmax(0,1fr) 72px';

const Holiday = ({
  isOpen = false,
  setIsOpen,
  refetch,
  uid,
}: {
  isOpen: boolean;
  setIsOpen: any;
  refetch?: any;
  uid?: string;
}) => {
  const [holidayName, setHolidayName] = useState<string>('');
  const [color, setColor] = useState<string>('Green');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);
  const [selectedType, setSelectedType] = useState<string>('HOLIDAY');
  const [country, setCountry] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | any>(null);
  const [holidayDescription, setHolidayDescription] = useState<string>('');
  const [holidayDate, setHolidayDate] = useState<string>('');
  const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentEditingValue, setCurrentEditingValue] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [weeklyOffs, setWeeklyOffs] = useState<string[]>(['']);
  const [weeklyPick, setWeeklyPick] = useState<string>('');
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          setIsLoading(true);
          const res = await fetchSingleHoliday(uid);
          if (res) {
            setHolidayName(res?.title);
            setColor(res?.color);
            setFromDate(res?.from_date);
            setToDate(res?.to_date);
            setCountry(res?.country == 'N/A' ? '' : res?.country);
            setDeletingId(null);
            setHolidayDescription('');
            setHolidayDate('');
            setHolidays(
              res?.details?.map((d: any) => {
                return {
                  ...d,
                  id: generateUniqueId(),
                  date: d?.date,
                  type: d?.type,
                  name: d?.description,
                  isEditing: false,
                  No: holidays.length + 1,
                };
              })
            );
            setFilteredHolidays([]);
            setSelectedType('HOLIDAY');
            setSelectedHolidays([]);
            setWeeklyOffs(JSON.parse(res?.weekend || '{}'));
          }
        } catch (error) {
          //err
        } finally {
          setIsLoading(false);
        }
      };
      fn();
    }
  }, [uid]);

  const handleReset = () => {
    setHolidayName('');
    setColor('Green');
    setFromDate('');
    setToDate('');
    setHolidays([]);
    setFilteredHolidays([]);
    setSelectedType('HOLIDAY');
    setCountry('');
    setDeletingId(null);
    setHolidayDescription('');
    setHolidayDate('');
    setSelectedHolidays([]);
    setEditingHoliday(null);
    setIsEditing(false);
    setIsLoading(false);
    setIsPending(false);
    setWeeklyOffs(['']);
    setWeeklyPick('');
  };

  useEffect(() => {
    if (!uid) {
      handleReset();
    }
  }, [uid]);

  useEffect(() => {
    if (fromDate && toDate && holidays.length > 0) {
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      toDateObj.setHours(23, 59, 59, 999);

      const filtered = holidays.filter((holiday) => {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= fromDateObj && holidayDate <= toDateObj;
      });

      setFilteredHolidays(filtered);
    } else {
      setFilteredHolidays(holidays);
    }
  }, [fromDate, toDate, holidays]);

  // Format date to DD-MM-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add a new holiday (manual)
  const handleAddHoliday = () => {
    if (!holidayDate) {
      toast.error('Please select a date');
      return;
    }
    if (!holidayDescription) {
      toast.error('Please enter a description');
      return;
    }

    if (fromDate && toDate) {
      const selectedDate = new Date(holidayDate);
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      toDateObj.setHours(23, 59, 59, 999);

      if (selectedDate < fromDateObj || selectedDate > toDateObj) {
        toast.error('Selected date must be within the From Date and To Date range');
        return;
      }
    }

    const newHoliday: Holiday = {
      id: generateUniqueId(),
      date: holidayDate,
      type: selectedType,
      name: holidayDescription,
      isEditing: false,
      No: holidays.length + 1,
    };

    setHolidays([...holidays, newHoliday]);
    setHolidayDescription('');
    setHolidayDate('');
    toast.success('Holiday added to the list');
  };

  // Handle adding weekly holidays
  const handleAddWeeklyHolidays = () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both From Date and To Date');
      return;
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      toast.error('From Date cannot be after To Date');
      return;
    }

    const dayMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const selectedDays = weeklyOffs
      .filter((day) => day)
      .map((day) => dayMap[day])
      .filter((d) => d !== undefined);

    if (selectedDays.length === 0) {
      toast.error('Please select at least one weekly off day');
      return;
    }

    const newHolidays: Holiday[] = [];
    const existingDates = new Set(holidays.map((h) => h.date + h.name));

    selectedDays.forEach((dayNumber) => {
      const currentDate = new Date(start);
      const diff = (dayNumber - currentDate.getDay() + 7) % 7;
      currentDate.setDate(currentDate.getDate() + diff);

      while (currentDate <= end) {
        const dateString = currentDate.toISOString().split('T')[0];
        const dayName = Object.keys(dayMap).find((k) => dayMap[k] === dayNumber) || '';

        if (!existingDates.has(dateString + dayName)) {
          newHolidays.push({
            id: `weekly-${dateString}-${dayNumber}`,
            date: dateString,
            type: 'WEEKEND',
            name: dayName,
            isEditing: false,
            No: holidays.length + newHolidays.length + 1,
          });
        }

        currentDate.setDate(currentDate.getDate() + 7);
      }
    });

    if (newHolidays.length === 0) {
      toast.info('No new weekly holidays to add in this date range');
      return;
    }

    setHolidays([...holidays, ...newHolidays]);
    toast.success(`Added ${newHolidays.length} weekly holidays`);
  };

  const handleEditHoliday = (holiday: Holiday, index?: number) => {
    const updatedHolidays = holidays.map((h, idx) => ({
      ...h,
      isEditing: idx === index,
    }));
    setCurrentEditingValue(holiday);
    setHolidays(updatedHolidays);
    setEditingHoliday(holiday);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    const updatedHolidays = holidays.map((h) => ({
      ...h,
      isEditing: false,
    }));
    setHolidays(updatedHolidays);
    setIsEditing(false);
    setCurrentEditingValue({});
    setEditingHoliday(null);
    toast.info('Update cancelled');
  };

  const handleSaveHolidayInTable = async (index: number, dUID?: string) => {
    const holidayToSave = currentEditingValue;
    if (!holidayToSave || !holidayToSave.date || !holidayToSave.name) {
      toast.error('Please fill all fields');
      return;
    }

    if (fromDate && toDate) {
      const selectedDate = new Date(holidayToSave.date);
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      toDateObj.setHours(23, 59, 59, 999);

      if (selectedDate < fromDateObj || selectedDate > toDateObj) {
        toast.error('Selected date must be within the From Date and To Date range');
        return;
      }
    }

    const updatedHolidays = holidays.map((holiday, idx) =>
      idx == index ? { ...holidayToSave, isEditing: false } : holiday
    );

    if (dUID) {
      let dateObj: Date;
      try {
        dateObj = new Date(holidayToSave.date);
      } catch (e) {
        console.error('Error parsing date:', holidayToSave.date);
        dateObj = new Date();
      }
      try {
        const res = await patchHolidayDetail(uid, dUID, {
          date: moment(dateObj).format('YYYY-MM-DD'),
          type: holidayToSave.type?.toUpperCase(),
          description: holidayToSave.name,
        });
        if (res?.success) {
          toast.success('Holiday updated.!');
          setHolidays(updatedHolidays);
        }
      } catch (error) {
        //err
      }
    } else {
      setHolidays(updatedHolidays);
      toast.success('Holiday updated.!');
    }
    setIsEditing(false);
    setCurrentEditingValue({});
  };

  const handleRemoveHoliday = async (index: number, dUID?: string) => {
    if (uid) {
      setDeletingId(index);
      try {
        const res = await deleteHolidayDetail(uid, dUID);
        if (res?.success) {
          toast.success('Holiday removed!');
          setDeletingId(null);
          setHolidays(holidays.filter((holiday, idx) => idx != index));
        }
      } catch (error) {
        //err
      }
    } else {
      setHolidays(holidays.filter((holiday, idx) => idx != index));
      setDeletingId(null);
    }
  };

  const clearAll = () => {
    if (!holidays.length) return;
    setHolidays([]);
    setSelectedHolidays([]);
    toast.info('Cleared all holidays');
  };

  const addWeeklyChip = () => {
    if (!weeklyPick) return;
    if (weeklyOffs.filter(Boolean).includes(weeklyPick)) {
      setWeeklyPick('');
      return;
    }
    setWeeklyOffs([...weeklyOffs.filter(Boolean), weeklyPick]);
    setWeeklyPick('');
  };
  const removeWeeklyChip = (day: string) => {
    setWeeklyOffs(weeklyOffs.filter((d) => d !== day));
  };

  const handleAddLocalHoliday = () => {
    if (!fromDate || !toDate) {
      toast.error('Please select From Date and To Date');
      return;
    }

    if (country === 'USA') {
      try {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        const options = {
          shiftSaturdayHolidays: true,
          shiftSundayHolidays: true,
        };
        const usHolidays = fedHolidays.inRange(startDate, endDate, options);

        const filtered = usHolidays.filter((h) => {
          if (h.name.includes('Juneteenth')) {
            return h.date.getFullYear() >= 2021;
          }
          return true;
        });

        const newHolidays = filtered.map((h, index) => ({
          id: generateUniqueId(),
          date: h.date.toISOString().split('T')[0],
          type: 'HOLIDAY',
          name: h.name,
          isEditing: false,
          No: holidays.length + index + 1,
        }));

        const existingDates = new Set(holidays.map((h) => h.date + h.name));
        const uniqueHolidays = newHolidays.filter((h) => !existingDates.has(h.date + h.name));

        setHolidays([...holidays, ...uniqueHolidays]);
        toast.success(`Added ${uniqueHolidays.length} US holidays`);
      } catch (error) {
        toast.error('Failed to fetch US holidays');
        console.error(error);
      }
    } else {
      if (!holidayName || !fromDate || !toDate || !color || !country) {
        toast.error('Please fill all required fields');
        return;
      }

      const newHoliday: Holiday = {
        id: generateUniqueId(),
        date: fromDate,
        type: 'PUBLIC_HOLIDAY',
        name: holidayName,
        isEditing: false,
        No: holidays.length + 1,
      };

      setHolidays([...holidays, newHoliday]);
      toast.success('Holiday added to table!');
    }
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
  };
  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value);
  };

  const handleSaveHolidayList = async () => {
    if (!holidayName) {
      toast.error('Please enter a holiday list name');
      return;
    }
    if (!fromDate || !toDate) {
      toast.error('Please select both From Date and To Date');
      return;
    }
    if (holidays.length === 0) {
      toast.error('Please add at least one holiday to the list');
      return;
    }

    try {
      setIsPending(true);
      const details = holidays.map((holiday, index) => {
        let dateObj: Date;
        try {
          dateObj = new Date(holiday.date);
        } catch (e) {
          console.error('Error parsing date:', holiday.date);
          dateObj = new Date();
        }

        return {
          date: moment(dateObj).format('YYYY-MM-DD'),
          type: holiday.type?.toUpperCase(),
          description: holiday.name,
        };
      });

      if (uid) {
        const payloadData = {
          title: holidayName,
          from_date: moment(fromDate).format('YYYY-MM-DD'),
          to_date: moment(toDate).format('YYYY-MM-DD'),
          country: country || 'N/A',
          weekend: JSON.stringify(weeklyOffs),
          total_holidays: holidays.length.toString(),
          color: color,
          status: 'ACTIVE',
        };

        const res = await patchHoliday(uid, payloadData);
        if (res?.success) {
          const array = holidays?.filter((holiday: any) => {
            if (!holiday?.uid) {
              return holiday;
            }
          });
          const details = array.map((holiday, index) => {
            let dateObj: Date;
            try {
              dateObj = new Date(holiday.date);
            } catch (e) {
              console.error('Error parsing date:', holiday.date);
              dateObj = new Date();
            }

            return {
              date: moment(dateObj).format('YYYY-MM-DD'),
              type: holiday.type?.toUpperCase(),
              description: holiday.name,
            };
          });
          const createPromises = details?.map((payload) => postHolidayDetail(uid, payload));
          const results = await Promise.allSettled([...createPromises]);
          const allSuccess = results.every(
            (res) => res.status === 'fulfilled' && Boolean(res.value)
          );

          if (allSuccess) {
            toast.success('Holiday updated.');
            refetch && refetch();
            setIsOpen(false);
          } else {
            toast.warning('Some items failed to update. Please check.');
          }
        }
      } else {
        const payloadData = {
          title: holidayName,
          from_date: moment(fromDate).format('YYYY-MM-DD'),
          to_date: moment(toDate).format('YYYY-MM-DD'),
          country: country || 'N/A',
          weekend: JSON.stringify(weeklyOffs),
          total_holidays: holidays.length.toString(),
          color: color,
          status: 'ACTIVE',
          details: details,
        };

        const res = await postHoliday(payloadData);
        if (res?.success) {
          handleReset();
          toast.success('Holiday created.');
          refetch && refetch();
          setIsOpen(false);
        }
      }
    } catch (error: any) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  if (!isOpen) return null;

  const sortedHolidays = [...filteredHolidays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const weekendLabel = weeklyOffs.filter(Boolean).join(', ') || '—';

  /* ── small atoms ─────────────────────────────────────────────────────── */
  const PanelCard = ({
    tint,
    chipBg,
    chipFg,
    icon,
    title,
    note,
    children,
  }: {
    tint: string;
    chipBg: string;
    chipFg: string;
    icon: React.ReactNode;
    title: string;
    note?: string;
    children: React.ReactNode;
  }) => (
    <div className="mt-3.5 rounded-[14px] p-3.5" style={{ backgroundColor: tint }}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-[9px]" style={{ backgroundColor: chipBg, color: chipFg }}>
          {icon}
        </span>
        <span className="text-[12.5px] font-bold text-v-ink900">{title}</span>
        {note && <span className="ml-auto text-[11px] text-v-ink400">{note}</span>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="font-jakarta text-v-ink900">
      <div className="mx-auto pb-6">
        {/* header */}
        <div className="flex animate-v-rise items-center gap-3">
          <button
            type="button"
            aria-label="Back to holidays"
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-v-border bg-white/70 text-v-ink500 backdrop-blur transition-colors hover:border-v-primary hover:text-v-primary"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-white"
            style={{ backgroundImage: 'linear-gradient(140deg,#7C4DFF,#A78BFF)' }}
          >
            <Clock className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h1 className="m-0 text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
              {uid ? 'Edit holiday list' : 'Create holiday list'}
            </h1>
            <p className="text-[12px] text-v-ink400">Define weekly offs & public holidays for the year</p>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 flex h-[60vh] items-center justify-center rounded-[22px] bg-white shadow-v-card">
            <DotSpinner />
          </div>
        ) : (
          <div className="mt-4 grid animate-v-rise items-start gap-0 overflow-hidden rounded-[22px] bg-white shadow-v-card lg:grid-cols-[388px_minmax(0,1fr)]">
            {/* ── LEFT config panel (sticky) ─────────────────────────────── */}
            <div className="self-start border-b border-v-border p-[22px] lg:sticky lg:top-[14px] lg:border-b-0 lg:border-r">
              <div className="grid grid-cols-2 gap-[13px]">
                <div className="col-span-2">
                  <label className={LABEL}>
                    Holiday list name <span className="text-v-primary">*</span>
                  </label>
                  <input
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                    className={FIELD}
                    placeholder="e.g. 2026 Public Holidays"
                  />
                </div>
                <div className="col-span-2">
                  <label className={LABEL}>Color</label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {COLORS.map((c) => {
                      const active = color === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          aria-label={c.name}
                          onClick={() => setColor(c.name)}
                          className="h-[26px] w-[26px] rounded-[8px] transition-shadow"
                          style={{ backgroundColor: c.hex, boxShadow: active ? `0 0 0 2px #FFFFFF, 0 0 0 4px ${c.hex}` : 'none' }}
                        />
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className={LABEL}>From date</label>
                  <input type="date" value={fromDate} onChange={handleFromDateChange} className={cn(FIELD, 'tabular-nums')} />
                </div>
                <div>
                  <label className={LABEL}>To date</label>
                  <input type="date" value={toDate} onChange={handleToDateChange} className={cn(FIELD, 'tabular-nums')} />
                </div>
              </div>

              {/* Weekly card */}
              <PanelCard tint="#F7F5FC" chipBg="#FDF2DE" chipFg="#B97608" icon={<CalendarDays className="h-4 w-4" />} title="Add weekly holidays" note="Multiple allowed">
                <div className="flex items-center gap-2">
                  <select value={weeklyPick} onChange={(e) => setWeeklyPick(e.target.value)} className={cn(FIELD, 'cursor-pointer')}>
                    <option value="">Select weekly off</option>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addWeeklyChip}
                    aria-label="Add weekly off"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-v-primary text-white transition-colors hover:bg-v-primary-hover"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {weeklyOffs.filter(Boolean).length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {weeklyOffs.filter(Boolean).map((d) => (
                      <span key={d} className="inline-flex animate-v-pop items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={{ backgroundColor: '#FDF2DE', color: '#B97608' }}>
                        {d}
                        <button type="button" onClick={() => removeWeeklyChip(d)} aria-label={`Remove ${d}`} className="hover:opacity-70">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAddWeeklyHolidays}
                  className="mt-3 w-full rounded-[10px] border-[1.5px] border-[#EBCB8F] bg-white py-2 text-[12.5px] font-bold text-[#B97608] transition-colors hover:bg-[#FDF2DE]"
                >
                  Add to holiday list
                </button>
              </PanelCard>

              {/* Local card */}
              <PanelCard tint="#F7F5FC" chipBg="#EEE9FF" chipFg="#7C4DFF" icon={<Globe className="h-4 w-4" />} title="Add local holidays">
                <select value={country} onChange={(e) => setCountry(e.target.value)} className={cn(FIELD, 'cursor-pointer')}>
                  <option value="">Select country</option>
                  <option value="USA">United States</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddLocalHoliday}
                  className="mt-3 w-full rounded-[10px] border-[1.5px] border-[#DECFFF] bg-white py-2 text-[12.5px] font-bold text-v-primary transition-colors hover:bg-[#EEE9FF]"
                >
                  Add {country || 'local'} holidays to list
                </button>
              </PanelCard>

              {/* Manual card */}
              <PanelCard tint="#F7F5FC" chipBg="#DEF5E9" chipFg="#137A57" icon={<Plus className="h-4 w-4" />} title="Add holiday manually">
                <div className="grid grid-cols-2 gap-2.5">
                  <input type="date" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} className={cn(FIELD, 'tabular-nums')} />
                  <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className={cn(FIELD, 'cursor-pointer')}>
                    <option value="HOLIDAY">Holiday</option>
                    <option value="WEEKEND">Weekend</option>
                    <option value="SPECIAL">Special</option>
                  </select>
                  <input
                    type="text"
                    value={holidayDescription}
                    onChange={(e) => setHolidayDescription(e.target.value)}
                    className={cn(FIELD, 'col-span-2')}
                    placeholder="Holiday name"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddHoliday}
                  disabled={!holidayDate || !holidayDescription}
                  className="mt-3 w-full rounded-[10px] py-2 text-[12.5px] font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: '#1FA97A' }}
                >
                  Add to holiday list
                </button>
              </PanelCard>
            </div>

            {/* ── RIGHT ledger ───────────────────────────────────────────── */}
            <div className="flex max-h-[700px] min-h-[560px] flex-col">
              {/* header */}
              <div className="flex items-center gap-2.5 border-b border-v-border px-5 py-3.5">
                <span className="text-[14px] font-extrabold text-v-ink900">Holidays</span>
                <span className="rounded-full bg-v-success-bg px-2.5 py-0.5 text-[11px] font-bold text-v-success-fg">
                  {filteredHolidays.length} {filteredHolidays.length === 1 ? 'holiday' : 'holidays'}
                </span>
                <span className="flex-1" />
                <button type="button" onClick={clearAll} className="text-[12px] font-semibold text-v-ink400 transition-colors hover:text-v-danger-fg">
                  Clear all
                </button>
              </div>

              {/* column strip */}
              <div
                className="grid items-center gap-2.5 border-b border-v-border bg-[#FBFAFE] px-5 py-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.07em] text-v-ink400"
                style={{ gridTemplateColumns: LEDGER_GRID }}
              >
                <span>No</span>
                <span>Date</span>
                <span>Type</span>
                <span>Description</span>
                <span className="text-right">Action</span>
              </div>

              {/* scroll body */}
              <div className="min-h-0 flex-1 overflow-y-auto" ref={tableContainerRef}>
                {sortedHolidays.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
                      <CalendarDays className="h-[19px] w-[19px]" />
                    </span>
                    <div className="text-[13.5px] font-bold text-v-ink900">No holidays added</div>
                    <div className="text-[12.5px] text-v-ink400">
                      {fromDate && toDate
                        ? 'Use the panel to generate weekly, local or manual holidays.'
                        : 'Set a date range, then add holidays from the panel.'}
                    </div>
                  </div>
                ) : (
                  sortedHolidays.map((holiday: any, index) => {
                    const chip = typeChip(holiday.type);
                    return (
                      <div
                        key={holiday.id}
                        className={cn(
                          'grid animate-v-pop items-center gap-2.5 border-b border-[rgba(22,23,42,0.06)] px-5 py-2.5',
                          holiday.isEditing ? 'bg-[#FBFAFF]' : 'transition-colors hover:bg-[#F7F5FC]'
                        )}
                        style={{ gridTemplateColumns: LEDGER_GRID, animationDelay: `${Math.min(index, 12) * 0.02}s` }}
                      >
                        <span className="text-[12px] tabular-nums text-v-ink400">{index + 1}</span>

                        {/* date */}
                        {holiday.isEditing ? (
                          <input
                            type="date"
                            value={currentEditingValue?.date}
                            onChange={(e) => setCurrentEditingValue({ ...currentEditingValue, date: e.target.value })}
                            className={cn(SMALL, 'tabular-nums')}
                          />
                        ) : (
                          <span className="text-[12.5px] tabular-nums text-v-ink700">{formatDate(holiday.date)}</span>
                        )}

                        {/* type */}
                        {holiday.isEditing ? (
                          <select
                            value={currentEditingValue?.type}
                            onChange={(e) => setCurrentEditingValue({ ...currentEditingValue, type: e.target.value })}
                            className={cn(SMALL, 'cursor-pointer')}
                          >
                            <option value="HOLIDAY">Holiday</option>
                            <option value="WEEKEND">Weekend</option>
                            <option value="SPECIAL">Special</option>
                          </select>
                        ) : (
                          <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase" style={{ backgroundColor: chip.bg, color: chip.fg }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: chip.fg }} />
                            {holiday.type}
                          </span>
                        )}

                        {/* description */}
                        {holiday.isEditing ? (
                          <input
                            type="text"
                            value={currentEditingValue?.name}
                            onChange={(e) => setCurrentEditingValue({ ...currentEditingValue, name: e.target.value })}
                            className={SMALL}
                          />
                        ) : (
                          <span className="truncate text-[12.5px] text-v-ink700">{holiday.name}</span>
                        )}

                        {/* action */}
                        <div className="flex items-center justify-end gap-1.5">
                          {holiday.isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveHolidayInTable(index, holiday?.uid)}
                                aria-label="Update holiday"
                                className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-v-success-bg text-v-success-fg transition-colors hover:brightness-95"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                aria-label="Cancel edit"
                                className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] text-v-ink400 transition-colors hover:bg-v-wash2 hover:text-v-ink900"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleEditHoliday(holiday, index)}
                                aria-label="Edit holiday"
                                className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] text-v-primary transition-colors hover:bg-[#F5F1FF]"
                              >
                                <Pencil className="h-[15px] w-[15px]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveHoliday(index, holiday?.uid)}
                                disabled={deletingId == index}
                                aria-label="Remove holiday"
                                className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] text-v-danger-fg transition-colors hover:bg-v-danger-bg disabled:opacity-50"
                              >
                                {deletingId == index ? <Loader2 className="h-[15px] w-[15px] animate-spin" /> : <Trash2 className="h-[15px] w-[15px]" />}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* footer */}
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[18px] bg-white px-5 py-3.5 shadow-v-card">
          <span className="text-[12.5px] tabular-nums text-v-ink500">
            {holidays.length} total · weekend: {weekendLabel}
          </span>
          <span className="flex-1" />
          <VioletButton type="button" variant="outline" className="min-w-[110px]" onClick={() => setIsOpen(false)}>
            Cancel
          </VioletButton>
          <VioletButton
            type="button"
            variant="primary"
            className="min-w-[170px]"
            onClick={handleSaveHolidayList}
            disabled={isPending || !holidayName.trim()}
            leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          >
            {isPending ? 'Saving…' : uid ? 'Save changes' : 'Save holiday list'}
          </VioletButton>
        </div>
      </div>
    </div>
  );
};

export default Holiday;
