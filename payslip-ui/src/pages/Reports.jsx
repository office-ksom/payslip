import React, { useState, useEffect } from 'react';
import { FileText, Table, Mail, CheckSquare, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const fmt = (v) => (parseFloat(v) || 0).toFixed(2);

const formatMonthYear = (myStr) => {
  if (!myStr || !/^\d{4}-\d{2}$/.test(myStr)) return myStr;
  const [year, month] = myStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(month, 10) - 1;
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${year}-${months[monthIdx]}`;
  }
  return myStr;
};

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.src = src;
  img.onload = () => resolve(img);
  img.onerror = (e) => reject(e);
});

// ── HEADER HELPER FOR PDFS ────────────────────────────────────────────────
const addKSoMHeader = (doc, logoImg, margin, pageW) => {
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', margin + 2, 10, 20, 20);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('KERALA SCHOOL OF MATHEMATICS', pageW / 2, 16, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('An autonomous institution jointly established by the Science & Technology Department, Government of Kerala', pageW / 2, 21, { align: 'center' });
  doc.text('and the Department of Atomic Energy, Government of India', pageW / 2, 25, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Kunnamangalam P O, Kozhikode, Kerala - 673 571', pageW / 2, 31, { align: 'center' });
};

// ── WATERMARK & SEAL HELPER FOR PDFS ──────────────────────────────────────
const addSealAndWatermark = (doc, logoImg, sealImg, margin, pageW, sigY, record, usersList = []) => {
  if (logoImg) {
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    const wmSize = 130;
    doc.addImage(logoImg, 'PNG', (pageW - wmSize) / 2, 90, wmSize, wmSize);
    doc.setGState(new doc.GState({ opacity: 1 }));
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text("Sd/-", pageW / 2 - 2, sigY - 8);
  doc.text("Sd/-", pageW - margin - 20, sigY - 8);
  
  doc.setFont('helvetica', 'normal');
  doc.line(pageW / 2 - 15, sigY - 5, pageW / 2 + 25, sigY - 5);
  doc.line(pageW - margin - 35, sigY - 5, pageW - margin, sigY - 5);
  
  doc.text("Prepared by Asst-Accounts", pageW / 2 - 15, sigY);
  doc.text("Authorised Signatory", pageW - margin - 35, sigY);

  if (sealImg) {
    const sealSize = 25;
    doc.addImage(sealImg, 'PNG', margin, sigY - sealSize, sealSize, sealSize);
  }

  let tsString = "";
  if (record.is_approved === 1) {
    const appDate = new Date(record.approved_on);
    const appDateStr = appDate.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    tsString = `Verified on ${appDateStr}`;
  } else {
    const now = new Date();
    tsString = `Statement generated at: ${now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`;
  }

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(tsString, pageW - margin, sigY + 8, { align: 'right' });
  doc.setTextColor(0, 0, 0);
};

// ── REGULAR PAYSLIP PDF ───────────────────────────────────────────────────
const generatePDFPayslip = async (employee, monthYear, activeRule = {}, returnBase64 = false, usersList = []) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - 2 * margin;

  let logoImg = null;
  let sealImg = null;
  try { logoImg = await loadImage('/logo.png'); } catch(e){}
  try { sealImg = await loadImage('/KSoM_seal.png'); } catch(e){}

  addKSoMHeader(doc, logoImg, margin, pageW);

  // PAY SLIP INFO TABLE
  const infoY = 38;
  const infoH = 55;
  doc.setLineWidth(0.4);
  doc.rect(margin, infoY, contentW, infoH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PAY SLIP', pageW / 2, infoY + 7, { align: 'center' });
  doc.line(margin, infoY + 10, margin + contentW, infoY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const col1X = margin + 3;
  const col1ValX = margin + 38;
  const col2X = margin + contentW / 2 + 3;
  const col2ValX = margin + contentW / 2 + 40;
  const rowH = 8.5;
  const startY = infoY + 15;

  const [yr, mn] = (monthYear || '').split('-');
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthDisplay = mn ? `${monthNames[parseInt(mn)-1]} ${yr}` : monthYear;

  const infoRows = [
    ['Name', (employee.title ? `${employee.title} ` : '') + (employee.name || ''), 'Month & Year', monthDisplay],
    ['Designation', employee.designation || '', 'Employee ID', employee.emp_id || ''],
    ['Scale of Pay', employee.scale_of_pay || '', 'Category', (employee.category || '').toUpperCase()],
    ['D.O.B', employee.date_of_birth || '', 'D.O.J', employee.date_of_joining || ''],
    ['EPF UAN', employee.epf_uan || '', '', ''],
  ];

  infoRows.forEach((row, i) => {
    const y = startY + i * rowH;
    doc.setFont('helvetica', 'bold');
    doc.text(row[0] + ' :', col1X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], col1ValX, y);
    if (row[2]) {
      doc.setFont('helvetica', 'bold');
      doc.text(row[2] + ' :', col2X, y);
      doc.setFont('helvetica', 'normal');
      doc.text(row[3], col2ValX, y);
    }
    doc.line(margin + contentW / 2, infoY + 10, margin + contentW / 2, infoY + infoH);
  });

  const isState = employee.category === 'state';
  const isUGC = employee.category === 'ugc/csir' || employee.category === 'ugc';
  const da_pct = isState ? (activeRule.da_state_percentage || 0) : isUGC ? (activeRule.da_ugc_percentage || 0) : 0;
  const hra_pct = isState ? (activeRule.hra_state_percentage || 0) : isUGC ? (activeRule.hra_ugc_percentage || 0) : 0;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text(`DA: ${da_pct}%  |  HRA: ${hra_pct}%`, margin, infoY + infoH + 3);

  // EARNINGS & DEDUCTIONS SIDE-BY-SIDE
  const tableTop = infoY + infoH + 6;
  const halfW = contentW / 2 - 1;

  const da = (parseFloat(employee.da_state) || 0) + (parseFloat(employee.da_ugc) || 0);
  const hra = (parseFloat(employee.hra_state) || 0) + (parseFloat(employee.hra_ugc) || 0);

  let otherEarnRows = [];
  try {
    const arr = typeof employee.other_earnings_breakdown === 'string' ? JSON.parse(employee.other_earnings_breakdown) : (employee.other_earnings_breakdown || []);
    if (arr.length > 0) {
      otherEarnRows = arr.map(a => [a.desc || 'Other Earnings', fmt(a.amount)]);
    } else {
      otherEarnRows = [['Others', fmt(employee.other_earnings)]];
    }
  } catch(e) {
    otherEarnRows = [['Others', fmt(employee.other_earnings)]];
  }

  const earningsRows = [
    ['Basic Pay', fmt(employee.basic_pay)],
    ['DA', fmt(da)],
    ['HRA', fmt(hra)],
    ['DP / GP', fmt(employee.dp_gp)],
    ['CCA', fmt(employee.cca)],
    ['Spl. Pay', fmt(employee.spl_pay)],
    ['Tr. Allow', fmt(employee.tr_allow)],
    ['Spl. Allow.', fmt(employee.spl_allow)],
    ['Fest. Allow.', fmt(employee.fest_allow)],
    ...otherEarnRows
  ];

  let otherDeduxRows = [];
  try {
    const arr = typeof employee.other_deductions_breakdown === 'string' ? JSON.parse(employee.other_deductions_breakdown) : (employee.other_deductions_breakdown || []);
    if (arr.length > 0) {
      otherDeduxRows = arr.map(a => [a.desc || 'Other Deductions', fmt(a.amount)]);
    } else {
      otherDeduxRows = [['Others', fmt(employee.other_deductions)]];
    }
  } catch(e) {
    otherDeduxRows = [['Others', fmt(employee.other_deductions)]];
  }

  const deductionsRows = [
    ['EPF', fmt(employee.epf)],
    ['CPF', fmt(employee.cpf)],
    ['Professional Tax', fmt(employee.professional_tax)],
    ['SLI', fmt(employee.sli)],
    ['GIS', fmt(employee.gis)],
    ['LIC', fmt(employee.lic)],
    ['Income Tax', fmt(employee.income_tax)],
    ['Onam Advance', fmt(employee.onam_advance)],
    ['HRA Recovery', fmt(employee.hra_recovery)],
    ...otherDeduxRows
  ];

  const grossPay = earningsRows.reduce((s, r) => s + parseFloat(r[1]), 0);
  const totalDeductions = deductionsRows.reduce((s, r) => s + parseFloat(r[1]), 0);

  autoTable(doc, {
    startY: tableTop,
    margin: { left: margin, right: margin + halfW + 2 },
    head: [[{ content: 'Earnings', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold', fillColor: [230, 240, 255] } }],
           ['Item', 'Amount (Rs)']],
    body: earningsRows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, textColor: 20 },
    headStyles: { fillColor: [200, 220, 255], textColor: 20, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: halfW * 0.6 }, 1: { cellWidth: halfW * 0.4, halign: 'right' } },
  });

  const earningsTableFinalY = doc.lastAutoTable.finalY;

  autoTable(doc, {
    startY: earningsTableFinalY,
    margin: { left: margin, right: margin + halfW + 2 },
    body: [[{ content: 'GROSS PAY', styles: { fontStyle: 'bold' } }, { content: fmt(grossPay), styles: { fontStyle: 'bold', halign: 'right' } }]],
    theme: 'grid',
    styles: { fontSize: 9.5, cellPadding: 2, fillColor: [240, 248, 255] },
    columnStyles: { 0: { cellWidth: halfW * 0.6 }, 1: { cellWidth: halfW * 0.4 } },
  });

  autoTable(doc, {
    startY: tableTop,
    margin: { left: margin + halfW + 2, right: margin },
    head: [[{ content: 'Deductions', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 230, 230] } }],
           ['Item', 'Amount (Rs)']],
    body: deductionsRows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, textColor: 20 },
    headStyles: { fillColor: [255, 200, 200], textColor: 20, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: halfW * 0.6 }, 1: { cellWidth: halfW * 0.4, halign: 'right' } },
  });

  const deductionsTableFinalY = doc.lastAutoTable.finalY;

  autoTable(doc, {
    startY: deductionsTableFinalY,
    margin: { left: margin + halfW + 2, right: margin },
    body: [[{ content: 'TOTAL DEDUCTIONS', styles: { fontStyle: 'bold' } }, { content: fmt(totalDeductions), styles: { fontStyle: 'bold', halign: 'right' } }]],
    theme: 'grid',
    styles: { fontSize: 9.5, cellPadding: 2, fillColor: [255, 245, 245] },
    columnStyles: { 0: { cellWidth: halfW * 0.6 }, 1: { cellWidth: halfW * 0.4 } },
  });

  const netPay = grossPay - totalDeductions;
  const netY = Math.max(earningsTableFinalY, deductionsTableFinalY) + 12;

  autoTable(doc, {
    startY: netY,
    margin: { left: margin },
    tableWidth: contentW,
    body: [[
      { content: 'NET PAY', styles: { fontStyle: 'bold', fontSize: 11 } },
      { content: `Rs. ${fmt(netPay)}`, styles: { fontStyle: 'bold', fontSize: 11, halign: 'right' } }
    ]],
    theme: 'grid',
    styles: { cellPadding: 3, fillColor: [220, 250, 235] },
    columnStyles: { 0: { cellWidth: contentW * 0.7 }, 1: { cellWidth: contentW * 0.3 } },
  });

  const sigY = doc.lastAutoTable.finalY + 25;
  addSealAndWatermark(doc, logoImg, sealImg, margin, pageW, sigY, employee, usersList);

  const fullName = (employee.title ? `${employee.title} ` : '') + (employee.name || 'Emp');
  const fileName = `Payslip_${fullName.replace(/\s+/g, '_')}_${formatMonthYear(monthYear)}.pdf`;
  if (returnBase64) {
    return { fileName, content: doc.output('datauristring').split(',')[1] };
  } else {
    doc.save(fileName);
  }
};

// ── SURRENDER BILL PDF ────────────────────────────────────────────────────
const generatePDFSurrender = async (employee, monthYear, returnBase64 = false, usersList = []) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - 2 * margin;

  let logoImg = null;
  let sealImg = null;
  try { logoImg = await loadImage('/logo.png'); } catch(e){}
  try { sealImg = await loadImage('/KSoM_seal.png'); } catch(e){}

  addKSoMHeader(doc, logoImg, margin, pageW);

  const infoY = 38;
  const infoH = 50;
  doc.setLineWidth(0.4);
  doc.rect(margin, infoY, contentW, infoH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('EARNED LEAVE SURRENDER PAYSLIP', pageW / 2, infoY + 7, { align: 'center' });
  doc.line(margin, infoY + 10, margin + contentW, infoY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const col1X = margin + 3;
  const col1ValX = margin + 38;
  const col2X = margin + contentW / 2 + 3;
  const col2ValX = margin + contentW / 2 + 40;
  const rowH = 8.5;
  const startY = infoY + 15;

  const infoRows = [
    ['Name', (employee.title ? `${employee.title} ` : '') + (employee.name || ''), 'Surrender Date', employee.bill_date || ''],
    ['Designation', employee.designation || '', 'Employee ID', employee.emp_id || ''],
    ['Category', (employee.category || '').toUpperCase(), 'Financial Year', employee.financial_year || ''],
    ['ELs Surrendered', `${employee.num_els || 0} days`, '', '']
  ];

  infoRows.forEach((row, i) => {
    const y = startY + i * rowH;
    doc.setFont('helvetica', 'bold');
    doc.text(row[0] + ' :', col1X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], col1ValX, y);
    if (row[2]) {
      doc.setFont('helvetica', 'bold');
      doc.text(row[2] + ' :', col2X, y);
      doc.setFont('helvetica', 'normal');
      doc.text(row[3], col2ValX, y);
    }
    doc.line(margin + contentW / 2, infoY + 10, margin + contentW / 2, infoY + infoH);
  });

  const tableTop = infoY + infoH + 8;
  autoTable(doc, {
    startY: tableTop,
    margin: { left: margin, right: margin },
    head: [['Item Description', 'Calculation Factors', 'Amount (Rs)']],
    body: [
      ['Basic Pay', `Base basic pay for calculation`, fmt(employee.basic_pay)],
      ['Dearness Allowance (DA)', `Calculated DA`, fmt(employee.da)],
      ['HRA Payout', `House Rent Allowance (if applicable)`, fmt(employee.hra)],
      ['No. of ELs Surrendered', `${employee.num_els} days`, `${employee.num_els} / 30`],
      [{ content: 'TOTAL LEAVE SURRENDER PAYOUT', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [220, 250, 235] } }, 
       { content: `Rs. ${employee.total_amount?.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 250, 235] } }]
    ],
    theme: 'grid',
    styles: { fontSize: 9.5, cellPadding: 4, textColor: 20 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: contentW * 0.4 }, 1: { cellWidth: contentW * 0.35 }, 2: { cellWidth: contentW * 0.25, halign: 'right' } },
  });

  const formulaY = doc.lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8.5);
  doc.text(`* Formula: (Basic Pay + DA + HRA) / 30 * Leaves Surrendered`, margin, formulaY);

  const sigY = formulaY + 25;
  addSealAndWatermark(doc, logoImg, sealImg, margin, pageW, sigY, employee, usersList);

  const fullName = (employee.title ? `${employee.title} ` : '') + (employee.name || 'Emp');
  const fileName = `LeaveSurrender_${fullName.replace(/\s+/g, '_')}_${formatMonthYear(monthYear)}.pdf`;
  if (returnBase64) {
    return { fileName, content: doc.output('datauristring').split(',')[1] };
  } else {
    doc.save(fileName);
  }
};

// ── ARREAR STATEMENT PDF ──────────────────────────────────────────────────
const generatePDFArrear = async (employee, monthYear, returnBase64 = false, usersList = []) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - 2 * margin;

  let logoImg = null;
  let sealImg = null;
  try { logoImg = await loadImage('/logo.png'); } catch(e){}
  try { sealImg = await loadImage('/KSoM_seal.png'); } catch(e){}

  addKSoMHeader(doc, logoImg, margin, pageW);

  const infoY = 38;
  const infoH = 42;
  doc.setLineWidth(0.4);
  doc.rect(margin, infoY, contentW, infoH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SALARY ARREAR STATEMENT', pageW / 2, infoY + 7, { align: 'center' });
  doc.line(margin, infoY + 10, margin + contentW, infoY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const col1X = margin + 3;
  const col1ValX = margin + 38;
  const col2X = margin + contentW / 2 + 3;
  const col2ValX = margin + contentW / 2 + 40;
  const rowH = 8.5;
  const startY = infoY + 15;

  const infoRows = [
    ['Name', (employee.title ? `${employee.title} ` : '') + (employee.name || ''), 'Bill Date', employee.bill_date || ''],
    ['Designation', employee.designation || '', 'Employee ID', employee.emp_id || ''],
    ['Category', (employee.category || '').toUpperCase(), 'Arrear Type', employee.arrear_type || '']
  ];

  infoRows.forEach((row, i) => {
    const y = startY + i * rowH;
    doc.setFont('helvetica', 'bold');
    doc.text(row[0] + ' :', col1X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], col1ValX, y);
    if (row[2]) {
      doc.setFont('helvetica', 'bold');
      doc.text(row[2] + ' :', col2X, y);
      doc.setFont('helvetica', 'normal');
      doc.text(row[3], col2ValX, y);
    }
    doc.line(margin + contentW / 2, infoY + 10, margin + contentW / 2, infoY + infoH);
  });

  const tableTop = infoY + infoH + 8;
  autoTable(doc, {
    startY: tableTop,
    margin: { left: margin, right: margin },
    head: [['Earnings Description', 'Gross Arrear (Rs)', 'Deduction (IT) (Rs)', 'Net Arrear Payout (Rs)']],
    body: [
      [`Arrear Payout: ${employee.description || 'Arrears payout'}`, `Rs. ${fmt(employee.arrear_amount)}`, `Rs. ${fmt(employee.income_tax)}`, `Rs. ${fmt(employee.net_amount)}`],
      [{ content: 'NET ARREAR PAYABLE AMOUNT', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [220, 250, 235] } }, 
       { content: `Rs. ${employee.net_amount?.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 250, 235] } }]
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 5, textColor: 20 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: contentW * 0.4 }, 1: { cellWidth: contentW * 0.2, halign: 'right' }, 2: { cellWidth: contentW * 0.2, halign: 'right' }, 3: { cellWidth: contentW * 0.2, halign: 'right' } },
  });

  const sigY = doc.lastAutoTable.finalY + 25;
  addSealAndWatermark(doc, logoImg, sealImg, margin, pageW, sigY, employee, usersList);

  const fullName = (employee.title ? `${employee.title} ` : '') + (employee.name || 'Emp');
  const fileName = `Arrear_${fullName.replace(/\s+/g, '_')}_${formatMonthYear(monthYear)}.pdf`;
  if (returnBase64) {
    return { fileName, content: doc.output('datauristring').split(',')[1] };
  } else {
    doc.save(fileName);
  }
};

// ── FESTIVAL ALLOWANCE PDF ───────────────────────────────────────────────
const generatePDFFestival = async (employee, monthYear, returnBase64 = false, usersList = []) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - 2 * margin;

  let logoImg = null;
  let sealImg = null;
  try { logoImg = await loadImage('/logo.png'); } catch(e){}
  try { sealImg = await loadImage('/KSoM_seal.png'); } catch(e){}

  addKSoMHeader(doc, logoImg, margin, pageW);

  const infoY = 38;
  const infoH = 42;
  doc.setLineWidth(0.4);
  doc.rect(margin, infoY, contentW, infoH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FESTIVAL ALLOWANCE SLIP', pageW / 2, infoY + 7, { align: 'center' });
  doc.line(margin, infoY + 10, margin + contentW, infoY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const col1X = margin + 3;
  const col1ValX = margin + 38;
  const col2X = margin + contentW / 2 + 3;
  const col2ValX = margin + contentW / 2 + 40;
  const rowH = 8.5;
  const startY = infoY + 15;

  const infoRows = [
    ['Name', (employee.title ? `${employee.title} ` : '') + (employee.name || ''), 'Bill Date', employee.bill_date || ''],
    ['Designation', employee.designation || '', 'Employee ID', employee.emp_id || ''],
    ['Category', (employee.category || '').toUpperCase(), '', '']
  ];

  infoRows.forEach((row, i) => {
    const y = startY + i * rowH;
    doc.setFont('helvetica', 'bold');
    doc.text(row[0] + ' :', col1X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], col1ValX, y);
    if (row[2]) {
      doc.setFont('helvetica', 'bold');
      doc.text(row[2] + ' :', col2X, y);
      doc.setFont('helvetica', 'normal');
      doc.text(row[3], col2ValX, y);
    }
    doc.line(margin + contentW / 2, infoY + 10, margin + contentW / 2, infoY + infoH);
  });

  const tableTop = infoY + infoH + 8;
  autoTable(doc, {
    startY: tableTop,
    margin: { left: margin, right: margin },
    head: [['Allowance Description', 'Payout Amount (Rs)']],
    body: [
      [`Festival Allowance: ${employee.description || 'Bonus payout'}`, `Rs. ${fmt(employee.amount)}`],
      [{ content: 'NET PAYABLE ALLOWANCE', styles: { fontStyle: 'bold', fillColor: [220, 250, 235] } }, 
       { content: `Rs. ${employee.amount?.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 250, 235] } }]
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 5, textColor: 20 },
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: contentW * 0.7 }, 1: { cellWidth: contentW * 0.3, halign: 'right' } },
  });

  const sigY = doc.lastAutoTable.finalY + 25;
  addSealAndWatermark(doc, logoImg, sealImg, margin, pageW, sigY, employee, usersList);

  const fullName = (employee.title ? `${employee.title} ` : '') + (employee.name || 'Emp');
  const fileName = `FestivalAllowance_${fullName.replace(/\s+/g, '_')}_${formatMonthYear(monthYear)}.pdf`;
  if (returnBase64) {
    return { fileName, content: doc.output('datauristring').split(',')[1] };
  } else {
    doc.save(fileName);
  }
};

// ── DIGITAL PREVIEWS FOR VIEWERS ──────────────────────────────────────────
const PayslipPreview = ({ emp, monthYear, billType }) => {
  if (!emp) return null;
  const [yr, mn] = (monthYear || '').split('-');
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthDisplay = mn ? `${monthNames[parseInt(mn)-1]} ${yr}` : monthYear;

  if (billType === 'regular') {
    const da = (parseFloat(emp.da_state) || 0) + (parseFloat(emp.da_ugc) || 0);
    const hra = (parseFloat(emp.hra_state) || 0) + (parseFloat(emp.hra_ugc) || 0);

    let otherEarnPreview = [];
    try {
      const arr = typeof emp.other_earnings_breakdown === 'string' ? JSON.parse(emp.other_earnings_breakdown) : (emp.other_earnings_breakdown || []);
      if (arr.length > 0) {
        otherEarnPreview = arr.map(a => ({ label: a.desc || 'Other Earnings', val: a.amount }));
      } else {
        otherEarnPreview = [{ label: 'Others', val: emp.other_earnings }];
      }
    } catch(e) {
      otherEarnPreview = [{ label: 'Others', val: emp.other_earnings }];
    }

    const earnings = [
      { label: 'Basic Pay', val: emp.basic_pay },
      { label: 'DA', val: da },
      { label: 'HRA', val: hra },
      { label: 'DP / GP', val: emp.dp_gp },
      { label: 'CCA', val: emp.cca },
      { label: 'Spl. Pay', val: emp.spl_pay },
      { label: 'Tr. Allow', val: emp.tr_allow },
      { label: 'Spl. Allow.', val: emp.spl_allow },
      { label: 'Fest. Allow.', val: emp.fest_allow },
      ...otherEarnPreview
    ].filter(i => parseFloat(i.val) > 0);

    let otherDeduxPreview = [];
    try {
      const arr = typeof emp.other_deductions_breakdown === 'string' ? JSON.parse(emp.other_deductions_breakdown) : (emp.other_deductions_breakdown || []);
      if (arr.length > 0) {
        otherDeduxPreview = arr.map(a => ({ label: a.desc || 'Other Deductions', val: a.amount }));
      } else {
        otherDeduxPreview = [{ label: 'Others', val: emp.other_deductions }];
      }
    } catch(e) {
      otherDeduxPreview = [{ label: 'Others', val: emp.other_deductions }];
    }

    const deductions = [
      { label: 'EPF', val: emp.epf },
      { label: 'CPF', val: emp.cpf },
      { label: 'Prof. Tax', val: emp.professional_tax },
      { label: 'SLI', val: emp.sli },
      { label: 'GIS', val: emp.gis },
      { label: 'LIC', val: emp.lic },
      { label: 'Income Tax', val: emp.income_tax },
      { label: 'Onam Adv', val: emp.onam_advance },
      { label: 'HRA Rec', val: emp.hra_recovery },
      ...otherDeduxPreview
    ].filter(i => parseFloat(i.val) > 0);

    return (
      <div style={{ marginTop: '2rem', padding: '2.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #d1d5db', maxWidth: '850px', margin: '2rem auto', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>Kerala School of Mathematics</h2>
          <p style={{ fontSize: '1.1rem', color: '#4b5563', fontWeight: 600 }}>Payslip for {monthDisplay}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', fontSize: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '1.5rem' }}>
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#6b7280', width: '110px', display: 'inline-block', fontWeight: 500 }}>Name:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.title ? `${emp.title} ` : ''}{emp.name}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280', width: '110px', display: 'inline-block', fontWeight: 500 }}>Designation:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.designation}</span>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#6b7280', width: '110px', display: 'inline-block', fontWeight: 500 }}>Emp ID:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.emp_id}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280', width: '110px', display: 'inline-block', fontWeight: 500 }}>Category:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.category?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
          <div>
            <h4 style={{ borderBottom: '2px solid #2563eb', paddingBottom: '0.5rem', marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Earnings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {earnings.map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>₹ {fmt(item.val)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb', fontWeight: '800', color: '#1e40af', fontSize: '1.1rem' }}>
              <span>GROSS PAY</span>
              <span>₹ {fmt(emp.gross)}</span>
            </div>
          </div>
          <div>
            <h4 style={{ borderBottom: '2px solid #dc2626', paddingBottom: '0.5rem', marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Deductions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {deductions.map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>₹ {fmt(item.val)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb', fontWeight: '800', color: '#991b1b', fontSize: '1.1rem' }}>
              <span>TOTAL DEDUCTIONS</span>
              <span>₹ {fmt(emp.dedux)}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '10px', border: '2px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' }}>
          <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#166534' }}>NET PAYABLE AMOUNT</span>
          <span style={{ fontWeight: '900', fontSize: '1.75rem', color: '#15803d' }}>₹ {fmt(emp.net)}</span>
        </div>
        
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#6b7280', textAlign: 'center', fontStyle: 'italic', fontWeight: 500 }}>
          * This is a high-visibility digital preview. For official purposes, please download the signed PDF payslip.
        </p>
      </div>
    );
  }

  if (billType === 'surrender') {
    return (
      <div style={{ marginTop: '2rem', padding: '2.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #d1d5db', maxWidth: '850px', margin: '2rem auto', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>Kerala School of Mathematics</h2>
          <p style={{ fontSize: '1.1rem', color: '#4b5563', fontWeight: 600 }}>Leave Surrender Statement ({emp.financial_year})</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', fontSize: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '1.5rem' }}>
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#6b7280', width: '130px', display: 'inline-block', fontWeight: 500 }}>Name:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.title ? `${emp.title} ` : ''}{emp.name}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280', width: '130px', display: 'inline-block', fontWeight: 500 }}>Designation:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.designation}</span>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#6b7280', width: '130px', display: 'inline-block', fontWeight: 500 }}>Emp ID:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.emp_id}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280', width: '130px', display: 'inline-block', fontWeight: 500 }}>Surrender Date:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.bill_date}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', maxWidth: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
            <span style={{ color: '#374151', fontWeight: 500 }}>Basic Pay:</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>₹ {fmt(emp.basic_pay)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
            <span style={{ color: '#374151', fontWeight: 500 }}>DA:</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>₹ {fmt(emp.da)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
            <span style={{ color: '#374151', fontWeight: 500 }}>HRA:</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>₹ {fmt(emp.hra)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem' }}>
            <span style={{ color: '#374151', fontWeight: 500 }}>ELs Surrendered:</span>
            <span style={{ fontWeight: 700, color: '#2563eb' }}>{emp.num_els} days</span>
          </div>
        </div>

        <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '10px', border: '2px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#166534' }}>TOTAL SURRENDER AMOUNT</span>
          <span style={{ fontWeight: '900', fontSize: '1.75rem', color: '#15803d' }}>₹ {emp.total_amount?.toLocaleString('en-IN')}</span>
        </div>
      </div>
    );
  }

  if (billType === 'arrears') {
    return (
      <div style={{ marginTop: '2rem', padding: '2.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #d1d5db', maxWidth: '850px', margin: '2rem auto', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>Kerala School of Mathematics</h2>
          <p style={{ fontSize: '1.1rem', color: '#4b5563', fontWeight: 600 }}>Salary Arrear Slip</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', fontSize: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '1.5rem' }}>
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#6b7280', width: '130px', display: 'inline-block', fontWeight: 500 }}>Name:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.title ? `${emp.title} ` : ''}{emp.name}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280', width: '130px', display: 'inline-block', fontWeight: 500 }}>Designation:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.designation}</span>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#6b7280', width: '130px', display: 'inline-block', fontWeight: 500 }}>Emp ID:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.emp_id}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280', width: '130px', display: 'inline-block', fontWeight: 500 }}>Bill Date:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.bill_date}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', maxWidth: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
            <span style={{ color: '#374151', fontWeight: 500 }}>Arrear Type:</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>{emp.arrear_type}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
            <span style={{ color: '#374151', fontWeight: 500 }}>Gross Arrear Amount:</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>₹ {fmt(emp.arrear_amount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#dc2626' }}>
            <span style={{ fontWeight: 500 }}>Income Tax Deduction (IT):</span>
            <span style={{ fontWeight: 700 }}>- ₹ {fmt(emp.income_tax)}</span>
          </div>
          {emp.description && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#6b7280', fontStyle: 'italic', borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem' }}>
              <span>Description:</span>
              <span>{emp.description}</span>
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '10px', border: '2px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#166534' }}>NET ARREAR PAYABLE</span>
          <span style={{ fontWeight: '900', fontSize: '1.75rem', color: '#15803d' }}>₹ {fmt(emp.net_amount)}</span>
        </div>
      </div>
    );
  }

  if (billType === 'festival') {
    return (
      <div style={{ marginTop: '2rem', padding: '2.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #d1d5db', maxWidth: '850px', margin: '2rem auto', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>Kerala School of Mathematics</h2>
          <p style={{ fontSize: '1.1rem', color: '#4b5563', fontWeight: 600 }}>Festival Allowance Slip</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', fontSize: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '1.5rem' }}>
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#6b7280', width: '130px', display: 'inline-block', fontWeight: 500 }}>Name:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.title ? `${emp.title} ` : ''}{emp.name}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280', width: '130px', display: 'inline-block', fontWeight: 500 }}>Designation:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.designation}</span>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#6b7280', width: '130px', display: 'inline-block', fontWeight: 500 }}>Emp ID:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.emp_id}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280', width: '130px', display: 'inline-block', fontWeight: 500 }}>Allowance Date:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{emp.bill_date}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', maxWidth: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
            <span style={{ color: '#374151', fontWeight: 500 }}>Description:</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>{emp.description || 'Festival Allowance'}</span>
          </div>
        </div>

        <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '10px', border: '2px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#166534' }}>PAYOUT AMOUNT</span>
          <span style={{ fontWeight: '900', fontSize: '1.75rem', color: '#15803d' }}>₹ {fmt(emp.amount)}</span>
        </div>
      </div>
    );
  }

  return null;
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────
const Reports = () => {
  const { user } = useOutletContext() || {};
  const isViewer = user && user.role === 'viewer';
  
  const [billType, setBillType] = useState('regular'); // 'regular', 'surrender', 'arrears', 'festival'
  const [monthYear, setMonthYear] = useState(() => {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalSettingsList, setGlobalSettingsList] = useState([]);
  const [selectedEmps, setSelectedEmps] = useState(new Set());
  const [sendingEmails, setSendingEmails] = useState(false);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsersList(Array.isArray(data) ? data : []))
      .catch(err => console.error("Failed to load users in Reports", err));
  }, []);

  useEffect(() => { 
    loadDataForMonth(monthYear, billType); 
  }, [monthYear, billType]);

  const loadDataForMonth = async (targetMonth, type) => {
    setLoading(true);
    setSelectedEmps(new Set());
    try {
      // 1. Fetch settings
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      setGlobalSettingsList(Array.isArray(settingsData) ? settingsData : []);

      // 2. Fetch specific bill records
      if (type === 'regular') {
        const [earnRes, deduxRes] = await Promise.all([
          fetch(`/api/earnings/${targetMonth}`),
          fetch(`/api/deductions/${targetMonth}`)
        ]);
        const earnData = await earnRes.json();
        const deduxData = await deduxRes.json();

        const combined = earnData.map(e => {
          const d = deduxData.find(x => x.emp_id === e.emp_id) || {};
          const da = (e.da_state||0) + (e.da_ugc||0);
          const hra = (e.hra_state||0) + (e.hra_ugc||0);
          const gross = (e.basic_pay||0)+(e.dp_gp||0)+da+hra+(e.cca||0)+(e.spl_pay||0)+(e.tr_allow||0)+(e.spl_allow||0)+(e.fest_allow||0)+(e.other_earnings||0);
          const dedux = (d.epf||0)+(d.cpf||0)+(d.professional_tax||0)+(d.income_tax||0)+(d.sli||0)+(d.gis||0)+(d.lic||0)+(d.onam_advance||0)+(d.hra_recovery||0)+(d.other_deductions||0);
          return { ...e, ...d, da, hra, gross, dedux, net: gross - dedux };
        });

        // Enforce approved bills only in Reports
        const approved = combined.filter(e => e.is_approved === 1);
        setData(approved.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));

      } else if (type === 'surrender') {
        const res = await fetch(`/api/surrender/${targetMonth}`);
        const list = await res.json();
        // Keep approved records only
        const approved = list.filter(bill => bill.bill_id !== null && bill.is_approved === 1);
        setData(approved);

      } else if (type === 'arrears') {
        const res = await fetch(`/api/arrears/${targetMonth}`);
        const list = await res.json();
        // Keep approved records only
        const approved = list.filter(bill => bill.bill_id !== null && bill.is_approved === 1);
        setData(approved);

      } else if (type === 'festival') {
        const res = await fetch(`/api/festival/${targetMonth}`);
        const list = await res.json();
        // Keep approved records only
        const approved = list.filter(bill => bill.bill_id !== null && bill.is_approved === 1);
        setData(approved);
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  // ── PROGRAMMATIC EXCEL EXPORTS (FROM SCRATCH) ───────────────────────────
  const exportSurrenderExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Surrender Bills');

    sheet.columns = [
      { header: 'Sl. No.', key: 'sl', width: 8 },
      { header: 'Employee ID', key: 'emp_id', width: 15 },
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Designation', key: 'designation', width: 22 },
      { header: 'Category', key: 'category', width: 12 },
      { header: 'Surrender Date', key: 'bill_date', width: 16 },
      { header: 'Basic Pay (Rs)', key: 'basic_pay', width: 16 },
      { header: 'DA (Rs)', key: 'da', width: 14 },
      { header: 'HRA (Rs)', key: 'hra', width: 14 },
      { header: 'ELs Surrendered', key: 'num_els', width: 16 },
      { header: 'Financial Year', key: 'financial_year', width: 16 },
      { header: 'Net Payout (Rs)', key: 'total_amount', width: 18 }
    ];

    // Add Title
    sheet.insertRow(1, []);
    sheet.insertRow(2, ['Kerala School of Mathematics - Leave Surrender Statement']);
    sheet.insertRow(3, [`Month: ${monthYear} | Generated on ${new Date().toLocaleDateString()}`]);
    sheet.insertRow(4, []);

    sheet.mergeCells('A2:L2');
    sheet.mergeCells('A3:L3');

    sheet.getCell('A2').font = { name: 'Arial', size: 14, bold: true };
    sheet.getCell('A2').alignment = { horizontal: 'center' };
    sheet.getCell('A3').font = { name: 'Arial', size: 10, italic: true };
    sheet.getCell('A3').alignment = { horizontal: 'center' };

    // Format Headers
    const headerRow = sheet.getRow(5);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' } // Modern blue
      };
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      };
    });

    let sumBasic = 0, sumDA = 0, sumHRA = 0, sumNet = 0;

    data.forEach((emp, i) => {
      sumBasic += emp.basic_pay || 0;
      sumDA += emp.da || 0;
      sumHRA += emp.hra || 0;
      sumNet += emp.total_amount || 0;

      const row = sheet.addRow({
        sl: i + 1,
        emp_id: emp.emp_id,
        name: (emp.title ? `${emp.title} ` : '') + emp.name,
        designation: emp.designation,
        category: emp.category?.toUpperCase(),
        bill_date: emp.bill_date,
        basic_pay: emp.basic_pay,
        da: emp.da,
        hra: emp.hra,
        num_els: `${emp.num_els} days`,
        financial_year: emp.financial_year,
        total_amount: emp.total_amount
      });

      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
        if (colNum === 1 || colNum === 2 || colNum === 5 || colNum === 6 || colNum === 10 || colNum === 11) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colNum === 3 || colNum === 4) {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.00';
        }
      });
    });

    // Totals row
    const totalsRow = sheet.addRow({
      sl: 'TOTAL',
      basic_pay: sumBasic,
      da: sumDA,
      hra: sumHRA,
      total_amount: sumNet
    });
    sheet.mergeCells(`A${totalsRow.number}:F${totalsRow.number}`);
    totalsRow.getCell(1).font = { name: 'Arial', size: 10, bold: true };
    totalsRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

    totalsRow.eachCell((cell, colNum) => {
      if (colNum >= 7 || colNum === 1) {
        cell.font = { name: 'Arial', size: 10, bold: true };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'double' }
        };
        if (colNum >= 7) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.00';
        }
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `KSoM_LeaveSurrender_${formatMonthYear(monthYear)}.xlsx`);
  };

  const exportArrearExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Arrear Statement');

    sheet.columns = [
      { header: 'Sl. No.', key: 'sl', width: 8 },
      { header: 'Employee ID', key: 'emp_id', width: 15 },
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Designation', key: 'designation', width: 22 },
      { header: 'Category', key: 'category', width: 12 },
      { header: 'Arrear Type', key: 'arrear_type', width: 18 },
      { header: 'Gross Arrear (Rs)', key: 'arrear_amount', width: 18 },
      { header: 'IT Deduction (Rs)', key: 'income_tax', width: 16 },
      { header: 'Net Arrear (Rs)', key: 'net_amount', width: 18 },
      { header: 'Bill Date', key: 'bill_date', width: 14 },
      { header: 'Description', key: 'description', width: 30 }
    ];

    sheet.insertRow(1, []);
    sheet.insertRow(2, ['Kerala School of Mathematics - Salary Arrears Statement']);
    sheet.insertRow(3, [`Month: ${monthYear} | Generated on ${new Date().toLocaleDateString()}`]);
    sheet.insertRow(4, []);

    sheet.mergeCells('A2:K2');
    sheet.mergeCells('A3:K3');

    sheet.getCell('A2').font = { name: 'Arial', size: 14, bold: true };
    sheet.getCell('A2').alignment = { horizontal: 'center' };
    sheet.getCell('A3').font = { name: 'Arial', size: 10, italic: true };
    sheet.getCell('A3').alignment = { horizontal: 'center' };

    const headerRow = sheet.getRow(5);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6366F1' } // Indigo
      };
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'medium' }, right: { style: 'thin' } };
    });

    let sumGross = 0, sumIT = 0, sumNet = 0;

    data.forEach((emp, i) => {
      sumGross += emp.arrear_amount || 0;
      sumIT += emp.income_tax || 0;
      sumNet += emp.net_amount || 0;

      const row = sheet.addRow({
        sl: i + 1,
        emp_id: emp.emp_id,
        name: (emp.title ? `${emp.title} ` : '') + emp.name,
        designation: emp.designation,
        category: emp.category?.toUpperCase(),
        arrear_type: emp.arrear_type,
        arrear_amount: emp.arrear_amount,
        income_tax: emp.income_tax,
        net_amount: emp.net_amount,
        bill_date: emp.bill_date,
        description: emp.description
      });

      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
        if (colNum === 1 || colNum === 2 || colNum === 5 || colNum === 10) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colNum === 3 || colNum === 4 || colNum === 6 || colNum === 11) {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.00';
        }
      });
    });

    const totalsRow = sheet.addRow({
      sl: 'TOTAL',
      arrear_amount: sumGross,
      income_tax: sumIT,
      net_amount: sumNet
    });
    sheet.mergeCells(`A${totalsRow.number}:F${totalsRow.number}`);
    totalsRow.getCell(1).font = { name: 'Arial', size: 10, bold: true };
    totalsRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

    totalsRow.eachCell((cell, colNum) => {
      if (colNum >= 7 || colNum === 1) {
        cell.font = { name: 'Arial', size: 10, bold: true };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'double' } };
        if (colNum >= 7) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.00';
        }
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `KSoM_ArrearsStatement_${formatMonthYear(monthYear)}.xlsx`);
  };

  const exportFestivalExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Festival Allowance');

    sheet.columns = [
      { header: 'Sl. No.', key: 'sl', width: 8 },
      { header: 'Employee ID', key: 'emp_id', width: 15 },
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Designation', key: 'designation', width: 22 },
      { header: 'Category', key: 'category', width: 12 },
      { header: 'Allowance Payout (Rs)', key: 'amount', width: 20 },
      { header: 'Allowance Date', key: 'bill_date', width: 16 },
      { header: 'Description', key: 'description', width: 30 }
    ];

    sheet.insertRow(1, []);
    sheet.insertRow(2, ['Kerala School of Mathematics - Festival Allowance Statement']);
    sheet.insertRow(3, [`Month: ${monthYear} | Generated on ${new Date().toLocaleDateString()}`]);
    sheet.insertRow(4, []);

    sheet.mergeCells('A2:H2');
    sheet.mergeCells('A3:H3');

    sheet.getCell('A2').font = { name: 'Arial', size: 14, bold: true };
    sheet.getCell('A2').alignment = { horizontal: 'center' };
    sheet.getCell('A3').font = { name: 'Arial', size: 10, italic: true };
    sheet.getCell('A3').alignment = { horizontal: 'center' };

    const headerRow = sheet.getRow(5);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF10B981' } // Green
      };
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'medium' }, right: { style: 'thin' } };
    });

    let sumAmt = 0;

    data.forEach((emp, i) => {
      sumAmt += emp.amount || 0;

      const row = sheet.addRow({
        sl: i + 1,
        emp_id: emp.emp_id,
        name: (emp.title ? `${emp.title} ` : '') + emp.name,
        designation: emp.designation,
        category: emp.category?.toUpperCase(),
        amount: emp.amount,
        bill_date: emp.bill_date,
        description: emp.description
      });

      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
        if (colNum === 1 || colNum === 2 || colNum === 5 || colNum === 7) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colNum === 3 || colNum === 4 || colNum === 8) {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.00';
        }
      });
    });

    const totalsRow = sheet.addRow({
      sl: 'TOTAL',
      amount: sumAmt
    });
    sheet.mergeCells(`A${totalsRow.number}:E${totalsRow.number}`);
    totalsRow.getCell(1).font = { name: 'Arial', size: 10, bold: true };
    totalsRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

    totalsRow.eachCell((cell, colNum) => {
      if (colNum === 6 || colNum === 1) {
        cell.font = { name: 'Arial', size: 10, bold: true };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'double' } };
        if (colNum === 6) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.00';
        }
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `KSoM_FestivalAllowances_${formatMonthYear(monthYear)}.xlsx`);
  };

  // Original Regular Paybill Excel Export
  const exportExcel = async () => {
    const monthDisplay = new Date(monthYear + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const activeRule = globalSettingsList.find(r => r.effective_from <= monthYear) || {};
    
    const dynamicEarnKeysSet = new Set();
    const dynamicDeduxKeysSet = new Set();
    data.forEach(emp => {
      let eArr = [];
      let dArr = [];
      try { eArr = typeof emp.other_earnings_breakdown === 'string' ? JSON.parse(emp.other_earnings_breakdown) : (emp.other_earnings_breakdown || []); } catch(e){}
      try { dArr = typeof emp.other_deductions_breakdown === 'string' ? JSON.parse(emp.other_deductions_breakdown) : (emp.other_deductions_breakdown || []); } catch(e){}
      eArr.forEach(i => { if(i.desc) dynamicEarnKeysSet.add(i.desc); });
      dArr.forEach(i => { if(i.desc) dynamicDeduxKeysSet.add(i.desc); });
    });
    const dynamicEarnKeys = Array.from(dynamicEarnKeysSet);
    const dynamicDeduxKeys = Array.from(dynamicDeduxKeysSet);

    try {
      const response = await fetch('/pay_bill-format.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const sheet = workbook.worksheets[0];
      
      const safeMerge = (range) => {
        const [tl, br] = range.split(':');
        const tlRow = parseInt(tl.replace(/[A-Z]+/i, ''));
        const brRow = parseInt(br.replace(/[A-Z]+/i, ''));
        const merges = (sheet.model.merges || []).filter(m => {
          const [ms, me] = m.split(':');
          const mRow1 = parseInt(ms.replace(/[A-Z]+/i, ''));
          const mRow2 = parseInt(me.replace(/[A-Z]+/i, ''));
          return mRow1 <= brRow && mRow2 >= tlRow;
        });
        merges.forEach(m => { try { sheet.unMergeCells(m); } catch(e) {} });
        try { sheet.mergeCells(range); } catch(e) {}
      };

      const eHeaders = ['Sl.No.', 'Name of Employee', 'Designation', 'Scale of Pay', 'Basic', 'GP/DP', 'DA', 'HRA', 'CCA', 'Spl.Pay/Deput.Allow', 'Tr. Allow+DA', 'Fest. Allow'];
      if (dynamicEarnKeys.length > 0) {
        eHeaders.push(...dynamicEarnKeys);
      } else {
        eHeaders.push('Others');
      }
      eHeaders.push('Gross Pay');

      const dedHeaders = [null, 'Sl.No.', 'Name of Employee', 'Designation', 'Scale of Pay', 'EPF/GPF', 'CPF', 'IT', 'GIS', 'SLI/GSLI', 'LIC', 'Profession Tax', 'HRA/Onam'];
      if (dynamicDeduxKeys.length > 0) {
        dedHeaders.push(...dynamicDeduxKeys);
      } else {
        dedHeaders.push('Others');
      }
      dedHeaders.push('Total Ded', 'Net Pay');

      const earnColCount = eHeaders.length;
      const maxColCount = Math.max(earnColCount, dedHeaders.length - 1);
      const lastColLetter = sheet.getColumn(maxColCount).letter;

      const r4 = sheet.getRow(4);
      const r5 = sheet.getRow(5);
      
      for(let i=1; i<=20; i++) r4.getCell(i).value = null;
      r4.getCell(1).value = 'EARNINGS';

      for (let col = 1; col <= maxColCount; col++) {
        const cell = r5.getCell(col);
        if (col <= eHeaders.length) {
          cell.value = eHeaders[col - 1];
        }
        cell.style = sheet.getCell('N5').style;
      }
      r4.commit();
      r5.commit();

      safeMerge(`A4:${lastColLetter}4`);
      sheet.getCell('A3').value = 'Pay Bill Statement for the Month of ' + monthDisplay;
      safeMerge(`A3:${lastColLetter}3`);
      sheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };

      const dataStyle = sheet.getCell('A6').style;
      const slNoStyle = JSON.parse(JSON.stringify(dataStyle));
      slNoStyle.numFmt = '0';
      slNoStyle.alignment = { ...((slNoStyle.alignment) || {}), horizontal: 'center', vertical: 'center' };
      const totalStyle = sheet.getCell('E15').style;
      const totalLabelStyle = sheet.getCell('A15').style;
      const dedTitleStyle = sheet.getCell('A16').style;
      const dedHeaderStyle = sheet.getCell('A17').style;

      const maxRows = Math.max(sheet.rowCount, 30);
      for (let i = maxRows; i >= 6; i--) {
        sheet.spliceRows(i, 1);
      }

      let currentRow = 6;
      let sumBasic = 0, sumGP = 0, sumDA = 0, sumHRA = 0, sumCCA = 0, sumSpl = 0, sumTr = 0, sumFest = 0, sumOther = 0, sumGross = 0;
      let sumDynamicE = {};

      data.forEach((emp, i) => {
        const basic = parseFloat(emp.basic_pay) || 0;
        const gp = parseFloat(emp.dp_gp) || 0;
        const da = parseFloat(emp.da) || 0;
        const hra = parseFloat(emp.hra) || 0;
        const cca = parseFloat(emp.cca) || 0;
        const spl = (parseFloat(emp.spl_pay) || 0) + (parseFloat(emp.spl_allow) || 0);
        const tr = parseFloat(emp.tr_allow) || 0;
        const fest = parseFloat(emp.fest_allow) || 0;
        const other = parseFloat(emp.other_earnings) || 0;
        const gross = parseFloat(emp.gross) || 0;

        sumBasic += basic; sumGP += gp; sumDA += da; sumHRA += hra; sumCCA += cca; sumSpl += spl; sumTr += tr; sumFest += fest; sumOther += other; sumGross += gross;

        let eArr = [];
        try { eArr = typeof emp.other_earnings_breakdown === 'string' ? JSON.parse(emp.other_earnings_breakdown) : (emp.other_earnings_breakdown || []); } catch(e){}
        const dynE = {};
        eArr.forEach(item => {
          if (item.desc) {
            dynE[item.desc] = parseFloat(item.amount) || 0;
            sumDynamicE[item.desc] = (sumDynamicE[item.desc] || 0) + dynE[item.desc];
          }
        });

        const row = sheet.getRow(currentRow);
        const fullName = (emp.title ? `${emp.title} ` : '') + (emp.name || '');
        const values = [null, i + 1, fullName, emp.designation || '', emp.scale_of_pay || '', basic, gp, da, hra, cca, spl, tr, fest];
        if (dynamicEarnKeys.length > 0) {
          dynamicEarnKeys.forEach(k => values.push(dynE[k] || 0));
        } else {
          values.push(other);
        }
        values.push(gross);

        for (let col = 1; col <= maxColCount; col++) {
          const cell = row.getCell(col);
          if (col < values.length) {
            cell.value = values[col];
          }
          if (col === 1) {
            cell.style = slNoStyle;
          } else {
            cell.style = dataStyle;
            if (col === 2 || col === 3 || col === 4) {
              cell.alignment = { ...dataStyle.alignment, horizontal: 'left' };
            } else if (col >= 5) {
              cell.alignment = { ...dataStyle.alignment, horizontal: 'right' };
              if (col < values.length && typeof values[col] === 'number') {
                cell.numFmt = '0.00';
              }
            }
          }
        }
        row.commit();
        currentRow++;
      });

      const totalRow = sheet.getRow(currentRow);
      totalRow.getCell(1).value = 'TOTAL';
      totalRow.getCell(1).style = totalLabelStyle;
      safeMerge(`A${currentRow}:D${currentRow}`);
      
      const sumsEarn = [sumBasic, sumGP, sumDA, sumHRA, sumCCA, sumSpl, sumTr, sumFest];
      if (dynamicEarnKeys.length > 0) {
        dynamicEarnKeys.forEach(k => sumsEarn.push(sumDynamicE[k] || 0));
      } else {
        sumsEarn.push(sumOther);
      }
      sumsEarn.push(sumGross);

      for (let col = 5; col <= maxColCount; col++) {
        const cell = totalRow.getCell(col);
        const idx = col - 5;
        if (idx < sumsEarn.length) {
          cell.value = sumsEarn[idx];
        }
        cell.style = totalStyle;
        cell.alignment = { ...totalStyle.alignment, horizontal: 'right' };
        if (idx < sumsEarn.length) cell.numFmt = '0.00';
      }
      totalRow.commit();
      currentRow++;

      currentRow++; // Empty row

      const dedTitleRow = sheet.getRow(currentRow);
      dedTitleRow.getCell(1).value = 'DEDUCTIONS';
      dedTitleRow.getCell(1).style = dedTitleStyle;
      safeMerge(`A${currentRow}:${lastColLetter}${currentRow}`);
      dedTitleRow.commit();
      currentRow++;

      const dedHeaderRow = sheet.getRow(currentRow);
      for (let c = 1; c <= maxColCount; c++) {
        const cell = dedHeaderRow.getCell(c);
        if (c < dedHeaders.length) {
          cell.value = dedHeaders[c];
        }
        if (c > 0) cell.style = dedHeaderStyle;
      }
      dedHeaderRow.commit();
      currentRow++;

      let sumEPF = 0, sumCPF = 0, sumIT = 0, sumGIS = 0, sumSLI = 0, sumLIC = 0, sumPT = 0, sumHRAOnam = 0, sumOtherDed = 0, sumTotDed = 0, sumNet = 0;
      let sumDynamicD = {};
      data.forEach((emp, i) => {
        const epf = parseFloat(emp.epf) || 0;
        const cpf = parseFloat(emp.cpf) || 0;
        const it = parseFloat(emp.income_tax) || 0;
        const gis = parseFloat(emp.gis) || 0;
        const sli = parseFloat(emp.sli) || 0;
        const lic = parseFloat(emp.lic) || 0;
        const pt = parseFloat(emp.professional_tax) || 0;
        const hraOnam = (parseFloat(emp.hra_recovery) || 0) + (parseFloat(emp.onam_advance) || 0);
        const otherDed = parseFloat(emp.other_deductions) || 0;
        const dedux = parseFloat(emp.dedux) || 0;
        const net = parseFloat(emp.net) || 0;

        sumEPF += epf; sumCPF += cpf; sumIT += it; sumGIS += gis; sumSLI += sli; sumLIC += lic; sumPT += pt; sumHRAOnam += hraOnam; sumOtherDed += otherDed; sumTotDed += dedux; sumNet += net;

        let dArr = [];
        try { dArr = typeof emp.other_deductions_breakdown === 'string' ? JSON.parse(emp.other_deductions_breakdown) : (emp.other_deductions_breakdown || []); } catch(e){}
        const dynD = {};
        dArr.forEach(item => {
          if (item.desc) {
            dynD[item.desc] = parseFloat(item.amount) || 0;
            sumDynamicD[item.desc] = (sumDynamicD[item.desc] || 0) + dynD[item.desc];
          }
        });

        const row = sheet.getRow(currentRow);
        const values = [null, i + 1, emp.name || '', emp.designation || '', emp.scale_of_pay || '', epf, cpf, it, gis, sli, lic, pt, hraOnam];
        if (dynamicDeduxKeys.length > 0) {
          dynamicDeduxKeys.forEach(k => values.push(dynD[k] || 0));
        } else {
          values.push(otherDed);
        }
        values.push(dedux, net);

        for (let c = 1; c <= maxColCount; c++) {
          const cell = row.getCell(c);
          if (c < values.length) {
            cell.value = values[c];
          }
          if (c === 1) {
            cell.style = slNoStyle;
          } else {
            cell.style = dataStyle;
            if (c === 2 || c === 3 || c === 4) {
              cell.alignment = { ...dataStyle.alignment, horizontal: 'left' };
            } else if (c >= 5) {
              cell.alignment = { ...dataStyle.alignment, horizontal: 'right' };
              if (c < values.length && typeof values[c] === 'number') {
                cell.numFmt = '0.00';
              }
            }
          }
        }
        row.commit();
        currentRow++;
      });

      const dedTotalRow = sheet.getRow(currentRow);
      dedTotalRow.getCell(1).value = 'TOTAL';
      dedTotalRow.getCell(1).style = totalLabelStyle;
      safeMerge(`A${currentRow}:D${currentRow}`);

      const sumsDedux = [sumEPF, sumCPF, sumIT, sumGIS, sumSLI, sumLIC, sumPT, sumHRAOnam];
      if (dynamicDeduxKeys.length > 0) {
        dynamicDeduxKeys.forEach(k => sumsDedux.push(sumDynamicD[k] || 0));
      } else {
        sumsDedux.push(sumOtherDed);
      }
      sumsDedux.push(sumTotDed, sumNet);

      for (let c = 5; c <= maxColCount; c++) {
        const cell = dedTotalRow.getCell(c);
        if (c - 5 < sumsDedux.length) {
          cell.value = sumsDedux[c - 5];
        }
        cell.style = totalStyle;
        cell.alignment = { ...totalStyle.alignment, horizontal: 'right' };
        if (c - 5 < sumsDedux.length) cell.numFmt = '0.00';
      }
      dedTotalRow.commit();
      currentRow++;

      currentRow++;

      const bottomRows = [
        ['UGC/CSIR - DA Rate (%) 7th CPC', activeRule.da_ugc_percentage || ''],
        ['State DA (%) 11th Pay', activeRule.da_state_percentage || ''],
        ['UGC - HRA (%) 7th CPC', activeRule.hra_ugc_percentage || ''],
        ['STATE HRA - 10 % BASIC', activeRule.hra_state_percentage || ''],
        ['7th CPC DA Rate -Deputation', ''],
        ['7th CPC DA HRA - Deputation', ''],
        ['7th CPC Travel Allowance', 3600],
        ['7th CPC Deputation Allowance', 6800],
        [],
        ['Gross Pay', sumGross],
        ['Net Pay', sumNet]
      ];

      bottomRows.forEach(br => {
        const r = sheet.getRow(currentRow);
        if (br.length > 0) {
          r.getCell(3).value = br[0];
          r.getCell(4).value = br[1];
          r.getCell(3).font = { name: 'Arial Narrow', size: 10, bold: true };
          r.getCell(4).font = { name: 'Arial Narrow', size: 10, bold: true };
          if (typeof br[1] === 'number' || parseFloat(br[1])) {
             r.getCell(4).alignment = { horizontal: 'right' };
             if (br[0] === 'Gross Pay' || br[0] === 'Net Pay') {
                 r.getCell(4).numFmt = '0.00';
             }
          }
        }
        r.commit();
        currentRow++;
      });

      currentRow++;
      const sigRow = sheet.getRow(currentRow);
      const sigFont = { name: 'Arial Narrow', size: 10, bold: true };
      const sigAlign = { horizontal: 'center' };
      sigRow.getCell(5).value  = 'Assistant - Gr.II';
      sigRow.getCell(5).font   = sigFont;
      sigRow.getCell(5).alignment = sigAlign;
      sigRow.getCell(9).value  = 'AO';
      sigRow.getCell(9).font   = sigFont;
      sigRow.getCell(9).alignment = sigAlign;
      sigRow.getCell(13).value = 'DIRECTOR';
      sigRow.getCell(13).font  = sigFont;
      sigRow.getCell(13).alignment = sigAlign;
      sigRow.commit();

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `KSoM_Paybill_${formatMonthYear(monthYear)}.xlsx`);
    } catch (err) {
      console.error("Error generating Excel:", err);
      alert("Failed to generate Excel: " + err.message);
    }
  };

  const handleExportMaster = () => {
    if (billType === 'regular') exportExcel();
    else if (billType === 'surrender') exportSurrenderExcel();
    else if (billType === 'arrears') exportArrearExcel();
    else if (billType === 'festival') exportFestivalExcel();
  };

  const triggerDownloadPDF = (emp) => {
    const activeRule = globalSettingsList.find(r => r.effective_from <= monthYear) || {};
    if (billType === 'regular') generatePDFPayslip(emp, monthYear, activeRule, false, usersList);
    else if (billType === 'surrender') generatePDFSurrender(emp, monthYear, false, usersList);
    else if (billType === 'arrears') generatePDFArrear(emp, monthYear, false, usersList);
    else if (billType === 'festival') generatePDFFestival(emp, monthYear, false, usersList);
  };

  // ── MULTI-EMAIL SENDER ──────────────────────────────────────────────────
  const handleSendEmails = async () => {
    if (selectedEmps.size === 0) return;
    const confirmMessage = `OFFICIAL NOTIFICATION DISPATCH:\n\n` +
      `Are you sure you want to EMAIL the approved ${billType?.toUpperCase()} slips to ${selectedEmps.size} employees?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setSendingEmails(true);
    const activeRule = globalSettingsList.find(rule => rule.effective_from <= monthYear) || {};
    let successCount = 0;
    let failCount = 0;

    for (const emp_id of selectedEmps) {
      const emp = data.find(e => e.emp_id === emp_id);
      if (!emp || !emp.email_id) continue;
      
      try {
        let pdfResult = null;
        let subjectStr = '';
        let bodyStr = '';

        if (billType === 'regular') {
          pdfResult = await generatePDFPayslip(emp, monthYear, activeRule, true, usersList);
          subjectStr = `KSoM Payslip - ${formatMonthYear(monthYear)}`;
          bodyStr = `Dear ${emp.name},\n\nPlease find attached your salary payslip for ${formatMonthYear(monthYear)}.\n\nRegards,\nKerala School of Mathematics`;
        } else if (billType === 'surrender') {
          pdfResult = await generatePDFSurrender(emp, monthYear, true, usersList);
          subjectStr = `KSoM Leave Surrender Slip - ${formatMonthYear(monthYear)}`;
          bodyStr = `Dear ${emp.name},\n\nPlease find attached your Earned Leave surrender slip for ${formatMonthYear(monthYear)} (Financial Year ${emp.financial_year}).\n\nRegards,\nKerala School of Mathematics`;
        } else if (billType === 'arrears') {
          pdfResult = await generatePDFArrear(emp, monthYear, true, usersList);
          subjectStr = `KSoM Arrear Payout Statement - ${formatMonthYear(monthYear)}`;
          bodyStr = `Dear ${emp.name},\n\nPlease find attached your Arrear Payout statement for ${formatMonthYear(monthYear)}.\n\nRegards,\nKerala School of Mathematics`;
        } else if (billType === 'festival') {
          pdfResult = await generatePDFFestival(emp, monthYear, true, usersList);
          subjectStr = `KSoM Festival Allowance Slip - ${formatMonthYear(monthYear)}`;
          bodyStr = `Dear ${emp.name},\n\nPlease find attached your Festival Allowance slip for ${formatMonthYear(monthYear)}.\n\nRegards,\nKerala School of Mathematics`;
        }

        if (pdfResult) {
          const { fileName, content } = pdfResult;
          const res = await fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: emp.email_id,
              subject: subjectStr,
              text: bodyStr,
              attachments: [{ filename: fileName, content: content }]
            })
          });
          if (res.ok) {
            successCount++;
          } else {
            const errData = await res.json();
            console.error(`Email failed for ${emp.name}:`, errData);
            alert(`Failed to send to ${emp.name}: ${errData.error || 'Unknown error'}`);
            failCount++;
          }
        }
      } catch (e) {
        console.error(e);
        alert(`Error sending to ${emp.name}: ${e.message}`);
        failCount++;
      }
    }
    setSendingEmails(false);
    alert(`Email dispatch finished.\n\nDelivered Successfully: ${successCount}\nFailed: ${failCount}`);
  };

  const toggleSelectAll = () => {
    if (selectedEmps.size === data.filter(e => e.email_id).length) {
      setSelectedEmps(new Set());
    } else {
      setSelectedEmps(new Set(data.filter(e => e.email_id).map(e => e.emp_id)));
    }
  };

  const toggleSelect = (emp_id) => {
    const newSet = new Set(selectedEmps);
    if (newSet.has(emp_id)) newSet.delete(emp_id);
    else newSet.add(emp_id);
    setSelectedEmps(newSet);
  };

  const getBillTypeTitle = () => {
    if (billType === 'regular') return 'Regular Paybill';
    if (billType === 'surrender') return 'Leave Surrender Bill';
    if (billType === 'arrears') return 'Salary Arrears';
    if (billType === 'festival') return 'Festival Allowance';
    return 'Payslips';
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Reports & Exports</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            {isViewer ? 'View and download your verified KSoM payslips and statements.' : 'Generate, email and batch-export approved statements.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Bill Type Selector */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Bill Type:</label>
            <select className="form-control" value={billType} onChange={(e) => setBillType(e.target.value)} style={{ width: '200px' }}>
              <option value="regular">Regular Paybill</option>
              <option value="surrender">Leave Surrender Bill</option>
              <option value="arrears">Salary Arrear Bill</option>
              <option value="festival">Festival Allowance Bill</option>
            </select>
          </div>
          {/* Month Selector */}
          <input type="month" className="form-control" value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)} style={{ width: '150px' }} />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} style={{ color: 'var(--color-success)' }} />
              {isViewer ? 'Your Approved Records' : `Approved ${getBillTypeTitle()} — ${formatMonthYear(monthYear)} (${data.length} records)`}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              Only finalized and approved records are listed in Reports & Exports.
            </p>
          </div>

          {!isViewer && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleSendEmails} disabled={selectedEmps.size === 0 || sendingEmails}
                className="btn btn-primary">
                <Mail size={16} /> {sendingEmails ? 'Dispatching...' : `Email Selected (${selectedEmps.size})`}
              </button>
              <button onClick={handleExportMaster} disabled={!data.length}
                style={{ backgroundColor: 'var(--color-success)', color: '#fff', border: 'none' }}
                className="btn">
                <Table size={16} /> Export All to Excel
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-secondary)' }}>Loading approved records...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  {!isViewer && (
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input type="checkbox" 
                        checked={data.filter(e => e.email_id).length > 0 && selectedEmps.size === data.filter(e => e.email_id).length}
                        onChange={toggleSelectAll} 
                        disabled={data.filter(e => e.email_id).length === 0} />
                    </th>
                  )}
                  <th>Employee</th>
                  {billType === 'regular' && <><th>Gross Pay</th><th>Deductions</th><th>Net Pay</th></>}
                  {billType === 'surrender' && <><th>ELs Surrendered</th><th>Basic + DA + HRA</th><th>Surrender Amount</th></>}
                  {billType === 'arrears' && <><th>Arrear Type</th><th>Gross Arrear</th><th>IT Deduction</th><th>Net Arrear</th></>}
                  {billType === 'festival' && <><th>Allowance Description</th><th>Allowance Date</th><th>Payout Amount</th></>}
                  <th style={{ textAlign: 'center' }}>Formal Document</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan={isViewer ? "5" : "6"} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={24} style={{ color: 'var(--color-warning)' }} />
                        <span>No approved {getBillTypeTitle()} records found for this month.</span>
                      </div>
                    </td>
                  </tr>
                )}
                {data.map(emp => {
                  return (
                  <tr key={emp.emp_id}>
                    {!isViewer && (
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" 
                          checked={selectedEmps.has(emp.emp_id)}
                          onChange={() => toggleSelect(emp.emp_id)}
                          disabled={!emp.email_id}
                          title={!emp.email_id ? "No email address found" : ""} />
                      </td>
                    )}
                    <td>
                      <div style={{ fontWeight: 600 }}>{emp.title ? `${emp.title} ` : ''}{emp.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{emp.designation} ({emp.emp_id})</div>
                      {!emp.email_id && <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)' }}>No Email</div>}
                    </td>

                    {/* Regular Paybill Row */}
                    {billType === 'regular' && (
                      <>
                        <td>₹ {fmt(emp.gross)}</td>
                        <td>₹ {fmt(emp.dedux)}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>₹ {fmt(emp.net)}</td>
                      </>
                    )}

                    {/* Surrender Row */}
                    {billType === 'surrender' && (
                      <>
                        <td style={{ fontWeight: 'bold' }}>{emp.num_els} days</td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>₹ {fmt(emp.basic_pay)} (Basic)</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>+ ₹ {fmt(emp.da)} (DA) + ₹ {fmt(emp.hra)} (HRA)</div>
                        </td>
                        <td style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>
                          ₹ {emp.total_amount?.toLocaleString('en-IN')}
                        </td>
                      </>
                    )}

                    {/* Arrear Row */}
                    {billType === 'arrears' && (
                      <>
                        <td>{emp.arrear_type}</td>
                        <td>₹ {fmt(emp.arrear_amount)}</td>
                        <td style={{ color: 'var(--color-danger)' }}>- ₹ {fmt(emp.income_tax)}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>₹ {fmt(emp.net_amount)}</td>
                      </>
                    )}

                    {/* Festival Allowance Row */}
                    {billType === 'festival' && (
                      <>
                        <td>{emp.description || 'Festival allowance'}</td>
                        <td>{emp.bill_date}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>₹ {fmt(emp.amount)}</td>
                      </>
                    )}

                    {/* Download Button */}
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                        onClick={() => triggerDownloadPDF(emp)}>
                        <FileText size={15} /> Download PDF
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* High-visibility preview section for Viewers */}
      {isViewer && data.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>Formal Digital Preview — {monthYear}</h3>
          <PayslipPreview emp={data[0]} monthYear={monthYear} billType={billType} />
        </div>
      )}
    </div>
  );
};

export default Reports;
