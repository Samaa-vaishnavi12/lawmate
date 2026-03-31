import mongoose from 'mongoose';

const scenarioSchema = new mongoose.Schema({
    scenarioId:   { type: String, required: true, unique: true },
    title:        { type: String, required: true },
    keywords:     [{ type: String }],
    category:     { type: String, required: true },
    description:  { type: String, required: true },
    applicable_laws: [{
        law:       String,
        section:   String,
        relevance: String
    }],
    steps:  [{ type: String }],
    advice: { type: String }
}, { timestamps: true });

// Text index for full-text search on title, description, keywords
scenarioSchema.index({ title: 'text', description: 'text', keywords: 'text', category: 'text' });

const Scenario = mongoose.model('Scenario', scenarioSchema);
export default Scenario;
