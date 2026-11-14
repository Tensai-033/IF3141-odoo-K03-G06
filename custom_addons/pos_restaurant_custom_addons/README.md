# POS Restaurant Custom Addons

Modul kustom Odoo 17 untuk manajemen operasional restoran multi-cabang, mengintegrasikan alur kasir POS (front-office) dan dashboard manajemen terpusat (back-office).

## Fitur Mock UI yang Tersedia

### 1. Layar Kasir POS (Point of Sale)
- **Pesanan Online Delivery**: Tombol notifikasi lonceng/motor di Navbar dengan badge counter pesanan masuk, popup penerimaan (ACC/Tolak) pesanan platform Sheepo Food, Grob Food, dan Gejok Food lengkap dengan detail pelanggan, driver, jam target, rincian menu, dan diskon.
- **Kas Kecil (Petty Cash)**: Tombol akses di Navbar dan Denah Lantai (Floor Screen). Form pencatatan pengeluaran operasional toko dengan validasi 8 kategori sah, catatan detail, upload bukti struk, serta tabel riwayat pengeluaran shift berjalan.
- **Kitchen Order Ticket (KOT / Tiket Dapur)**: Layar modal struk monokrom hitam-putih saat kasir melakukan "Submit Order" / pemesanan ke dapur dengan rincian meja, jam, catatan instruksi menu, dan tombol cetak thermal.
- **Penutupan Sesi (Closing POS & Settlement)**: Menampilkan total petty cash harian, form upload bukti transfer setoran bank / EDC, serta tombol integrasi ke Laporan Harian.
- **Laporan Harian Sesi POS (Daily Sales & Expenses Report)**: Popup laporan monokrom berstandar format laporan Odoo dengan fitur pemilih sesi shift, breakdown penjualan per kategori, rincian pesanan online, pengeluaran kas kecil, metode pembayaran, diskon, dan session control. Dilengkapi format cetak A4/PDF.

### 2. Dashboard Backend Manajemen
Dapat diakses melalui menu **Restoran & Online**:
- **Rekonsiliasi Harian**: Filter cabang, tanggal, dan batas toleransi selisih. Menampilkan status penutupan shift, kartu KPI selisih kas tunai & non-tunai (EDC), deteksi toleransi, tabel perbandingan omzet vs mutasi, bukti transfer bank, dan konfirmasi verifikasi.
- **Laporan Penjualan (Multi-Peran)**:
  - *Purchasing / Logistik*: Konsumsi porsi bahan baku ayam dan stok tersisa.
  - *Marketing*: Pangsa pasar saluran penjualan (Dine-in vs Ojol) dan Top 5 Menu.
  - *General Manager*: Konsolidasi omzet, kas kecil, dan laba bersih seluruh cabang.
  - Fitur ekspor CSV / Excel dan cetak PDF.
- **Konfigurasi & Hak Akses (POS Cloud)**:
  - Simulasi otorisasi peran (Admin, Finance, GM).
  - Manajemen Menu & Harga per cabang.
  - Manajemen Akun Pengguna & Peran Kasir/Manager.
  - Pengaturan Kategori Kas Kecil yang sah.
  - Pengaturan Batas Toleransi Selisih.
  - Tabel Audit Log permanen untuk setiap perubahan konfigurasi.

### 3. Backend Views & Data
- Model `online.order` (Form, Tree, Chatter).
- Model `restaurant.petty.cash` (Form, Tree, Chatter, Auto-numbering).
- Seed data awal untuk pengujian langsung (`data/seed_data.xml`).
