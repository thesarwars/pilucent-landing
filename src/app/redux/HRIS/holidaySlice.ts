import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Holiday {
  id: string;
  name: string;
  fromDate: string;
  toDate: string;
  country: string;
  status: string;
}

interface HolidayState {
  holidays: Holiday[];
}

const initialState: HolidayState = {
  holidays: [],
};

const holidaySlice = createSlice({
  name: "holidays",
  initialState,
  reducers: {
    setHolidays: (state, action: PayloadAction<Holiday[]>) => {
      state.holidays = action.payload;
    },
    addHoliday: (state, action: PayloadAction<Holiday>) => {
      state.holidays.push(action.payload);
    },
    updateHoliday: (state, action: PayloadAction<Holiday>) => {
      const index = state.holidays.findIndex((h) => h.id === action.payload.id);
      if (index >= 0) {
        state.holidays[index] = action.payload;
      }
    },
  },
});

export const { setHolidays, addHoliday, updateHoliday } = holidaySlice.actions;
export default holidaySlice.reducer;
