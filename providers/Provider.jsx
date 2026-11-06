// components/Provider.tsx
"use client";
import { useEffect, useState } from "react";
import { ProviderContext } from "../context/ProviderContext";
import { fetchCompany, fetchUser } from "../app/helpers/backend";

const Provider = ({ children }) => {
  const [user, setUser] = useState({});
  const [company, setCompany] = useState({});
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Cross-domain hand-off from the Pilucent app: if it forwarded the
    // session in the URL (?tkn=&rt=), persist it BEFORE we resolve the user so an
    // already-authenticated visitor isn't bounced back to sign-in. company_uid is
    // left in the URL for the pricing components to pick up.
    try {
      const params = new URLSearchParams(window.location.search);
      const tkn = params.get("tkn");
      const rt = params.get("rt");
      if (tkn) {
        localStorage.setItem("access_token", tkn);
        if (rt) localStorage.setItem("refresh_token", rt);
        // strip the tokens from the URL (keep everything else, e.g. company_uid)
        params.delete("tkn");
        params.delete("rt");
        const qs = params.toString();
        window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
      }
    } catch {
      /* ignore — fall back to whatever is already in localStorage */
    }

    const token = localStorage.getItem("access_token");
    if (token) {
      const fn = async () => {
        try {
          setIsLoading(true)
          const Company = await fetchCompany();
          const userInfo = await fetchUser();
          setCompany(Company);
          setUser(userInfo);
        } catch (error) {
          //call the logout
          localStorage.removeItem('access_token')
          setUser({})
          setCompany({})
        }finally{
          setIsLoading(false)
        }
      };
      fn();
    }
  }, []);

  return (
    <ProviderContext.Provider value={{ user, setUser, company, setCompany, isLoading, setIsLoading }}>
      {children}
    </ProviderContext.Provider>
  );
};

export default Provider;
