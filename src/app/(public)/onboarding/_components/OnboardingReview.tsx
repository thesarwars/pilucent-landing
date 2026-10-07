"use client";

import React from "react";
import {
  getBlockingReviewIssues,
  getOnboardingReviewIssues,
} from "./onboardingReviewIssues";

function SectionCard({
  title,
  children,
  onEdit,
  step,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: (step: number) => void;
  step: number;
}) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/50 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-sm font-medium text-indigo-700 underline-offset-2 hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="space-y-1 text-sm text-gray-700">{children}</div>
    </div>
  );
}

function formatPayKind(kind: string) {
  if (kind === "BANK_TRANSFER") return "Direct deposit (bank transfer)";
  if (kind === "PAPER_CHECK") return "Paper check";
  return kind || "—";
}

const OnboardingReview = ({
  data,
  shippingAddress,
  mailingAddress,
  paymentInfo,
  stateTaxInfo,
  federalTaxInfo,
  skippedPayment,
  skippedTaxes,
  goToStep,
  onSubmit,
  isSubmitting,
}: {
  data: Record<string, any>;
  shippingAddress: Record<string, any>;
  mailingAddress: Record<string, any>;
  paymentInfo: Record<string, any>;
  stateTaxInfo: Record<string, any>;
  federalTaxInfo: Record<string, any>;
  skippedPayment: boolean;
  skippedTaxes: boolean;
  goToStep: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) => {
  const issues = getOnboardingReviewIssues({
    data,
    shippingAddress,
    mailingAddress,
    paymentInfo,
    stateTaxInfo,
    federalTaxInfo,
    skippedPayment,
    skippedTaxes,
  });
  const blocking = getBlockingReviewIssues(issues);
  const skippedOnly = issues.filter((i) => i.skipped);

  const w4Ok =
    data?.w4_signature instanceof File ||
    (typeof data?.w4_signature === "string" && data.w4_signature.length > 0);

  const mailingFilled = [
    mailingAddress?.full_address,
    mailingAddress?.city,
    mailingAddress?.province,
    mailingAddress?.postal_code,
  ].some((x) => (x ?? "").toString().trim());

  return (
    <div className="text-sm">
      <h2 className="mb-2 text-2xl font-semibold text-gray-900">
        Review & submit
      </h2>
      <p className="mb-6 text-gray-600">
        Confirm your information below. Use <strong>Edit</strong> to jump back
        to any section. Fix any required items before submitting.
      </p>

      {skippedOnly.length > 0 && (
        <div
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50/90 p-4"
          role="status"
        >
          <p className="text-sm font-medium text-amber-950">Skipped sections</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {skippedOnly.map((i, idx) => (
              <li key={idx}>{i.message}</li>
            ))}
          </ul>
        </div>
      )}

      {blocking.length > 0 && (
        <div
          className="mb-6 rounded-xl border border-red-200 bg-red-50/90 p-4"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-900">
            Required items still missing ({blocking.length})
          </p>
          <ul className="mt-2 max-h-48 list-disc space-y-1 overflow-y-auto pl-5 text-sm text-red-800">
            {blocking.map((i, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  className="text-left underline-offset-2 hover:underline"
                  onClick={() => goToStep(i.step)}
                >
                  {i.section}: {i.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Personal details" onEdit={goToStep} step={1}>
          <p>
            <span className="text-gray-500">Name: </span>
            {[data?.first_name, data?.middle_name, data?.last_name]
              .filter(Boolean)
              .join(" ") || "—"}
          </p>
          <p>
            <span className="text-gray-500">Gender: </span>
            {data?.gender || "—"}
          </p>
          <p>
            <span className="text-gray-500">Date of birth: </span>
            {data?.date_of_birth || "—"}
          </p>
          <p>
            <span className="text-gray-500">SSN: </span>
            {data?.ssn ? "•••-••-" + String(data.ssn).slice(-4) : "—"}
          </p>
          <p>
            <span className="text-gray-500">Profile photo: </span>
            {data?.image instanceof File ? data.image.name : "Not uploaded"}
          </p>
        </SectionCard>

        <SectionCard title="Tax withholding" onEdit={goToStep} step={5}>
          {skippedTaxes ? (
            <p className="text-amber-800">Skipped — complete later in profile.</p>
          ) : (
            <>
              <p>
                <span className="text-gray-500">State (lives): </span>
                {stateTaxInfo?.state || "—"}
              </p>
              <p>
                <span className="text-gray-500">State marital status: </span>
                {stateTaxInfo?.martial_status || "—"}
              </p>
              <p>
                <span className="text-gray-500">Federal W-4: </span>
                {federalTaxInfo?.employee_W_4_kind || "—"}
              </p>
              <p>
                <span className="text-gray-500">Federal withholding: </span>
                {federalTaxInfo?.holding_status || "—"}
              </p>
            </>
          )}
        </SectionCard>

        <SectionCard
          title="Contact & address"
          onEdit={goToStep}
          step={2}
        >
          <p>
            <span className="text-gray-500">Phone: </span>
            {data?.phone_number || "—"}
          </p>
          <p>
            <span className="text-gray-500">Preferred email: </span>
            {data?.preferred_email || "—"}
          </p>
          <p>
            <span className="text-gray-500">Shipping address: </span>
            {[
              shippingAddress?.full_address,
              shippingAddress?.city,
              shippingAddress?.province,
              shippingAddress?.postal_code,
            ]
              .filter(Boolean)
              .join(", ") || "—"}
          </p>
          {mailingFilled && (
            <p>
              <span className="text-gray-500">Mailing: </span>
              {[
                mailingAddress?.full_address,
                mailingAddress?.city,
                mailingAddress?.province,
                mailingAddress?.postal_code,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
          <p>
            <span className="text-gray-500">Emergency: </span>
            {data?.emergency_contact_name || "—"} (
            {data?.emergency_contact_relationship || "—"}) —{" "}
            {data?.emergency_phone_number || "—"}
          </p>
        </SectionCard>

        <SectionCard title="Payroll / payment" onEdit={goToStep} step={4}>
          {skippedPayment ? (
            <p className="text-amber-800">Skipped — complete later in profile.</p>
          ) : (
            <>
              <p>
                <span className="text-gray-500">Method: </span>
                {formatPayKind(paymentInfo?.kind)}
              </p>
              {paymentInfo?.kind === "BANK_TRANSFER" && (
                <>
                  <p>
                    <span className="text-gray-500">Bank: </span>
                    {paymentInfo?.bank_name || "—"}
                  </p>
                  <p>
                    <span className="text-gray-500">Account: </span>
                    {paymentInfo?.bank_account_number
                      ? "••••" +
                        String(paymentInfo.bank_account_number).slice(-4)
                      : "—"}
                  </p>
                  <p>
                    <span className="text-gray-500">Routing: </span>
                    {paymentInfo?.routing_number
                      ? "•••" + String(paymentInfo.routing_number).slice(-4)
                      : "—"}
                  </p>
                </>
              )}
            </>
          )}
        </SectionCard>

        <SectionCard title="Employment eligibility" onEdit={goToStep} step={3}>
          {data?.on_boarding_kind !== "SELF_ONBOARD_WITH_I9" ? (
            <p>I-9 full flow not required for your onboarding type.</p>
          ) : (
            <p>
              <span className="text-gray-500">Status: </span>
              {data?.citizenship_kind?.replace(/_/g, " ") || "—"}
            </p>
          )}
        </SectionCard>

        <SectionCard title="Documents" onEdit={goToStep} step={6}>
          <p>
            <span className="text-gray-500">W-4 signature: </span>
            {w4Ok ? (
              <span className="font-medium text-emerald-700">Uploaded</span>
            ) : (
              <span className="font-medium text-red-700">Missing</span>
            )}
          </p>
          {data?.w4_signature instanceof File && (
            <p className="text-xs text-gray-500">{data.w4_signature.name}</p>
          )}
        </SectionCard>
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-4">
        <button
          type="button"
          onClick={() => goToStep(6)}
          className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-gray-800 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          disabled={blocking.length > 0 || isSubmitting}
          onClick={onSubmit}
          className={`rounded-md px-8 py-2.5 font-medium text-white ${
            blocking.length > 0 || isSubmitting
              ? "cursor-not-allowed bg-gray-400"
              : "bg-[#02143A] hover:opacity-95"
          }`}
        >
          {isSubmitting ? "Submitting…" : "Submit onboarding"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingReview;
