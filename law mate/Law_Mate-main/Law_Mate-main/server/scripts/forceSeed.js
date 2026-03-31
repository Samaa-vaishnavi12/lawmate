/**
 * forceSeed.js
 * Force wipes and re-seeds ALL law sections with correct field mapping.
 * Run: node scripts/forceSeed.js
 */

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Section from '../models/Section.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

function extractFields(item, index, law) {
    const section = String(item.section || item.Section || index + 1);
    const title   = item.title || item.section_title || item.chapter_title || 'Untitled';
    const description =
        item.description       ||
        item.section_desc      ||
        item.section_description ||
        item.desc              ||
        item.content           ||
        item.text              ||
        '';
    return {
        law,
        section,
        title,
        description: description.trim() || 'No description available',
        order: index
    };
}

async function forceSeed() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Law Mate — Force Seed All Law Data');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/legal-search');
        console.log('✅ MongoDB connected\n');

        const laws = fs.readdirSync(DATA_DIR, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

        for (const law of laws) {
            const dataPath = path.join(DATA_DIR, law, 'data.json');
            if (!fs.existsSync(dataPath)) {
                console.log(`⏭️  Skipping ${law}: no data.json`);
                continue;
            }

            const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
            const sections = rawData.map((item, i) => extractFields(item, i, law));

            // Count how many have real descriptions
            const withDesc = sections.filter(s => s.description !== 'No description available').length;
            console.log(`📂 ${law.toUpperCase()}: ${sections.length} sections, ${withDesc} have descriptions`);

            // Wipe existing data for this law
            await Section.deleteMany({ law });

            // Insert fresh
            await Section.insertMany(sections, { ordered: false });

            // Verify a sample
            const sample = await Section.findOne({ law, description: { $ne: 'No description available' } });
            if (sample) {
                console.log(`  ✅ Sample: Section ${sample.section} — "${sample.description.substring(0, 80)}..."`);
            } else {
                console.log(`  ⚠️  No section with real description found for ${law}!`);
            }
        }

        // Final count
        const total = await Section.countDocuments();
        const withDesc = await Section.countDocuments({ description: { $ne: 'No description available' } });
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`✅ Seed complete!`);
        console.log(`   Total sections : ${total}`);
        console.log(`   With real desc : ${withDesc}`);
        console.log(`   Missing desc   : ${total - withDesc}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

forceSeed();
