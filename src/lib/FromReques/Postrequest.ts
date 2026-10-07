import { baseURL } from "@/app/helpers/api";

export  const apiEndPoint = baseURL+ "/";
export const FromPOST = (endpoint: string, reqInit: RequestInit) => {
  return fetch(`${apiEndPoint}${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...reqInit.headers,
    },
    body: reqInit.body, // FormData is passed directly here
    ...reqInit,
  });
};