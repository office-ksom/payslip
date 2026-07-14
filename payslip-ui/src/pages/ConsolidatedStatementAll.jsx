import React, { useState } from 'react';
import { Table, Loader2, Eye, EyeOff } from 'lucide-react';
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
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [activeTab, setActiveTab] = useState('gross');

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
    } catch {
      return 0;
    }
  };

  const getEmployeeMonthlyDetails = (emp_id, monthYearStr, earnings, deductions, arrears, surrender, festival, supplementaryEarnings = [], supplementaryDeductions = []) => {
    const e = earnings.find(x => x.emp_id === emp_id && x.month_year === monthYearStr);
    const isLocked = e && e.is_approved === 1;
    const d = deductions.find(x => x.emp_id === emp_id && x.month_year === monthYearStr) || {};

    const se = supplementaryEarnings.find(x => x.emp_id === emp_id && x.month_year === monthYearStr);
    const isSupApproved = !!se;
    const sd = supplementaryDeductions.find(x => x.emp_id === emp_id && x.month_year === monthYearStr) || {};

    const empArrears = arrears.filter(x => x.emp_id === emp_id && x.bill_date && x.bill_date.substring(0, 7) === monthYearStr);
    const empSurrender = surrender.filter(x => x.emp_id === emp_id && x.bill_date && x.bill_date.substring(0, 7) === monthYearStr);
    const empFestival = festival.filter(x => x.emp_id === emp_id && x.bill_date && x.bill_date.substring(0, 7) === monthYearStr);

    const hasApprovedBill = isLocked || isSupApproved || empSurrender.length > 0 || empArrears.length > 0 || empFestival.length > 0;

    const arrearAmt = hasApprovedBill ? empArrears.reduce((sum, curr) => sum + Math.round(parseFloat(curr.arrear_amount) || 0), 0) : 0;
    const arrearIT = hasApprovedBill ? empArrears.reduce((sum, curr) => sum + Math.round(parseFloat(curr.income_tax) || 0), 0) : 0;
    const surrenderAmt = hasApprovedBill ? empSurrender.reduce((sum, curr) => sum + Math.round(parseFloat(curr.total_amount) || 0), 0) : 0;
    const festivalAmt = hasApprovedBill ? empFestival.reduce((sum, curr) => sum + Math.round(parseFloat(curr.amount) || 0), 0) : 0;

    const basic = (isLocked ? Math.round(parseFloat(e.basic_pay) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(se.basic_pay) || 0) : 0);
    const da = (isLocked ? Math.round((parseFloat(e.da_state) || 0) + (parseFloat(e.da_ugc) || 0)) : 0) + (isSupApproved ? Math.round((parseFloat(se.da_state) || 0) + (parseFloat(se.da_ugc) || 0)) : 0);
    const hra = (isLocked ? Math.round((parseFloat(e.hra_state) || 0) + (parseFloat(e.hra_ugc) || 0)) : 0) + (isSupApproved ? Math.round((parseFloat(se.hra_state) || 0) + (parseFloat(se.hra_ugc) || 0)) : 0);
    const dpgp = (isLocked ? Math.round(parseFloat(e.dp_gp) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(se.dp_gp) || 0) : 0);
    const cca = (isLocked ? Math.round(parseFloat(e.cca) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(se.cca) || 0) : 0);
    const spl = (isLocked ? Math.round((parseFloat(e.spl_pay) || 0) + (parseFloat(e.spl_allow) || 0)) : 0) + (isSupApproved ? Math.round((parseFloat(se.spl_pay) || 0) + (parseFloat(se.spl_allow) || 0)) : 0);
    const tr = (isLocked ? Math.round(parseFloat(e.tr_allow) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(se.tr_allow) || 0) : 0);
    const otherEarn = (isLocked ? Math.round(parseFloat(e.other_earnings) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(se.other_earnings) || 0) : 0);

    const gross_regular = hasApprovedBill ? (basic + dpgp + da + hra + spl + cca + tr + otherEarn) : 0;

    const epf = (isLocked ? Math.round(parseFloat(d.epf) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(sd.epf) || 0) : 0);
    const cpf = (isLocked ? Math.round(parseFloat(d.cpf) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(sd.cpf) || 0) : 0);
    const it = (isLocked ? Math.round(parseFloat(d.income_tax) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(sd.income_tax) || 0) : 0);
    const pt = (isLocked ? Math.round(parseFloat(d.professional_tax) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(sd.professional_tax) || 0) : 0);
    const sli = (isLocked ? Math.round(parseFloat(d.sli) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(sd.sli) || 0) : 0);
    const gis = (isLocked ? Math.round(parseFloat(d.gis) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(sd.gis) || 0) : 0);
    const lic = (isLocked ? Math.round(parseFloat(d.lic) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(sd.lic) || 0) : 0);
    const adv = (isLocked ? Math.round(parseFloat(d.onam_advance) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(sd.onam_advance) || 0) : 0);
    const hrRec = (isLocked ? Math.round(parseFloat(d.hra_recovery) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(sd.hra_recovery) || 0) : 0);
    const otherDed = (isLocked ? Math.round(parseFloat(d.other_deductions) || 0) : 0) + (isSupApproved ? Math.round(parseFloat(sd.other_deductions) || 0) : 0);

    const totDed_regular = hasApprovedBill ? (epf + cpf + it + pt + sli + gis + lic + adv + hrRec + otherDed) : 0;
    const net_regular = hasApprovedBill ? (gross_regular - totDed_regular) : null;
    const tds_regular = hasApprovedBill ? it : null;

    const gross_regular_val = hasApprovedBill ? gross_regular : null;
    const arrears_gross = hasApprovedBill && arrearAmt > 0 ? arrearAmt : null;
    const arrears_it = hasApprovedBill && arrearIT > 0 ? arrearIT : null;
    const arrears_net = hasApprovedBill && arrearAmt > 0 ? (arrearAmt - arrears_it) : null;
    const surrender_net = hasApprovedBill && surrenderAmt > 0 ? surrenderAmt : null;
    const festival_net = hasApprovedBill && festivalAmt > 0 ? festivalAmt : null;

    const epf_val = hasApprovedBill ? epf : null;
    const sli_val = hasApprovedBill ? sli : null;
    const gis_val = hasApprovedBill ? gis : null;
    const gpais_val = hasApprovedBill ? (
      (isLocked ? getGPAIS(d.other_deductions_breakdown) : 0) +
      (isSupApproved ? getGPAIS(sd.other_deductions_breakdown) : 0)
    ) : null;

    return {
      gross_regular: gross_regular_val,
      net_regular,
      tds_regular,
      arrears_gross,
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

  const handlePreview = async () => {
    if (previewData) {
      setPreviewData(null);
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/reports/consolidated-all?fy=${fy}`);
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setPreviewData(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load preview: " + err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const getPreviewContent = () => {
    if (!previewData) return null;
    const { employees, earnings, deductions, arrears, surrender, festival, supplementaryEarnings = [], supplementaryDeductions = [] } = previewData;

    const months = [];
    for (let i = 3; i <= 14; i++) {
      const m = i > 12 ? i - 12 : i;
      const y = i > 12 ? fy + 1 : fy;
      months.push(`${y}-${String(m).padStart(2, '0')}`);
    }

    const getFormattedDateString = (i) => {
      const m = i + 4 > 12 ? i + 4 - 12 : i + 4;
      const y = i + 4 > 12 ? fy + 1 : fy;
      const shortMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
      return `${shortMonth}-${String(y).slice(-2)}`;
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

    const cols = [];
    for (let i = 0; i < 12; i++) {
      const monthStr = months[i];
      const formattedDate = getFormattedDateString(i);

      if (activeTab === 'gross') {
        cols.push({
          header: formattedDate,
          monthStr,
          key: 'gross_regular'
        });

        if (monthHasArrears(monthStr)) {
          cols.push({
            header: `Arrears\n(${formattedDate})`,
            monthStr,
            key: 'arrears_gross'
          });
        }

        if (monthHasSurrender(monthStr)) {
          cols.push({
            header: `Surrender\n(${formattedDate})`,
            monthStr,
            key: 'surrender_net'
          });
        }

        if (monthHasFestival(monthStr)) {
          cols.push({
            header: `Festival Allowance\n(${formattedDate})`,
            monthStr,
            key: 'festival_net'
          });
        }
      } else if (activeTab === 'tds') {
        cols.push({
          header: formattedDate,
          monthStr,
          key: 'tds_regular'
        });

        if (monthHasArrearIT(monthStr)) {
          cols.push({
            header: `Arrear IT\n(${formattedDate})`,
            monthStr,
            key: 'arrears_it'
          });
        }
      } else {
        cols.push({
          header: formattedDate,
          monthStr,
          key: activeTab
        });
      }
    }

    const rows = employees.map((emp, index) => {
      let rowSum = 0;
      const cellValues = cols.map(col => {
        const stats = getEmployeeMonthlyDetails(emp.emp_id, col.monthStr, earnings, deductions, arrears, surrender, festival, supplementaryEarnings, supplementaryDeductions);
        const cellVal = stats[col.key];
        const numericVal = cellVal !== null && cellVal !== undefined ? Math.round(parseFloat(cellVal) || 0) : 0;
        rowSum += numericVal;
        return cellVal;
      });

      return {
        slNo: index + 1,
        name: (emp.title ? `${emp.title} ` : '') + emp.name,
        empId: emp.emp_id,
        cellValues,
        total: rowSum
      };
    });

    const colTotals = cols.map((col, colIdx) => {
      return rows.reduce((sum, row) => {
        const cellVal = row.cellValues[colIdx];
        const val = cellVal !== null && cellVal !== undefined ? Math.round(parseFloat(cellVal) || 0) : 0;
        return sum + val;
      }, 0);
    });

    const grandTotal = colTotals.reduce((sum, val) => sum + val, 0);

    return { cols, rows, colTotals, grandTotal };
  };

  const generateExcelAll = async (reportData, fyStart) => {
    const workbook = new ExcelJS.Workbook();
    const { employees, earnings, deductions, arrears, surrender, festival, supplementaryEarnings = [], supplementaryDeductions = [] } = reportData;
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

        if (typeKey === 'gross') {
          cols.push({
            header: displayDate,
            width: 12.71,
            numFmt: 'mmm-yy',
            isDateHeader: true,
            monthStr,
            key: 'gross_regular'
          });

          if (monthHasArrears(monthStr)) {
            cols.push({
              header: `Arrears\n(${formattedDate})`,
              width: 14,
              isDateHeader: false,
              monthStr,
              key: 'arrears_gross'
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
          const stats = getEmployeeMonthlyDetails(
            emp.emp_id,
            colDef.monthStr,
            earnings,
            deductions,
            arrears,
            surrender,
            festival,
            supplementaryEarnings,
            supplementaryDeductions
          );
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
      totalRow.getCell(2).font = { name: 'Book Antiqua', size: 9, bold: true };
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

    // Sheet 1: Gross Salary [FY]
    generateSheet(
      `Gross Salary ${fyStart}-${fyStart + 1}`,
      `Gross Salary Details for the FY ${fyStart} -${fyStart + 1}`,
      null,
      'gross',
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
            disabled={loading || previewLoading}
            style={{ flex: 1, backgroundColor: 'var(--color-success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Table size={18} />}
            Download Consolidated Excel Workbook
          </button>
          <button
            className="btn btn-secondary"
            onClick={handlePreview}
            disabled={loading || previewLoading}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {previewLoading && <Loader2 className="animate-spin" size={18} />}
            {!previewLoading && previewData && <EyeOff size={18} />}
            {!previewLoading && !previewData && <Eye size={18} />}
            {previewData ? "Hide Preview" : "Preview Statements"}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {previewData && (() => {
        const preview = getPreviewContent();
        if (!preview) return null;
        return (
          <div className="card" style={{ marginTop: '2rem', animation: 'fadeIn var(--transition-normal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                  Statement Preview (FY {fy}-{ (fy + 1).toString().slice(-2) })
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Showing calculations for active employees. Select tabs below to switch statements.
                </p>
              </div>
              
              <button 
                className="btn" 
                onClick={() => setPreviewData(null)} 
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              >
                Hide Preview
              </button>
            </div>

            {/* Tab selector */}
            <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--color-bg-primary)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1.5rem', overflowX: 'auto' }}>
              {[
                { key: 'gross', label: 'Gross Salary' },
                { key: 'tds', label: 'TDS' },
                { key: 'epf', label: 'EPF' },
                { key: 'sli', label: 'SLI' },
                { key: 'gis', label: 'GIS' },
                { key: 'gpais', label: 'GPAIS' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="btn"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: activeTab === tab.key ? 'var(--color-accent-primary)' : 'transparent',
                    color: activeTab === tab.key ? '#fff' : 'var(--color-text-secondary)',
                    boxShadow: activeTab === tab.key ? '0 2px 4px rgba(59,130,246,0.2)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="table-container" style={{ overflowX: 'auto', maxHeight: '600px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-primary)' }}>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)', textAlign: 'center', width: '60px' }}>Sl. No.</th>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)', textAlign: 'left', minWidth: '200px', position: 'sticky', left: 0, backgroundColor: 'var(--color-bg-secondary)', zIndex: 1 }}>Employee Name</th>
                    {preview.cols.map((col, idx) => (
                      <th 
                        key={idx} 
                        style={{ 
                          padding: '0.75rem', 
                          borderBottom: '2px solid var(--color-border)', 
                          color: activeTab === 'gross' ? 'var(--color-success)' : 'var(--color-warning)', 
                          textAlign: 'center', 
                          minWidth: '100px',
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {col.header}
                      </th>
                    ))}
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--color-border)', color: 'var(--color-accent-primary)', textAlign: 'center', minWidth: '120px', fontWeight: 'bold' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={row.empId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{row.slNo}</td>
                      <td style={{ padding: '0.75rem', fontWeight: '500', position: 'sticky', left: 0, backgroundColor: 'var(--color-bg-secondary)', zIndex: 1 }}>{row.name}</td>
                      {row.cellValues.map((val, cIdx) => (
                        <td key={cIdx} style={{ padding: '0.75rem', textAlign: 'center', color: val !== null && val !== undefined ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                          {val !== null && val !== undefined ? Math.round(parseFloat(val) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                        </td>
                      ))}
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-accent-primary)' }}>
                        {row.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', fontWeight: 'bold', borderTop: '2px solid var(--color-border)' }}>
                    <td></td>
                    <td style={{ padding: '0.75rem', position: 'sticky', left: 0, backgroundColor: 'var(--color-bg-secondary)', zIndex: 1, color: 'var(--color-text-primary)' }}>TOTAL</td>
                    {preview.colTotals.map((tot, idx) => (
                      <td key={idx} style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--color-text-primary)' }}>
                        {tot.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    ))}
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--color-accent-primary)' }}>
                      {preview.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

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
