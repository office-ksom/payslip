import React, { useState, useEffect } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [monthYear, setMonthYear] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDataForMonth(monthYear);
  }, [monthYear]);

  const loadDataForMonth = async (targetMonth) => {
    setLoading(true);
    try {
      const earnRes = await fetch(`/api/earnings/${targetMonth}`);
      const earnData = await earnRes.json();
      
      const deduxRes = await fetch(`/api/deductions/${targetMonth}`);
      const deduxData = await deduxRes.json();

      const combined = earnData.map(empEarn => {
        const matchingDedux = deduxData.find(d => d.emp_id === empEarn.emp_id) || {};
        const basic = empEarn.basic_pay || 0;
        const gross = basic + (empEarn.dp_gp||0) + (empEarn.da_state||0) + (empEarn.da_ugc||0) + (empEarn.hra_state||0) + (empEarn.hra_ugc||0) + (empEarn.cca||0);
        const dedux = (matchingDedux.epf||0) + (matchingDedux.professional_tax||0) + (matchingDedux.income_tax||0) + (matchingDedux.sli||0) + (matchingDedux.lic||0) + (matchingDedux.gis||0) + (matchingDedux.onam_advance||0);
        return {
          ...empEarn,
          epf: matchingDedux.epf || 0,
          professional_tax: matchingDedux.professional_tax || 0,
          income_tax: matchingDedux.income_tax || 0,
          sli: matchingDedux.sli || 0,
          gis: matchingDedux.gis || 0,
          onam_advance: matchingDedux.onam_advance || 0,
          lic: matchingDedux.lic || 0,
          gross,
          dedux,
          net: gross - dedux
        };
      });
      setData(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFPayslip = (employee) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("Kerala School of Mathematics", 105, 20, { align: "center" });
      
      doc.setFontSize(14);
      doc.text(`Payslip for ${monthYear}`, 105, 30, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(`Employee Name: ${employee.name || 'Unknown'}`, 20, 50);
      doc.text(`Employee ID: ${employee.emp_id || 'N/A'}`, 20, 60);
      doc.text(`Designation: ${employee.designation || '-'}`, 120, 50);
      doc.text(`Category: ${employee.category || '-'}`, 120, 60);

      const daValue = ((employee.da_state || 0) + (employee.da_ugc || 0)).toFixed(2);
      const hraValue = ((employee.hra_state || 0) + (employee.hra_ugc || 0)).toFixed(2);

      // Earnings & Deductions Table
      doc.autoTable({
        startY: 75,
        head: [['Earnings', 'Amount (INR)', 'Deductions', 'Amount (INR)']],
        body: [
          ['Basic Pay', employee.basic_pay?.toFixed(2) || '0.00', 'EPF', employee.epf?.toFixed(2) || '0.00'],
          ['DA', daValue, 'Professional Tax', employee.professional_tax?.toFixed(2) || '0.00'],
          ['HRA', hraValue, 'Income Tax', employee.income_tax?.toFixed(2) || '0.00'],
          ['DP/GP', employee.dp_gp?.toFixed(2) || '0.00', 'SLI', employee.sli?.toFixed(2) || '0.00'],
          ['CCA', employee.cca?.toFixed(2) || '0.00', 'GIS', employee.gis?.toFixed(2) || '0.00'],
          ['Other', employee.other_earnings?.toFixed(2) || '0.00', 'Onam Adv', employee.onam_advance?.toFixed(2) || '0.00'],
          ['', '', 'LIC / Other', employee.lic?.toFixed(2) || '0.00'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text(`Gross Earnings: INR ${employee.gross?.toFixed(2)}`, 20, finalY);
      doc.text(`Total Deductions: INR ${employee.dedux?.toFixed(2)}`, 120, finalY);
      
      doc.setFontSize(16);
      doc.text(`Net Pay: INR ${employee.net?.toFixed(2)}`, 20, finalY + 15);

      doc.save(`Payslip_${employee.name || 'Emp'}_${monthYear}.pdf`);
    } catch (e) {
      console.error("PDF Gen Failed: ", e);
      alert("Could not generate PDF. Please ensure employee details are fully populated.");
    }
  };

  const exportExcel = () => {
    const formattedData = data.map(emp => ({
      'Employee ID': emp.emp_id,
      'Name': emp.name,
      'Designation': emp.designation,
      'Basic Pay': emp.basic_pay || 0,
      'DA': (emp.da_state || 0) + (emp.da_ugc || 0),
      'HRA': (emp.hra_state || 0) + (emp.hra_ugc || 0),
      'Gross Pay': emp.gross || 0,
      'EPF': emp.epf || 0,
      'Professional Tax': emp.professional_tax || 0,
      'Income Tax': emp.income_tax || 0,
      'SLI': emp.sli || 0,
      'GIS': emp.gis || 0,
      'Onam Adv': emp.onam_advance || 0,
      'Total Deductions': emp.dedux || 0,
      'Net Pay': emp.net || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Paybill");
    XLSX.writeFile(workbook, `KSoM_Paybill_${monthYear}.xlsx`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Reports & Exports</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Generate individual PDF payslips and mass Excel statements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="month" className="form-control" 
            value={monthYear} onChange={(e) => setMonthYear(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Processed Records ({data.length})</h3>
          <button className="btn btn-success" onClick={exportExcel} disabled={data.length === 0} style={{ backgroundColor: 'var(--color-success)', color: 'white', border: 'none' }}>
            <Table size={18} /> Export Paybill to Excel
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Gathering records...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Net Pay</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map(emp => (
                  <tr key={emp.emp_id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{emp.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{emp.designation}</div>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>₹ {emp.net?.toFixed(2)}</td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => generatePDFPayslip(emp)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        <FileText size={16} /> Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No data for this month.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
