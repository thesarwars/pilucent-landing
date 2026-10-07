import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SalesDataState {
    SalesSettingsData: any;
}

const initialState: SalesDataState = {
    SalesSettingsData: null,
};

const SalesDataSlice = createSlice({
  name: "CompanyData",
  initialState,
  reducers: {
    setSalesSettingsData: (state, action: PayloadAction) => {
      state.SalesSettingsData = action.payload;
    },
  },
});

export const { setSalesSettingsData } = SalesDataSlice.actions;
export default SalesDataSlice.reducer;
