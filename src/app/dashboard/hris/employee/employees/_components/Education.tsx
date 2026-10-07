import React, { useEffect, useState } from "react";
import EducationTable from "./Education/EduQualificationTable";
import PreviousWETable from "./Education/PreviousWETable";
import InternalWorkHistoryTable from "./Education/InternalWorkHistoryTable";

const Education = ({
  internalWorkItems,
  setInternalWorkItems,
  prevWorkItems,
  setPrevWorkItems,
  educationItems,
  setEducationItems,
  prev,
  next,
  currentStep,
  steps,
}: {
  internalWorkItems: any[];
  setInternalWorkItems: any;
  prevWorkItems: any[];
  setPrevWorkItems: any;
  educationItems: any[];
  setEducationItems: any;
  prev: any;
  next: any;
  currentStep: any;
  steps: any;
}) => {
  return (
    <div className="text-sm">
      <EducationTable
        educationItems={educationItems}
        setEducationItems={setEducationItems}
      />

      <PreviousWETable
        prevWorkItems={prevWorkItems}
        setPrevWorkItems={setPrevWorkItems}
      />
      <InternalWorkHistoryTable
        internalWorkItems={internalWorkItems}
        setInternalWorkItems={setInternalWorkItems}
      />
      <div className="mt-8 flex justify-between">
        <button
          onClick={prev}
          disabled={currentStep === 1}
          className={`rounded-md border px-6 py-2 ${
            currentStep === 1
              ? "cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400"
              : "border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50"
          } `}
        >
          Previous
        </button>

        <button
          type="submit"
          onClick={next}
          //   disabled={currentStep === steps.length}
          className={`rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700`}
        >
          {currentStep === steps.length ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Education;
