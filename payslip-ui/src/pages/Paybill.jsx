import React, { useState, useEffect } from 'react';
import { Calculator, Save, Copy, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const Paybill = () => {
  const { user } = useOutletContext();
  if (user && user.role === 'viewer') {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>;
  }
  const [monthYear, setMonthYear] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [employees, setEmployees] = useState([]);
  const [globalSettingsList, setGlobalSettingsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEmp, setModalEmp] = useState(null);

  const loadDataForMonth = async (targetMonth) => {
    setLoading(true);
    try {
      const settingsRes = await fetch('/api/settings');
      setGlobalSettingsList(await settingsRes.json());

      const earnRes = await fetch(`/api/earnings/${targetMonth}`);
      const earnData = await earnRes.json();
      const deduxRes = await fetch(`/api/deductions/${targetMonth}`);
      const deduxData = await deduxRes.json();

      const combined = earnData.map(empEarn => {
        const d = deduxData.find(x => x.emp_id === empEarn.emp_id) || {};
        return {
          ...empEarn,
          basic_pay: empEarn.basic_pay || 0,
          dp_gp: empEarn.dp_gp || 0,
          spl_pay: empEarn.spl_pay || 0,
          tr_allow: empEarn.tr_allow || 0,
          spl_allow: empEarn.spl_allow || 0,
          fest_allow: empEarn.fest_allow || 0,
          epf: d.epf || 0,
          cpf: d.cpf || 0,
          professional_tax: d.professional_tax || 0,
          income_tax: d.income_tax || 0,
          sli: d.sli || 0,
          lic: d.lic || 0,
          gis: d.gis || 0,
          onam_advance: d.onam_advance || 0,
          hra_recovery: d.hra_recovery || 0,
          other_deductions: d.other_deductions || 0,
        };
      });

      setEmployees(combined.filter(e => {
        if (e.date_of_joining) {
          const dojMonth = e.date_of_joining.substring(0, 7);
          if (dojMonth > targetMonth) return false;
        }
        return typeof e.is_active === 'undefined' || e.is_active === 1 || e.earnings_id != null;
      }).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDataForMonth(monthYear); }, [monthYear]);

  const handleInputChange = (emp_id, field, value) => {
    setEmployees(prev => prev.map(emp =>
      emp.emp_id === emp_id ? { ...emp, [field]: parseFloat(value) || 0 } : emp
    ));
  };

  const applyCalculations = () => {
    const activeRule = globalSettingsList.find(rule => rule.effective_from <= monthYear) || {};
    setEmployees(prev => prev.map(emp => {
      const isState = emp.category === 'state';
      const isUGC = emp.category === 'ugc/csir';
      const da_pct = isState ? (activeRule.da_state_percentage || 0) : isUGC ? (activeRule.da_ugc_percentage || 0) : 0;
      const hra_pct = isState ? (activeRule.hra_state_percentage || 0) : isUGC ? (activeRule.hra_ugc_percentage || 0) : 0;
      const base = emp.basic_pay + (emp.dp_gp || 0);
      const da = (base * da_pct) / 100;
      const hra = (base * hra_pct) / 100;
      return {
        ...emp,
        da_state: isState ? da : 0,
        da_ugc: isUGC ? da : 0,
        hra_state: isState ? hra : 0,
        hra_ugc: isUGC ? hra : 0,
      };
    }));
  };
  
  const handleCopyPreviousMonth = async () => {
    const [year, month] = monthYear.split('-');
    let py = parseInt(year);
    let pm = parseInt(month) - 1;
    if (pm === 0) { pm = 12; py -= 1; }
    const prevMonth = `${py}-${String(pm).padStart(2, '0')}`;
    
    if (!window.confirm(`Are you sure you want to pull data from ${prevMonth} and overwrite current unsaved grid data?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const earnRes = await fetch(`/api/earnings/${prevMonth}`);
      const earnData = await earnRes.json();
      const deduxRes = await fetch(`/api/deductions/${prevMonth}`);
      const deduxData = await deduxRes.json();
      
      setEmployees(prev => prev.map(emp => {
        const prevE = earnData.find(e => e.emp_id === emp.emp_id) || {};
        const prevD = deduxData.find(d => d.emp_id === emp.emp_id) || {};
        return {
          ...emp,
          basic_pay: prevE.basic_pay || 0,
          dp_gp: prevE.dp_gp || 0,
          da_state: prevE.da_state || 0,
          da_ugc: prevE.da_ugc || 0,
          hra_state: prevE.hra_state || 0,
          hra_ugc: prevE.hra_ugc || 0,
          cca: prevE.cca || 0,
          spl_pay: prevE.spl_pay || 0,
          tr_allow: prevE.tr_allow || 0,
          spl_allow: prevE.spl_allow || 0,
          fest_allow: prevE.fest_allow || 0,
          other_earnings: prevE.other_earnings || 0,
          epf: prevD.epf || 0,
          cpf: prevD.cpf || 0,
          professional_tax: prevD.professional_tax || 0,
          income_tax: prevD.income_tax || 0,
          sli: prevD.sli || 0,
          gis: prevD.gis || 0,
          lic: prevD.lic || 0,
          onam_advance: prevD.onam_advance || 0,
          hra_recovery: prevD.hra_recovery || 0,
          other_deductions: prevD.other_deductions || 0,
        };
      }));
    } catch(err) {
      console.error(err);
      alert('Failed to pull previous month data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const earningsPayload = employees.map(emp => ({
        emp_id: emp.emp_id, basic_pay: emp.basic_pay, dp_gp: emp.dp_gp,
        da_state: emp.da_state, da_ugc: emp.da_ugc,
        hra_state: emp.hra_state, hra_ugc: emp.hra_ugc,
        cca: emp.cca, other_earnings: emp.other_earnings,
        spl_pay: emp.spl_pay, tr_allow: emp.tr_allow,
        spl_allow: emp.spl_allow, fest_allow: emp.fest_allow
      }));

      const deductionsPayload = employees.map(emp => ({
        emp_id: emp.emp_id, epf: emp.epf, cpf: emp.cpf,
        professional_tax: emp.professional_tax,
        sli: emp.sli, gis: emp.gis, lic: emp.lic,
        income_tax: emp.income_tax,
        onam_advance: emp.onam_advance, hra_recovery: emp.hra_recovery,
        other_deductions: emp.other_deductions
      }));

      await fetch(`/api/earnings/${monthYear}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: earningsPayload })
      });
      await fetch(`/api/deductions/${monthYear}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: deductionsPayload })
      });
      alert('Paybill Saved Successfully!');
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };
  
  // -- Modal logic --
  const openModal = (emp) => {
    setModalEmp({ ...emp });
    setModalOpen(true);
  };
  
  const handleModalInput = (e) => {
    const { name, value } = e.target;
    setModalEmp(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };
  
  const commitModalSave = () => {
    setEmployees(prev => prev.map(e => e.emp_id === modalEmp.emp_id ? modalEmp : e));
    setModalOpen(false);
    setModalEmp(null);
  };

  const inputStyle = { padding: '0.2rem 0.3rem', width: '65px' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Paybill Generation</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Enter earnings and deductions, auto-calculate DA & HRA, then save.
          </p>
          {globalSettingsList.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)', background: 'rgba(59,130,246,0.1)', padding: '0.4rem 0.8rem', borderRadius: '4px', display: 'inline-block' }}>
              <strong>Active Rules for {monthYear}:</strong> State (DA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).da_state_percentage || 0}%, HRA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).hra_state_percentage || 0}%) | UGC/CSIR (DA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).da_ugc_percentage || 0}%, HRA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).hra_ugc_percentage || 0}%)
            </div>
          )}
        </div>
        <input type="month" className="form-control" value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)} />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={handleCopyPreviousMonth}>
              <Copy size={18} /> Copy Previous Month
            </button>
            <button className="btn btn-secondary" onClick={applyCalculations}>
              <Calculator size={18} /> Auto Calculate DA & HRA
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Paybill'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ fontSize: '0.78rem', minWidth: '1800px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-bg-secondary)', zIndex: 1, boxShadow: '0 1px 0 var(--color-border)' }}>
                <tr>
                  <th style={{ minWidth: '140px' }}>Employee</th>
                  <th style={{ background: 'rgba(59,130,246,0.06)', textAlign:'center', padding:'0.5rem 0' }} colSpan="10">
                    ── EARNINGS ──
                  </th>
                  <th style={{ background: 'rgba(239,68,68,0.06)', textAlign:'center', padding:'0.5rem 0' }} colSpan="10">
                    ── DEDUCTIONS ──
                  </th>
                  <th>Net Pay</th>
                </tr>
                <tr>
                  <th></th>
                  {/* Earnings sub-headers */}
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>Basic</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>DP/GP</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>DA</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>HRA</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>CCA</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>Spl.Pay</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>Tr.Allow</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>Spl.Allow</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>Fest.Allow</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>Others</th>
                  {/* Deductions sub-headers */}
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>EPF</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>CPF</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>PT</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>IT</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>SLI</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>GIS</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>LIC</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>Onam</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>HRA Rec.</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>Others</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 && (
                  <tr><td colSpan="22" style={{ textAlign: 'center', padding: '2rem' }}>Add employees first.</td></tr>
                )}
                {employees.map(emp => {
                  const da = (emp.da_state || 0) + (emp.da_ugc || 0);
                  const hra = (emp.hra_state || 0) + (emp.hra_ugc || 0);
                  const gross = (emp.basic_pay||0)+(emp.dp_gp||0)+da+hra+(emp.cca||0)+(emp.spl_pay||0)+(emp.tr_allow||0)+(emp.spl_allow||0)+(emp.fest_allow||0)+(emp.other_earnings||0);
                  const dedux = (emp.epf||0)+(emp.cpf||0)+(emp.professional_tax||0)+(emp.income_tax||0)+(emp.sli||0)+(emp.gis||0)+(emp.lic||0)+(emp.onam_advance||0)+(emp.hra_recovery||0)+(emp.other_deductions||0);
                  const net = gross - dedux;
                  const inp = (field) => (
                    <input type="number" className="form-control" style={inputStyle}
                      value={emp[field] || ''} placeholder="0"
                      onChange={(e) => handleInputChange(emp.emp_id, field, e.target.value)} />
                  );
                  return (
                    <tr key={emp.emp_id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => openModal(emp)}>
                          {emp.title ? `${emp.title} ` : ''}{emp.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{emp.emp_id}</div>
                      </td>
                      <td>{inp('basic_pay')}</td>
                      <td>{inp('dp_gp')}</td>
                      <td><div style={{ padding: '0.2rem' }}>{da.toFixed(2)}</div></td>
                      <td><div style={{ padding: '0.2rem' }}>{hra.toFixed(2)}</div></td>
                      <td>{inp('cca')}</td>
                      <td>{inp('spl_pay')}</td>
                      <td>{inp('tr_allow')}</td>
                      <td>{inp('spl_allow')}</td>
                      <td>{inp('fest_allow')}</td>
                      <td>{inp('other_earnings')}</td>
                      <td>{inp('epf')}</td>
                      <td>{inp('cpf')}</td>
                      <td>{inp('professional_tax')}</td>
                      <td>{inp('income_tax')}</td>
                      <td>{inp('sli')}</td>
                      <td>{inp('gis')}</td>
                      <td>{inp('lic')}</td>
                      <td>{inp('onam_advance')}</td>
                      <td>{inp('hra_recovery')}</td>
                      <td>{inp('other_deductions')}</td>
                      <td style={{ fontWeight: 'bold', minWidth: '90px', color: net >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        ₹{net.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual Employee Modal */}
      {modalOpen && modalEmp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Data Entry: {modalEmp.title ? `${modalEmp.title} ` : ''}{modalEmp.name} ({modalEmp.emp_id})</h2>
              <button className="btn" style={{ padding: '0.3rem', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
              {/* Earnings Column */}
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(59,130,246,1)' }}>EARNINGS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Basic Pay</label>
                    <input type="number" name="basic_pay" value={modalEmp.basic_pay || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>DP/GP</label>
                    <input type="number" name="dp_gp" value={modalEmp.dp_gp || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>CCA</label>
                    <input type="number" name="cca" value={modalEmp.cca || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Special Pay</label>
                    <input type="number" name="spl_pay" value={modalEmp.spl_pay || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Travel Allow.</label>
                    <input type="number" name="tr_allow" value={modalEmp.tr_allow || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Special Allow.</label>
                    <input type="number" name="spl_allow" value={modalEmp.spl_allow || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Festival Allow.</label>
                    <input type="number" name="fest_allow" value={modalEmp.fest_allow || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Other Earnings</label>
                    <input type="number" name="other_earnings" value={modalEmp.other_earnings || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                </div>
              </div>
              
              {/* Deductions Column */}
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(239,68,68,1)' }}>DEDUCTIONS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>EPF</label>
                    <input type="number" name="epf" value={modalEmp.epf || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>CPF</label>
                    <input type="number" name="cpf" value={modalEmp.cpf || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Professional Tax</label>
                    <input type="number" name="professional_tax" value={modalEmp.professional_tax || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Income Tax</label>
                    <input type="number" name="income_tax" value={modalEmp.income_tax || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>SLI</label>
                    <input type="number" name="sli" value={modalEmp.sli || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>GIS</label>
                    <input type="number" name="gis" value={modalEmp.gis || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>LIC</label>
                    <input type="number" name="lic" value={modalEmp.lic || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Onam Advance</label>
                    <input type="number" name="onam_advance" value={modalEmp.onam_advance || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>HRA Recovery</label>
                    <input type="number" name="hra_recovery" value={modalEmp.hra_recovery || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Other Deductions</label>
                    <input type="number" name="other_deductions" value={modalEmp.other_deductions || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={commitModalSave} style={{ width: '120px' }}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Paybill;
