const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function check() {
  const fp = path.join(__dirname, 'public', 'pay_bill-format.xlsx');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(fp);
  const sheet = wb.worksheets[0];
  
  console.log("B5 (Sl.No.) alignment:", sheet.getCell('B5').style.alignment);
  console.log("N5 (Others) alignment:", sheet.getCell('N5').style.alignment);
}
check();
