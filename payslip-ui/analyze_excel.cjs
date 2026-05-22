const ExcelJS = require('exceljs');

async function checkFormats() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('D:\\KSOM\\Website\\Web Apps\\Payslip\\Salary_deductions-format.xlsx');
  
  const sheet = wb.worksheets[0];
  console.log("C2 (April header date) numFmt:", sheet.getCell('C2').numFmt);
  console.log("C3 (April first employee data) numFmt:", sheet.getCell('C3').numFmt);
  console.log("O3 (Total first employee data) numFmt:", sheet.getCell('O3').numFmt);
  console.log("C13 (April TOTAL column) numFmt:", sheet.getCell('C13').numFmt);
  console.log("O13 (TOTAL of TOTALS) numFmt:", sheet.getCell('O13').numFmt);
}

checkFormats().catch(console.error);
