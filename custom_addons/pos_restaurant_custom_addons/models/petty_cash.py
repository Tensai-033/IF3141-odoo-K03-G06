from odoo import models, fields, api

class RestaurantPettyCash(models.Model):
    _name = "restaurant.petty.cash"
    _description = "Pencatatan Kas Kecil (Petty Cash) Toko"
    _inherit = ["mail.thread", "mail.activity.mixin"]
    _order = "date desc, id desc"

    name = fields.Char(string="No. Bukti Kas Kecil", required=True, copy=False, default="PC/NEW", tracking=True)
    date = fields.Datetime(string="Waktu Pengeluaran", default=fields.Datetime.now, required=True, tracking=True)
    
    amount = fields.Float(string="Nominal Pengeluaran (Rp)", required=True, tracking=True)
    
    # Daftar Kategori yang Sah (Valid Categories)
    category = fields.Selection([
        ("kitchen", "Bahan Baku & Dapur Darurat (Bumbu, Es Batu, Sayur)"),
        ("gas_lpg", "Gas LPG & Listrik Operasional"),
        ("hygiene", "Kebersihan & Sanitasi Toko (Sabun, Plastik Sampah)"),
        ("galon_konsumsi", "Konsumsi Karyawan & Air Galon"),
        ("store", "Perlengkapan Toko / Kasir (Kertas Struk, ATK, Baterai)"),
        ("maintenance", "Perbaikan & Servis Alat Restoran"),
        ("transport", "Transportasi & Kurir Pengambilan Bahan"),
        ("other", "Keperluan Mendesak Lain-lain"),
    ], string="Kategori Keperluan", required=True, tracking=True)

    notes = fields.Text(string="Catatan Keperluan", required=True, tracking=True, help="Deskripsi detail untuk apa uang kas kecil digunakan")
    
    receipt_image = fields.Binary(string="Foto Bukti Struk/Nota", attachment=True)
    receipt_filename = fields.Char(string="Nama File Foto")
    
    cashier_id = fields.Many2one("res.users", string="Dicatat Oleh (Kepala Toko)", default=lambda self: self.env.user, tracking=True)
    session_id = fields.Many2one("pos.session", string="Sesi PoS Terkait")

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get("name", "PC/NEW") == "PC/NEW":
                date_str = fields.Date.today().strftime("%Y%m%d")
                count = self.search_count([("date", ">=", fields.Date.today())]) + 1
                vals["name"] = f"PC/{date_str}/{count:03d}"
        return super().create(vals_list)
