/** @odoo-module */

import { AbstractAwaitablePopup } from "@point_of_sale/app/popup/abstract_awaitable_popup";
import { useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { pettyCashStore } from "@pos_restaurant_custom_addons/app/store/petty_cash_store";

/**
 * Popup Modal Pencatatan Kas Kecil (Petty Cash) Kepala Toko pada Tablet POS
 */
export class PettyCashPopup extends AbstractAwaitablePopup {
    static template = "pos_restaurant_custom_addons.PettyCashPopup";
    static defaultProps = {
        closePopup: "Tutup",
        title: "Petty Cash",
    };

    setup() {
        super.setup();
        this.pos = usePos();
        this.store = pettyCashStore;
        this.notification = useService("pos_notification");

        // Daftar Kategori Keperluan
        this.categories = [
            { key: "kitchen", label: "Bahan Baku & Dapur Darurat (Bumbu, Es Batu, Sayur)" },
            { key: "gas_lpg", label: "Gas LPG & Listrik Operasional" },
            { key: "hygiene", label: "Kebersihan & Sanitasi Toko (Sabun, Plastik Sampah)" },
            { key: "galon_konsumsi", label: "Konsumsi Karyawan & Air Galon" },
            { key: "store", label: "Perlengkapan Toko / Kasir (Kertas Struk, ATK, Baterai)" },
            { key: "maintenance", label: "Perbaikan & Servis Alat Restoran" },
            { key: "transport", label: "Transportasi & Kurir Pengambilan Bahan" },
            { key: "other", label: "Keperluan Mendesak Lain-lain" },
        ];

        this.state = useState({
            amount: "",
            category: "",
            notes: "",
            imageBase64: "",
            imagePreview: "",
            fileName: "",
            errorMessage: "",
            categoryError: "",
            successMessage: "",
            isSubmitting: false,
        });
    }

    formatRupiah(amount) {
        return "Rp " + (amount || 0).toLocaleString("id-ID");
    }

    get validCategoryKeys() {
        return this.categories.map((c) => c.key);
    }

    onCategoryChange(ev) {
        this.state.category = ev.target.value;
        this.state.categoryError = "";
        this.state.errorMessage = "";
    }

    onFileChange(ev) {
        const file = ev.target.files[0];
        if (!file) return;

        this.state.fileName = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.state.imagePreview = e.target.result;
            const base64Data = e.target.result.split(",")[1];
            this.state.imageBase64 = base64Data;
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.state.imagePreview = "";
        this.state.imageBase64 = "";
        this.state.fileName = "";
    }

    async saveExpense() {
        this.state.errorMessage = "";
        this.state.categoryError = "";
        this.state.successMessage = "";

        const amountNum = parseFloat(this.state.amount);

        // Validasi Nominal
        if (!amountNum || amountNum <= 0) {
            this.state.errorMessage = "Nominal pengeluaran harus diisi dan lebih besar dari Rp 0!";
            return;
        }

        // Validasi Kategori
        if (!this.state.category || !this.validCategoryKeys.includes(this.state.category)) {
            this.state.categoryError = "Kategori pengeluaran wajib dipilih.";
            this.state.errorMessage = "Silakan pilih salah satu kategori keperluan dari daftar yang tersedia.";
            return;
        }

        // Validasi Catatan
        if (!this.state.notes.trim()) {
            this.state.errorMessage = "Catatan keperluan barang/jasa wajib diisi!";
            return;
        }

        this.state.isSubmitting = true;

        const categoryObj = this.categories.find((c) => c.key === this.state.category);
        const categoryLabel = categoryObj ? categoryObj.label : this.state.category;

        const cashier = this.pos.get_cashier();
        const userId = cashier?.id || this.pos.user?.id || 1;
        const cashierName = cashier?.name || "Administrator";
        const now = new Date();
        const timeNow = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
        const dateNow = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

        // Simpan ke reactive mock store
        this.store.addRecord({
            amount: amountNum,
            category: this.state.category,
            category_label: categoryLabel,
            notes: this.state.notes.trim(),
            cashier_id: userId,
            cashier: cashierName,
            time: timeNow,
            date: dateNow,
            has_receipt: Boolean(this.state.imageBase64),
            receipt_image: this.state.imagePreview,
        });

        this.notification.add(
            `Pengeluaran kas kecil sebesar ${this.formatRupiah(amountNum)} berhasil dicatat.`,
            4000
        );

        this.state.isSubmitting = false;
        this.confirm();
    }
}
