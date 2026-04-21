import React, { useState, useEffect } from 'react';
import { Calculator, Save, Download } from 'lucide-react';

const Paybill = () => {
  const [monthYear, setMonthYear] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [employees, setEmployees] = useState([]);
  const [globalSettingsList, setGlobalSettingsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load configuration and existing earnings for the month
  const loadDataForMonth = async (targetMonth) => {
    setLoading(true);
    try {
      // 1. Fetch settings (Historical DA/HRA rules)
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      setGlobalSettingsList(settingsData); // It is loaded ordered descending by effective_from

      // 2. Fetch Earnings & Deductions join
      const earnRes = await fetch(`/api/earnings/${targetMonth}`);
      const earnData = await earnRes.json();
      const deduxRes = await fetch(`/api/deductions/${targetMonth}`);
      const deduxData = await deduxRes.json();

      // Combine them
      const combined = earnData.map(empEarn => {
        const matchingDedux = deduxData.find(d => d.emp_id === empEarn.emp_id) || {};
        return {
          ...empEarn,
          basic_pay: empEarn.basic_pay || 0,
          dp_gp: empEarn.dp_gp || 0,
          /* Map deducts */
          epf: matchingDedux.epf || 0,
          professional_tax: matchingDedux.professional_tax || 0,
          income_tax: matchingDedux.income_tax || 0,
          sli: matchingDedux.sli || 0,
          lic: matchingDedux.lic || 0,
          gis: matchingDedux.gis || 0,
          onam_advance: matchingDedux.onam_advance || 0
        };
      });

      setEmployees(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataForMonth(monthYear);
  }, [monthYear]);

  // Handle Input Changes in the Table
  const handleInputChange = (emp_id, field, value) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.emp_id === emp_id) {
        return { ...emp, [field]: parseFloat(value) || 0 };
      }
      return emp;
    }));
  };

  // Auto Calculate DA and HRA based on Historical Global Settings targeting this month
  const applyCalculations = () => {
    // Find the applicable rule for `monthYear`. 
    // Settings are ordered descending. We find the FIRST rule where effective_from <= monthYear.
    const activeRule = globalSettingsList.find(rule => rule.effective_from <= monthYear) || {
      da_state_percentage: 0, da_ugc_percentage: 0, hra_state_percentage: 0, hra_ugc_percentage: 0
    };

    setEmployees(prev => prev.map(emp => {
      let da_percentage = 0;
      let hra_percentage = 0;
      
      if (emp.category === 'state') {
        da_percentage = activeRule.da_state_percentage || 0;
        hra_percentage = activeRule.hra_state_percentage || 0;
      } else if (emp.category === 'ugc') {
        da_percentage = activeRule.da_ugc_percentage || 0;
        hra_percentage = activeRule.hra_ugc_percentage || 0;
      }

      // Calculate DA based on basic_pay (+ dp_gp if applicable, depending on rules)
      const baseForDA = emp.basic_pay + (emp.dp_gp || 0);
      const calculatedDA = (baseForDA * da_percentage) / 100;
      const calculatedHRA = (baseForDA * hra_percentage) / 100;

      return {
        ...emp,
        da_state: emp.category === 'state' ? calculatedDA : 0,
        da_ugc: emp.category === 'ugc' ? calculatedDA : 0,
        hra_state: emp.category === 'state' ? calculatedHRA : 0,
        hra_ugc: emp.category === 'ugc' ? calculatedHRA : 0,
      };
    }));
  };

  // Save everything to DB
  const handleSave = async () => {
    setSaving(true);
    try {
      const earningsPayload = employees.map(emp => ({
        emp_id: emp.emp_id, basic_pay: emp.basic_pay, dp_gp: emp.dp_gp,
        da_state: emp.da_state, da_ugc: emp.da_ugc,
        hra_state: emp.hra_state, hra_ugc: emp.hra_ugc,
        cca: emp.cca, other_earnings: emp.other_earnings
      }));

      const deductionsPayload = employees.map(emp => ({
        emp_id: emp.emp_id, epf: emp.epf, professional_tax: emp.professional_tax,
        sli: emp.sli, gis: emp.gis, lic: emp.lic, income_tax: emp.income_tax,
        onam_advance: emp.onam_advance, other_deductions: emp.other_deductions
      }));

      await fetch(`/api/earnings/${monthYear}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: earningsPayload })
      });

      await fetch(`/api/deductions/${monthYear}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: deductionsPayload })
      });
      
      alert("Paybill Saved Successfully!");
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Paybill Generation</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Calculate, view, and save earnings and deductions for a specific month.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="month" 
            className="form-control" 
            value={monthYear} 
            onChange={(e) => setMonthYear(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={applyCalculations}>
            <Calculator size={18} /> Auto Calculate DA & HRA
          </button>
          
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Draft Paybill'}
          </button>
        </div>

        {loading ? (
           <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>Loading Paybill Data...</div>
        ) : (
          <div className="table-container" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            <table className="table" style={{ fontSize: '0.8rem', minWidth: '1400px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-bg-secondary)', zIndex: 1, boxShadow: '0 1px 0 var(--color-border)' }}>
                <tr>
                  <th>Employee</th>
                  <th style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>Basic</th>
                  <th style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>DP/GP</th>
                  <th style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>DA</th>
                  <th style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>HRA</th>
                  <th style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>EPF</th>
                  <th style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>PT</th>
                  <th style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>IT</th>
                  <th style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>SLI</th>
                  <th style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>GIS</th>
                  <th style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>Onam Adv</th>
                  <th>Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const gross = (emp.basic_pay||0) + (emp.dp_gp||0) + (emp.da_state||0) + (emp.da_ugc||0) + (emp.hra_state||0) + (emp.hra_ugc||0) + (emp.cca||0);
                  const dedux = (emp.epf||0) + (emp.professional_tax||0) + (emp.income_tax||0) + (emp.sli||0) + (emp.lic||0) + (emp.gis||0) + (emp.onam_advance||0);
                  const net = gross - dedux;
                  
                  return (
                    <tr key={emp.emp_id}>
                      <td style={{ minWidth: '150px' }}>
                        <div style={{ fontWeight: 600 }}>{emp.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{emp.emp_id} | {emp.category}</div>
                      </td>
                      
                      {/* Earnings */}
                      <td>
                        <input type="number" className="form-control" style={{ padding: '0.25rem', width: '70px' }}
                          value={emp.basic_pay || ''} placeholder="0"
                          onChange={(e) => handleInputChange(emp.emp_id, 'basic_pay', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="form-control" style={{ padding: '0.25rem', width: '60px' }}
                          value={emp.dp_gp || ''} placeholder="0"
                          onChange={(e) => handleInputChange(emp.emp_id, 'dp_gp', e.target.value)} />
                      </td>
                      <td><div style={{ padding: '0.25rem' }}>{(emp.da_state || emp.da_ugc || 0).toFixed(2)}</div></td>
                      <td><div style={{ padding: '0.25rem' }}>{(emp.hra_state || emp.hra_ugc || 0).toFixed(2)}</div></td>

                      {/* Deductions */}
                      <td>
                        <input type="number" className="form-control" style={{ padding: '0.25rem', width: '60px' }}
                          value={emp.epf || ''} placeholder="0"
                          onChange={(e) => handleInputChange(emp.emp_id, 'epf', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="form-control" style={{ padding: '0.25rem', width: '60px' }}
                          value={emp.professional_tax || ''} placeholder="0"
                          onChange={(e) => handleInputChange(emp.emp_id, 'professional_tax', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="form-control" style={{ padding: '0.25rem', width: '60px' }}
                          value={emp.income_tax || ''} placeholder="0"
                          onChange={(e) => handleInputChange(emp.emp_id, 'income_tax', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="form-control" style={{ padding: '0.25rem', width: '60px' }}
                          value={emp.sli || ''} placeholder="0"
                          onChange={(e) => handleInputChange(emp.emp_id, 'sli', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="form-control" style={{ padding: '0.25rem', width: '60px' }}
                          value={emp.gis || ''} placeholder="0"
                          onChange={(e) => handleInputChange(emp.emp_id, 'gis', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="form-control" style={{ padding: '0.25rem', width: '70px' }}
                          value={emp.onam_advance || ''} placeholder="0"
                          onChange={(e) => handleInputChange(emp.emp_id, 'onam_advance', e.target.value)} />
                      </td>
                      
                      {/* Calculated Net */}
                      <td style={{ fontWeight: 'bold', minWidth: '100px', color: net >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        ₹ {net.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', padding: '2rem' }}>Add employees first to generate paybills.</td>
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

export default Paybill;
