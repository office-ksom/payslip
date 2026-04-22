-- ============================================================
-- KSoM Payslip - Remote D1 Database Seed
-- Generated: 2026-04-22
-- ============================================================

-- EMPLOYEES
INSERT INTO employees (emp_id, name, designation, date_of_birth, date_of_joining, scale_of_pay, category, email_id, mob_no, is_active, epf_uan)
VALUES
  ('6302407', 'Sreejith Kurungott', 'System Analyst-Gr.III', '1973-11-18', '2010-10-28', '77200-140500', 'state', 'sreejith@ksom.res.in', '9495363959', 1, '101432734610'),
  ('6302412', 'Pranav haridas', 'Assistant Professor', '1987-11-11', '2019-03-22', '34500-120000', 'ugc/csir', NULL, NULL, 0, NULL),
  ('6302417', 'Prof. Ratnakumar P K', 'Director', '', '', 'PB 118500-218200(L 14)', 'ugc/csir', NULL, NULL, 1, NULL),
  ('6302403', 'Prof. A K Vijayarajan', 'Professor', '', '', 'Level 14 (7th Pay)', 'ugc/csir', NULL, NULL, 1, NULL),
  ('6302413', 'Dr. Akhilesh P', 'Assistant Professor', '', '', 'Level 12 (7th Pay)', 'ugc/csir', NULL, NULL, 1, NULL),
  ('6302414', 'Dr. Pranav Haridas', 'Assistant Professor', '', '', 'Level 12 (7th Pay)', 'ugc/csir', 'pranav@ksom.res.in', NULL, 1, '111111111111'),
  ('6302405', 'Billy Francis', 'Assistant Registrar-Gr.II', '', '', '63700-123700', 'state', NULL, NULL, 1, NULL),
  ('6302419', 'Renjith RS Nair', 'Accounts Officer', '', '', '59300-120900', 'state', NULL, NULL, 0, NULL),
  ('6302409', 'Rajesh Kuriakose', 'Librarian-Gr.III', '', '', '43400-91200', 'state', NULL, NULL, 1, NULL),
  ('6302408', 'Nidhin Babu M', 'Assistant-Gr.II', '', '', '35600-75400', 'state', 'nidhin@ksom.res.in', NULL, 1, '111111111111'),
  ('6302411', 'Bidusha M', 'Assistant-Gr.II', '', '', '35600-75400', 'state', NULL, NULL, 1, NULL),
  ('6302422', 'Anulal M', 'PA to Director', '', '', '50200-105300', 'state', NULL, NULL, 1, NULL)
ON CONFLICT(emp_id) DO UPDATE SET
  name=excluded.name, designation=excluded.designation, date_of_birth=excluded.date_of_birth,
  date_of_joining=excluded.date_of_joining, scale_of_pay=excluded.scale_of_pay, category=excluded.category,
  email_id=excluded.email_id, mob_no=excluded.mob_no, is_active=excluded.is_active, epf_uan=excluded.epf_uan;

-- ALLOWANCES SETTINGS
INSERT INTO allowances_settings (id, effective_from, da_state_percentage, da_ugc_percentage, hra_state_percentage, hra_ugc_percentage)
VALUES
  (1, '2020-01', 0, 0, 0, 0),
  (2, '2026-04', 35, 58, 10, 20),
  (3, '2026-01', 22, 58, 10, 20),
  (4, '2026-02', 25, 58, 10, 20),
  (6, '2026-03', 35, 58, 10, 20)
ON CONFLICT(id) DO UPDATE SET
  effective_from=excluded.effective_from, da_state_percentage=excluded.da_state_percentage,
  da_ugc_percentage=excluded.da_ugc_percentage, hra_state_percentage=excluded.hra_state_percentage,
  hra_ugc_percentage=excluded.hra_ugc_percentage;

-- MONTHLY EARNINGS
INSERT INTO monthly_earnings (emp_id, month_year, basic_pay, dp_gp, da_state, da_ugc, hra_state, hra_ugc, cca, other_earnings, spl_pay, tr_allow, spl_allow, fest_allow)
VALUES
  ('6302411','2026-01',40300,0,8866,0,4030,0,0,0,1100,0,0,0),
  ('6302405','2026-01',95600,0,21032,0,9560,0,0,0,0,0,0,0),
  ('6302413','2026-01',81200,0,0,47096,0,16240,0,0,0,5688,0,0),
  ('6302414','2026-01',81200,0,0,47096,0,16240,0,0,0,5688,0,0),
  ('6302408','2026-01',50200,0,11044,0,5020,0,0,0,0,0,0,0),
  ('6302403','2026-01',199600,0,0,115768,0,39920,0,0,0,5688,0,0),
  ('6302417','2026-01',218200,0,0,126556,0,43640,0,0,0,0,6800,0),
  ('6302409','2026-01',63700,0,14014,0,6370,0,0,0,0,0,0,0),
  ('6302419','2026-01',62200,0,13684,0,6220,0,0,0,0,0,0,0),
  ('6302407','2026-01',95600,0,21032,0,9560,0,0,0,0,0,0,0),
  ('6302411','2026-02',40300,0,10075,0,4030,0,0,0,1100,0,0,0),
  ('6302405','2026-02',95600,0,23900,0,9560,0,0,0,0,0,0,0),
  ('6302413','2026-02',81200,0,0,47096,0,16240,0,0,0,5688,0,0),
  ('6302414','2026-02',81200,0,0,47096,0,16240,0,0,0,5688,0,0),
  ('6302408','2026-02',50200,0,12550,0,5020,0,0,0,0,0,0,0),
  ('6302403','2026-02',199600,0,0,115768,0,39920,0,0,0,5688,0,0),
  ('6302417','2026-02',218200,0,0,126556,0,43640,0,0,0,0,6800,0),
  ('6302409','2026-02',63700,0,15925,0,6370,0,0,0,0,0,0,0),
  ('6302419','2026-02',62200,0,15550,0,6220,0,0,0,0,0,0,0),
  ('6302407','2026-02',95600,0,23900,0,9560,0,0,0,0,0,0,0),
  ('6302422','2026-03',25910,0,9068.5,0,2591,0,0,0,0,0,0,0),
  ('6302411','2026-03',40300,0,14105,0,4030,0,0,0,1100,0,0,0),
  ('6302405','2026-03',95600,0,33460,0,9560,0,0,0,0,0,0,0),
  ('6302413','2026-03',81200,0,0,47096,0,16240,0,0,0,5688,0,0),
  ('6302414','2026-03',81200,0,0,47096,0,16240,0,0,0,5688,0,0),
  ('6302408','2026-03',50200,0,17570,0,5020,0,0,0,0,0,0,0),
  ('6302403','2026-03',199600,0,0,115768,0,39920,0,0,0,5688,0,0),
  ('6302417','2026-03',218200,0,0,126556,0,43640,0,0,0,0,6800,0),
  ('6302409','2026-03',63700,0,22295,0,6370,0,0,0,0,0,0,0),
  ('6302407','2026-03',95600,0,33460,0,9560,0,0,0,0,0,0,0)
ON CONFLICT(emp_id, month_year) DO UPDATE SET
  basic_pay=excluded.basic_pay, dp_gp=excluded.dp_gp,
  da_state=excluded.da_state, da_ugc=excluded.da_ugc,
  hra_state=excluded.hra_state, hra_ugc=excluded.hra_ugc,
  cca=excluded.cca, other_earnings=excluded.other_earnings,
  spl_pay=excluded.spl_pay, tr_allow=excluded.tr_allow,
  spl_allow=excluded.spl_allow, fest_allow=excluded.fest_allow;

-- MONTHLY DEDUCTIONS
INSERT INTO monthly_deductions (emp_id, month_year, epf, cpf, professional_tax, sli, gis, lic, income_tax, onam_advance, hra_recovery, other_deductions)
VALUES
  ('6302411','2026-01',6045,0,0,1200,800,0,0,0,0,0),
  ('6302405','2026-01',14340,0,0,600,500,0,10500,4000,0,0),
  ('6302413','2026-01',15396,0,0,5600,600,0,7800,0,0,0),
  ('6302414','2026-01',1800,0,0,3000,600,0,18000,0,0,0),
  ('6302408','2026-01',7530,0,0,1200,800,0,0,0,0,0),
  ('6302403','2026-01',37844,0,0,0,0,0,84760,0,0,0),
  ('6302417','2026-01',24816,0,0,212,0,0,85000,0,0,0),
  ('6302409','2026-01',9106,0,0,3000,400,0,0,5000,0,0),
  ('6302419','2026-01',1800,0,0,1200,0,0,0,0,0,0),
  ('6302407','2026-01',13996,0,0,3000,1000,0,5000,4000,0,0),
  ('6302411','2026-02',6045,0,0,1200,800,0,0,0,0,0),
  ('6302405','2026-02',14340,0,1250,600,500,0,10500,4000,0,0),
  ('6302413','2026-02',15396,0,1250,5600,600,0,7800,0,0,0),
  ('6302414','2026-02',1800,0,1250,3000,600,0,18000,0,0,0),
  ('6302408','2026-02',7530,0,1250,1200,800,0,0,0,5020,0),
  ('6302403','2026-02',37844,0,1250,0,0,0,84760,0,0,0),
  ('6302417','2026-02',24816,0,1250,212,0,0,61100,0,0,0),
  ('6302409','2026-02',9555,0,1250,3000,400,0,0,0,0,0),
  ('6302419','2026-02',1800,0,0,1200,0,0,0,0,0,0),
  ('6302407','2026-02',14340,0,1250,3000,1000,0,2102,4000,0,0),
  ('6302422','2026-03',1800,0,0,0,1300,0,0,0,0,0),
  ('6302411','2026-03',6529,0,0,1200,800,0,0,0,0,0),
  ('6302405','2026-03',15487,0,0,600,500,0,11000,0,0,0),
  ('6302413','2026-03',15396,0,0,5600,600,0,15300,0,0,0),
  ('6302414','2026-03',1800,0,0,3000,600,0,15300,0,0,0),
  ('6302408','2026-03',8132,0,0,1200,800,0,0,0,5020,0),
  ('6302403','2026-03',37844,0,0,0,0,0,0,0,0,0),
  ('6302417','2026-03',41667,0,0,212,0,0,85000,0,0,0),
  ('6302409','2026-03',10319,0,0,3000,400,0,0,0,0,0),
  ('6302407','2026-03',15487,0,0,3000,1000,0,13000,0,0,0)
ON CONFLICT(emp_id, month_year) DO UPDATE SET
  epf=excluded.epf, cpf=excluded.cpf, professional_tax=excluded.professional_tax,
  sli=excluded.sli, gis=excluded.gis, lic=excluded.lic, income_tax=excluded.income_tax,
  onam_advance=excluded.onam_advance, hra_recovery=excluded.hra_recovery,
  other_deductions=excluded.other_deductions;
