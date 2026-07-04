import "./config/env.js";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import User from "./models/User.js";
import Table from "./models/Table.js";

const seed = async () => {
  await connectDB();

  // Seed admin (skip if one already exists with this email)
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@restaurant.com').toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Admin User',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin'
    });
    console.log(`Admin created: ${adminEmail}`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  // Seed a fixed set of tables (skip if tables already exist)
  const tableCount = await Table.countDocuments();
  if (tableCount === 0) {
    await Table.insertMany([
      { tableNumber: 1, capacity: 2 },
      { tableNumber: 2, capacity: 2 },
      { tableNumber: 3, capacity: 4 },
      { tableNumber: 4, capacity: 4 },
      { tableNumber: 5, capacity: 6 },
      { tableNumber: 6, capacity: 8 }
    ]);
    console.log('6 sample tables created.');
  } else {
    console.log('Tables already exist, skipping.');
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
