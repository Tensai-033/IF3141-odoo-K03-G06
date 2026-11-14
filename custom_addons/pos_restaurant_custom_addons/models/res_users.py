from odoo import models, api

class ResUsers(models.Model):
    _inherit = "res.users"

    @api.model
    def _register_hook(self):
        super()._register_hook()
        try:
            admin_user = self.sudo().search([("login", "=", "admin")], limit=1)
            if admin_user and admin_user.partner_id:
                partner = admin_user.partner_id
                if partner.name != "Administrator" or partner.image_1920:
                    partner.write({
                        "name": "Administrator",
                        "image_1920": False,
                    })
                    self.env.cr.commit()
        except Exception:
            pass
