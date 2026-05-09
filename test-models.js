// test-models.js
require('dotenv').config();
const connectDB = require('./src/config/database');
const User = require('./src/models/User');
const Ground = require('./src/models/Ground');
const Booking = require('./src/models/Booking');

async function testModels() {
    try {
        await connectDB();
        console.log('✅ Database connected\n');

        // Test 1: Create a test user
        console.log('Testing User model...');
        const testUser = await User.create({
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword123',
            role: 'player'
        });
        console.log('✅ User created:', testUser._id);

        // Test 2: Query the user
        const foundUser = await User.findById(testUser._id);
        console.log('✅ User found:', foundUser.name);

        // Test 3: Check existing grounds
        const grounds = await Ground.find().limit(5);
        console.log(`✅ Found ${grounds.length} grounds in database`);

        // Test 4: Check existing bookings
        const bookings = await Booking.find().limit(5);
        console.log(`✅ Found ${bookings.length} bookings in database`);

        console.log('\n✅ All model tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testModels();
