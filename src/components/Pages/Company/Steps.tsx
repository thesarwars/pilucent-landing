import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type StepsProps = {
  count: number;
};

const Steps = ({ count }: StepsProps) => {
  const steps = [
    {
      serial: '01',
      title: 'Company Info',
    },
    {
      serial: '02',
      title: 'Contact Info',
    },
    {
      serial: '03',
      title: 'Address',
    },
    {
      serial: '04',
      title: 'Verification',
    },
  ];
  return (
    <div className="my-12 flex items-center justify-center gap-6 md:gap-12">
      {steps.map((step, index) => (
        <React.Fragment key={step.serial}>
          <div className="flex flex-col items-center gap-3">
            {count === Number(step.serial) ? (
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent_soft_blue text-white">
                {step.serial}
              </div>
            ) : count < Number(step.serial) ? (
              <div
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent_bg_light_blue text-accent_soft_black'
                )}
              >
                {step.serial}
              </div>
            ) : (
              <Image alt="check" width={32} height={32} src="/images/icons/check_correct.svg" />
            )}
            <h4 className="text-nowrap text-xs font-medium text-accent_soft_black">{step.title}</h4>
          </div>

          {index < steps.length - 1 && (
            <div
              className={cn(
                'h-[2px] w-16 md:w-full',
                count > Number(step.serial) ? 'bg-accent_soft_blue' : 'bg-gray-300'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Steps;
