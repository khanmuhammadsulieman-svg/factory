/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // --- users: add role, open sign-up (public store), prevent role escalation ---
    const users = app.findCollectionByNameOrId("users");
    if (!users.fields.getByName("role")) {
      users.fields.add(
        new SelectField({
          name: "role",
          maxSelect: 1,
          values: ["customer", "admin"],
        }),
      );
    }
    users.listRule = "id = @request.auth.id";
    users.viewRule = "id = @request.auth.id";
    users.createRule =
      "@request.body.role:isset = false || @request.body.role = 'customer'";
    users.updateRule =
      "id = @request.auth.id && (@request.body.role:isset = false || @request.body.role = @request.auth.role)";
    users.deleteRule = null;
    const pw = users.fields.getByName("password");
    if (pw) pw.min = Math.max(pw.min || 0, 10);
    app.save(users);

    // --- products ---
    let products;
    try {
      products = app.findCollectionByNameOrId("products");
    } catch (_) {
      products = new Collection({
        type: "base",
        name: "products",
        listRule: "active = true || @request.auth.role = 'admin'",
        viewRule: "active = true || @request.auth.role = 'admin'",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
          { name: "name", type: "text", required: true, max: 200 },
          { name: "slug", type: "text", max: 220 },
          {
            name: "category",
            type: "select",
            required: true,
            maxSelect: 1,
            values: ["men", "women", "kids"],
          },
          {
            name: "type",
            type: "select",
            required: true,
            maxSelect: 1,
            values: ["sneakers", "casual", "formal", "sandals"],
          },
          { name: "price", type: "number", required: true, min: 0 },
          { name: "sale_price", type: "number", min: 0 },
          { name: "sizes", type: "json" },
          { name: "colors", type: "json" },
          { name: "images", type: "json" },
          { name: "description", type: "text" },
          { name: "stock", type: "number", onlyInt: true, min: 0 },
          { name: "active", type: "bool" },
          { name: "bestseller", type: "bool" },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
        indexes: [
          "CREATE INDEX idx_products_category ON products (category)",
          "CREATE INDEX idx_products_active ON products (active)",
        ],
      });
      app.save(products);
    }

    // --- orders ---
    let orders;
    try {
      orders = app.findCollectionByNameOrId("orders");
    } catch (_) {
      orders = new Collection({
        type: "base",
        name: "orders",
        listRule: "@request.auth.role = 'admin'",
        viewRule: "@request.auth.role = 'admin'",
        createRule: "",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
          { name: "customer_name", type: "text", required: true, max: 120 },
          { name: "phone", type: "text", required: true, max: 30 },
          { name: "address", type: "text", required: true, max: 500 },
          { name: "city", type: "text", required: true, max: 100 },
          { name: "notes", type: "text", max: 1000 },
          { name: "items", type: "json", required: true },
          { name: "total", type: "number", required: true, min: 0 },
          {
            name: "status",
            type: "select",
            required: true,
            maxSelect: 1,
            values: ["new", "confirmed", "packed", "shipped", "delivered", "cancelled"],
          },
          { name: "payment_method", type: "text", max: 60 },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
        indexes: ["CREATE INDEX idx_orders_status ON orders (status)"],
      });
      app.save(orders);
    }

    // --- settings (single store record) ---
    let settings;
    try {
      settings = app.findCollectionByNameOrId("settings");
    } catch (_) {
      settings = new Collection({
        type: "base",
        name: "settings",
        listRule: "",
        viewRule: "",
        createRule: null,
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: null,
        fields: [
          { name: "key", type: "text", required: true, max: 60 },
          { name: "store_name", type: "text", max: 120 },
          { name: "contact_phone", type: "text", max: 40 },
          { name: "contact_email", type: "text", max: 120 },
          { name: "whatsapp", type: "text", max: 40 },
          { name: "address", type: "text", max: 300 },
          { name: "delivery_message", type: "text", max: 500 },
          { name: "announcement", type: "text", max: 300 },
          { name: "currency", type: "text", max: 10 },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      });
      app.save(settings);

      const s = new Record(settings);
      s.set("key", "store");
      s.set("store_name", "Factory Outlet Shoes");
      s.set("contact_phone", "+92 300 1234567");
      s.set("contact_email", "support@factoryoutletshoes.store");
      s.set("whatsapp", "+92 300 1234567");
      s.set("address", "Main Boulevard, Gulberg III, Lahore, Pakistan");
      s.set(
        "delivery_message",
        "Nationwide delivery in 2-5 working days. Delivery charges: PKR 200 (free on orders over PKR 5,000). Cash on Delivery available across Pakistan.",
      );
      s.set(
        "announcement",
        "Factory-rate shoes from PKR 999 — Cash on Delivery nationwide — Free delivery over PKR 5,000",
      );
      s.set("currency", "PKR");
      app.save(s);
    }

    // --- seed admin account ---
    try {
      app.findAuthRecordByEmail("users", "admin@factoryoutletshoes.store");
    } catch (_) {
      const admin = new Record(users);
      admin.setEmail("admin@factoryoutletshoes.store");
      admin.setPassword("FOS-Admin-2026!Khi");
      admin.set("name", "Store Admin");
      admin.set("role", "admin");
      admin.set("verified", true);
      app.save(admin);
    }
  },
  (app) => {
    for (const name of ["orders", "products", "settings"]) {
      try {
        app.delete(app.findCollectionByNameOrId(name));
      } catch (e) {
        if (!e.message.includes("no rows in result set")) throw e;
      }
    }
    try {
      const admin = app.findAuthRecordByEmail("users", "admin@factoryoutletshoes.store");
      app.delete(admin);
    } catch (e) {
      if (!e.message.includes("no rows in result set")) throw e;
    }
  },
);
