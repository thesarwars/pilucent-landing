// import React, { useState, useEffect } from "react";
// import { CREATE_DIRECT_DEPOSIT_OPTIONS, UPDATE_DIRECT_DEPOSIT_OPTIONS } from "../queries/depositQueries";
// import { GET_DIRECT_DEPOSIT_OPTIONS } from "../queries/getQueries";
// import { toast } from "react-toastify";

// const DirectDepositModal = ({ setIsOpen, companyId, profileId, refetchSettings }: { setIsOpen: (open: boolean) => void, companyId: string, profileId: string, refetchSettings?: () => void }) => {
//   const [sameDay, setSameDay] = useState(false);
//   const [fiveDay, setFiveDay] = useState(true);
//   const { data, loading: loadingQuery, error: errorQuery } = useQuery(GET_DIRECT_DEPOSIT_OPTIONS, {
//     variables: { profileId: Number(profileId) },
//     skip: !profileId,
//     fetchPolicy: 'network-only',
//   });
//   // Find the direct deposit settings from the response
//   const directDepositData = data?.searchSettings?.items?.find((item: any) =>
//     item.hasOwnProperty('sameDay')
//   );
//   const [createDirectDepositOptions, { loading: createLoading, error: createError }] = useMutation(CREATE_DIRECT_DEPOSIT_OPTIONS);
//   const [updateDirectDepositOptions, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_DIRECT_DEPOSIT_OPTIONS);

//   useEffect(() => {
//     if (directDepositData) {
//       setSameDay(!!directDepositData.sameDay);
//       setFiveDay(!!directDepositData.fiveDay);
//     }
//   }, [directDepositData]);

//   const handleSelect = (option: "sameDay" | "fiveDay") => {
//     if (option === "sameDay") {
//       setSameDay(true);
//       setFiveDay(false);
//     } else {
//       setSameDay(false);
//       setFiveDay(true);
//     }
//   };

//   const handleSave = async () => {
//     if (!profileId) {
//       toast.error('Profile ID is missing.');
//       return;
//     }
//     const directDeposit = {
//       sameDay,
//       fiveDay,
//       companyId,
//       profileId: Number(profileId)
//     };
//     try {
//       if (directDepositData && directDepositData.id) {
//         // Update existing direct deposit options
//         await updateDirectDepositOptions({
//           variables: {
//             id: directDepositData.id,
//             directDeposit: { ...directDeposit, id: directDepositData.id }
//           }
//         });
//       } else {
//         // Create new direct deposit options
//         await createDirectDepositOptions({ variables: { directDeposit } });
//       }
//       toast.success('Direct deposit options saved successfully!');
//       setIsOpen(false);
//       if (refetchSettings) refetchSettings();
//     } catch (err) {
//       console.error('Failed to save direct deposit options:', err);
//     }
//   };

//   return (
//     <div className="p-6 bg-white">
//       {/* Header */}
//       <div className="mb-6">
//         <h2 className="text-2xl font-medium text-gray-900 mb-1">Direct deposit</h2>
//         <p className="text-gray-600">Funding time</p>
//       </div>
//       {loadingQuery ? (
//         <div>Loading...</div>
//       ) : errorQuery ? (
//         <div className="text-red-500 text-sm mb-2">Failed to load direct deposit options.</div>
//       ) : (
//         <>
//           {/* Content */}
//           <div className="mb-8">
//             <p className="text-gray-700 mb-6">Select an option:</p>
//             <div className="space-y-6">
//               {/* Same-day option */}
//               <label className="flex items-start cursor-pointer">
//                 <input
//                   type="radio"
//                   name="funding-time"
//                   checked={sameDay}
//                   onChange={() => handleSelect("sameDay")}
//                   className="mt-1 h-4 w-4 text-accent_soft_black border-gray-300 focus:ring-accent_soft_black"
//                 />
//                 <div className="ml-3">
//                   <div className="text-gray-700 font-medium mb-1">Same-day</div>
//                   <div className="text-gray-600 text-sm mb-2">
//                     Submit payroll by 5 PM PT the day before payday.
//                   </div>
//                   <div className="text-sm">
//                     <span className="text-gray-600">Need faster funding? </span>
//                     <button className="text-blue-600 hover:text-blue-800 underline">
//                       Request same-day payroll
//                     </button>
//                   </div>
//                 </div>
//               </label>
//               {/* 5-day option */}
//               <label className="flex items-start cursor-pointer">
//                 <input
//                   type="radio"
//                   name="funding-time"
//                   checked={fiveDay}
//                   onChange={() => handleSelect("fiveDay")}
//                   className="mt-1 h-4 w-4 text-accent_soft_black border-gray-300 focus:ring-accent_soft_black"
//                 />
//                 <div className="ml-3">
//                   <div className="text-gray-700 font-medium mb-1">5-day</div>
//                   <div className="text-gray-600 text-sm mb-2">
//                     You'll need to submit your payroll 5 business days before payday.
//                   </div>
//                   <div className="text-gray-600 text-sm">
//                     Funding limits don't apply as long as you have enough funds to cover payroll.
//                   </div>
//                 </div>
//               </label>
//             </div>
//           </div>
//           {/* Action buttons */}
//           <div className="flex gap-3">
//             <button
//               onClick={() => setIsOpen(false)}
//               className="px-6 py-2 border-2 border-accent_soft_black text-accent_soft_black rounded hover:bg-green-50 font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               className="px-8 py-2 bg-accent_soft_black text-white rounded font-medium"
//               disabled={updateLoading || createLoading}
//             >
//               {(updateLoading || createLoading) ? 'Saving...' : directDepositData ? 'Update' : 'Save'}
//             </button>
//           </div>
//           {(updateError || createError) && <div className="text-red-500 text-sm mt-2">Failed to save direct deposit options. Please try again.</div>}
//         </>
//       )}
//     </div>
//   );
// };

// export default DirectDepositModal;
