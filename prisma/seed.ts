import { PrismaClient, Concentration } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Cleaning existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.auditLog.deleteMany();

  // Seed Brands
  console.log("📦 Seeding Brands...");
  const chanel = await prisma.brand.create({
    data: {
      name: "Chanel",
      country: "France",
    },
  });

  const dior = await prisma.brand.create({
    data: {
      name: "Dior",
      country: "France",
    },
  });

  const tomFord = await prisma.brand.create({
    data: {
      name: "Tom Ford",
      country: "United States",
    },
  });

  const creed = await prisma.brand.create({
    data: {
      name: "Creed",
      country: "France",
    },
  });

  const versace = await prisma.brand.create({
    data: {
      name: "Versace",
      country: "Italy",
    },
  });

  // Seed Categories (Hierarchical)
  console.log("📁 Seeding Categories...");
  const mensCategory = await prisma.category.create({
    data: {
      name: "Men's Fragrances",
      slug: "mens-fragrances",
    },
  });

  const womensCategory = await prisma.category.create({
    data: {
      name: "Women's Fragrances",
      slug: "womens-fragrances",
    },
  });

  const unisexCategory = await prisma.category.create({
    data: {
      name: "Unisex Fragrances",
      slug: "unisex-fragrances",
    },
  });

  const mensDesigner = await prisma.category.create({
    data: {
      name: "Designer",
      slug: "mens-designer",
      parentCategoryId: mensCategory.id,
    },
  });

  const mensLuxury = await prisma.category.create({
    data: {
      name: "Luxury",
      slug: "mens-luxury",
      parentCategoryId: mensCategory.id,
    },
  });

  const womensDesigner = await prisma.category.create({
    data: {
      name: "Designer",
      slug: "womens-designer",
      parentCategoryId: womensCategory.id,
    },
  });

  // Seed Products
  console.log("🛍️ Seeding Products...");
  const bleuDeChanel = await prisma.product.create({
    data: {
      name: "Bleu de Chanel",
      description:
        "A fresh aromatic fragrance with citrus and woody notes. A modern classic for the confident man.",
      categoryId: mensDesigner.id,
      brandId: chanel.id,
      scentFamily: "Aromatic Fougère",
      genderTarget: "Men",
    },
  });

  const sauvage = await prisma.product.create({
    data: {
      name: "Sauvage",
      description:
        "A fresh and spicy fragrance with bergamot and ambroxan. Wild and noble.",
      categoryId: mensDesigner.id,
      brandId: dior.id,
      scentFamily: "Fresh Spicy",
      genderTarget: "Men",
    },
  });

  const aventus = await prisma.product.create({
    data: {
      name: "Aventus",
      description:
        "A fruity chypre fragrance with pineapple and birch. The scent of success.",
      categoryId: mensLuxury.id,
      brandId: creed.id,
      scentFamily: "Fruity Chypre",
      genderTarget: "Men",
    },
  });

  const oudWood = await prisma.product.create({
    data: {
      name: "Oud Wood",
      description:
        "A luxurious woody fragrance with oud, sandalwood, and vanilla. Exotic and sophisticated.",
      categoryId: mensLuxury.id,
      brandId: tomFord.id,
      scentFamily: "Woody Oriental",
      genderTarget: "Men",
    },
  });

  const eros = await prisma.product.create({
    data: {
      name: "Eros",
      description:
        "A fresh oriental fragrance with mint, vanilla, and tonka bean. Passionate and energetic.",
      categoryId: mensDesigner.id,
      brandId: versace.id,
      scentFamily: "Fresh Oriental",
      genderTarget: "Men",
    },
  });

  const cocoMademoiselle = await prisma.product.create({
    data: {
      name: "Coco Mademoiselle",
      description:
        "A modern oriental fragrance with orange, jasmine, and patchouli. Bold and feminine.",
      categoryId: womensDesigner.id,
      brandId: chanel.id,
      scentFamily: "Oriental",
      genderTarget: "Women",
    },
  });

  // Seed Product Variants with Scent Notes (JSONB)
  console.log("📦 Seeding Product Variants...");

  // Bleu de Chanel Variants
  await prisma.productVariant.create({
    data: {
      sku: "CHAN-BDC-EDT-50",
      name: "Bleu de Chanel Eau de Toilette 50ml",
      concentration: Concentration.EDT,
      volumeMl: 50,
      isTester: false,
      weightGrams: 150,
      stockLevel: 100,
      reorderPoint: 20,
      productId: bleuDeChanel.id,
      price: 90.0,
      specifications: {
        topNotes: ["Lemon", "Grapefruit", "Mint", "Pink Pepper"],
        middleNotes: ["Ginger", "Jasmine", "Nutmeg"],
        baseNotes: ["Incense", "Cedar", "Sandalwood", "Patchouli", "Labdanum"],
        intensity: "Moderate",
        longevity: "6-8 hours",
        sillage: "Moderate",
      },
    },
  });

  await prisma.productVariant.create({
    data: {
      sku: "CHAN-BDC-EDP-100",
      name: "Bleu de Chanel Eau de Parfum 100ml",
      concentration: Concentration.EDP,
      volumeMl: 100,
      isTester: false,
      weightGrams: 280,
      stockLevel: 75,
      reorderPoint: 15,
      productId: bleuDeChanel.id,
      price: 120.0,
      specifications: {
        topNotes: ["Lemon", "Grapefruit", "Mint", "Pink Pepper"],
        middleNotes: ["Ginger", "Jasmine", "Nutmeg"],
        baseNotes: ["Incense", "Cedar", "Sandalwood", "Patchouli", "Labdanum"],
        intensity: "Strong",
        longevity: "8-10 hours",
        sillage: "Strong",
      },
    },
  });

  await prisma.productVariant.create({
    data: {
      sku: "CHAN-BDC-EDT-50-TEST",
      name: "Bleu de Chanel Eau de Toilette 50ml Tester",
      concentration: Concentration.EDT,
      volumeMl: 50,
      isTester: true,
      weightGrams: 150,
      stockLevel: 25,
      reorderPoint: 5,
      productId: bleuDeChanel.id,
      price: 70.0,
      specifications: {
        topNotes: ["Lemon", "Grapefruit", "Mint", "Pink Pepper"],
        middleNotes: ["Ginger", "Jasmine", "Nutmeg"],
        baseNotes: ["Incense", "Cedar", "Sandalwood", "Patchouli", "Labdanum"],
        intensity: "Moderate",
        longevity: "6-8 hours",
        sillage: "Moderate",
      },
    },
  });

  // Sauvage Variants
  await prisma.productVariant.create({
    data: {
      sku: "DIOR-SAU-EDT-100",
      name: "Sauvage Eau de Toilette 100ml",
      concentration: Concentration.EDT,
      volumeMl: 100,
      isTester: false,
      weightGrams: 280,
      stockLevel: 120,
      reorderPoint: 25,
      productId: sauvage.id,
      price: 95.0,
      specifications: {
        topNotes: ["Calabrian Bergamot", "Pepper"],
        middleNotes: ["Sichuan Pepper", "Lavender", "Pink Pepper", "Patchouli"],
        baseNotes: ["Ambroxan", "Cedar", "Labdanum"],
        intensity: "Strong",
        longevity: "8-10 hours",
        sillage: "Very Strong",
      },
    },
  });

  await prisma.productVariant.create({
    data: {
      sku: "DIOR-SAU-EDP-60",
      name: "Sauvage Eau de Parfum 60ml",
      concentration: Concentration.EDP,
      volumeMl: 60,
      isTester: false,
      weightGrams: 200,
      stockLevel: 80,
      reorderPoint: 15,
      productId: sauvage.id,
      price: 110.0,
      specifications: {
        topNotes: ["Calabrian Bergamot", "Pepper"],
        middleNotes: ["Sichuan Pepper", "Lavender", "Pink Pepper", "Patchouli"],
        baseNotes: ["Ambroxan", "Cedar", "Labdanum"],
        intensity: "Very Strong",
        longevity: "10-12 hours",
        sillage: "Very Strong",
      },
    },
  });

  // Aventus Variants
  await prisma.productVariant.create({
    data: {
      sku: "CREED-AVE-EDP-50",
      name: "Aventus Eau de Parfum 50ml",
      concentration: Concentration.EDP,
      volumeMl: 50,
      isTester: false,
      weightGrams: 180,
      stockLevel: 50,
      reorderPoint: 10,
      productId: aventus.id,
      price: 285.0,
      specifications: {
        topNotes: ["Pineapple", "Apple", "Bergamot", "Blackcurrant"],
        middleNotes: ["Birch", "Patchouli", "Jasmine", "Rose"],
        baseNotes: ["Musk", "Oakmoss", "Ambergris", "Vanilla"],
        intensity: "Strong",
        longevity: "10-12 hours",
        sillage: "Strong",
      },
    },
  });

  await prisma.productVariant.create({
    data: {
      sku: "CREED-AVE-EDP-100",
      name: "Aventus Eau de Parfum 100ml",
      concentration: Concentration.EDP,
      volumeMl: 100,
      isTester: false,
      weightGrams: 350,
      stockLevel: 30,
      reorderPoint: 8,
      productId: aventus.id,
      price: 450.0,
      specifications: {
        topNotes: ["Pineapple", "Apple", "Bergamot", "Blackcurrant"],
        middleNotes: ["Birch", "Patchouli", "Jasmine", "Rose"],
        baseNotes: ["Musk", "Oakmoss", "Ambergris", "Vanilla"],
        intensity: "Strong",
        longevity: "10-12 hours",
        sillage: "Strong",
      },
    },
  });

  // Oud Wood Variants
  await prisma.productVariant.create({
    data: {
      sku: "TF-OW-EDP-50",
      name: "Oud Wood Eau de Parfum 50ml",
      concentration: Concentration.EDP,
      volumeMl: 50,
      isTester: false,
      weightGrams: 200,
      stockLevel: 40,
      reorderPoint: 10,
      productId: oudWood.id,
      price: 320.0,
      specifications: {
        topNotes: ["Oud", "Rosewood"],
        middleNotes: ["Cardamom", "Sandalwood"],
        baseNotes: ["Vanilla", "Tonka Bean", "Amber"],
        intensity: "Very Strong",
        longevity: "12+ hours",
        sillage: "Moderate to Strong",
      },
    },
  });

  await prisma.productVariant.create({
    data: {
      sku: "TF-OW-EXTRAIT-30",
      name: "Oud Wood Extrait de Parfum 30ml",
      concentration: Concentration.Extrait,
      volumeMl: 30,
      isTester: false,
      weightGrams: 120,
      stockLevel: 20,
      reorderPoint: 5,
      productId: oudWood.id,
      price: 380.0,
      specifications: {
        topNotes: ["Oud", "Rosewood"],
        middleNotes: ["Cardamom", "Sandalwood"],
        baseNotes: ["Vanilla", "Tonka Bean", "Amber"],
        intensity: "Extremely Strong",
        longevity: "14+ hours",
        sillage: "Strong",
      },
    },
  });

  // Eros Variants
  await prisma.productVariant.create({
    data: {
      sku: "VERS-EROS-EDT-100",
      name: "Eros Eau de Toilette 100ml",
      concentration: Concentration.EDT,
      volumeMl: 100,
      isTester: false,
      weightGrams: 280,
      stockLevel: 90,
      reorderPoint: 20,
      productId: eros.id,
      price: 85.0,
      specifications: {
        topNotes: ["Mint", "Green Apple", "Lemon"],
        middleNotes: ["Tonka Bean", "Ambroxan"],
        baseNotes: ["Vanilla", "Virginian Cedar", "Atlas Cedar", "Vetiver"],
        intensity: "Strong",
        longevity: "8-10 hours",
        sillage: "Very Strong",
      },
    },
  });

  await prisma.productVariant.create({
    data: {
      sku: "VERS-EROS-EDP-50",
      name: "Eros Eau de Parfum 50ml",
      concentration: Concentration.EDP,
      volumeMl: 50,
      isTester: false,
      weightGrams: 150,
      stockLevel: 60,
      reorderPoint: 12,
      productId: eros.id,
      price: 105.0,
      specifications: {
        topNotes: ["Mint", "Green Apple", "Lemon"],
        middleNotes: ["Tonka Bean", "Ambroxan"],
        baseNotes: ["Vanilla", "Virginian Cedar", "Atlas Cedar", "Vetiver"],
        intensity: "Very Strong",
        longevity: "10-12 hours",
        sillage: "Very Strong",
      },
    },
  });

  // Coco Mademoiselle Variants
  await prisma.productVariant.create({
    data: {
      sku: "CHAN-CM-EDP-50",
      name: "Coco Mademoiselle Eau de Parfum 50ml",
      concentration: Concentration.EDP,
      volumeMl: 50,
      isTester: false,
      weightGrams: 150,
      stockLevel: 70,
      reorderPoint: 15,
      productId: cocoMademoiselle.id,
      price: 115.0,
      specifications: {
        topNotes: ["Orange", "Mandarin Orange", "Orange Blossom"],
        middleNotes: ["Mimosa", "Jasmine", "Turkish Rose"],
        baseNotes: [
          "Patchouli",
          "Vanilla",
          "Opoponax",
          "Vetiver",
          "White Musk",
        ],
        intensity: "Strong",
        longevity: "8-10 hours",
        sillage: "Strong",
      },
    },
  });

  await prisma.productVariant.create({
    data: {
      sku: "CHAN-CM-EDP-100",
      name: "Coco Mademoiselle Eau de Parfum 100ml",
      concentration: Concentration.EDP,
      volumeMl: 100,
      isTester: false,
      weightGrams: 280,
      stockLevel: 50,
      reorderPoint: 12,
      productId: cocoMademoiselle.id,
      price: 165.0,
      specifications: {
        topNotes: ["Orange", "Mandarin Orange", "Orange Blossom"],
        middleNotes: ["Mimosa", "Jasmine", "Turkish Rose"],
        baseNotes: [
          "Patchouli",
          "Vanilla",
          "Opoponax",
          "Vetiver",
          "White Musk",
        ],
        intensity: "Strong",
        longevity: "8-10 hours",
        sillage: "Strong",
      },
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Brands: 5`);
  console.log(`   - Categories: 6`);
  console.log(`   - Products: 6`);
  console.log(`   - Product Variants: 12`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
