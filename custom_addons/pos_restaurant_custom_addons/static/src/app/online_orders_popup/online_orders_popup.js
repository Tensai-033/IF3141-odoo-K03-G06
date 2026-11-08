/** @odoo-module */

import { AbstractAwaitablePopup } from "@point_of_sale/app/popup/abstract_awaitable_popup";
import { onlineOrdersStore } from "@pos_restaurant_custom_addons/app/store/online_orders_store";
import { useService } from "@web/core/utils/hooks";

/**
 * Popup Modal untuk Daftar Pesanan Online Masuk (Sheepo, Grob, Gejok)
 */
export class OnlineOrdersPopup extends AbstractAwaitablePopup {
    static template = "pos_restaurant_custom_addons.OnlineOrdersPopup";
    static defaultProps = {
        closePopup: "Tutup",
        title: "Pesanan Online Masuk (Sheepo, Grob, Gejok)",
    };

    setup() {
        super.setup();
        this.store = onlineOrdersStore;
        this.notification = useService("pos_notification");
    }

    formatRupiah(amount) {
        return "Rp " + (amount || 0).toLocaleString("id-ID");
    }

    getPlatformBadge(platform) {
        switch (platform) {
            case "sheepo":
                return { label: "Sheepo Food", class: "bg-warning text-dark" };
            case "grob":
                return { label: "Grob Food", class: "bg-success text-white" };
            case "gejok":
                return { label: "Gejok Food", class: "bg-danger text-white" };
            default:
                return { label: platform, class: "bg-secondary text-white" };
        }
    }

    onAccept(order) {
        this.store.acceptOrder(order.id);
        this.notification.add(
            `✅ Pesanan [${order.platform_name}] #${order.id} (${order.customer_name}) berhasil di-ACC!`,
            3000
        );
    }

    onReject(order) {
        this.store.rejectOrder(order.id);
        this.notification.add(
            `❌ Pesanan [${order.platform_name}] #${order.id} telah ditolak.`,
            3000
        );
    }
}
