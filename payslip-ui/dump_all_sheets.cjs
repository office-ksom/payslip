const XLSX = require('xlsx');

const xlsPath = 'D:\\KSOM\\Website\\Web Apps\\Payslip\\Salary_deductions-format.xlsx';

try {
  const workbook = XLSX.readFile(xlsPath);
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n======================================================`);
    console.log(`SHEET: ${sheetName}`);
    console.log(`======================================================`);
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    rows.forEach((row, i) => {
      // Print row only if it has some non-empty elements
      if (row.length > 0) {
        console.log(`Row ${i + 1}:`, JSON.stringify(row));
      }
    });
  });
} catch (err) {
  console.error(err);
}
