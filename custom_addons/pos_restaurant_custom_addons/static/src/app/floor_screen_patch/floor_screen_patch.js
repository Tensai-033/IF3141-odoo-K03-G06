/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { FloorScreen } from "@pos_restaurant/app/floor_screen/floor_screen";
import { PettyCashPopup } from "@pos_restaurant_custom_addons/app/petty_cash_popup/petty_cash_popup";

patch(FloorScreen.prototype, {
    async onPettyCashClick() {
        await this.popup.add(PettyCashPopup);
    },
});
