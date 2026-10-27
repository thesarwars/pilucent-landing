import { useState, useEffect } from "react";


const parseValue = (value) => {
  const [h24, minute] = value.split(':');
  let hour24 = parseInt(h24 || '0', 10);
  hour24 = isNaN(hour24) ? 0 : Math.max(0, Math.min(23, hour24));
  
  const minuteNumber = parseInt(minute || '0', 10);
  const adjustedMinute = isNaN(minuteNumber) ? 0 : Math.max(0, Math.min(59, minuteNumber));
  const minutePart = adjustedMinute.toString().padStart(2, '0');

  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  
  return {
    hour: hour12.toString().padStart(2, '0'),
    minute: minutePart,
    ampm,
  };
};

const TimePicker= ({ value, onChange, required = false, className = "" }) => {
  const [showPicker, setShowPicker] = useState(false);
  const parsedInitial = parseValue(value);
  const [hour, setHour] = useState(parsedInitial.hour);
  const [minute, setMinute] = useState(parsedInitial.minute);
  const [ampm, setAmPm] = useState(parsedInitial.ampm);

  useEffect(() => {
    const parsed = parseValue(value);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setAmPm(parsed.ampm);
  }, [value]);

  useEffect(() => {
    if (showPicker) {
      const handleClickOutside = (e) => {
        const target = e.target;
        if (!target.closest(".relative.inline-block")) {
          setShowPicker(false);
        }
      };
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showPicker]);

  const handleSelectTime = (newHour, newMinute, newAmPm) => {
    let hour24 = parseInt(newHour, 10);
    if (newAmPm === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (newAmPm === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    const hour24Str = hour24.toString().padStart(2, '0');
    onChange(`${hour24Str}:${newMinute}`);
    setHour(newHour);
    setMinute(newMinute);
    setAmPm(newAmPm);
  };

  const setCurrentTime = () => {
    const now = new Date();
    const hours24 = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hour12 = ((hours24 % 12) || 12).toString().padStart(2, '0');
    
    setHour(hour12);
    setMinute(minutes);
    setAmPm(ampm);
    onChange(`${hours24.toString().padStart(2, '0')}:${minutes}`);
  };

  return (
    <div className="relative inline-block w-full">
      <input
        type="text"
        readOnly
        required={required}
        value={`${hour}:${minute} ${ampm}`}
        onClick={() => setShowPicker(!showPicker)}
        className={className || "h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"}
      />
      {showPicker && (
        <div className="absolute z-20 bg-[#1a1330] border border-white/10 rounded-xl p-2 w-[200px] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] top-[4.5rem] text-white">
          <div className="h-40 flex">
            <div className="w-1/3 overflow-y-auto">
              {Array.from({ length: 12 }, (_, n) => {
                const h = String(n + 1).padStart(2, '0');
                return (
                  <div
                    key={h}
                    className={`p-2 text-center text-sm cursor-pointer rounded-md ${h === hour ? "bg-[#7C5BFF] text-white" : "hover:bg-white/10"}`}
                    onClick={() => handleSelectTime(h, minute, ampm)}
                  >
                    {h}
                  </div>
                );
              })}
            </div>
            <div className="w-1/3 h-40 text-sm overflow-y-auto border-l border-r border-white/10">
              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                <div
                  key={m}
                  className={`p-2 text-center cursor-pointer rounded-md ${minute === m ? "bg-[#7C5BFF] text-white" : "hover:bg-white/10"}`}
                  onClick={() => handleSelectTime(hour, m, ampm)}
                >
                  {m}
                </div>
              ))}
            </div>
            <div className="w-1/3 flex text-sm flex-col items-center">
              {["AM", "PM"].map((period) => (
                <div
                  key={period}
                  className={`p-2 w-full text-center cursor-pointer rounded-md ${ampm === period ? "bg-[#7C5BFF] text-white" : "hover:bg-white/10"}`}
                  onClick={() => handleSelectTime(hour, minute, period)}
                >
                  {period}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between p-2 border-t border-white/10 mt-2">
            <button type="button" onClick={setCurrentTime} className="text-[#A78BFA] hover:text-white transition-colors">Now</button>
            <button type="button" className="ml-auto text-[#A78BFA] hover:text-white transition-colors" onClick={() => setShowPicker(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;