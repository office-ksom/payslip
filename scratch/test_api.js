async function test() {
  let port = 8788;
  
  console.log("Checking consolidated (individual) as admin (sreejith@ksom.res.in) for emp_id 6302407...");
  try {
    const res = await fetch(`http://localhost:${port}/api/reports/consolidated?fy=2026&emp_id=6302407`, {
      headers: {
        'Cookie': 'mock_email=sreejith@ksom.res.in'
      }
    });
    console.log("Status individual (admin):", res.status);
    const data = await res.json();
    console.log("Response keys individual (admin):", Object.keys(data));
    if (data.error) {
      console.log("Error individual (admin):", data.error);
    } else {
      console.log("Mapped employee Name:", data.employee ? data.employee.name : null);
    }
  } catch (e) {
    console.error("Failed to fetch individual report:", e.message);
  }
}

test();
