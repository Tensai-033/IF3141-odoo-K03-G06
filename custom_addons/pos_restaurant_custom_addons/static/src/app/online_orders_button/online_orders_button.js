/** @odoo-module */

import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { onlineOrdersStore } from "@pos_restaurant_custom_addons/app/store/online_orders_store";
import { OnlineOrdersPopup } from "@pos_restaurant_custom_addons/app/online_orders_popup/online_orders_popup";

/**
 * Tombol Notifikasi Pesanan Online di Navbar PoS
 */
export class OnlineOrdersButton extends Component {
    static template = "pos_restaurant_custom_addons.OnlineOrdersButton";

    setup() {
        super.setup();
        this.store = onlineOrdersStore;
        this.popup = useService("popup");
    }

    async onClick() {
        await this.popup.add(OnlineOrdersPopup);
    }
}
