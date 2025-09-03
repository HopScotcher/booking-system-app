
// THIS CODE WORKED IN SEEDING THE DATA
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed process...");

  // Create Business
  console.log("📋 Creating business...");
  const business = await prisma.business.create({
    data: {
      name: "SparkleClean Professional Services",
      slug: "sparkle-clean",
      email: "hello@sparkleclean.com",
      phone: "+1-555-CLEAN-01",
      address: "123 Main Street, Downtown, NY 10001",
      description:
        "Professional residential and commercial cleaning services with eco-friendly products and experienced staff.",
      logo: "https://example.com/logos/sparkle-clean.png",
      isActive: true,
      businessHours: {
        monday: ["08:00", "18:00"],
        tuesday: ["08:00", "18:00"],
        wednesday: ["08:00", "18:00"],
        thursday: ["08:00", "18:00"],
        friday: ["08:00", "18:00"],
        saturday: ["09:00", "16:00"],
        sunday: null, // closed
      },
      bookingSettings: {
        minLeadTimeHours: 24,
        maxAdvanceBookingDays: 90,
        allowSameDayBooking: false,
        requirePhoneNumber: true,
        autoConfirmBookings: false,
        cancellationPolicy: "24 hours notice required for cancellation",
      },
    },
  });

  // Create Admin User
  console.log("👤 Creating admin user...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah@sparkleclean.com",
      emailVerified: new Date(),
      phone: "+1-555-ADMIN-1",
      password: await bcrypt.hash("admin123", 12),
      role: "ADMIN",
      businessId: business.id,
      isActive: true,
    },
  });

  // Create Staff User
  console.log("👥 Creating staff user...");
  const staffUser = await prisma.user.create({
    data: {
      name: "Mike Rodriguez",
      email: "mike@sparkleclean.com",
      emailVerified: new Date(),
      phone: "+1-555-STAFF-1",
      password: await bcrypt.hash("staff123", 12),
      role: "STAFF",
      businessId: business.id,
      isActive: true,
    },
  });

  // Create Customer User (for one of the bookings)
  console.log("🏠 Creating customer user...");
  const customerUser = await prisma.user.create({
    data: {
      name: "Jennifer Smith",
      email: "jennifer.smith@email.com",
      emailVerified: new Date(),
      phone: "+1-555-CUST-01",
      role: "CUSTOMER",
      isActive: true,
    },
  });

  // Create Services
  console.log("🧽 Creating services...");
  const basicCleaning = await prisma.service.create({
    data: {
      businessId: business.id,
      name: "Basic House Cleaning",
      description:
        "Standard cleaning service including dusting, vacuuming, mopping, bathroom and kitchen cleaning. Perfect for regular maintenance.",
      price: 120.0,
      duration: 120, // 2 hours
      isActive: true,
    },
  });

  const deepCleaning = await prisma.service.create({
    data: {
      businessId: business.id,
      name: "Deep Cleaning Service",
      description:
        "Comprehensive deep cleaning including baseboards, inside appliances, detailed bathroom scrubbing, and thorough kitchen cleaning.",
      price: 200.0,
      duration: 240, // 4 hours
      isActive: true,
    },
  });

  const officeCleaning = await prisma.service.create({
    data: {
      businessId: business.id,
      name: "Office Space Cleaning",
      description:
        "Professional office cleaning including desk sanitization, floor cleaning, restroom maintenance, and common area tidying.",
      price: 150.0,
      duration: 180, // 3 hours
      isActive: true,
    },
  });

  // Create Bookings
  console.log("📅 Creating bookings...");

  // Booking 1 - Confirmed booking with registered user
  const booking1 = await prisma.booking.create({
    data: {
      businessId: business.id,
      serviceId: basicCleaning.id,
      serviceName: basicCleaning.name,
      servicePrice: basicCleaning.price,
      serviceDuration: basicCleaning.duration,
      customerName: customerUser.name!,
      customerEmail: customerUser.email!,
      customerPhone: customerUser.phone!,
      customerAddress: "456 Oak Avenue, Residential District, NY 10002",
      appointmentDate: new Date("2024-12-15"),
      appointmentTime: "09:00",
      duration: basicCleaning.duration,
      totalPrice: basicCleaning.price,
      notes:
        "Please focus extra attention on the kitchen. Two cats in the house.",
      status: "CONFIRMED",
      userId: customerUser.id,
      reminderSent: false,
    },
  });

  // Booking 2 - Pending booking (guest customer)
  const booking2 = await prisma.booking.create({
    data: {
      businessId: business.id,
      serviceId: deepCleaning.id,
      serviceName: deepCleaning.name,
      servicePrice: deepCleaning.price,
      serviceDuration: deepCleaning.duration,
      customerName: "Robert Johnson",
      customerEmail: "robert.johnson@email.com",
      customerPhone: "+1-555-CUST-02",
      customerAddress: "789 Pine Street, Uptown, NY 10003",
      appointmentDate: new Date("2024-12-18"),
      appointmentTime: "14:00",
      duration: deepCleaning.duration,
      totalPrice: deepCleaning.price,
      notes:
        "Move-in cleaning for new apartment. All rooms need deep cleaning.",
      status: "PENDING",
      userId: null, // guest booking
      reminderSent: false,
    },
  });

  // Booking 3 - Completed booking
  const booking3 = await prisma.booking.create({
    data: {
      businessId: business.id,
      serviceId: officeCleaning.id,
      serviceName: officeCleaning.name,
      servicePrice: officeCleaning.price,
      serviceDuration: officeCleaning.duration,
      customerName: "Downtown Legal Associates",
      customerEmail: "office@legalassoc.com",
      customerPhone: "+1-555-OFFICE-1",
      customerAddress: "321 Business Plaza, Suite 500, NY 10004",
      appointmentDate: new Date("2024-12-10"),
      appointmentTime: "18:00",
      duration: officeCleaning.duration,
      totalPrice: officeCleaning.price,
      notes: "Weekly office cleaning. Key is available at reception desk.",
      status: "COMPLETED",
      userId: null,
      reminderSent: true,
      completedAt: new Date("2024-12-10T21:00:00Z"),
    },
  });

  // Create Account records for OAuth compatibility (optional but good for testing)
  console.log("🔐 Creating account records...");
  await prisma.account.create({
    data: {
      userId: adminUser.id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: adminUser.id,
    },
  });

  await prisma.account.create({
    data: {
      userId: customerUser.id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: customerUser.id,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("\n📊 Created:");
  console.log(`  • 1 Business: ${business.name}`);
  console.log(`  • 3 Users: 1 Admin, 1 Staff, 1 Customer`);
  console.log(
    `  • 3 Services: Basic Cleaning ($${basicCleaning.price}), Deep Cleaning ($${deepCleaning.price}), Office Cleaning ($${officeCleaning.price})`
  );
  console.log(`  • 3 Bookings: 1 Confirmed, 1 Pending, 1 Completed`);
  console.log(`  • 2 Account records for auth compatibility`);

  console.log("\n🔑 Test Credentials:");
  console.log(`  Admin: sarah@sparkleclean.com / admin123`);
  console.log(`  Staff: mike@sparkleclean.com / staff123`);
  console.log(`  Customer: jennifer.smith@email.com / (no password set)`);

  console.log(`\n🌐 Business slug: ${business.slug}`);
  console.log(`📋 Booking confirmation codes:`);
  console.log(`  • ${booking1.confirmationCode} (Confirmed)`);
  console.log(`  • ${booking2.confirmationCode} (Pending)`);
  console.log(`  • ${booking3.confirmationCode} (Completed)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  

// // THIS CODE DID NOT WORK WHEN SEEDING THE DATA, AND RESULTED IN THE ERROR PROVIDED

// import { PrismaClient, Role, BookingStatus } from "@prisma/client";
// import bcrypt from "bcryptjs";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Starting database seed...");

//   // Clear existing data (in development only)
//   if (process.env.NODE_ENV === "development") {
//     console.log("🗑️  Clearing existing data...");
//     await prisma.$transaction([
//       prisma.booking.deleteMany(),
//       prisma.service.deleteMany(),
//       prisma.user.deleteMany(),
//       prisma.business.deleteMany(),
//       prisma.account.deleteMany(),
//       prisma.session.deleteMany(),
//       prisma.verificationToken.deleteMany(),
//     ]);
//   }

//   // Create sample business first (users will be linked to it)
//   console.log("🏢 Creating sample business...");
//   const business = await prisma.business.create({
//     data: {
//       name: "CleanPro Home Services",
//       slug: "cleanpro-home-services",
//       email: "info@cleanpro.com",
//       phone: "+254700123456",
//       address: "Westlands, Nairobi, Kenya",
//       description: "Professional home and office cleaning services in Nairobi",
//       isActive: true,
//       businessHours: {
//         monday: { open: "08:00", close: "18:00" },
//         tuesday: { open: "08:00", close: "18:00" },
//         wednesday: { open: "08:00", close: "18:00" },
//         thursday: { open: "08:00", close: "18:00" },
//         friday: { open: "08:00", close: "18:00" },
//         saturday: { open: "09:00", close: "16:00" },
//         sunday: { closed: true },
//       },
//       bookingSettings: {
//         maxAdvanceDays: 30,
//         minAdvanceHours: 2,
//         slotDuration: 60,
//         bufferTime: 15,
//         workingDays: [
//           "monday",
//           "tuesday",
//           "wednesday",
//           "thursday",
//           "friday",
//           "saturday",
//         ],
//         timeSlots: [
//           "08:00",
//           "09:00",
//           "10:00",
//           "11:00",
//           "12:00",
//           "13:00",
//           "14:00",
//           "15:00",
//           "16:00",
//           "17:00",
//         ],
//       },
//     },
//   });

//   // Create admin user linked to business
//   console.log("👤 Creating admin user...");
//   const hashedPassword = await bcrypt.hash("admin123", 12);
//   const adminUser = await prisma.user.create({
//     data: {
//       name: "Admin User",
//       email: "admin@bookingsystem.com",
//       password: hashedPassword,
//       role: Role.ADMIN,
//       phone: "+254700000000",
//       businessId: business.id, // Link to business
//     },
//   });

//   // Create staff user linked to business
//   console.log("👥 Creating staff user...");
//   const staffPassword = await bcrypt.hash("staff123", 12);
//   const staffUser = await prisma.user.create({
//     data: {
//       name: "Staff Member",
//       email: "staff@bookingsystem.com",
//       password: staffPassword,
//       role: Role.STAFF,
//       phone: "+254700000001",
//       businessId: business.id, // Link to business
//     },
//   });

//   // Create services
//   console.log("🧹 Creating services...");
//   const services = await Promise.all([
//     prisma.service.create({
//       data: {
//         businessId: business.id,
//         name: "Basic House Cleaning",
//         description: "Standard cleaning service for homes up to 3 bedrooms",
//         price: 3500.0,
//         duration: 120, // 2 hours
//         isActive: true,
//       },
//     }),
//     prisma.service.create({
//       data: {
//         businessId: business.id,
//         name: "Deep House Cleaning",
//         description:
//           "Comprehensive deep cleaning including bathrooms, kitchen, and all rooms",
//         price: 6000.0,
//         duration: 240, // 4 hours
//         isActive: true,
//       },
//     }),
//     prisma.service.create({
//       data: {
//         businessId: business.id,
//         name: "Office Cleaning",
//         description: "Professional office cleaning for small to medium offices",
//         price: 4500.0,
//         duration: 180, // 3 hours
//         isActive: true,
//       },
//     }),
//     prisma.service.create({
//       data: {
//         businessId: business.id,
//         name: "Post-Construction Cleanup",
//         description:
//           "Specialized cleaning after renovation or construction work",
//         price: 8000.0,
//         duration: 360, // 6 hours
//         isActive: true,
//       },
//     }),
//     prisma.service.create({
//       data: {
//         businessId: business.id,
//         name: "Carpet & Upholstery Cleaning",
//         description: "Professional carpet and furniture cleaning service",
//         price: 2500.0,
//         duration: 90, // 1.5 hours
//         isActive: true,
//       },
//     }),
//   ]);

//   // Create sample bookings
//   console.log("📅 Creating sample bookings...");
//   const now = new Date();
//   const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
//   const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
//   const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

//   await Promise.all([
//     // Pending booking for tomorrow
//     prisma.booking.create({
//       data: {
//         businessId: business.id,
//         serviceId: services[0].id,
//         serviceName: services[0].name, // Add denormalized fields
//         servicePrice: services[0].price,
//         serviceDuration: services[0].duration,
//         customerName: "John Doe",
//         customerEmail: "john.doe@email.com",
//         customerPhone: "+254712345678",
//         customerAddress: "Karen, Nairobi",
//         appointmentDate: tomorrow,
//         appointmentTime: "10:00",
//         duration: services[0].duration,
//         totalPrice: services[0].price,
//         notes: "Please focus on the kitchen and living room",
//         status: BookingStatus.PENDING,
//       },
//     }),
//     // Confirmed booking for next week
//     prisma.booking.create({
//       data: {
//         businessId: business.id,
//         serviceId: services[1].id,
//         serviceName: services[1].name, // Add denormalized fields
//         servicePrice: services[1].price,
//         serviceDuration: services[1].duration,
//         customerName: "Jane Smith",
//         customerEmail: "jane.smith@email.com",
//         customerPhone: "+254723456789",
//         customerAddress: "Westlands, Nairobi",
//         appointmentDate: nextWeek,
//         appointmentTime: "09:00",
//         duration: services[1].duration,
//         totalPrice: services[1].price,
//         notes: "Deep clean needed for moving out",
//         status: BookingStatus.CONFIRMED,
//       },
//     }),
//     // Completed booking from last week
//     prisma.booking.create({
//       data: {
//         businessId: business.id,
//         serviceId: services[2].id,
//         serviceName: services[2].name, // Add denormalized fields
//         servicePrice: services[2].price,
//         serviceDuration: services[2].duration,
//         customerName: "Mike Johnson",
//         customerEmail: "mike.johnson@email.com",
//         customerPhone: "+254734567890",
//         customerAddress: "CBD, Nairobi",
//         appointmentDate: lastWeek,
//         appointmentTime: "14:00",
//         duration: services[2].duration,
//         totalPrice: services[2].price,
//         status: BookingStatus.COMPLETED,
//         completedAt: new Date(
//           lastWeek.getTime() + services[2].duration * 60 * 1000
//         ),
//       },
//     }),
//     // Another pending booking
//     prisma.booking.create({
//       data: {
//         businessId: business.id,
//         serviceId: services[4].id,
//         serviceName: services[4].name, // Add denormalized fields
//         servicePrice: services[4].price,
//         serviceDuration: services[4].duration,
//         customerName: "Sarah Wilson",
//         customerEmail: "sarah.wilson@email.com",
//         customerPhone: "+254745678901",
//         customerAddress: "Kilimani, Nairobi",
//         appointmentDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
//         appointmentTime: "11:00",
//         duration: services[4].duration,
//         totalPrice: services[4].price,
//         notes: "Two sofas and dining room carpet",
//         status: BookingStatus.PENDING,
//       },
//     }),
//   ]);

//   console.log("✅ Database seeded successfully!");
//   console.log("\n📊 Seeded data summary:");
//   console.log(`👤 Users: 2 (1 admin, 1 staff)`);
//   console.log(`🏢 Businesses: 1`);
//   console.log(`🧹 Services: ${services.length}`);
//   console.log(`📅 Bookings: 4`);
//   console.log("\n🔑 Login credentials:");
//   console.log("Admin: admin@bookingsystem.com / admin123");
//   console.log("Staff: staff@bookingsystem.com / staff123");
//   console.log(
//     "\n🌐 Business URL: http://localhost:3000/book/cleanpro-home-services"
//   );
// }

// main()
//   .catch((e) => {
//     console.error("❌ Error during database seed:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
