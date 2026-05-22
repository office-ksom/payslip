const XLSX = require('xlsx');
const path = require('path');

const xlsPath = 'D:\\KSOM\\Website\\Web Apps\\Payslip\\Salary_deductions-format.xls';

try {
  const workbook = XLSX.readFile(xlsPath);
  console.log('Sheets in workbook:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    // Convert to JSON / 2D array
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`Number of rows: ${data.length}`);
    // Print first 15 rows to see layout and headers
    data.slice(0, 15).forEach((row, i) => {
      console.log(`Row ${i + 1}:`, row);
    });
  });
} catch (err) {
  console.error('Error reading excel file:', err);
}
