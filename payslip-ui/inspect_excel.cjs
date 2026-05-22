const XLSX = require('xlsx');

const xlsPath = 'D:\\KSOM\\Website\\Web Apps\\Payslip\\Salary_deductions-format.xlsx';

try {
  const workbook = XLSX.readFile(xlsPath);
  console.log('Sheets in workbook:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`Number of rows: ${data.length}`);
    data.slice(0, 15).forEach((row, i) => {
      console.log(`Row ${i + 1}:`, row);
    });
  });
} catch (err) {
  console.error('Error reading excel file:', err);
}
