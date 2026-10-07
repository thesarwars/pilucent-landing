// import { useState, useEffect } from "react";
// import { CREATE_CONTACT_INFO, UPDATE_CONTACT_INFO } from "../queries/contactQueries";
// import { GET_CONTACT_INFO } from "../queries/getQueries";
// import { toast } from "react-toastify";

// const ContactInfoModal = ({ setIsOpen, companyId, profileId, refetchSettings }: { setIsOpen: (open: boolean) => void, companyId: string, profileId: string, refetchSettings?: () => void }) => {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     businessPhone: "",
//     emailAddress: ""
//   });
//   const { data, loading: loadingQuery, error: errorQuery } = useQuery(GET_CONTACT_INFO, {
//     variables: { profileId: Number(profileId) },
//     skip: !profileId,
//     fetchPolicy: 'network-only',
//   });
//   // Find the contact info from the response
//   const contactData = data?.searchSettings?.items?.find((item: any) =>
//     item.hasOwnProperty('firstName') && item.hasOwnProperty('emailAddress')
//   );
//   const [createContactInfo, { loading: createLoading, error: createError }] = useMutation(CREATE_CONTACT_INFO);
//   const [updateContactInfo, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_CONTACT_INFO);
//   const [profileIdError, setProfileIdError] = useState<string>("");

//   useEffect(() => {
//     if (contactData) {
//       setFormData({
//         firstName: contactData.firstName || "",
//         lastName: contactData.lastName || "",
//         businessPhone: contactData.businessPhone || "",
//         emailAddress: contactData.emailAddress || ""
//       });
//     }
//   }, [contactData]);

//   const handleInputChange = (field: string, value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleSave = async () => {
//     if (!profileId) {
//       setProfileIdError('Profile ID is missing.');
//       toast.error('Profile ID is missing.');
//       return;
//     } else {
//       setProfileIdError("");
//     }
//     const contact = {
//       ...formData,
//       companyId,
//       profileId: Number(profileId)
//     };
//     try {
//       if (contactData && contactData.id) {
//         // Update existing contact info
//         await updateContactInfo({
//           variables: {
//             id: contactData.id,
//             contact: { ...contact, id: contactData.id }
//           }
//         });
//       } else {
//         // Create new contact info
//         await createContactInfo({ variables: { contact } });
//       }
//       toast.success('Contact info saved successfully!');
//       setIsOpen(false);
//       if (refetchSettings) refetchSettings();
//     } catch (err) {
//       console.error('Failed to save contact info:', err);
//     }
//   };

//   return (
//     <div className="p-6 bg-white">
//       {/* Header */}
//       <div className="mb-8">
//         <div className="space-y-4">
//           <h3 className="text-xl font-medium text-gray-900">
//             Who's your payroll contact?
//           </h3>
//           <div className="text-gray-600">
//             <p>This person will receive payroll email reminders and any important forms coming due. Make sure they have access to QuickBooks Online.</p>
//             <button className="text-blue-600 hover:text-blue-800 underline mt-1">
//               Learn more about different roles in payroll.
//             </button>
//           </div>
//         </div>
//       </div>
//       {loadingQuery ? (
//         <div>Loading...</div>
//       ) : errorQuery ? (
//         <div className="text-red-500 text-sm mb-2">Failed to load contact info.</div>
//       ) : (
//         <>
//           {/* Form */}
//           <div className="space-y-6 mb-8">
//             {/* First and Last name row */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 mb-2">
//                   First name
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.firstName}
//                   onChange={(e) => handleInputChange('firstName', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none  focus:ring-accent_soft_black focus:border-accent_soft_black"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 mb-2">
//                   Last name
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.lastName}
//                   onChange={(e) => handleInputChange('lastName', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none  focus:ring-accent_soft_black focus:border-accent_soft_black"
//                 />
//               </div>
//             </div>
//             {/* Business phone and Email row */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 mb-2">
//                   Business phone
//                 </label>
//                 <input
//                   type="tel"
//                   value={formData.businessPhone}
//                   onChange={(e) => handleInputChange('businessPhone', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none  focus:ring-accent_soft_black focus:border-accent_soft_black"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 mb-2">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   value={formData.emailAddress}
//                   onChange={(e) => handleInputChange('emailAddress', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none  focus:ring-accent_soft_black focus:border-accent_soft_black"
//                 />
//               </div>
//             </div>
//           </div>
//           {/* Action buttons */}
//           <div className="flex gap-3">
//             <button
//               onClick={() => setIsOpen(false)}
//               className="px-6 py-2 border-2 border-accent_soft_black text-accent_soft_black rounded font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               className="px-8 py-2 bg-accent_soft_black text-white rounded font-medium"
//               disabled={updateLoading || createLoading}
//             >
//               {(updateLoading || createLoading) ? 'Saving...' : contactData ? 'Update' : 'Save'}
//             </button>
//           </div>
//           {(updateError || createError) && <div className="text-red-500 text-sm mt-2">Failed to save contact info. Please try again.</div>}
//           {profileIdError && <div className="text-red-500 text-sm mt-2">{profileIdError}</div>}
//         </>
//       )}
//     </div>
//   );
// };

// export default ContactInfoModal;