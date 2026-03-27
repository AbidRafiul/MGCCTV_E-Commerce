import * as XLSX from 'xlsx-js-style';

/**
 * Fungsi Universal untuk Export Excel dengan Styling (Berstandar Profesional)
 * @param {Array} data - Data JSON (Array of Objects) yang mau diekspor
 * @param {String} fileName - Nama file saat didownload
 * @param {String} sheetName - Nama lembar kerja (Tab di bawah Excel)
 * @param {Array} columnWidths - Pengaturan lebar kolom (Array of Objects)
 */
export const exportToExcel = (data, fileName, sheetName, columnWidths) => {
  // 1. Ubah data JSON jadi Sheet
    const worksheet = XLSX.utils.json_to_sheet(data);

  // 2. Terapkan Lebar Kolom
    if (columnWidths) {
    worksheet['!cols'] = columnWidths;
}

  // 3. STYLING HEADER (Warna Background Biru MGCCTV, Teks Putih Bold)
  // Mencari tahu seberapa luas tabel kita
    const range = XLSX.utils.decode_range(worksheet['!ref']);

  // Looping hanya untuk baris pertama (r: 0) dari kolom pertama sampai terakhir
    for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    
    // Jika sel tidak kosong, terapkan gaya
    if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } }, // Teks Putih Bold
        fill: { fgColor: { rgb: "0C2C55" } },           // Background Biru Gelap
        alignment: { horizontal: "center", vertical: "center" } // Rata Tengah
        };
    }
}

  // 4. Buat file Excel dan Download
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};