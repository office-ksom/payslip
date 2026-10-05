PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE backup_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    backup_email TEXT,
    frequency TEXT DEFAULT 'weekly', 
    is_enabled INTEGER DEFAULT 0,
    last_backup_at TIMESTAMP
);
INSERT INTO "backup_settings" ("id","backup_email","frequency","is_enabled","last_backup_at") VALUES(1,'nidhin@ksom.res.in','daily',1,'2026-10-05T05:04:06.761Z');
CREATE TABLE employees (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, designation TEXT, date_of_birth TEXT, date_of_joining TEXT, scale_of_pay TEXT, category TEXT, title TEXT, sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1, email_id TEXT, mob_no TEXT, epf_uan TEXT, appointment_type TEXT DEFAULT 'Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(1,'6302407','Sreejith Kurungott','System Analyst-Gr.III','','2010-10-28','77200-140500','state','Mr.',9,1,'sreejith@ksom.res.in',NULL,'101432734610','Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(3,'6302417','Ratnakumar P K','Director','','','PB 118500-218200(L 14)','ugc/csir','Prof.',1,1,'ratnapk@ksom.res.in',NULL,NULL,'Deputation');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(4,'6302403','A K Vijayarajan','Professor','','2009-03-11','Level 14 (7th Pay)','ugc/csir','Prof.',3,0,'vijay@ksom.res.in',NULL,'101432700481','Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(5,'6302413','Akhilesh Parol','Assistant Professor','','2019-02-12','Level 12 (7th Pay)','ugc/csir','Dr.',3,1,'akhi@ksom.res.in',NULL,'101432722170','Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(6,'6302414','Pranav Haridas','Assistant Professor','','2019-02-27','Level 12 (7th Pay)','ugc/csir','Dr.',4,1,'pranav@ksom.res.in',NULL,'101432722158','Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(7,'6302405','Billy Francis','Assistant Registrar-Gr.II','','2009-05-12','63700-123700','state','Mr.',9,1,'billy@ksom.res.in',NULL,'101432722162','Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(8,'6302419','Renjith RS Nair','Accounts Officer','','','59300-120900','state','Mr.',0,0,NULL,NULL,NULL,'Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(9,'6302409','Rajesh Kuriakose','Librarian-Gr.III','','2011-02-17','43400-91200','state','Dr.',10,1,'rajesh@ksom.res.in',NULL,'101432734634','Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(10,'6302408','Nidhin Babu M','Assistant-Gr.II','','2010-12-10','35600-75400','state','Mr.',11,1,'nidhin@ksom.res.in',NULL,'101432734623','Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(11,'6302411','Bidusha M','Assistant-Gr.II','','2017-10-25','35600-75400','state','Mrs.',12,1,'bidusha@ksom.res.in',NULL,'101382023806','Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(12,'6302422','Anulal M','PA to Director','','2026-03-16','50200-105300','state','Mr.',13,1,'pa@ksom.res.in',NULL,'102315154209','Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(13,'6700413','Mahadev M G','Registrar (Full Additional Charge)','','','','state','Mr.',2,1,'registrar@ksom.res.in',NULL,NULL,'Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(14,'6302423','Ankit Rai','Assistant Professor (Fellow)','1992-08-04','2026-05-30','Level 12 (7th Pay)','ugc/csir','Dr.',5,1,'ankit@ksom.res.in','9867273915','102353444077','Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(15,'6302424','Kalachand Shuin','Assistant Professor (Fellow)','1992-03-20','2026-07-01','Level 12 (7th Pay)','ugc/csir','Mrs.',6,1,'kcshuin@ksom.res.in','7471115922','102363763855','Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(16,'6302425','Sunder Ram K','Assistant Professor (Fellow)','1988-12-29','2026-07-01','Level 12 (7th Pay)','ugc/csir','Dr.',7,1,'srk@ksom.res.in','6282907624','102363506642','Permanent');
INSERT INTO "employees" ("id","emp_id","name","designation","date_of_birth","date_of_joining","scale_of_pay","category","title","sort_order","is_active","email_id","mob_no","epf_uan","appointment_type") VALUES(17,'6302426','Badri Vishal Pandey','Assistant Professor (Fellow)','1996-10-08','2026-07-24','Level 12 (7th Pay)','ugc/csir','Dr.',8,1,'bpandey@ksom.res.in','7022151908','102368515130','Permanent');
CREATE TABLE allowances_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, effective_from TEXT NOT NULL UNIQUE, da_state_percentage REAL DEFAULT 0, da_ugc_percentage REAL DEFAULT 0, hra_state_percentage REAL DEFAULT 0, hra_ugc_percentage REAL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO "allowances_settings" ("id","effective_from","da_state_percentage","da_ugc_percentage","hra_state_percentage","hra_ugc_percentage","created_at") VALUES(1,'2020-01',0,0,0,0,'2026-04-21 04:58:14');
INSERT INTO "allowances_settings" ("id","effective_from","da_state_percentage","da_ugc_percentage","hra_state_percentage","hra_ugc_percentage","created_at") VALUES(2,'2026-04',35,58,10,20,'2026-04-21 05:12:47');
INSERT INTO "allowances_settings" ("id","effective_from","da_state_percentage","da_ugc_percentage","hra_state_percentage","hra_ugc_percentage","created_at") VALUES(3,'2026-01',22,58,10,20,'2026-04-21 09:13:44');
INSERT INTO "allowances_settings" ("id","effective_from","da_state_percentage","da_ugc_percentage","hra_state_percentage","hra_ugc_percentage","created_at") VALUES(4,'2026-02',25,58,10,20,'2026-04-21 10:38:35');
INSERT INTO "allowances_settings" ("id","effective_from","da_state_percentage","da_ugc_percentage","hra_state_percentage","hra_ugc_percentage","created_at") VALUES(6,'2026-03',35,58,10,20,'2026-04-22 10:12:56');
INSERT INTO "allowances_settings" ("id","effective_from","da_state_percentage","da_ugc_percentage","hra_state_percentage","hra_ugc_percentage","created_at") VALUES(7,'2026-06',35,58,10,20,'2026-05-19 09:08:12');
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer', 
    status TEXT NOT NULL DEFAULT 'active', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
, password TEXT, password_hash TEXT, reset_token TEXT, reset_token_expiry TIMESTAMP, name TEXT, designation TEXT);
INSERT INTO "users" ("id","email","role","status","created_at","password","password_hash","reset_token","reset_token_expiry","name","designation") VALUES(1,'sreejith@ksom.res.in','super_admin','active','2026-05-05 11:03:03',NULL,'100000.4fe8d0400f00698c82fe5a634ab89bd3.31e17aa715894e91aaae227a50fb33696f920effe0eac5927767fa3060441dd5',NULL,NULL,'Sreejith Kurungott','System Analyst-Gr.III');
INSERT INTO "users" ("id","email","role","status","created_at","password","password_hash","reset_token","reset_token_expiry","name","designation") VALUES(2,'office@ksom.res.in','admin','active','2026-05-02 11:16:39',NULL,'100000.5b6171b94334c32747f2a18f18df79fa.fca72267b777489de6af4a12ad09a0a0dba5ec02a3896b9eecd09af7578d6bc7',NULL,NULL,NULL,NULL);
INSERT INTO "users" ("id","email","role","status","created_at","password","password_hash","reset_token","reset_token_expiry","name","designation") VALUES(3,'webmaster@ksom.res.in','viewer','active','2026-05-02 11:17:05',NULL,'100000.73fc5b7ebc24189106e9746bc0c4fc6f.d7304b4986d4b0738f657cff75abf45373603e9604e8ecf1d64c2c9dd8eda892',NULL,NULL,NULL,NULL);
INSERT INTO "users" ("id","email","role","status","created_at","password","password_hash","reset_token","reset_token_expiry","name","designation") VALUES(4,'rajesh@ksom.res.in','viewer','active','2026-05-04 08:24:26',NULL,'100000.235608146e564fc93baa19a8b1085ba0.065f11e1c93f79b87a5f2cfcd9c94440b17393a3ab68f5a5b6f4241fa7ce3672',NULL,NULL,'Rajesh Kuriakose','Librarian-Gr.III');
INSERT INTO "users" ("id","email","role","status","created_at","password","password_hash","reset_token","reset_token_expiry","name","designation") VALUES(5,'pranav@ksom.res.in','viewer','active','2026-05-04 08:25:39',NULL,'100000.fc4db576c1ef4b7430d859f153cbfba4.f8b75398ee4a139f6d337040fe0e143ab780e3af56cba8109ea2d158c9cdaf01',NULL,NULL,'Pranav Haridas','Assistant Professor');
INSERT INTO "users" ("id","email","role","status","created_at","password","password_hash","reset_token","reset_token_expiry","name","designation") VALUES(6,'nidhin@ksom.res.in','admin','active','2026-05-06 06:19:42',NULL,'100000.3c464ceb8967bb5a934be297ae4b1032.7c906101ce42e985ce8ba5a07141e7d59b27d9f4051f790666c1323c86bdacb4',NULL,NULL,'Nidhin Babu M','Assistant-Gr.II');
INSERT INTO "users" ("id","email","role","status","created_at","password","password_hash","reset_token","reset_token_expiry","name","designation") VALUES(7,'director@ksom.res.in','approver','active','2026-05-15 07:05:29',NULL,'100000.1eef23116d04512be1eeff1abf41c154.913ae0fb5afcd4282556d2602d63b46aec5c39ae2b7182e6ca6a3acb92295a27',NULL,NULL,'Prof. Ratnakumar P K','Director');
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
INSERT INTO "system_settings" ("key","value") VALUES('require_approval','0');
INSERT INTO "system_settings" ("key","value") VALUES('daily_wage_max_limit','22000');
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    email TEXT,
    action TEXT,
    description TEXT
);
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(30,'2026-05-21 13:34:49','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(31,'2026-05-21 16:02:06','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(32,'2026-05-21 16:10:09','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(33,'2026-05-21 16:45:40','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(34,'2026-05-21 16:55:41','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(35,'2026-05-21 16:56:29','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(36,'2026-05-21 16:57:21','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(37,'2026-05-21 16:58:10','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(38,'2026-05-21 16:58:58','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(39,'2026-05-21 16:59:37','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(40,'2026-05-21 17:00:29','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(41,'2026-05-21 17:01:01','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(42,'2026-05-21 17:02:58','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(43,'2026-05-21 17:03:34','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(44,'2026-05-21 17:04:19','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(45,'2026-05-21 17:07:31','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(46,'2026-05-21 17:09:27','nidhin@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(47,'2026-05-22 10:02:15','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(48,'2026-05-22 10:58:47','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(49,'2026-05-22 11:09:59','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-04');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(50,'2026-05-22 11:10:30','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-04');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(51,'2026-05-22 11:12:42','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-04');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(52,'2026-05-22 11:14:24','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-04');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(53,'2026-05-22 11:15:47','nidhin@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-04');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(54,'2026-05-22 15:03:04','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(55,'2026-05-22 17:10:36','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(56,'2026-05-22 17:10:53','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(57,'2026-05-29 14:44:38','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(58,'2026-05-29 14:52:23','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-05');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(59,'2026-05-29 14:52:26','nidhin@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-05');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(60,'2026-05-29 15:26:17','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(61,'2026-05-30 11:23:14','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(62,'2026-05-30 11:30:57','sreejith@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-05');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(63,'2026-05-30 11:33:42','sreejith@ksom.res.in','Update Paybill','Updated paybill records for 2026-05');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(64,'2026-05-30 11:33:46','sreejith@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-05');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(65,'2026-05-30 11:34:54','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(66,'2026-06-01 14:22:13','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(67,'2026-06-02 16:35:21','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(68,'2026-06-03 14:27:25','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(69,'2026-06-03 21:09:26','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(70,'2026-06-05 12:19:29','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(71,'2026-06-16 12:29:20','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(72,'2026-06-24 12:30:52','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(73,'2026-06-24 12:37:42','nidhin@ksom.res.in','Update Allowance Settings','Updated global allowances for 2026-06 (State DA: 35%, UGC DA: 58%, State HRA: 10%, UGC HRA: 20%)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(74,'2026-06-24 12:38:25','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-06');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(75,'2026-06-24 12:40:26','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-06');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(76,'2026-06-24 12:40:35','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-06');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(77,'2026-06-24 12:43:14','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-06');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(78,'2026-06-24 12:44:27','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-06');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(79,'2026-06-24 12:45:21','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-06');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(80,'2026-06-24 15:51:07','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(81,'2026-06-24 16:26:47','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(82,'2026-06-25 12:02:43','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(83,'2026-06-25 12:02:57','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-06');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(84,'2026-06-25 16:43:20','nidhin@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-06');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(85,'2026-06-30 14:07:15','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(86,'2026-06-30 14:12:50','nidhin@ksom.res.in','Update Supplementary Paybill','Updated supplementary paybill records for 2026-05');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(87,'2026-06-30 14:13:14','nidhin@ksom.res.in','Supplementary Paybill Action','Verified & Locked supplementary paybill for 2026-05');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(88,'2026-07-01 12:16:03','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(89,'2026-07-01 12:19:28','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(90,'2026-07-02 12:54:20','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(91,'2026-07-03 10:43:45','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(92,'2026-07-10 14:46:03','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(93,'2026-07-14 11:53:26','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(94,'2026-07-14 14:39:58','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(95,'2026-07-16 15:03:54','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(96,'2026-07-16 15:17:28','nidhin@ksom.res.in','Save Surrender Bill','Saved/Updated surrender bill for employee 6302403 with 146 ELs');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(97,'2026-07-16 16:06:05','nidhin@ksom.res.in','Surrender Bill Action','Verified & Locked surrender bill(s) for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(98,'2026-07-27 11:05:59','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(99,'2026-07-27 11:28:01','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(100,'2026-07-27 14:11:49','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(101,'2026-07-27 14:12:00','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(102,'2026-07-27 14:12:58','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(103,'2026-07-27 14:13:06','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(104,'2026-07-27 14:13:53','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(105,'2026-07-27 14:14:38','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(106,'2026-07-27 14:15:41','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(107,'2026-07-28 12:43:43','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(108,'2026-07-28 12:47:40','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(109,'2026-07-28 12:48:35','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(110,'2026-07-28 12:49:05','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(111,'2026-07-28 12:49:56','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(112,'2026-07-28 12:51:21','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(113,'2026-07-30 11:44:09','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(114,'2026-07-30 12:29:48','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(115,'2026-07-30 12:31:18','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(116,'2026-07-30 12:31:38','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(117,'2026-07-30 12:32:03','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(118,'2026-07-30 12:32:19','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(119,'2026-07-30 12:33:50','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(120,'2026-07-30 12:34:16','nidhin@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(121,'2026-07-31 14:38:19','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(122,'2026-08-01 17:39:03','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(123,'2026-08-04 14:39:22','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(124,'2026-08-20 20:19:02','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(125,'2026-08-22 18:03:30','sreejith@ksom.res.in','Delete Surrender Bill','Deleted surrender bill for employee 6302403 on date 2026-07-16');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(126,'2026-08-22 19:01:13','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(127,'2026-08-22 19:07:39','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302417 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(128,'2026-08-22 19:07:39','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6700413 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(129,'2026-08-22 19:07:39','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302413 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(130,'2026-08-22 19:07:39','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302414 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(131,'2026-08-22 19:07:39','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302423 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(132,'2026-08-22 19:07:39','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302424 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(133,'2026-08-22 19:07:39','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302425 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(134,'2026-08-22 19:07:39','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302426 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(135,'2026-08-22 19:07:39','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302405 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(136,'2026-08-22 19:07:39','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302407 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(137,'2026-08-22 19:07:39','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302409 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(138,'2026-08-22 19:07:39','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302408 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(139,'2026-08-22 19:07:40','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302411 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(140,'2026-08-22 19:07:40','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302422 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(141,'2026-08-22 19:07:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302417 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(142,'2026-08-22 19:07:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6700413 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(143,'2026-08-22 19:07:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302413 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(144,'2026-08-22 19:07:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302414 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(145,'2026-08-22 19:07:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302423 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(146,'2026-08-22 19:08:00','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302424 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(147,'2026-08-22 19:08:00','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302425 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(148,'2026-08-22 19:08:00','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302426 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(149,'2026-08-22 19:08:00','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302405 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(150,'2026-08-22 19:08:00','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302407 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(151,'2026-08-22 19:08:00','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302409 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(152,'2026-08-22 19:08:00','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302408 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(153,'2026-08-22 19:08:00','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302411 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(154,'2026-08-22 19:08:00','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302422 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(155,'2026-08-22 19:09:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302417 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(156,'2026-08-22 19:09:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6700413 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(157,'2026-08-22 19:09:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302413 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(158,'2026-08-22 19:09:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302414 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(159,'2026-08-22 19:09:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302423 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(160,'2026-08-22 19:09:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302424 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(161,'2026-08-22 19:09:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302425 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(162,'2026-08-22 19:09:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302426 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(163,'2026-08-22 19:09:59','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302405 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(164,'2026-08-22 19:09:59','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302407 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(165,'2026-08-22 19:09:59','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302409 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(166,'2026-08-22 19:09:59','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302408 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(167,'2026-08-22 19:09:59','nidhin@ksom.res.in','Save Festival Allowance','Saved/Updated festival allowance for employee 6302411 with amount Rs. 3000');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(168,'2026-08-22 19:09:59','nidhin@ksom.res.in','Delete Festival Allowance','Deleted festival allowance for employee 6302422 on date 2026-08-22');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(169,'2026-08-22 19:10:25','nidhin@ksom.res.in','Festival Allowance Bill Action','Verified & Locked festival allowance bill(s) (permanent) for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(170,'2026-08-22 19:15:12','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(171,'2026-08-22 19:15:16','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(172,'2026-08-22 19:20:30','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(173,'2026-08-24 14:09:13','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(174,'2026-08-31 11:54:00','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(175,'2026-08-31 12:17:07','nidhin@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(176,'2026-08-31 14:44:49','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(177,'2026-08-31 14:46:04','sreejith@ksom.res.in','Update Paybill','Updated paybill records for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(178,'2026-08-31 14:49:11','sreejith@ksom.res.in','Update Paybill','Updated paybill records for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(179,'2026-08-31 14:49:35','sreejith@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(180,'2026-08-31 14:53:23','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(181,'2026-08-31 15:02:03','sreejith@ksom.res.in','Update Paybill','Updated paybill records for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(182,'2026-08-31 15:02:09','sreejith@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(183,'2026-09-01 10:10:46','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(184,'2026-09-01 13:28:39','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(185,'2026-09-02 14:11:45','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(186,'2026-09-02 14:30:02','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(187,'2026-09-02 14:42:32','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(188,'2026-09-02 14:43:03','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(189,'2026-09-02 14:44:17','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(190,'2026-09-02 14:44:49','nidhin@ksom.res.in','Daily Wage Paybill Action','Verified & Locked daily wage paybill for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(191,'2026-09-02 14:52:34','sreejith@ksom.res.in','Delete Daily Wage Paybill Record','Deleted daily wage paybill record for employee 240T004 for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(192,'2026-09-02 14:52:42','sreejith@ksom.res.in','Delete Daily Wage Paybill Record','Deleted daily wage paybill record for employee 240T003 for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(193,'2026-09-02 14:52:49','sreejith@ksom.res.in','Delete Daily Wage Paybill Record','Deleted daily wage paybill record for employee 240T002 for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(194,'2026-09-02 14:52:53','sreejith@ksom.res.in','Delete Daily Wage Paybill Record','Deleted daily wage paybill record for employee 240T005 for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(195,'2026-09-02 14:52:58','sreejith@ksom.res.in','Delete Daily Wage Paybill Record','Deleted daily wage paybill record for employee 240T006 for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(196,'2026-09-02 14:53:05','sreejith@ksom.res.in','Delete Daily Wage Paybill Record','Deleted daily wage paybill record for employee 240T007 for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(197,'2026-09-02 14:53:12','sreejith@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(198,'2026-09-02 15:01:38','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(199,'2026-09-02 15:02:10','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(200,'2026-09-02 15:03:35','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(201,'2026-09-02 15:05:14','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(202,'2026-09-02 15:05:17','nidhin@ksom.res.in','Daily Wage Paybill Action','Verified & Locked daily wage paybill for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(203,'2026-09-02 15:15:47','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(204,'2026-09-02 15:16:49','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(205,'2026-09-02 15:17:41','nidhin@ksom.res.in','Daily Wage Paybill Action','Verified & Locked daily wage paybill for 2026-08');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(206,'2026-09-02 15:53:01','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(207,'2026-09-02 15:57:11','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(208,'2026-09-02 15:58:00','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(209,'2026-09-02 15:59:08','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(210,'2026-09-02 15:59:34','nidhin@ksom.res.in','Daily Wage Paybill Action','Verified & Locked daily wage paybill for 2026-03');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(211,'2026-09-02 16:05:15','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-04');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(212,'2026-09-02 16:05:33','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-04');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(213,'2026-09-02 16:05:36','nidhin@ksom.res.in','Daily Wage Paybill Action','Verified & Locked daily wage paybill for 2026-04');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(214,'2026-09-02 16:08:36','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-05');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(215,'2026-09-02 16:08:53','nidhin@ksom.res.in','Daily Wage Paybill Action','Verified & Locked daily wage paybill for 2026-05');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(216,'2026-09-02 16:56:26','nidhin@ksom.res.in','EPF Lock','Verified & Locked EPF entries for 2026-08 (daily_wage)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(217,'2026-09-02 16:56:51','nidhin@ksom.res.in','EPF Lock','Verified & Locked EPF entries for 2026-08 (permanent)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(218,'2026-09-02 17:04:37','nidhin@ksom.res.in','Update Daily Wage Paybill','Updated daily wage paybill records for 2026-06');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(219,'2026-09-02 17:04:54','nidhin@ksom.res.in','Daily Wage Paybill Action','Verified & Locked daily wage paybill for 2026-06');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(220,'2026-09-02 21:12:52','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(221,'2026-09-03 10:37:46','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(222,'2026-09-03 10:43:18','nidhin@ksom.res.in','EPF Lock','Verified & Locked EPF entries for 2026-03 (permanent)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(223,'2026-09-03 10:43:28','nidhin@ksom.res.in','EPF Lock','Verified & Locked EPF entries for 2026-04 (permanent)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(224,'2026-09-03 10:43:32','nidhin@ksom.res.in','EPF Lock','Verified & Locked EPF entries for 2026-05 (permanent)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(225,'2026-09-03 10:43:35','nidhin@ksom.res.in','EPF Lock','Verified & Locked EPF entries for 2026-06 (permanent)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(226,'2026-09-03 10:43:39','nidhin@ksom.res.in','EPF Lock','Verified & Locked EPF entries for 2026-07 (permanent)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(227,'2026-09-03 10:44:02','nidhin@ksom.res.in','EPF Lock','Verified & Locked EPF entries for 2026-07 (daily_wage)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(228,'2026-09-03 15:22:30','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(229,'2026-09-04 14:03:24','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(230,'2026-09-07 18:55:26','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(231,'2026-09-07 19:06:33','nidhin@ksom.res.in','Save Surrender Bill','Saved/Updated surrender bill for employee 6302403 with 146 ELs');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(232,'2026-09-07 19:07:06','nidhin@ksom.res.in','Save Surrender Bill','Saved/Updated surrender bill for employee 6302403 with 146 ELs');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(233,'2026-09-07 19:07:13','nidhin@ksom.res.in','Surrender Bill Action','Verified & Locked surrender bill(s) for 2026-07');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(234,'2026-09-07 19:29:28','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(235,'2026-09-08 10:11:13','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(236,'2026-09-08 10:34:32','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(237,'2026-09-08 11:38:59','sreejith@ksom.res.in','Grant Edit Consent','Granted edit consent to Admin for locked surrender (2026-07)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(238,'2026-09-08 11:47:42','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(239,'2026-09-08 11:50:04','nidhin@ksom.res.in','Delete Surrender Bill','Deleted surrender bill for employee 6302403 on date 2026-07-24');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(240,'2026-09-08 11:51:07','nidhin@ksom.res.in','Save Surrender Bill','Saved/Updated surrender bill for employee 6302403 with date 2026-09-07 (146 ELs)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(241,'2026-09-08 11:51:31','nidhin@ksom.res.in','Surrender Bill Action','Verified & Locked surrender bill(s) for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(242,'2026-09-14 11:29:35','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(243,'2026-09-14 13:52:06','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(244,'2026-09-18 17:56:22','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(245,'2026-09-24 11:55:59','sreejith@ksom.res.in','Login','Successfully logged in with role super_admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(246,'2026-09-29 15:55:29','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(247,'2026-09-29 15:56:24','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(248,'2026-09-29 15:57:43','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(249,'2026-09-29 15:58:32','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(250,'2026-09-29 15:58:52','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(251,'2026-09-29 15:59:55','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(252,'2026-09-29 16:01:02','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(253,'2026-09-29 16:03:44','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(254,'2026-09-29 16:04:35','nidhin@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(255,'2026-09-29 16:05:47','nidhin@ksom.res.in','Request Edit Permission','Admin requested edit consent for locked paybill_permanent (2026-09): Admin requested edit permission for Paybill (permanent - 2026-09)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(256,'2026-09-29 16:05:49','nidhin@ksom.res.in','Request Edit Permission','Admin requested edit consent for locked paybill_permanent (2026-09): Admin requested edit permission for Paybill (permanent - 2026-09)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(257,'2026-09-29 16:11:24','sreejith@ksom.res.in','Grant Edit Consent','Granted edit consent to Admin for locked paybill_permanent (2026-09)');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(258,'2026-09-29 16:21:38','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(259,'2026-09-29 16:22:31','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(260,'2026-09-29 16:22:47','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(261,'2026-09-29 16:55:23','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(262,'2026-09-29 16:55:43','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(263,'2026-09-29 16:55:58','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(264,'2026-09-29 16:56:26','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(265,'2026-09-29 16:58:58','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(266,'2026-09-29 16:59:31','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(267,'2026-09-29 17:01:36','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(268,'2026-09-29 17:02:49','nidhin@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(269,'2026-09-30 11:01:21','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(270,'2026-10-05 10:34:06','nidhin@ksom.res.in','Login','Successfully logged in with role admin');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(271,'2026-10-05 10:55:07','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(272,'2026-10-05 11:43:38','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-10');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(273,'2026-10-05 11:43:46','nidhin@ksom.res.in','Update Paybill','Updated paybill records for 2026-09');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(274,'2026-10-05 11:44:05','nidhin@ksom.res.in','Paybill Action','Verified & Locked paybill for 2026-10');
INSERT INTO "activity_logs" ("id","timestamp","email","action","description") VALUES(275,'2026-10-05 12:01:35','nidhin@ksom.res.in','EPF Lock','Verified & Locked EPF entries for 2026-09 (permanent)');
CREATE TABLE visiting_employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT UNIQUE NOT NULL,
    title TEXT,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    designation TEXT,
    pay_type TEXT,
    pay REAL DEFAULT 0,
    date_of_birth TEXT,
    date_of_joining TEXT,
    mob_no TEXT,
    email_id TEXT,
    is_active INTEGER DEFAULT 1
);
CREATE TABLE contract_employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT UNIQUE NOT NULL,
    title TEXT,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    designation TEXT,
    pay_type TEXT,
    pay REAL DEFAULT 0,
    date_of_birth TEXT,
    date_of_joining TEXT,
    mob_no TEXT,
    email_id TEXT,
    is_active INTEGER DEFAULT 1
, epf_uan TEXT);
CREATE TABLE daily_wage_employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT UNIQUE NOT NULL,
    title TEXT,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    designation TEXT,
    pay_type TEXT,
    pay REAL DEFAULT 0,
    date_of_birth TEXT,
    date_of_joining TEXT,
    mob_no TEXT,
    email_id TEXT,
    is_active INTEGER DEFAULT 1
, epf_uan TEXT);
INSERT INTO "daily_wage_employees" ("id","emp_id","title","name","sort_order","designation","pay_type","pay","date_of_birth","date_of_joining","mob_no","email_id","is_active","epf_uan") VALUES(1,'240T002','Mrs.','REENAMOL C',1,'Clerical Assistant','Daily Wage',810,'1979-05-30','2026-07-01',NULL,NULL,1,'102314879744');
INSERT INTO "daily_wage_employees" ("id","emp_id","title","name","sort_order","designation","pay_type","pay","date_of_birth","date_of_joining","mob_no","email_id","is_active","epf_uan") VALUES(2,'240T003','Mr.','RAKESH P N',2,'Electrician','Daily Wage',810,'1984-05-16','2026-07-01',NULL,NULL,1,'102314839977');
INSERT INTO "daily_wage_employees" ("id","emp_id","title","name","sort_order","designation","pay_type","pay","date_of_birth","date_of_joining","mob_no","email_id","is_active","epf_uan") VALUES(3,'240T004','Mr.','AJEESH P',3,'Helper','Daily Wage',750,'1985-11-17','2026-07-01',NULL,NULL,1,'102315122885');
INSERT INTO "daily_wage_employees" ("id","emp_id","title","name","sort_order","designation","pay_type","pay","date_of_birth","date_of_joining","mob_no","email_id","is_active","epf_uan") VALUES(4,'240T005','Mr.','SHANEESH K K',4,'Helper','Daily Wage',750,'1990-06-01','2026-07-01',NULL,NULL,1,'102314930563');
INSERT INTO "daily_wage_employees" ("id","emp_id","title","name","sort_order","designation","pay_type","pay","date_of_birth","date_of_joining","mob_no","email_id","is_active","epf_uan") VALUES(5,'240T006','Mrs.','SHIJILA V K',5,'Helper','Daily Wage',750,'1983-05-10','2026-07-01',NULL,NULL,1,'102315126066');
INSERT INTO "daily_wage_employees" ("id","emp_id","title","name","sort_order","designation","pay_type","pay","date_of_birth","date_of_joining","mob_no","email_id","is_active","epf_uan") VALUES(6,'240T007','Mrs.','SUNITHA RAMAN',6,'Helper','Daily Wage',750,'1985-08-11','2026-07-01',NULL,NULL,1,'102314865269');
CREATE TABLE IF NOT EXISTS "arrear_bills" (
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
    UNIQUE(emp_id, bill_date, arrear_type)
);
CREATE TABLE IF NOT EXISTS "festival_allowance_bills" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    amount REAL DEFAULT 0,
    bill_date TEXT NOT NULL,
    description TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category TEXT DEFAULT 'permanent',
    UNIQUE(emp_id, bill_date)
);
INSERT INTO "festival_allowance_bills" ("id","emp_id","amount","bill_date","description","is_approved","approved_on","approved_by","created_at","category") VALUES(1,'6302405',3000,'2026-08-22','Special Festival Allowance',1,'2026-08-22T13:40:25.350Z','nidhin@ksom.res.in','2026-08-22 13:37:39','permanent');
INSERT INTO "festival_allowance_bills" ("id","emp_id","amount","bill_date","description","is_approved","approved_on","approved_by","created_at","category") VALUES(2,'6302407',3000,'2026-08-22','Special Festival Allowance',1,'2026-08-22T13:40:25.350Z','nidhin@ksom.res.in','2026-08-22 13:37:39','permanent');
INSERT INTO "festival_allowance_bills" ("id","emp_id","amount","bill_date","description","is_approved","approved_on","approved_by","created_at","category") VALUES(3,'6302409',3000,'2026-08-22','Special Festival Allowance',1,'2026-08-22T13:40:25.350Z','nidhin@ksom.res.in','2026-08-22 13:37:39','permanent');
INSERT INTO "festival_allowance_bills" ("id","emp_id","amount","bill_date","description","is_approved","approved_on","approved_by","created_at","category") VALUES(4,'6302408',3000,'2026-08-22','Special Festival Allowance',1,'2026-08-22T13:40:25.350Z','nidhin@ksom.res.in','2026-08-22 13:37:39','permanent');
INSERT INTO "festival_allowance_bills" ("id","emp_id","amount","bill_date","description","is_approved","approved_on","approved_by","created_at","category") VALUES(5,'6302411',3000,'2026-08-22','Special Festival Allowance',1,'2026-08-22T13:40:25.350Z','nidhin@ksom.res.in','2026-08-22 13:37:39','permanent');
CREATE TABLE IF NOT EXISTS "supplementary_earnings" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    num_days INTEGER DEFAULT 0,
    regular_basic REAL DEFAULT 0,
    basic_pay REAL DEFAULT 0,
    dp_gp REAL DEFAULT 0,
    da_state REAL DEFAULT 0,
    da_ugc REAL DEFAULT 0,
    hra_state REAL DEFAULT 0,
    hra_ugc REAL DEFAULT 0,
    cca REAL DEFAULT 0,
    other_earnings REAL DEFAULT 0,
    spl_pay REAL DEFAULT 0,
    tr_allow REAL DEFAULT 0,
    spl_allow REAL DEFAULT 0,
    fest_allow REAL DEFAULT 0,
    other_earnings_breakdown TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    days_worked INTEGER DEFAULT 0,
    daily_wage REAL DEFAULT 0,
    total_wage REAL DEFAULT 0,
    UNIQUE(emp_id, month_year)
);
INSERT INTO "supplementary_earnings" ("id","emp_id","month_year","num_days","regular_basic","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by","days_worked","daily_wage","total_wage") VALUES(1,'6302423','2026-05',2,78800,5084,0,0,2949,0,1017,0,0,0,367,0,0,'[]',1,'2026-06-30T08:43:14.373Z','nidhin@ksom.res.in',0,0,0);
CREATE TABLE IF NOT EXISTS "supplementary_deductions" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    epf REAL DEFAULT 0,
    professional_tax REAL DEFAULT 0,
    sli REAL DEFAULT 0,
    gis REAL DEFAULT 0,
    lic REAL DEFAULT 0,
    income_tax REAL DEFAULT 0,
    onam_advance REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    cpf REAL DEFAULT 0,
    hra_recovery REAL DEFAULT 0,
    other_deductions_breakdown TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO "supplementary_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1,'6302423','2026-05',0,0,0,0,0,0,0,0,0,0,'[]');
CREATE TABLE IF NOT EXISTS "monthly_earnings" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    basic_pay REAL DEFAULT 0,
    dp_gp REAL DEFAULT 0,
    da_state REAL DEFAULT 0,
    da_ugc REAL DEFAULT 0,
    hra_state REAL DEFAULT 0,
    hra_ugc REAL DEFAULT 0,
    cca REAL DEFAULT 0,
    other_earnings REAL DEFAULT 0,
    spl_pay REAL DEFAULT 0,
    tr_allow REAL DEFAULT 0,
    spl_allow REAL DEFAULT 0,
    fest_allow REAL DEFAULT 0,
    other_earnings_breakdown TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(169,'6302417','2026-03',218200,0,0,126556,0,43640,0,0,0,0,6800,0,'[]',1,'2026-05-21T11:39:27.263Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(170,'6302403','2026-03',199600,0,0,115768,0,39920,0,0,0,5688,0,0,'[]',1,'2026-05-21T11:39:27.263Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(171,'6302413','2026-03',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-05-21T11:39:27.263Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(172,'6302414','2026-03',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-05-21T11:39:27.263Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(173,'6302405','2026-03',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-05-21T11:39:27.263Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(174,'6302407','2026-03',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-05-21T11:39:27.263Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(175,'6302409','2026-03',63700,0,22295,0,6370,0,0,0,0,0,0,0,'[]',1,'2026-05-21T11:39:27.263Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(176,'6302408','2026-03',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-05-21T11:39:27.263Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(177,'6302411','2026-03',40300,0,14105,0,4030,0,0,0,0,0,1100,0,'[]',1,'2026-05-21T11:39:27.263Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(178,'6302422','2026-03',25910,0,9068.5,0,2591,0,0,0,0,0,0,0,'[]',1,'2026-05-21T11:39:27.263Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(289,'6302417','2026-04',218200,0,0,126556,0,43640,0,0,0,0,6800,0,'[]',1,'2026-05-22T05:45:46.936Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(290,'6302403','2026-04',199600,0,0,115768,0,39920,0,0,0,5688,0,0,'[]',1,'2026-05-22T05:45:46.936Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(291,'6302413','2026-04',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-05-22T05:45:46.936Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(292,'6302414','2026-04',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-05-22T05:45:46.936Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(293,'6302405','2026-04',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-05-22T05:45:46.936Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(294,'6302407','2026-04',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-05-22T05:45:46.936Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(295,'6302409','2026-04',63700,0,22295,0,6370,0,0,0,0,0,0,0,'[]',1,'2026-05-22T05:45:46.936Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(296,'6302408','2026-04',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-05-22T05:45:46.936Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(297,'6302411','2026-04',40300,0,14105,0,4030,0,0,0,0,0,1100,0,'[]',1,'2026-05-22T05:45:46.936Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(298,'6302422','2026-04',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-05-22T05:45:46.936Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(329,'6302417','2026-05',218200,0,0,126556,0,43640,0,0,0,0,6800,0,'[]',1,'2026-05-30T06:03:46.741Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(330,'6302403','2026-05',199600,0,0,115768,0,39920,0,0,0,5688,0,0,'[]',1,'2026-05-30T06:03:46.741Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(331,'6302413','2026-05',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-05-30T06:03:46.741Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(332,'6302414','2026-05',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-05-30T06:03:46.741Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(333,'6302405','2026-05',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-05-30T06:03:46.741Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(334,'6302407','2026-05',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-05-30T06:03:46.741Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(335,'6302409','2026-05',63700,0,22295,0,6370,0,0,0,0,0,0,0,'[]',1,'2026-05-30T06:03:46.741Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(336,'6302408','2026-05',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-05-30T06:03:46.741Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(337,'6302411','2026-05',40300,0,14105,0,4030,0,0,0,0,0,1100,0,'[]',1,'2026-05-30T06:03:46.741Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(338,'6302422','2026-05',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-05-30T06:03:46.741Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(340,'6700413','2026-05',0,0,0,0,0,0,0,0,0,0,3824,0,'[]',1,'2026-05-30T06:03:46.741Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(350,'6302423','2026-06',78800,0,0,45704,0,15760,0,0,0,5688,0,0,'[]',1,'2026-06-25T11:13:19.836Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(351,'6302417','2026-06',218200,0,0,126556,0,43640,0,0,0,0,6800,0,'[]',1,'2026-06-25T11:13:19.836Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(352,'6700413','2026-06',0,0,0,0,0,0,0,0,0,0,3824,0,'[]',1,'2026-06-25T11:13:19.836Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(353,'6302413','2026-06',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-06-25T11:13:19.836Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(354,'6302414','2026-06',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-06-25T11:13:19.836Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(355,'6302405','2026-06',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-06-25T11:13:19.836Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(356,'6302407','2026-06',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-06-25T11:13:19.836Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(357,'6302409','2026-06',63700,0,22295,0,6370,0,0,0,0,0,0,0,'[]',1,'2026-06-25T11:13:19.836Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(358,'6302408','2026-06',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-06-25T11:13:19.836Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(359,'6302411','2026-06',40300,0,14105,0,4030,0,0,0,0,0,1100,0,'[]',1,'2026-06-25T11:13:19.836Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(360,'6302422','2026-06',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-06-25T11:13:19.836Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(427,'6302417','2026-07',218200,0,0,126556,0,43640,0,0,0,0,6800,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(428,'6700413','2026-07',0,0,0,0,0,0,0,0,0,0,3824,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(429,'6302413','2026-07',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(430,'6302414','2026-07',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(431,'6302423','2026-07',78800,0,0,45704,0,15760,0,0,0,5688,0,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(432,'6302424','2026-07',78800,0,0,45704,0,15760,0,0,0,5688,0,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(433,'6302425','2026-07',78800,0,0,45704,0,15760,0,0,0,5688,0,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(434,'6302405','2026-07',97800,0,34230,0,9780,0,0,0,0,0,0,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(435,'6302407','2026-07',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(436,'6302409','2026-07',63700,0,22295,0,6370,0,0,0,0,0,0,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(437,'6302408','2026-07',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(438,'6302411','2026-07',40300,0,14105,0,4030,0,0,0,0,0,1100,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(439,'6302422','2026-07',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(518,'6302426','2026-07',19065,0,0,11058,0,3813,0,0,0,871,0,0,'[]',1,'2026-07-30T07:04:16.096Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(519,'6302417','2026-08',218200,0,0,126556,0,43640,0,0,0,0,6800,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(520,'6700413','2026-08',0,0,0,0,0,0,0,0,0,0,3824,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(521,'6302413','2026-08',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(522,'6302414','2026-08',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(523,'6302423','2026-08',78800,0,0,45704,0,15760,0,0,0,5688,0,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(524,'6302424','2026-08',78800,0,0,45704,0,15760,0,0,0,5688,0,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(525,'6302425','2026-08',78800,0,0,45704,0,15760,0,0,0,5688,0,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(526,'6302426','2026-08',78800,0,0,45704,0,15760,0,0,0,5688,0,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(527,'6302405','2026-08',97800,0,34230,0,9780,0,0,0,0,0,0,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(528,'6302407','2026-08',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(529,'6302409','2026-08',63700,0,22295,0,6370,0,0,0,0,0,0,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(530,'6302408','2026-08',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(531,'6302411','2026-08',40300,0,14105,0,4030,0,0,0,0,0,1100,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(532,'6302422','2026-08',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-08-31T09:32:09.375Z','sreejith@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(603,'6302417','2026-09',218200,0,0,126556,0,43640,0,0,0,0,6800,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(604,'6700413','2026-09',0,0,0,0,0,0,0,0,0,0,3824,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(605,'6302413','2026-09',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(606,'6302414','2026-09',81200,0,0,47096,0,16240,0,0,0,5688,0,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(607,'6302423','2026-09',78800,0,0,45704,0,15760,0,0,0,5688,0,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(608,'6302424','2026-09',78800,0,0,45704,0,15760,0,0,0,5688,0,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(609,'6302425','2026-09',78800,0,0,45704,0,15760,0,0,0,5688,0,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(610,'6302426','2026-09',78800,0,0,45704,0,15760,0,0,0,5688,0,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(611,'6302405','2026-09',97800,0,34230,0,9780,0,0,0,0,0,0,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(612,'6302407','2026-09',95600,0,33460,0,9560,0,0,0,0,0,0,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(613,'6302409','2026-09',63700,0,22295,0,6370,0,0,0,0,0,0,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(614,'6302408','2026-09',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(615,'6302411','2026-09',40300,0,14105,0,4030,0,0,0,0,0,1100,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(616,'6302422','2026-09',50200,0,17570,0,5020,0,0,0,0,0,0,0,'[]',1,'2026-09-29T11:32:49.081Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(827,'6302417','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(828,'6700413','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(829,'6302413','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(830,'6302414','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(831,'6302423','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(832,'6302424','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(833,'6302425','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(834,'6302426','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(835,'6302405','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(836,'6302407','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(837,'6302409','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(838,'6302408','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(839,'6302411','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
INSERT INTO "monthly_earnings" ("id","emp_id","month_year","basic_pay","dp_gp","da_state","da_ugc","hra_state","hra_ugc","cca","other_earnings","spl_pay","tr_allow","spl_allow","fest_allow","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(840,'6302422','2026-10',0,0,0,0,0,0,0,0,0,0,0,0,'[]',1,'2026-10-05T06:14:05.358Z','nidhin@ksom.res.in');
CREATE TABLE IF NOT EXISTS "monthly_deductions" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    epf REAL DEFAULT 0,
    professional_tax REAL DEFAULT 0,
    sli REAL DEFAULT 0,
    gis REAL DEFAULT 0,
    lic REAL DEFAULT 0,
    income_tax REAL DEFAULT 0,
    onam_advance REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    cpf REAL DEFAULT 0,
    hra_recovery REAL DEFAULT 0,
    other_deductions_breakdown TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(199,'6302417','2026-03',41667,0,212,0,0,85000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(200,'6302403','2026-03',37844,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(201,'6302413','2026-03',15396,0,5600,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(202,'6302414','2026-03',1800,0,3000,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(203,'6302405','2026-03',15487,0,600,500,0,11000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(204,'6302407','2026-03',15487,0,3000,1000,0,13000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(205,'6302409','2026-03',10319,0,3000,400,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(206,'6302408','2026-03',8132,0,1200,800,0,0,0,0,0,5020,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(207,'6302411','2026-03',6529,0,1200,800,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(208,'6302422','2026-03',1800,0,0,1300,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(439,'6302417','2026-04',41667,0,212,0,0,85000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(440,'6302403','2026-04',37844,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(441,'6302413','2026-04',15396,0,5600,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(442,'6302414','2026-04',1800,0,3000,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(443,'6302405','2026-04',15487,0,600,500,0,11000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(444,'6302407','2026-04',15487,0,3000,1000,0,13000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(445,'6302409','2026-04',10319,0,3000,400,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(446,'6302408','2026-04',8132,0,1200,800,0,0,0,0,0,5020,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(447,'6302411','2026-04',6529,0,1200,800,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(448,'6302422','2026-04',1800,0,1400,1300,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(519,'6302417','2026-05',41667,0,212,0,0,85000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(520,'6302403','2026-05',37844,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(521,'6302413','2026-05',15396,0,5600,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(522,'6302414','2026-05',1800,0,3000,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(523,'6302405','2026-05',15487,0,600,500,0,11000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(524,'6302407','2026-05',15487,0,3000,1000,0,13000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(525,'6302409','2026-05',10319,0,3000,400,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(526,'6302408','2026-05',8132,0,1200,800,0,0,0,0,0,5020,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(527,'6302411','2026-05',6529,0,1200,800,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(528,'6302422','2026-05',1800,0,1400,1300,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(540,'6700413','2026-05',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(561,'6302423','2026-06',1800,0,2000,2000,0,9130,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(562,'6302417','2026-06',41667,0,212,0,0,85000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(563,'6700413','2026-06',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(564,'6302413','2026-06',15396,0,5600,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(565,'6302414','2026-06',1800,0,3000,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(566,'6302405','2026-06',15487,0,600,500,0,11000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(567,'6302407','2026-06',15487,0,3000,1000,0,13000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(568,'6302409','2026-06',10319,0,3000,400,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(569,'6302408','2026-06',8132,0,1200,800,0,0,0,0,0,5020,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(570,'6302411','2026-06',6529,0,1200,800,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(571,'6302422','2026-06',1800,0,1400,1300,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(715,'6302417','2026-07',41667,0,212,0,0,85000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(716,'6700413','2026-07',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(717,'6302413','2026-07',15396,0,5600,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(718,'6302414','2026-07',1800,0,3000,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(719,'6302423','2026-07',1800,0,2000,2000,0,9130,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(720,'6302424','2026-07',1800,0,2000,2000,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(721,'6302425','2026-07',1800,0,2000,2000,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(722,'6302405','2026-07',15844,0,600,500,0,11000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(723,'6302407','2026-07',15487,0,3000,1000,0,13000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(724,'6302409','2026-07',10319,0,3000,400,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(725,'6302408','2026-07',8132,0,1200,800,0,0,0,0,0,5020,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(726,'6302411','2026-07',6529,0,1200,800,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(727,'6302422','2026-07',1800,0,1400,1300,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(897,'6302426','2026-07',1800,0,2000,2000,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(898,'6302417','2026-08',41667,1250,212,0,0,85000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(899,'6700413','2026-08',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(900,'6302413','2026-08',15396,1250,5600,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(901,'6302414','2026-08',1800,1250,3000,600,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(902,'6302423','2026-08',1800,1250,2000,2000,0,9130,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(903,'6302424','2026-08',1800,1250,2000,2000,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(904,'6302425','2026-08',1800,1250,2000,2000,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(905,'6302426','2026-08',1800,1250,2000,2000,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(906,'6302405','2026-08',15844,1250,600,500,0,11000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(907,'6302407','2026-08',15487,1250,3000,1000,0,13000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(908,'6302409','2026-08',10319,1250,3000,400,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(909,'6302408','2026-08',8132,1250,1200,800,0,0,0,0,0,5020,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(910,'6302411','2026-08',6529,0,1200,800,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(911,'6302422','2026-08',1800,1250,1400,1300,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1066,'6302417','2026-09',41667,0,212,0,0,85000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1067,'6700413','2026-09',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1068,'6302413','2026-09',15396,0,5600,2000,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1069,'6302414','2026-09',2360,0,3000,2000,0,15300,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1070,'6302423','2026-09',2360,0,2000,2000,0,9130,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1071,'6302424','2026-09',2360,0,2000,2000,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1072,'6302425','2026-09',2360,0,2000,2000,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1073,'6302426','2026-09',2360,0,2000,2000,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1074,'6302405','2026-09',15844,0,600,500,0,11000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1075,'6302407','2026-09',15487,0,3000,1000,0,13000,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1076,'6302409','2026-09',10319,0,3000,400,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1077,'6302408','2026-09',8132,0,1200,1100,0,0,0,0,0,5020,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1078,'6302411','2026-09',6529,0,1200,900,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1079,'6302422','2026-09',2360,0,1400,1300,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1388,'6302417','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1389,'6700413','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1390,'6302413','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1391,'6302414','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1392,'6302423','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1393,'6302424','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1394,'6302425','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1395,'6302426','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1396,'6302405','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1397,'6302407','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1398,'6302409','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1399,'6302408','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1400,'6302411','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
INSERT INTO "monthly_deductions" ("id","emp_id","month_year","epf","professional_tax","sli","gis","lic","income_tax","onam_advance","other_deductions","cpf","hra_recovery","other_deductions_breakdown") VALUES(1401,'6302422','2026-10',0,0,0,0,0,0,0,0,0,0,'[]');
CREATE TABLE IF NOT EXISTS "visiting_monthly_earnings" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    basic_pay REAL DEFAULT 0,
    other_earnings REAL DEFAULT 0,
    other_earnings_breakdown TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    UNIQUE(emp_id, month_year)
);
CREATE TABLE IF NOT EXISTS "visiting_monthly_deductions" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    income_tax REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    other_deductions_breakdown TEXT,
    UNIQUE(emp_id, month_year)
);
CREATE TABLE IF NOT EXISTS "contract_monthly_earnings" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    basic_pay REAL DEFAULT 0,
    other_earnings REAL DEFAULT 0,
    other_earnings_breakdown TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    UNIQUE(emp_id, month_year)
);
CREATE TABLE IF NOT EXISTS "contract_monthly_deductions" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    income_tax REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    epf REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    other_deductions_breakdown TEXT,
    UNIQUE(emp_id, month_year)
);
CREATE TABLE IF NOT EXISTS "daily_wage_monthly_earnings" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    days_worked REAL DEFAULT 0,
    daily_wage REAL DEFAULT 0,
    total_wage REAL DEFAULT 0,
    basic_pay REAL DEFAULT 0,
    other_earnings REAL DEFAULT 0,
    other_earnings_breakdown TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(19,'240T004','2026-09',0,750,0,0,0,'[]',0,NULL,NULL);
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(20,'240T003','2026-09',0,810,0,0,0,'[]',0,NULL,NULL);
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(21,'240T002','2026-09',0,810,0,0,0,'[]',0,NULL,NULL);
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(22,'240T005','2026-09',0,750,0,0,0,'[]',0,NULL,NULL);
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(23,'240T006','2026-09',0,750,0,0,0,'[]',0,NULL,NULL);
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(24,'240T007','2026-09',0,750,0,0,0,'[]',0,NULL,NULL);
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(25,'240T004','2026-07',24.5,750,18375,18375,0,'[]',1,'2026-09-02T09:35:17.325Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(26,'240T003','2026-07',26,810,21060,21060,0,'[]',1,'2026-09-02T09:35:17.325Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(27,'240T002','2026-07',27,810,21870,21870,0,'[]',1,'2026-09-02T09:35:17.325Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(28,'240T005','2026-07',20.5,750,15375,15375,0,'[]',1,'2026-09-02T09:35:17.325Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(29,'240T006','2026-07',22,750,16500,16500,0,'[]',1,'2026-09-02T09:35:17.325Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(30,'240T007','2026-07',26,750,19500,19500,0,'[]',1,'2026-09-02T09:35:17.325Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(43,'240T002','2026-08',18,810,14580,14580,0,'[]',1,'2026-09-02T09:47:41.601Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(44,'240T003','2026-08',22.5,810,18225,18225,0,'[]',1,'2026-09-02T09:47:41.601Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(45,'240T004','2026-08',24,750,18000,18000,0,'[]',1,'2026-09-02T09:47:41.601Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(46,'240T005','2026-08',17.5,750,13125,13125,0,'[]',1,'2026-09-02T09:47:41.601Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(47,'240T006','2026-08',18,750,13500,13500,0,'[]',1,'2026-09-02T09:47:41.601Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(48,'240T007','2026-08',23,750,17250,17250,0,'[]',1,'2026-09-02T09:47:41.601Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(55,'240T002','2026-03',18.5,770,14245,14245,0,'[]',1,'2026-09-02T10:29:34.404Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(56,'240T003','2026-03',27,770,20790,20790,0,'[]',1,'2026-09-02T10:29:34.404Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(57,'240T004','2026-03',26,710,18460,18460,0,'[]',1,'2026-09-02T10:29:34.404Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(58,'240T005','2026-03',16,710,11360,11360,0,'[]',1,'2026-09-02T10:29:34.404Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(59,'240T006','2026-03',19.5,710,13845,13845,0,'[]',1,'2026-09-02T10:29:34.404Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(60,'240T007','2026-03',26.5,710,18815,18815,0,'[]',1,'2026-09-02T10:29:34.404Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(73,'240T002','2026-04',19,810,15390,15390,0,'[]',1,'2026-09-02T10:35:36.433Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(74,'240T003','2026-04',25,810,20250,20250,0,'[]',1,'2026-09-02T10:35:36.433Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(75,'240T004','2026-04',24.5,750,18375,18375,0,'[]',1,'2026-09-02T10:35:36.433Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(76,'240T005','2026-04',15.5,750,11625,11625,0,'[]',1,'2026-09-02T10:35:36.433Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(77,'240T006','2026-04',16,750,12000,12000,0,'[]',1,'2026-09-02T10:35:36.433Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(78,'240T007','2026-04',24.5,750,18375,18375,0,'[]',1,'2026-09-02T10:35:36.433Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(85,'240T002','2026-05',19,810,15390,15390,0,'[]',1,'2026-09-02T10:38:53.143Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(86,'240T003','2026-05',21.5,810,17415,17415,0,'[]',1,'2026-09-02T10:38:53.143Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(87,'240T004','2026-05',23,750,17250,17250,0,'[]',1,'2026-09-02T10:38:53.143Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(88,'240T005','2026-05',19.5,750,14625,14625,0,'[]',1,'2026-09-02T10:38:53.143Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(89,'240T006','2026-05',15,750,11250,11250,0,'[]',1,'2026-09-02T10:38:53.143Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(90,'240T007','2026-05',23.5,750,17625,17625,0,'[]',1,'2026-09-02T10:38:53.143Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(91,'240T002','2026-06',14.5,810,11745,11745,0,'[]',1,'2026-09-02T11:34:54.456Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(92,'240T003','2026-06',26,810,21060,21060,0,'[]',1,'2026-09-02T11:34:54.456Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(93,'240T004','2026-06',26,750,19500,19500,0,'[]',1,'2026-09-02T11:34:54.456Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(94,'240T005','2026-06',22.5,750,16875,16875,0,'[]',1,'2026-09-02T11:34:54.456Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(95,'240T006','2026-06',20,750,15000,15000,0,'[]',1,'2026-09-02T11:34:54.456Z','nidhin@ksom.res.in');
INSERT INTO "daily_wage_monthly_earnings" ("id","emp_id","month_year","days_worked","daily_wage","total_wage","basic_pay","other_earnings","other_earnings_breakdown","is_approved","approved_on","approved_by") VALUES(96,'240T007','2026-06',26,750,19500,19500,0,'[]',1,'2026-09-02T11:34:54.456Z','nidhin@ksom.res.in');
CREATE TABLE IF NOT EXISTS "daily_wage_monthly_deductions" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    income_tax REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    epf REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    other_deductions_breakdown TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(37,'240T004','2026-09',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(38,'240T003','2026-09',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(39,'240T002','2026-09',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(40,'240T005','2026-09',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(41,'240T006','2026-09',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(42,'240T007','2026-09',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(49,'240T004','2026-07',0,0,1800,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(50,'240T003','2026-07',0,0,1800,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(51,'240T002','2026-07',0,0,1800,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(52,'240T005','2026-07',0,0,1800,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(53,'240T006','2026-07',0,0,1800,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(54,'240T007','2026-07',0,0,1800,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(85,'240T002','2026-08',0,0,1750,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(86,'240T003','2026-08',0,0,1800,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(87,'240T004','2026-08',0,0,1800,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(88,'240T005','2026-08',0,0,1575,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(89,'240T006','2026-08',0,0,1620,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(90,'240T007','2026-08',0,0,1800,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(109,'240T002','2026-03',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(110,'240T003','2026-03',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(111,'240T004','2026-03',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(112,'240T005','2026-03',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(113,'240T006','2026-03',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(114,'240T007','2026-03',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(145,'240T002','2026-04',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(146,'240T003','2026-04',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(147,'240T004','2026-04',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(148,'240T005','2026-04',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(149,'240T006','2026-04',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(150,'240T007','2026-04',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(169,'240T002','2026-05',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(170,'240T003','2026-05',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(171,'240T004','2026-05',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(172,'240T005','2026-05',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(173,'240T006','2026-05',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(174,'240T007','2026-05',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(181,'240T002','2026-06',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(182,'240T003','2026-06',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(183,'240T004','2026-06',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(184,'240T005','2026-06',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(185,'240T006','2026-06',0,0,0,0,'[]');
INSERT INTO "daily_wage_monthly_deductions" ("id","emp_id","month_year","income_tax","hra","epf","other_deductions","other_deductions_breakdown") VALUES(186,'240T007','2026-06',0,0,0,0,'[]');
CREATE TABLE IF NOT EXISTS "surrender_bills" (
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
    is_terminal INTEGER DEFAULT 0,
    UNIQUE(emp_id, bill_date)
);
INSERT INTO "surrender_bills" ("id","emp_id","bill_date","financial_year","basic_pay","da","hra","num_els","total_amount","is_approved","approved_on","approved_by","created_at","is_terminal") VALUES(8,'6302403','2026-09-07','2026-2027',199600,115768,0,146,1534791,1,'2026-09-08T06:21:31.612Z','nidhin@ksom.res.in','2026-09-08 06:21:07',1);
CREATE TABLE epf_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    employee_category TEXT NOT NULL, -- 'permanent' or 'daily_wage'
    month_year TEXT NOT NULL, -- YYYY-MM
    wages REAL DEFAULT 0,
    epf_wage REAL DEFAULT 0,
    eps_wage REAL DEFAULT 0,
    edli REAL DEFAULT 0,
    employee_contribution REAL DEFAULT 0,
    employer_contribution REAL DEFAULT 0,
    admin_charges REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, is_approved INTEGER DEFAULT 0, approved_on TEXT, approved_by TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(1,'240T002','daily_wage','2026-08',14580,14580,0,73,1750,1750,73,'2026-09-02 11:26:24',1,'2026-09-02T11:26:26.402Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(2,'240T003','daily_wage','2026-08',18225,15000,0,75,1800,1800,75,'2026-09-02 11:26:24',1,'2026-09-02T11:26:26.402Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(3,'240T004','daily_wage','2026-08',18000,15000,0,75,1800,1800,75,'2026-09-02 11:26:24',1,'2026-09-02T11:26:26.402Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(4,'240T005','daily_wage','2026-08',13125,13125,0,66,1575,1575,66,'2026-09-02 11:26:24',1,'2026-09-02T11:26:26.402Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(5,'240T006','daily_wage','2026-08',13500,13500,0,68,1620,1620,68,'2026-09-02 11:26:24',1,'2026-09-02T11:26:26.402Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(6,'240T007','daily_wage','2026-08',17250,15000,0,75,1800,1800,75,'2026-09-02 11:26:24',1,'2026-09-02T11:26:26.402Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(7,'6302417','permanent','2026-08',344756,344756,344756,0,41667,0,0,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(8,'6302413','permanent','2026-08',128296,15000,15000,75,15396,1800,75,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(9,'6302414','permanent','2026-08',128296,15000,15000,75,1800,1800,75,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(10,'6302423','permanent','2026-08',124504,15000,0,75,1800,1800,75,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(11,'6302424','permanent','2026-08',124504,15000,0,75,1800,1800,75,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(12,'6302425','permanent','2026-08',124504,15000,0,75,1800,1800,75,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(13,'6302426','permanent','2026-08',124504,15000,0,75,1800,1800,75,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(14,'6302405','permanent','2026-08',132030,132030,132030,75,15844,15844,660,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(15,'6302407','permanent','2026-08',129060,129060,129060,75,15487,15487,645,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(16,'6302409','permanent','2026-08',85995,85995,85995,75,10319,10319,430,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(17,'6302408','permanent','2026-08',67770,67770,67770,75,8132,8132,339,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(18,'6302411','permanent','2026-08',54405,15000,15000,75,6529,1800,75,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(19,'6302422','permanent','2026-08',67770,15000,0,75,1800,1800,75,'2026-09-02 11:26:48',1,'2026-09-02T11:26:51.413Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(29,'6302417','permanent','2026-03',344756,344756,344756,0,41667,0,0,'2026-09-03 05:13:17',1,'2026-09-03T05:13:18.043Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(30,'6302413','permanent','2026-03',128296,15000,15000,75,15396,1800,75,'2026-09-03 05:13:17',1,'2026-09-03T05:13:18.043Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(31,'6302414','permanent','2026-03',128296,15000,15000,75,1800,1800,75,'2026-09-03 05:13:17',1,'2026-09-03T05:13:18.043Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(32,'6302405','permanent','2026-03',129060,129060,129060,75,15487,15487,645,'2026-09-03 05:13:17',1,'2026-09-03T05:13:18.043Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(33,'6302407','permanent','2026-03',129060,129060,129060,75,15487,15487,645,'2026-09-03 05:13:17',1,'2026-09-03T05:13:18.043Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(34,'6302409','permanent','2026-03',85995,85995,85995,75,10319,10319,430,'2026-09-03 05:13:17',1,'2026-09-03T05:13:18.043Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(35,'6302408','permanent','2026-03',67770,67770,67770,75,8132,8132,339,'2026-09-03 05:13:17',1,'2026-09-03T05:13:18.043Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(36,'6302411','permanent','2026-03',54405,15000,15000,75,6529,1800,75,'2026-09-03 05:13:17',1,'2026-09-03T05:13:18.043Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(37,'6302422','permanent','2026-03',34978.5,15000,0,75,1800,1800,75,'2026-09-03 05:13:17',1,'2026-09-03T05:13:18.043Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(38,'6302417','permanent','2026-04',344756,344756,344756,0,41667,0,0,'2026-09-03 05:13:27',1,'2026-09-03T05:13:28.604Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(39,'6302413','permanent','2026-04',128296,15000,15000,75,15396,1800,75,'2026-09-03 05:13:27',1,'2026-09-03T05:13:28.604Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(40,'6302414','permanent','2026-04',128296,15000,15000,75,1800,1800,75,'2026-09-03 05:13:27',1,'2026-09-03T05:13:28.604Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(41,'6302405','permanent','2026-04',129060,129060,129060,75,15487,15487,645,'2026-09-03 05:13:27',1,'2026-09-03T05:13:28.604Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(42,'6302407','permanent','2026-04',129060,129060,129060,75,15487,15487,645,'2026-09-03 05:13:27',1,'2026-09-03T05:13:28.604Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(43,'6302409','permanent','2026-04',85995,85995,85995,75,10319,10319,430,'2026-09-03 05:13:27',1,'2026-09-03T05:13:28.604Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(44,'6302408','permanent','2026-04',67770,67770,67770,75,8132,8132,339,'2026-09-03 05:13:27',1,'2026-09-03T05:13:28.604Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(45,'6302411','permanent','2026-04',54405,15000,15000,75,6529,1800,75,'2026-09-03 05:13:27',1,'2026-09-03T05:13:28.604Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(46,'6302422','permanent','2026-04',67770,15000,0,75,1800,1800,75,'2026-09-03 05:13:27',1,'2026-09-03T05:13:28.604Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(47,'6302417','permanent','2026-05',344756,344756,344756,0,41667,0,0,'2026-09-03 05:13:31',1,'2026-09-03T05:13:32.162Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(48,'6302413','permanent','2026-05',128296,15000,15000,75,15396,1800,75,'2026-09-03 05:13:31',1,'2026-09-03T05:13:32.162Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(49,'6302414','permanent','2026-05',128296,15000,15000,75,1800,1800,75,'2026-09-03 05:13:31',1,'2026-09-03T05:13:32.162Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(50,'6302405','permanent','2026-05',129060,129060,129060,75,15487,15487,645,'2026-09-03 05:13:31',1,'2026-09-03T05:13:32.162Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(51,'6302407','permanent','2026-05',129060,129060,129060,75,15487,15487,645,'2026-09-03 05:13:31',1,'2026-09-03T05:13:32.162Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(52,'6302409','permanent','2026-05',85995,85995,85995,75,10319,10319,430,'2026-09-03 05:13:31',1,'2026-09-03T05:13:32.162Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(53,'6302408','permanent','2026-05',67770,67770,67770,75,8132,8132,339,'2026-09-03 05:13:31',1,'2026-09-03T05:13:32.162Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(54,'6302411','permanent','2026-05',54405,15000,15000,75,6529,1800,75,'2026-09-03 05:13:31',1,'2026-09-03T05:13:32.162Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(55,'6302422','permanent','2026-05',67770,15000,0,75,1800,1800,75,'2026-09-03 05:13:31',1,'2026-09-03T05:13:32.162Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(56,'6302417','permanent','2026-06',344756,344756,344756,0,41667,0,0,'2026-09-03 05:13:35',1,'2026-09-03T05:13:35.723Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(57,'6302413','permanent','2026-06',128296,15000,15000,75,15396,1800,75,'2026-09-03 05:13:35',1,'2026-09-03T05:13:35.723Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(58,'6302414','permanent','2026-06',128296,15000,15000,75,1800,1800,75,'2026-09-03 05:13:35',1,'2026-09-03T05:13:35.723Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(59,'6302423','permanent','2026-06',124504,15000,0,75,1800,1800,75,'2026-09-03 05:13:35',1,'2026-09-03T05:13:35.723Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(60,'6302405','permanent','2026-06',129060,129060,129060,75,15487,15487,645,'2026-09-03 05:13:35',1,'2026-09-03T05:13:35.723Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(61,'6302407','permanent','2026-06',129060,129060,129060,75,15487,15487,645,'2026-09-03 05:13:35',1,'2026-09-03T05:13:35.723Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(62,'6302409','permanent','2026-06',85995,85995,85995,75,10319,10319,430,'2026-09-03 05:13:35',1,'2026-09-03T05:13:35.723Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(63,'6302408','permanent','2026-06',67770,67770,67770,75,8132,8132,339,'2026-09-03 05:13:35',1,'2026-09-03T05:13:35.723Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(64,'6302411','permanent','2026-06',54405,15000,15000,75,6529,1800,75,'2026-09-03 05:13:35',1,'2026-09-03T05:13:35.723Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(65,'6302422','permanent','2026-06',67770,15000,0,75,1800,1800,75,'2026-09-03 05:13:35',1,'2026-09-03T05:13:35.723Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(66,'6302417','permanent','2026-07',344756,344756,344756,0,41667,0,0,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(67,'6302413','permanent','2026-07',128296,15000,15000,75,15396,1800,75,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(68,'6302414','permanent','2026-07',128296,15000,15000,75,1800,1800,75,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(69,'6302423','permanent','2026-07',124504,15000,0,75,1800,1800,75,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(70,'6302424','permanent','2026-07',124504,15000,0,75,1800,1800,75,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(71,'6302425','permanent','2026-07',124504,15000,0,75,1800,1800,75,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(72,'6302426','permanent','2026-07',30123,15000,0,75,1800,1800,75,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(73,'6302405','permanent','2026-07',132030,132030,132030,75,15844,15844,660,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(74,'6302407','permanent','2026-07',129060,129060,129060,75,15487,15487,645,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(75,'6302409','permanent','2026-07',85995,85995,85995,75,10319,10319,430,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(76,'6302408','permanent','2026-07',67770,67770,67770,75,8132,8132,339,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(77,'6302411','permanent','2026-07',54405,15000,15000,75,6529,1800,75,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(78,'6302422','permanent','2026-07',67770,15000,0,75,1800,1800,75,'2026-09-03 05:13:38',1,'2026-09-03T05:13:39.218Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(79,'240T002','daily_wage','2026-07',21870,15000,0,75,1800,1800,75,'2026-09-03 05:14:01',1,'2026-09-03T05:14:02.791Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(80,'240T003','daily_wage','2026-07',21060,15000,0,75,1800,1800,75,'2026-09-03 05:14:01',1,'2026-09-03T05:14:02.791Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(81,'240T004','daily_wage','2026-07',18375,15000,0,75,1800,1800,75,'2026-09-03 05:14:01',1,'2026-09-03T05:14:02.791Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(82,'240T005','daily_wage','2026-07',15375,15000,0,75,1800,1800,75,'2026-09-03 05:14:01',1,'2026-09-03T05:14:02.791Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(83,'240T006','daily_wage','2026-07',16500,15000,0,75,1800,1800,75,'2026-09-03 05:14:01',1,'2026-09-03T05:14:02.791Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(84,'240T007','daily_wage','2026-07',19500,15000,0,75,1800,1800,75,'2026-09-03 05:14:01',1,'2026-09-03T05:14:02.791Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(124,'6302417','permanent','2026-09',344756,344756,344756,0,41667,0,0,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(125,'6302413','permanent','2026-09',128296,19667,19667,98,15396,2360,98,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(126,'6302414','permanent','2026-09',128296,19667,19667,98,2360,2360,98,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(127,'6302423','permanent','2026-09',124504,19667,0,98,2360,2360,98,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(128,'6302424','permanent','2026-09',124504,19667,0,98,2360,2360,98,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(129,'6302425','permanent','2026-09',124504,19667,0,98,2360,2360,98,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(130,'6302426','permanent','2026-09',124504,19667,0,98,2360,2360,98,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(131,'6302405','permanent','2026-09',132030,132030,132030,98,15844,15844,660,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(132,'6302407','permanent','2026-09',129060,129060,129060,98,15487,15487,645,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(133,'6302409','permanent','2026-09',85995,85995,85995,98,10319,10319,430,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(134,'6302408','permanent','2026-09',67770,67770,67770,98,8132,8132,339,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(135,'6302411','permanent','2026-09',54405,19667,19667,98,6529,2360,98,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
INSERT INTO "epf_entries" ("id","emp_id","employee_category","month_year","wages","epf_wage","eps_wage","edli","employee_contribution","employer_contribution","admin_charges","created_at","is_approved","approved_on","approved_by") VALUES(136,'6302422','permanent','2026-09',67770,19667,0,98,2360,2360,98,'2026-10-05 06:31:11',1,'2026-10-05T06:31:34.901Z','nidhin@ksom.res.in');
CREATE TABLE edit_consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    period_key TEXT NOT NULL,
    granted_by TEXT NOT NULL,
    granted_at TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    notes TEXT,
    UNIQUE(module, period_key)
);
INSERT INTO "edit_consents" ("id","module","period_key","granted_by","granted_at","status","notes") VALUES(1,'surrender','2026-07','sreejith@ksom.res.in','2026-09-08T06:08:59.004Z','active','');
INSERT INTO "edit_consents" ("id","module","period_key","granted_by","granted_at","status","notes") VALUES(2,'paybill_permanent','2026-09','sreejith@ksom.res.in','2026-09-29T10:41:24.515Z','active','');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('employees',17);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('allowances_settings',10);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('users',12);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('activity_logs',275);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('arrear_bills',0);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('festival_allowance_bills',15);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('supplementary_earnings',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('supplementary_deductions',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('monthly_earnings',854);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('monthly_deductions',1443);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('visiting_monthly_earnings',0);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('visiting_monthly_deductions',0);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('contract_monthly_earnings',0);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('contract_monthly_deductions',0);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('daily_wage_monthly_earnings',96);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('daily_wage_monthly_deductions',192);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('surrender_bills',8);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('daily_wage_employees',6);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('epf_entries',136);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('edit_consents',2);
