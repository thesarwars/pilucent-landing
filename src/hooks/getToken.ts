import { GetCookies } from "@/lib/cookies/Cookies";
import { useEffect, useState } from "react";

const GetToken = () => {
  const [token, setToken] = useState("");
  useEffect(() => {
    GetToken();
  }, [token]);

  const GetToken = async (): Promise<void> => {
    const id = await GetCookies();
    if (id) {
      setToken(id);
    }
  };
  return token;
};

export default GetToken;