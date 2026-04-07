import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Section from '../models/Section.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

async function migrateData() {
    await connectDB();

    if (!fs.existsSync(DATA_DIR)) {
        console.error(`Data directory not found: ${DATA_DIR}`);
        process.exit(1);
    }

    const laws = fs.readdirSync(DATA_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const law of laws) {
        const lawDir = path.join(DATA_DIR, law);
        const dataPath = path.join(lawDir, 'data.json');

        if (!fs.existsSync(dataPath)) {
            console.log(`Skipping ${law}: No data.json found`);
            continue;
        }

        console.log(`Migrating ${law}...`);
        const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        const sections = rawData.map((item, index) => ({
            law: law,
            section: item.section || item.Section || String(index + 1), // Fallback to index if section is missing
            title: item.title || item.section_title || 'Untitled',
            description: item.description || item.section_desc || 'No description available',
            order: index
        }));

        try {
            await Section.deleteMany({ law: law }); // Clear existing data for idempotency
            await Section.insertMany(sections);
            console.log(`✅ Imported ${sections.length} sections for ${law}`);
        } catch (error) {
            console.error(`❌ Error importing ${law}:`, error.message);
        }
    }

    console.log('Migration Complete.');
    process.exit();
}

migrateData();
