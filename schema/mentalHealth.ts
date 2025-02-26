import mongoose, { Schema, model, models } from 'mongoose';

interface IMentalHealth {
    userId: string;
    timestamp: Date;
    mentalFitnessScore: number;
    formData: {
        gender: string;
        occupation: string;
        moodSwings: string;
        changesHabits: string;
        workInterest: string;
        socialWeakness: string;
    };
    voiceAnalysis?: {
        Smoothness: string;
        Control: string;
        Liveliness: string;
        Energy_range: string;
        Clarity: string;
        Crispness: string;
        Speech: string;
        Pause: string;
    };
}

const mentalHealthSchema = new Schema<IMentalHealth>({
    userId: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    mentalFitnessScore: {
        type: Number,
        required: true
    },
    formData: {
        gender: String,
        occupation: String,
        moodSwings: String,
        changesHabits: String,
        workInterest: String,
        socialWeakness: String
    },
    voiceAnalysis: {
        Smoothness: String,
        Control: String,
        Liveliness: String,
        Energy_range: String,
        Clarity: String,
        Crispness: String,
        Speech: String,
        Pause: String
    }
});

export const MentalHealth = models.MentalHealth || model('MentalHealth', mentalHealthSchema);
