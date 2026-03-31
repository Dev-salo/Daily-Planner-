#!/usr/bin/env python3
"""
View all data in your SQLite database
"""
import sqlite3

DATABASE_FILE = 'database.db'

def print_separator(char="-", length=80):
    print(char * length)

def view_all_data():
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Check if database exists and has tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found. Run your Flask app first to initialize the database.")
            return
        
        print("\n" + "="*80)
        print("DATABASE DATA VIEW")
        print("="*80 + "\n")
        
        for table in tables:
            table_name = table[0]
            print(f"\nTABLE: {table_name.upper()}")
            print_separator()
            
            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()
            
            if not rows:
                print(f"   (No data in {table_name})")
            else:
                # Get column names
                columns = [description[0] for description in cursor.description]
                
                # Print headers
                header = " | ".join(str(col).ljust(20) for col in columns)
                print(header)
                print_separator("-", len(header))
                
                # Print rows
                for row in rows:
                    row_str = " | ".join(str(val).ljust(20) for val in row)
                    print(row_str)
                
                print(f"\n   Total records: {len(rows)}\n")
        
        # Print database statistics
        print("\n" + "="*80)
        print("DATABASE STATISTICS")
        print("="*80)
        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"  {table_name}: {count} records")
        
        print("\nData loaded successfully!\n")
        conn.close()
        
    except sqlite3.OperationalError as e:
        print(f"Database error: {e}")
        print("\nMake sure your Flask app has run at least once to create the database.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    view_all_data()
