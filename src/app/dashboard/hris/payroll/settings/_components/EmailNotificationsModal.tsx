// import React, { useEffect, useState } from "react";
// import { ChevronDown } from "lucide-react";
// import Button from "@/components/ui/RawButton";
// import {
//   CREATE_NOTIFICATION_SETTINGS,
//   UPDATE_NOTIFICATION_SETTINGS,
// } from "../queries/notificationQueries";
// import { toast } from "react-toastify";
// import { GET_NOTIFICATION_SETTINGS } from "../queries/getQueries";

// const EmailNotificationsModal = ({
//   setIsOpen,
//   companyId,
//   profileId,
// }: {
//   setIsOpen: (open: boolean) => void;
//   companyId: string;
//   profileId: string;
// }) => {
//   const [emailData, setEmailData] = useState({
//     clientPaydayEmails: false,
//     paydayReminders: false,
//     reminderType: "",
//     taxSetupReminders: false,
//     companyId: companyId,
//     profileId: profileId,
//     id: "",
//   });
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const {
//     data,
//     loading: loadingQuery,
//   } = useQuery(GET_NOTIFICATION_SETTINGS, {
//     variables: { profileId: parseInt(profileId) },
//     skip: !profileId,
//     fetchPolicy: "network-only",
//   });

//   useEffect(() => {
//     if (data?.searchSettings?.items?.[0]?.id && !loadingQuery) {
//       setEmailData({
//         ...emailData,
//         id: data?.searchSettings?.items?.[0]?.id,
//         clientPaydayEmails:
//           data?.searchSettings?.items?.[0]?.clientPaydayEmails,
//         paydayReminders: data?.searchSettings?.items?.[0]?.paydayReminders,
//         reminderType: data?.searchSettings?.items?.[0]?.reminderType,
//         taxSetupReminders: data?.searchSettings?.items?.[0]?.taxSetupReminders,
//       });
//     }
//   }, [data]);

//   const [createNotificationSettings, { loading, error }] = useMutation(
//     CREATE_NOTIFICATION_SETTINGS,
//   );
//   const [
//     updateNotificationSettings,
//     { loading: isUpdating, error: isUpdateErr },
//   ] = useMutation(UPDATE_NOTIFICATION_SETTINGS);

//   const reminderOptions = [
//     "Email only",
//     "SMS only",
//     "Email and SMS",
//     "Push notification",
//   ];

//   const handleSubmit = async () => {
//     if (emailData?.id) {
//       const notification = {
//         id: emailData.id,
//         clientPaydayEmails: emailData.clientPaydayEmails,
//         paydayReminders: emailData.paydayReminders,
//         reminderType: emailData.paydayReminders ? emailData.reminderType : null,
//         taxSetupReminders: emailData.taxSetupReminders,
//       };
//       try {
//         const res = await updateNotificationSettings({
//           variables: { id: emailData.id, notification },
//         });
//         console.log("Settings saved:", notification);
//         setIsOpen(false);
//         toast.success("Notification settings updated!");
//       } catch (err) {
//         console.error("Failed to update notification settings:", err);
//       }
//     } else {
//       const notification = {
//         clientPaydayEmails: emailData.clientPaydayEmails,
//         paydayReminders: emailData.paydayReminders,
//         reminderType: emailData.paydayReminders ? emailData.reminderType : null,
//         taxSetupReminders: emailData.taxSetupReminders,
//         companyId,
//         profileId,
//       };
//       try {
//         const res = await createNotificationSettings({
//           variables: { notification },
//         });
//         console.log("Settings saved:", notification);
//         setIsOpen(false);
//         toast.success("Notification settings saved successfully!");
//       } catch (err) {
//         console.error("Failed to save notification settings:", err);
//       }
//     }
//   };

//   return (
//     <div className="w-full rounded-lg bg-white p-6">
//       <div className="space-y-6">
//         {/* Client's payday emails */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <input
//               type="checkbox"
//               id="client-payday"
//               checked={emailData?.clientPaydayEmails}
//               onChange={(e) =>
//                 setEmailData({
//                   ...emailData,
//                   clientPaydayEmails: e.target.checked,
//                 })
//               }
//               className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//             />
//             <label htmlFor="client-payday" className="text-sm text-gray-700">
//               Client's payday emails
//             </label>
//           </div>
//           <span
//             className={`text-sm ${emailData?.clientPaydayEmails ? "text-green-600" : "text-gray-400"}`}
//           >
//             {emailData?.clientPaydayEmails ? "On" : "Off"}
//           </span>
//         </div>

//         {/* Payday reminders */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <input
//               type="checkbox"
//               id="payday-reminders"
//               checked={emailData.paydayReminders}
//               onChange={(e) =>
//                 setEmailData({
//                   ...emailData,
//                   paydayReminders: e.target.checked,
//                 })
//               }
//               className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//             />
//             <label htmlFor="payday-reminders" className="text-sm text-gray-700">
//               Payday reminders
//             </label>
//           </div>
//           <span
//             className={`text-sm ${emailData.paydayReminders ? "text-green-600" : "text-gray-400"}`}
//           >
//             {emailData.paydayReminders ? "On" : "Off"}
//           </span>
//         </div>

//         {/* Payday reminder type dropdown */}
//         <div className="ml-7">
//           <label className="mb-2 block text-sm text-gray-600">
//             Payday reminder type
//           </label>
//           <div className="relative">
//             <button
//               type="button"
//               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//               disabled={!emailData.paydayReminders}
//               className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
//                 !emailData.paydayReminders
//                   ? "cursor-not-allowed bg-gray-50 text-gray-400"
//                   : "text-gray-700"
//               }`}
//             >
//               <span className="block truncate">
//                 {emailData.reminderType || "Choose a method"}
//               </span>
//               <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
//                 <ChevronDown className="h-4 w-4 text-gray-400" />
//               </span>
//             </button>

//             {isDropdownOpen && emailData.paydayReminders && (
//               <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
//                 {reminderOptions.map((option) => (
//                   <button
//                     key={option}
//                     onClick={() => {
//                       setEmailData({ ...emailData, reminderType: option });
//                       setIsDropdownOpen(false);
//                     }}
//                     className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
//                   >
//                     {option}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           <p className="mt-2 text-xs text-gray-500">
//             For direct deposit, we also send a reminder two business days before
//             the payroll submission date.
//           </p>
//         </div>

//         {/* Tax setup reminders */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <input
//               type="checkbox"
//               id="tax-setup"
//               checked={emailData.taxSetupReminders}
//               onChange={(e) =>
//                 setEmailData({
//                   ...emailData,
//                   taxSetupReminders: e.target.checked,
//                 })
//               }
//               className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//             />
//             <label htmlFor="tax-setup" className="text-sm text-gray-700">
//               Tax setup reminders
//             </label>
//           </div>
//           <span
//             className={`text-sm ${emailData.taxSetupReminders ? "text-green-600" : "text-gray-400"}`}
//           >
//             {emailData.taxSetupReminders ? "On" : "Off"}
//           </span>
//         </div>
//       </div>

//       {/* Action buttons */}
//       <div className="mt-8 flex space-x-3">
//         <Button
//           onClick={() => setIsOpen(false)}
//           className="flex-1 rounded-md border border-accent_soft_black px-4 py-2 text-accent_soft_black transition-colors hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//         >
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           className="flex-1 rounded-md bg-accent_soft_black px-4 py-2 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//           disabled={loading || isUpdating}
//         >
//           {loading || isUpdating ? "Saving..." : "Save"}
//         </Button>
//       </div>
//       {error && (
//         <div className="mt-2 text-sm text-red-500">
//           Failed to save settings. Please try again.
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmailNotificationsModal;
