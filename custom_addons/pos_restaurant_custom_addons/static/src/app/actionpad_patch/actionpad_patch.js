/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { ActionpadWidget } from "@point_of_sale/app/screens/product_screen/action_pad/action_pad";
import { KitchenTicketPopup } from "@pos_restaurant_custom_addons/app/kitchen_ticket_popup/kitchen_ticket_popup";
import { useService } from "@web/core/utils/hooks";

patch(ActionpadWidget.prototype, {
    setup() {
        super.setup(...arguments);
        this.popup = useService("popup");
    },

    async submitOrder() {
        const order = this.currentOrder || this.pos.get_order();

        // Jika pesanan belum memiliki item makanan/minuman, abaikan
        if (!order || !order.orderlines || order.orderlines.length === 0) {
            return;
        }

        // Tampilkan modal layar Kitchen Ticket (Monokrom)
        const { confirmed } = await this.popup.add(KitchenTicketPopup, {
            order: order,
            pos: this.pos,
        });

        // Jika kasir menekan tombol "Cetak Tiket Dapur"
        if (confirmed) {
            if (!this.clicked) {
                this.clicked = true;
                try {
                    // Tandai pesanan sebagai 'sudah diorder' ke dapur di sistem Odoo
                    await this.pos.sendOrderInPreparationUpdateLastChange(order);
                } catch (err) {
                    console.warn("Gagal update status persiapan order:", err);
                } finally {
                    this.clicked = false;
                }
            }
        }
    },
});
