import psycopg2


def main():
    try:
        # 1. Establish the Connection
        connection = psycopg2.connect(
            dbname="infosys",
            user="ankit",
            password="",
            host="localhost",
            port="5432",
        )
        print("Connected to PostgreSQL")

        # 2. Create Cursor
        cursor = connection.cursor()

        # 3. Execute Queries
        create_table_query = """
            CREATE TABLE IF NOT EXISTS employees (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                department VARCHAR(50),
                salary NUMERIC
            );
        """
        cursor.execute(create_table_query)

        insert_data_query = """
            INSERT INTO employees (name, department, salary)
            VALUES (%s, %s, %s)
        """
        cursor.execute(insert_data_query, ("Alice", "HR", 70000))

        connection.commit()

        # 4. Fetch Data
        cursor.execute("SELECT * FROM employees;")
        rows = cursor.fetchall()
        for row in rows:
            print(row)

    except Exception as e:
        print("Error occurred:", e)

    finally:
        # 5. Close resources
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        print("PostgreSQL connection is closed.")


if __name__ == "__main__":
    main()
