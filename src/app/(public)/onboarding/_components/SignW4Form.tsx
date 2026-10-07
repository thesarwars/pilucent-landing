import SignaturePad from '@/app/dashboard/hris/employee/employees/_components/signature';
import React, { useRef, useState } from 'react';

interface SignaturePadRef {
  clear: () => void;
}

const SignW4Form = ({
  signaturePadRef,

  data,
  setData,
  prev,
  next,
  currentStep,
  steps,
}: {
  signaturePadRef: React.RefObject<SignaturePadRef>;
  data: any;
  setData: any;
  prev: any;
  next: any;
  currentStep: any;
  steps: any;
}) => {
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setData({ ...data, w4_signature: '' });
    }
  };

  const handleNext = () => {
    if (!data?.w4_signature) {
      setErrors({ signature: true });
      return;
    }
    setErrors({});
    next();
  };

  return (
    <div className="rounded-lg bg-white/60 p-6 text-sm text-accent_soft_black">
      <div className="my-2 rounded-lg">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Signature and Agreement</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="signature" className="block text-sm font-medium text-gray-700">
              Signature
            </label>
            <div
              className={`rounded-md border p-2 ${errors.signature ? 'border-red-500' : 'border-gray-300'}`}
            >
              <SignaturePad
                ref={signaturePadRef}
                onEnd={(signatureData: string) => {
                  setData({ ...data, w4_signature: signatureData });
                  setErrors({});
                }}
              />
            </div>
            <button
              type="button"
              onClick={clearSignature}
              className="mt-2 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Signature
            </button>
            {errors.signature && <p className="text-sm text-red-500">Signature is required.</p>}
          </div>
        </div>
      </div>

      <div>
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={currentStep === 1}
            className={`rounded-md border px-6 py-2 ${
              currentStep === 1
                ? 'cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400'
                : 'border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50'
            } `}
          >
            Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="rounded-md bg-[#02143A] px-6 py-2 text-white hover:opacity-95"
          >
            {currentStep < steps.length ? 'Continue to review' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignW4Form;
