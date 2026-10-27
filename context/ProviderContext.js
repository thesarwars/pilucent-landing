// context/ProviderContext.tsx or ProviderContext.js
"use client";
import { createContext, useContext } from "react";

export const ProviderContext = createContext({
  user: {},
  setUser: (e) => {},
  company: {},
  setCompany: (e) => {},
  isLoading: Boolean,
  setIsLoading: (e)=>{}
});

export const useProvider = () => useContext(ProviderContext);
