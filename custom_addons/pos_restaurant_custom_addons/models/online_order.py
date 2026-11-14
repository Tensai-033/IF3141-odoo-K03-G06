from odoo import models, fields

class OnlineOrder(models.Model):
    _name = "online.order"
    _description = "Pesanan Online Delivery (Sheepo, Grob, Gejok)"
    _inherit = ["mail.thread", "mail.activity.mixin"]
    _order = "id desc"

    name = fields.Char(string="Nomor Pesanan / Order ID", required=True, copy=False, default="Baru", tracking=True)
    
    platform = fields.Selection([
        ("sheepo", "Sheepo Food"),
        ("grob", "Grob Food"),
        ("gejok", "Gejok Food"),
    ], string="Aplikasi / Platform", required=True, default="grob", tracking=True)

    customer_name = fields.Char(string="Nama Pelanggan", required=True, tracking=True)
    customer_phone = fields.Char(string="Nomor HP Pelanggan", tracking=True)
    
    driver_name = fields.Char(string="Nama Driver", tracking=True)
    driver_phone = fields.Char(string="Nomor HP Driver", tracking=True)
    driver_plate = fields.Char(string="Plat Nomor Driver", tracking=True)
    
    ready_by = fields.Char(string="Harus Selesai Pada Jam", tracking=True, help="Target jam pesanan siap diserahkan ke driver (e.g. 10:35 WIB)")
    
    notes = fields.Text(string="Catatan Pesanan")
    subtotal_amount = fields.Float(string="Subtotal (Rp)", tracking=True)
    discount_amount = fields.Float(string="Nominal Diskon (Rp)", tracking=True, help="Potongan diskon promo langsung dalam Rupiah")
    total_amount = fields.Float(string="Total Tagihan (Rp)", tracking=True)
    
    state = fields.Selection([
        ("pending", "Menunggu Konfirmasi"),
        ("accepted", "Diterima (ACC)"),
        ("rejected", "Ditolak"),
    ], string="Status", default="pending", tracking=True)

    def action_accept(self):
        self.write({"state": "accepted"})
        return True

    def action_reject(self):
        self.write({"state": "rejected"})
        return True
