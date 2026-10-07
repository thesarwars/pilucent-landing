export const onboardingTextInputClassName =
  "h-14 w-full rounded-lg border border-white bg-[#F9F9F970] px-4 text-gray-900 outline-none placeholder:text-[#525151] focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white/70";

/**
 * Native `<select>` aligned like text inputs: strip OS chrome, match height, center text + chevron.
 * (Plain `h-14` + inherited `text-sm` leaves label stuck to the top in most browsers.)
 */
export const onboardingNativeSelectClassName =
  "h-14 w-full cursor-pointer appearance-none [-webkit-appearance:none] rounded-lg border border-white bg-[#F9F9F970] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat px-4 py-0 pr-10 text-sm leading-[3.5rem] text-gray-900 outline-none [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%2302143A%22%20d%3D%22M12%2015.4L6%209h12z%22/%3E%3C/svg%3E')] focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white/70";

export const onboardingSelectInputClassName = onboardingNativeSelectClassName;

/** Select “placeholder” (first empty option) — use when value is empty */
export const onboardingSelectEmptyTextClass = "text-[#525151]";
