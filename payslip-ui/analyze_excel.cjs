const ExcelJS = require('exceljs');

async function analyze() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('D:\\KSOM\\Website\\Web Apps\\Payslip\\pay_bill-format.xlsx');
  const sheet = workbook.worksheets[0];
  
  console.log("Columns:");
  for (let i = 1; i <= sheet.columnCount; i++) {
    const col = sheet.getColumn(i);
    console.log(`Col ${i}: width=${col.width}`);
  }
  
  console.log("Row 4 (Headers) styles:");
  const row4 = sheet.getRow(4);
  console.log("Font:", row4.getCell(1).font);
  console.log("Alignment:", row4.getCell(1).alignment);
  console.log("Border:", row4.getCell(1).border);

  console.log("Row 5 (Headers) styles:");
  const row5 = sheet.getRow(5);
  console.log("Font:", row5.getCell(1).font);
  console.log("Alignment:", row5.getCell(1).alignment);
  console.log("Border:", row5.getCell(1).border);

  console.log("Row 6 (Data) styles:");
  const row6 = sheet.getRow(6);
  console.log("Font:", row6.getCell(1).font);
  console.log("Alignment:", row6.getCell(1).alignment);
  console.log("Border:", row6.getCell(1).border);
}

analyze().catch(console.error);
