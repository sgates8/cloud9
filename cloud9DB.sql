Create DATABASE cloud9;
USE cloud9;
CREATE TABLE customers (fname varchar(30), lname varchar(45), phone varchar(15));
INSERT INTO customers (fname, lname, phone) VALUES ('Johnny', 'Mack', '8675309');
SELECT * FROM customers;
DESCRIBE customers;
show tables;
