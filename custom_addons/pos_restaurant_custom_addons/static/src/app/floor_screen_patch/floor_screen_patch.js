/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { FloorScreen } from "@pos_restaurant/app/floor_screen/floor_screen";
import { PettyCashPopup } from "@pos_restaurant_custom_addons/app/petty_cash_popup/petty_cash_popup";
import { useService } from "@web/core/utils/hooks";

patch(FloorScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.popup = useService("popup");
    },
    async onPettyCashClick() {
        await this.popup.add(PettyCashPopup);
    },
});
