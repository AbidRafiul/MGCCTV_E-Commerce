const connection = require("./config/database");

async function migrate() {
  try {
    // Modify 'role' in 'ms_users' to contain 'Superadmin', 'Admin', 'Pelanggan', 'kustomer'
    await connection.query("ALTER TABLE ms_users MODIFY COLUMN role ENUM('Superadmin', 'Admin', 'Pelanggan', 'kustomer') DEFAULT 'kustomer'");
    console.log("Modified role Enum");

    // Add 'status' column
    const [columns] = await connection.query("SHOW COLUMNS FROM ms_users LIKE 'status'");
    if (columns.length === 0) {
      await connection.query("ALTER TABLE ms_users ADD COLUMN status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif'");
      console.log("Added status column");
    } else {
      console.log("Status column already exists");
    }

    // Verify
    const [rows] = await connection.query("DESCRIBE ms_users");
    console.log("Table structure updated:");
    console.log(rows);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

migrate();
