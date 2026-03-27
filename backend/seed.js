const connection = require("./config/database");
const bcrypt = require("bcrypt");

async function seed() {
  try {
    const superadminPassword = await bcrypt.hash("superadmin123", 10);
    const adminPassword = await bcrypt.hash("admin123", 10);

    // Cek apakah ms_users sudah punya superadmin
    const [superadmins] = await connection.query("SELECT * FROM ms_users WHERE role = 'Superadmin'");
    if (superadmins.length === 0) {
      await connection.query(
        `INSERT INTO ms_users (nama, username, password, email, no_hp, alamat, role, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        ["Super Admin Utama", "superadmin", superadminPassword, "superadmin@mgcctv.com", "081234567890", "Kantor Pusat", "Superadmin", "Aktif"]
      );
      console.log("Berhasil menambahkan default Superadmin.");
    } else {
      console.log("Superadmin sudah ada.");
    }

    // Cek apakah ms_users sudah punya admin
    const [admins] = await connection.query("SELECT * FROM ms_users WHERE role = 'Admin'");
    if (admins.length === 0) {
      await connection.query(
        `INSERT INTO ms_users (nama, username, password, email, no_hp, alamat, role, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        ["Admin Operasional", "admin", adminPassword, "admin@mgcctv.com", "081987654321", "Cabang Madiun", "Admin", "Aktif"]
      );
      console.log("Berhasil menambahkan default Admin.");
    } else {
      console.log("Admin sudah ada.");
    }

    console.log("\nKredensial Default:");
    console.log("1. Superadmin -> Email: superadmin@mgcctv.com | Password: superadmin123");
    console.log("2. Admin      -> Email: admin@mgcctv.com      | Password: admin123");

  } catch (error) {
    console.error("Gagal melakukan seeder:", error);
  } finally {
    process.exit(0);
  }
}

seed();
