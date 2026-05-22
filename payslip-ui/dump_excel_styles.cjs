const ExcelJS = require('exceljs');
const path = require('path');

const xlsxPath = 'D:\\KSOM\\Website\\Web Apps\\Payslip\\Salary_deductions-format.xlsx';

async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);

  workbook.eachSheet((sheet, id) => {
    console.log(`\n======================================================`);
    console.log(`SHEET [${id}]: ${sheet.name}`);
    console.log(`======================================================`);

    // Column widths
    console.log('--- Column Widths ---');
    const widths = [];
    for (let i = 1; i <= 20; i++) {
      const col = sheet.getColumn(i);
      if (col.width !== undefined) {
        widths.push(`Col ${i} (${String.fromCharCode(64 + i)}): ${col.width}`);
      }
    }
    console.log(widths.join(', '));

    // Rows inspection
    console.log('--- Rows and Cell Styles ---');
    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber > 15) return; // only first 15 rows
      const rowInfo = [];
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const colLetter = String.fromCharCode(64 + colNumber);
        
        let cellVal = cell.value;
        if (cellVal && typeof cellVal === 'object') {
          if (cellVal.formula) {
            cellVal = `[Formula: ${cellVal.formula}]`;
          } else if (cellVal.richText) {
            cellVal = cellVal.richText.map(t => t.text).join('');
          } else {
            cellVal = JSON.stringify(cellVal);
          }
        }
        
        const font = cell.font ? `${cell.font.name || ''} ${cell.font.size || ''}${cell.font.bold ? ' bold' : ''}${cell.font.italic ? ' italic' : ''}` : '';
        const alignment = cell.alignment ? `align:${cell.alignment.horizontal || ''}/${cell.alignment.vertical || ''}` : '';
        const border = cell.border ? `hasBorder` : '';
        const numFmt = cell.numFmt ? `fmt:${cell.numFmt}` : '';

        rowInfo.push(`${colLetter}:${cellVal} (${font} ${alignment} ${border} ${numFmt})`);
      });
      console.log(`Row ${rowNumber} (height: ${row.height}):`, rowInfo.join(' | '));
    });
  });
}

main().catch(console.error);
