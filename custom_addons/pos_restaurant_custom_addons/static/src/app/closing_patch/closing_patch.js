/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { ClosePosPopup } from "@point_of_sale/app/navbar/closing_popup/closing_popup";
import { pettyCashStore } from "@pos_restaurant_custom_addons/app/store/petty_cash_store";
import { BranchDailyReportPopup } from "@pos_restaurant_custom_addons/app/branch_daily_report_popup/branch_daily_report_popup";

patch(ClosePosPopup.prototype, {
    setup() {
        super.setup();
        this.state.bankTransferFileName = "";
        this.state.bankTransferBase64 = "";
    },

    get pettyCashTotalToday() {
        return pettyCashStore.totalToday || 0;
    },

    get pettyCashTotalFormatted() {
        return "Rp " + (pettyCashStore.totalToday || 0).toLocaleString("id-ID");
    },

    onBankTransferFileChange(ev) {
        const file = ev.target.files[0];
        if (!file) return;
        this.state.bankTransferFileName = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.state.bankTransferBase64 = e.target.result.split(",")[1];
        };
        reader.readAsDataURL(file);
    },

    removeBankTransferFile() {
        this.state.bankTransferFileName = "";
        this.state.bankTransferBase64 = "";
    },

    async openDailyReport() {
        await this.popup.add(BranchDailyReportPopup);
    },
});
