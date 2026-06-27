async function test() {
  const port = 8788;
  const fy = 2026;
  const emp_id = "6302407";
  const monthYearStr = "2026-06";

  console.log("Fetching individual consolidated statement data...");
  const resInd = await fetch(`http://localhost:${port}/api/reports/consolidated?fy=${fy}&emp_id=${emp_id}`, {
    headers: { 'Cookie': 'mock_email=sreejith@ksom.res.in' }
  });
  const dataInd = await resInd.json();
  const { earnings: earnInd, deductions: dedInd, supplementaryEarnings: supEarnInd = [], supplementaryDeductions: supDedInd = [] } = dataInd;

  console.log("Fetching all-employees consolidated statement data...");
  const resAll = await fetch(`http://localhost:${port}/api/reports/consolidated-all?fy=${fy}`, {
    headers: { 'Cookie': 'mock_email=sreejith@ksom.res.in' }
  });
  const dataAll = await resAll.json();
  const { earnings: earnAll, deductions: dedAll, supplementaryEarnings: supEarnAll = [], supplementaryDeductions: supDedAll = [] } = dataAll;

  // Individual calculation
  const eInd = earnInd.find(x => x.month_year === monthYearStr);
  const isLockedInd = eInd && eInd.is_approved === 1;
  const seInd = supEarnInd.find(x => x.month_year === monthYearStr);
  const isSupApprovedInd = !!seInd;

  const hasApprovedBillInd = isLockedInd || isSupApprovedInd;
  const basicInd = hasApprovedBillInd ? (
    (isLockedInd ? Math.round(parseFloat(eInd.basic_pay) || 0) : 0) +
    (isSupApprovedInd ? Math.round(parseFloat(seInd.basic_pay) || 0) : 0)
  ) : null;

  // All calculation
  const eAll = earnAll.find(x => x.emp_id === emp_id && x.month_year === monthYearStr);
  const isLockedAll = eAll && eAll.is_approved === 1;
  const seAll = supEarnAll.find(x => x.emp_id === emp_id && x.month_year === monthYearStr);
  const isSupApprovedAll = !!seAll;

  const hasApprovedBillAll = isLockedAll || isSupApprovedAll;
  const basicAll = (isLockedAll ? Math.round(parseFloat(eAll.basic_pay) || 0) : 0) + (isSupApprovedAll ? Math.round(parseFloat(seAll.basic_pay) || 0) : 0);

  console.log("\nComparison for emp_id 6302407 in 2026-06:");
  console.log("Individual statement:");
  console.log("  isLocked:", isLockedInd);
  console.log("  isSupApproved:", isSupApprovedInd);
  console.log("  basic:", basicInd);
  console.log("All Employees statement:");
  console.log("  isLocked:", isLockedAll);
  console.log("  isSupApproved:", isSupApprovedAll);
  console.log("  basic:", basicAll);
}

test();
