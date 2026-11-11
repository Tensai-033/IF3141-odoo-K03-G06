/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, useState, onWillUpdateProps } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

/**
 * Komponen Dashboard Manajemen, Rekonsiliasi, dan Konfigurasi Restoran
 */
export class RestaurantManagementDashboard extends Component {
    static template = "pos_restaurant_custom_addons.RestaurantDashboard";

    setup() {
        this.notification = useService("notification");

        const getTabFromProps = (props) => {
            if (this.constructor.defaultTab) {
                return this.constructor.defaultTab;
            }
            const tag = props?.action?.tag;
            if (tag === "restaurant_sales_reports_dashboard") return "sales_reports";
            if (tag === "restaurant_configuration_dashboard") return "configuration";
            if (tag === "restaurant_reconciliation_dashboard") return "reconciliation";

            const ctx = props?.action?.context;
            if (ctx && typeof ctx === "object" && ctx.default_tab) {
                return ctx.default_tab;
            }
            if (typeof ctx === "string") {
                if (ctx.includes("sales_reports")) return "sales_reports";
                if (ctx.includes("configuration")) return "configuration";
            }
            return props?.action?.params?.default_tab || "reconciliation";
        };

        const initialTab = getTabFromProps(this.props);

        const now = new Date();
        const timeNow = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
        const dateNow = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

        this.state = useState({
            activeTab: initialTab,

            // Filter Rekonsiliasi Harian
            reconBranch: "branch_dago",
            reconDate: new Date().toISOString().split("T")[0],
            toleranceLimit: 50000,
            isReconVerified: false,

            // Filter Laporan Penjualan
            salesBranch: "branch_dago",
            salesDate: new Date().toISOString().split("T")[0],
            marketingPeriod: "today",
            activeRole: "purchasing",

            // ==========================================
            // KONFIGURASI DAN HAK AKSES (Dashboard Administrasi POS Cloud)
            // ==========================================
            // Role Pengguna Saat Mengakses Pengaturan: 'admin', 'finance', 'gm'
            configRole: "admin",
            // Sub-seksi Konfigurasi yang Dipilih
            configSection: "menu_prices", // 'users', 'branches', 'menu_prices', 'delivery_integrations', 'petty_categories', 'tolerance_limit', 'audit_log'

            // Data Menu & Harga yang Dikelola
            menuItems: [
                { id: 1, name: "Ayam Bakar Madu Spesial", category: "Makanan", price: 42000, branches: "Semua Cabang", status: "Aktif" },
                { id: 2, name: "Ayam Goreng Kremes", category: "Makanan", price: 35000, branches: "Semua Cabang", status: "Aktif" },
                { id: 3, name: "Ayam Geprek Sambal Korek", category: "Makanan", price: 32000, branches: "Semua Cabang", status: "Aktif" },
                { id: 4, name: "Nasi Goreng Seafood", category: "Makanan", price: 38000, branches: "Cabang Dago & Riau", status: "Aktif" },
                { id: 5, name: "Ice Tea Resto", category: "Minuman", price: 10000, branches: "Semua Cabang", status: "Aktif" },
                { id: 6, name: "Kopi Susu Gula Aren", category: "Minuman", price: 18000, branches: "Semua Cabang", status: "Aktif" },
            ],
            newMenuName: "",
            newMenuPrice: "",
            newMenuCategory: "Makanan",
            newMenuBranches: "Semua Cabang",

            // Data Akun Pengguna & Hak Akses
            usersList: [
                { id: 1, name: "Administrator", login: "admin", role: "Admin Sistem & Kepala Toko", branch: "Semua Cabang", status: "Aktif" },
                { id: 2, name: "Budi Santoso", login: "budi_dago", role: "Kasir Cabang", branch: "Cabang Dago", status: "Aktif" },
                { id: 3, name: "Siti Rahma", login: "siti_finance", role: "Finance & Rekonsiliasi", branch: "Kantor Pusat", status: "Aktif" },
                { id: 4, name: "Hendra Wijaya", login: "hendra_purchasing", role: "Purchasing & Logistik", branch: "Gudang Pusat", status: "Aktif" },
                { id: 5, name: "Diana Putri", login: "diana_marketing", role: "Marketing Manager", branch: "Kantor Pusat", status: "Aktif" },
                { id: 6, name: "Irwan Gunawan", login: "irwan_gm", role: "General Manager", branch: "Semua Cabang", status: "Aktif" },
            ],
            newUserName: "",
            newUserLogin: "",
            newUserRole: "Kasir Cabang",
            newUserBranch: "Cabang Dago",

            // Kategori Petty Cash (Wewenang Finance / GM)
            pettyCategories: [
                "Bahan Baku & Dapur Darurat (Bumbu, Es Batu, Sayur)",
                "Gas LPG & Listrik Operasional",
                "Kebersihan & Sanitasi Toko (Sabun, Plastik Sampah)",
                "Konsumsi Karyawan & Air Galon",
                "Perlengkapan Toko / Kasir (Kertas Struk, ATK, Baterai)",
                "Perbaikan & Servis Alat Restoran",
                "Transportasi & Kurir Pengambilan Bahan",
                "Keperluan Mendesak Lain-lain",
            ],
            newCategoryName: "",

            // Batas Toleransi Selisih (Wewenang Finance / GM)
            configuredTolerance: 50000,
            tempToleranceInput: 50000,

            // Audit Log Perubahan (Tersimpan Permanen)
            auditLogs: [
                {
                    timestamp: `${dateNow}, ${timeNow}`,
                    user: "admin",
                    section: "Menu & Harga",
                    branch: "Semua Cabang",
                    description: "Penyesuaian harga Ayam Bakar Madu Spesial menjadi Rp 42.000",
                    status: "Diterapkan Aktif",
                },
                {
                    timestamp: "08 Nov 2026, 13:15 WIB",
                    user: "siti_finance",
                    section: "Batas Toleransi Selisih",
                    branch: "Semua Cabang",
                    description: "Konfigurasi batas toleransi selisih rekonsiliasi diset ke Rp 50.000",
                    status: "Aktif",
                },
                {
                    timestamp: "07 Nov 2026, 17:30 WIB",
                    user: "admin",
                    section: "Akun & Hak Akses",
                    branch: "Cabang Dago",
                    description: "Pemberian hak akses Kasir Cabang untuk Budi Santoso",
                    status: "Aktif",
                },
                {
                    timestamp: "07 Nov 2026, 11:20 WIB",
                    user: "irwan_gm",
                    section: "Kategori Kas Kecil",
                    branch: "Semua Cabang",
                    description: "Penambahan kategori operasional Gas LPG & Listrik",
                    status: "Aktif",
                },
            ],

            // Pesan Error Validasi Form
            configErrorMessage: "",
            configSuccessMessage: "",
        });

        onWillUpdateProps((nextProps) => {
            const nextTab = getTabFromProps(nextProps);
            if (nextTab && nextTab !== this.state.activeTab) {
                this.state.activeTab = nextTab;
            }
        });
    }

    formatRupiah(amount) {
        if (!amount && amount !== 0) return "Rp 0";
        return "Rp " + Math.round(amount).toLocaleString("id-ID");
    }

    // ==========================================
    // METODE VALIDASI & SIMPAN KONFIGURASI
    // ==========================================
    
    // Periksa apakah peran pengguna berwenang pada konfigurasi yang dipilih
    isRoleAuthorized(section) {
        const role = this.state.configRole;
        if (role === "admin") {
            return ["menu_prices", "users", "audit_log"].includes(section);
        } else if (role === "finance" || role === "gm") {
            return ["petty_categories", "tolerance_limit", "audit_log"].includes(section);
        }
        return false;
    }

    selectConfigSection(section) {
        this.state.configSection = section;
        this.state.configErrorMessage = "";
        this.state.configSuccessMessage = "";
    }

    // Tambah Log Audit Baru
    recordAuditLog(sectionName, desc, branch = "Semua Cabang") {
        const now = new Date();
        const timeString = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
        const dateString = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
        this.state.auditLogs.unshift({
            timestamp: `${dateString}, ${timeString}`,
            user: this.state.configRole === "admin" ? "admin" : (this.state.configRole === "finance" ? "siti_finance" : "irwan_gm"),
            section: sectionName,
            branch: branch,
            description: desc,
            status: "Diterapkan Aktif",
        });
    }

    // 1. Simpan Menu & Harga Baru (Admin)
    saveNewMenuItem() {
        this.state.configErrorMessage = "";
        this.state.configSuccessMessage = "";

        // Validasi input
        if (!this.state.newMenuName.trim()) {
            this.state.configErrorMessage = "Nama menu tidak boleh kosong!";
            return;
        }
        const priceNum = parseFloat(this.state.newMenuPrice);
        if (!priceNum || priceNum <= 0) {
            this.state.configErrorMessage = "Harga menu harus lebih besar dari Rp 0!";
            return;
        }

        const newItem = {
            id: this.state.menuItems.length + 1,
            name: this.state.newMenuName.trim(),
            category: this.state.newMenuCategory,
            price: priceNum,
            branches: this.state.newMenuBranches,
            status: "Aktif",
        };

        this.state.menuItems.push(newItem);
        this.recordAuditLog("Menu & Harga", `Penambahan menu baru "${newItem.name}" seharga ${this.formatRupiah(priceNum)}`, newItem.branches);
        
        this.state.newMenuName = "";
        this.state.newMenuPrice = "";
        this.state.configSuccessMessage = `Menu "${newItem.name}" berhasil disimpan dan langsung aktif di ${newItem.branches}.`;
        this.notification.add(this.state.configSuccessMessage, { type: "success" });
    }

    // 3. Simpan Akun Pengguna Baru (Admin)
    saveNewUser() {
        this.state.configErrorMessage = "";
        this.state.configSuccessMessage = "";

        if (!this.state.newUserName.trim() || !this.state.newUserLogin.trim()) {
            this.state.configErrorMessage = "Nama dan ID login pengguna wajib diisi!";
            return;
        }

        const newUser = {
            id: this.state.usersList.length + 1,
            name: this.state.newUserName.trim(),
            login: this.state.newUserLogin.trim().toLowerCase(),
            role: this.state.newUserRole,
            branch: this.state.newUserBranch,
            status: "Aktif",
        };

        this.state.usersList.push(newUser);
        this.recordAuditLog("Akun Pengguna", `Pembuatan akun pengguna baru "${newUser.name}" (Peran: ${newUser.role})`, newUser.branch);

        this.state.newUserName = "";
        this.state.newUserLogin = "";
        this.state.configSuccessMessage = `Pengguna "${newUser.name}" berhasil dibuat dan hak akses aktif.`;
        this.notification.add(this.state.configSuccessMessage, { type: "success" });
    }

    // 4. Simpan Kategori Kas Kecil Baru (Finance / GM)
    saveNewPettyCategory() {
        this.state.configErrorMessage = "";
        this.state.configSuccessMessage = "";

        if (!this.state.newCategoryName.trim()) {
            this.state.configErrorMessage = "Nama kategori kas kecil tidak boleh kosong!";
            return;
        }

        const catName = this.state.newCategoryName.trim();
        this.state.pettyCategories.push(catName);
        this.recordAuditLog("Kategori Kas Kecil", `Penambahan kategori pengeluaran kas kecil "${catName}"`);

        this.state.newCategoryName = "";
        this.state.configSuccessMessage = `Kategori "${catName}" berhasil disimpan dan aktif di seluruh tablet POS cabang.`;
        this.notification.add(this.state.configSuccessMessage, { type: "success" });
    }

    // 5. Simpan Batas Toleransi Selisih (Finance / GM)
    saveToleranceConfig() {
        this.state.configErrorMessage = "";
        this.state.configSuccessMessage = "";

        const tolNum = parseFloat(this.state.tempToleranceInput);
        if (isNaN(tolNum) || tolNum < 0) {
            this.state.configErrorMessage = "Batas toleransi harus berupa angka positif!";
            return;
        }

        this.state.configuredTolerance = tolNum;
        this.state.toleranceLimit = tolNum; // sinkronkan dengan rekonsiliasi
        this.recordAuditLog("Batas Toleransi", `Pembaruan batas toleransi selisih rekonsiliasi menjadi ${this.formatRupiah(tolNum)}`);

        this.state.configSuccessMessage = `Batas toleransi selisih berhasil diperbarui menjadi ${this.formatRupiah(tolNum)}.`;
        this.notification.add(this.state.configSuccessMessage, { type: "success" });
    }

    // ==========================================
    // DATA REKONSILIASI HARIAN
    // ==========================================
    get branchesReconciliation() {
        return {
            branch_dago: {
                name: "Cabang Dago (Utama)",
                is_closed: true,
                closing_time: "14:05 WIB",
                closed_by: "Administrator (Kepala Toko)",
                bank_transfer_proof: "struk_settlement_bca_dago.jpg",
                cash_sales_system: 1450000,
                cash_physical: 1430000,
                cash_deposit: 1430000,
                non_cash_sales_system: 3850000,
                edc_settlement: 3780000,
                bank_mutation: 3780000,
            },
            branch_dipatiukur: {
                name: "Cabang Dipatiukur",
                is_closed: true,
                closing_time: "14:15 WIB",
                closed_by: "Budi Santoso (Kepala Toko)",
                bank_transfer_proof: "edc_mandiri_dipatiukur.pdf",
                cash_sales_system: 1150000,
                cash_physical: 1145000,
                cash_deposit: 1145000,
                non_cash_sales_system: 2450000,
                edc_settlement: 2450000,
                bank_mutation: 2450000,
            },
            branch_riau: {
                name: "Cabang Riau",
                is_closed: true,
                closing_time: "13:55 WIB",
                closed_by: "Citra Lestari",
                bank_transfer_proof: "settlement_qris_riau.png",
                cash_sales_system: 1800000,
                cash_physical: 1800000,
                cash_deposit: 1800000,
                non_cash_sales_system: 3200000,
                edc_settlement: 3200000,
                bank_mutation: 3200000,
            },
            branch_buahbatu: {
                name: "Cabang Buah Batu",
                is_closed: false,
                closing_time: "-",
                closed_by: "-",
                bank_transfer_proof: null,
                cash_sales_system: 950000,
                cash_physical: 0,
                cash_deposit: 0,
                non_cash_sales_system: 1650000,
                edc_settlement: 0,
                bank_mutation: 0,
            },
        };
    }

    get selectedReconData() {
        const branchData = this.branchesReconciliation[this.state.reconBranch];
        if (!branchData) return null;

        if (!branchData.is_closed) {
            return {
                ...branchData,
                status: "not_closed",
                status_label: "Belum Ditutup",
            };
        }

        const cashDiff = branchData.cash_sales_system - branchData.cash_physical;
        const nonCashDiff = branchData.non_cash_sales_system - branchData.edc_settlement;
        const totalDiff = cashDiff + nonCashDiff;
        const exceedsTolerance = totalDiff > this.state.toleranceLimit;

        return {
            ...branchData,
            cash_diff: cashDiff,
            non_cash_diff: nonCashDiff,
            total_diff: totalDiff,
            exceeds_tolerance: exceedsTolerance,
            status: exceedsTolerance ? "exceeds" : (totalDiff > 0 ? "within_tolerance" : "matched"),
            status_label: exceedsTolerance
                ? "Melewati Batas Toleransi"
                : (totalDiff > 0 ? "Dalam Batas Toleransi" : "Sesuai"),
        };
    }

    confirmReconciliation() {
        this.state.isReconVerified = true;
        this.notification.add(
            `Rekonsiliasi harian untuk ${this.selectedReconData.name} berhasil diverifikasi dan disimpan.`,
            { type: "success" }
        );
    }

    // ==========================================
    // DATA LAPORAN PENJUALAN
    // ==========================================
    get purchasingItems() {
        if (this.state.salesBranch === "empty") return [];

        return [
            { category: "Porsi Daging Ayam", name: "Porsi Ayam Goreng Kremes", sold: 62, unit: "porsi", stock_left: 18, status: "Aman" },
            { category: "Porsi Daging Ayam", name: "Porsi Ayam Bakar Madu Spesial", sold: 45, unit: "porsi", stock_left: 12, status: "Aman" },
            { category: "Porsi Daging Ayam", name: "Porsi Ayam Geprek Sambal Korek", sold: 58, unit: "porsi", stock_left: 6, status: "Menipis" },
            { category: "Porsi Daging Ayam", name: "Porsi Ayam Goreng Lengkuas", sold: 34, unit: "porsi", stock_left: 20, status: "Aman" },
            { category: "Saus & Sambal", name: "Saus Sambal Korek Segar", sold: 70, unit: "porsi", stock_left: 15, status: "Aman" },
            { category: "Saus & Sambal", name: "Saus BBQ Special (Pouch 250ml)", sold: 35, unit: "pouch", stock_left: 8, status: "Menipis" },
            { category: "Saus & Sambal", name: "Saus Keju Lava (Pouch 250ml)", sold: 28, unit: "pouch", stock_left: 14, status: "Aman" },
            { category: "Saus & Sambal", name: "Sambal Matah Bali Asli", sold: 42, unit: "porsi", stock_left: 10, status: "Aman" },
            { category: "Bahan Pokok & Minuman", name: "Beras / Porsi Nasi Putih", sold: 140, unit: "porsi", stock_left: 60, status: "Aman" },
            { category: "Bahan Pokok & Minuman", name: "Teh Celup Resto (Ice Tea)", sold: 125, unit: "porsi", stock_left: 45, status: "Aman" },
        ];
    }

    get marketingChannels() {
        return [
            { channel: "Gerai Restoran (Dine-in)", share: "35%", sales: 4200000, orders: 115, trend: "+8%" },
            { channel: "ShopeeFood (Sheepo Food)", share: "28%", sales: 3360000, orders: 84, trend: "+14%" },
            { channel: "GrabFood (Grob Food)", share: "22%", sales: 2640000, orders: 65, trend: "+5%" },
            { channel: "GoFood (Gejok Food)", share: "15%", sales: 1800000, orders: 48, trend: "+2%" },
        ];
    }

    get marketingTopProducts() {
        return [
            { rank: 1, name: "Ayam Goreng Kremes", channel_fav: "Gerai & Sheepo", qty: 62, revenue: 1612000, trend: "Naik 18%" },
            { rank: 2, name: "Ayam Bakar Madu Spesial", channel_fav: "Grob & Gejok", qty: 45, revenue: 1890000, trend: "Stabil" },
            { rank: 3, name: "Ayam Geprek Sambal Korek", channel_fav: "Sheepo Food", qty: 58, revenue: 1392000, trend: "Naik 12%" },
            { rank: 4, name: "Nasi Goreng Seafood", channel_fav: "Gerai (Dine-in)", qty: 38, revenue: 1444000, trend: "Stabil" },
            { rank: 5, name: "Es Kopi Susu Gula Aren", channel_fav: "Semua Kanal", qty: 55, revenue: 990000, trend: "Naik 22%" },
        ];
    }

    get gmBranchConsolidation() {
        return [
            {
                branch: "Cabang Dago (Utama)",
                status_closed: true,
                revenue: 12000000,
                petty_cash: 350000,
                net_profit: 11650000,
                recon_status: "Perlu Verifikasi EDC",
                badge_class: "bg-warning text-dark",
            },
            {
                branch: "Cabang Dipatiukur",
                status_closed: true,
                revenue: 9800000,
                petty_cash: 210000,
                net_profit: 9590000,
                recon_status: "Sesuai",
                badge_class: "bg-success",
            },
            {
                branch: "Cabang Buah Batu",
                status_closed: false,
                revenue: 7450000,
                petty_cash: 180000,
                net_profit: 7270000,
                recon_status: "Belum Ditutup",
                badge_class: "bg-secondary",
            },
            {
                branch: "Cabang Riau",
                status_closed: true,
                revenue: 11200000,
                petty_cash: 290000,
                net_profit: 10910000,
                recon_status: "Sesuai",
                badge_class: "bg-success",
            },
        ];
    }

    get gmTotals() {
        const branches = this.gmBranchConsolidation;
        const totalRevenue = branches.reduce((sum, b) => sum + b.revenue, 0);
        const totalPetty = branches.reduce((sum, b) => sum + b.petty_cash, 0);
        const totalNet = branches.reduce((sum, b) => sum + b.net_profit, 0);
        const closedCount = branches.filter((b) => b.status_closed).length;
        return {
            totalRevenue,
            totalPetty,
            totalNet,
            closedCount,
            totalBranches: branches.length,
        };
    }

    exportReport(format) {
        if (format === "pdf") {
            window.print();
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        let fileName = "Laporan_Restoran.csv";

        if (this.state.activeRole === "purchasing") {
            fileName = format === "xlsx" ? "Laporan_Bahan_Baku.xlsx" : "Laporan_Bahan_Baku.csv";
            csvContent += "Kategori,Nama Item,Jumlah Terjual,Satuan,Sisa Stok,Status\n";
            for (const item of this.purchasingItems) {
                csvContent += `"${item.category}","${item.name}",${item.sold},"${item.unit}",${item.stock_left},"${item.status}"\n`;
            }
        } else if (this.state.activeRole === "marketing") {
            fileName = "Laporan_Penjualan_Kanal.csv";
            csvContent += "Saluran Penjualan,Pangsa Pasar,Total Omzet,Jumlah Transaksi,Tren\n";
            for (const ch of this.marketingChannels) {
                csvContent += `"${ch.channel}","${ch.share}",${ch.sales},${ch.orders},"${ch.trend}"\n`;
            }
        } else if (this.state.activeRole === "gm") {
            fileName = "Konsolidasi_Omzet_Cabang.csv";
            csvContent += "Cabang,Status Penutupan,Omzet,Kas Kecil,Laba Bersih,Status Rekonsiliasi\n";
            for (const b of this.gmBranchConsolidation) {
                csvContent += `"${b.branch}","${b.status_closed ? 'Selesai' : 'Belum Ditutup'}",${b.revenue},${b.petty_cash},${b.net_profit},"${b.recon_status}"\n`;
            }
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.notification.add(
            `File laporan berhasil diekspor: ${fileName}`,
            { type: "info" }
        );
    }
}

export class RestaurantReconciliationDashboard extends RestaurantManagementDashboard {
    static defaultTab = "reconciliation";
}

export class RestaurantSalesReportsDashboard extends RestaurantManagementDashboard {
    static defaultTab = "sales_reports";
}

export class RestaurantConfigurationDashboard extends RestaurantManagementDashboard {
    static defaultTab = "configuration";
}

registry.category("actions").add("restaurant_management_dashboard", RestaurantManagementDashboard);
registry.category("actions").add("restaurant_reconciliation_dashboard", RestaurantReconciliationDashboard);
registry.category("actions").add("restaurant_sales_reports_dashboard", RestaurantSalesReportsDashboard);
registry.category("actions").add("restaurant_configuration_dashboard", RestaurantConfigurationDashboard);
