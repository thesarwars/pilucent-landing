import React from 'react';

interface Step {
  id: number;
  label: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

const StepperIndicator: React.FC<Props> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center max-w-full justify-between">
      {steps.map((step, idx) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div key={step.id} className="flex-1 flex justify-center items-center">
            <div className='w-[120px]'>
              {/* Circle with number or checkmark */}
              <div
                className={`
                relative flex items-center justify-center w-8 h-8 rounded-full m-auto
                ${isCompleted ? 'bg-green-500' : isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}
              >
                {isCompleted ? (
                  // checkmark icon (simple SVG)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 
                           10-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                    {step.id}
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="ml-2 text-center">
                <span
                  className={`
                  text-xs font-medium 
                  ${isCompleted ? 'text-gray-600' : isActive ? 'text-indigo-600' : 'text-gray-400'}
                `}
                >
                  {step.label}
                </span>
              </div>
            </div>
            {/* Divider to next step (except last) */}
            {idx !== steps.length - 1 && (
              <div className="flex-1 h-1 bg-gray-200 w-[40px]">
                <div
                  className={`h-full bg-${isCompleted ? 'green' : 'gray'}-500`}
                  style={{
                    width: isCompleted ? '100%' : '0%',
                    transition: 'width 0.3s ease-in-out',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepperIndicator;
