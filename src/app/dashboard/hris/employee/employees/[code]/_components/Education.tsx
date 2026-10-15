import React, { useEffect, useState } from "react";
import EducationTable from "./Education/EduQualificationTable";
import PreviousWETable from "./Education/PreviousWETable";
import InternalWorkHistoryTable from "./Education/InternalWorkHistoryTable";

const Education = ({ uid }: { uid: string }) => {
  return (
    <div className="min-w-0 text-sm">
      <EducationTable uid={uid} />

      <PreviousWETable uid={uid} />
      <InternalWorkHistoryTable uid={uid} />
    </div>
  );
};

export default Education;
