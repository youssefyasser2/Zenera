import { connectDB } from '../src/config/db.config';
import { UserModel } from '../src/modules/user/user.model';

async function reset() {
  await connectDB();
  await UserModel.deleteMany({});
  console.log('✅ Database reset');
  process.exit(0);
}

reset().catch(console.error);
