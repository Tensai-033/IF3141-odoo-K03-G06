/** @odoo-module */

import { reactive } from "@odoo/owl";

/**
 * Store Layanan Pesanan Online Delivery
 * Terintegrasi untuk platform: Sheepo Food, Grob Food, dan Gejok Food
 */
export const onlineOrdersStore = reactive({
    orders: [
        {
            id: "GRB-8901",
            platform: "grob",
            platform_name: "GrobFood",
            customer_name: "Budi Santoso",
            customer_phone: "0812-3456-7890",
            driver_name: "Wowo Supratno (Grob)",
            driver_plate: "B 4521 TZX",
            notes: "Sambal dipisah, tolong dipercepat ya mas.",
            created_at: "10:15 WIB",
            ready_by: "10:35 WIB", // Target pesanan harus selesai disiapkan
            items: [
                { name: "Nasi Goreng Spesial", qty: 2, price: 35000 },
                { name: "Es Teh Manis", qty: 2, price: 8000 },
            ],
            subtotal: 86000,
            discount_amount: 15000, // Diskon langsung dalam nominal Rupiah (-Rp 15.000)
            total: 71000,
            status: "pending", // 'pending' | 'accepted' | 'rejected'
        },
        {
            id: "SHP-3312",
            platform: "sheepo",
            platform_name: "SheepoFood",
            customer_name: "Siti Rahma",
            customer_phone: "0857-1122-3344",
            driver_name: "Udin Samsudin (Sheepo)",
            driver_plate: "D 3390 ABK",
            notes: "Jus alpukat gulanya sedikit saja.",
            created_at: "10:28 WIB",
            ready_by: "10:45 WIB", // Target pesanan harus selesai disiapkan
            items: [
                { name: "Ayam Bakar Madu", qty: 1, price: 42000 },
                { name: "Nasi Putih", qty: 1, price: 7000 },
                { name: "Jus Alpukat", qty: 1, price: 18000 },
            ],
            subtotal: 67000,
            discount_amount: 10000, // Diskon promo langsung Rupiah (-Rp 10.000)
            total: 57000,
            status: "pending",
        },
        {
            id: "GJK-5542",
            platform: "gejok",
            platform_name: "GejokFood",
            customer_name: "Dimas Anggara",
            customer_phone: "0819-9988-7766",
            driver_name: "Rudi (Gejok)",
            driver_plate: "F 1289 CCD",
            notes: "Driver sudah otw ke resto.",
            created_at: "10:35 WIB",
            ready_by: "10:50 WIB", // Target pesanan harus selesai disiapkan
            items: [
                { name: "Mie Goreng Seafood", qty: 1, price: 38000 },
                { name: "Air Mineral Dingin", qty: 1, price: 5000 },
            ],
            subtotal: 43000,
            discount_amount: 5000, // Diskon langsung Rupiah (-Rp 5.000)
            total: 38000,
            status: "pending",
        },
    ],

    // Daftar pesanan pending (belum di-ACC/tolak)
    get pendingOrders() {
        return this.orders.filter((order) => order.status === "pending");
    },

    // Counter notifikasi lonceng
    get pendingCount() {
        return this.pendingOrders.length;
    },

    // Aksi ACC / Terima Pesanan Online
    acceptOrder(orderId) {
        const order = this.orders.find((o) => o.id === orderId);
        if (order) {
            order.status = "accepted";
        }
        return order;
    },

    // Aksi Tolak Pesanan Online
    rejectOrder(orderId) {
        const order = this.orders.find((o) => o.id === orderId);
        if (order) {
            order.status = "rejected";
        }
        return order;
    },
});
