const ExcelJS = require('../payslip-ui/node_modules/exceljs');
const fs = require('fs');
const path = require('path');

// Mock data matching the new dynamic column logic
const mockData = {
  employees: [
    { emp_id: 'E001', title: 'Dr.', name: 'Alice Smith', sort_order: 1 },
    { emp_id: 'E002', title: 'Prof.', name: 'Bob Jones', sort_order: 2 }
  ],
  earnings: [
    { emp_id: 'E001', month_year: '2026-03', basic_pay: 50000, da_state: 1000, da_ugc: 2000, hra_state: 500, hra_ugc: 500, is_approved: 1 },
    { emp_id: 'E001', month_year: '2026-04', basic_pay: 50000, da_state: 1000, da_ugc: 2000, hra_state: 500, hra_ugc: 500, is_approved: 1 },
    { emp_id: 'E001', month_year: '2026-08', basic_pay: 50000, da_state: 1000, da_ugc: 2000, hra_state: 500, hra_ugc: 500, is_approved: 1 },
    { emp_id: 'E002', month_year: '2026-03', basic_pay: 60000, da_state: 1200, da_ugc: 2400, hra_state: 600, hra_ugc: 600, is_approved: 1 }
  ],
  deductions: [
    { emp_id: 'E001', month_year: '2026-03', epf: 1500, income_tax: 2000, sli: 200, gis: 100, other_deductions_breakdown: JSON.stringify([{ desc: 'GPAIS recovery', amount: 50 }]) }
  ],
  arrears: [
    { emp_id: 'E001', bill_date: '2026-03-15', arrear_amount: 10000, income_tax: 1500, net_amount: 8500, is_approved: 1 }
  ],
  surrender: [
    { emp_id: 'E001', bill_date: '2026-03-20', total_amount: 15000, is_approved: 1 }
  ],
  festival: [
    { emp_id: 'E001', bill_date: '2026-08-10', amount: 5000, is_approved: 1 }
  ]
};

async function testGeneration() {
  const workbook = new ExcelJS.Workbook();
  const { employees, earnings, deductions, arrears, surrender, festival } = mockData;
  const fyStart = 2026;
  const fyDisplay = `2026-27`;

  // 12 months array (March of fyStart to February of fyStart+1)
  const months = [];
  for (let i = 3; i <= 14; i++) {
    const m = i > 12 ? i - 12 : i;
    const y = i > 12 ? fyStart + 1 : fyStart;
    months.push(`${y}-${String(m).padStart(2, '0')}`);
  }

  // Header dates for display (April of fyStart to March of fyStart+1)
  const headerDates = [];
  for (let i = 4; i <= 15; i++) {
    const m = i > 12 ? i - 12 : i;
    const y = i > 12 ? fyStart + 1 : fyStart;
    headerDates.push(new Date(Date.UTC(y, m - 1, 1)));
  }

  const thinBorder = {
    top: { style: 'thin', color: { indexed: 64 } },
    left: { style: 'thin', color: { indexed: 64 } },
    bottom: { style: 'thin', color: { indexed: 64 } },
    right: { style: 'thin', color: { indexed: 64 } }
  };

  const valFmt = (v) => Math.round(parseFloat(v) || 0);

  const getGPAIS = (otherDeductionsBreakdown) => {
    if (!otherDeductionsBreakdown) return 0;
    try {
      const breakdown = typeof otherDeductionsBreakdown === 'string'
        ? JSON.parse(otherDeductionsBreakdown)
        : otherDeductionsBreakdown;
      if (!Array.isArray(breakdown)) return 0;
      return breakdown.reduce((sum, item) => {
        if (item && item.desc && item.desc.toLowerCase().includes('gpais')) {
          return sum + Math.round(parseFloat(item.amount) || 0);
        }
        return sum;
      }, 0);
    } catch (e) {
      return 0;
    }
  };

  const getColLetter = (colIdx) => {
    let temp = colIdx;
    let letter = '';
    while (temp > 0) {
      let modulo = (temp - 1) % 26;
      letter = String.fromCharCode(65 + modulo) + letter;
      temp = Math.floor((temp - modulo) / 26);
    }
    return letter;
  };

  const monthHasArrears = (monthStr) => {
    return arrears.some(x => x.bill_date && x.bill_date.substring(0, 7) === monthStr && Math.round(parseFloat(x.arrear_amount) || 0) > 0);
  };

  const monthHasArrearIT = (monthStr) => {
    return arrears.some(x => x.bill_date && x.bill_date.substring(0, 7) === monthStr && Math.round(parseFloat(x.income_tax) || 0) > 0);
  };

  const monthHasSurrender = (monthStr) => {
    return surrender.some(x => x.bill_date && x.bill_date.substring(0, 7) === monthStr && Math.round(parseFloat(x.total_amount) || 0) > 0);
  };

  const monthHasFestival = (monthStr) => {
    return festival.some(x => x.bill_date && x.bill_date.substring(0, 7) === monthStr && Math.round(parseFloat(x.amount) || 0) > 0);
  };

  const getEmployeeMonthlyDetails = (emp_id, monthYearStr) => {
    const e = earnings.find(x => x.emp_id === emp_id && x.month_year === monthYearStr);
    const isLocked = e && e.is_approved === 1;
    const d = deductions.find(x => x.emp_id === emp_id && x.month_year === monthYearStr) || {};

    const empArrears = arrears.filter(x => x.emp_id === emp_id && x.bill_date && x.bill_date.substring(0, 7) === monthYearStr);
    const arrearAmt = empArrears.reduce((sum, curr) => sum + valFmt(curr.arrear_amount), 0);
    const arrearIT = empArrears.reduce((sum, curr) => sum + valFmt(curr.income_tax), 0);

    const empSurrender = surrender.filter(x => x.emp_id === emp_id && x.bill_date && x.bill_date.substring(0, 7) === monthYearStr);
    const surrenderAmt = empSurrender.reduce((sum, curr) => sum + valFmt(curr.total_amount), 0);

    const empFestival = festival.filter(x => x.emp_id === emp_id && x.bill_date && x.bill_date.substring(0, 7) === monthYearStr);
    const festivalAmt = empFestival.reduce((sum, curr) => sum + valFmt(curr.amount), 0);

    const basic = isLocked ? Math.round(parseFloat(e.basic_pay) || 0) : 0;
    const da = isLocked ? Math.round((parseFloat(e.da_state) || 0) + (parseFloat(e.da_ugc) || 0)) : 0;
    const hra = isLocked ? Math.round((parseFloat(e.hra_state) || 0) + (parseFloat(e.hra_ugc) || 0)) : 0;
    const dpgp = isLocked ? Math.round(parseFloat(e.dp_gp) || 0) : 0;
    const cca = isLocked ? Math.round(parseFloat(e.cca) || 0) : 0;
    const spl = isLocked ? Math.round((parseFloat(e.spl_pay) || 0) + (parseFloat(e.spl_allow) || 0)) : 0;
    const tr = isLocked ? Math.round(parseFloat(e.tr_allow) || 0) : 0;
    const otherEarn = isLocked ? Math.round(parseFloat(e.other_earnings) || 0) : 0;

    const gross_regular = basic + dpgp + da + hra + spl + cca + tr + otherEarn;

    const epf = isLocked ? Math.round(parseFloat(d.epf) || 0) : 0;
    const cpf = isLocked ? Math.round(parseFloat(d.cpf) || 0) : 0;
    const it = isLocked ? Math.round(parseFloat(d.income_tax) || 0) : 0;
    const pt = isLocked ? Math.round(parseFloat(d.professional_tax) || 0) : 0;
    const sli = isLocked ? Math.round(parseFloat(d.sli) || 0) : 0;
    const gis = isLocked ? Math.round(parseFloat(d.gis) || 0) : 0;
    const lic = isLocked ? Math.round(parseFloat(d.lic) || 0) : 0;
    const adv = isLocked ? Math.round(parseFloat(d.onam_advance) || 0) : 0;
    const hrRec = isLocked ? Math.round(parseFloat(d.hra_recovery) || 0) : 0;
    const otherDed = isLocked ? Math.round(parseFloat(d.other_deductions) || 0) : 0;

    const totDed_regular = epf + cpf + it + pt + sli + gis + lic + adv + hrRec + otherDed;
    const net_regular = isLocked ? (gross_regular - totDed_regular) : null;
    const tds_regular = isLocked ? it : null;

    const arrears_net = isLocked && arrearAmt > 0 ? (arrearAmt - arrearIT) : null;
    const arrears_it = isLocked && arrearIT > 0 ? arrearIT : null;
    const surrender_net = isLocked && surrenderAmt > 0 ? surrenderAmt : null;
    const festival_net = isLocked && festivalAmt > 0 ? festivalAmt : null;

    const epf_val = isLocked ? epf : null;
    const sli_val = isLocked ? sli : null;
    const gis_val = isLocked ? gis : null;
    const gpais_val = isLocked ? getGPAIS(d.other_deductions_breakdown) : null;

    return {
      net_regular,
      tds_regular,
      arrears_net,
      arrears_it,
      surrender_net,
      festival_net,
      epf: epf_val,
      sli: sli_val,
      gis: gis_val,
      gpais: gpais_val
    };
  };

  const buildSheetColumns = (typeKey, secondColHeader) => {
    const cols = [
      { header: 'Sl. No.', width: 7.29, isDateHeader: false, isMeta: true },
      { header: secondColHeader, width: 25.14, isDateHeader: false, isMeta: true }
    ];

    const getFormattedDateString = (i) => {
      const m = i + 4 > 12 ? i + 4 - 12 : i + 4;
      const y = i + 4 > 12 ? fyStart + 1 : fyStart;
      const shortMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
      return `${shortMonth}-${String(y).slice(-2)}`;
    };

    for (let i = 0; i < 12; i++) {
      const monthStr = months[i];
      const displayDate = headerDates[i];
      const formattedDate = getFormattedDateString(i);

      if (typeKey === 'net') {
        cols.push({
          header: displayDate,
          width: 12.71,
          numFmt: 'mmm-yy',
          isDateHeader: true,
          monthStr,
          key: 'net_regular'
        });

        if (monthHasArrears(monthStr)) {
          cols.push({
            header: `Arrears\n(${formattedDate})`,
            width: 14,
            isDateHeader: false,
            monthStr,
            key: 'arrears_net'
          });
        }

        if (monthHasSurrender(monthStr)) {
          cols.push({
            header: `Surrender\n(${formattedDate})`,
            width: 14,
            isDateHeader: false,
            monthStr,
            key: 'surrender_net'
          });
        }

        if (monthHasFestival(monthStr)) {
          cols.push({
            header: `Festival Allowance\n(${formattedDate})`,
            width: 16,
            isDateHeader: false,
            monthStr,
            key: 'festival_net'
          });
        }
      } else if (typeKey === 'tds') {
        cols.push({
          header: displayDate,
          width: 12.71,
          numFmt: 'mmm-yy',
          isDateHeader: true,
          monthStr,
          key: 'tds_regular'
        });

        if (monthHasArrearIT(monthStr)) {
          cols.push({
            header: `Arrear IT\n(${formattedDate})`,
            width: 14,
            isDateHeader: false,
            monthStr,
            key: 'arrears_it'
          });
        }
      } else {
        cols.push({
          header: displayDate,
          width: 12.71,
          numFmt: 'mmm-yy',
          isDateHeader: true,
          monthStr,
          key: typeKey
        });
      }
    }

    cols.push({ header: 'Total', width: 14, isDateHeader: false, isTotal: true });
    return cols;
  };

  const generateSheet = (sheetName, mainTitle, subTitle, typeKey, secondColHeader) => {
    const sheet = workbook.addWorksheet(sheetName);
    const cols = buildSheetColumns(typeKey, secondColHeader);

    for (let i = 0; i < cols.length; i++) {
      sheet.getColumn(i + 1).width = cols[i].width;
    }

    let headerRowIndex = 2;
    let dataRowStartIndex = 3;

    if (subTitle) {
      sheet.getRow(1).height = 17.25;
      sheet.mergeCells(1, 1, 1, cols.length);
      const r1 = sheet.getCell(1, 1);
      r1.value = mainTitle;
      r1.font = { name: 'Book Antiqua', size: 11 };
      r1.alignment = { horizontal: 'center', vertical: 'middle' };

      sheet.getRow(2).height = 17.25;
      sheet.mergeCells(2, 1, 2, cols.length);
      const r2 = sheet.getCell(2, 1);
      r2.value = subTitle;
      r2.font = { name: 'Book Antiqua', size: 13 };
      r2.alignment = { horizontal: 'center', vertical: 'middle' };
      for (let c = 1; c <= cols.length; c++) {
        sheet.getCell(2, c).border = { bottom: { style: 'thin', color: { indexed: 64 } } };
      }

      headerRowIndex = 3;
      dataRowStartIndex = 4;
    } else {
      sheet.getRow(1).height = 17.25;
      sheet.mergeCells(1, 1, 1, cols.length);
      const r1 = sheet.getCell(1, 1);
      r1.value = mainTitle;
      r1.font = { name: 'Book Antiqua', size: 13 };
      r1.alignment = { horizontal: 'center', vertical: 'middle' };
    }

    sheet.getRow(headerRowIndex).height = 49.5;
    const hRow = sheet.getRow(headerRowIndex);

    for (let c = 1; c <= cols.length; c++) {
      const colDef = cols[c - 1];
      const cell = hRow.getCell(c);
      cell.value = colDef.header;
      if (colDef.isDateHeader) {
        cell.numFmt = colDef.numFmt;
      }
      cell.border = thinBorder;
      if (colDef.isTotal) {
        cell.font = { name: 'Book Antiqua', size: 11, bold: true, italic: true };
      } else {
        cell.font = { name: 'Book Antiqua', size: 11 };
      }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    }

    const colSums = {};
    let currentRowIndex = dataRowStartIndex;
    employees.forEach((emp, index) => {
      const row = sheet.getRow(currentRowIndex);
      row.getCell(1).value = index + 1;
      row.getCell(1).font = { name: 'Book Antiqua', size: 11 };
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(1).border = thinBorder;

      row.getCell(2).value = (emp.title ? `${emp.title} ` : '') + emp.name;
      row.getCell(2).font = { name: 'Book Antiqua', size: 11 };
      row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
      row.getCell(2).border = thinBorder;

      let rowSum = 0;
      for (let c = 3; c < cols.length; c++) {
        const colDef = cols[c - 1];
        const stats = getEmployeeMonthlyDetails(emp.emp_id, colDef.monthStr);
        const cellVal = stats[colDef.key];

        const cell = row.getCell(c);
        cell.value = cellVal;
        cell.font = { name: 'Book Antiqua', size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = thinBorder;
        cell.numFmt = '0.00';

        if (cellVal !== null && cellVal !== undefined) {
          const val = Math.round(parseFloat(cellVal) || 0);
          rowSum += val;
          colSums[c] = (colSums[c] || 0) + val;
        }
      }

      const totalCell = row.getCell(cols.length);
      const colStartLetter = getColLetter(3);
      const colEndLetter = getColLetter(cols.length - 1);
      totalCell.value = {
        formula: `=SUM(${colStartLetter}${currentRowIndex}:${colEndLetter}${currentRowIndex})`,
        result: rowSum
      };
      totalCell.font = { name: 'Book Antiqua', size: 11 };
      totalCell.alignment = { horizontal: 'center', vertical: 'middle' };
      totalCell.border = thinBorder;
      totalCell.numFmt = '0.00';

      colSums[cols.length] = (colSums[cols.length] || 0) + rowSum;
      currentRowIndex++;
    });

    const totalRow = sheet.getRow(currentRowIndex);
    totalRow.getCell(2).value = 'TOTAL';
    totalRow.getCell(2).font = { name: 'Book Antiqua', size: 9 };
    totalRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
    totalRow.getCell(2).border = thinBorder;
    totalRow.getCell(1).border = thinBorder;

    for (let c = 3; c <= cols.length; c++) {
      const cell = totalRow.getCell(c);
      const colLetter = getColLetter(c);
      cell.value = {
        formula: `=SUM(${colLetter}${dataRowStartIndex}:${colLetter}${currentRowIndex - 1})`,
        result: colSums[c] || 0
      };
      cell.font = { name: 'Book Antiqua', size: 12, bold: true, italic: true };
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.border = thinBorder;
      cell.numFmt = '0.00';
    }
  };

  await generateSheet(`Salary 2026-2027`, `Salary Details for the FY 2026 -2027`, null, 'net', ' Name /\r\nPayment recived in the month');
  await generateSheet('TDS', 'Kerala School of Mathematics', `Tax Deducted for the FY 2026 -2027 `, 'tds', ' Name /\r\nTDS from the salary received in.');
  await generateSheet('EPF', 'Kerala School of Mathematics', `EPF Deducted for the FY 2026 -2027`, 'epf', ' Name /\r\nEPF recovery from the salary received in.');
  await generateSheet('SLI', 'Kerala School of Mathematics', `SLI Deducted for the FY 2026 -2027`, 'sli', ' Name /\r\nSLI deducted from the salary received in.');
  await generateSheet('GIS', 'Kerala School of Mathematics', `GIS Deducted for the FY 2026 -2027`, 'gis', ' Name /\r\nGIS deducted from the salary received in.');
  await generateSheet('GPAIS', 'Kerala School of Mathematics', `GPAIS Deducted for the FY 2026 -2027`, 'gpais', ' Name /\r\nGPAIS deducted from the salary received in.');

  const outPath = path.join(__dirname, 'test_consolidated_validation.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log('Saved test workbook to:', outPath);

  // Read back and validate
  const rbWorkbook = new ExcelJS.Workbook();
  await rbWorkbook.xlsx.readFile(outPath);

  console.log('\n================ PROGRAMMATIC STYLING AND STRUCTURE VALIDATION ================');
  
  // Rule 1: Sheet names check
  const sheetNames = rbWorkbook.worksheets.map(w => w.name);
  console.log('1. Sheet names present:', sheetNames);
  const expectedSheets = ['Salary 2026-2027', 'TDS', 'EPF', 'SLI', 'GIS', 'GPAIS'];
  const sheetsOk = expectedSheets.every(s => sheetNames.includes(s));
  console.log('   Sheet names match expected:', sheetsOk ? 'PASS' : 'FAIL');

  // Validate Sheet 1 dynamic columns and styles
  const salSheet = rbWorkbook.getWorksheet('Salary 2026-2027');
  
  // Rule 2: Title is size 13 normal (not bold) and merged across all columns (18 columns)
  const title1Cell = salSheet.getCell('A1');
  const title1Font = title1Cell.font || {};
  console.log('2. Salary Title font:', title1Font);
  const title1Ok = title1Font.name === 'Book Antiqua' && title1Font.size === 13 && !title1Font.bold && !title1Font.italic;
  console.log('   Salary Title size 13 normal check:', title1Ok ? 'PASS' : 'FAIL');

  // Rule 3: Row total cell is size 11 normal (no bold/italic) in last column (18, i.e. R)
  // Alice is at row 3 (header is row 2)
  const dataRowTotalCell = salSheet.getCell('R3');
  const dataRowTotalFont = dataRowTotalCell.font || {};
  console.log('3. Data row total font:', dataRowTotalFont);
  const dataRowTotalOk = dataRowTotalFont.name === 'Book Antiqua' && dataRowTotalFont.size === 11 && !dataRowTotalFont.bold && !dataRowTotalFont.italic;
  console.log('   Data row total cell font check:', dataRowTotalOk ? 'PASS' : 'FAIL');

  // Rule 4: Row total formula check in R3
  const formulaValue = dataRowTotalCell.value;
  console.log('4. Data row total formula in R3:', formulaValue);
  // Total sum for Alice net pay should be:
  // Apr-received regular net (2026-03 salary: 50000+1000+2000+500+500 - 1500-2000-200-100 = 50200)
  // + Apr-received arrears net (8500) + Apr-received surrender net (15000)
  // + May-received regular net (2026-04: 50000+1000+2000+500+500 = 54000, no ded)
  // + Sep-received festival allowance (5000)
  // = 50200 + 8500 + 15000 + 54000 + 5000 = 132700 ... but Bob also has Apr salary
  // Actually: Alice has months 2026-03, 2026-04, 2026-08 all approved.
  // 2026-03 → Apr col: net = 50200, arrears = 8500, surrender = 15000
  // 2026-04 → May col: net = 54000 (50000+1000+2000+500+500, no ded)
  // 2026-08 → Sep col: net = 54000, festival = 5000
  // Row total = 50200 + 8500 + 15000 + 54000 + 54000 + 5000 = 186700
  const formulaOk = formulaValue && formulaValue.formula === '=SUM(C3:Q3)' && formulaValue.result === 186700;
  console.log('   Data row total formula check (=SUM(C3:Q3) with result 186700):', formulaOk ? 'PASS' : 'FAIL');

  // Rule 5: Column Widths check for dynamic widths
  // Cols are Sl. No. (7.29), Name (25.14), Apr-26 (12.71), Arrears (14), Surrender (14), May-26 (12.71), ..., Total (14)
  const widths = [];
  for (let i = 1; i <= 18; i++) {
    widths.push(salSheet.getColumn(i).width);
  }
  console.log('5. Column Widths check for Salary sheet:', widths);
  const expectedWidths = [7.29, 25.14, 12.71, 14, 14, 12.71, 12.71, 12.71, 12.71, 12.71, 16, 12.71, 12.71, 12.71, 12.71, 12.71, 12.71, 14];
  const widthsOk = widths.every((w, idx) => Math.abs(w - expectedWidths[idx]) < 0.05);
  console.log('   Column Widths match expected:', widthsOk ? 'PASS' : 'FAIL');

  // Validate Sheet 2 (TDS) subtitle and bottom border of merged A2 to P2 (16 columns)
  const tdsSheet = rbWorkbook.getWorksheet('TDS');
  const r1Tds = tdsSheet.getCell('A1');
  const r2Tds = tdsSheet.getCell('A2');
  console.log('6. TDS sheet title font (R1):', r1Tds.font);
  console.log('   TDS sheet subtitle font (R2):', r2Tds.font);
  const tdsTitleOk = r1Tds.font.size === 11 && r2Tds.font.size === 13 && !r2Tds.font.bold;
  console.log('   TDS title size check:', tdsTitleOk ? 'PASS' : 'FAIL');

  // Check border for each cell from A2 to P2
  let bordersOk = true;
  for (let c = 1; c <= 16; c++) {
    const border = tdsSheet.getCell(2, c).border || {};
    if (!border.bottom || border.bottom.style !== 'thin') {
      bordersOk = false;
    }
  }
  console.log('7. TDS merged subtitle (Row 2 A2:P2) bottom borders check:', bordersOk ? 'PASS' : 'FAIL');

  // Validate bottom TOTAL row monthly cells' alignment
  const totalRowIndex = 5; // Alice, Bob + 3 header/title rows = row 5 is TOTAL
  const totalCellAlignment = salSheet.getCell(totalRowIndex, 3).alignment || {};
  console.log('8. TOTAL row cell C5 alignment:', totalCellAlignment);
  const alignmentOk = totalCellAlignment.horizontal === 'right' && totalCellAlignment.vertical === 'middle';
  console.log('   TOTAL row alignment check (right/middle):', alignmentOk ? 'PASS' : 'FAIL');

  // Validate GPAIS parsing
  const gpaisSheet = rbWorkbook.getWorksheet('GPAIS');
  const gpaisVal = gpaisSheet.getCell('C4').value; // Alice GPAIS for Apr (2026-04 received)
  console.log('9. GPAIS value for Alice in April (received month):', gpaisVal);
  const gpaisOk = gpaisVal === 50;
  console.log('   GPAIS parsed check:', gpaisOk ? 'PASS' : 'FAIL');

  // Validate EPF math and cells
  const salVal = salSheet.getCell('C3').value; // Alice Net Salary for April (received month)
  console.log('10. Net salary value for Alice in April (received month):', salVal);
  const mathOk = salVal === 50200;
  console.log('   Math net salary check:', mathOk ? 'PASS' : 'FAIL');

  // Validate dynamic column values
  const arrearsVal = salSheet.getCell('D3').value; // Alice Net Arrears in April (received month)
  const surrenderVal = salSheet.getCell('E3').value; // Alice Net Surrender in April (received month)
  const festivalVal = salSheet.getCell('K3').value; // Alice Festival Allowance in September (received month)
  console.log('11. Arrears Net value (D3):', arrearsVal);
  console.log('    Surrender Net value (E3):', surrenderVal);
  console.log('    Festival Allowance Net value (K3):', festivalVal);
  const dynamicValOk = arrearsVal === 8500 && surrenderVal === 15000 && festivalVal === 5000;
  console.log('    Dynamic values check:', dynamicValOk ? 'PASS' : 'FAIL');

  // Validate pre-calculated bottom column total cell values
  const bottomTotalCell = salSheet.getCell(totalRowIndex, 3); // April total received column cell
  const bottomTotalValue = bottomTotalCell.value;
  console.log('12. Bottom TOTAL cell value in C5:', bottomTotalValue);
  // Column C = Apr-received (salary of 2026-03).
  // Alice 2026-03 net = 50200 (approved), Bob 2026-03 net = 60000+1200+2400+600+600 = 64800 (approved, no ded)
  // Column C total = 50200 + 64800 = 115000
  // Formula should be =SUM(C3:C4) (rows 3 and 4 are Alice and Bob, data starts at row 3 for Salary sheet which has no subtitle)
  const bottomTotalOk = bottomTotalValue && bottomTotalValue.formula === '=SUM(C3:C4)' && bottomTotalValue.result === 115000;
  console.log('    Bottom column total formula and result check:', bottomTotalOk ? 'PASS' : 'FAIL');

  // Final status
  if (sheetsOk && title1Ok && dataRowTotalOk && formulaOk && widthsOk && tdsTitleOk && bordersOk && alignmentOk && gpaisOk && mathOk && dynamicValOk && bottomTotalOk) {
    console.log('\n>>> SUCCESS: ALL EXCEL VALIDATION CHECKS PASSED SUCCESSFULLY! <<<');
  } else {
    console.log('\n>>> ERROR: SOME VALIDATION CHECKS FAILED! <<<');
  }
}

testGeneration().catch(console.error);
