import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CompanyDataState {
  CompanySettingsData: any;
  Company: any;
}

const initialState: CompanyDataState = {
  CompanySettingsData: null,
  Company: null,
};

const CompanyDataSlice = createSlice({
  name: "CompanyData",
  initialState,
  reducers: {
    setCompanySettingsData: (state, action: PayloadAction) => {
      state.CompanySettingsData = action.payload;
    },
    setCompanyData: (state, action: PayloadAction) => {
      state.Company = action.payload;
    },
  },
});

export const { setCompanySettingsData, setCompanyData } =
  CompanyDataSlice.actions;
export default CompanyDataSlice.reducer;
