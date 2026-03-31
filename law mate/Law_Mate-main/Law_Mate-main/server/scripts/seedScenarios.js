/**
 * seedScenarios.js
 * Seeds scenario-based legal data into MongoDB
 * Run: node scripts/seedScenarios.js
 */
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Scenario from '../models/Scenario.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

async function seed() {
    console.log('\n📂 Seeding scenario data...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/legal-search');
    console.log('✅ Connected to MongoDB\n');

    const dataPath = path.join(__dirname, '../data/scenarios/data.json');
    const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    await Scenario.deleteMany({});
    console.log('🗑️  Cleared existing scenarios');

    for (const item of raw) {
        await Scenario.create({
            scenarioId:      item.id,
            title:           item.title,
            keywords:        item.keywords,
            category:        item.category,
            description:     item.description,
            applicable_laws: item.applicable_laws,
            steps:           item.steps,
            advice:          item.advice
        });
        console.log(`  ✅ ${item.id}: ${item.title}`);
    }

    console.log(`\n🎉 Seeded ${raw.length} scenarios successfully!\n`);
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => { console.error('❌', err.message); process.exit(1); });
