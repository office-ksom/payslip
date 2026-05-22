const ExcelJS = require('../payslip-ui/node_modules/exceljs');

async function inspect() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('D:\\KSOM\\Website\\Web Apps\\Payslip\\Salary_deductions-format.xlsx');
  
  console.log("Sheet names:", wb.worksheets.map(w => w.name));
  
  const sheet = wb.worksheets[0];
  console.log(`\n--- Styling details for first sheet: ${sheet.name} ---`);
  
  // Row 1 Title
  const r1 = sheet.getRow(1);
  const c1 = r1.getCell(1);
  console.log("Row 1, Cell 1 (Title):");
  console.log("  Value:", c1.value);
  console.log("  Font:", c1.font);
  console.log("  Alignment:", c1.alignment);
  
  // Row 2 Headers
  const r2 = sheet.getRow(2);
  console.log("Row 2 (Headers):");
  for (let col = 1; col <= 15; col++) {
    const cell = r2.getCell(col);
    console.log(`  Col ${col} (${cell.value}): font=${JSON.stringify(cell.font)} alignment=${JSON.stringify(cell.alignment)} width=${sheet.getColumn(col).width}`);
  }
  
  // Row 3 (First data row)
  const r3 = sheet.getRow(3);
  console.log("Row 3 (First Data Row):");
  console.log("  Col 1 (Sl. No.) font:", r3.getCell(1).font, "alignment:", r3.getCell(1).alignment, "border:", JSON.stringify(r3.getCell(1).border));
  console.log("  Col 2 (Name) font:", r3.getCell(2).font, "alignment:", r3.getCell(2).alignment, "border:", JSON.stringify(r3.getCell(2).border));
  console.log("  Col 3 (April) font:", r3.getCell(3).font, "alignment:", r3.getCell(3).alignment, "border:", JSON.stringify(r3.getCell(3).border));
  
  // Row 13 (Total row)
  const r13 = sheet.getRow(13);
  console.log("Row 13 (Total Row):");
  console.log("  Col 2 (TOTAL) value:", r13.getCell(2).value, "font:", r13.getCell(2).font, "border:", JSON.stringify(r13.getCell(2).border));
  console.log("  Col 3 (April total) value:", r13.getCell(3).value, "font:", r13.getCell(3).font, "border:", JSON.stringify(r13.getCell(3).border));
  
  // Sheet 2: TDS
  const sheet2 = wb.worksheets[1];
  console.log(`\n--- Styling details for second sheet: ${sheet2.name} ---`);
  console.log("Row 1, Cell 1 (KSoM):", sheet2.getRow(1).getCell(1).value, sheet2.getRow(1).getCell(1).font);
  console.log("Row 2, Cell 1 (Title):", sheet2.getRow(2).getCell(1).value, sheet2.getRow(2).getCell(1).font);
  console.log("Row 3, Cell 1 (Header Sl.No.):", sheet2.getRow(3).getCell(1).value, sheet2.getRow(3).getCell(1).font);
  console.log("Row 4, Cell 1 (First data row Sl.No.):", sheet2.getRow(4).getCell(1).value, sheet2.getRow(4).getCell(1).font);
}

inspect().catch(console.error);
