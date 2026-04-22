const ExcelJS = require('exceljs');

async function dump() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('D:\\KSOM\\Website\\Web Apps\\Payslip\\pay_bill-format.xlsx');
  const sheet = workbook.worksheets[0];
  
  for (let i = 28; i <= 40; i++) {
    const row = sheet.getRow(i);
    const vals = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      vals[colNumber] = cell.value;
    });
    console.log(`Row ${i}:`, JSON.stringify(vals));
  }
}

dump().catch(console.error);
