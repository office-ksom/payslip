const XLSX = require('xlsx');

const xlsPath = 'D:\\KSOM\\Website\\Web Apps\\Payslip\\Salary_deductions-format.xlsx';

try {
  const workbook = XLSX.readFile(xlsPath);
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n================ Sheet: ${sheetName} ================`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // Print row if it has elements beyond index 1
    data.forEach((row, i) => {
      const hasData = row.slice(2).some(cell => cell !== null && cell !== undefined && cell !== '');
      if (hasData || i < 3) {
        console.log(`Row ${i + 1}:`, JSON.stringify(row));
      }
    });
  });
} catch (err) {
  console.error(err);
}
