import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Section from '../models/Section.js';
import EmbeddingService from '../services/embeddingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

async function processLaw(lawName) {
    const lawDir = path.join(DATA_DIR, lawName);
    const outPath = path.join(lawDir, 'embeddings.json');

    // Fetch sorted sections from DB
    const data = await Section.find({ law: lawName }).sort({ order: 1 });

    if (data.length === 0) {
        console.warn(`No sections found in DB for: ${lawName}`);
        return;
    }

    console.log(`Processing ${lawName} (${data.length} items from DB)...`);

    const embeddings = [];
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const text = `Section ${item.section} ${item.title} ${item.description}`;
        const embedding = await EmbeddingService.getEmbedding(text);
        embeddings.push(embedding);
        if (i % 10 === 0) process.stdout.write('.');
    }
    console.log('\nDone.');

    if (!fs.existsSync(lawDir)) {
        fs.mkdirSync(lawDir, { recursive: true });
    }
    fs.writeFileSync(outPath, JSON.stringify(embeddings));
    console.log(`Saved embeddings to ${outPath}`);
}

async function main() {
    await connectDB();

    if (!fs.existsSync(DATA_DIR)) {
        console.error(`Data directory not found: ${DATA_DIR}`);
        process.exit(1);
    }

    // We can still iterate directories to know which laws to process, 
    // or query distinct laws from DB. Iterating dirs is safer for structure.
    const laws = fs.readdirSync(DATA_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const law of laws) {
        await processLaw(law);
    }

    console.log("All embeddings generated.");
    process.exit();
}

main();
