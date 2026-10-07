// store.ts
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import EditEmployeeReducer from './Employee/EmployeeSlice';
import UserDataSlice from "./UserData/UserData"
import PermissionsDataSlice from "./UserPermissionData/PermissionData"
import CompanyDataSlice from "./CompanyData/CompanyData"
import SalesDataSlice from "./SalesData/SalesData"
import loadingReducer from "./DataState/LoadingState"; 

export const store = configureStore({
  reducer: {
    employee:EditEmployeeReducer,  
    Permissions: PermissionsDataSlice,
    userData: UserDataSlice,
    CompanyData: CompanyDataSlice,
    SalesSettingsData: SalesDataSlice,
    loading: loadingReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for using throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
