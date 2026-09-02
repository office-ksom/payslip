import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Download, Loader2, Coins, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const formatMonthYearStr = (myStr) => {
  if (!myStr || !/^\d{4}-\d{2}$/.test(myStr)) return myStr;
  const [year, month] = myStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(month, 10) - 1;
  return (monthIdx >= 0 && monthIdx < 12) ? `${year}-${months[monthIdx]}` : myStr;
};

const getMonthYearLabel = (myStr) => {
  if (!myStr) return { monthLabel: '', year: '' };
  const [yr, mn] = myStr.split('-');
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  const idx = parseInt(mn, 10) - 1;
  return {
    monthLabel: months[idx] || '',
    year: yr || ''
  };
};

const getRowFill = (emp, isDaily) => {
  if (isDaily) {
    return {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFD2D2' } // Mild pink
    };
  }
  const doj = emp.date_of_joining;
  if (!doj) return null;
  
  if (doj < '2014-09-01') {
    return {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2EFDA' } // Mild Green
    };
  } else if (doj >= '2014-09-01' && doj < '2025-08-01') {
    return {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF2CC' } // Mild Yellow
    };
  } else if (doj >= '2025-08-01') {
    return {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2D9F2' } // Mild Purple
    };
  } else {
    return {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE699' } // Mild Orange fallback
    };
  }
};

const getRowPreviewStyle = (emp, isDaily) => {
  if (isDaily) {
    return { backgroundColor: '#FFD2D2' }; // Mild pink
  }
  const doj = emp.date_of_joining;
  if (!doj) return {};
  
  if (doj < '2014-09-01') {
    return { backgroundColor: '#E2EFDA' }; // Mild Green
  } else if (doj >= '2014-09-01' && doj < '2025-08-01') {
    return { backgroundColor: '#FFF2CC' }; // Mild Yellow
  } else if (doj >= '2025-08-01') {
    return { backgroundColor: '#E2D9F2' }; // Mild Purple
  } else {
    return { backgroundColor: '#FFE699' }; // Mild Orange fallback
  }
};

const EPFReports = (props) => {
  const { user: contextUser } = useOutletContext() || {};
  const user = props.user || contextUser;

  // Default to 2026-07 as it contains rich test data
  const [monthYear, setMonthYear] = useState('2026-07');

  const [generating, setGenerating] = useState(false);
  const [generatingRemittance, setGeneratingRemittance] = useState(false);
  const [generatingChallan, setGeneratingChallan] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  
  // Data lists
  const [permanentData, setPermanentData] = useState([]);
  const [rawPermanentData, setRawPermanentData] = useState([]);
  const [dailyWageData, setDailyWageData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Preview visibility & sheet selection
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState('regular'); // 'regular', 'daily', 'combined'
  const [reportType, setReportType] = useState('statement'); // 'statement', 'remittance'

  // Access check
  if (user?.role === 'viewer') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  // Fetch data from API
  const fetchEPFData = async () => {
    setFetching(true);
    setStatus({ type: '', text: '' });
    setDataLoaded(false);
    try {
      const [resPermanent, resDailyWage] = await Promise.all([
        fetch(`/api/epf-entries?month_year=${monthYear}&category=permanent`),
        fetch(`/api/epf-entries?month_year=${monthYear}&category=daily_wage`)
      ]);

      if (!resPermanent.ok || !resDailyWage.ok) {
        throw new Error('Failed to retrieve EPF entries from the server.');
      }

      const rawPerm = await resPermanent.json();
      const rawDaily = await resDailyWage.json();

      const sortFn = (a, b) => {
        const aActive = a.is_active !== undefined ? Number(a.is_active) : 1;
        const bActive = b.is_active !== undefined ? Number(b.is_active) : 1;
        if (aActive !== bActive) return bActive - aActive;
        const sortDiff = (a.sort_order || 0) - (b.sort_order || 0);
        if (sortDiff !== 0) return sortDiff;
        return (a.name || '').localeCompare(b.name || '');
      };

      const sortedRawPerm = (rawPerm || []).sort(sortFn);
      const sortedRawDaily = (rawDaily || []).sort(sortFn);

      setRawPermanentData(sortedRawPerm);

      // Filter: Only employees of appointment type "permanent" in Regular employees list
      const filteredPerm = sortedRawPerm.filter(
        emp => (emp.appointment_type || '').toLowerCase() === 'permanent'
      );

      setPermanentData(filteredPerm);
      setDailyWageData(sortedRawDaily);
      setDataLoaded(true);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: err.message });
    } finally {
      setFetching(false);
    }
  };

  // Fetch data on month change
  useEffect(() => {
    fetchEPFData();
  }, [monthYear]);

  // Excel generation function
  const handleExportEPFStatement = async () => {
    if (!dataLoaded) return;
    setGenerating(true);
    setStatus({ type: '', text: '' });

    try {
      if (permanentData.length === 0 && dailyWageData.length === 0) {
        throw new Error(`No EPF entries found for the selected month ${formatMonthYearStr(monthYear)}.`);
      }

      const workbook = new ExcelJS.Workbook();
      const { monthLabel, year } = getMonthYearLabel(monthYear);

      // Create sheets
      generateSheet(workbook, 'Regular Employees', permanentData.map(e => ({ ...e, is_daily: false })), monthLabel, year);
      generateSheet(workbook, 'Daily Wage employees', dailyWageData.map(e => ({ ...e, is_daily: true })), monthLabel, year);
      
      // Combined list
      const combinedData = [
        ...permanentData.map(e => ({ ...e, is_daily: false })),
        ...dailyWageData.map(e => ({ ...e, is_daily: true }))
      ];
      generateSheet(workbook, 'Regular & Daily Wage Employees', combinedData, monthLabel, year);

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `EPF_Statement_${monthYear}.xlsx`);
      setStatus({ type: 'success', text: 'EPF Statement workbook generated and downloaded!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleExportEPFRemittanceStatement = async () => {
    if (!dataLoaded) return;
    setGeneratingRemittance(true);
    setStatus({ type: '', text: '' });

    try {
      if (rawPermanentData.length === 0) {
        throw new Error(`No EPF entries found for the selected month ${formatMonthYearStr(monthYear)}.`);
      }

      const workbook = new ExcelJS.Workbook();
      const { monthLabel, year } = getMonthYearLabel(monthYear);
      
      const sheet = workbook.addWorksheet('EPF Remittance Stmt', {
        views: [{ showGridLines: true }]
      });

      // Fit to A4 Landscape Page Setup
      sheet.pageSetup = {
        paperSize: 9, // A4 size
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.25,
          right: 0.25,
          top: 0.25,
          bottom: 0.25,
          header: 0.1,
          footer: 0.1
        }
      };

      // Column widths matching the template exactly
      const columnWidths = [
        6.29, 23.0, 26.29, 11.57, 10.43, 10.0, 12.86, 11.43, 
        9.14, 9.29, 13.0, 13.0, 10.0, 2.43, 8.43, 9.29, 
        7.57, 10.0, 11.57, 9.14
      ];
      columnWidths.forEach((width, idx) => {
        sheet.getColumn(idx + 1).width = width;
      });

      // Color definitions based on workbook themes (cached to hex correctly in Excel)
      const fillHeader = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { theme: 2 },
        bgColor: { indexed: 64 }
      };

      const fillTotal = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { theme: 2, tint: -0.0999786370433668 },
        bgColor: { indexed: 64 }
      };

      const fillRemit = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { theme: 0, tint: -0.0499893185216834 },
        bgColor: { indexed: 64 }
      };

      const fillNote = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF92D050' }, // bright lime green
        bgColor: { indexed: 64 }
      };

      const borderThinGrey = {
        top: { style: 'thin', color: { indexed: 64 } },
        bottom: { style: 'thin', color: { indexed: 64 } },
        left: { style: 'thin', color: { indexed: 64 } },
        right: { style: 'thin', color: { indexed: 64 } }
      };

      const alignCenterMiddle = { horizontal: 'center', vertical: 'middle' };

      // Title Row 1 (A1:S1)
      sheet.getRow(1).height = 26.25;
      sheet.getCell('A1').value = 'KERALA SCHOOL OF MATHEMATICS, KOZHIKODE.';
      sheet.mergeCells('A1:S1');
      sheet.getCell('A1').font = { name: 'Calibri', size: 20, bold: true };
      sheet.getCell('A1').alignment = alignCenterMiddle;
      for (let c = 1; c <= 19; c++) {
        sheet.getRow(1).getCell(c).border = borderThinGrey;
      }

      // Title Row 2 (A2:S2)
      sheet.getRow(2).height = 18.75;
      sheet.getCell('A2').value = `Statement of EPF remittance - Employer & Employee Contribution recovered from the salary of the month ${monthLabel.charAt(0) + monthLabel.slice(1).toLowerCase()} ${year}`;
      sheet.mergeCells('A2:S2');
      sheet.getCell('A2').font = { name: 'Calibri', size: 14, bold: true };
      sheet.getCell('A2').alignment = alignCenterMiddle;
      for (let c = 1; c <= 19; c++) {
        sheet.getRow(2).getCell(c).border = borderThinGrey;
      }

      // Merges for header columns
      const merges = [
        'A3:A7', 'B3:B7', 'C3:C7', 'D3:D7', 'E3:E7',
        'F3:M3', 'N3:N22', 'O3:R3', 'S3:S7',
        'F4:G4', 'H4:I4', 'J4:L4', 'M4:M7', 'R4:R7',
        'F6:F7', 'G6:G7', 'H6:H7', 'I6:I7', 'K6:K7',
        'O6:O7', 'P6:P7', 'Q6:Q7'
      ];
      merges.forEach(range => sheet.mergeCells(range));

      // Header Texts
      // Row 3
      sheet.getCell('A3').value = 'Sl.No.';
      sheet.getCell('B3').value = 'Name of Employee';
      sheet.getCell('C3').value = 'Designation';
      sheet.getCell('D3').value = 'Actual Salary -(Basic +DA)';
      sheet.getCell('E3').value = 'PF Salary Threshold (A)';
      sheet.getCell('F3').value = 'Contribution & Remittance  by Employer';
      sheet.getCell('O3').value = 'Employee Contributions';
      sheet.getCell('S3').value = 'Total Remittance to EPFO';

      // Row 4
      sheet.getCell('F4').value = 'PF Contri for the Month (B)';
      sheet.getCell('H4').value = 'Arrears of Contri. (C)';
      sheet.getCell('J4').value = 'Administration Charges for PF Contribution for the month\n(B)';
      sheet.getCell('M4').value = 'Total ER Liability';
      sheet.getCell('O4').value = 'PF Contri for the Month';
      sheet.getCell('P4').value = 'Arrears of Contri';
      sheet.getCell('Q4').value = 'Volunt. Contri';
      sheet.getCell('R4').value = 'Total EE Liability';

      // Row 5
      sheet.getCell('F5').value = 'AC 1';
      sheet.getCell('G5').value = 'AC 10';
      sheet.getCell('H5').value = 'AC 1';
      sheet.getCell('I5').value = 'AC 10';
      sheet.getCell('J5').value = 'AC2';
      sheet.getCell('K5').value = 'AC21';
      sheet.getCell('L5').value = 'AC22';
      sheet.getCell('O5').value = 'AC 1';
      sheet.getCell('P5').value = 'AC 1';
      sheet.getCell('Q5').value = 'AC 1';

      // Row 6
      sheet.getCell('F6').value = 'PF-( Ax3.67%)';
      sheet.getCell('G6').value = 'PFS - (Ax8.33%)\n8.33 % + 1.16 % w.r.to 12% of BP+DA and 15000/-)\nTotal EPS Contribution ';
      sheet.getCell('H6').value = 'PF- (Cx3.67/12)';
      sheet.getCell('I6').value = 'PFS -(Cx 8.33/12)';
      sheet.getCell('J6').value = 'Adm.Ch - (0.50% of Basic + DA)';
      sheet.getCell('K6').value = 'EDLI - (Ax 0.50%)';
      sheet.getCell('L6').value = 'AdCh-EDLI -(Ax 0.01%)';
      sheet.getCell('O6').value = 'PF-12%';
      sheet.getCell('P6').value = '(Entire Amt)';
      sheet.getCell('Q6').value = '(Entire Amt.)';

      // Row 7
      sheet.getCell('J7').value = 'Min.500/Estt.';
      sheet.getCell('L7').value = 'Min.200/Estt.';

      // Apply Header styling
      const fontHeader = { name: 'Calibri', size: 11, bold: true };
      for (let r = 3; r <= 7; r++) {
        sheet.getRow(r).height = r === 6 ? 120.0 : (r === 3 || r === 4 ? 45.0 : (r === 5 ? 22.0 : 30.0));
        for (let c = 1; c <= 20; c++) {
          const cell = sheet.getRow(r).getCell(c);
          if (c === 14) {
            cell.border = borderThinGrey;
            continue;
          }
          if (c <= 19) {
            cell.font = fontHeader;
            cell.fill = fillHeader;
            cell.border = borderThinGrey;
            
            const alignOpts = {};
            if ([1, 2, 3, 4, 5, 13, 14, 18, 19].includes(c)) {
              alignOpts.horizontal = 'center';
              alignOpts.vertical = 'middle';
            } else {
              alignOpts.vertical = 'middle';
              if (r === 3 || r === 4 || r === 6) alignOpts.horizontal = 'center';
            }
            if ([1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19].includes(c)) {
              alignOpts.wrapText = true;
            }
            cell.alignment = alignOpts;
          }
        }
      }

      // Keep exact order returned from the API/backend (same order as in previous report)
      const sortedEmps = rawPermanentData;

      const N = sortedEmps.length;
      const startEmpRow = 8;
      const endEmpRow = 7 + N;
      const totalRow = 8 + N;
      const totalRow2 = 9 + N;

      // Populating employee rows
      sortedEmps.forEach((emp, index) => {
        const r = 8 + index;
        sheet.getRow(r).height = 18.75;
        
        sheet.getCell(`A${r}`).value = index + 1;
        sheet.getCell(`B${r}`).value = emp.name ? String(emp.name).toUpperCase() : '';
        sheet.getCell(`C${r}`).value = emp.designation || '';
        sheet.getCell(`D${r}`).value = emp.wages || 0;
        
        const isDep = emp.appointment_type === 'Deputation';
        
        if (isDep) {
          sheet.getCell(`E${r}`).value = null;
          sheet.getCell(`F${r}`).value = null;
          sheet.getCell(`G${r}`).value = null;
          sheet.getCell(`H${r}`).value = null;
          sheet.getCell(`I${r}`).value = null;
          sheet.getCell(`J${r}`).value = null;
          sheet.getCell(`K${r}`).value = null;
          sheet.getCell(`L${r}`).value = null;
          sheet.getCell(`M${r}`).value = null;
        } else {
          sheet.getCell(`E${r}`).value = emp.epf_wage || 0;
          sheet.getCell(`F${r}`).value = { formula: `=IF(E${r}>0,ROUND(E${r}*12%,0)-G${r},"")` };
          
          const eps_wage = emp.eps_wage || 0;
          const eps_contrib = eps_wage > 0 
            ? Math.round(eps_wage * 0.0833 + Math.max(0, eps_wage - 15000) * 0.0116) 
            : 0;
          sheet.getCell(`G${r}`).value = eps_contrib;
          
          sheet.getCell(`H${r}`).value = 0.00;
          sheet.getCell(`I${r}`).value = 0.00;
          sheet.getCell(`J${r}`).value = { formula: `=IF(E${r}>0,ROUND(E${r}*0.5%,0),"")` };
          sheet.getCell(`K${r}`).value = { formula: `=IF(E${r}>0,ROUND(MIN(E${r},15000)*0.5%,0),"")` };
          sheet.getCell(`L${r}`).value = null;
          sheet.getCell(`M${r}`).value = { formula: `=SUM(F${r}:L${r})` };
        }
        
        sheet.getCell(`N${r}`).value = null;
        sheet.getCell(`O${r}`).value = emp.employee_contribution || 0;
        sheet.getCell(`P${r}`).value = 0.00;
        sheet.getCell(`Q${r}`).value = null;
        sheet.getCell(`R${r}`).value = { formula: `=SUM(O${r}:Q${r})` };
        sheet.getCell(`S${r}`).value = { formula: `=M${r}+R${r}` };
        
        const rowFillColor = getRowFill(emp, false);
        
        for (let c = 1; c <= 20; c++) {
          const cell = sheet.getRow(r).getCell(c);
          cell.font = { name: 'Calibri', size: 11 };
          
          if (c === 1) cell.alignment = { horizontal: 'center', vertical: 'middle' };
          else if (c === 2 || c === 3) cell.alignment = { horizontal: 'left', vertical: 'middle' };
          else cell.alignment = { horizontal: 'right', vertical: 'middle' };
          
          if (c === 14) {
            cell.border = {
              left: { style: 'thin', color: { indexed: 64 } },
              right: { style: 'thin', color: { indexed: 64 } }
            };
          } else if (c <= 19) {
            cell.border = borderThinGrey;
            if (rowFillColor) {
              cell.fill = rowFillColor;
            }
          }
          
          if (c >= 4 && c !== 14) {
            cell.numFmt = '0.00';
          }
        }
      });

      // Total Row 1 (totalRow) & 2 (totalRow2)
      sheet.mergeCells(`A${totalRow}:E${totalRow2}`);
      sheet.getCell(`A${totalRow}`).value = 'TOTAL ';
      sheet.getCell(`A${totalRow}`).font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFC00000' } };
      sheet.getCell(`A${totalRow}`).alignment = alignCenterMiddle;
      
      sheet.getCell(`F${totalRow}`).value = { formula: `=SUM(F8:F${totalRow-1})` };
      sheet.getCell(`G${totalRow}`).value = { formula: `=SUM(G8:G${totalRow-1})` };
      sheet.getCell(`H${totalRow}`).value = { formula: `=SUM(H8:H${totalRow-1})` };
      sheet.getCell(`I${totalRow}`).value = { formula: `=SUM(I8:I${totalRow-1})` };
      sheet.getCell(`J${totalRow}`).value = { formula: `=ROUND(SUM(J8:J${totalRow-1}),0)` };
      sheet.getCell(`K${totalRow}`).value = { formula: `=ROUND(SUM(K8:K${totalRow-1}),0)` };
      
      sheet.getCell(`L${totalRow}`).value = { formula: `=ROUND(SUM(L8:L${totalRow-1}),0)` };
      sheet.mergeCells(`L${totalRow}:L${totalRow2}`);
      sheet.getCell(`L${totalRow}`).alignment = alignCenterMiddle;
      
      sheet.getCell(`M${totalRow}`).value = { formula: `=SUM(M8:M${totalRow-1})` };
      sheet.mergeCells(`M${totalRow}:M${totalRow2}`);
      sheet.getCell(`M${totalRow}`).alignment = alignCenterMiddle;
      
      sheet.getCell(`O${totalRow}`).value = 'TOTAL';
      sheet.mergeCells(`O${totalRow}:Q${totalRow2}`);
      sheet.getCell(`O${totalRow}`).font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFC00000' } };
      sheet.getCell(`O${totalRow}`).alignment = alignCenterMiddle;
      
      sheet.getCell(`R${totalRow}`).value = { formula: `=SUM(R8:R${totalRow-1})` };
      sheet.mergeCells(`R${totalRow}:R${totalRow2}`);
      sheet.getCell(`R${totalRow}`).alignment = alignCenterMiddle;
      
      sheet.getCell(`S${totalRow}`).value = { formula: `=SUM(S8:S${totalRow-1})` };
      sheet.mergeCells(`S${totalRow}:S${totalRow2}`);
      sheet.getCell(`S${totalRow}`).alignment = alignCenterMiddle;
      
      // Total Row 2 formulas
      sheet.getCell(`F${totalRow2}`).value = { formula: `=SUM(F${totalRow}:G${totalRow})` };
      sheet.mergeCells(`F${totalRow2}:G${totalRow2}`);
      
      sheet.getCell(`H${totalRow2}`).value = { formula: `=SUM(H${totalRow}:I${totalRow})` };
      sheet.mergeCells(`H${totalRow2}:I${totalRow2}`);
      
      sheet.getCell(`J${totalRow2}`).value = { formula: `=SUM(J${totalRow}:K${totalRow})` };
      sheet.mergeCells(`J${totalRow2}:K${totalRow2}`);

      for (let r = totalRow; r <= totalRow2; r++) {
        const row = sheet.getRow(r);
        row.height = 15.75;
        for (let c = 1; c <= 19; c++) {
          const cell = row.getCell(c);
          cell.fill = fillTotal;
          if (c === 14) {
            cell.border = {
              left: { style: 'thin', color: { indexed: 64 } },
              right: { style: 'thin', color: { indexed: 64 } }
            };
          } else {
            cell.border = borderThinGrey;
          }
          
          if (![1, 2, 3, 4, 5, 15, 16, 17].includes(c)) {
            cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFC00000' } };
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
            if (c !== 14) {
              cell.numFmt = '0.00';
            }
          }
        }
      }

      // Remittance summary
      const remitRow1 = totalRow + 7;
      const remitRow2 = totalRow + 8;
      const remitTotalRow = totalRow + 9;

      sheet.getRow(remitRow1).height = 28.5;
      sheet.getRow(remitRow2).height = 28.5;
      sheet.getRow(remitTotalRow).height = 28.5;

      sheet.mergeCells(`C${remitRow1}:F${remitRow1}`);
      sheet.getCell(`C${remitRow1}`).value = `EPF Remitance for ${monthLabel} ${year}   `;
      sheet.getCell(`C${remitRow1}`).font = { name: 'Calibri', size: 13, italic: true, color: { theme: 4, tint: -0.5 } };
      sheet.getCell(`C${remitRow1}`).alignment = { horizontal: 'right', vertical: 'middle' };
      
      // Find the row number of the Deputation employee dynamically
      const depRowIndex = sortedEmps.findIndex(emp => emp.appointment_type === 'Deputation');
      const depRow = depRowIndex !== -1 ? (8 + depRowIndex) : 8;

      sheet.getCell(`G${remitRow1}`).value = { formula: `=SUM(O8:O${totalRow-1})-O${depRow}+F${totalRow2}+J${totalRow}+K${totalRow}+L${totalRow}` };
      sheet.getCell(`G${remitRow1}`).font = { name: 'Calibri', size: 13, color: { theme: 4, tint: -0.5 } };
      sheet.getCell(`G${remitRow1}`).alignment = { horizontal: 'left', vertical: 'middle' };
      sheet.getCell(`G${remitRow1}`).numFmt = '0.00';

      sheet.mergeCells(`C${remitRow2}:F${remitRow2}`);
      sheet.getCell(`C${remitRow2}`).value = `EPF Remitance to HRI Allahabad for ${monthLabel} ${year}   `;
      sheet.getCell(`C${remitRow2}`).font = { name: 'Calibri', size: 13, italic: true, color: { theme: 4, tint: -0.5 } };
      sheet.getCell(`C${remitRow2}`).alignment = { horizontal: 'right', vertical: 'middle' };
      
      sheet.getCell(`G${remitRow2}`).value = { formula: `=S${depRow}` };
      sheet.getCell(`G${remitRow2}`).font = { name: 'Calibri', size: 13, color: { theme: 4, tint: -0.5 } };
      sheet.getCell(`G${remitRow2}`).alignment = { horizontal: 'left', vertical: 'middle' };
      sheet.getCell(`G${remitRow2}`).numFmt = '0.00';

      sheet.mergeCells(`C${remitTotalRow}:F${remitTotalRow}`);
      sheet.getCell(`C${remitTotalRow}`).value = 'TOTAL';
      sheet.getCell(`C${remitTotalRow}`).font = { name: 'Calibri', size: 14, bold: true, italic: true, color: { theme: 5, tint: -0.5 } };
      sheet.getCell(`C${remitTotalRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
      
      sheet.getCell(`G${remitTotalRow}`).value = { formula: `=SUM(G${remitRow1}:G${remitRow2})` };
      sheet.getCell(`G${remitTotalRow}`).font = { name: 'Calibri', size: 14, bold: true, color: { theme: 5, tint: -0.5 } };
      sheet.getCell(`G${remitTotalRow}`).alignment = { horizontal: 'left', vertical: 'middle' };
      sheet.getCell(`G${remitTotalRow}`).numFmt = '0.00';

      for (let r = remitRow1; r <= remitTotalRow; r++) {
        for (let c = 3; c <= 7; c++) {
          const cell = sheet.getRow(r).getCell(c);
          cell.fill = fillRemit;
          cell.border = borderThinGrey;
        }
      }

      // Watermark green block
      const remitNoteRow = totalRow + 29;
      for (let r = remitNoteRow; r <= remitNoteRow + 7; r++) {
        sheet.getRow(r).height = 15.0;
      }
      
      sheet.mergeCells(`C${remitNoteRow}:O${remitNoteRow + 7}`);
      const cellNote = sheet.getCell(`C${remitNoteRow}`);
      cellNote.value = 'FROM AUGUST 2025 (01.08.2025) onwards EPF is remitting to Kozhikode EPFO Office';
      cellNote.font = { name: 'Calibri', size: 15, bold: true, color: { theme: 1 } };
      cellNote.alignment = alignCenterMiddle;
      
      for (let r = remitNoteRow; r <= remitNoteRow + 7; r++) {
        for (let c = 3; c <= 15; c++) {
          sheet.getRow(r).getCell(c).fill = fillNote;
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `EPF_Remittance_Statement_${monthYear}.xlsx`);
      setStatus({ type: 'success', text: 'EPF Remittance Statement generated and downloaded!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: err.message });
    } finally {
      setGeneratingRemittance(false);
    }
  };

  const handleExportEPFChallan = async () => {
    if (!dataLoaded) return;
    setGeneratingChallan(true);
    setStatus({ type: '', text: '' });

    try {
      if (permanentData.length === 0 && dailyWageData.length === 0) {
        throw new Error(`No EPF entries found for the selected month ${formatMonthYearStr(monthYear)}.`);
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('EPF Challan', {
        views: [{ showGridLines: true }]
      });

      // Define column widths matching the template exactly
      const columnWidths = [
        20.14, 23.86, 15.43, 12.14, 12.29, 12.71, 24.57, 25.14, 23.86, 10.43, 22.71
      ];
      columnWidths.forEach((width, idx) => {
        sheet.getColumn(idx + 1).width = width;
      });

      // Color definitions
      const fillHeader = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0000FF' }, // pure blue
        bgColor: { indexed: 64 }
      };

      const fontHeader = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      const fontData = { name: 'Arial', size: 10, color: { argb: 'FFFF0000' } };

      // Row heights
      sheet.getRow(1).height = 12.75;

      const headers = [
        'UAN', 'MEMBER NAME', 'GROSS WAGES', 'EPF WAGES', 'EPS WAGES', 'EDLI WAGES',
        'Employee PF Contribution', 'Employer EPS Contribution', 'Employer PF Contribution',
        'NCP DAYS', 'REFUND OF ADVANCES'
      ];

      headers.forEach((h, idx) => {
        const cell = sheet.getRow(1).getCell(idx + 1);
        cell.value = h;
        cell.font = fontHeader;
        cell.fill = fillHeader;
        cell.border = {}; // Borderless
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      });

      // Combine regular (excluding deputation) and daily wage employees
      const challanEmps = [...permanentData, ...dailyWageData];

      challanEmps.forEach((emp, index) => {
        const r = 2 + index;
        sheet.getRow(r).height = 12.75;

        const epf_wage = emp.epf_wage || 0;
        const eps_wage = emp.eps_wage || 0;
        const edli_wages = Math.min(epf_wage, 15000);
        
        // ECR EPS formula
        const eps_contrib = eps_wage > 0 
          ? Math.round(eps_wage * 0.0833 + Math.max(0, eps_wage - 15000) * 0.0116)
          : 0;
          
        // ER diff formula
        const er_pf_contrib = Math.round(epf_wage * 0.12) - eps_contrib;

        sheet.getCell(`A${r}`).value = emp.uan ? String(emp.uan) : '';
        sheet.getCell(`B${r}`).value = emp.name ? String(emp.name).toUpperCase() : '';
        sheet.getCell(`C${r}`).value = emp.wages || 0;
        sheet.getCell(`D${r}`).value = epf_wage;
        sheet.getCell(`E${r}`).value = eps_wage;
        sheet.getCell(`F${r}`).value = edli_wages;
        sheet.getCell(`G${r}`).value = emp.employee_contribution || 0;
        sheet.getCell(`H${r}`).value = eps_contrib;
        sheet.getCell(`I${r}`).value = er_pf_contrib;
        sheet.getCell(`J${r}`).value = 0.0;
        sheet.getCell(`K${r}`).value = 0.0;

        for (let c = 1; c <= 11; c++) {
          const cell = sheet.getRow(r).getCell(c);
          cell.font = fontData;
          cell.border = {}; // Borderless
          
          if (c <= 2) {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          }
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `EPF_Challan_${monthYear}.xlsx`);
      setStatus({ type: 'success', text: 'EPF Challan generated and downloaded!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: err.message });
    } finally {
      setGeneratingChallan(false);
    }
  };

  const generateSheet = (workbook, name, data, monthLabel, year) => {
    const sheet = workbook.addWorksheet(name, {
      views: [{ showGridLines: true }]
    });

    // Fit to A4 Landscape Page Setup
    sheet.pageSetup = {
      paperSize: 9, // A4 size
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.25,
        bottom: 0.25,
        header: 0.1,
        footer: 0.1
      }
    };

    // Column widths matching the template exactly
    const columnWidths = [
      3.86, 13.14, 27.14, 13.14, 9.57, 9.71, 15.86, 
      11.43, 14.86, 14.86, 14.86, 21.43, 16.71, 8.14, 9.43, 13.86
    ];
    columnWidths.forEach((width, idx) => {
      sheet.getColumn(idx + 1).width = width;
    });

    const numEmps = data.length;
    const lastEmpRow = 5 + numEmps;
    const totalRow = lastEmpRow + 1;

    // Formatting borders
    const thinBorderGrey = {
      top: { style: 'thin', color: { indexed: 64 } },
      left: { style: 'thin', color: { indexed: 64 } },
      bottom: { style: 'thin', color: { indexed: 64 } },
      right: { style: 'thin', color: { indexed: 64 } }
    };

    const thinBorderBlack = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    const applyBordersToRow = (rowNum, startCol = 1, endCol = 16) => {
      const row = sheet.getRow(rowNum);
      for (let c = startCol; c <= endCol; c++) {
        // Columns J, L, M, P stand out with black borders, others grey
        if ([10, 12, 13, 16].includes(c)) {
          row.getCell(c).border = thinBorderBlack;
        } else {
          row.getCell(c).border = thinBorderGrey;
        }
      }
    };

    // Color definitions based on workbook themes (cached to hex correctly in Excel)
    const fillRow3 = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { theme: 3, tint: 0.7999816888943144 },
      bgColor: { indexed: 64 }
    };

    const fillRow4 = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { theme: 0, tint: -0.1499984740745262 },
      bgColor: { indexed: 64 }
    };

    const fillRow5 = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { theme: 0, tint: -0.249977111117893 },
      bgColor: { indexed: 64 }
    };

    const fillAdminTable = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { theme: 2 },
      bgColor: { indexed: 64 }
    };

    const fillRemittanceTable = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { theme: 2, tint: -0.0999786370433668 },
      bgColor: { indexed: 64 }
    };

    const fillNonPlan = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { theme: 5, tint: 0.5999938962981048 },
      bgColor: { indexed: 64 }
    };

    // Title Row 1 (B1:P1)
    sheet.getRow(1).height = 21;
    sheet.getCell('B1').value = 'KERALA SCHOOL OF MATHEMATICS, KOZHIKODE';
    sheet.mergeCells('B1:P1');
    const cellB1 = sheet.getCell('B1');
    cellB1.font = { name: 'Calibri', size: 16, bold: true };
    cellB1.alignment = { horizontal: 'center', vertical: 'middle' };

    // Title Row 2 (B2:P2 with black thin bottom border)
    sheet.getRow(2).height = 18.75;
    sheet.getCell('B2').value = `EPF STATEMENT FOR THE MONTH OF ${monthLabel} ${year}`;
    sheet.mergeCells('B2:P2');
    for (let c = 2; c <= 16; c++) {
      sheet.getRow(2).getCell(c).border = { bottom: { style: 'thin', color: { argb: 'FF000000' } } };
    }
    const cellB2 = sheet.getCell('B2');
    cellB2.font = { name: 'Calibri', size: 14, bold: true };
    cellB2.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 3: Numbers 1 to 16 (Starts from A3, columns A to P, with blue fill)
    sheet.getRow(3).height = 18;
    for (let i = 1; i <= 16; i++) {
      const cell = sheet.getRow(3).getCell(i);
      cell.value = i;
      cell.font = { name: 'Calibri', size: 11, bold: true };
      cell.fill = fillRow3;
      cell.border = thinBorderGrey;
      cell.alignment = { horizontal: 'center', vertical: 'top' };
    }

    // Row 4: Column Headers (16 Columns: A to P)
    sheet.getRow(4).height = 120;
    const headers = [
      'NO ', ' UAN No.\r\n', 'Name \r\n', 'Wages \r\n', 'EPF Wages\r\n', 'EPS Wages\r\n',
      'Ceiling limit of EPF for EDLI\r\n', 'Wage Limit for 1.16%\r\ncalculation ONLY\r\n',
      'EPF Employee Contribution.\r\n(EE Contrib)\r\n\r\nTotal EPF Contribution EE Share (A/C 1)',
      'EPF Employer Contribution.\r\n(ER Contrib)\r\n', 'Employer EPS Contribution \r\n',
      'Employer EPS Contribution \r\nremitted (8.33 % + 1.16 % w.r.to 12% of BP+DA and 15000/-)\r\n\r\nTotal EPS Contribution (A/C 10)',
      'Employer EPF-EPS Difference (12%-EPS and 15,000- 3.67%)\r\n\r\n(ER Share A/C 1)',
      'EDLI', 'Admin Charge', 'Total\r\nEE+ER contrib'
    ];
    headers.forEach((h, idx) => {
      const cell = sheet.getRow(4).getCell(idx + 1);
      cell.value = h;
      cell.font = { name: 'Calibri', size: 11, bold: true };
      cell.fill = fillRow4;
      // Header borders
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { indexed: 64 } }
      };
      cell.alignment = { horizontal: idx === 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
    });

    // Row 5: A/C Labels
    sheet.getRow(5).height = 18;
    for (let c = 1; c <= 16; c++) {
      const cell = sheet.getRow(5).getCell(c);
      cell.fill = fillRow5;
      cell.border = thinBorderGrey;
      cell.font = { name: 'Calibri', size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'top' };
    }
    sheet.getCell('I5').value = 'A/C 1';
    sheet.getCell('L5').value = 'A/C 10';
    sheet.getCell('M5').value = 'A/C 1';

    // Employee Data Rows
    data.forEach((emp, i) => {
      const r = 6 + i;
      sheet.getRow(r).height = 18.75;
      applyBordersToRow(r);

      // Color mapping fill
      const rowFill = getRowFill(emp, emp.is_daily);
      if (rowFill) {
        for (let c = 1; c <= 16; c++) {
          sheet.getRow(r).getCell(c).fill = rowFill;
        }
      }

      // A: NO (sequential counter)
      sheet.getCell(`A${r}`).value = i + 1;
      sheet.getCell(`A${r}`).font = { name: 'Times New Roman', size: 11 };
      sheet.getCell(`A${r}`).alignment = { horizontal: 'center', vertical: 'middle' };

      // B: UAN No
      sheet.getCell(`B${r}`).value = emp.uan ? String(emp.uan) : null;
      sheet.getCell(`B${r}`).font = { name: 'Times New Roman', size: 11 };
      sheet.getCell(`B${r}`).alignment = { horizontal: 'center', vertical: 'middle' };

      // C: Name (Uppercase, Full name only)
      sheet.getCell(`C${r}`).value = emp.name ? String(emp.name).toUpperCase() : '';
      sheet.getCell(`C${r}`).font = { name: 'Times New Roman', size: 11 };
      sheet.getCell(`C${r}`).alignment = { horizontal: 'left', vertical: 'middle' };

      // D: Wages (Basic + DA)
      sheet.getCell(`D${r}`).value = emp.wages || 0;
      sheet.getCell(`D${r}`).font = { name: 'Times New Roman', size: 11 };
      sheet.getCell(`D${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`D${r}`).numFmt = '0.00';

      // E: EPF Wages
      sheet.getCell(`E${r}`).value = emp.epf_wage || 0;
      sheet.getCell(`E${r}`).font = { name: 'Times New Roman', size: 11 };
      sheet.getCell(`E${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`E${r}`).numFmt = '0.00';

      // F: EPS Wages
      sheet.getCell(`F${r}`).value = emp.eps_wage || 0;
      sheet.getCell(`F${r}`).font = { name: 'Times New Roman', size: 11 };
      sheet.getCell(`F${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`F${r}`).numFmt = '0.00';

      // G: Ceiling limit of EPF for EDLI (formula: MIN(E[row], 15000))
      sheet.getCell(`G${r}`).value = { formula: `MIN(E${r},15000)` };
      sheet.getCell(`G${r}`).font = { name: 'Times New Roman', size: 11 };
      sheet.getCell(`G${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`G${r}`).numFmt = '0.00';

      // H: Wage Limit for 1.16% calculation ONLY (formula: MIN(E[row], 15000))
      sheet.getCell(`H${r}`).value = { formula: `MIN(E${r},15000)` };
      sheet.getCell(`H${r}`).font = { name: 'Times New Roman', size: 11 };
      sheet.getCell(`H${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`H${r}`).numFmt = '0.00';

      // I: EPF Employee Contribution (EE Contrib)
      sheet.getCell(`I${r}`).value = {
        formula: (emp.employee_contribution || 0) > 1800 ? `ROUND(D${r}*12%,0)` : `ROUND(E${r}*12%,0)`
      };
      sheet.getCell(`I${r}`).font = { name: 'Times New Roman', size: 11 };
      sheet.getCell(`I${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`I${r}`).numFmt = '0.00';

      // J: EPF Employer Contribution (ER Contrib)
      sheet.getCell(`J${r}`).value = { formula: `ROUND(E${r}*12%,0)` };
      sheet.getCell(`J${r}`).font = { name: 'Calibri', size: 11 };
      sheet.getCell(`J${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`J${r}`).numFmt = '0.00';

      // K: Employer EPS Contribution
      sheet.getCell(`K${r}`).value = { formula: `ROUND(F${r}*12%,0)` };
      sheet.getCell(`K${r}`).font = { name: 'Times New Roman', size: 11 };
      sheet.getCell(`K${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`K${r}`).numFmt = '0.00';

      // L: Employer EPS Contribution remitted
      sheet.getCell(`L${r}`).value = {
        formula: `IF(F${r}>0,ROUND((F${r}*8.33%)+((F${r}-H${r})*1.16%),0),0)`
      };
      sheet.getCell(`L${r}`).font = { name: 'Calibri', size: 11 };
      sheet.getCell(`L${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`L${r}`).numFmt = '0.00';

      // M: Employer EPF-EPS Difference (ER Share A/C 1)
      sheet.getCell(`M${r}`).value = { formula: `J${r}-L${r}` };
      sheet.getCell(`M${r}`).font = { name: 'Calibri', size: 11 };
      sheet.getCell(`M${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`M${r}`).numFmt = '0.00';

      // N: EDLI (Populated from EPF Entry)
      sheet.getCell(`N${r}`).value = emp.edli || 0;
      sheet.getCell(`N${r}`).font = { name: 'Calibri', size: 11 };
      sheet.getCell(`N${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`N${r}`).numFmt = '0.00';

      // O: Admin Charge (Populated from EPF Entry)
      sheet.getCell(`O${r}`).value = emp.admin_charges || 0;
      sheet.getCell(`O${r}`).font = { name: 'Calibri', size: 11 };
      sheet.getCell(`O${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`O${r}`).numFmt = '0.00';

      // P: Total EE+ER contrib
      sheet.getCell(`P${r}`).value = { formula: `I${r}+J${r}` };
      sheet.getCell(`P${r}`).font = { name: 'Calibri', size: 11 };
      sheet.getCell(`P${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`P${r}`).numFmt = '0.00';
    });

    // Total Row
    sheet.getRow(totalRow).height = 20;
    applyBordersToRow(totalRow);
    
    // TOTAL label in merged range A:C
    sheet.mergeCells(`A${totalRow}:C${totalRow}`);
    sheet.getCell(`A${totalRow}`).value = 'TOTAL';

    // SUM formulas for Total Row (D to O)
    ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'].forEach((col) => {
      sheet.getCell(`${col}${totalRow}`).value = { formula: `SUM(${col}6:${col}${lastEmpRow})` };
    });
    sheet.getCell(`P${totalRow}`).value = { formula: `I${totalRow}+J${totalRow}` };

    // Apply Dark Red font and middle-aligned styling to all cells in the totals row (1 to 16)
    for (let c = 1; c <= 16; c++) {
      const cell = sheet.getRow(totalRow).getCell(c);
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF800000' } };
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      if (c >= 4) {
        cell.numFmt = '0.00';
      }
    }

    // Empty Row below total (Row 19) - UNWANTED borders cleared!
    const row19 = totalRow + 1;
    sheet.getRow(row19).height = 18;
    for (let c = 1; c <= 16; c++) {
      sheet.getRow(row19).getCell(c).border = {};
    }

    // Summary Block Rows (totalRow + 2 to totalRow + 8) - No Borders, Blue font color
    const row20 = totalRow + 2;
    const row21 = totalRow + 3;
    const row22 = totalRow + 4;
    const row23 = totalRow + 5;
    const row24 = totalRow + 6;
    const row25 = totalRow + 7;
    const row26 = totalRow + 8;

    for (let r = row20; r <= row26; r++) {
      sheet.getRow(r).height = 18;
      // Note: Clear borders in summary block
      for (let c = 1; c <= 16; c++) {
        sheet.getRow(r).getCell(c).border = {};
      }
      sheet.getRow(r).getCell(7).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0070C0' } };
      sheet.getRow(r).getCell(12).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0070C0' } };
    }

    // Recovery Details (shifted left by 1 column, values in column L)
    sheet.getCell(`G${row20}`).value = 'Total Recovery';
    sheet.getCell(`L${row20}`).value = { formula: `I${totalRow}` };
    sheet.getCell(`L${row20}`).numFmt = '0.00';
    sheet.getCell(`L${row20}`).alignment = { horizontal: 'right' };

    sheet.getCell(`G${row21}`).value = 'EPF Contribution';
    sheet.getCell(`L${row21}`).value = { formula: `M${totalRow}` };
    sheet.getCell(`L${row21}`).numFmt = '0.00';
    sheet.getCell(`L${row21}`).alignment = { horizontal: 'right' };

    sheet.getCell(`G${row22}`).value = 'Pension Contribution';
    sheet.getCell(`L${row22}`).value = { formula: `L${totalRow}` };
    sheet.getCell(`L${row22}`).numFmt = '0.00';
    sheet.getCell(`L${row22}`).alignment = { horizontal: 'right' };

    sheet.getCell(`G${row23}`).value = 'Admin Charge (0.5%of EPF Wages)';
    sheet.getCell(`L${row23}`).value = { formula: `ROUND(E${totalRow}*0.5%,0)` };
    sheet.getCell(`L${row23}`).numFmt = '0.00';
    sheet.getCell(`L${row23}`).alignment = { horizontal: 'right' };

    sheet.getCell(`G${row24}`).value = 'EDLIS Contribution Account Charges   ';
    sheet.getCell(`L${row24}`).value = { formula: `G${totalRow + 12}` }; // points to cell G[row30]
    sheet.getCell(`L${row24}`).numFmt = '0.00';
    sheet.getCell(`L${row24}`).alignment = { horizontal: 'right' };

    sheet.getCell(`G${row25}`).value = 'Total  amount for the month';
    sheet.getCell(`L${row25}`).value = { formula: `SUM(L${row20}:L${row24})` };
    sheet.getCell(`L${row25}`).numFmt = '0.00';
    sheet.getCell(`L${row25}`).alignment = { horizontal: 'right' };

    sheet.getCell(`G${row26}`).value = `Employer Liability for ${monthLabel} ${year}`;
    sheet.getCell(`L${row26}`).value = { formula: `J${totalRow}+G${totalRow + 13}` }; // points to cell G[row31] (total admin)
    sheet.getCell(`L${row26}`).numFmt = '0.00';
    sheet.getCell(`L${row26}`).alignment = { horizontal: 'right' };

    // Empty row
    const row27 = totalRow + 9;
    for (let c = 1; c <= 16; c++) {
      sheet.getRow(row27).getCell(c).border = {};
    }

    // Administrative Charges Table (row28 to row31) - Shifted left to C to G
    // Restrict borders to only columns C to G (indices 3 to 7)
    const row28 = totalRow + 10;
    const row29 = totalRow + 11;
    const row30 = totalRow + 12;
    const row31 = totalRow + 13;

    for (let r = row28; r <= row31; r++) {
      sheet.getRow(r).height = 18;
      for (let c = 1; c <= 16; c++) {
        const cell = sheet.getRow(r).getCell(c);
        if (c >= 3 && c <= 7) {
          cell.border = thinBorderGrey;
          cell.fill = fillAdminTable;
        } else {
          cell.border = {};
        }
      }
    }

    // Merged Header Row 28
    sheet.getCell(`C${row28}`).value = 'Administrative Charges';
    sheet.mergeCells(`C${row28}:G${row28}`);
    sheet.getCell(`C${row28}`).font = { name: 'Calibri', size: 11, bold: true, italic: true };
    sheet.getCell(`C${row28}`).alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 29: A/c No. 2 PF Admin
    sheet.getCell(`C${row29}`).value = 'A/c No. 2: PF Admin Charges Account       ';
    sheet.getCell(`C${row29}`).font = { name: 'Calibri', size: 11 };
    sheet.getCell(`E${row29}`).value = { formula: `E${totalRow}` };
    sheet.getCell(`E${row29}`).font = { name: 'Calibri', size: 11 };
    sheet.getCell(`E${row29}`).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(`E${row29}`).numFmt = '0.00';
    sheet.getCell(`F${row29}`).value = 'x 0.5 %     ';
    sheet.getCell(`F${row29}`).font = { name: 'Calibri', size: 11 };
    sheet.getCell(`G${row29}`).value = { formula: `ROUND(E${row29}*0.5%,0)` };
    sheet.getCell(`G${row29}`).font = { name: 'Calibri', size: 11, bold: true, italic: true };
    sheet.getCell(`G${row29}`).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(`G${row29}`).numFmt = '0.00';

    // Row 30: A/c No. 21 EDLI Admin
    sheet.getCell(`C${row30}`).value = 'A/c No. 21: EDLIS Contribution Account      ';
    sheet.getCell(`C${row30}`).font = { name: 'Calibri', size: 11 };
    sheet.getCell(`E${row30}`).value = { formula: `G${totalRow}` };
    sheet.getCell(`E${row30}`).font = { name: 'Calibri', size: 11 };
    sheet.getCell(`E${row30}`).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(`E${row30}`).numFmt = '0.00';
    sheet.getCell(`F${row30}`).value = 'x 0.5 %     ';
    sheet.getCell(`F${row30}`).font = { name: 'Calibri', size: 11 };
    sheet.getCell(`G${row30}`).value = { formula: `ROUND(E${row30}*0.5%,0)` };
    sheet.getCell(`G${row30}`).font = { name: 'Calibri', size: 11, bold: true, italic: true };
    sheet.getCell(`G${row30}`).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(`G${row30}`).numFmt = '0.00';

    // Row 31: Total Admin
    sheet.getCell(`C${row31}`).value = 'Total';
    sheet.mergeCells(`C${row31}:F${row31}`);
    sheet.getCell(`C${row31}`).font = { name: 'Calibri', size: 11, bold: true };
    sheet.getCell(`C${row31}`).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(`G${row31}`).value = { formula: `SUM(G${row29}:G${row30})` };
    sheet.getCell(`G${row31}`).font = { name: 'Book Antiqua', size: 11, bold: true };
    sheet.getCell(`G${row31}`).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(`G${row31}`).numFmt = '0.00';

    // Empty Row
    const row32 = totalRow + 14;
    for (let c = 1; c <= 16; c++) {
      sheet.getRow(row32).getCell(c).border = {};
    }

    // Total Remittance Table (row33 to row36) - Shifted left to C to G
    // Restrict borders to only columns C to G (indices 3 to 7)
    const row33 = totalRow + 15;
    const row34 = totalRow + 16;
    const row35 = totalRow + 17;
    const row36 = totalRow + 18;

    for (let r = row33; r <= row36; r++) {
      sheet.getRow(r).height = r === row33 ? 18.75 : 18;
      for (let c = 1; c <= 16; c++) {
        const cell = sheet.getRow(r).getCell(c);
        if (c >= 3 && c <= 7) {
          cell.border = thinBorderGrey;
          cell.fill = fillRemittanceTable;
        } else {
          cell.border = {};
        }
      }
    }

    // Row 33 Header
    sheet.getCell(`C${row33}`).value = `Total Remittance  to EPFO for the month of ${monthLabel} ${year}`;
    sheet.mergeCells(`C${row33}:G${row33}`);
    sheet.getCell(`C${row33}`).font = { name: 'Calibri', size: 14, bold: true };
    sheet.getCell(`C${row33}`).alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 34: EE + ER Contribution
    sheet.getCell(`C${row34}`).value = 'Employee + Employer Contribution';
    sheet.mergeCells(`C${row34}:F${row34}`);
    sheet.getCell(`C${row34}`).font = { name: 'Calibri', size: 11 };
    sheet.getCell(`C${row34}`).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell(`G${row34}`).value = { formula: `P${totalRow}` };
    sheet.getCell(`G${row34}`).font = { name: 'Calibri', size: 11, italic: true };
    sheet.getCell(`G${row34}`).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(`G${row34}`).numFmt = '0.00';

    // Row 35: Admin Charges
    sheet.getCell(`C${row35}`).value = 'Administrative Charges';
    sheet.mergeCells(`C${row35}:F${row35}`);
    sheet.getCell(`C${row35}`).font = { name: 'Calibri', size: 11 };
    sheet.getCell(`C${row35}`).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell(`G${row35}`).value = { formula: `G${row31}` };
    sheet.getCell(`G${row35}`).font = { name: 'Calibri', size: 11, italic: true };
    sheet.getCell(`G${row35}`).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(`G${row35}`).numFmt = '0.00';

    // Row 36: Total Remittance
    sheet.getCell(`C${row36}`).value = 'Total';
    sheet.mergeCells(`C${row36}:F${row36}`);
    sheet.getCell(`C${row36}`).font = { name: 'Calibri', size: 11, bold: true };
    sheet.getCell(`C${row36}`).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(`G${row36}`).value = { formula: `SUM(G${row34}:G${row35})` };
    sheet.getCell(`G${row36}`).font = { name: 'Book Antiqua', size: 11, bold: true };
    sheet.getCell(`G${row36}`).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(`G${row36}`).numFmt = '0.00';
    
    // Non-plan label at Col L36: fill with Theme 5 tint 0.6
    sheet.getCell(`L${row36}`).value = 'NON PLAN  ';
    sheet.getCell(`L${row36}`).font = { name: 'Calibri', size: 11 };
    sheet.getCell(`L${row36}`).fill = fillNonPlan;
    sheet.getCell(`L${row36}`).border = {};

    // Note row (totalRow + 23) - Borderless
    const row41 = totalRow + 23;
    sheet.getRow(row41).height = 19.5;
    for (let c = 1; c <= 16; c++) {
      sheet.getRow(row41).getCell(c).border = {};
    }
    sheet.getCell(`C${row41}`).value = '*';
    sheet.getCell(`C${row41}`).font = { name: 'Calibri', size: 15, bold: true, italic: true };
    sheet.getCell(`C${row41}`).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(`D${row41}`).value = ' Calculation Sheet Revised due to Revamped ECR on 21.10.2025  ';
    sheet.getCell(`D${row41}`).font = { name: 'Calibri', size: 15, bold: true, italic: true };
    sheet.getCell(`D${row41}`).alignment = { horizontal: 'left', vertical: 'middle' };

    // CRITICAL: Unwanted rows deleted. No trailing rows/cells created after note row!
  };

  // Preview Grid Calculations Helper
  const getPreviewCalculations = (data) => {
    const list = data.map((emp, idx) => {
      const wages = emp.wages || 0;
      const epf_wage = emp.epf_wage || 0;
      const eps_wage = emp.eps_wage || 0;
      
      const ceilingLimit = Math.min(epf_wage, 15000);
      const wageLimit116 = Math.min(epf_wage, 15000);
      
      const eeShare = (emp.employee_contribution || 0) > 1800 
        ? Math.round(wages * 0.12) 
        : Math.round(epf_wage * 0.12);
        
      const erShare = Math.round(epf_wage * 0.12);
      const epsContrib = Math.round(eps_wage * 0.12);
      
      const epsRemitted = eps_wage > 0 
        ? Math.round((eps_wage * 0.0833) + ((eps_wage - wageLimit116) * 0.0116)) 
        : 0;
        
      const erDiff = erShare - epsRemitted;
      const totalEeEr = eeShare + erShare;

      return {
        no: idx + 1,
        uan: emp.uan || '',
        name: (emp.name || '').toUpperCase(),
        wages,
        epf_wage,
        eps_wage,
        ceilingLimit,
        wageLimit116,
        eeShare,
        erShare,
        epsContrib,
        epsRemitted,
        erDiff,
        edli: emp.edli || 0,
        adminCharges: emp.admin_charges || 0,
        totalEeEr,
        is_daily: emp.is_daily,
        date_of_joining: emp.date_of_joining
      };
    });

    // Sum totals
    const totals = list.reduce((acc, row) => {
      acc.wages += row.wages;
      acc.epf_wage += row.epf_wage;
      acc.eps_wage += row.eps_wage;
      acc.ceilingLimit += row.ceilingLimit;
      acc.wageLimit116 += row.wageLimit116;
      acc.eeShare += row.eeShare;
      acc.erShare += row.erShare;
      acc.epsContrib += row.epsContrib;
      acc.epsRemitted += row.epsRemitted;
      acc.erDiff += row.erDiff;
      acc.edli += row.edli;
      acc.adminCharges += row.adminCharges;
      acc.totalEeEr += row.totalEeEr;
      return acc;
    }, {
      wages: 0, epf_wage: 0, eps_wage: 0, ceilingLimit: 0, wageLimit116: 0,
      eeShare: 0, erShare: 0, epsContrib: 0, epsRemitted: 0, erDiff: 0, edli: 0, adminCharges: 0, totalEeEr: 0
    });

    return { list, totals };
  };

  const getActivePreviewData = () => {
    if (previewTab === 'regular') {
      return getPreviewCalculations(permanentData.map(e => ({ ...e, is_daily: false })));
    }
    if (previewTab === 'daily') {
      return getPreviewCalculations(dailyWageData.map(e => ({ ...e, is_daily: true })));
    }
    return getPreviewCalculations([
      ...permanentData.map(e => ({ ...e, is_daily: false })),
      ...dailyWageData.map(e => ({ ...e, is_daily: true }))
    ]);
  };

  const { list: previewList, totals: previewTotals } = dataLoaded ? getActivePreviewData() : { list: [], totals: {} };
  const { monthLabel, year } = getMonthYearLabel(monthYear);

  // Administrative Charges Table calculations
  const ac2PFAdmin = Math.round((previewTotals.epf_wage || 0) * 0.005);
  const ac21EDLISAdmin = Math.round((previewTotals.ceilingLimit || 0) * 0.005);
  const totalAdminCharges = ac2PFAdmin + ac21EDLISAdmin;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>EPF Reports & Exports</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Preview and export the institutional multi-sheet EPF Statement workbook.
          </p>
        </div>
      </div>

      {status.text && (
        <div 
          className="card" 
          style={{ 
            marginBottom: '2rem', 
            padding: '1rem 1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            borderLeft: `4px solid ${status.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
            background: 'var(--color-bg-surface)'
          }}
        >
          {status.type === 'success' ? (
            <ShieldCheck size={24} style={{ color: 'var(--color-success)' }} />
          ) : (
            <AlertCircle size={24} style={{ color: 'var(--color-danger)' }} />
          )}
          <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{status.text}</span>
        </div>
      )}

      {/* Inputs and actions panel */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Select Month & Year</label>
            <input 
              type="month" 
              className="form-control" 
              value={monthYear} 
              onChange={(e) => setMonthYear(e.target.value)} 
              style={{ width: '100%', marginTop: '0.5rem' }} 
            />
          </div>

          <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Select Report Type</label>
            <select
              className="form-control"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <option value="statement">EPF Statement Workbook</option>
              <option value="remittance">EPF Remittance Statement</option>
              <option value="challan">EPF Challan</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowPreview(!showPreview)}
              disabled={fetching || !dataLoaded || generating || generatingRemittance || generatingChallan}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                fontWeight: 600
              }}
            >
              {showPreview ? (
                <>
                  <EyeOff size={18} />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye size={18} />
                  Preview Report
                </>
              )}
            </button>

            <button 
              className="btn btn-primary" 
              onClick={() => {
                if (reportType === 'statement') handleExportEPFStatement();
                else if (reportType === 'remittance') handleExportEPFRemittanceStatement();
                else if (reportType === 'challan') handleExportEPFChallan();
              }} 
              disabled={generating || generatingRemittance || generatingChallan || fetching || !dataLoaded}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)'
              }}
            >
              {generating || generatingRemittance || generatingChallan ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Exporting Excel...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {fetching && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 className="animate-spin" size={36} style={{ color: 'var(--color-accent-primary)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading EPF data...</p>
        </div>
      )}

      {/* Live Preview Area */}
      {showPreview && dataLoaded && (
        <div className="card" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          {reportType === 'statement' ? (
            <>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>EPF Statement Live Preview</h2>
              
              {/* Legend panel */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-primary)', borderRadius: '6px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginRight: '0.5rem' }}>Category Legend:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#E2EFDA', border: '1px solid #7F7F7F', borderRadius: '3px' }}></span>
                  <span>Joined Before 01-09-2014</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#FFF2CC', border: '1px solid #7F7F7F', borderRadius: '3px' }}></span>
                  <span>Joined After 01-09-2014 & Before 01-08-2025</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#E2D9F2', border: '1px solid #7F7F7F', borderRadius: '3px' }}></span>
                  <span>Joined After 01-08-2025</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#FFE699', border: '1px solid #7F7F7F', borderRadius: '3px' }}></span>
                  <span>Joined After 01-09-2014 (General)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#FFD2D2', border: '1px solid #7F7F7F', borderRadius: '3px' }}></span>
                  <span>Daily Wage Employee</span>
                </div>
              </div>

              {/* Tab bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-primary)', marginBottom: '1.5rem', gap: '0.5rem' }}>
                <button 
                  onClick={() => setPreviewTab('regular')}
                  className={`btn ${previewTab === 'regular' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                >
                  Regular Employees ({permanentData.length})
                </button>
                <button 
                  onClick={() => setPreviewTab('daily')}
                  className={`btn ${previewTab === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                >
                  Daily Wage employees ({dailyWageData.length})
                </button>
                <button 
                  onClick={() => setPreviewTab('combined')}
                  className={`btn ${previewTab === 'combined' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                >
                  Regular & Daily Wage Employees ({permanentData.length + dailyWageData.length})
                </button>
              </div>

              {/* Grid spreadsheet preview (16 columns: A to P) */}
              <div style={{ overflowX: 'auto', maxHeight: '550px', border: '1px solid var(--color-border-primary)', borderRadius: '6px', backgroundColor: '#FFFFFF', color: '#333333' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'Calibri, sans-serif' }}>
                  <thead>
                    {/* Row 1 Merged Header */}
                    <tr style={{ height: '30px' }}>
                      <th colSpan="16" style={{ textAlign: 'center', fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid #BFBFBF', backgroundColor: '#FFFFFF', padding: '5px' }}>
                        KERALA SCHOOL OF MATHEMATICS, KOZHIKODE
                      </th>
                    </tr>
                    {/* Row 2 Merged Header */}
                    <tr style={{ height: '26px' }}>
                      <th colSpan="16" style={{ textAlign: 'center', fontSize: '13px', fontWeight: 'bold', borderBottom: '2px solid #000000', backgroundColor: '#FFFFFF', padding: '5px' }}>
                        EPF STATEMENT FOR THE MONTH OF {monthLabel} {year}
                      </th>
                    </tr>
                    {/* Row 3 Numbers - Starts from Column A, 1 to 16 */}
                    <tr style={{ height: '22px', backgroundColor: '#DCE6F1' }}>
                      {[...Array(16)].map((_, i) => (
                        <th key={i} style={{ border: '1px solid #BFBFBF', textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</th>
                      ))}
                    </tr>
                    {/* Row 4 Column Text */}
                    <tr style={{ height: '80px', backgroundColor: '#E6E6E6', fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>NO</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>UAN No.</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'left', minWidth: '150px' }}>Name</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right' }}>Wages</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right' }}>EPF Wages</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right' }}>EPS Wages</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right' }}>Ceiling limit of EPF for EDLI</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right' }}>Wage Limit for 1.16% calculation ONLY</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right' }}>EPF Employee Contribution (EE Share A/C 1)</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right', outline: '2px solid #000000' }}>EPF Employer Contribution (ER Contrib)</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right' }}>Employer EPS Contribution</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right', outline: '2px solid #000000' }}>Employer EPS remitted (8.33%+1.16%) (A/C 10)</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right', outline: '2px solid #000000' }}>Employer EPF-EPS Difference (ER Share A/C 1)</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right' }}>EDLI</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right' }}>Admin Charge</th>
                      <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'right', outline: '2px solid #000000' }}>Total EE+ER contrib</th>
                    </tr>
                    {/* Row 5 A/C Headers */}
                    <tr style={{ height: '22px', backgroundColor: '#D9D9D9', textAlign: 'center' }}>
                      <th style={{ border: '1px solid #BFBFBF' }}></th>
                      <th style={{ border: '1px solid #BFBFBF' }}></th>
                      <th style={{ border: '1px solid #BFBFBF' }}></th>
                      <th style={{ border: '1px solid #BFBFBF' }}></th>
                      <th style={{ border: '1px solid #BFBFBF' }}></th>
                      <th style={{ border: '1px solid #BFBFBF' }}></th>
                      <th style={{ border: '1px solid #BFBFBF' }}></th>
                      <th style={{ border: '1px solid #BFBFBF' }}></th>
                      <th style={{ border: '1px solid #BFBFBF', fontWeight: 'bold' }}>A/C 1</th>
                      <th style={{ border: '1px solid #000000' }}></th>
                      <th style={{ border: '1px solid #BFBFBF' }}></th>
                      <th style={{ border: '1px solid #000000', fontWeight: 'bold' }}>A/C 10</th>
                      <th style={{ border: '1px solid #000000', fontWeight: 'bold' }}>A/C 1</th>
                      <th style={{ border: '1px solid #BFBFBF' }}></th>
                      <th style={{ border: '1px solid #BFBFBF' }}></th>
                      <th style={{ border: '1px solid #000000' }}></th>
                    </tr>
                  </thead>
                  <tbody style={{ verticalAlign: 'middle' }}>
                    {previewList.map((emp, i) => {
                      const rowStyle = getRowPreviewStyle(emp, emp.is_daily);
                      const wages = emp.wages || 0;
                      const epf_wage = emp.epf_wage || 0;
                      const eps_wage = emp.eps_wage || 0;
                      const ceilingLimit = Math.min(epf_wage, 15000);
                      const isDep = emp.appointment_type === 'Deputation';
                      
                      // Wage Limit for 1.16% calculation ONLY
                      const limit116 = (eps_wage > 15000) ? (eps_wage - 15000) : 0;
                      
                      const eeShare = emp.employee_contribution || 0;
                      const erShare = isDep ? 0 : (emp.employer_contribution || 0);
                      
                      // Calculate EPS contribution
                      const epsContrib = isDep ? 0 : (eps_wage > 0 ? (eps_wage * 0.0833) : 0);
                      const epsRemitted = isDep ? 0 : (eps_wage > 0 ? Math.round(eps_wage * 0.0833 + limit116 * 0.0116) : 0);
                      
                      const erDiff = isDep ? 0 : (erShare - epsRemitted);
                      const edli = isDep ? 0 : (emp.edli || 0);
                      const adminCharges = isDep ? 0 : (emp.admin_charges || 0);
                      
                      const totalEeEr = eeShare + erShare;

                      return (
                        <tr key={i} className={emp.is_active === 0 ? 'inactive-row' : ''} style={{ height: '22px', backgroundColor: emp.is_active === 0 ? '#fff7ed' : rowStyle.backgroundColor }}>
                          {/* A NO */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'center', fontFamily: 'Times New Roman, serif' }}>{emp.no}</td>
                          {/* B UAN */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'center', fontFamily: 'Times New Roman, serif' }}>{emp.uan}</td>
                          {/* C Name */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'left', padding: '2px 5px', fontFamily: 'Times New Roman, serif', color: emp.is_active === 0 ? '#c2410c' : 'inherit' }}>
                            {emp.name}{emp.is_active === 0 ? ' [Inactive]' : ''}
                          </td>
                          {/* D Wages */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', fontFamily: 'Times New Roman, serif' }}>{wages.toFixed(2)}</td>
                          {/* E EPF Wages */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', fontFamily: 'Times New Roman, serif' }}>{epf_wage.toFixed(2)}</td>
                          {/* F EPS Wages */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', fontFamily: 'Times New Roman, serif' }}>{eps_wage.toFixed(2)}</td>
                          {/* G Ceiling limit EDLI */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', fontFamily: 'Times New Roman, serif' }}>{ceilingLimit.toFixed(2)}</td>
                          {/* H Wage Limit 1.16% */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', fontFamily: 'Times New Roman, serif' }}>{limit116.toFixed(2)}</td>
                          {/* I EE Contribution */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', fontFamily: 'Times New Roman, serif' }}>{eeShare.toFixed(2)}</td>
                          {/* J ER Contribution (Black outline column) */}
                          <td style={{ borderLeft: '1px solid #000000', borderRight: '1px solid #000000', borderBottom: '1px solid #000000', borderTop: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', fontWeight: 500 }}>{erShare.toFixed(2)}</td>
                          {/* K Employer EPS */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', fontFamily: 'Times New Roman, serif' }}>{epsContrib.toFixed(2)}</td>
                          {/* L Employer EPS remitted (Black outline column) */}
                          <td style={{ borderLeft: '1px solid #000000', borderRight: '1px solid #000000', borderBottom: '1px solid #000000', borderTop: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px' }}>{epsRemitted.toFixed(2)}</td>
                          {/* M Difference (Black outline column) */}
                          <td style={{ borderLeft: '1px solid #000000', borderRight: '1px solid #000000', borderBottom: '1px solid #000000', borderTop: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px' }}>{erDiff.toFixed(2)}</td>
                          {/* N EDLI (Populated!) */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px' }}>{edli.toFixed(2)}</td>
                          {/* O Admin Charge (Populated!) */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px' }}>{adminCharges.toFixed(2)}</td>
                          {/* P Total EE+ER (Black outline column) */}
                          <td style={{ borderLeft: '1px solid #000000', borderRight: '1px solid #000000', borderBottom: '1px solid #000000', borderTop: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px' }}>{totalEeEr.toFixed(2)}</td>
                        </tr>
                      );
                    })}

                    {/* Totals row - Merged A, B, C containing TOTAL in Dark Red (#800000), bold, and middle-aligned */}
                    <tr style={{ height: '24px', fontWeight: 'bold', backgroundColor: '#FFFFFF', color: '#800000', verticalAlign: 'middle' }}>
                      <td colSpan="3" style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>TOTAL</td>
                      <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.wages.toFixed(2)}</td>
                      <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.epf_wage.toFixed(2)}</td>
                      <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.eps_wage.toFixed(2)}</td>
                      <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.ceilingLimit.toFixed(2)}</td>
                      <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.wageLimit116.toFixed(2)}</td>
                      <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.eeShare.toFixed(2)}</td>
                      <td style={{ border: '1px solid #000000', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.erShare.toFixed(2)}</td>
                      <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.epsContrib.toFixed(2)}</td>
                      <td style={{ border: '1px solid #000000', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.epsRemitted.toFixed(2)}</td>
                      <td style={{ border: '1px solid #000000', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.erDiff.toFixed(2)}</td>
                      <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.edli.toFixed(2)}</td>
                      <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.adminCharges.toFixed(2)}</td>
                      <td style={{ border: '1px solid #000000', textAlign: 'right', padding: '2px 5px', verticalAlign: 'middle' }}>{previewTotals.totalEeEr.toFixed(2)}</td>
                    </tr>

                    {/* Empty row 19 - UNWANTED borders removed */}
                    <tr style={{ height: '18px' }}>
                      {[...Array(16)].map((_, i) => (
                        <td key={i} style={{ border: 'none' }}></td>
                      ))}
                    </tr>

                    {/* Blank padded rows & Recovery Blue Summary Cards */}
                    <tr>
                      <td colSpan="16" style={{ padding: '15px', backgroundColor: '#FFFFFF' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                          {/* Left: Recovery Summary Cards (FF0070C0 Blue font color, no borders) */}
                          <div style={{ color: '#0070C0', fontFamily: 'Calibri, sans-serif', fontSize: '11px', fontWeight: 'bold' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                              <span>Total Recovery</span>
                              <span>{previewTotals.eeShare.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                              <span>EPF Contribution</span>
                              <span>{previewTotals.erDiff.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                              <span>Pension Contribution</span>
                              <span>{previewTotals.epsRemitted.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                              <span>Admin Charge (0.5% of EPF Wages)</span>
                              <span>{ac2PFAdmin.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                              <span>EDLIS Contribution Account Charges</span>
                              <span>{ac21EDLISAdmin.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '1px dashed #0070C0', marginTop: '5px' }}>
                              <span>Total amount for the month</span>
                              <span>{(previewTotals.eeShare + previewTotals.erDiff + previewTotals.epsRemitted + ac2PFAdmin + ac21EDLISAdmin).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#005a9c' }}>
                              <span>Employer Liability for {monthLabel} {year}</span>
                              <span>{(previewTotals.erShare + totalAdminCharges).toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Right Side: Admin Charges & Remittance tables (Shifted left to C to G) */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {/* Admin Charges table - Theme 2 Warm Grey/Tan background (#EEECE1) */}
                            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '11px', backgroundColor: '#EEECE1', border: '1px solid #7F7F7F' }}>
                              <thead>
                                <tr>
                                  <th colSpan="3" style={{ border: '1px solid #7F7F7F', padding: '4px', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center' }}>
                                    Administrative Charges
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px' }}>A/c No. 2: PF Admin Charges Account</td>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px', textAlign: 'right' }}>{previewTotals.epf_wage.toFixed(2)} x 0.5%</td>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px', textAlign: 'right', fontWeight: 'bold', fontStyle: 'italic' }}>{ac2PFAdmin.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px' }}>A/c No. 21: EDLIS Contribution Account</td>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px', textAlign: 'right' }}>{previewTotals.ceilingLimit.toFixed(2)} x 0.5%</td>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px', textAlign: 'right', fontWeight: 'bold', fontStyle: 'italic' }}>{ac21EDLISAdmin.toFixed(2)}</td>
                                </tr>
                                <tr style={{ fontWeight: 'bold' }}>
                                  <td colSpan="2" style={{ border: '1px solid #7F7F7F', padding: '4px', textAlign: 'right' }}>Total</td>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px', textAlign: 'right', fontFamily: 'Book Antiqua, serif' }}>{totalAdminCharges.toFixed(2)}</td>
                                </tr>
                              </tbody>
                            </table>

                            {/* EPFO Remittance Table - Theme 2 Tint -0.1 Tan background (#E2DDCD) */}
                            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '11px', backgroundColor: '#E2DDCD', border: '1px solid #7F7F7F' }}>
                              <thead>
                                <tr style={{ fontSize: '12px' }}>
                                  <th colSpan="2" style={{ border: '1px solid #7F7F7F', padding: '5px', fontWeight: 'bold', textAlign: 'center' }}>
                                    Total Remittance to EPFO for the month of {monthLabel} {year}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px' }}>Employee + Employer Contribution</td>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px', textAlign: 'right', fontStyle: 'italic' }}>{previewTotals.totalEeEr.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px' }}>Administrative Charges</td>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px', textAlign: 'right', fontStyle: 'italic' }}>{totalAdminCharges.toFixed(2)}</td>
                                </tr>
                                <tr style={{ fontWeight: 'bold' }}>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px', textAlign: 'right' }}>Total</td>
                                  <td style={{ border: '1px solid #7F7F7F', padding: '4px', textAlign: 'right', fontFamily: 'Book Antiqua, serif' }}>{(previewTotals.totalEeEr + totalAdminCharges).toFixed(2)}</td>
                                </tr>
                                {/* NON PLAN cell */}
                                <tr>
                                  <td style={{ border: 'none', backgroundColor: '#FFFFFF' }}></td>
                                  <td style={{ border: 'none', padding: '4px', textAlign: 'center', backgroundColor: '#E8D2CC', color: '#A02010', fontWeight: 'bold', borderRadius: '4px' }}>NON PLAN</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Footer Note */}
                    <tr style={{ height: '35px', backgroundColor: '#FFFFFF' }}>
                      <td colSpan="16" style={{ border: 'none', padding: '10px', fontSize: '13px', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'left', color: '#333' }}>
                        *  Calculation Sheet Revised due to Revamped ECR on 21.10.2025  
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : reportType === 'remittance' ? (
            <>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>EPF Remittance Statement Live Preview</h2>
              
              {/* Legend panel */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-primary)', borderRadius: '6px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginRight: '0.5rem' }}>Category Legend:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#E2EFDA', border: '1px solid #7F7F7F', borderRadius: '3px' }}></span>
                  <span>Joined Before 01-09-2014</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#FFF2CC', border: '1px solid #7F7F7F', borderRadius: '3px' }}></span>
                  <span>Joined After 01-09-2014 & Before 01-08-2025</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#E2D9F2', border: '1px solid #7F7F7F', borderRadius: '3px' }}></span>
                  <span>Joined After 01-08-2025</span>
                </div>
              </div>

              {/* Remittance Table preview (19 columns: A to S) */}
              <div style={{ overflowX: 'auto', maxHeight: '550px', border: '1px solid var(--color-border-primary)', borderRadius: '6px', backgroundColor: '#FFFFFF', color: '#333333' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'Calibri, sans-serif' }}>
                  <thead>
                    {/* Row 1 Merged Header */}
                    <tr style={{ height: '30px' }}>
                      <th colSpan="19" style={{ textAlign: 'center', fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid #BFBFBF', backgroundColor: '#FFFFFF', padding: '5px' }}>
                        KERALA SCHOOL OF MATHEMATICS, KOZHIKODE.
                      </th>
                    </tr>
                    {/* Row 2 Merged Header */}
                    <tr style={{ height: '26px' }}>
                      <th colSpan="19" style={{ textAlign: 'center', fontSize: '13px', fontWeight: 'bold', borderBottom: '2px solid #000000', backgroundColor: '#FFFFFF', padding: '5px' }}>
                        Statement of EPF remittance - Employer & Employee Contribution recovered from the salary of the month {monthLabel.charAt(0) + monthLabel.slice(1).toLowerCase()} {year}
                      </th>
                    </tr>
                    {/* Row 3 Numbers - Starts from Column A, 1 to 19 */}
                    <tr style={{ height: '22px', backgroundColor: '#DCE6F1' }}>
                      {[...Array(19)].map((_, i) => (
                        <th key={i} style={{ border: '1px solid #BFBFBF', textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</th>
                      ))}
                    </tr>
                    {/* Double header rows 4-7 */}
                    <tr style={{ height: '30px', backgroundColor: '#EEECE1', fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' }}>
                      <th rowSpan="5" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>Sl.No.</th>
                      <th rowSpan="5" style={{ border: '1px solid #7F7F7F', padding: '5px', minWidth: '150px' }}>Name of Employee</th>
                      <th rowSpan="5" style={{ border: '1px solid #7F7F7F', padding: '5px', minWidth: '150px' }}>Designation</th>
                      <th rowSpan="5" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>Actual Salary -(Basic +DA)</th>
                      <th rowSpan="5" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>PF Salary Threshold (A)</th>
                      <th colSpan="8" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>Contribution & Remittance  by Employer</th>
                      <th rowSpan="5" style={{ border: '1px solid #7F7F7F', backgroundColor: '#FFFFFF' }}></th> {/* spacer spacer */}
                      <th colSpan="4" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>Employee Contributions</th>
                      <th rowSpan="5" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>Total Remittance to EPFO</th>
                    </tr>
                    <tr style={{ height: '20px', backgroundColor: '#EEECE1', fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' }}>
                      <th colSpan="2" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>PF Contri for the Month (B)</th>
                      <th colSpan="2" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>Arrears of Contri. (C)</th>
                      <th colSpan="3" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>Administration Charges for PF Contribution for the month<br/>(B)</th>
                      <th rowSpan="4" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>Total ER Liability</th>
                      <th rowSpan="4" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>PF Contri for the Month</th>
                      <th rowSpan="4" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>Arrears of Contri</th>
                      <th rowSpan="4" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>Volunt. Contri</th>
                      <th rowSpan="4" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>Total EE Liability</th>
                    </tr>
                    <tr style={{ height: '20px', backgroundColor: '#EEECE1', fontWeight: 'bold', textAlign: 'center' }}>
                      <th style={{ border: '1px solid #7F7F7F' }}>AC 1</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>AC 10</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>AC 1</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>AC 10</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>AC2</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>AC21</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>AC22</th>
                    </tr>
                    <tr style={{ height: '40px', backgroundColor: '#EEECE1', fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' }}>
                      <th rowSpan="2" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>PF-( Ax3.67%)</th>
                      <th rowSpan="2" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>PFS - (Ax8.33%)<br/>(8.33 % + 1.16 % w.r.to 12% of BP+DA and 15000/-)<br/>Total EPS Contribution</th>
                      <th rowSpan="2" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>PF- (Cx3.67/12)</th>
                      <th rowSpan="2" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>PFS -(Cx 8.33/12)</th>
                      <th style={{ border: '1px solid #7F7F7F', padding: '5px' }}>Adm.Ch - (0.50% of Basic + DA)</th>
                      <th rowSpan="2" style={{ border: '1px solid #7F7F7F', padding: '5px' }}>EDLI - (Ax 0.50%)</th>
                      <th style={{ border: '1px solid #7F7F7F', padding: '5px' }}>AdCh-EDLI -(Ax 0.01%)</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>AC 1</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>AC 1</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>AC 1</th>
                    </tr>
                    <tr style={{ height: '20px', backgroundColor: '#EEECE1', fontWeight: 'bold', textAlign: 'center' }}>
                      <th style={{ border: '1px solid #7F7F7F' }}>Min.500/Estt.</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>Min.200/Estt.</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>PF-12%</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>(Entire Amt)</th>
                      <th style={{ border: '1px solid #7F7F7F' }}>(Entire Amt.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawPermanentData.map((emp, index) => {
                      const isDep = emp.appointment_type === 'Deputation';
                      const wages = emp.wages || 0;
                      const epf_wage = isDep ? 0 : (emp.epf_wage || 0);
                      const eps_wage = isDep ? 0 : (emp.eps_wage || 0);
                      
                      const eps_contrib = eps_wage > 0 
                        ? Math.round(eps_wage * 0.0833 + Math.max(0, eps_wage - 15000) * 0.0116)
                        : 0;
                        
                      const pf_contrib = isDep ? 0 : (Math.round(epf_wage * 0.12) - eps_contrib);
                      const admin_charges = isDep ? 0 : Math.round(epf_wage * 0.005);
                      const edli = isDep ? 0 : Math.round(Math.min(epf_wage, 15000) * 0.005);
                      const total_er = isDep ? 0 : (pf_contrib + eps_contrib + admin_charges + edli);
                      
                      const ee_contrib = emp.employee_contribution || 0;
                      const total_ee = ee_contrib;
                      const total_remit = total_er + total_ee;

                      // Color based on doj
                      let rowBg = '#FFFFFF';
                      const doj = emp.date_of_joining;
                      if (doj) {
                        if (doj < '2014-09-01') rowBg = '#E2EFDA';
                        else if (doj < '2025-08-01') rowBg = '#FFF2CC';
                        else rowBg = '#E2D9F2';
                      }

                      return (
                        <tr key={index} className={emp.is_active === 0 ? 'inactive-row' : ''} style={{ height: '22px', backgroundColor: emp.is_active === 0 ? '#fff7ed' : rowBg }}>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'center' }}>{index + 1}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'left', padding: '0 5px', color: emp.is_active === 0 ? '#c2410c' : 'inherit' }}>
                            {emp.name ? String(emp.name).toUpperCase() : ''}{emp.is_active === 0 ? ' [INACTIVE]' : ''}
                          </td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'left', padding: '0 5px' }}>{emp.designation || ''}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{wages.toFixed(2)}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{isDep ? '-' : epf_wage.toFixed(2)}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{isDep ? '-' : pf_contrib.toFixed(2)}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{isDep ? '-' : eps_contrib.toFixed(2)}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{isDep ? '-' : '0.00'}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{isDep ? '-' : '0.00'}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{isDep ? '-' : admin_charges.toFixed(2)}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{isDep ? '-' : edli.toFixed(2)}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{isDep ? '-' : '0.00'}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{isDep ? '-' : total_er.toFixed(2)}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'center', backgroundColor: '#FFFFFF' }}></td> {/* spacer */}
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{ee_contrib.toFixed(2)}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>0.00</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>-</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{total_ee.toFixed(2)}</td>
                          <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{total_remit.toFixed(2)}</td>
                        </tr>
                      );
                    })}

                    {/* Total Rows */}
                    {(() => {
                      const t = rawPermanentData.reduce((acc, emp) => {
                        const isDep = emp.appointment_type === 'Deputation';
                        const wages = emp.wages || 0;
                        const epf_wage = isDep ? 0 : (emp.epf_wage || 0);
                        const eps_wage = isDep ? 0 : (emp.eps_wage || 0);
                        const eps_contrib = eps_wage > 0 
                          ? Math.round(eps_wage * 0.0833 + Math.max(0, eps_wage - 15000) * 0.0116)
                          : 0;
                        const pf_contrib = isDep ? 0 : (Math.round(epf_wage * 0.12) - eps_contrib);
                        const admin_charges = isDep ? 0 : Math.round(epf_wage * 0.005);
                        const edli = isDep ? 0 : Math.round(Math.min(epf_wage, 15000) * 0.005);
                        const total_er = isDep ? 0 : (pf_contrib + eps_contrib + admin_charges + edli);
                        
                        const ee_contrib = emp.employee_contribution || 0;
                        const total_ee = ee_contrib;
                        const total_remit = total_er + total_ee;
                        
                        acc.wages += wages;
                        acc.epf_wage += epf_wage;
                        acc.pf_contrib += pf_contrib;
                        acc.eps_contrib += eps_contrib;
                        acc.admin_charges += admin_charges;
                        acc.edli += edli;
                        acc.total_er += total_er;
                        acc.ee_contrib += ee_contrib;
                        acc.total_ee += total_ee;
                        acc.total_remit += total_remit;
                        return acc;
                      }, { wages: 0, epf_wage: 0, pf_contrib: 0, eps_contrib: 0, admin_charges: 0, edli: 0, total_er: 0, ee_contrib: 0, total_ee: 0, total_remit: 0 });

                      const depRowIndex = rawPermanentData.findIndex(emp => emp.appointment_type === 'Deputation');
                      const depEmp = depRowIndex !== -1 ? rawPermanentData[depRowIndex] : null;
                      const depRemit = depEmp ? (depEmp.employee_contribution || 0) : 0;
                      const epfoRemit = t.total_remit - depRemit;

                      return (
                        <>
                          {/* Row 21 Equivalent */}
                          <tr style={{ height: '22px', backgroundColor: '#E2DDCD', fontWeight: 'bold', color: '#C00000' }}>
                            <td colSpan="3" style={{ border: '1px solid #BFBFBF', textAlign: 'center' }}>TOTAL</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{t.wages.toFixed(2)}</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{t.epf_wage.toFixed(2)}</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{t.pf_contrib.toFixed(2)}</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{t.eps_contrib.toFixed(2)}</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>0.00</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>0.00</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{t.admin_charges.toFixed(2)}</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{t.edli.toFixed(2)}</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>0.00</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{t.total_er.toFixed(2)}</td>
                            <td style={{ border: '1px solid #BFBFBF', backgroundColor: '#FFFFFF' }}></td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{t.ee_contrib.toFixed(2)}</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>0.00</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>0.00</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{t.total_ee.toFixed(2)}</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right', padding: '0 5px' }}>{t.total_remit.toFixed(2)}</td>
                          </tr>
                          {/* Row 22 Equivalent */}
                          <tr style={{ height: '22px', backgroundColor: '#E2DDCD', fontWeight: 'bold', color: '#C00000' }}>
                            <td colSpan="5" style={{ border: '1px solid #BFBFBF', textAlign: 'center' }}>TOTAL</td>
                            <td colSpan="2" style={{ border: '1px solid #BFBFBF', textAlign: 'center' }}>{(t.pf_contrib + t.eps_contrib).toFixed(2)}</td>
                            <td colSpan="2" style={{ border: '1px solid #BFBFBF', textAlign: 'center' }}>0.00</td>
                            <td colSpan="2" style={{ border: '1px solid #BFBFBF', textAlign: 'center' }}>{(t.admin_charges + t.edli).toFixed(2)}</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right' }}>0.00</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right' }}>{t.total_er.toFixed(2)}</td>
                            <td style={{ border: '1px solid #BFBFBF', backgroundColor: '#FFFFFF' }}></td>
                            <td colSpan="3" style={{ border: '1px solid #BFBFBF' }}></td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right' }}>{t.total_ee.toFixed(2)}</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'right' }}>{t.total_remit.toFixed(2)}</td>
                          </tr>

                          {/* Remittance summary rows */}
                          <tr style={{ height: '10px' }}><td colSpan="19" style={{ border: 'none' }}></td></tr>
                          <tr style={{ height: '28px', backgroundColor: '#F2F2F2', fontSize: '12px' }}>
                            <td colSpan="2" style={{ border: 'none' }}></td>
                            <td colSpan="4" style={{ border: '1px solid #BFBFBF', textAlign: 'right', fontWeight: 'bold' }}>EPF Remitance for {monthLabel} {year}</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'left', padding: '0 5px' }}>{epfoRemit.toFixed(2)}</td>
                            <td colSpan="12" style={{ border: 'none' }}></td>
                          </tr>
                          <tr style={{ height: '28px', backgroundColor: '#F2F2F2', fontSize: '12px' }}>
                            <td colSpan="2" style={{ border: 'none' }}></td>
                            <td colSpan="4" style={{ border: '1px solid #BFBFBF', textAlign: 'right', fontWeight: 'bold' }}>EPF Remitance to HRI Allahabad for {monthLabel} {year}</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'left', padding: '0 5px' }}>{depRemit.toFixed(2)}</td>
                            <td colSpan="12" style={{ border: 'none' }}></td>
                          </tr>
                          <tr style={{ height: '28px', backgroundColor: '#F2F2F2', fontSize: '13px', fontWeight: 'bold' }}>
                            <td colSpan="2" style={{ border: 'none' }}></td>
                            <td colSpan="4" style={{ border: '1px solid #BFBFBF', textAlign: 'right' }}>TOTAL</td>
                            <td style={{ border: '1px solid #BFBFBF', textAlign: 'left', padding: '0 5px' }}>{t.total_remit.toFixed(2)}</td>
                            <td colSpan="12" style={{ border: 'none' }}></td>
                          </tr>
                          
                          {/* Note Row Banner */}
                          <tr style={{ height: '20px' }}><td colSpan="19" style={{ border: 'none' }}></td></tr>
                          <tr style={{ backgroundColor: '#FFFFFF' }}>
                            <td colSpan="2" style={{ border: 'none' }}></td>
                            <td colSpan="13" style={{ border: 'none', backgroundColor: '#92D050', color: '#000000', textAlign: 'center', padding: '15px', fontWeight: 'bold', fontSize: '14px', borderRadius: '4px' }}>
                              FROM AUGUST 2025 (01.08.2025) onwards EPF is remitting to Kozhikode EPFO Office
                            </td>
                            <td colSpan="4" style={{ border: 'none' }}></td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>EPF Challan Live Preview</h2>
              
              <div style={{ overflowX: 'auto', maxHeight: '550px', border: '1px solid var(--color-border-primary)', borderRadius: '6px', backgroundColor: '#FFFFFF', color: '#333333' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'Arial, sans-serif' }}>
                  <thead>
                    <tr style={{ height: '30px', backgroundColor: '#0000FF', color: '#FFFFFF', fontWeight: 'bold' }}>
                      <th style={{ border: 'none', padding: '6px', textAlign: 'left' }}>UAN</th>
                      <th style={{ border: 'none', padding: '6px', textAlign: 'left' }}>MEMBER NAME</th>
                      <th style={{ border: 'none', padding: '6px', textAlign: 'right' }}>GROSS WAGES</th>
                      <th style={{ border: 'none', padding: '6px', textAlign: 'right' }}>EPF WAGES</th>
                      <th style={{ border: 'none', padding: '6px', textAlign: 'right' }}>EPS WAGES</th>
                      <th style={{ border: 'none', padding: '6px', textAlign: 'right' }}>EDLI WAGES</th>
                      <th style={{ border: 'none', padding: '6px', textAlign: 'right' }}>Employee PF Contribution</th>
                      <th style={{ border: 'none', padding: '6px', textAlign: 'right' }}>Employer EPS Contribution</th>
                      <th style={{ border: 'none', padding: '6px', textAlign: 'right' }}>Employer PF Contribution</th>
                      <th style={{ border: 'none', padding: '6px', textAlign: 'right' }}>NCP DAYS</th>
                      <th style={{ border: 'none', padding: '6px', textAlign: 'right' }}>REFUND OF ADVANCES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const challanEmps = [...permanentData, ...dailyWageData];
                      return challanEmps.map((emp, index) => {
                        const epf_wage = emp.epf_wage || 0;
                        const eps_wage = emp.eps_wage || 0;
                        const edli_wages = Math.min(epf_wage, 15000);
                        const eps_contrib = eps_wage > 0 
                          ? Math.round(eps_wage * 0.0833 + Math.max(0, eps_wage - 15000) * 0.0116)
                          : 0;
                        const er_pf_contrib = Math.round(epf_wage * 0.12) - eps_contrib;

                        return (
                          <tr key={index} style={{ height: '22px', color: '#FF0000' }}>
                            <td style={{ border: 'none', padding: '4px 6px', textAlign: 'left' }}>{emp.uan ? String(emp.uan) : ''}</td>
                            <td style={{ border: 'none', padding: '4px 6px', textAlign: 'left' }}>{emp.name ? String(emp.name).toUpperCase() : ''}</td>
                            <td style={{ border: 'none', padding: '4px 6px', textAlign: 'right' }}>{(emp.wages || 0).toFixed(2)}</td>
                            <td style={{ border: 'none', padding: '4px 6px', textAlign: 'right' }}>{epf_wage.toFixed(2)}</td>
                            <td style={{ border: 'none', padding: '4px 6px', textAlign: 'right' }}>{eps_wage.toFixed(2)}</td>
                            <td style={{ border: 'none', padding: '4px 6px', textAlign: 'right' }}>{edli_wages.toFixed(2)}</td>
                            <td style={{ border: 'none', padding: '4px 6px', textAlign: 'right' }}>{(emp.employee_contribution || 0).toFixed(2)}</td>
                            <td style={{ border: 'none', padding: '4px 6px', textAlign: 'right' }}>{eps_contrib.toFixed(2)}</td>
                            <td style={{ border: 'none', padding: '4px 6px', textAlign: 'right' }}>{er_pf_contrib.toFixed(2)}</td>
                            <td style={{ border: 'none', padding: '4px 6px', textAlign: 'right' }}>0.00</td>
                            <td style={{ border: 'none', padding: '4px 6px', textAlign: 'right' }}>0.00</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EPFReports;
