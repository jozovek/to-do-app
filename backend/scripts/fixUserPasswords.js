const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../.env' });

// Import User model
const User = require('../models/User');

async function fixUserPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users with missing or null passwords
    const usersWithoutPasswords = await User.find({
      $or: [
        { password: null },
        { password: undefined },
        { password: '' },
        { password: { $exists: false } }
      ]
    });

    console.log(`Found ${usersWithoutPasswords.length} users with missing passwords`);

    if (usersWithoutPasswords.length === 0) {
      console.log('No users need password fixes');
      return;
    }

    // List the problematic users
    usersWithoutPasswords.forEach(user => {
      console.log(`User: ${user.email} - Password field: ${user.password}`);
    });

    // Option 1: Delete these corrupted users (recommended for test data)
    console.log('\nOption 1: Delete corrupted users');
    console.log('This will remove users with missing passwords');

    // Option 2: Set a default password (not recommended for production)
    console.log('\nOption 2: Set default password "password123" for corrupted users');
    console.log('This is only for development/testing purposes');

    // For now, let's just report the issue
    console.log('\nTo fix this issue, you can:');
    console.log('1. Delete the corrupted users and re-register them');
    console.log('2. Set a temporary password for testing');
    console.log('\nRun this script with --fix flag to automatically delete corrupted users');

    if (process.argv.includes('--fix')) {
      console.log('\nDeleting corrupted users...');
      const result = await User.deleteMany({
        $or: [
          { password: null },
          { password: undefined },
          { password: '' },
          { password: { $exists: false } }
        ]
      });
      console.log(`Deleted ${result.deletedCount} corrupted users`);
    }

    if (process.argv.includes('--set-default-password')) {
      console.log('\nSetting default password for corrupted users...');
      const defaultPassword = 'password123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      for (const user of usersWithoutPasswords) {
        user.password = hashedPassword;
        await user.save();
        console.log(`Set default password for user: ${user.email}`);
      }
    }

  } catch (error) {
    console.error('Error fixing user passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixUserPasswords();
