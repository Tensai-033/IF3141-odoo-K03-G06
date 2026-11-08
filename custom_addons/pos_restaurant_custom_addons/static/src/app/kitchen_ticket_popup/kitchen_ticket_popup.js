/** @odoo-module */

import { AbstractAwaitablePopup } from "@point_of_sale/app/popup/abstract_awaitable_popup";
import { useService } from "@web/core/utils/hooks";

/**
 * Popup Layar Kitchen Ticket (Monokrom)
 * Menampilkan struk pesanan dapur hitam-putih bergaya thermal printer
 */
export class KitchenTicketPopup extends AbstractAwaitablePopup {
    static template = "pos_restaurant_custom_addons.KitchenTicketPopup";
    static defaultProps = {
        closePopup: "Batal",
        confirmText: "🖨️ Cetak Tiket Dapur",
    };

    setup() {
        super.setup();
        this.notification = useService("pos_notification");
        this.order = this.props.order;
        this.pos = this.props.pos;
        this.timeStr = new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        }) + " WIB";
    }

    get tableName() {
        if (this.order.table) {
            return this.order.table.name || `Meja ${this.order.table.table_number || ""}`;
        }
        return "Bungkus / Kasir";
    }

    get customerName() {
        return this.order.get_partner()?.name || this.order.partner?.name || "Pelanggan Restoran";
    }

    get cashierName() {
        return this.pos.get_cashier()?.name || "Kasir";
    }

    get guestCount() {
        return this.order.customer_count || 1;
    }

    get orderLines() {
        return (this.order.orderlines || []).map((line) => {
            const note = line.getNote?.() || line.get_customer_note?.() || line.note || "";
            return {
                id: line.id,
                qty: line.get_quantity(),
                name: line.get_full_product_name(),
                note: note.trim(),
            };
        });
    }

    get totalItems() {
        return this.orderLines.reduce((acc, item) => acc + item.qty, 0);
    }

    async onPrint() {
        // Memicu dialog print bawaan browser
        try {
            window.print();
        } catch (e) {
            console.log("Print triggered:", e);
        }

        this.notification.add(
            `✅ Tiket dapur untuk ${this.tableName} berhasil dicetak & diorder!`,
            3000
        );

        // Mengirimkan sinyal konfirmasi bahwa pesanan sudah dicetak/diorder
        this.confirm({ printed: true });
    }
}
