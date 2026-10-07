import {
  emailError,
  employmentI9FieldErrors,
  phoneError,
  requiredTextError,
  ssnFieldError,
} from './onboardingFormUtils';

export type ReviewIssue = {
  step: number;
  section: string;
  message: string;
  /** Skipped optional workflow — informational */
  skipped?: boolean;
};

export function getOnboardingReviewIssues(args: {
  data: Record<string, any>;
  shippingAddress: Record<string, any>;
  mailingAddress: Record<string, any>;
  paymentInfo: Record<string, any>;
  stateTaxInfo: Record<string, any>;
  federalTaxInfo: Record<string, any>;
  skippedPayment: boolean;
  skippedTaxes: boolean;
}): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const {
    data,
    shippingAddress,
    paymentInfo,
    stateTaxInfo,
    federalTaxInfo,
    skippedPayment,
    skippedTaxes,
  } = args;

  if (!(data?.first_name ?? '').trim()) {
    issues.push({
      step: 1,
      section: 'Personal details',
      message: 'First name is required.',
    });
  }
  if (!(data?.last_name ?? '').trim()) {
    issues.push({
      step: 1,
      section: 'Personal details',
      message: 'Last name is required.',
    });
  }
  if (!(data?.gender ?? '').trim()) {
    issues.push({
      step: 1,
      section: 'Personal details',
      message: 'Gender is required.',
    });
  }
  if (!(data?.date_of_birth ?? '').trim()) {
    issues.push({
      step: 1,
      section: 'Personal details',
      message: 'Date of birth is required.',
    });
  }
  const ssnErr = ssnFieldError(data?.ssn);
  if (ssnErr) {
    issues.push({ step: 1, section: 'Personal details', message: ssnErr });
  }

  const ph = phoneError(data?.phone_number, true);
  if (ph) {
    issues.push({ step: 2, section: 'Contact', message: ph });
  }
  const hp = (() => {
    const d = (data?.home_phone_number ?? '').replace(/\D/g, '');
    if (d.length === 0) return null;
    if (d.length < 10) return 'Home phone is incomplete or clear the field.';
    return null;
  })();
  if (hp) {
    issues.push({ step: 2, section: 'Contact', message: hp });
  }
  const persE = emailError(data?.personal_email, false);
  if (persE) {
    issues.push({ step: 2, section: 'Contact', message: persE });
  }

  const fa = requiredTextError(shippingAddress?.full_address);
  if (fa) {
    issues.push({ step: 2, section: 'Address', message: 'Street address is required.' });
  }
  const st = requiredTextError(shippingAddress?.province);
  if (st) {
    issues.push({ step: 2, section: 'Address', message: 'State / province is required.' });
  }
  const ct = requiredTextError(shippingAddress?.city);
  if (ct) {
    issues.push({ step: 2, section: 'Address', message: 'City is required.' });
  }
  const zip = requiredTextError(shippingAddress?.postal_code);
  if (zip) {
    issues.push({ step: 2, section: 'Address', message: 'ZIP / postal code is required.' });
  }
  const en = requiredTextError(data?.emergency_contact_name);
  if (en) {
    issues.push({
      step: 2,
      section: 'Emergency contact',
      message: 'Emergency contact name is required.',
    });
  }
  const er = requiredTextError(data?.emergency_contact_relationship);
  if (er) {
    issues.push({
      step: 2,
      section: 'Emergency contact',
      message: 'Relationship is required.',
    });
  }
  const ep = phoneError(data?.emergency_phone_number, true);
  if (ep) {
    issues.push({ step: 2, section: 'Emergency contact', message: ep });
  }

  if (data?.on_boarding_kind === 'SELF_ONBOARD_WITH_I9') {
    const e9 = employmentI9FieldErrors(data);
    Object.values(e9).forEach((msg) => {
      if (msg) {
        issues.push({
          step: 3,
          section: 'Employment eligibility',
          message: msg,
        });
      }
    });
  }

  if (skippedPayment) {
    issues.push({
      step: 4,
      section: 'Payroll / payment',
      message: 'Payment step was skipped — you can finish payroll setup later in your profile.',
      skipped: true,
    });
  } else {
    if (!(paymentInfo?.kind ?? '').trim()) {
      issues.push({
        step: 4,
        section: 'Payroll / payment',
        message: 'Select a payment method.',
      });
    }
    if (paymentInfo?.kind === 'BANK_TRANSFER') {
      if (!(paymentInfo?.bank_name ?? '').trim()) {
        issues.push({
          step: 4,
          section: 'Payroll / payment',
          message: 'Bank name is required for direct deposit.',
        });
      }
      if (!(paymentInfo?.bank_account_number ?? '').trim()) {
        issues.push({
          step: 4,
          section: 'Payroll / payment',
          message: 'Bank account number is required.',
        });
      }
      if (paymentInfo?.bank_account_type == null || paymentInfo?.bank_account_type === '') {
        issues.push({
          step: 4,
          section: 'Payroll / payment',
          message: 'Account type is required.',
        });
      }
      if (!(paymentInfo?.routing_number ?? '').trim()) {
        issues.push({
          step: 4,
          section: 'Payroll / payment',
          message: 'Routing number is required.',
        });
      }
    }
  }

  if (skippedTaxes) {
    issues.push({
      step: 5,
      section: 'Tax withholding',
      message:
        'Tax step was skipped — complete W-4 and state withholding later in your profile if needed.',
      skipped: true,
    });
  } else {
    if (!(stateTaxInfo?.state ?? '').trim()) {
      issues.push({
        step: 5,
        section: 'Tax withholding',
        message: 'State (where employee lives) is required.',
      });
    }
    if (!(stateTaxInfo?.martial_status ?? '').trim()) {
      issues.push({
        step: 5,
        section: 'Tax withholding',
        message: 'State marital status is required.',
      });
    }
    if (!(stateTaxInfo?.exempt ?? '').toString().trim()) {
      issues.push({
        step: 5,
        section: 'Tax withholding',
        message: 'State exempt status is required.',
      });
    }
    if (!(federalTaxInfo?.holding_status ?? '').trim()) {
      issues.push({
        step: 5,
        section: 'Tax withholding',
        message: 'Federal withholding status is required.',
      });
    }
  }

  const hasW4 =
    data?.w4_signature instanceof File ||
    (typeof data?.w4_signature === 'string' && data.w4_signature.length > 0);
  if (!hasW4) {
    issues.push({
      step: 6,
      section: 'Documents',
      message: 'W-4 signature image is required before submitting.',
    });
  }

  return issues;
}

export function getBlockingReviewIssues(issues: ReviewIssue[]) {
  return issues.filter((i) => !i.skipped);
}
