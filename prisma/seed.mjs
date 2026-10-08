// Seeds demo data: admin account, catalogue, customers and orders.
// Run with `npm run db:seed` (wipes existing data).
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@rayve.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Rayve@Admin123";
const DEMO_CUSTOMER_PASSWORD = "Customer@123";

const products = [
  {
    name: "Toro",
    tagline: "The everyday oval, sharpened.",
    category: "Sunglasses",
    shape: "Oval",
    frameColor: "Gloss Black",
    lensColor: "Smoke Grey",
    material: "Italian acetate",
    price: 5490,
    comparePrice: 6490,
    stock: 42,
    featured: true,
    images: ["/images/toro.jpg", "/images/model-toro.jpg"],
  },
  {
    name: "Sevilla",
    tagline: "Warm tortoise, quiet confidence.",
    category: "Sunglasses",
    shape: "Square",
    frameColor: "Havana Tortoise",
    lensColor: "Brown Gradient",
    material: "Italian acetate",
    price: 4990,
    stock: 31,
    featured: true,
    images: ["/images/sevilla.jpg", "/images/model-sevilla.jpg"],
  },
  {
    name: "Arena",
    tagline: "Crystal frame. Clear intent.",
    category: "Sunglasses",
    shape: "Round",
    frameColor: "Crystal Olive",
    lensColor: "Dark Grey",
    material: "Bio-acetate",
    price: 5990,
    stock: 18,
    featured: true,
    images: ["/images/arena.jpg", "/images/model-arena.jpg"],
  },
  {
    name: "Córdoba",
    tagline: "Fine metal, precise lines.",
    category: "Sunglasses",
    shape: "Rectangle",
    frameColor: "Brushed Gold",
    lensColor: "Bottle Green",
    material: "Titanium",
    price: 6490,
    stock: 4,
    featured: true,
    images: ["/images/cordoba.jpg", "/images/model-cordoba.jpg"],
  },
  {
    name: "Ronda",
    tagline: "Amber lenses for long afternoons.",
    category: "Sunglasses",
    shape: "Rectangle",
    frameColor: "Desert Sand",
    lensColor: "Amber",
    material: "Italian acetate",
    price: 4490,
    stock: 27,
    images: ["/images/ronda.jpg", "/images/model-ronda.jpg"],
  },
  {
    name: "Matador",
    tagline: "Bold temples, signature horns.",
    category: "Sunglasses",
    shape: "Shield",
    frameColor: "Jet Black",
    lensColor: "Smoke Grey",
    material: "Italian acetate",
    price: 5290,
    stock: 22,
    images: ["/images/matador.jpg", "/images/model-matador.jpg"],
  },
  {
    name: "Granada",
    tagline: "A classic round, reconsidered.",
    category: "Sunglasses",
    shape: "Round",
    frameColor: "Jet Black",
    lensColor: "Grey",
    material: "Italian acetate",
    price: 4790,
    stock: 3,
    images: ["/images/granada.jpg", "/images/model-granada.jpg"],
  },
  {
    name: "Valencia",
    tagline: "Rimless lightness, bronze warmth.",
    category: "Sunglasses",
    shape: "Rectangle",
    frameColor: "Bronze",
    lensColor: "Brown",
    material: "Titanium",
    price: 6990,
    comparePrice: 7990,
    stock: 15,
    images: ["/images/valencia.jpg", "/images/model-valencia.jpg"],
  },
  {
    name: "Alba",
    tagline: "Featherweight gold for every day.",
    category: "Sunglasses",
    shape: "Oval",
    frameColor: "Polished Gold",
    lensColor: "Amber",
    material: "Stainless steel",
    price: 5790,
    stock: 20,
    images: ["/images/alba.jpg", "/images/model-alba.jpg"],
  },
  {
    name: "Plaza",
    tagline: "Rich tortoise, sculpted edge.",
    category: "Sunglasses",
    shape: "Cat-eye",
    frameColor: "Dark Tortoise",
    lensColor: "Brown",
    material: "Italian acetate",
    price: 4690,
    stock: 26,
    images: ["/images/plaza.jpg", "/images/phone.jpg"],
  },
  {
    name: "Bravo",
    tagline: "Slim, sharp and always within reach.",
    category: "Sunglasses",
    shape: "Rectangle",
    frameColor: "Olive Black",
    lensColor: "Smoke Grey",
    material: "Italian acetate",
    price: 4290,
    stock: 34,
    images: ["/images/bravo.jpg", "/images/model-matador.jpg"],
  },
  {
    name: "Málaga",
    tagline: "Optical frames in translucent olive.",
    category: "Optical",
    shape: "Round",
    frameColor: "Translucent Olive",
    lensColor: "Clear (demo lens)",
    material: "Bio-acetate",
    price: 3990,
    stock: 40,
    featured: true,
    images: ["/images/malaga.jpg", "/images/hero-green.jpg"],
  },
];

const description = (p) =>
  `${p.name} takes a silhouette you already know and shifts it — through proportion, detail and finish. ` +
  `Crafted in ${p.material.toLowerCase()} with ${p.lensColor.toLowerCase()} lenses, it is made for ordinary days, not just special ones. ` +
  `100% UV400 protection, hand-polished finish and RAYVE signature hinges.`;

const customers = [
  ["Aarav Mehta", "aarav@example.com", "+91 98200 11223", "14 Carter Road", "Bandra West", "Mumbai", "Maharashtra", "400050"],
  ["Ishita Kapoor", "ishita@example.com", "+91 98110 44556", "C-22 Defence Colony", null, "New Delhi", "Delhi", "110024"],
  ["Rohan Iyer", "rohan@example.com", "+91 99860 77889", "21 Lavelle Road", "Ashok Nagar", "Bengaluru", "Karnataka", "560001"],
  ["Meera Nair", "meera@example.com", "+91 94470 22334", "Marine Drive, Flat 6B", null, "Kochi", "Kerala", "682031"],
  ["Kabir Singh", "kabir@example.com", "+91 98140 55667", "House 112, Sector 8", null, "Chandigarh", "Chandigarh", "160009"],
  ["Ananya Rao", "ananya@example.com", "+91 90000 88990", "Road No. 12", "Banjara Hills", "Hyderabad", "Telangana", "500034"],
  ["Vihaan Shah", "vihaan@example.com", "+91 98250 33445", "8 Law Garden", "Ellisbridge", "Ahmedabad", "Gujarat", "380006"],
  ["Diya Banerjee", "diya@example.com", "+91 98300 66778", "45 Park Street", null, "Kolkata", "West Bengal", "700016"],
  ["Arjun Malhotra", "arjun@example.com", "+91 98111 99001", "DLF Phase 4, Tower B", null, "Gurugram", "Haryana", "122009"],
  ["Sara Thomas", "sara@example.com", "+91 98450 12121", "77 Richmond Road", null, "Bengaluru", "Karnataka", "560025"],
];

const DAY = 24 * 60 * 60 * 1000;
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

function statusForAge(days) {
  const r = rand();
  if (r < 0.06) return "CANCELLED";
  if (days > 9) return "DELIVERED";
  if (days > 5) return r < 0.6 ? "DELIVERED" : "SHIPPED";
  if (days > 2) return r < 0.5 ? "SHIPPED" : "CONFIRMED";
  return r < 0.5 ? "PENDING" : "CONFIRMED";
}

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      name: "Rayve Admin",
      email: ADMIN_EMAIL,
      phone: "+91 90000 00000",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
    },
  });

  const createdProducts = [];
  for (const [i, p] of products.entries()) {
    const { images, ...rest } = p;
    createdProducts.push(
      await prisma.product.create({
        data: {
          ...rest,
          slug: p.name
            .normalize("NFKD")
            .replace(/[̀-ͯ]/g, "")
            .toLowerCase(),
          description: description(p),
          images: JSON.stringify(images),
          createdAt: new Date(Date.now() - (60 - i) * DAY),
        },
      }),
    );
  }

  const customerHash = await bcrypt.hash(DEMO_CUSTOMER_PASSWORD, 10);
  const createdCustomers = [];
  for (const [i, [name, email, phone, line1, line2, city, state, postalCode]] of customers.entries()) {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: customerHash,
        createdAt: new Date(Date.now() - (45 - i * 3) * DAY),
        addresses: {
          create: { label: "Home", fullName: name, phone, line1, line2, city, state, postalCode, isDefault: true },
        },
      },
      include: { addresses: true },
    });
    createdCustomers.push(user);
  }

  let n = 0;
  for (let days = 29; days >= 0; days--) {
    const count = days === 0 ? 3 : Math.floor(rand() * 3) + (days < 7 ? 1 : 0);
    for (let k = 0; k < count; k++) {
      const user = pick(createdCustomers);
      const address = user.addresses[0];
      const lines = [];
      const itemCount = rand() < 0.7 ? 1 : 2;
      for (let j = 0; j < itemCount; j++) {
        const p = pick(createdProducts);
        if (lines.some((l) => l.productId === p.id)) continue;
        lines.push({
          productId: p.id,
          name: p.name,
          image: JSON.parse(p.images)[0],
          price: p.price,
          quantity: rand() < 0.85 ? 1 : 2,
        });
      }
      const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
      const status = statusForAge(days);
      const online = rand() < 0.6;
      const createdAt = new Date(Date.now() - days * DAY - Math.floor(rand() * 8 * 60 * 60 * 1000));
      n++;
      await prisma.order.create({
        data: {
          orderNumber: `RV-${String(100230 + n * 37).padStart(6, "0")}`,
          userId: user.id,
          status,
          paymentMethod: online ? "ONLINE" : "COD",
          paymentStatus:
            status === "CANCELLED" ? (online ? "REFUNDED" : "PENDING") : online || status === "DELIVERED" ? "PAID" : "PENDING",
          subtotal,
          shippingFee: 0,
          total: subtotal,
          shipName: address.fullName,
          shipPhone: address.phone,
          shipLine1: address.line1,
          shipLine2: address.line2,
          shipCity: address.city,
          shipState: address.state,
          shipPostalCode: address.postalCode,
          createdAt,
          items: { create: lines },
        },
      });
    }
  }

  console.log(`Seeded ${createdProducts.length} products, ${createdCustomers.length} customers, ${n} orders.`);
  console.log(`Admin login: ${ADMIN_EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
