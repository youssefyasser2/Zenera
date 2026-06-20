// import { connectDB } from '../src/config/db.config';

// async function seed() {
//   await connectDB();
//   const count = await UserModel.countDocuments();
//   if (count === 0) {
//     await UserModel.create([
//       { email: 'admin@example.com', name: 'Admin', password: 'hashed_password' }
//     ]);
//     console.log('✅ Database seeded');
//   } else {
//     console.log('⚠️  Database already has data');
//   }
//   process.exit(0);
// }

// seed().catch(console.error);
