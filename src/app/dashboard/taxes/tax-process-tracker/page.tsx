'use client';

import { ManualBreadcrumbs } from '@/components/BreadCrumb/BreadCrumb';
import { toast } from '@/lib/ToastService';
import { useState, useEffect } from 'react';
import { FaRegClipboard } from 'react-icons/fa';

interface ProcessingStage {
  id: string;
  name: string;
  completed: boolean;
  current: boolean;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

export default function Page() {
  const [stages, setStages] = useState<ProcessingStage[]>([
    { id: '1', name: 'Document Review', completed: true, current: false },
    { id: '2', name: 'Processing', completed: true, current: false },
    { id: '3', name: 'Verification', completed: false, current: true },
    { id: '4', name: 'Completed', completed: false, current: false },
  ]);

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      timestamp: '17 June 09:30',
      title: 'Tax Processing Started',
      description:
        'Your tax documents have been received and processing has begun. [Tax Department - Processing Unit]',
      completed: true,
    },
    {
      id: '2',
      timestamp: '17 June 10:15',
      title: 'Document Verification Complete',
      description:
        'All required documents have been verified and approved. [Tax Department - Verification Unit]',
      completed: true,
    },
    {
      id: '3',
      timestamp: '18 June 11:45',
      title: 'Tax Calculation in Progress',
      description:
        'Tax calculations are being processed by our specialists. [Tax Department - Calculation Unit]',
      completed: true,
      current: true,
    },
    {
      id: '4',
      timestamp: '20 June 14:20 (estimated)',
      title: 'Under Final Review',
      description:
        'Tax processing is under final review before completion. [Tax Department - Review Unit]',
      completed: false,
    },
    {
      id: '5',
      timestamp: '21 June 10:00 (estimated)',
      title: 'Processing Will Complete Today',
      description:
        'Your tax processing will be completed today. [Tax Department - Processing Unit]',
      completed: false,
    },
  ]);

  const [animatedStages, setAnimatedStages] = useState<boolean[]>([false, false, false, false]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Animate stages one by one
    stages.forEach((stage, index) => {
      setTimeout(() => {
        setAnimatedStages((prev) => {
          const newAnimated = [...prev];
          newAnimated[index] = true;
          return newAnimated;
        });
      }, index * 200);
    });
  }, []);

  const handleCopy = (copyText: string) => {
    navigator.clipboard
      .writeText(copyText)
      .then(() => toast.success('Copied to clipboard!'))
      .catch((err) => toast.error('Failed to copy: ' + err));
  };

  return (
    <>
      <ManualBreadcrumbs
        items={[
          {
            label: 'Tax Process Tracker',
            href: '/dashboard/taxes/tax-process-tracker',
          },
        ]}
        className="mb-5 mt-0"
      />
      <div
        style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.05)' }}
        className="mb-8 rounded-xl border bg-white/60 p-6"
      >
        {/* Header */}

        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Processing</h1>
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-1000 ease-out"
              style={{ width: '75%' }}
            ></div>
          </div>
        </div>

        {/* Processing Details */}
        <div className="mb-8 rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Processing Details</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div
              className={`flex items-start space-x-3 transition-all duration-300 ease-out ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <svg
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Tax Processor Info</h3>
                <p className="text-sm text-gray-600">Processing Partner: TaxPro Services</p>
                <p className="text-sm text-gray-600">
                  Processor: Sarah Johnson - Senior Tax Specialist
                </p>
              </div>
            </div>
            <div
              className={`flex items-start space-x-3 transition-all duration-300 ease-out ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                <svg
                  className="h-4 w-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Processing Number</h3>
                <p
                  onClick={() => handleCopy('TAX-2024-0312456789')}
                  className="group flex cursor-pointer items-center font-mono text-sm text-blue-600"
                >
                  TAX-2024-0312456789
                  <FaRegClipboard className="ml-2 opacity-0 transition-opacity group-hover:opacity-100" />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stages */}
        <div className="mb-8">
          <div className="relative flex items-center justify-between">
            {/* Progress Line */}
            <div className="absolute left-6 right-6 top-6 h-0.5 bg-gray-200">
              <div
                className="duration-2000 h-full bg-blue-500 transition-all ease-out"
                style={{ width: '66.66%' }}
              ></div>
            </div>

            {stages.map((stage, index) => (
              <div key={stage.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={`duration-[1500] flex h-12 w-12 transform items-center justify-center rounded-full transition-all ease-out ${
                    animatedStages[index] ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                  } ${
                    stage.completed
                      ? 'bg-blue-500 text-white'
                      : stage.current
                        ? 'duration-[1500] animate-pulse bg-blue-100 text-blue-600 ring-4 ring-blue-200'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {stage.completed ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : stage.current ? (
                    <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600 duration-1000"></div>
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                  )}
                </div>
                <span
                  className={`mt-2 text-sm font-medium transition-all delay-200 duration-500 ${
                    animatedStages[index] ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                  } ${stage.completed || stage.current ? 'text-gray-900' : 'text-gray-500'}`}
                >
                  {stage.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {/* <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <div
              key={event.id}
              className={`flex transform items-start space-x-4 text-sm transition-all duration-300 ease-out ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-4 opacity-0"
              }`}
              style={{
                transitionDelay: `${index * 150}ms`,
              }}
            >
              <div className="flex-shrink-0 pt-1">
                <div
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    event.completed
                      ? "bg-blue-500 ring-4 ring-blue-100"
                      : "bg-gray-300 ring-4 ring-gray-100"
                  }`}
                ></div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">
                    {event.timestamp}
                  </span>
                  {event.completed && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <h3
                  className={`text-base font-medium ${event.completed ? "text-gray-900" : "text-gray-600"}`}
                >
                  {event.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div> */}

        <div className="flex w-full flex-col justify-center gap-[10px]">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="flex items-start gap-[20px]">
              <div className="flex flex-col items-center">
                <p
                  className={`${index == 0 ? `flex h-[35px] w-[35px] ${event?.current ? 'outline outline-2 outline-offset-[3px]' : ''} items-center justify-center rounded-full bg-primary text-[1rem] text-white dark:bg-slate-700 dark:text-[#abc2d3]` : `flex h-[35px] w-[35px] items-center justify-center rounded-full ${event.completed ? 'bg-primary text-white' : 'border-2 border-black text-black'} ${event?.current ? 'outline outline-2 outline-offset-[3px]' : ''} text-[1rem] outline-primary dark:bg-slate-700 dark:text-[#abc2d3]`}`}
                >
                  {index + 1}
                </p>
                {timelineEvents?.length != index + 1 ? (
                  <div className="mt-[10px] h-[50px] w-[2px] bg-primary dark:bg-slate-700"></div>
                ) : (
                  ''
                )}
              </div>
              <div
                className={`flex transform items-start space-x-4 text-sm transition-all duration-300 ease-out ${
                  isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`,
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">{event.timestamp}</span>
                    {event.completed && !event?.current && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3
                    className={`text-base font-medium ${event.completed ? 'text-gray-900' : 'text-gray-600'}`}
                  >
                    {event.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Footer */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-blue-800">
              Processing in progress - Expected completion: 21 June 2025 (expected)
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
