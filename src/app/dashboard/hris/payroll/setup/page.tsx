"use client";

import { motion } from "framer-motion";
import { FiCheck, FiEdit, FiHelpCircle } from "react-icons/fi";
import { useState } from "react";

interface TimelineStep {
  id: number;
  title: string;
  description: string;
  status: "completed" | "current" | "pending";
  completedDate?: string;
  hasReview?: boolean;
  hasAction?: boolean;
  actionText?: string;
  actionType?: "primary" | "secondary";
}

const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: "Fill out company profile",
    description: "Completed on Jul 13",
    status: "completed",
  },
  {
    id: 2,
    title: "Add payroll details",
    description: "Completed on Jul 13",
    status: "completed",
    hasReview: true,
  },
  {
    id: 3,
    title: "Add team members",
    description: "Completed on Jul 13",
    status: "completed",
    hasReview: true,
  },
  {
    id: 4,
    title: "Share state tax details",
    description: "Completed on Jul 13",
    status: "completed",
    hasReview: true,
  },
  {
    id: 5,
    title: "Add previous payroll records",
    description: "Completed on Jul 13",
    status: "completed",
    hasReview: true,
  },
  {
    id: 6,
    title: "Sign documents",
    description: "Completed on Jul 13",
    status: "completed",
    hasReview: true,
  },
  {
    id: 7,
    title: "Verify bank account",
    description: "By May 15, 5 pm",
    status: "current",
    hasAction: true,
    actionText: "Let's do it",
    actionType: "primary",
  },
  {
    id: 8,
    title: "Add health benefits",
    description: "By May 15, 5 pm",
    status: "current",
    hasAction: true,
    actionText: "Continue",
    actionType: "secondary",
  },
  {
    id: 9,
    title: "Gusto reviews your account",
    description: "By May 16",
    status: "pending",
  },
  {
    id: 10,
    title: "Run your first Gusto payroll",
    description: "By May 16",
    status: "pending",
  },
  {
    id: 11,
    title: "First Gusto payday",
    description: "By May 16",
    status: "pending",
  },
];

export default function PayrollTimeline() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const leftSteps = timelineSteps.slice(0, 6); // Steps 1-6
  const rightSteps = timelineSteps.slice(6); // Steps 7-11

  const getStepIcon = (status: string, index: number) => {
    if (status === "completed") {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.15, type: "spring", stiffness: 200 }}
          className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-accent_soft_black shadow-sm"
        >
          <FiCheck className="h-4 w-4 text-white" />
        </motion.div>
      );
    } else if (status === "current") {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.15, type: "spring", stiffness: 200 }}
          className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-accent_soft_black shadow-sm"
        >
          <FiCheck className="h-4 w-4 text-white" />
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.15, type: "spring", stiffness: 200 }}
          className="relative z-10 h-6 w-6 rounded-full border-2 border-gray-300 bg-white"
        />
      );
    }
  };

  const getLeftConnectorLine = (index: number, status: string) => {
    if (index === leftSteps.length - 1) return null;

    const isCompleted = status === "completed";
    return (
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: index * 0.15 + 0.2, duration: 0.4 }}
        className={`absolute left-3 top-6 h-24 w-0.5 ${
          isCompleted ? "bg-accent_soft_black" : "bg-gray-300"
        } origin-top transform`}
      />
    );
  };

  const getRightConnectorLine = (index: number, status: string) => {
    if (index === rightSteps.length - 1) return null;

    const isCompleted = status === "completed";
    return (
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{
          delay: (index + leftSteps.length + 1) * 0.15 + 0.2,
          duration: 0.4,
        }}
        className={`absolute left-3 top-6 h-32 w-0.5 ${
          isCompleted ? "bg-accent_soft_black" : "bg-gray-300"
        } origin-top transform`}
      />
    );
  };

  return (
    <div className="mt-5 min-h-screen rounded-xl border bg-white p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">
            Payroll setup timeline
          </h1>
          <p className="text-sm text-gray-600">
            This is an estimated timeline of what's needed to get you fully set
            up for payroll.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        >
          <FiHelpCircle className="h-4 w-4" />
          FAQs
        </motion.button>
      </motion.div>

      <div className="flex flex-col lg:flex-row  lg:gap-8">
        {/* Main Timeline Area */}
        <div className="flex-1 w-full">
          <div className="relative flex flex-col lg:flex-row lg:gap-16">
            {/* Left Column */}
            <div className="relative flex-1">
              <div className="space-y-0">
                {leftSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                    className="relative"
                    onMouseEnter={() => setHoveredStep(step.id)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    {/* Left Connector Line */}
                    {getLeftConnectorLine(index, step.status)}

                    <motion.div
                      className="flex cursor-pointer items-start gap-4 pb-6"
                      whileHover={{ x: 2 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      {/* Step Icon */}
                      <div className="relative">
                        {getStepIcon(step.status, index)}
                      </div>

                      {/* Step Content */}
                      <div className="min-w-0 flex-1">
                        <motion.h3
                          className="mb-1 font-medium text-gray-900"
                          animate={{
                            color:
                              hoveredStep === step.id ? "#3462fa" : "#16151c",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {index + 1}. {step.title}
                        </motion.h3>
                        <p className="mb-2 text-sm text-gray-500">
                          {step.description}
                        </p>

                        {/* Review Link */}
                        {step.hasReview && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="rounded-md border border-accent_soft_black px-4 py-1.5 text-sm font-medium text-accent_soft_black transition-colors hover:bg-black hover:text-white"
                          >
                            Review
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Horizontal Connector */}
            {/* <div
              className="absolute left-1/2 transform -translate-x-1/2"
              style={{ top: `${(leftSteps.length - 1) * 80 + 12}px` }}
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: leftSteps.length * 0.15, duration: 0.6 }}
                className="w-16 h-0.5 bg-accent_soft_black transform origin-left"
              />
            </div> */}

            {/* Right Column */}
            <div className="relative flex-1">
              <div className="space-y-0">
                {rightSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: (index + leftSteps.length + 1) * 0.15,
                    }}
                    className="relative"
                    onMouseEnter={() => setHoveredStep(step.id)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    {/* Right Connector Line */}
                    {getRightConnectorLine(index, step.status)}

                    <motion.div
                      className="flex cursor-pointer items-start gap-4 pb-6"
                      whileHover={{ x: -2 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      {/* Step Icon */}
                      <div className="relative">
                        {getStepIcon(step.status, index + leftSteps.length)}
                      </div>
                      {/* Step Content */}
                      <div className="min-w-0 flex-1">
                        <motion.h3
                          className="mb-1 font-medium text-gray-900"
                          animate={{
                            color:
                              hoveredStep === step.id ? "#3462fa" : "#16151c",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {index + 7}. {step.title}
                        </motion.h3>
                        <p className="mb-2 text-sm text-gray-500">
                          {step.description}
                        </p>

                        {/* Additional Info */}
                        {step.id === 7 && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mb-3 text-sm text-gray-600"
                          >
                            Let's verify the bank details for Balancify Inc
                            before paying the team.
                          </motion.p>
                        )}

                        {step.id === 8 && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mb-3 text-sm text-gray-600"
                          >
                            Let's add health benefits for Balancify Inc before
                            paying the team.
                          </motion.p>
                        )}

                        {/* Review Link */}
                        {step.hasReview && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="rounded-md border border-accent_soft_black px-4 py-1.5 text-sm font-medium text-accent_soft_black transition-colors hover:bg-black hover:text-white"
                          >
                            Review
                          </motion.button>
                        )}

                        {/* Action Button */}
                        {step.hasAction && (
                          <motion.button
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                              step.actionType === "primary"
                                ? "bg-accent_soft_black text-white shadow-sm hover:bg-black"
                                : "border border-accent_soft_black text-accent_soft_black hover:bg-gray-500"
                            }`}
                          >
                            {step.actionText}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
                <div className="-translate-x-[34px] -translate-y-1.5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 2,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="relative z-10 flex w-24  flex-col items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 shadow-sm"
                    >
                      <FiCheck className="h-4 w-4 text-white" />
                    </motion.div>
                    <p className="font-medium text-accent_soft_black">
                      Good to go!
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="w-64"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-medium text-gray-900">First Gusto payday</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-accent_soft_black transition-colors hover:text-accent_soft_blue"
              >
                <FiEdit className="h-4 w-4" />
              </motion.button>
            </div>
            <p className="text-sm text-gray-600">Fri Aug 1</p>
          </motion.div>

          {/* Progress Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <h3 className="mb-3 font-medium text-gray-900">Progress Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium text-accent_soft_black">
                  6/{timelineSteps.length}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(6 / timelineSteps.length) * 100}%` }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="h-2 rounded-full bg-accent_soft_black"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining</span>
                <span className="font-medium text-gray-900">5 steps</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
