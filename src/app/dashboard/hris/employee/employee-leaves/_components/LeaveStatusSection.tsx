// Extracted components

// Types
interface ProgressBarSegment {
  value: number;
  color: string;
  label: string;
}

interface ProgressBarProps {
  segments?: ProgressBarSegment[];
  total?: number;
  baseColor?: string;
  containerColor?: string;
  showSegmentValues?: boolean;
  showTotalFilled?: boolean;
  height?: string;
}

interface LeaveType {
  type: string;
  segments: ProgressBarSegment[];
  total: number;
}

interface LeaveStatusSectionProps {
  leaveTypes: LeaveType[];
  leaveStatuses: string[];
  statusColors: Record<string, string>;
}

interface LeaveData {
  leaveType: string;
  leaveCategory: string;
  availableLeave: string;
  totalDays: string;
  fromDate: string;
  toDate: string;
  note: string;
  documents: File | null;
  deskLookBy: string;
}

interface LeaveRecord {
  id: number;
  leaveDate: string;
  type: string;
  option: string;
  desk: string;
  status: string;
  approvedBy: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  segments = [
    { value: 4, color: "bg-blue-500", label: "Completed" },
    { value: 2, color: "bg-teal-400", label: "In Progress" },
    { value: 3, color: "bg-purple-400", label: "Planned" },
  ],
  total = 4,
  baseColor = "bg-blue-100",
  containerColor = "bg-slate-100",
  showSegmentValues = true,
  showTotalFilled = true,
  height = "h-10",
}) => {
  console.log("🚀 ~ ProgressBar ~ segments:", total);

  // Filter segments to only include those with values > 0
  const visibleSegments = segments.filter((segment) => segment.value > 0);

  // Calculate filled amount from visible segments
  const filled = visibleSegments.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <div
      className={`relative flex max-w-3xl items-center rounded-full ${containerColor} p-1`}
    >
      {/* Base layer */}
      <div
        className={`relative ${height} flex-grow overflow-hidden rounded-full ${baseColor}`}
      >
        {/* Foreground segments layered over base */}
        <div className="absolute left-0 top-0 flex h-full w-full p-1">
          {visibleSegments.map((segment, index) => (
            <div
              key={index}
              className={`flex items-center justify-center rounded-full font-bold text-white ${segment.color}`}
              style={{ width: `${(segment.value / total) * 100}%` }}
            >
              {showSegmentValues && segment.value > 0 && segment.value}
            </div>
          ))}
        </div>

        {/* Filled value display */}
        {/* {showTotalFilled && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-800">
            {filled}
          </div>
        )} */}
      </div>

      {/* Total number at the end - show only available balance */}
      <div className="ml-3 rounded-full text-sm font-bold text-gray-800">
        {total}
      </div>
    </div>
  );
};

const LeaveStatusSection = ({
  leaveTypes = [],
  leaveStatuses = [],
  statusColors = {},
}: {
  leaveTypes?: LeaveType[];
  leaveStatuses?: string[];
  statusColors?: Record<string, string>;
}) => (
  <div className="mb-16 rounded-lg bg-white p-6">
    <div className="mb-4 flex justify-end">
      <div className="flex items-center gap-4">
        {leaveStatuses.map((status) => (
          <div key={status} className="flex items-center gap-1">
            <div
              className={`h-4 w-4 rounded-full ${statusColors[status] || ""}`}
            ></div>
            <span className="text-sm text-gray-600">{status}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-8 p-4">
      {leaveTypes.map((leave, idx) => (
        <div key={idx} className="flex items-center gap-4">
          {/* Leave Type Label */}
          <div className="w-36 text-lg font-medium text-gray-700">
            {leave.type}
          </div>

          {/* Progress Bar */}
          <div className="flex-grow">
            <ProgressBar
              segments={leave.segments}
              total={leave.total}
              baseColor="bg-blue-100"
              containerColor="bg-slate-100"
              showSegmentValues={true}
              showTotalFilled={true}
              height="h-10"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default LeaveStatusSection;
