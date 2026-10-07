// "use client";
// import CustomerImportSteps from "@/components/CustomerImportSteps/CustomerImportSteps";
// import Button from "@/components/ui/RawButton";
// import Label from "@/components/ui/RawLabel";
// import Select from "@/components/ui/Select";
// import { useRouter } from "next/navigation";

// const MapCustomerData = () => {
//   const router = useRouter();

//   return (
//     <div className="font-lexend">
//       <CustomerImportSteps currentStep={2} />

//       <div className="flex justify-center mt-16">
//         <div className="w-[590px] max-w-[590px]">
//           <div className="mb-12">
//             <h3 className="text-lg font-medium text-[#5A607F] ">
//               Column Mapping
//             </h3>
//             <p className="text-sm text-[#5A607F] ">
//               Specify Column Mapping Between Excel Sheet and The list.
//             </p>
//           </div>

//           <div>
//             <div className="flex mb-7 justify-between items-center">
//               <h1 className="text-lg font-medium text-[#131523] ">
//                 List Columns:{" "}
//               </h1>
//               <h1 className=" w-[260px] text-left text-lg font-medium text-[#131523] ">
//                 Excel Columns
//               </h1>
//             </div>
//             <div className="space-y-5">
//               <div className="flex justify-between items-center">
//                 <Label className="block text-sm font-medium text-[#5A607F] ">
//                   Name
//                 </Label>
//                 <Select
//                   className={` mt-2 border text-[#333752] w-[260px]  border-[#A1A7C4] px-6   rounded-lg  h-12 `}
//                   selectName="Abdus shukkur"
//                   // options={["default"]}
//                 />
//               </div>
//               <div className="flex justify-between items-center">
//                 <Label className="block text-sm font-medium text-[#5A607F] ">
//                   Company Name{" "}
//                 </Label>
//                 <Select
//                   className={` mt-2 border text-[#333752] w-[260px]  border-[#A1A7C4] px-6   rounded-lg  h-12 `}
//                   selectName="Jumatechs PVT."
//                   // options={["default"]}
//                 />
//               </div>
//               <div className="flex justify-between items-center">
//                 <Label className="block text-sm font-medium text-[#5A607F] ">
//                   Phone{" "}
//                 </Label>
//                 <Select
//                   className={` mt-2 border text-[#333752] w-[260px]  border-[#A1A7C4] px-6   rounded-lg  h-12 `}
//                   selectName="+18237493"
//                   // options={["default"]}
//                 />
//               </div>
//               <div className="flex justify-between items-center">
//                 <Label className="block text-sm font-medium text-[#5A607F] ">
//                   Currency{" "}
//                 </Label>
//                 <Select
//                   className={` mt-2 border text-[#333752] w-[260px]  border-[#A1A7C4] px-6   rounded-lg  h-12 `}
//                   selectName="USD"
//                   // options={["default", "USD"]}
//                 />
//               </div>
//               <div className="flex justify-between items-center">
//                 <Label className="block text-sm font-medium text-[#5A607F] ">
//                   Open Balance{" "}
//                 </Label>
//                 <Select
//                   className={` mt-2 border text-[#333752] w-[260px]  border-[#A1A7C4] px-6   rounded-lg  h-12 `}
//                   selectName="Open Balance"
//                   // options={["default"]}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex gap-12 justify-center mt-20">
//         <Button
//           type="button"
//           className=" text-[#6A6EF6] border w-36 text-sm font-semibold border-[#6A6EF6]"
//         >
//           Cancel
//         </Button>
//         <Button
//           onClick={() =>
//             router.push(
//               "/dashboard/sales/customers/import_customer/verify_customer"
//             )
//           }
//           type="button"
//           className="bg-[#00035F] font-semibold text-sm w-36 text-white "
//         >
//           Next
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default MapCustomerData;
