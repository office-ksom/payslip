import React, { useState, useEffect } from 'react';
import { FileText, Table, Download, Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const fmt = (v) => (v === null || v === undefined || v === '') ? '' : Math.round(parseFloat(v) || 0).toFixed(2);

const ConsolidatedStatement = () => {
  const { user } = useOutletContext();
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
  
  const currentYear = new Date().getFullYear();
  const [fy, setFy] = useState(() => {
    const now = new Date();
    // If before April, default to previous year
    return now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  });
  
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(false);

  useEffect(() => {
    if (isAdmin && fy) {
      fetchEmployees(fy, selectedEmpId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, fy]);

  const fetchEmployees = async (financialYear, currentSelectedId) => {
    setFetchingEmployees(true);
    try {
      const res = await fetch(`/api/employees?fy=${financialYear}`);
      const data = await res.json();
      setEmployees(data);
      if (data.length > 0) {
        const stillExists = data.some(emp => emp.emp_id === currentSelectedId);
        if (!stillExists) {
          setSelectedEmpId(data[0].emp_id);
        }
      } else {
        setSelectedEmpId('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingEmployees(false);
    }
  };

  const handleDownload = async (format) => {
    setLoading(true);
    try {
      const url = `/api/reports/consolidated?fy=${fy}${isAdmin ? `&emp_id=${selectedEmpId}` : ''}`;
      const res = await fetch(url);
      const reportData = await res.json();

      if (reportData.error) {
        alert(reportData.error);
        return;
      }

      if (format === 'excel') {
        await generateExcel(reportData, fy);
      } else {
        await generatePDF(reportData, fy);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = async (reportData, fyStart) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Consolidated Statement');
    const { employee, earnings, deductions, arrears, surrender, festival } = reportData;

    const fyDisplay = `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
    const fullName = (employee.title ? `${employee.title} ` : '') + employee.name;

    // Title
    sheet.mergeCells('A1:Z1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'KERALA SCHOOL OF MATHEMATICS';
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center' };

    sheet.mergeCells('A2:Z2');
    const subTitleCell = sheet.getCell('A2');
    subTitleCell.value = `Consolidated Salary Statement for FY ${fyDisplay}`;
    subTitleCell.font = { bold: true, size: 12 };
    subTitleCell.alignment = { horizontal: 'center' };

    // Employee Info
    sheet.getCell('A4').value = 'Name:';
    sheet.getCell('B4').value = fullName;
    sheet.getCell('D4').value = 'Emp ID:';
    sheet.getCell('E4').value = employee.emp_id;
    sheet.getCell('A5').value = 'Designation:';
    sheet.getCell('B5').value = employee.designation;
    sheet.getCell('D5').value = 'Scale of Pay:';
    sheet.getCell('E5').value = employee.scale_of_pay;

    sheet.getColumn(1).width = 24;
    // Table Header
    const superHeaderRow = sheet.getRow(7);
    superHeaderRow.values = [
      'Payment received month', 'Earnings', '', '', '', '', '', '', '', '', '', '', 'Gross Pay', 'Deductions', '', '', '', '', '', '', '', '', '', '', 'Total Ded', 'Net Pay'
    ];
    superHeaderRow.font = { bold: true };
    const rowNum = 7;
    
    sheet.mergeCells(`A${rowNum}:A${rowNum+1}`);
    sheet.mergeCells(`B${rowNum}:L${rowNum}`); // Earnings (B to L)
    sheet.mergeCells(`M${rowNum}:M${rowNum+1}`); // Gross Pay
    sheet.mergeCells(`N${rowNum}:X${rowNum}`); // Deductions (N to X)
    sheet.mergeCells(`Y${rowNum}:Y${rowNum+1}`); // Total Ded
    sheet.mergeCells(`Z${rowNum}:Z${rowNum+1}`); // Net Pay

    const headerRow = [
      '', 'Basic Pay', 'DA', 'HRA', 'DP/GP', 'CCA', 'Spl Pay', 'Tr Allow', 'Others', 'Arrears', 'Leave Surr', 'Fest Allow', '',
      'EPF', 'CPF', 'IT', 'Prof Tax', 'SLI', 'GIS', 'LIC', 'Onam Adv', 'HRA Rec', 'Other Ded', 'Arrear IT', '', ''
    ];
    const tableHeaderRow = sheet.getRow(8);
    tableHeaderRow.values = headerRow;
    tableHeaderRow.font = { bold: true };

    const getHeaderColor = (colNumber) => {
      if (colNumber === 1) return 'FFB0BEC5'; // Gray
      if (colNumber >= 2 && colNumber <= 12) return 'FFC8E6C9'; // Light Green
      if (colNumber === 13) return 'FFBBDEFB'; // Light Blue (Gross)
      if (colNumber >= 14 && colNumber <= 24) return 'FFFFCCBC'; // Light Red
      if (colNumber === 25) return 'FFFFCCBC'; // Light Red (Total Ded)
      if (colNumber === 26) return 'FFBBDEFB'; // Light Blue (Net)
      return 'FFE0E0E0';
    };

    for (let r = rowNum; r <= rowNum + 1; r++) {
      for (let c = 1; c <= 26; c++) {
        const cell = sheet.getCell(r, c);
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        cell.fill = { type: 'pattern', pattern:'solid', fgColor: { argb: getHeaderColor(c) } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    }

    // Data Rows (salary entered from March to February)
    const months = [];
    for(let i=3; i<=14; i++) {
      const m = i > 12 ? i - 12 : i;
      const y = i > 12 ? fyStart + 1 : fyStart;
      months.push(`${y}-${String(m).padStart(2, '0')}`);
    }

    let grandTotals = Array(25).fill(0); // 2 to 26
    let currentDataRow = 9;
    months.forEach(my => {
      const e = earnings.find(x => x.month_year === my);
      const isLocked = e && e.is_approved === 1;
      const d = deductions.find(x => x.month_year === my) || {};
      
      // Find arrears for this month
      const monthArrears = arrears ? arrears.filter(x => x.bill_date && x.bill_date.substring(0, 7) === my) : [];
      const arrearAmt = isLocked ? monthArrears.reduce((sum, curr) => sum + Math.round(parseFloat(curr.arrear_amount) || 0), 0) : null;
      const arrearIT = isLocked ? monthArrears.reduce((sum, curr) => sum + Math.round(parseFloat(curr.income_tax) || 0), 0) : null;

      // Find surrender bills for this month
      const monthSurrender = surrender ? surrender.filter(x => x.bill_date && x.bill_date.substring(0, 7) === my) : [];
      const surrenderAmt = isLocked ? monthSurrender.reduce((sum, curr) => sum + Math.round(parseFloat(curr.total_amount) || 0), 0) : null;

      // Find festival allowance bills for this month
      const monthFestival = festival ? festival.filter(x => x.bill_date && x.bill_date.substring(0, 7) === my) : [];
      const festivalAmt = isLocked ? monthFestival.reduce((sum, curr) => sum + Math.round(parseFloat(curr.amount) || 0), 0) : null;

      const basic = isLocked ? Math.round(parseFloat(e.basic_pay) || 0) : null;
      const da = isLocked ? Math.round((parseFloat(e.da_state) || 0) + (parseFloat(e.da_ugc) || 0)) : null;
      const hra = isLocked ? Math.round((parseFloat(e.hra_state) || 0) + (parseFloat(e.hra_ugc) || 0)) : null;
      const dpgp = isLocked ? Math.round(parseFloat(e.dp_gp) || 0) : null;
      const cca = isLocked ? Math.round(parseFloat(e.cca) || 0) : null;
      const spl = isLocked ? Math.round((parseFloat(e.spl_pay) || 0) + (parseFloat(e.spl_allow) || 0)) : null;
      const tr = isLocked ? Math.round(parseFloat(e.tr_allow) || 0) : null;
      const otherEarn = isLocked ? Math.round(parseFloat(e.other_earnings) || 0) : null;
      const gross = isLocked ? (basic + dpgp + da + hra + spl + cca + tr + otherEarn + arrearAmt + surrenderAmt + festivalAmt) : null;
      
      const epf = isLocked ? Math.round(parseFloat(d.epf) || 0) : null;
      const cpf = isLocked ? Math.round(parseFloat(d.cpf) || 0) : null;
      const it = isLocked ? Math.round(parseFloat(d.income_tax) || 0) : null;
      const pt = isLocked ? Math.round(parseFloat(d.professional_tax) || 0) : null;
      const sli = isLocked ? Math.round(parseFloat(d.sli) || 0) : null;
      const gis = isLocked ? Math.round(parseFloat(d.gis) || 0) : null;
      const lic = isLocked ? Math.round(parseFloat(d.lic) || 0) : null;
      const adv = isLocked ? Math.round(parseFloat(d.onam_advance) || 0) : null;
      const hrRec = isLocked ? Math.round(parseFloat(d.hra_recovery) || 0) : null;
      const otherDed = isLocked ? Math.round(parseFloat(d.other_deductions) || 0) : null;
      const totDed = isLocked ? (epf + cpf + it + pt + sli + gis + lic + adv + hrRec + otherDed + arrearIT) : null;
      const net = isLocked ? (gross - totDed) : null;

      const [yearStr, monthStr] = my.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      let receivedMonth = month + 1;
      let receivedYear = year;
      if (receivedMonth > 12) {
        receivedMonth = 1;
        receivedYear = year + 1;
      }
      const calendarMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const displayMonth = `${calendarMonthNames[receivedMonth - 1]} ${receivedYear}`;

      const rowValues = [
        displayMonth,
        basic, da, hra, dpgp, cca, spl, tr, otherEarn, arrearAmt, surrenderAmt, festivalAmt, gross,
        epf, cpf, it, pt, sli, gis, lic, adv, hrRec, otherDed, arrearIT, totDed, net
      ];

      const r = sheet.getRow(currentDataRow++);
      r.values = rowValues;
      r.eachCell((cell, colNumber) => {
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        if (colNumber > 1) {
          cell.numFmt = '0.00';
          grandTotals[colNumber-2] += (rowValues[colNumber-1] || 0);
        }
      });
    });

    // Totals Row
    const totalRowValues = ['TOTAL', ...grandTotals];
    const tr = sheet.getRow(currentDataRow++);
    tr.values = totalRowValues;
    tr.font = { bold: true };
    tr.eachCell((cell, colNumber) => {
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      if (colNumber > 1) cell.numFmt = '0.00';
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Consolidated_Statement_${employee.emp_id}_FY${fyDisplay}.xlsx`);
  };

  const generatePDF = async (reportData, fyStart) => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
    const { employee, earnings, deductions, arrears, surrender, festival } = reportData;
    const fyDisplay = `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
    const fullName = (employee.title ? `${employee.title} ` : '') + employee.name;

    doc.setFontSize(16);
    doc.text('KERALA SCHOOL OF MATHEMATICS', doc.internal.pageSize.width / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Consolidated Salary Statement for FY ${fyDisplay}`, doc.internal.pageSize.width / 2, 22, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Name: ${fullName}`, 14, 32);
    doc.text(`Emp ID: ${employee.emp_id}`, 14, 37);
    doc.text(`Designation: ${employee.designation}`, 100, 32);
    doc.text(`Scale of Pay: ${employee.scale_of_pay}`, 100, 37);

    const months = [];
    for(let i=3; i<=14; i++) {
      const m = i > 12 ? i - 12 : i;
      const y = i > 12 ? fyStart + 1 : fyStart;
      months.push(`${y}-${String(m).padStart(2, '0')}`);
    }

    const body = [];
    let totals = Array(25).fill(0);

    months.forEach(my => {
      const e = earnings.find(x => x.month_year === my);
      const isLocked = e && e.is_approved === 1;
      const d = deductions.find(x => x.month_year === my) || {};
      
      // Find arrears for this month
      const monthArrears = arrears ? arrears.filter(x => x.bill_date && x.bill_date.substring(0, 7) === my) : [];
      const arrearAmt = isLocked ? monthArrears.reduce((sum, curr) => sum + Math.round(parseFloat(curr.arrear_amount) || 0), 0) : null;
      const arrearIT = isLocked ? monthArrears.reduce((sum, curr) => sum + Math.round(parseFloat(curr.income_tax) || 0), 0) : null;

      // Find surrender bills for this month
      const monthSurrender = surrender ? surrender.filter(x => x.bill_date && x.bill_date.substring(0, 7) === my) : [];
      const surrenderAmt = isLocked ? monthSurrender.reduce((sum, curr) => sum + Math.round(parseFloat(curr.total_amount) || 0), 0) : null;

      // Find festival allowance bills for this month
      const monthFestival = festival ? festival.filter(x => x.bill_date && x.bill_date.substring(0, 7) === my) : [];
      const festivalAmt = isLocked ? monthFestival.reduce((sum, curr) => sum + Math.round(parseFloat(curr.amount) || 0), 0) : null;

      const basic = isLocked ? Math.round(parseFloat(e.basic_pay) || 0) : null;
      const da = isLocked ? Math.round((parseFloat(e.da_state) || 0) + (parseFloat(e.da_ugc) || 0)) : null;
      const hra = isLocked ? Math.round((parseFloat(e.hra_state) || 0) + (parseFloat(e.hra_ugc) || 0)) : null;
      const dpgp = isLocked ? Math.round(parseFloat(e.dp_gp) || 0) : null;
      const cca = isLocked ? Math.round(parseFloat(e.cca) || 0) : null;
      const spl = isLocked ? Math.round((parseFloat(e.spl_pay) || 0) + (parseFloat(e.spl_allow) || 0)) : null;
      const tr = isLocked ? Math.round(parseFloat(e.tr_allow) || 0) : null;
      const otherEarn = isLocked ? Math.round(parseFloat(e.other_earnings) || 0) : null;
      const gross = isLocked ? (basic + dpgp + da + hra + spl + cca + tr + otherEarn + arrearAmt + surrenderAmt + festivalAmt) : null;
      
      const epf = isLocked ? Math.round(parseFloat(d.epf) || 0) : null;
      const cpf = isLocked ? Math.round(parseFloat(d.cpf) || 0) : null;
      const it = isLocked ? Math.round(parseFloat(d.income_tax) || 0) : null;
      const pt = isLocked ? Math.round(parseFloat(d.professional_tax) || 0) : null;
      const sli = isLocked ? Math.round(parseFloat(d.sli) || 0) : null;
      const gis = isLocked ? Math.round(parseFloat(d.gis) || 0) : null;
      const lic = isLocked ? Math.round(parseFloat(d.lic) || 0) : null;
      const adv = isLocked ? Math.round(parseFloat(d.onam_advance) || 0) : null;
      const hrRec = isLocked ? Math.round(parseFloat(d.hra_recovery) || 0) : null;
      const otherDed = isLocked ? Math.round(parseFloat(d.other_deductions) || 0) : null;
      const totDed = isLocked ? (epf + cpf + it + pt + sli + gis + lic + adv + hrRec + otherDed + arrearIT) : null;
      const net = isLocked ? (gross - totDed) : null;

      const [yearStr, monthStr] = my.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      let receivedMonth = month + 1;
      if (receivedMonth > 12) {
        receivedMonth = 1;
      }
      const calendarMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const displayMonth = calendarMonthNames[receivedMonth - 1];

      const row = [
        displayMonth,
        fmt(basic), fmt(da), fmt(hra), fmt(dpgp), fmt(cca), fmt(spl), fmt(tr), fmt(otherEarn), fmt(arrearAmt), fmt(surrenderAmt), fmt(festivalAmt), fmt(gross),
        fmt(epf), fmt(cpf), fmt(it), fmt(pt), fmt(sli), fmt(gis), fmt(lic), fmt(adv), fmt(hrRec), fmt(otherDed), fmt(arrearIT),
        fmt(totDed), fmt(net)
      ];
      body.push(row);

      [basic, da, hra, dpgp, cca, spl, tr, otherEarn, arrearAmt, surrenderAmt, festivalAmt, gross,
       epf, cpf, it, pt, sli, gis, lic, adv, hrRec, otherDed, arrearIT, totDed, net].forEach((v, idx) => totals[idx] += (v || 0));
    });

    body.push([{ content: 'TOTAL', styles: { fontStyle: 'bold' } }, ...totals.map(v => ({ content: fmt(v), styles: { fontStyle: 'bold' } }))]);

    autoTable(doc, {
      startY: 45,
      head: [
        [
          { content: 'Payment received month', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [176, 190, 197] } },
          { content: 'Earnings', colSpan: 11, styles: { halign: 'center', fillColor: [200, 230, 201] } },
          { content: 'Gross', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [187, 222, 251] } },
          { content: 'Deductions', colSpan: 11, styles: { halign: 'center', fillColor: [255, 204, 188] } },
          { content: 'TotDed', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [255, 204, 188] } },
          { content: 'NetPay', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [187, 222, 251] } }
        ],
        [
          ...['Basic', 'DA', 'HRA', 'DP/GP', 'CCA', 'SplP', 'TrAl', 'Oth', 'Arrears', 'Surr', 'Fest'].map(c => ({ content: c, styles: { fillColor: [200, 230, 201], halign: 'center' } })),
          ...['EPF', 'CPF', 'IT', 'PT', 'SLI', 'GIS', 'LIC', 'Adv', 'Rec', 'Oth', 'ArrIT'].map(c => ({ content: c, styles: { fillColor: [255, 204, 188], halign: 'center' } }))
        ]
      ],
      body: body,
      theme: 'grid',
      styles: { fontSize: 5.8, cellPadding: 0.6, overflow: 'linebreak' },
      headStyles: { textColor: 0, lineColor: [0, 0, 0], lineWidth: 0.1 },
      columnStyles: { 0: { cellWidth: 20 } }
    });

    doc.save(`Consolidated_Statement_${employee.emp_id}_FY${fyDisplay}.pdf`);
  };

  const fyOptions = [];
  for (let year = currentYear; year >= 2020; year--) {
    fyOptions.push(year);
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Consolidated FY Statement (individual)</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Download a consolidated salary summary for the financial year (salary entered from March to February, paid from April to March).
        </p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label className="form-label">Financial Year</label>
          <select className="form-control" value={fy} onChange={(e) => setFy(parseInt(e.target.value))}>
            {fyOptions.map(year => (
              <option key={year} value={year}>{year}-{ (year + 1).toString().slice(-2) }</option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <div className="form-group">
            <label className="form-label">Select Employee</label>
            {fetchingEmployees ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                <Loader2 className="animate-spin" size={16} /> Loading employees...
              </div>
            ) : (
              <select className="form-control" value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)}>
                {employees.map(emp => (
                  <option key={emp.emp_id} value={emp.emp_id}>
                    {emp.emp_id} - {emp.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => handleDownload('pdf')} 
            disabled={loading || (isAdmin && !selectedEmpId)}
            style={{ flex: 1 }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            Download PDF
          </button>
          <button 
            className="btn" 
            onClick={() => handleDownload('excel')} 
            disabled={loading || (isAdmin && !selectedEmpId)}
            style={{ flex: 1, backgroundColor: 'var(--color-success)', color: '#fff' }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Table size={18} />}
            Download Excel
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Important Note</h4>
        <ul style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', paddingLeft: '1.25rem' }}>
          <li>The statement covers the salary entered from March to February (received from April to March).</li>
          <li>Data is aggregated from monthly records. If a month is missing, it will show as zero.</li>
          <li>For official tax purposes, please consult the accounts department.</li>
        </ul>
      </div>
    </div>
  );
};

export default ConsolidatedStatement;
