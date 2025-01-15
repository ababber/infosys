# postgres basics

## setup commands

### create an empty db

```sh
createdb name-of-db
```

### start postgres cli

```sh
psql -U user -d db
```

## `psql` commands

### list all tables

```sh
\dt
```

## `SQL` examples

### show all tables

```sql
SELECT * FROM table;
```

### create table

```sql
CREATE TABLE IF NOT EXISTS table1 (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(50),
    salary NUMERIC
);
```

### insert data in a table

```sql
INSERT INTO table1(col1,col2,col3)
VALUES ('value1','value2',100000);
```

### 

## errors

* **Failure while executing; `/bin/launchctl bootstrap gui/501 /Users/ankit/Library/LaunchAgents/homebrew.mxcl.postgresql@14.plist` exited with 5.**

```sh
rm /usr/local/var/postgresql@14/postmaster.pid
postgres restart
```
