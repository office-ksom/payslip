const ExcelJS = require('exceljs');

async function testExport() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('D:\\KSOM\\Website\\Web Apps\\Payslip\\pay_bill-format.xlsx');
  const sheet = workbook.worksheets[0];

  const dataStyle = sheet.getCell('A6').style;

  const maxRows = Math.max(sheet.rowCount, 30);
  for (let i = maxRows; i >= 6; i--) {
    sheet.spliceRows(i, 1);
  }

  let currentRow = 6;
  const values = [null, 1, 'John Doe', 'Professor', '10000-20000', 5000, 1000, 500, 200, 100, 0, 0, 0, 0, 6800];
  const row = sheet.getRow(currentRow);
  values.forEach((val, colIdx) => {
    if (colIdx > 0) {
      const cell = row.getCell(colIdx);
      cell.value = val;
      cell.style = dataStyle;
      if (colIdx === 1) {
        cell.alignment = { ...dataStyle.alignment, horizontal: 'center' };
      } else if (colIdx === 2 || colIdx === 3 || colIdx === 4) {
        cell.alignment = { ...dataStyle.alignment, horizontal: 'left' };
      } else if (colIdx >= 5 && colIdx <= 15) {
        cell.alignment = { ...dataStyle.alignment, horizontal: 'right' };
        cell.numFmt = '0.00';
      }
    }
  });
  row.commit();

  currentRow += 2;
  const bottomRows = [
    ['UGC/CSIR - DA Rate (%) 7th CPC', 50],
    ['State DA (%) 11th Pay', 46],
    ['Gross Pay', 6800]
  ];

  bottomRows.forEach(br => {
    const r = sheet.getRow(currentRow);
    r.getCell(3).value = br[0];
    r.getCell(4).value = br[1];
    r.getCell(3).font = { name: 'Arial Narrow', size: 10, bold: true };
    r.getCell(4).font = { name: 'Arial Narrow', size: 10, bold: true };
    currentRow++;
  });

  await workbook.xlsx.writeFile('D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\test_output2.xlsx');
}

testExport().catch(console.error);
