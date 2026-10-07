// Updated useExportExcel Hook
import * as XLSX from 'xlsx';

export const useExportExcel = () => {
  const exportExcel = (data: any[], title: string = 'Exported Data') => {
    if (!data || data.length === 0) {
      alert('No data to export to Excel!');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);

    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_').toLowerCase()}.xlsx`);
  };

  return exportExcel;
};
