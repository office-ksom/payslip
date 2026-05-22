const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const xlsxPath = 'D:\\KSOM\\Website\\Web Apps\\Payslip\\Salary_deductions-format.xlsx';
const outputPath = path.join(__dirname, 'details.txt');

async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);

  let out = '';

  workbook.eachSheet((sheet, id) => {
    out += `\n======================================================\n`;
    out += `SHEET [${id}]: ${sheet.name}\n`;
    out += `======================================================\n`;

    // Columns info
    out += '--- Column Widths ---\n';
    const widths = [];
    for (let i = 1; i <= 20; i++) {
      const col = sheet.getColumn(i);
      widths.push(`Col ${i} (${String.fromCharCode(64 + i)}): width=${col.width}`);
    }
    out += widths.join(', ') + '\n';

    // Merges
    out += '--- Merged Cells ---\n';
    if (sheet.model.merges) {
      out += sheet.model.merges.join(', ') + '\n';
    } else {
      out += 'None\n';
    }

    // Rows
    out += '--- Row Details ---\n';
    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      // Dump headers and first couple of employees, and the totals row
      const isHeader = rowNumber <= 4;
      const isTotal = rowNumber === sheet.rowCount || (row.getCell(2).value && row.getCell(2).value.toString().toUpperCase() === 'TOTAL');
      const isFirstEmp = rowNumber === 5;
      
      if (!isHeader && !isTotal && !isFirstEmp) {
        return;
      }
      
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
        
        const font = cell.font ? `font:${cell.font.name || ''}/${cell.font.size || ''}${cell.font.bold ? '/bold' : ''}${cell.font.italic ? '/italic' : ''}` : 'font:none';
        const alignment = cell.alignment ? `align:${cell.alignment.horizontal || ''}/${cell.alignment.vertical || ''}/wrap:${cell.alignment.wrapText || ''}` : 'align:none';
        const border = cell.border ? `border:${JSON.stringify(cell.border)}` : 'border:none';
        const numFmt = cell.numFmt ? `fmt:${cell.numFmt}` : 'fmt:none';

        rowInfo.push(`${colLetter}:${cellVal} (${font} ${alignment} ${border} ${numFmt})`);
      });
      out += `Row ${rowNumber} (height: ${row.height}): ${rowInfo.join(' | ')}\n`;
    });
  });

  fs.writeFileSync(outputPath, out, 'utf8');
  console.log(`Saved output to ${outputPath}`);
}

main().catch(console.error);
