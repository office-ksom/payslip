const ExcelJS = require('../payslip-ui/node_modules/exceljs');

async function inspectWorkbook() {
  const filePath = 'D:\\KSOM\\Website\\Web Apps\\Payslip\\Salary_deductions-format.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];
  console.log(`\n--- Worksheet 0: ${sheet.name} ---`);
  for (let i = 1; i <= 10; i++) {
    console.log(`Row ${i}:`, sheet.getRow(i).values.slice(0, 25));
  }
}

inspectWorkbook().catch(console.error);
