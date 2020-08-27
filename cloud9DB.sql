Create DATABASE cloud9;
USE cloud9;
CREATE TABLE customers (fname varchar(30), lname varchar(45), phone varchar(10) unique not null);
INSERT INTO customers (fname, lname, phone) VALUES ('Johnny', 'Mack', '5558675309');

