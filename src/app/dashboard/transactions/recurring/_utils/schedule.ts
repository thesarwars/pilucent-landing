import moment from 'moment';

/**
 * Range rules the backend enforces on every recurring template, regardless of
 * txn_type (BILL / EXPENSE / CHEQUE / ESTIMATE / REFUND_RECEIPT).
 *
 * Mirrored here so the user is told before the save instead of after the 400.
 * Messages match the API's wording so the toast reads the same either way.
 *
 * day_of_month and weekday are <select>-bound on every screen, so they can't go
 * out of range from the UI — the backend keeps those guards for API clients.
 */
export const scheduleError = ({
  type,
  every,
  endKind,
  endAfter,
  startDate,
  endDate,
}: {
  type: string;
  every: any;
  endKind: string;
  endAfter: any;
  startDate: any;
  endDate: any;
}): string | null => {
  if (type === 'UNSCHEDULED') return null;

  /* a typed 0 is coerced to 1 on the wire and a typed -3 reaches it untouched —
     both are worth stopping here rather than saving something else silently */
  if (!(Number(every) >= 1)) return 'Repeat every must be at least 1.';

  if (endKind === 'AFTER' && !(Number(endAfter) >= 1))
    return 'Occurrences must be at least 1.';

  if (endKind === 'BY' && !moment(endDate).isAfter(moment(startDate), 'day'))
    return 'The end date must be after the start date.';

  return null;
};

/**
 * Both DatePickers default to today, so picking "By date" and leaving the end
 * date alone posts two identical dates — the most likely new 400. Nudge the end
 * date past the start whenever the range would be invalid.
 */
export const nextEndDate = (startDate: any, endDate: any) =>
  moment(endDate).isAfter(moment(startDate), 'day')
    ? endDate
    : moment(startDate).add(1, 'day').format('YYYY-MM-DD');
