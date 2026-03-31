/**
 * testConnection.js
 * Run this to verify MongoDB is connected and data is seeded.
 * Usage: node scripts/testConnection.js
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Section from '../models/Section.js';
import User from '../models/User.js';
import ChatHistory from '../models/ChatHistory.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/legal-search';

async function testConnection() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🔌 Law Mate — MongoDB Connection Test');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📍 Connecting to: ${MONGO_URI}\n`);

    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
        console.log('✅ MongoDB CONNECTED successfully!\n');

        // Count documents in each collection
        const sectionCount   = await Section.countDocuments();
        const userCount      = await User.countDocuments();
        const chatCount      = await ChatHistory.countDocuments();

        console.log('📊 Database Collections:');
        console.log(`   sections       : ${sectionCount} documents`);
        console.log(`   users          : ${userCount} documents`);
        console.log(`   chathistories  : ${chatCount} documents`);

        // Show law breakdown
        if (sectionCount > 0) {
            console.log('\n📚 Sections by Law:');
            const laws = ['ipc', 'crpc', 'cpc', 'iea', 'mv_act', 'hma', 'ida', 'nia'];
            for (const law of laws) {
                const count = await Section.countDocuments({ law });
                const bar = '█'.repeat(Math.floor(count / 20));
                console.log(`   ${law.padEnd(8)}: ${String(count).padStart(4)} sections  ${bar}`);
            }

            // Show a sample section
            console.log('\n🔍 Sample section from IPC:');
            const sample = await Section.findOne({ law: 'ipc' });
            if (sample) {
                console.log(`   Section ${sample.section}: ${sample.title}`);
                console.log(`   "${sample.description.substring(0, 100)}..."`);
            }
        } else {
            console.log('\n⚠️  No sections found — server will auto-seed on next npm start');
        }

        console.log('\n✅ All good! Your MongoDB is connected and ready.\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (err) {
        console.error('❌ CONNECTION FAILED:', err.message);
        console.error('\n🔧 How to fix:');
        console.error('   1. Open Command Prompt as Administrator');
        console.error('   2. Run: net start MongoDB');
        console.error('   3. Then run this script again\n');
        console.error('   Or if using Atlas, check your MONGO_URI in server/.env\n');
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testConnection();
