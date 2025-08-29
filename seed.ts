import { PrismaClient } from '../src/generated/prisma/index'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Skip cleanup since database should be empty after migration
  console.log('📋 Database is fresh, proceeding with seeding...')

  // Create sample business
  const business = await prisma.business.create({
    data: {
      name: 'CleanPro Home Services',
      description: 'Professional home cleaning services for residential and commercial properties',
      email: 'info@cleanpro.com',
      phone: '+1-555-0123',
      address: '123 Business Ave, Downtown, City, State 12345',
      website: 'https://cleanpro.com',
      logo: '/images/cleanpro-logo.png',
      isActive: true,
    },
  })

  console.log('✅ Created business:', business.name)

  // Create sample services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Standard House Cleaning',
        description: 'Complete house cleaning including dusting, vacuuming, mopping, and bathroom cleaning',
        price: 120.00,
        duration: 180, // 3 hours
        isActive: true,
        businessId: business.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Deep Cleaning',
        description: 'Intensive cleaning including hard-to-reach areas, inside appliances, and detailed attention',
        price: 200.00,
        duration: 300, // 5 hours
        isActive: true,
        businessId: business.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Move-in/Move-out Cleaning',
        description: 'Comprehensive cleaning for properties being vacated or newly occupied',
        price: 250.00,
        duration: 360, // 6 hours
        isActive: true,
        businessId: business.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Kitchen Deep Clean',
        description: 'Detailed kitchen cleaning including inside cabinets, appliances, and surfaces',
        price: 80.00,
        duration: 120, // 2 hours
        isActive: true,
        businessId: business.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Bathroom Deep Clean',
        description: 'Thorough bathroom cleaning including grout, fixtures, and all surfaces',
        price: 60.00,
        duration: 90, // 1.5 hours
        isActive: true,
        businessId: business.id,
      },
    }),
  ])

  console.log('✅ Created services:', services.length)

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const users = await Promise.all([
    // Admin user
    prisma.user.create({
      data: {
        email: 'admin@cleanpro.com',
        name: 'John Admin',
        phone: '+1-555-0001',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        businessId: business.id,
      },
    }),
    // Staff user
    prisma.user.create({
      data: {
        email: 'staff@cleanpro.com',
        name: 'Sarah Staff',
        phone: '+1-555-0002',
        password: hashedPassword,
        role: 'STAFF',
        isActive: true,
        businessId: business.id,
      },
    }),
    // Customer user
    prisma.user.create({
      data: {
        email: 'customer@example.com',
        name: 'Alice Customer',
        phone: '+1-555-0003',
        password: hashedPassword,
        role: 'CUSTOMER',
        isActive: true,
        businessId: business.id,
      },
    }),
  ])

  console.log('✅ Created users:', users.length)

  // Create sample bookings
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const bookings = await Promise.all([
    // Pending booking
    prisma.booking.create({
      data: {
        customerName: 'Bob Smith',
        customerEmail: 'bob.smith@email.com',
        customerPhone: '+1-555-0101',
        serviceName: 'Standard House Cleaning',
        servicePrice: 120.00,
        serviceDuration: 180,
        date: tomorrow,
        timeSlot: '09:00',
        address: '456 Oak Street, Suburbia, City, State 12345',
        notes: 'Please focus on the kitchen and living room areas',
        status: 'PENDING',
        businessId: business.id,
        serviceId: services[0].id,
        userId: users[2].id, // Customer user
      },
    }),
    // Confirmed booking
    prisma.booking.create({
      data: {
        customerName: 'Carol Johnson',
        customerEmail: 'carol.johnson@email.com',
        customerPhone: '+1-555-0102',
        serviceName: 'Deep Cleaning',
        servicePrice: 200.00,
        serviceDuration: 300,
        date: nextWeek,
        timeSlot: '14:00',
        address: '789 Pine Avenue, Downtown, City, State 12345',
        notes: 'Moving out cleaning - need it spotless',
        status: 'CONFIRMED',
        businessId: business.id,
        serviceId: services[1].id,
      },
    }),
    // Completed booking
    prisma.booking.create({
      data: {
        customerName: 'David Wilson',
        customerEmail: 'david.wilson@email.com',
        customerPhone: '+1-555-0103',
        serviceName: 'Kitchen Deep Clean',
        servicePrice: 80.00,
        serviceDuration: 120,
        date: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
        timeSlot: '10:00',
        address: '321 Elm Road, Westside, City, State 12345',
        notes: 'Kitchen was very dirty, needed extra attention',
        status: 'COMPLETED',
        businessId: business.id,
        serviceId: services[3].id,
      },
    }),
    // Cancelled booking
    prisma.booking.create({
      data: {
        customerName: 'Eva Brown',
        customerEmail: 'eva.brown@email.com',
        customerPhone: '+1-555-0104',
        serviceName: 'Bathroom Deep Clean',
        servicePrice: 60.00,
        serviceDuration: 90,
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        timeSlot: '16:00',
        address: '654 Maple Drive, Eastside, City, State 12345',
        notes: 'Customer requested cancellation due to schedule conflict',
        status: 'CANCELLED',
        businessId: business.id,
        serviceId: services[4].id,
      },
    }),
  ])

  console.log('✅ Created bookings:', bookings.length)

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Sample Data Summary:')
  console.log(`   Business: ${business.name}`)
  console.log(`   Services: ${services.length}`)
  console.log(`   Users: ${users.length}`)
  console.log(`   Bookings: ${bookings.length}`)
  console.log('\n🔑 Default Login Credentials:')
  console.log('   Admin: admin@cleanpro.com / password123')
  console.log('   Staff: staff@cleanpro.com / password123')
  console.log('   Customer: customer@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
