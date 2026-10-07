import { useState, useEffect, ChangeEvent } from "react";

interface UrlInputProps {
  value: string;
  setValue: (url: string) => void;
}

const URLInput = ({ value, setValue }: UrlInputProps) => {
  const [protocol, setProtocol] = useState<"http" | "https">("https");
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  // remove all leading OR trailing slashes
  const trimSlashes = (s: string) => s.replace(/^\/+|\/+$/g, "");

  useEffect(() => {
    try {
      const url = new URL(value);
      const proto = url.protocol.slice(0, -1) as "http" | "https";
      const host = url.hostname;
      // combine hostname + pathname/search/hash, then trim
      const rest = trimSlashes(url.pathname + url.search + url.hash);
      setProtocol(proto);
      setInputValue(rest ? `${host}/${rest}` : host);
      setError("");
    } catch {
      // fallback if `value` isn’t a full URL yet
      if (value.startsWith("http://")) {
        setProtocol("http");
        setInputValue(trimSlashes(value.slice(7)));
      } else if (value.startsWith("https://")) {
        setProtocol("https");
        setInputValue(trimSlashes(value.slice(8)));
      } else {
        setInputValue(trimSlashes(value));
      }
    }
  }, [value]);

  const validateUrl = (u: string) => {
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    // raw user input
    const raw = e.target.value;
    // strip any protocol and all slashes
    const clean = trimSlashes(raw.replace(/^https?:\/\//, ""));
    setInputValue(clean);

    if (!clean) {
      setValue("");
      return;
    }
    if (/^\d+$/.test(clean)) {
      setError("Invalid URL: Cannot be just numbers");
      return;
    }

    const candidate = `${protocol}://${clean}`;
    setValue(candidate);
    if (!validateUrl(candidate)) {
      setError("Please enter a valid URL");
    }
  };

  const handleProtocolChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newProto = e.target.value as "http" | "https";
    setProtocol(newProto);
    if (!inputValue) return;

    const clean = trimSlashes(inputValue);
    const candidate = `${newProto}://${clean}`;
    setValue(candidate);
    setError(validateUrl(candidate) ? "" : "Invalid URL format");
  };

  const handleBlur = () => {
    if (!inputValue) return;
    let clean = trimSlashes(inputValue);

    // add www. if it looks like a bare hostname
    if (!clean.includes(".") && !clean.includes("://")) {
      clean = `www.${clean}`;
    }

    const candidate = `${protocol}://${clean}`;
    if (validateUrl(candidate)) {
      setInputValue(clean);
      setValue(candidate);
      setError("");
    } else {
      setError("Please enter a valid URL");
    }
  };

  return (
    <div className="w-full">
      <div
        className={`${error ? "border-red-500" : "border-gray-300"} flex items-center rounded-md border outline-none focus:border-accent_soft_black`}
      >
        <select
          value={protocol}
          onChange={handleProtocolChange}
          className="rounded-none border-0 border-r border-r-gray-300 px-4 py-2.5 text-sm text-accent_soft_black focus:outline-none"
        >
          <option value="https">https://</option>
          <option value="http">http://</option>
        </select>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="www.example.com"
          className={`h-full flex-1 bg-transparent px-4 py-2.5 focus:outline-none`}
        />
      </div>
    </div>
  );
};

export default URLInput;
