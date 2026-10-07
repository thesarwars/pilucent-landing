import { useCallback } from 'react';

const usePrintData = (selectedData: any) => {
  const printSelectedData = useCallback(() => {
    if (selectedData.length === 0) {
      alert("No Data Selected for Print");
      return;
    }

    const printWindow = window.open("", "", "height=620,width=870");
    if (printWindow) {
      printWindow.document.write("<html><head><title>Print</title>");
      printWindow.document.write('</head><body style="font-family: sans-serif;">');
      printWindow.document.write('<h1 style="text-align:center; margin-bottom:16px;">Print Preview"</h1>');
      printWindow.document.write('<table border="1" style="border-collapse: collapse; width: 100%; text-align: center;">');
      printWindow.document.write("<thead><tr>");

      // Dynamically create table headers based on the keys of the first data object
      const headers = Object.keys(selectedData[0]);
      headers.forEach(header => {
        printWindow.document.write(`<th style="padding: 10px;">${header.toUpperCase()}</th>`); // Add padding to header cells
       });

      printWindow.document.write("</tr></thead>");
      printWindow.document.write("<tbody>");

      // Add rows for selected data
      selectedData.forEach((row: any) => {
        printWindow.document.write("<tr>");
        headers.forEach(header => {
          printWindow.document.write(`<td style="padding: 10px;">${row[header]}</td>`); // Add padding to data cells
        });
        printWindow.document.write("</tr>");
      });

      printWindow.document.write("</tbody></table>");
      printWindow.document.write("</body></html>");

      // Finalize and trigger the print dialog
      printWindow.document.close();
      printWindow.print();
    }
  }, [selectedData]);

  return { printSelectedData };
};

export default usePrintData;
