"use client";
import { Provider, useDispatch } from "react-redux";
import { ReactNode, useEffect, useState } from "react";
import { store } from "./store";
import GetToken from "@/hooks/getToken";
import { GetData } from "@/services/FetchMethods";
import { setUser } from "@/app/redux/UserData/UserData";
import {
  setCompanyData,
  setCompanySettingsData,
} from "./CompanyData/CompanyData";
import { setSalesSettingsData } from "./SalesData/SalesData";
import { useRouter } from "next/navigation";
import { getCompany, getUser } from "../helpers/backend";
import { setLoading } from "./DataState/LoadingState";

interface ReduxProviderProps {
  children: ReactNode;
}
const ReduxProvider = ({ children }: ReduxProviderProps) => {
  const router = useRouter();
  const [token, setToken] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) setToken(token);
  }, []);

  useEffect(() => {
    const loadPersistedData = async () => {
      if (token) {
        try {
          const companyData = await GetData("we/settings", token);
          store.dispatch(setCompanySettingsData(companyData));
          const salesSettingsData = await GetData("we/sales/settings", token);
          store.dispatch(setSalesSettingsData(salesSettingsData));
          const company = await getCompany();
          store.dispatch(setCompanyData(company));
        } catch (e) {
          // logOut();
        } finally {
          store.dispatch(setLoading(false));
        }
      }
    };

    loadPersistedData();
    window.addEventListener("load", loadPersistedData);
    return () => window.removeEventListener("load", loadPersistedData);
  }, [token]);

  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
