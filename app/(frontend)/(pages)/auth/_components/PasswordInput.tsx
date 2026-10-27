import { useState, useMemo, useEffect } from "react";

interface ValidationRule {
  isValid: boolean;
  text: string;
}

const PasswordInput = ({
  password,
  setPassword,
  setIsValid,
}: {
  password: any;
  setPassword: any;
  setIsValid?: any;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const validationRules: ValidationRule[] = useMemo(
    () => [
      {
        isValid: password.length >= 8,
        text: "Use 8 or more characters",
      },
      {
        isValid: /[A-Z]/.test(password) && /[a-z]/.test(password),
        text: "Use upper and lower case letters",
      },
      {
        isValid: /\d/.test(password),
        text: "Use a number",
      },
      {
        isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        text: "Use a symbol",
      },
    ],
    [password]
  );

  const isValid = useMemo(
    () => validationRules.every((rule) => rule.isValid),
    [validationRules]
  );

  useEffect(() => {
    setIsValid(isValid);
  }, [isValid]);

  return (
    <div className="relative mt-2">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`block w-full px-4 py-3 pr-16 bg-white/[0.04] border rounded-xl text-white placeholder-white/40 text-sm shadow-inner focus:outline-none focus:ring-2 transition-all ${
            isValid && password.length > 0
              ? "border-emerald-400/60 focus:ring-emerald-400/20"
              : "border-white/10 focus:border-[#7C5BFF] focus:ring-[#7C5BFF]/30"
          }`}
          placeholder="Password"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-white/60 hover:text-white transition-colors"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {(isFocused || password.length > 0) && (
        <div className="mt-3 p-4 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-xl shadow-lg animate-fade-in-up">
          <p className="text-xs font-medium text-white/80 uppercase tracking-wider mb-3">
            Password must contain:
          </p>
          <ul className="space-y-2">
            {validationRules.map((rule, index) => (
              <li key={index} className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${
                    rule.isValid ? "text-emerald-400" : "text-white/40"
                  }`}
                >
                  {rule.isValid ? "✓" : "✕"}
                </span>
                <span
                  className={`text-xs sm:text-sm ${
                    rule.isValid ? "text-emerald-300" : "text-white/60"
                  }`}
                >
                  {rule.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
