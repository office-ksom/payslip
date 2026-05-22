import React, { useState } from 'react';
import { Table, Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const ConsolidatedStatementAll = () => {
  const { user } = useOutletContext();
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

  const currentYear = new Date().getFullYear();
  const [fy, setFy] = useState(() => {
    const now = new Date();
    // If before April, default to previous year
    return now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  });

  const [loading, setLoading] = useState(false);

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

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/consolidated-all?fy=${fy}`);
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      await generateExcelAll(data, fy);
    } catch (err) {
      console.error(err);
      alert("Failed to generate report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateExcelAll = async (reportData, fyStart) => {
    const workbook = new ExcelJS.Workbook();
    const { employees, earnings, deductions, arrears, surrender, festival } = reportData;
    const fyDisplay = `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;

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

    // Sheet 1: Salary [FY]
    generateSheet(
      `Salary ${fyStart}-${fyStart + 1}`,
      `Salary Details for the FY ${fyStart} -${fyStart + 1}`,
      null,
      'net',
      ' Name /\r\nPayment received in the month'
    );

    // Sheet 2: TDS
    generateSheet(
      'TDS',
      'Kerala School of Mathematics',
      `Tax Deducted for the FY ${fyStart} -${fyStart + 1} `,
      'tds',
      ' Name /\r\nTDS from the salary received in.'
    );

    // Sheet 3: EPF
    generateSheet(
      'EPF',
      'Kerala School of Mathematics',
      `EPF Deducted for the FY ${fyStart} -${fyStart + 1}`,
      'epf',
      ' Name /\r\nEPF recovery from the salary received in.'
    );

    // Sheet 4: SLI
    generateSheet(
      'SLI',
      'Kerala School of Mathematics',
      `SLI Deducted for the FY ${fyStart} -${fyStart + 1}`,
      'sli',
      ' Name /\r\nSLI deducted from the salary received in.'
    );

    // Sheet 5: GIS
    generateSheet(
      'GIS',
      'Kerala School of Mathematics',
      `GIS Deducted for the FY ${fyStart} -${fyStart + 1}`,
      'gis',
      ' Name /\r\nGIS deducted from the salary received in.'
    );

    // Sheet 6: GPAIS
    generateSheet(
      'GPAIS',
      'Kerala School of Mathematics',
      `GPAIS Deducted for the FY ${fyStart} -${fyStart + 1}`,
      'gpais',
      ' Name /\r\nGPAIS deducted from the salary received in.'
    );

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Consolidated_Salary_Deductions_FY${fyDisplay}.xlsx`);
  };

  if (!isAdmin) {
    return (
      <div>
        <h1>Consolidated FY Statements (All Employees)</h1>
        <div className="card">
          <p style={{ color: 'var(--color-danger)' }}>Access denied. Only administrators are allowed to view this page.</p>
        </div>
      </div>
    );
  }

  const fyOptions = [];
  for (let year = currentYear; year >= 2020; year--) {
    fyOptions.push(year);
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Consolidated FY Statements (All Employees)</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Download a consolidated Excel workbook containing Salary, TDS, EPF, SLI, GIS, and GPAIS statements for all active employees during a financial year.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label className="form-label">Financial Year</label>
          <select className="form-control" value={fy} onChange={(e) => setFy(parseInt(e.target.value))}>
            {fyOptions.map(year => (
              <option key={year} value={year}>{year}-{(year + 1).toString().slice(-2)}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={loading}
            style={{ flex: 1, backgroundColor: 'var(--color-success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Table size={18} />}
            Download Consolidated Excel Workbook
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Export Details</h4>
        <ul style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', paddingLeft: '1.25rem' }}>
          <li>Produces a multi-sheet Excel file: <strong>Salary Details</strong>, <strong>TDS</strong>, <strong>EPF</strong>, <strong>SLI</strong>, <strong>GIS</strong>, and <strong>GPAIS</strong>.</li>
          <li>Data is calculated for the payment received months (April to March), which maps to salary months March to February.</li>
          <li>All amounts are rounded to the nearest integer and formatted with two decimal places (e.g. <code>.00</code>).</li>
          <li>Totals are generated using dynamic Excel formulas (e.g. <code>=SUM(...)</code>) to maintain spreadsheet interactive integrity.</li>
          <li>GPAIS deductions are extracted dynamically from the monthly miscellaneous deduction breakdowns.</li>
        </ul>
      </div>
    </div>
  );
};

export default ConsolidatedStatementAll;
