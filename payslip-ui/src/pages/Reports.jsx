import React, { useState, useEffect } from 'react';
import { FileText, Table, Mail, CheckSquare } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const fmt = (v) => (parseFloat(v) || 0).toFixed(2);

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.src = src;
  img.onload = () => resolve(img);
  img.onerror = (e) => reject(e);
});

const generatePDFPayslip = async (employee, monthYear, activeRule = {}, returnBase64 = false) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - 2 * margin;

  let logoImg = null;
  try {
    logoImg = await loadImage('/logo.png');
  } catch(e) {
    console.warn("Could not load logo", e);
  }

  // ── HEADER ──────────────────────────────────────────────────────────────
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

  // ── PAY SLIP INFO TABLE ──────────────────────────────────────────────────
  const infoY = 38;
  const infoH = 55; // total height of info block
  doc.setLineWidth(0.4);
  doc.rect(margin, infoY, contentW, infoH);

  // "PAY SLIP" centered header inside the table box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PAY SLIP', pageW / 2, infoY + 7, { align: 'center' });

  // Horizontal line after PAY SLIP title
  doc.line(margin, infoY + 10, margin + contentW, infoY + 10);

  // Employee info grid: 2 label-value pairs per row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const col1X = margin + 3;
  const col1ValX = margin + 38;
  const col2X = margin + contentW / 2 + 3;
  const col2ValX = margin + contentW / 2 + 40;
  const rowH = 8.5;
  const startY = infoY + 15;

  // Parse month for display
  const [yr, mn] = (monthYear || '').split('-');
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthDisplay = mn ? `${monthNames[parseInt(mn)-1]} ${yr}` : monthYear;

  const infoRows = [
    ['Name', employee.name || '', 'Month & Year', monthDisplay],
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
    // vert divider
    doc.line(margin + contentW / 2, infoY + 10, margin + contentW / 2, infoY + infoH);
  });

  // DA & HRA Rules text
  const isState = employee.category === 'state';
  const isUGC = employee.category === 'ugc';
  const da_pct = isState ? (activeRule.da_state_percentage || 0) : isUGC ? (activeRule.da_ugc_percentage || 0) : 0;
  const hra_pct = isState ? (activeRule.hra_state_percentage || 0) : isUGC ? (activeRule.hra_ugc_percentage || 0) : 0;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text(`DA: ${da_pct}%  |  HRA: ${hra_pct}%`, margin, infoY + infoH + 3);

  // ── EARNINGS & DEDUCTIONS SIDE-BY-SIDE ──────────────────────────────────
  const tableTop = infoY + infoH + 6;
  const halfW = contentW / 2 - 1;

  const da = (parseFloat(employee.da_state) || 0) + (parseFloat(employee.da_ugc) || 0);
  const hra = (parseFloat(employee.hra_state) || 0) + (parseFloat(employee.hra_ugc) || 0);

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
    ['Others', fmt(employee.other_earnings)],
  ];

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
    ['Others', fmt(employee.other_deductions)],
  ];

  const grossPay = earningsRows.reduce((s, r) => s + parseFloat(r[1]), 0);
  const totalDeductions = deductionsRows.reduce((s, r) => s + parseFloat(r[1]), 0);

  // Earnings table (left half)
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

  // Gross Pay row at bottom of earnings table
  autoTable(doc, {
    startY: earningsTableFinalY,
    margin: { left: margin, right: margin + halfW + 2 },
    body: [[{ content: 'GROSS PAY', styles: { fontStyle: 'bold' } }, { content: fmt(grossPay), styles: { fontStyle: 'bold', halign: 'right' } }]],
    theme: 'grid',
    styles: { fontSize: 9.5, cellPadding: 2, fillColor: [240, 248, 255] },
    columnStyles: { 0: { cellWidth: halfW * 0.6 }, 1: { cellWidth: halfW * 0.4 } },
  });

  // Deductions table (right half) - starts at same Y as earnings
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

  // ── NET PAY ──────────────────────────────────────────────────────────────
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

  // ── WATERMARK (Foreground) ──────────────────────────────────────────────
  if (logoImg) {
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    const wmSize = 130;
    doc.addImage(logoImg, 'PNG', (pageW - wmSize) / 2, 90, wmSize, wmSize);
    doc.setGState(new doc.GState({ opacity: 1 }));
  }

  // ── SIGNATURE ───────────────────────────────────────────────────────────
  const sigY = doc.lastAutoTable.finalY + 25;
  doc.setFontSize(9);
  
  doc.setFont('helvetica', 'italic');
  doc.text("Sd/-", pageW / 2 - 2, sigY - 8);
  doc.text("Sd/-", pageW - margin - 20, sigY - 8);
  
  doc.setFont('helvetica', 'normal');
  doc.line(pageW / 2 - 15, sigY - 5, pageW / 2 + 25, sigY - 5);
  doc.line(pageW - margin - 35, sigY - 5, pageW - margin, sigY - 5);
  
  doc.text("Prepared By", pageW / 2 - 15, sigY);
  doc.text("Authorised Signatory", pageW - margin - 35, sigY);

  const fileName = `Payslip_${(employee.name || 'Emp').replace(/\s+/g, '_')}_${monthYear}.pdf`;
  if (returnBase64) {
    return { fileName, content: doc.output('datauristring').split(',')[1] };
  } else {
    doc.save(fileName);
  }
};

const Reports = () => {
  const [monthYear, setMonthYear] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalSettingsList, setGlobalSettingsList] = useState([]);
  const [selectedEmps, setSelectedEmps] = useState(new Set());
  const [sendingEmails, setSendingEmails] = useState(false);

  useEffect(() => { loadDataForMonth(monthYear); }, [monthYear]);

  const loadDataForMonth = async (targetMonth) => {
    setLoading(true);
    setSelectedEmps(new Set());
    try {
      const [earnRes, deduxRes, settingsRes] = await Promise.all([
        fetch(`/api/earnings/${targetMonth}`),
        fetch(`/api/deductions/${targetMonth}`),
        fetch('/api/settings')
      ]);
      setGlobalSettingsList(await settingsRes.json());
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
      setData(combined.filter(e => {
        if (e.date_of_joining) {
          const dojMonth = e.date_of_joining.substring(0, 7);
          if (dojMonth > targetMonth) return false;
        }
        return typeof e.is_active === 'undefined' || e.is_active === 1 || e.earnings_id != null;
      }));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const exportExcel = async () => {
    const monthDisplay = new Date(monthYear + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const activeRule = globalSettingsList.find(r => r.effective_from <= monthYear) || {};
    
    try {
      const response = await fetch('/pay_bill-format.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const sheet = workbook.worksheets[0];

      sheet.getCell('A3').value = 'Pay Bill Statement for the Month of ' + monthDisplay;

      const dataStyle = sheet.getCell('A6').style;
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

        const row = sheet.getRow(currentRow);
        const values = [null, i + 1, emp.name || '', emp.designation || '', emp.scale_of_pay || '', basic, gp, da, hra, cca, spl, tr, fest, other, gross];
        values.forEach((val, colIdx) => {
          if (colIdx > 0) {
            const cell = row.getCell(colIdx);
            cell.value = val;
            cell.style = dataStyle;
            if (colIdx === 1) {
              cell.alignment = { ...dataStyle.alignment, horizontal: 'center' };
            } else if (colIdx === 2 || colIdx === 3 || colIdx === 4) {
              cell.alignment = { ...dataStyle.alignment, horizontal: 'left' };
            } else if (colIdx >= 5) {
              cell.alignment = { ...dataStyle.alignment, horizontal: 'right' };
              cell.numFmt = '0.00';
            }
          }
        });
        row.commit();
        currentRow++;
      });

      const totalRow = sheet.getRow(currentRow);
      totalRow.getCell(1).value = 'TOTAL';
      totalRow.getCell(1).style = totalLabelStyle;
      sheet.mergeCells(`A${currentRow}:D${currentRow}`);
      [sumBasic, sumGP, sumDA, sumHRA, sumCCA, sumSpl, sumTr, sumFest, sumOther, sumGross].forEach((val, idx) => {
        const cell = totalRow.getCell(5 + idx);
        cell.value = val;
        cell.style = totalStyle;
        cell.alignment = { ...totalStyle.alignment, horizontal: 'right' };
        cell.numFmt = '0.00';
      });
      totalRow.commit();
      currentRow++;

      currentRow++; // Empty row

      const dedTitleRow = sheet.getRow(currentRow);
      dedTitleRow.getCell(1).value = 'DEDUCTIONS';
      dedTitleRow.getCell(1).style = dedTitleStyle;
      sheet.mergeCells(`A${currentRow}:N${currentRow}`);
      dedTitleRow.commit();
      currentRow++;

      const dedHeaders = [null, 'Sl.No.', 'Name of Employee', 'Designation', 'Scale of Pay', 'EPF/GPF', 'CPF', 'IT', 'GIS', 'SLI/GSLI', 'LIC', 'Profession Tax', 'HRA/Onam', 'Total Ded', 'Net Pay'];
      const dedHeaderRow = sheet.getRow(currentRow);
      dedHeaders.forEach((val, colIdx) => {
        if (colIdx > 0) {
          const cell = dedHeaderRow.getCell(colIdx);
          cell.value = val;
          cell.style = dedHeaderStyle;
        }
      });
      dedHeaderRow.commit();
      currentRow++;

      let sumEPF = 0, sumCPF = 0, sumIT = 0, sumGIS = 0, sumSLI = 0, sumLIC = 0, sumPT = 0, sumHRAOnam = 0, sumTotDed = 0, sumNet = 0;
      data.forEach((emp, i) => {
        const epf = parseFloat(emp.epf) || 0;
        const cpf = parseFloat(emp.cpf) || 0;
        const it = parseFloat(emp.income_tax) || 0;
        const gis = parseFloat(emp.gis) || 0;
        const sli = parseFloat(emp.sli) || 0;
        const lic = parseFloat(emp.lic) || 0;
        const pt = parseFloat(emp.professional_tax) || 0;
        const hraOnam = (parseFloat(emp.hra_recovery) || 0) + (parseFloat(emp.onam_advance) || 0) + (parseFloat(emp.other_deductions) || 0);
        const dedux = parseFloat(emp.dedux) || 0;
        const net = parseFloat(emp.net) || 0;

        sumEPF += epf; sumCPF += cpf; sumIT += it; sumGIS += gis; sumSLI += sli; sumLIC += lic; sumPT += pt; sumHRAOnam += hraOnam; sumTotDed += dedux; sumNet += net;

        const row = sheet.getRow(currentRow);
        const values = [null, i + 1, emp.name || '', emp.designation || '', emp.scale_of_pay || '', epf, cpf, it, gis, sli, lic, pt, hraOnam, dedux, net];
        values.forEach((val, colIdx) => {
          if (colIdx > 0) {
            const cell = row.getCell(colIdx);
            cell.value = val;
            cell.style = dataStyle;
            if (colIdx === 1) {
              cell.alignment = { ...dataStyle.alignment, horizontal: 'center' };
            } else if (colIdx === 2 || colIdx === 3 || colIdx === 4) {
              cell.alignment = { ...dataStyle.alignment, horizontal: 'left' };
            } else if (colIdx >= 5) {
              cell.alignment = { ...dataStyle.alignment, horizontal: 'right' };
              cell.numFmt = '0.00';
            }
          }
        });
        row.commit();
        currentRow++;
      });

      const dedTotalRow = sheet.getRow(currentRow);
      dedTotalRow.getCell(1).value = 'TOTAL';
      dedTotalRow.getCell(1).style = totalLabelStyle;
      sheet.mergeCells(`A${currentRow}:D${currentRow}`);
      [sumEPF, sumCPF, sumIT, sumGIS, sumSLI, sumLIC, sumPT, sumHRAOnam, sumTotDed, sumNet].forEach((val, idx) => {
        const cell = dedTotalRow.getCell(5 + idx);
        cell.value = val;
        cell.style = totalStyle;
        cell.alignment = { ...totalStyle.alignment, horizontal: 'right' };
        cell.numFmt = '0.00';
      });
      dedTotalRow.commit();
      currentRow++;

      currentRow++; // Empty row after deductions total

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

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `KSoM_Paybill_${monthYear}.xlsx`);
    } catch (err) {
      console.error("Error generating Excel:", err);
      alert("Failed to generate Excel: " + err.message);
    }
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

  const handleSendEmails = async () => {
    if (selectedEmps.size === 0) return;
    if (!window.confirm(`Are you sure you want to email payslips to ${selectedEmps.size} employees?`)) return;
    
    setSendingEmails(true);
    const activeRule = globalSettingsList.find(rule => rule.effective_from <= monthYear) || {};
    let successCount = 0;
    let failCount = 0;

    for (const emp_id of selectedEmps) {
      const emp = data.find(e => e.emp_id === emp_id);
      if (!emp || !emp.email_id) continue;
      
      try {
        const { fileName, content } = await generatePDFPayslip(emp, monthYear, activeRule, true);
        const res = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: emp.email_id,
            subject: `KSoM Payslip - ${monthYear}`,
            text: `Dear ${emp.name},\n\nPlease find attached your payslip for ${monthYear}.\n\nRegards,\nKerala School of Mathematics`,
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
      } catch (e) {
        console.error(e);
        alert(`Error sending to ${emp.name}: ${e.message}`);
        failCount++;
      }
    }
    setSendingEmails(false);
    if (successCount > 0 || failCount === 0) {
      alert(`Email process finished. Success: ${successCount}, Failed: ${failCount}`);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Reports & Exports</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Generate formal KSoM payslips in PDF or batch-export to Excel.
          </p>
          {globalSettingsList.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)', background: 'rgba(59,130,246,0.1)', padding: '0.4rem 0.8rem', borderRadius: '4px', display: 'inline-block' }}>
              <strong>Active Rules for {monthYear}:</strong> State (DA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).da_state_percentage || 0}%, HRA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).hra_state_percentage || 0}%) | UGC (DA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).da_ugc_percentage || 0}%, HRA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).hra_ugc_percentage || 0}%)
            </div>
          )}
        </div>
        <input type="month" className="form-control" value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)} />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Records — {monthYear} ({data.length} employees)</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleSendEmails} disabled={selectedEmps.size === 0 || sendingEmails}
              className="btn btn-primary">
              <Mail size={16} /> {sendingEmails ? 'Sending...' : `Email Selected (${selectedEmps.size})`}
            </button>
            <button onClick={exportExcel} disabled={!data.length}
              style={{ backgroundColor: 'var(--color-success)', color: '#fff', border: 'none' }}
              className="btn">
              <Table size={16} /> Export All to Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Loading...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input type="checkbox" 
                      checked={data.filter(e => e.email_id).length > 0 && selectedEmps.size === data.filter(e => e.email_id).length}
                      onChange={toggleSelectAll} 
                      disabled={data.filter(e => e.email_id).length === 0} />
                  </th>
                  <th>Employee</th>
                  <th>Gross Pay</th>
                  <th>Total Deductions</th>
                  <th style={{ fontWeight: 'bold' }}>Net Pay</th>
                  <th style={{ textAlign: 'center' }}>Payslip</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No data for this month. Please save the paybill first.</td></tr>
                )}
                {data.map(emp => {
                  const activeRule = globalSettingsList.find(rule => rule.effective_from <= monthYear) || {};
                  return (
                  <tr key={emp.emp_id}>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" 
                        checked={selectedEmps.has(emp.emp_id)}
                        onChange={() => toggleSelect(emp.emp_id)}
                        disabled={!emp.email_id}
                        title={!emp.email_id ? "No email address found" : ""} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{emp.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{emp.designation}</div>
                      {!emp.email_id && <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)' }}>No Email</div>}
                    </td>
                    <td>₹ {fmt(emp.gross)}</td>
                    <td>₹ {fmt(emp.dedux)}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>₹ {fmt(emp.net)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                        onClick={() => generatePDFPayslip(emp, monthYear, activeRule)}>
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
    </div>
  );
};

export default Reports;
