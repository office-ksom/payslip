const XLSX = require('xlsx');

const xlsPath = 'D:\\KSOM\\Website\\Web Apps\\Payslip\\Salary_deductions-format.xlsx';

try {
  const workbook = XLSX.readFile(xlsPath);
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n================ Sheet: ${sheetName} ================`);
    const sheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    // Row 2 is headers, Row 3 is first employee
    console.log('Row 2 (Headers):');
    let headerStr = '';
    for(let c = 0; c <= range.e.c; ++c) {
      const cell = sheet[XLSX.utils.encode_cell({c: c, r: 2})]; // Row 3 in Excel
      const val = cell ? cell.w || cell.v : '';
      headerStr += `[Col ${c}: ${val}] `;
    }
    console.log(headerStr);

    console.log('Row 3 (First Employee - Prof.Ratnakumar.P.K):');
    let empStr = '';
    for(let c = 0; c <= range.e.c; ++c) {
      const cell = sheet[XLSX.utils.encode_cell({c: c, r: 3})]; // Row 4 in Excel
      const val = cell ? cell.w || cell.v : '';
      empStr += `[Col ${c}: ${val}] `;
    }
    console.log(empStr);
    
    // Row 13 is TOTAL
    console.log('Row 13 (TOTAL):');
    let totalStr = '';
    for(let c = 0; c <= range.e.c; ++c) {
      const cell = sheet[XLSX.utils.encode_cell({c: c, r: 12})]; // Row 13 in Excel
      const val = cell ? cell.w || cell.v : '';
      totalStr += `[Col ${c}: ${val}] `;
    }
    console.log(totalStr);
  });
} catch (err) {
  console.error(err);
}
