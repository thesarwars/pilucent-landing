// import React, { useState } from "react";
// import { CREATE_EMPLOYEE_PROFILE_PERMISSIONS } from "../queries/employeeProfileQueries";
// import { toast } from "react-toastify";
// import { GET_EMPLOYEE_PROFILE_PERMISSIONS } from "../queries/getQueries";

// const EmployeeProfileModal = ({
//   setIsOpen,
//   companyId,
//   profileId,
// }: {
//   setIsOpen: (open: boolean) => void;
//   companyId: string;
//   profileId: string;
// }) => {
//   const [employeeData, setEmployeeData] = useState({
//     id: "",
//     personalInfo: false,
//     taxWithholdings: false,
//     directDepositEdit: false,
//   });
//   const { data } = useQuery(GET_EMPLOYEE_PROFILE_PERMISSIONS, {
//     variables: {
//       profileId: parseInt(profileId),
//     },
//     skip: !profileId,
//     fetchPolicy: "network-only",
//   });

//   console.log("employeeData", data);

//   const [createEmployeeProfilePermissions, { loading, error }] = useMutation(
//     CREATE_EMPLOYEE_PROFILE_PERMISSIONS,
//   );

//   const handleSubmit = async () => {
//     if (employeeData.id) {
//     } else {
//       const employeeProfile = {
//         personalInfo: employeeData.personalInfo,
//         taxWithholdings: employeeData.taxWithholdings,
//         directDepositEdit: employeeData.directDepositEdit,
//         companyId,
//         profileId,
//       };
//       try {
//         await createEmployeeProfilePermissions({
//           variables: { employeeProfile },
//         });
//         console.log("Profile settings saved:", employeeProfile);
//         setIsOpen(false);
//         toast.success("Employee Profile Saved Successfully");
//       } catch (err) {
//         console.error("Failed to save profile permissions:", err);
//       }
//     }
//   };

//   return (
//     <div className="w-full max-w-2xl rounded-lg bg-white p-6">
//       <div className="mb-6">
//         <p className="text-sm leading-relaxed text-gray-600">
//           Let employees edit their info in Workforce.
//           <br />
//           We'll send you an email when any changes are made.
//         </p>
//       </div>

//       <div className="space-y-6">
//         {/* Personal Information */}
//         <div className="flex items-center justify-between">
//           <label className="flex cursor-pointer items-center space-x-3">
//             <input
//               type="checkbox"
//               checked={employeeData.personalInfo}
//               onChange={(e) =>
//                 setEmployeeData({
//                   ...employeeData,
//                   personalInfo: e.target.checked,
//                 })
//               }
//               className="form-checkbox h-5 w-5"
//             />
//             <span className="text-sm leading-relaxed text-gray-700">
//               Personal (legal name, birth date, gender, address, emergency
//               contact, profile photo)
//             </span>
//           </label>
//           <span
//             className={`text-sm font-medium ${employeeData.personalInfo ? "text-gray-900" : "text-gray-400"}`}
//           >
//             {employeeData.personalInfo ? "On" : "Off"}
//           </span>
//         </div>

//         {/* Tax Withholdings */}
//         <div className="flex items-center justify-between">
//           <label className="flex cursor-pointer items-center space-x-3">
//             <input
//               type="checkbox"
//               checked={employeeData.taxWithholdings}
//               onChange={(e) =>
//                 setEmployeeData({
//                   ...employeeData,
//                   taxWithholdings: e.target.checked,
//                 })
//               }
//               className="form-checkbox h-5 w-5 text-green-600"
//             />
//             <span className="text-sm text-gray-700">Tax withholdings</span>
//           </label>
//           <span
//             className={`text-sm font-medium ${employeeData.taxWithholdings ? "text-gray-900" : "text-gray-400"}`}
//           >
//             {employeeData.taxWithholdings ? "On" : "Off"}
//           </span>
//         </div>

//         {/* Direct Deposit Information */}
//         <div className="flex items-center justify-between">
//           <label className="flex cursor-pointer items-center space-x-3">
//             <input
//               type="checkbox"
//               checked={employeeData.directDepositEdit}
//               onChange={(e) =>
//                 setEmployeeData({
//                   ...employeeData,
//                   directDepositEdit: e.target.checked,
//                 })
//               }
//               className="form-checkbox h-5 w-5 text-green-600"
//             />
//             <span className="text-sm leading-relaxed text-gray-700">
//               Allow employee to edit direct deposit information
//             </span>
//           </label>
//           <span
//             className={`text-sm font-medium ${employeeData.directDepositEdit ? "text-gray-900" : "text-gray-400"}`}
//           >
//             {employeeData.directDepositEdit ? "On" : "Off"}
//           </span>
//         </div>
//       </div>

//       {/* Action buttons */}
//       <div className="mt-8 flex space-x-3">
//         <button
//           onClick={() => setIsOpen(false)}
//           className="rounded-md border border-accent_soft_black px-6 py-2 font-medium text-accent_soft_black transition-colors hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={handleSubmit}
//           className="rounded-md bg-accent_soft_black px-6 py-2 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//           disabled={loading}
//         >
//           {loading ? "Saving..." : "Save"}
//         </button>
//       </div>
//       {error && (
//         <div className="mt-2 text-sm text-red-500">
//           Failed to save settings. Please try again.
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeProfileModal;
