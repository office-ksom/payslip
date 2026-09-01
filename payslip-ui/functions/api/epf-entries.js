export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const month_year = url.searchParams.get('month_year');
    const category = url.searchParams.get('category'); // 'permanent' or 'daily_wage'

    if (!month_year) {
      return new Response(JSON.stringify({ error: 'month_year is required' }), { status: 400 });
    }
    if (!category || (category !== 'permanent' && category !== 'daily_wage')) {
      return new Response(JSON.stringify({ error: 'category must be either permanent or daily_wage' }), { status: 400 });
    }

    const db = context.env.ksom_payslip_db;

    // 1. First, check if we have saved EPF entries for this month & category
    let savedQuery = "";
    if (category === 'permanent') {
      savedQuery = `
        SELECT 
          e.emp_id,
          e.name,
          e.epf_uan AS uan,
          e.date_of_joining,
          e.appointment_type,
          e.is_active,
          ee.wages,
          ee.epf_wage,
          ee.eps_wage,
          ee.edli,
          ee.employee_contribution,
          ee.employer_contribution,
          ee.admin_charges,
          ee.is_approved,
          ee.approved_on,
          ee.approved_by,
          1 AS is_saved
        FROM epf_entries ee
        JOIN employees e ON ee.emp_id = e.emp_id
        WHERE ee.month_year = ? AND ee.employee_category = 'permanent'
        ORDER BY (CASE WHEN e.is_active = 0 THEN 1 ELSE 0 END) ASC, e.sort_order ASC, e.name ASC
      `;
    } else {
      savedQuery = `
        SELECT 
          d.emp_id,
          d.name,
          d.epf_uan AS uan,
          d.date_of_joining,
          d.is_active,
          ee.wages,
          ee.epf_wage,
          ee.eps_wage,
          ee.edli,
          ee.employee_contribution,
          ee.employer_contribution,
          ee.admin_charges,
          ee.is_approved,
          ee.approved_on,
          ee.approved_by,
          1 AS is_saved
        FROM epf_entries ee
        JOIN daily_wage_employees d ON ee.emp_id = d.emp_id
        WHERE ee.month_year = ? AND ee.employee_category = 'daily_wage'
        ORDER BY (CASE WHEN d.is_active = 0 THEN 1 ELSE 0 END) ASC, d.sort_order ASC, d.name ASC
      `;
    }

    const { results: savedResults } = await db.prepare(savedQuery).bind(month_year).all();

    if (savedResults && savedResults.length > 0) {
      return new Response(JSON.stringify(savedResults), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. If no saved entries, populate from the paybills
    let paybillQuery = "";
    if (category === 'permanent') {
      paybillQuery = `
        SELECT 
          e.emp_id, 
          e.name, 
          e.epf_uan AS uan, 
          e.date_of_joining,
          e.appointment_type,
          e.is_active,
          (coalesce(me.basic_pay, 0) + coalesce(me.da_state, 0) + coalesce(me.da_ugc, 0)) AS wages,
          coalesce(md.epf, 0) AS employee_contribution,
          0 AS is_saved
        FROM employees e
        JOIN monthly_earnings me ON e.emp_id = me.emp_id AND me.month_year = ?
        JOIN monthly_deductions md ON e.emp_id = md.emp_id AND md.month_year = ?
        WHERE md.epf > 0 AND e.is_active = 1
        ORDER BY (CASE WHEN e.is_active = 0 THEN 1 ELSE 0 END) ASC, e.sort_order ASC, e.name ASC
      `;
    } else {
      paybillQuery = `
        SELECT 
          d.emp_id, 
          d.name, 
          d.epf_uan AS uan, 
          d.date_of_joining,
          d.is_active,
          coalesce(dwe.basic_pay, 0) AS wages,
          coalesce(dwd.epf, 0) AS employee_contribution,
          0 AS is_saved
        FROM daily_wage_employees d
        JOIN daily_wage_monthly_earnings dwe ON d.emp_id = dwe.emp_id AND dwe.month_year = ?
        JOIN daily_wage_monthly_deductions dwd ON d.emp_id = dwd.emp_id AND dwd.month_year = ?
        WHERE dwd.epf > 0 AND d.is_active = 1
        ORDER BY (CASE WHEN d.is_active = 0 THEN 1 ELSE 0 END) ASC, d.sort_order ASC, d.name ASC
      `;
    }

    const { results: paybillResults } = await db.prepare(paybillQuery).bind(month_year, month_year).all();

    // 3. Process and calculate fields
    const calculatedResults = paybillResults.map(row => {
      const wages = row.wages || 0;
      const doj = row.date_of_joining;

      let status = 'before_2014';
      if (doj) {
        if (doj >= '2025-08-01') {
          status = 'after_2025';
        } else if (doj >= '2014-09-01') {
          status = 'after_2014_before_2025';
        }
      }

      // Formula 1: EPF Wage = 15000 for joined after 01-09-2014, and basic+DA (wages) for others
      let epf_wage = wages;
      if (status === 'after_2014_before_2025' || status === 'after_2025') {
        epf_wage = Math.min(wages, 15000);
      }

      // Formula 2: EPS Wage = basic+DA (wages) for joined before 01-09-2014, Rs. 15000 for joined after 01-09-2014 and before 01-08-2025, 0 for joined after 01-08-2025
      let eps_wage = 0;
      if (status === 'before_2014') {
        eps_wage = wages;
      } else if (status === 'after_2014_before_2025') {
        eps_wage = Math.min(wages, 15000);
      }

      const isDeputation = row.appointment_type === 'Deputation';

      // EDLI = 0.5% of EPF Wage subject to maximum EPF Wage of 15000 (0 for Deputation)
      const edli = isDeputation ? 0 : Math.round(Math.min(epf_wage, 15000) * 0.005);

      // EPF Employee Contribution = populated from paybill
      const employee_contribution = row.employee_contribution || 0;

      // EPF Employer Contribution = 12% of EPF Wage (0 for Deputation)
      const employer_contribution = isDeputation ? 0 : Math.round(epf_wage * 0.12);

      // Administrative charges = 0.5% of EPF Wage (0 for Deputation)
      const admin_charges = isDeputation ? 0 : Math.round(epf_wage * 0.005);

      return {
        ...row,
        epf_wage,
        eps_wage,
        edli,
        employee_contribution,
        employer_contribution,
        admin_charges,
        is_approved: 0,
        approved_on: null,
        approved_by: null
      };
    });

    return new Response(JSON.stringify(calculatedResults), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { month_year, category, entries } = data;

    if (!month_year || !category || !Array.isArray(entries)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    const db = context.env.ksom_payslip_db;

    const statements = [];

    // 1. Delete existing records for this month and category
    statements.push(
      db.prepare('DELETE FROM epf_entries WHERE month_year = ? AND employee_category = ?')
        .bind(month_year, category)
    );

    // 2. Insert new records and update UAN
    for (const entry of entries) {
      statements.push(
        db.prepare(`
          INSERT INTO epf_entries (
            emp_id, employee_category, month_year, wages, epf_wage, eps_wage, edli, 
            employee_contribution, employer_contribution, admin_charges, is_approved, approved_on, approved_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          entry.emp_id,
          category,
          month_year,
          entry.wages || 0,
          entry.epf_wage || 0,
          entry.eps_wage || 0,
          entry.edli || 0,
          entry.employee_contribution || 0,
          entry.employer_contribution || 0,
          entry.admin_charges || 0,
          entry.is_approved || 0,
          entry.approved_on || null,
          entry.approved_by || null
        )
      );

      // Update the UAN No. in the employees/daily_wage_employees tables if changed
      if (entry.uan) {
        if (category === 'permanent') {
          statements.push(
            db.prepare('UPDATE employees SET epf_uan = ? WHERE emp_id = ?').bind(entry.uan, entry.emp_id)
          );
        } else {
          statements.push(
            db.prepare('UPDATE daily_wage_employees SET epf_uan = ? WHERE emp_id = ?').bind(entry.uan, entry.emp_id)
          );
        }
      }
    }

    await db.batch(statements);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
