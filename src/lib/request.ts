import { baseURL } from '@/app/helpers/api';

const apiEndPoint = baseURL + '/';
export const fetchPOST = (endpoint: string, reqInit: RequestInit) => {
  return fetch(`${apiEndPoint}${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json', // Set the Content-Type header
      ...reqInit.headers,
    },
    body: reqInit.body ? JSON.stringify(reqInit.body) : undefined, // Serialize the body
    ...reqInit,
  });
};
export const fetchPatch = (endpoint: string, reqInit: RequestInit) => {
  return fetch(`${apiEndPoint}${endpoint}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json', // Set the Content-Type header
      ...reqInit.headers,
    },
    body: reqInit.body ? JSON.stringify(reqInit.body) : undefined, // Serialize the body
    ...reqInit,
  });
};

export const fetchGET = (endpoint: string, reqInit: RequestInit = {}) => {
  return fetch(`${apiEndPoint}${endpoint}`, {
    ...reqInit,
    method: 'GET', // Ensure method is GET
    headers: {
      Accept: 'application/json',
      ...(reqInit.headers || {}),
    },
  });
};

type ApiRequest = RequestInit & {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
};

export const api = ({
  endpoint,
  method,
  cache,
  next,
  headers: reqHeaders,
  ...reqInit
}: ApiRequest) => {
  return fetch(`${apiEndPoint}${endpoint}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...reqHeaders,
    },
    cache,
    next,
    ...reqInit,
  });
};
