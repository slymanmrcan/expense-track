import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL?.replace('host.docker.internal', 'localhost')

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const categories = [
  // Gider kategorileri
  { name: 'Market', icon: '🛒', isIncome: false, order: 1 },
  { name: 'Ekmek', icon: '🍞', isIncome: false, order: 2 },
  { name: 'Sigara', icon: '🚬', isIncome: false, order: 3 },
  { name: 'Abur Cubur', icon: '🍿', isIncome: false, order: 4 },
  { name: 'Yemek', icon: '🍔', isIncome: false, order: 5 },
  { name: 'Restoran', icon: '🍽️', isIncome: false, order: 6 },
  { name: 'Kahve', icon: '☕', isIncome: false, order: 7 },
  { name: 'Ulaşım', icon: '🚌', isIncome: false, order: 8 },
  { name: 'Benzin', icon: '⛽', isIncome: false, order: 9 },
  { name: 'Araba Tamir', icon: '🔧', isIncome: false, order: 10 },
  { name: 'Araba Bakım', icon: '🚗', isIncome: false, order: 11 },
  { name: 'Fatura', icon: '📄', isIncome: false, order: 12 },
  { name: 'Elektrik', icon: '💡', isIncome: false, order: 13 },
  { name: 'Su', icon: '💧', isIncome: false, order: 14 },
  { name: 'Doğalgaz', icon: '🔥', isIncome: false, order: 15 },
  { name: 'Internet', icon: '📶', isIncome: false, order: 16 },
  { name: 'Telefon', icon: '📱', isIncome: false, order: 17 },
  { name: 'Kira Gider', icon: '🏠', isIncome: false, order: 18 },
  { name: 'Ev Eşyası', icon: '🛋️', isIncome: false, order: 19 },
  { name: 'Tadilat', icon: '🔨', isIncome: false, order: 20 },
  { name: 'Tamirat', icon: '🛠️', isIncome: false, order: 21 },
  { name: 'Giyim', icon: '👕', isIncome: false, order: 22 },
  { name: 'Sağlık', icon: '💊', isIncome: false, order: 23 },
  { name: 'Eğitim', icon: '📚', isIncome: false, order: 24 },
  { name: 'Eğlence', icon: '🎬', isIncome: false, order: 25 },
  { name: 'Spor', icon: '🏋️', isIncome: false, order: 26 },
  { name: 'Hediye', icon: '🎁', isIncome: false, order: 27 },
  { name: 'Bağış', icon: '❤️', isIncome: false, order: 28 },
  { name: 'Borç Ödeme', icon: '💳', isIncome: false, order: 29 },
  { name: 'Sigorta', icon: '🛡️', isIncome: false, order: 30 },
  { name: 'Vergi', icon: '📋', isIncome: false, order: 31 },
  { name: 'Diğer Gider', icon: '📦', isIncome: false, order: 99 },

  // Gelir kategorileri
  { name: 'Maaş', icon: '💰', isIncome: true, order: 1 },
  { name: 'Ek İş', icon: '💼', isIncome: true, order: 2 },
  { name: 'Freelance', icon: '💻', isIncome: true, order: 3 },
  { name: 'Kira Gelir', icon: '🏘️', isIncome: true, order: 4 },
  { name: 'Yatırım', icon: '📈', isIncome: true, order: 5 },
  { name: 'Faiz', icon: '🏦', isIncome: true, order: 6 },
  { name: 'İkramiye', icon: '🎉', isIncome: true, order: 7 },
  { name: 'Hediye Gelir', icon: '🎀', isIncome: true, order: 8 },
  { name: 'Borç Tahsil', icon: '🤝', isIncome: true, order: 9 },
  { name: 'Satış', icon: '🏷️', isIncome: true, order: 10 },
  { name: 'Diğer Gelir', icon: '✨', isIncome: true, order: 99 },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Kategorileri ekle
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }
  console.log('✅ Categories seeded')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
