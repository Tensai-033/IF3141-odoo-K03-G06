/** @odoo-module */

import { reactive } from "@odoo/owl";

/**
 * Reactive Store untuk Petty Cash (Kas Kecil) Kepala Toko
 */
export const pettyCashStore = reactive({
    records: [
        {
            id: 1,
            name: "PC/20261108/001",
            time: "09:30 WIB",
            date: "08 Nov 2026",
            category: "Gas LPG & Listrik Operasional",
            category_key: "gas_lpg",
            amount: 44000,
            notes: "Beli 2 tabung gas elpiji 3kg di pangkalan karena stok dapur habis",
            cashier_id: 1,
            cashier: "Administrator",
            has_receipt: true,
        },
        {
            id: 2,
            name: "PC/20261108/002",
            time: "10:45 WIB",
            date: "08 Nov 2026",
            category: "Kebersihan & Sanitasi Toko (Sabun, Plastik Sampah)",
            category_key: "hygiene",
            amount: 25000,
            notes: "Beli sabun cuci piring Sunlight 750ml dan spons kawat",
            cashier_id: 1,
            cashier: "Administrator",
            has_receipt: true,
        },
    ],

    get totalToday() {
        return this.records.reduce((total, r) => total + r.amount, 0);
    },

    /**
     * Langkah 5: Menyimpan catatan petty cash beserta ID pengguna dan waktu
     * Langkah 6: Masuk ke laporan harian cabang secara otomatis
     */
    addRecord(data) {
        const now = new Date();
        const timeNow = data.time || now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        }) + " WIB";
        const dateNow = data.date || now.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

        const newRecord = {
            id: this.records.length + 1,
            name: `PC/TODAY/${String(this.records.length + 1).padStart(3, "0")}`,
            time: timeNow,
            date: dateNow,
            category: data.category_label || data.category,
            category_key: data.category,
            amount: parseFloat(data.amount) || 0,
            notes: data.notes,
            cashier_id: data.cashier_id || 1,
            cashier: data.cashier || "Administrator",
            has_receipt: Boolean(data.receipt_image),
            receipt_image: data.receipt_image,
        };

        this.records.unshift(newRecord);
        return newRecord;
    },
});
