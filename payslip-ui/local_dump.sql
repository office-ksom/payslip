PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE backup_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    backup_email TEXT,
    frequency TEXT DEFAULT 'weekly', 
    is_enabled INTEGER DEFAULT 0,
    last_backup_at TIMESTAMP
);
INSERT INTO "backup_settings" VALUES(1,NULL,'daily',0,NULL);
CREATE TABLE employees (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, designation TEXT, date_of_birth TEXT, date_of_joining TEXT, scale_of_pay TEXT, category TEXT, title TEXT, sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1, email_id TEXT, mob_no TEXT, epf_uan TEXT);
INSERT INTO "employees" VALUES(1,'6302407','Sreejith Kurungott','System Analyst-Gr.III','1973-11-18','2010-10-28','77200-140500','state','Mr.',6,1,'sreejith@ksom.res.in','9495363959','101432734610');
INSERT INTO "employees" VALUES(3,'6302417','Ratnakumar P K','Director','','','PB 118500-218200(L 14)','ugc/csir','Prof.',1,1,NULL,NULL,NULL);
INSERT INTO "employees" VALUES(4,'6302403','A K Vijayarajan','Professor','','','Level 14 (7th Pay)','ugc/csir','Prof.',2,1,NULL,NULL,NULL);
INSERT INTO "employees" VALUES(5,'6302413','Akhilesh P','Assistant Professor','','','Level 12 (7th Pay)','ugc/csir','Dr.',3,1,NULL,NULL,NULL);
INSERT INTO "employees" VALUES(6,'6302414','Pranav Haridas','Assistant Professor','','','Level 12 (7th Pay)','ugc/csir','Dr.',4,1,'pranav@ksom.res.in',NULL,'111111111111');
INSERT INTO "employees" VALUES(7,'6302405','Billy Francis','Assistant Registrar-Gr.II','','','63700-123700','state','Mr.',5,1,NULL,NULL,NULL);
INSERT INTO "employees" VALUES(8,'6302419','Renjith RS Nair','Accounts Officer','','','59300-120900','state','Mr.',0,0,NULL,NULL,NULL);
INSERT INTO "employees" VALUES(9,'6302409','Rajesh Kuriakose','Librarian-Gr.III','','','43400-91200','state','Dr.',7,1,'rajesh@ksom.res.in',NULL,NULL);
INSERT INTO "employees" VALUES(10,'6302408','Nidhin Babu M','Assistant-Gr.II','','','35600-75400','state','Mr.',8,1,'nidhin@ksom.res.in',NULL,'111111111111');
INSERT INTO "employees" VALUES(11,'6302411','Bidusha M','Assistant-Gr.II','','','35600-75400','state','Mrs.',9,1,NULL,NULL,NULL);
INSERT INTO "employees" VALUES(12,'6302422','Anulal M','PA to Director','','','50200-105300','state','Mr.',10,1,NULL,NULL,NULL);
CREATE TABLE allowances_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, effective_from TEXT NOT NULL UNIQUE, da_state_percentage REAL DEFAULT 0, da_ugc_percentage REAL DEFAULT 0, hra_state_percentage REAL DEFAULT 0, hra_ugc_percentage REAL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO "allowances_settings" VALUES(1,'2020-01',0,0,0,0,'2026-04-21 04:58:14');
INSERT INTO "allowances_settings" VALUES(2,'2026-04',35,58,10,20,'2026-04-21 05:12:47');
INSERT INTO "allowances_settings" VALUES(3,'2026-01',22,58,10,20,'2026-04-21 09:13:44');
INSERT INTO "allowances_settings" VALUES(4,'2026-02',25,58,10,20,'2026-04-21 10:38:35');
INSERT INTO "allowances_settings" VALUES(6,'2026-03',35,58,10,20,'2026-04-22 10:12:56');
CREATE TABLE monthly_earnings (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id TEXT NOT NULL, month_year TEXT NOT NULL, basic_pay REAL DEFAULT 0, dp_gp REAL DEFAULT 0, da_state REAL DEFAULT 0, da_ugc REAL DEFAULT 0, hra_state REAL DEFAULT 0, hra_ugc REAL DEFAULT 0, cca REAL DEFAULT 0, other_earnings REAL DEFAULT 0, spl_pay REAL DEFAULT 0, tr_allow REAL DEFAULT 0, spl_allow REAL DEFAULT 0, fest_allow REAL DEFAULT 0, other_earnings_breakdown TEXT, is_approved INTEGER DEFAULT 0, approved_on TEXT, approved_by TEXT, FOREIGN KEY(emp_id) REFERENCES employees(emp_id), UNIQUE(emp_id, month_year));
INSERT INTO "monthly_earnings" VALUES(2,'6302407','2026-04',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-05-19T06:46:44.882Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(5,'6302411','2026-01',40300,0,8866,0,4030,0,0,0,1100,0,0,0,NULL,1,'2026-05-15T08:48:52.513Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(6,'6302405','2026-01',95600,0,21032,0,9560,0,0,0,0,0,0,0,NULL,1,'2026-05-15T08:48:52.513Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(7,'6302413','2026-01',81200,0,0,47096,0,16240,0,0,0,5688,0,0,NULL,1,'2026-05-15T08:48:52.513Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(8,'6302414','2026-01',81200,0,0,47096,0,16240,0,0,0,5688,0,0,NULL,1,'2026-05-15T08:48:52.513Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(9,'6302408','2026-01',50200,0,11044,0,5020,0,0,0,0,0,0,0,NULL,1,'2026-05-15T08:48:52.513Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(10,'6302403','2026-01',199600,0,0,115768,0,39920,0,0,0,5688,0,0,NULL,1,'2026-05-15T08:48:52.513Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(11,'6302417','2026-01',218200,0,0,126556,0,43640,0,0,0,0,6800,0,NULL,1,'2026-05-15T08:48:52.513Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(12,'6302409','2026-01',62200,0,13684,0,6220,0,0,0,0,0,0,0,NULL,1,'2026-05-15T08:48:52.513Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(13,'6302419','2026-01',62200,0,13684,0,6220,0,0,0,0,0,0,0,NULL,1,'2026-05-15T08:48:52.513Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(14,'6302407','2026-01',95600,0,21032,0,9560,0,0,0,0,0,0,0,NULL,1,'2026-05-15T08:48:52.513Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(45,'6302411','2026-02',40300,0,10075,0,4030,0,0,0,1100,0,0,0,NULL,1,'2026-05-15T09:03:13.287Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(46,'6302405','2026-02',95600,0,23900,0,9560,0,0,0,0,0,0,0,NULL,1,'2026-05-15T09:03:13.287Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(47,'6302413','2026-02',81200,0,0,47096,0,16240,0,0,0,5688,0,0,NULL,1,'2026-05-15T09:03:13.287Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(48,'6302414','2026-02',81200,0,0,47096,0,16240,0,0,0,5688,0,0,NULL,1,'2026-05-15T09:03:13.287Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(49,'6302408','2026-02',50200,0,12550,0,5020,0,0,0,0,0,0,0,NULL,1,'2026-05-15T09:03:13.287Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(50,'6302403','2026-02',199600,0,0,115768,0,39920,0,0,0,5688,0,0,NULL,1,'2026-05-15T09:03:13.287Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(51,'6302417','2026-02',218200,0,0,126556,0,43640,0,0,0,0,6800,0,NULL,1,'2026-05-15T09:03:13.287Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(52,'6302409','2026-02',63700,0,15925,0,6370,0,0,0,0,0,0,0,NULL,1,'2026-05-15T09:03:13.287Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(53,'6302419','2026-02',62200,0,15550,0,6220,0,0,0,0,0,0,0,NULL,1,'2026-05-15T09:03:13.287Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(54,'6302407','2026-02',95600,0,23900,0,9560,0,0,0,0,0,0,0,NULL,1,'2026-05-15T09:03:13.287Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(55,'6302422','2026-03',25910,0,9068.5,0,2591,0,0,0,0,0,0,0,NULL,1,'2026-05-15T10:50:42.916Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(56,'6302411','2026-03',40300,0,14105,0,4030,0,0,0,1100,0,0,0,NULL,1,'2026-05-15T10:50:42.916Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(57,'6302405','2026-03',95600,0,33460,0,9560,0,0,0,0,0,0,0,NULL,1,'2026-05-15T10:50:42.916Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(58,'6302413','2026-03',81200,0,0,47096,0,16240,0,0,0,5688,0,0,NULL,1,'2026-05-15T10:50:42.916Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(59,'6302414','2026-03',81200,0,0,47096,0,16240,0,0,0,5688,0,0,NULL,1,'2026-05-15T10:50:42.916Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(60,'6302408','2026-03',50200,0,17570,0,5020,0,0,0,0,0,0,0,NULL,1,'2026-05-15T10:50:42.916Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(61,'6302403','2026-03',199600,0,0,115768,0,39920,0,0,0,5688,0,0,NULL,1,'2026-05-15T10:50:42.916Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(62,'6302417','2026-03',218200,0,0,126556,0,43640,0,0,0,0,6800,0,NULL,1,'2026-05-15T10:50:42.916Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(63,'6302409','2026-03',63700,0,22295,0,6370,0,0,0,0,0,0,0,NULL,1,'2026-05-15T10:50:42.916Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(64,'6302407','2026-03',95600,0,33460,0,9560,0,0,0,0,0,0,0,NULL,1,'2026-05-15T10:50:42.916Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(66,'6302417','2026-04',218200,0,0,126556,0,43640,0,0,0,0,6800,0,'[]',1,'2026-05-19T06:46:44.882Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(67,'6302403','2026-04',199600,0,0,115768,0,39920,0,0,0,5688,0,0,'[]',1,'2026-05-19T06:46:44.882Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(68,'6302413','2026-04',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-05-19T06:46:44.882Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(69,'6302414','2026-04',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-05-19T06:46:44.882Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(70,'6302405','2026-04',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-05-19T06:46:44.882Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(72,'6302409','2026-04',63700,0,22295,0,6370,0,0,0,0,0,0,0,'[]',1,'2026-05-19T06:46:44.882Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(73,'6302408','2026-04',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-05-19T06:46:44.882Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(74,'6302411','2026-04',40300,0,14105,0,4030,0,0,0,1100,0,0,0,'[]',1,'2026-05-19T06:46:44.882Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(75,'6302422','2026-04',25910,0,9068.5,0,2591,0,0,0,0,0,0,0,'[]',1,'2026-05-19T06:46:44.882Z','director@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(109,'6302417','2026-05',100000,0,0,58000,0,20000,0,0,0,0,0,0,'[]',1,'2026-05-20T05:06:23.574Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(110,'6302403','2026-05',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:06:23.574Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(111,'6302413','2026-05',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:06:23.574Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(112,'6302414','2026-05',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:06:23.574Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(113,'6302405','2026-05',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:06:23.574Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(114,'6302407','2026-05',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:06:23.574Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(115,'6302409','2026-05',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:06:23.574Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(116,'6302408','2026-05',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:06:23.574Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(117,'6302411','2026-05',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:06:23.574Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(118,'6302422','2026-05',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:06:23.574Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(129,'6302417','2026-06',100000,0,0,58000,0,20000,0,0,0,0,0,0,'[]',1,'2026-05-20T05:15:54.750Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(130,'6302403','2026-06',200000,0,0,116000,0,40000,0,0,0,0,0,0,'[]',1,'2026-05-20T05:15:54.750Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(131,'6302413','2026-06',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:15:54.750Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(132,'6302414','2026-06',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:15:54.750Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(133,'6302405','2026-06',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:15:54.750Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(134,'6302407','2026-06',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:15:54.750Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(135,'6302409','2026-06',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:15:54.750Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(136,'6302408','2026-06',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:15:54.750Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(137,'6302411','2026-06',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:15:54.750Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" VALUES(138,'6302422','2026-06',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-05-20T05:15:54.750Z','nidhin@ksom.res.in');
CREATE TABLE monthly_deductions (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id TEXT NOT NULL, month_year TEXT NOT NULL, epf REAL DEFAULT 0, professional_tax REAL DEFAULT 0, sli REAL DEFAULT 0, gis REAL DEFAULT 0, lic REAL DEFAULT 0, income_tax REAL DEFAULT 0, onam_advance REAL DEFAULT 0, other_deductions REAL DEFAULT 0, cpf REAL DEFAULT 0, hra_recovery REAL DEFAULT 0, other_deductions_breakdown TEXT, FOREIGN KEY(emp_id) REFERENCES employees(emp_id), UNIQUE(emp_id, month_year));
INSERT INTO "monthly_deductions" VALUES(2,'6302407','2026-04',15487,0,3000,1000,0,13000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(5,'6302411','2026-01',5900,0,1200,800,0,0,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(6,'6302405','2026-01',13996,0,600,500,0,10500,4000,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(7,'6302413','2026-01',15396,0,5600,600,0,6465,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(8,'6302414','2026-01',1800,0,3000,600,0,0,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(9,'6302408','2026-01',7349,0,1200,800,0,0,0,0,0,5020,NULL);
INSERT INTO "monthly_deductions" VALUES(10,'6302403','2026-01',37844,0,0,0,0,73348,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(11,'6302417','2026-01',24816,0,212,0,0,85000,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(12,'6302409','2026-01',9106,0,3000,400,0,0,5000,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(13,'6302419','2026-01',1800,0,1200,0,0,0,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(14,'6302407','2026-01',13996,0,3000,1000,0,5000,4000,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(45,'6302411','2026-02',6045,0,1200,800,0,0,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(46,'6302405','2026-02',14340,1250,600,500,0,10500,4000,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(47,'6302413','2026-02',15396,1250,5600,600,0,7800,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(48,'6302414','2026-02',1800,1250,3000,600,0,18000,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(49,'6302408','2026-02',7530,1250,1200,800,0,0,0,0,0,5020,NULL);
INSERT INTO "monthly_deductions" VALUES(50,'6302403','2026-02',37844,1250,0,0,0,84760,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(51,'6302417','2026-02',24816,1250,212,0,0,61100,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(52,'6302409','2026-02',9555,1250,3000,400,0,0,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(53,'6302419','2026-02',1800,0,1200,0,0,0,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(54,'6302407','2026-02',14340,1250,3000,1000,0,2102,4000,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(55,'6302422','2026-03',1800,0,0,1300,0,0,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(56,'6302411','2026-03',6529,0,1200,800,0,0,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(57,'6302405','2026-03',15487,0,600,500,0,11000,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(58,'6302413','2026-03',15396,0,5600,600,0,15300,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(59,'6302414','2026-03',1800,0,3000,600,0,15300,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(60,'6302408','2026-03',8132,0,1200,800,0,0,0,0,0,5020,NULL);
INSERT INTO "monthly_deductions" VALUES(61,'6302403','2026-03',37844,0,0,0,0,0,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(62,'6302417','2026-03',41667,0,212,0,0,85000,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(63,'6302409','2026-03',10319,0,3000,400,0,0,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(64,'6302407','2026-03',15487,0,3000,1000,0,13000,0,0,0,0,NULL);
INSERT INTO "monthly_deductions" VALUES(66,'6302417','2026-04',41667,0,212,0,0,85000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(67,'6302403','2026-04',37844,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(68,'6302413','2026-04',15396,0,5600,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(69,'6302414','2026-04',1800,0,3000,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(70,'6302405','2026-04',15487,0,600,500,0,11000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(72,'6302409','2026-04',10319,0,3000,400,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(73,'6302408','2026-04',8132,0,1200,800,0,0,0,0,0,5020,'[]');
INSERT INTO "monthly_deductions" VALUES(74,'6302411','2026-04',6529,0,1200,800,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(75,'6302422','2026-04',1800,0,0,1300,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(109,'6302417','2026-05',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(110,'6302403','2026-05',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(111,'6302413','2026-05',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(112,'6302414','2026-05',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(113,'6302405','2026-05',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(114,'6302407','2026-05',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(115,'6302409','2026-05',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(116,'6302408','2026-05',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(117,'6302411','2026-05',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(118,'6302422','2026-05',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(129,'6302417','2026-06',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(130,'6302403','2026-06',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(131,'6302413','2026-06',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(132,'6302414','2026-06',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(133,'6302405','2026-06',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(134,'6302407','2026-06',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(135,'6302409','2026-06',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(136,'6302408','2026-06',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(137,'6302411','2026-06',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" VALUES(138,'6302422','2026-06',0,0,0,0,0,0,0,0,0,0,'[]');
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer', 
    status TEXT NOT NULL DEFAULT 'active', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
, password TEXT, password_hash TEXT, reset_token TEXT, reset_token_expiry TIMESTAMP, name TEXT, designation TEXT);
INSERT INTO "users" VALUES(1,'sreejith@ksom.res.in','super_admin','active','2026-05-05 11:03:03',NULL,'100000.4fe8d0400f00698c82fe5a634ab89bd3.31e17aa715894e91aaae227a50fb33696f920effe0eac5927767fa3060441dd5',NULL,NULL,'Sreejith Kurungott','System Analyst-Gr.III');
INSERT INTO "users" VALUES(2,'office@ksom.res.in','admin','active','2026-05-02 11:16:39',NULL,'100000.4fe8d0400f00698c82fe5a634ab89bd3.31e17aa715894e91aaae227a50fb33696f920effe0eac5927767fa3060441dd5',NULL,NULL,NULL,NULL);
INSERT INTO "users" VALUES(3,'webmaster@ksom.res.in','viewer','active','2026-05-02 11:17:05',NULL,'100000.73fc5b7ebc24189106e9746bc0c4fc6f.d7304b4986d4b0738f657cff75abf45373603e9604e8ecf1d64c2c9dd8eda892',NULL,NULL,NULL,NULL);
INSERT INTO "users" VALUES(4,'rajesh@ksom.res.in','viewer','active','2026-05-04 08:24:26',NULL,'100000.235608146e564fc93baa19a8b1085ba0.065f11e1c93f79b87a5f2cfcd9c94440b17393a3ab68f5a5b6f4241fa7ce3672',NULL,NULL,'Rajesh Kuriakose','Librarian-Gr.III');
INSERT INTO "users" VALUES(5,'pranav@ksom.res.in','viewer','active','2026-05-04 08:25:39',NULL,'100000.fc4db576c1ef4b7430d859f153cbfba4.f8b75398ee4a139f6d337040fe0e143ab780e3af56cba8109ea2d158c9cdaf01',NULL,NULL,'Pranav Haridas','Assistant Professor');
INSERT INTO "users" VALUES(6,'nidhin@ksom.res.in','admin','active','2026-05-06 06:19:42',NULL,'100000.3c464ceb8967bb5a934be297ae4b1032.7c906101ce42e985ce8ba5a07141e7d59b27d9f4051f790666c1323c86bdacb4',NULL,NULL,'Nidhin Babu M','Assistant-Gr.II');
INSERT INTO "users" VALUES(7,'director@ksom.res.in','approver','active','2026-05-15 07:05:29',NULL,'100000.1eef23116d04512be1eeff1abf41c154.913ae0fb5afcd4282556d2602d63b46aec5c39ae2b7182e6ca6a3acb92295a27',NULL,NULL,'Prof. Ratnakumar P K','Director');
INSERT INTO "users" VALUES(13,'testlogs@ksom.res.in','viewer','active','2026-05-20 06:17:15',NULL,NULL,NULL,NULL,'Test Logs User','Tester');
CREATE TABLE surrender_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    bill_date TEXT NOT NULL, 
    financial_year TEXT NOT NULL, 
    basic_pay REAL DEFAULT 0,
    da REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    num_els INTEGER NOT NULL,
    total_amount REAL DEFAULT 0,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(emp_id) REFERENCES employees(emp_id),
    UNIQUE(emp_id, bill_date)
);
INSERT INTO "surrender_bills" VALUES(1,'6302407','2026-05-18','2026-2027',95600,33460,9560,20,92413,1,'2026-05-18T09:12:41.514Z','director@ksom.res.in','2026-05-18 08:48:15');
INSERT INTO "surrender_bills" VALUES(3,'6302408','2026-05-18','2026-2027',50200,17570,5020,30,72790,1,'2026-05-19T05:32:15.200Z','director@ksom.res.in','2026-05-18 09:39:01');
INSERT INTO "surrender_bills" VALUES(6,'6302409','2026-05-20','2026-2027',63700,22295,6300,30,92295,1,'2026-05-20T05:17:36.399Z','nidhin@ksom.res.in','2026-05-20 05:17:26');
CREATE TABLE arrear_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    arrear_type TEXT NOT NULL, 
    arrear_type_other TEXT, 
    category TEXT NOT NULL, 
    arrear_amount REAL DEFAULT 0,
    income_tax REAL DEFAULT 0,
    net_amount REAL DEFAULT 0,
    bill_date TEXT NOT NULL, 
    description TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(emp_id) REFERENCES employees(emp_id),
    UNIQUE(emp_id, bill_date, arrear_type)
);
INSERT INTO "arrear_bills" VALUES(1,'6302408','Pay revision',NULL,'state',300000,30000,270000,'2026-05-18','11th Pay revision arrear',1,'2026-05-18T09:13:35.334Z','director@ksom.res.in','2026-05-18 08:51:50');
INSERT INTO "arrear_bills" VALUES(2,'6302409','Pay revision',NULL,'state',350000,35000,315000,'2026-05-18','11th Pay revision arrear',1,'2026-05-18T09:13:35.334Z','director@ksom.res.in','2026-05-18 08:53:00');
INSERT INTO "arrear_bills" VALUES(4,'6302413','DA Arrears',NULL,'ugc/csir',150000,15000,135000,'2026-05-18','DA arrear from 2023 Jan to 2026 Jan',1,'2026-05-18T09:14:03.819Z','director@ksom.res.in','2026-05-18 08:55:02');
INSERT INTO "arrear_bills" VALUES(5,'6302414','DA Arrears',NULL,'ugc/csir',150000,15000,135000,'2026-05-18','DA arrear from 2023 Jan to 2026 Jan',1,'2026-05-18T09:14:03.819Z','director@ksom.res.in','2026-05-18 08:55:02');
INSERT INTO "arrear_bills" VALUES(6,'6302407','Pay revision',NULL,'state',400000,40000,360000,'2026-05-18','11th Pay revision arrear',0,NULL,NULL,'2026-05-18 09:50:11');
INSERT INTO "arrear_bills" VALUES(7,'6302408','DA Arrears',NULL,'state',4500,0,4500,'2026-05-18','da arerar',1,'2026-05-19T11:11:47.621Z','director@ksom.res.in','2026-05-18 09:50:35');
INSERT INTO "arrear_bills" VALUES(9,'6302405','DA Arrears',NULL,'state',6000,500,5500,'2026-05-19','DA arear',1,'2026-05-19T11:13:17.507Z','director@ksom.res.in','2026-05-19 11:11:04');
INSERT INTO "arrear_bills" VALUES(10,'6302407','DA Arrears',NULL,'state',5000,500,4500,'2026-05-19','DA arear',1,'2026-05-19T11:11:47.621Z','director@ksom.res.in','2026-05-19 11:11:04');
INSERT INTO "arrear_bills" VALUES(11,'6302409','DA Arrears',NULL,'state',4000,500,3500,'2026-05-19','DA arear',1,'2026-05-19T11:11:47.621Z','director@ksom.res.in','2026-05-19 11:11:04');
INSERT INTO "arrear_bills" VALUES(12,'6302408','DA Arrears',NULL,'state',3000,500,2500,'2026-05-19','DA arear',1,'2026-05-19T11:11:47.621Z','director@ksom.res.in','2026-05-19 11:11:04');
INSERT INTO "arrear_bills" VALUES(13,'6302411','DA Arrears',NULL,'state',3000,500,2500,'2026-05-19','DA arear',1,'2026-05-19T11:11:47.621Z','director@ksom.res.in','2026-05-19 11:11:04');
INSERT INTO "arrear_bills" VALUES(14,'6302422','DA Arrears',NULL,'state',1000,500,500,'2026-05-19','DA arear',1,'2026-05-19T11:11:47.621Z','director@ksom.res.in','2026-05-19 11:11:04');
INSERT INTO "arrear_bills" VALUES(16,'6302414','Pay revision',NULL,'ugc/csir',20000,2000,18000,'2026-05-20','pay revisiona rrear',1,'2026-05-20T05:25:02.964Z','nidhin@ksom.res.in','2026-05-20 05:24:55');
INSERT INTO "arrear_bills" VALUES(17,'6302407','Others','Assessment arrear','state',150000,15000,135000,'2026-05-20','assessment arrear',1,'2026-05-20T06:27:04.655Z','sreejith@ksom.res.in','2026-05-20 06:27:00');
INSERT INTO "arrear_bills" VALUES(18,'6302409','Others','Assessment arrear','state',100000,150000,-50000,'2026-05-20','assessment arrear',1,'2026-05-20T06:27:04.655Z','sreejith@ksom.res.in','2026-05-20 06:27:00');
INSERT INTO "arrear_bills" VALUES(19,'6302411','Others','Assessment arrear','state',80000,8000,72000,'2026-05-20','assessment arrear',1,'2026-05-20T06:27:04.655Z','sreejith@ksom.res.in','2026-05-20 06:27:00');
CREATE TABLE festival_allowance_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    amount REAL DEFAULT 0,
    bill_date TEXT NOT NULL, 
    description TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(emp_id) REFERENCES employees(emp_id),
    UNIQUE(emp_id, bill_date)
);
INSERT INTO "festival_allowance_bills" VALUES(1,'6302405',2500,'2026-05-18','Onam festival allowance',1,'2026-05-18T09:14:42.096Z','director@ksom.res.in','2026-05-18 08:53:54');
INSERT INTO "festival_allowance_bills" VALUES(2,'6302407',2500,'2026-05-18','Onam festival allowance',1,'2026-05-18T09:14:42.096Z','director@ksom.res.in','2026-05-18 08:53:54');
INSERT INTO "festival_allowance_bills" VALUES(3,'6302409',2500,'2026-05-18','Onam festival allowance',1,'2026-05-18T09:14:42.096Z','director@ksom.res.in','2026-05-18 08:53:54');
INSERT INTO "festival_allowance_bills" VALUES(4,'6302408',2500,'2026-05-18','Onam festival allowance',1,'2026-05-18T09:14:42.096Z','director@ksom.res.in','2026-05-18 08:53:54');
INSERT INTO "festival_allowance_bills" VALUES(5,'6302411',2500,'2026-05-18','Onam festival allowance',1,'2026-05-18T09:14:42.096Z','director@ksom.res.in','2026-05-18 08:53:54');
INSERT INTO "festival_allowance_bills" VALUES(6,'6302422',2500,'2026-05-18','Onam festival allowance',1,'2026-05-18T09:14:42.096Z','director@ksom.res.in','2026-05-18 08:53:54');
INSERT INTO "festival_allowance_bills" VALUES(7,'6302414',2400,'2026-05-18','onam allowance',1,'2026-05-18T11:27:47.333Z','director@ksom.res.in','2026-05-18 09:51:07');
INSERT INTO "festival_allowance_bills" VALUES(9,'6302413',2500,'2026-05-20',NULL,1,'2026-05-20T05:18:22.740Z','nidhin@ksom.res.in','2026-05-20 05:18:15');
INSERT INTO "festival_allowance_bills" VALUES(10,'6302403',2500,'2026-05-20',NULL,1,'2026-05-20T06:08:40.302Z','nidhin@ksom.res.in','2026-05-20 06:08:33');
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
INSERT INTO "system_settings" VALUES('require_approval','0');
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    email TEXT,
    action TEXT,
    description TEXT
);
INSERT INTO "activity_logs" VALUES(1,'2026-05-20 11:36:14','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" VALUES(2,'2026-05-20 11:36:30','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" VALUES(3,'2026-05-20 11:37:31','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" VALUES(4,'2026-05-20 11:38:33','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302417 on date 2026-05-20');
INSERT INTO "activity_logs" VALUES(5,'2026-05-20 11:38:33','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302403 with amount Rs. 2500');
INSERT INTO "activity_logs" VALUES(6,'2026-05-20 11:38:33','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302413 with amount Rs. 2500');
INSERT INTO "activity_logs" VALUES(7,'2026-05-20 11:38:33','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302414 with amount Rs. 2400');
INSERT INTO "activity_logs" VALUES(8,'2026-05-20 11:38:33','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302405 with amount Rs. 2500');
INSERT INTO "activity_logs" VALUES(9,'2026-05-20 11:38:33','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302407 with amount Rs. 2500');
INSERT INTO "activity_logs" VALUES(10,'2026-05-20 11:38:33','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302409 with amount Rs. 2500');
INSERT INTO "activity_logs" VALUES(11,'2026-05-20 11:38:33','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302408 with amount Rs. 2500');
INSERT INTO "activity_logs" VALUES(12,'2026-05-20 11:38:33','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302411 with amount Rs. 2500');
INSERT INTO "activity_logs" VALUES(13,'2026-05-20 11:38:33','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302422 with amount Rs. 2500');
INSERT INTO "activity_logs" VALUES(14,'2026-05-20 11:38:40','nidhin@ksom.res.in','Festival Allowance Bill Action','Verified & Locked festival allowance bill(s) for 2026-05');
INSERT INTO "activity_logs" VALUES(15,'2026-05-20 11:39:43','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" VALUES(16,'2026-05-20 11:47:15','sreejith@ksom.res.in','Save/Update User','Saved/Updated user testlogs@ksom.res.in (Role: viewer, Status: active)');
INSERT INTO "activity_logs" VALUES(17,'2026-05-20 11:57:04','sreejith@ksom.res.in','Arrear Bill Action','Verified & Locked arrear bill(s) (Others) for 2026-05');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('employees',12);
INSERT INTO "sqlite_sequence" VALUES('allowances_settings',6);
INSERT INTO "sqlite_sequence" VALUES('monthly_earnings',148);
INSERT INTO "sqlite_sequence" VALUES('monthly_deductions',148);
INSERT INTO "sqlite_sequence" VALUES('users',13);
INSERT INTO "sqlite_sequence" VALUES('surrender_bills',6);
INSERT INTO "sqlite_sequence" VALUES('arrear_bills',19);
INSERT INTO "sqlite_sequence" VALUES('festival_allowance_bills',10);
INSERT INTO "sqlite_sequence" VALUES('activity_logs',17);