

// export const ExcelToJson = (file: any) => {
//   if (file) {
//     const reader = new FileReader();
//     reader.onload = (e: ProgressEvent<FileReader>) => {
//       const data = e.target?.result as string;
//       const workbook = XLSX.read(data, { type: "binary" });
//       const sheetName = workbook.SheetNames[0];
//       const sheet = workbook.Sheets[sheetName];
//       const parsedData: JsonData[] = XLSX.utils.sheet_to_json(sheet);
//       console.log(object);
//       return parsedData;
//     };
//     return reader.readAsBinaryString(file);
//   }
// };
