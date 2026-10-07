'use client';

import React from 'react';
import { WizardStep } from './types';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 1, label: 'Select Data Type' },
  { id: 2, label: 'Upload File' },
  { id: 3, label: 'Map Fields' },
  { id: 4, label: 'Preview Data' },
  { id: 5, label: 'Validate Data' },
  { id: 6, label: 'Review Impact' },
  { id: 7, label: 'Confirm Import' },
  { id: 8, label: 'Results & Audit' },
];

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="rounded-2xl border border-accent_border_gray bg-white p-5 shadow-sm">
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4 lg:grid-cols-8">
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const clickable = !!onStepClick && (isCompleted || isActive);
          const labelColor = isActive
            ? 'text-accent_soft_blue font-semibold'
            : isCompleted
              ? 'text-accent_text_black'
              : 'text-accent_text_gray';
          const barColor = isActive || isCompleted ? 'bg-accent_soft_blue' : 'bg-accent_border_gray';

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => clickable && onStepClick?.(step.id)}
              disabled={!clickable}
              className="flex flex-col items-start text-left disabled:cursor-default"
            >
              <span className={`text-xs leading-tight ${labelColor}`}>
                {step.id}. {step.label}
              </span>
              <span className={`mt-2 h-1 w-full rounded-full ${barColor}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
