{
    "name": "POS Restaurant Custom Addons",
    "summary": "Integrasi pesanan online (Sheepo, Grob, Gejok), Kitchen Ticket, Kas Kecil (Petty Cash), dan Dashboard Rekonsiliasi",
    "version": "17.0.1.0.0",
    "license": "LGPL-3",
    "author": "IF3141",
    "category": "Point of Sale",
    "depends": [
        "base",
        "mail",
        "point_of_sale",
        "pos_restaurant",
    ],
    "installable": True,
    "application": True,
    "data": [
        "security/security.xml",
        "security/ir.model.access.csv",
        "views/dashboard_views.xml",
        "views/online_order_views.xml",
        "views/petty_cash_views.xml",
        "views/menus.xml",
        "data/seed_data.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_restaurant_custom_addons/static/src/app/**/*",
        ],
        "web.assets_backend": [
            "pos_restaurant_custom_addons/static/src/dashboard/**/*",
        ],
    },
    "demo": ["demo/demo.xml"],
}
