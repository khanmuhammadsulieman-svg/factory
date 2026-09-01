/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const products = app.findCollectionByNameOrId("products");

    const rows = [
      {
        name: "Aero White Leather Sneakers",
        slug: "aero-white-leather-sneakers",
        category: "men",
        type: "sneakers",
        price: 2499,
        sale_price: 1999,
        sizes: ["7", "8", "9", "10", "11"],
        colors: ["White"],
        images: ["https://images.hostinger.com/d1978620-cadb-4d20-b25d-92c804c983e8.png"],
        description:
          "Crisp white leather low-tops with a cushioned insole and gum rubber sole. Factory-direct pair built for daily wear — breathable lining, padded collar, and double-stitched overlays.",
        stock: 24,
        active: true,
        bestseller: true,
      },
      {
        name: "Regal Brown Oxford Formal Shoes",
        slug: "regal-brown-oxford",
        category: "men",
        type: "formal",
        price: 3999,
        sale_price: 3499,
        sizes: ["7", "8", "9", "10", "11"],
        colors: ["Brown"],
        images: ["https://images.hostinger.com/71759e61-2329-496e-9d5c-c95e674c559a.png"],
        description:
          "Polished brown leather oxfords with a classic cap toe. Office and wedding ready — soft inner lining, anti-slip sole, and a finish that shines straight out of the box.",
        stock: 15,
        active: true,
        bestseller: true,
      },
      {
        name: "Velocity Navy Running Shoes",
        slug: "velocity-navy-running",
        category: "men",
        type: "sneakers",
        price: 2999,
        sale_price: 0,
        sizes: ["7", "8", "9", "10"],
        colors: ["Navy", "Orange"],
        images: ["https://images.hostinger.com/233e5c36-ec80-4d54-bf2b-50921dde1706.png"],
        description:
          "Lightweight navy runners with orange accents and a shock-absorbing sole. Breathable mesh upper keeps you cool on morning walks, gym sessions, and long bazaar days.",
        stock: 30,
        active: true,
        bestseller: true,
      },
      {
        name: "Khyber Peshawari Chappal",
        slug: "khyber-peshawari-chappal",
        category: "men",
        type: "sandals",
        price: 1999,
        sale_price: 1499,
        sizes: ["7", "8", "9", "10", "11"],
        colors: ["Black"],
        images: ["https://images.hostinger.com/41cfe2a1-5b3f-4725-99f0-1ef50749077d.png"],
        description:
          "Authentic Peshawari chappal in black leather with a durable tyre sole. Hand-finished straps, all-day comfort, and the classic silhouette that never goes out of style.",
        stock: 18,
        active: true,
        bestseller: true,
      },
      {
        name: "Everyday Beige Slip-On Loafers",
        slug: "everyday-beige-loafers",
        category: "women",
        type: "casual",
        price: 1799,
        sale_price: 1299,
        sizes: ["5", "6", "7", "8", "9"],
        colors: ["Beige"],
        images: ["https://images.hostinger.com/913d3014-5529-4ec0-959f-cb73f16c018d.png"],
        description:
          "Soft beige slip-on loafers with a flexible sole and padded footbed. Easy on, easy off — perfect for university, office, and everyday errands.",
        stock: 22,
        active: true,
        bestseller: true,
      },
      {
        name: "Noor Black Block-Heel Sandals",
        slug: "noor-black-block-heel",
        category: "women",
        type: "sandals",
        price: 2499,
        sale_price: 0,
        sizes: ["5", "6", "7", "8"],
        colors: ["Black"],
        images: ["https://images.hostinger.com/8cbe0078-c5c4-4d86-acf2-b8f36404612d.png"],
        description:
          "Elegant black block-heel sandals with a slim ankle strap. Stable 2-inch heel, cushioned sole — made for dinners, dawats, and festive evenings.",
        stock: 12,
        active: true,
        bestseller: false,
      },
      {
        name: "Cloud White Chunky Sneakers",
        slug: "cloud-white-chunky-sneakers",
        category: "women",
        type: "sneakers",
        price: 2999,
        sale_price: 2499,
        sizes: ["5", "6", "7", "8", "9"],
        colors: ["White"],
        images: ["https://images.hostinger.com/76383293-7111-4b4e-b588-2fd7d48b610c.png"],
        description:
          "Trendy white chunky platform sneakers with a soft foam sole. Adds height and attitude while staying light enough for all-day wear.",
        stock: 20,
        active: true,
        bestseller: true,
      },
      {
        name: "Junior Bolt Velcro Sneakers",
        slug: "junior-bolt-velcro-sneakers",
        category: "kids",
        type: "sneakers",
        price: 1299,
        sale_price: 999,
        sizes: ["28", "29", "30", "31", "32", "33", "34", "35"],
        colors: ["Blue", "Red"],
        images: ["https://images.hostinger.com/85157a82-a6b0-4937-a78b-ba68b79f460f.png"],
        description:
          "Bright blue-and-red kids sneakers with easy velcro straps — no laces, no fuss. Tough stitching and a grippy sole built for school and play.",
        stock: 35,
        active: true,
        bestseller: true,
      },
    ];

    for (const data of rows) {
      try {
        app.findFirstRecordByData("products", "slug", data.slug);
        continue;
      } catch (_) {
        // not found — create it
      }
      const r = new Record(products);
      r.load(data);
      app.save(r);
    }
  },
  (app) => {
    const slugs = [
      "aero-white-leather-sneakers",
      "regal-brown-oxford",
      "velocity-navy-running",
      "khyber-peshawari-chappal",
      "everyday-beige-loafers",
      "noor-black-block-heel",
      "cloud-white-chunky-sneakers",
      "junior-bolt-velcro-sneakers",
    ];
    for (const slug of slugs) {
      try {
        const r = app.findFirstRecordByData("products", "slug", slug);
        app.delete(r);
      } catch (e) {
        if (!e.message.includes("no rows in result set")) throw e;
      }
    }
  },
);
