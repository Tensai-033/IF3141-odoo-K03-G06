/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { Navbar } from "@point_of_sale/app/navbar/navbar";
import { OnlineOrdersButton } from "@pos_restaurant_custom_addons/app/online_orders_button/online_orders_button";
import { PettyCashPopup } from "@pos_restaurant_custom_addons/app/petty_cash_popup/petty_cash_popup";
import { BranchDailyReportPopup } from "@pos_restaurant_custom_addons/app/branch_daily_report_popup/branch_daily_report_popup";

// Mendaftarkan tombol Pesanan Online ke Navbar PoS
Navbar.components = {
    ...Navbar.components,
    OnlineOrdersButton,
};

patch(Navbar.prototype, {
    async onPettyCashClick() {
        if (typeof this.closeMenu === "function") {
            this.closeMenu();
        }
        await this.popup.add(PettyCashPopup);
    },

    async onDailyReportClick() {
        if (typeof this.closeMenu === "function") {
            this.closeMenu();
        }
        await this.popup.add(BranchDailyReportPopup);
    },
});
