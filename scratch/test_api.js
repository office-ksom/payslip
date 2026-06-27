async function test() {
  let port = 8788;
  
  console.log("Checking consolidated (individual) as viewer (pranav@ksom.res.in) without emp_id...");
  try {
    const res = await fetch(`http://localhost:${port}/api/reports/consolidated?fy=2026`, {
      headers: {
        'Cookie': 'mock_email=pranav@ksom.res.in'
      }
    });
    console.log("Status individual (viewer):", res.status);
    const data = await res.json();
    console.log("Response keys individual (viewer):", Object.keys(data));
    if (data.error) {
      console.log("Error individual (viewer):", data.error);
    } else {
      console.log("Mapped employee Name:", data.employee ? data.employee.name : null);
    }
  } catch (e) {
    console.error("Failed to fetch individual report:", e.message);
  }
}

test();
