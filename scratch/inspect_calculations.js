async function test() {
  const port = 8788;
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  
  try {
    for (const fy of years) {
      const empRes = await fetch(`http://localhost:${port}/api/employees?fy=${fy}`, {
        headers: { 'Cookie': 'mock_email=sreejith@ksom.res.in' }
      });
      const employees = await empRes.json();
      if (employees.error) {
        console.log(`FY ${fy}: skipped employees list:`, employees.error);
        continue;
      }
      
      console.log(`FY ${fy}: testing ${employees.length} employees...`);
      for (const emp of employees) {
        const empId = emp.emp_id;
        const res = await fetch(`http://localhost:${port}/api/reports/consolidated?fy=${fy}&emp_id=${empId}`, {
          headers: { 'Cookie': 'mock_email=sreejith@ksom.res.in' }
        });
        const previewData = await res.json();
        
        if (previewData.error) {
          console.error(`  API Error for ${emp.name} (${empId}):`, previewData.error);
          continue;
        }
        
        try {
          const { earnings, deductions, arrears, surrender, festival, supplementaryEarnings = [], supplementaryDeductions = [] } = previewData;

          const months = [];
          for (let i = 3; i <= 14; i++) {
            const m = i > 12 ? i - 12 : i;
            const y = i > 12 ? fy + 1 : fy;
            months.push(`${y}-${String(m).padStart(2, '0')}`);
          }

          let grandTotals = Array(25).fill(0);
          const rows = months.map(my => {
            const e = earnings.find(x => x.month_year === my);
            const isLocked = e && e.is_approved === 1;
            
            const se = supplementaryEarnings.find(x => x.month_year === my);
            const isSupApproved = !!se;
            const sd = supplementaryDeductions.find(x => x.month_year === my) || {};
            
            const hasApprovedBill = isLocked || isSupApproved;

            const monthArrears = arrears ? arrears.filter(x => x.bill_date && x.bill_date.substring(0, 7) === my) : [];
            const arrearAmt = hasApprovedBill ? monthArrears.reduce((sum, curr) => sum + Math.round(parseFloat(curr.arrear_amount) || 0), 0) : null;
            const arrearIT = hasApprovedBill ? monthArrears.reduce((sum, curr) => sum + Math.round(parseFloat(curr.income_tax) || 0), 0) : null;

            const monthSurrender = surrender ? surrender.filter(x => x.bill_date && x.bill_date.substring(0, 7) === my) : [];
            const surrenderAmt = hasApprovedBill ? monthSurrender.reduce((sum, curr) => sum + Math.round(parseFloat(curr.total_amount) || 0), 0) : null;

            const monthFestival = festival ? festival.filter(x => x.bill_date && x.bill_date.substring(0, 7) === my) : [];
            const festivalAmt = hasApprovedBill ? monthFestival.reduce((sum, curr) => sum + Math.round(parseFloat(curr.amount) || 0), 0) : null;

            const basic = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(e.basic_pay) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(se.basic_pay) || 0) : 0)
            ) : null;

            const da = hasApprovedBill ? (
              (isLocked ? Math.round((parseFloat(e.da_state) || 0) + (parseFloat(e.da_ugc) || 0)) : 0) +
              (isSupApproved ? Math.round((parseFloat(se.da_state) || 0) + (parseFloat(se.da_ugc) || 0)) : 0)
            ) : null;

            const hra = hasApprovedBill ? (
              (isLocked ? Math.round((parseFloat(e.hra_state) || 0) + (parseFloat(e.hra_ugc) || 0)) : 0) +
              (isSupApproved ? Math.round((parseFloat(se.hra_state) || 0) + (parseFloat(se.hra_ugc) || 0)) : 0)
            ) : null;

            const dpgp = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(e.dp_gp) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(se.dp_gp) || 0) : 0)
            ) : null;

            const cca = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(e.cca) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(se.cca) || 0) : 0)
            ) : null;

            const spl = hasApprovedBill ? (
              (isLocked ? Math.round((parseFloat(e.spl_pay) || 0) + (parseFloat(e.spl_allow) || 0)) : 0) +
              (isSupApproved ? Math.round((parseFloat(se.spl_pay) || 0) + (parseFloat(se.spl_allow) || 0)) : 0)
            ) : null;

            const tr = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(e.tr_allow) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(se.tr_allow) || 0) : 0)
            ) : null;

            const otherEarn = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(e.other_earnings) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(se.other_earnings) || 0) : 0)
            ) : null;

            const gross = hasApprovedBill ? (basic + dpgp + da + hra + spl + cca + tr + otherEarn + (arrearAmt || 0) + (surrenderAmt || 0) + (festivalAmt || 0)) : null;
            
            const d = deductions.find(x => x.month_year === my) || {};
            const epf = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(d.epf) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(sd.epf) || 0) : 0)
            ) : null;

            const cpf = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(d.cpf) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(sd.cpf) || 0) : 0)
            ) : null;

            const it = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(d.income_tax) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(sd.income_tax) || 0) : 0)
            ) : null;

            const pt = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(d.professional_tax) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(sd.professional_tax) || 0) : 0)
            ) : null;

            const sli = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(d.sli) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(sd.sli) || 0) : 0)
            ) : null;

            const gis = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(d.gis) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(sd.gis) || 0) : 0)
            ) : null;

            const lic = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(d.lic) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(sd.lic) || 0) : 0)
            ) : null;

            const adv = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(d.onam_advance) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(sd.onam_advance) || 0) : 0)
            ) : null;

            const hrRec = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(d.hra_recovery) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(sd.hra_recovery) || 0) : 0)
            ) : null;

            const otherDed = hasApprovedBill ? (
              (isLocked ? Math.round(parseFloat(d.other_deductions) || 0) : 0) +
              (isSupApproved ? Math.round(parseFloat(sd.other_deductions) || 0) : 0)
            ) : null;

            const totDed = hasApprovedBill ? (epf + cpf + it + pt + sli + gis + lic + adv + hrRec + otherDed + (arrearIT || 0)) : null;
            const net = hasApprovedBill ? (gross - totDed) : null;

            const values = [
              basic, da, hra, dpgp, cca, spl, tr, otherEarn, arrearAmt, surrenderAmt, festivalAmt, gross,
              epf, cpf, it, pt, sli, gis, lic, adv, hrRec, otherDed, arrearIT, totDed, net
            ];

            values.forEach((v, idx) => {
              if (v !== null && v !== undefined) {
                grandTotals[idx] += v;
              }
            });
            
            return { values };
          });
        } catch (err) {
          console.error(`  ERROR for employee ${emp.name} (${empId}) in FY ${fy}:`, err);
        }
      }
    }
    console.log("Validation check completed.");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
