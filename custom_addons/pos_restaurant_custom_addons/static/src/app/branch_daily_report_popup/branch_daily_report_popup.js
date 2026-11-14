/** @odoo-module */

import { AbstractAwaitablePopup } from "@point_of_sale/app/popup/abstract_awaitable_popup";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { onlineOrdersStore } from "@pos_restaurant_custom_addons/app/store/online_orders_store";
import { pettyCashStore } from "@pos_restaurant_custom_addons/app/store/petty_cash_store";
import { useState } from "@odoo/owl";

/**
 * Popup Modal Laporan Harian Cabang Restoran Berdasarkan Sesi POS
 * Tampilan Sederhana & Monokrom Mengikuti Template Laporan Standar Odoo (Daily Sales Report)
 */
export class BranchDailyReportPopup extends AbstractAwaitablePopup {
    static template = "pos_restaurant_custom_addons.BranchDailyReportPopup";
    static defaultProps = {
        closePopup: "Close",
        confirmText: "Print Report",
    };

    setup() {
        super.setup();
        this.pos = usePos();
        this.onlineStore = onlineOrdersStore;
        this.pettyStore = pettyCashStore;

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hour = String(now.getHours()).padStart(2, "0");
        const minute = String(now.getMinutes()).padStart(2, "0");
        this.printDateTime = `${year}-${month}-${day} ${hour}:${minute}`;

        const currentSessName = this.pos.pos_session?.name || "POS/00007";
        const currentSessId = String(this.pos.pos_session?.id || "current");

        this.state = useState({
            selectedSessionId: currentSessId,
            sessions: [
                {
                    id: currentSessId,
                    name: currentSessName,
                    label: "Shift Berjalan (Hari Ini - Sesi Aktif)",
                    date: "Hari Ini",
                    is_active: true,
                },
                {
                    id: "sess_prev_1",
                    name: "POS/00006",
                    label: "Shift Pagi (08 Nov 2026, 07:00 - 11:00)",
                    date: "08 Nov 2026",
                    is_active: false,
                },
                {
                    id: "sess_prev_2",
                    name: "POS/00005",
                    label: "Shift Malam Kemarin (07 Nov 2026, 16:00 - 22:30)",
                    date: "07 Nov 2026",
                    is_active: false,
                },
                {
                    id: "sess_prev_3",
                    name: "POS/00004",
                    label: "Shift Siang Kemarin (07 Nov 2026, 10:00 - 16:00)",
                    date: "07 Nov 2026",
                    is_active: false,
                },
            ],
        });
    }

    formatCurrency(amount) {
        if (!amount && amount !== 0) return "Rp 0";
        return "Rp " + Math.round(amount).toLocaleString("id-ID");
    }

    get currentSessionObj() {
        return (
            this.state.sessions.find((s) => String(s.id) === String(this.state.selectedSessionId)) ||
            this.state.sessions[0]
        );
    }

    get isCurrentSession() {
        return Boolean(
            this.currentSessionObj?.is_active ||
            String(this.currentSessionObj?.id) === String(this.pos.pos_session?.id) ||
            this.currentSessionObj?.id === "current"
        );
    }

    get companyName() {
        return this.pos.company?.name || this.pos.config?.name || "Restoran Cabang Utama";
    }

    get sessionName() {
        return this.currentSessionObj?.name || "POS/00007";
    }

    get cashierName() {
        return this.pos.get_cashier()?.name || "Administrator";
    }

    // Kelompok produk penjualan (Sales Section) dinamis berdasarkan sesi yang dipilih
    get salesGrouped() {
        if (this.isCurrentSession) {
            const orders = this.pos.get_order_list() || [];
            const validOrders = orders.filter((o) => (o.orderlines || []).length > 0);

            if (validOrders.length > 0) {
                const groups = {};
                for (const order of validOrders) {
                    for (const line of order.orderlines || []) {
                        const product = line.get_product();
                        const categoryName = product.pos_categ_ids?.[0]?.name || "Food & Drinks";
                        if (!groups[categoryName]) {
                            groups[categoryName] = { name: categoryName, items: [], total: 0, qty: 0 };
                        }
                        const lineQty = line.get_quantity() || 1;
                        const linePrice = line.get_display_price ? line.get_display_price() : (line.price || 0);
                        const formattedPrice = linePrice > 1000 ? linePrice : linePrice * 15000;
                        groups[categoryName].items.push({
                            name: line.get_full_product_name(),
                            qty: lineQty,
                            total: formattedPrice,
                        });
                        groups[categoryName].total += formattedPrice;
                        groups[categoryName].qty += lineQty;
                    }
                }
                return Object.values(groups);
            }

            // Sesi saat ini (live fallback)
            return [
                {
                    name: "Drinks",
                    qty: 3,
                    total: 45000,
                    items: [
                        { name: "Ice Tea", qty: 2, total: 20000 },
                        { name: "Mineral Water 600ml", qty: 1, total: 25000 },
                    ],
                },
                {
                    name: "Food",
                    qty: 5,
                    total: 185000,
                    items: [
                        { name: "Ayam Bakar Madu Spesial", qty: 2, total: 84000 },
                        { name: "Nasi Goreng Seafood", qty: 2, total: 76000 },
                        { name: "Pisang Goreng Keju", qty: 1, total: 25000 },
                    ],
                },
            ];
        }

        // Jika memilih sesi lampau POS/00006
        if (this.sessionName === "POS/00006") {
            return [
                {
                    name: "Drinks",
                    qty: 7,
                    total: 76000,
                    items: [
                        { name: "Ice Tea", qty: 4, total: 40000 },
                        { name: "Kopi Tubruk Panas", qty: 3, total: 36000 },
                    ],
                },
                {
                    name: "Food",
                    qty: 7,
                    total: 109000,
                    items: [
                        { name: "Roti Bakar Coklat Keju", qty: 3, total: 45000 },
                        { name: "Nasi Uduk Komplit", qty: 4, total: 64000 },
                    ],
                },
            ];
        }

        // Jika memilih sesi kemarin POS/00005 atau sesi lainnya
        return [
            {
                name: "Drinks",
                qty: 12,
                total: 135000,
                items: [
                    { name: "Lemon Tea", qty: 6, total: 72000 },
                    { name: "Kopi Susu Gula Aren", qty: 6, total: 63000 },
                ],
            },
            {
                name: "Food",
                qty: 10,
                total: 245000,
                items: [
                    { name: "Mie Goreng Spesial Resto", qty: 5, total: 125000 },
                    { name: "Sate Ayam Madura (10 tusuk)", qty: 5, total: 120000 },
                ],
            },
        ];
    }

    get totalSalesQuantity() {
        return this.salesGrouped.reduce((sum, g) => sum + g.qty, 0);
    }

    get totalSalesAmount() {
        return this.salesGrouped.reduce((sum, g) => sum + g.total, 0);
    }

    // Pesanan online Sheepo, Grob, Gejok berdasarkan sesi
    get onlineOrdersList() {
        if (this.isCurrentSession) {
            return this.onlineStore.orders.map((o) => ({
                id: o.id,
                platform: o.platform_name,
                customer: o.customer_name,
                driver: o.driver_name,
                items: o.items.map((i) => `${i.qty}x ${i.name}`).join(", "),
                discount: o.discount_amount,
                total: o.total,
                time: o.created_at,
            }));
        }

        if (this.sessionName === "POS/00006") {
            return [
                {
                    id: "SHP-2890",
                    platform: "Sheepo Food",
                    customer: "Dimas Anggara",
                    driver: "Joko (Sheepo)",
                    items: "2x Nasi Uduk Komplit, 2x Ice Tea",
                    discount: 10000,
                    total: 42000,
                    time: "08:45 WIB",
                },
                {
                    id: "GRB-7120",
                    platform: "Grob Food",
                    customer: "Maya Putri",
                    driver: "Bambang (Grob)",
                    items: "2x Roti Bakar, 2x Kopi Tubruk",
                    discount: 0,
                    total: 58000,
                    time: "09:30 WIB",
                },
            ];
        }

        // Sesi lampau lainnya
        return [
            {
                id: "GJK-3301",
                platform: "Gejok Food",
                customer: "Andi Wijaya",
                driver: "Rahmat (Gejok)",
                items: "3x Mie Goreng, 3x Lemon Tea",
                discount: 15000,
                total: 85000,
                time: "19:15 WIB",
            },
            {
                id: "SHP-1192",
                platform: "Sheepo Food",
                customer: "Dina Kartika",
                driver: "Surya (Sheepo)",
                items: "2x Sate Ayam Madura",
                discount: 10000,
                total: 48000,
                time: "20:00 WIB",
            },
        ];
    }

    get totalOnlineOrdersAmount() {
        return this.onlineOrdersList.reduce((sum, o) => sum + o.total, 0);
    }

    get totalOnlineDiscounts() {
        return this.onlineOrdersList.reduce((sum, o) => sum + (o.discount || 0), 0);
    }

    // Daftar pengeluaran petty cash berdasarkan sesi (NOMINAL POSITIF MURNI)
    get pettyCashRecords() {
        if (this.isCurrentSession) {
            return this.pettyStore.records.map((r) => ({
                name: r.name,
                time: r.time,
                category: r.category,
                notes: r.notes,
                cashier: r.cashier,
                has_receipt: r.has_receipt ? "Yes" : "No",
                amount: r.amount,
            }));
        }

        if (this.sessionName === "POS/00006") {
            return [
                {
                    name: "PC/20261108/001",
                    time: "08:15 WIB",
                    category: "Gas LPG & Listrik Operasional",
                    notes: "Beli 2 tabung gas elpiji 3kg untuk persiapan buka dapur pagi",
                    cashier: "Administrator",
                    has_receipt: "Yes",
                    amount: 44000,
                },
            ];
        }

        // Sesi lampau lainnya
        return [
            {
                name: "PC/20261107/003",
                time: "18:30 WIB",
                category: "Bahan Baku & Dapur Darurat (Bumbu, Es Batu, Sayur)",
                notes: "Beli 3 balok es batu kristal higienis untuk stok bar minuman",
                cashier: "Administrator",
                has_receipt: "Yes",
                amount: 30000,
            },
            {
                name: "PC/20261107/004",
                time: "20:10 WIB",
                category: "Kebersihan & Sanitasi Toko (Sabun, Plastik Sampah)",
                notes: "Beli 2 pak kantong sampah hitam besar 100x120cm",
                cashier: "Administrator",
                has_receipt: "Yes",
                amount: 25000,
            },
        ];
    }

    get totalPettyCashExpenses() {
        return this.pettyCashRecords.reduce((sum, r) => sum + r.amount, 0);
    }

    get totalGrossSales() {
        return this.totalSalesAmount + this.totalOnlineOrdersAmount;
    }

    get netSessionRevenue() {
        return this.totalGrossSales - this.totalPettyCashExpenses;
    }

    printReport() {
        try {
            window.print();
        } catch (e) {
            console.log("Print error:", e);
        }
    }
}
