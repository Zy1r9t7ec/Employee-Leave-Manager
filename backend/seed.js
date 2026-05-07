require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const LeaveBalance = require('./models/LeaveBalance');

const seedUsers = [
  { name: 'Alice Employee', email: 'employee@company.com', password: 'password123', role: 'employee', department: 'Engineering' },
  { name: 'Bob Manager', email: 'manager@company.com', password: 'password123', role: 'manager', department: 'Engineering' },
  { name: 'Carol Admin', email: 'admin@company.com', password: 'password123', role: 'admin', department: 'Human Resources' }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const year = new Date().getFullYear();

  for (const userData of seedUsers) {
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create(userData);
      console.log(`Created user: ${user.email} [${user.role}]`);
    } else {
      console.log(`User exists: ${user.email} [${user.role}]`);
    }

    const existing = await LeaveBalance.findOne({ employeeId: user._id, year });
    if (!existing) {
      await LeaveBalance.create({
        employeeId: user._id,
        year,
        annual: { total: 20, used: 0 },
        sick: { total: 10, used: 0 },
        unpaid: { used: 0 }
      });
      console.log(`  -> Created leave balance for ${user.email}`);
    }
  }

  console.log('\nSeeding complete. Demo accounts:');
  console.log('  employee@company.com | password123  (Employee)');
  console.log('  manager@company.com  | password123  (Manager)');
  console.log('  admin@company.com    | password123  (HR Admin)');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
