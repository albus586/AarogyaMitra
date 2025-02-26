import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import { MentalHealth } from '@/schema/mentalHealth';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const data = await req.json();

        try {
            const mentalHealthRecord = await MentalHealth.create({
                userId: session.user.email,
                mentalFitnessScore: data.score,
                formData: data.formData,
                voiceAnalysis: data.voiceAnalysis || null
            });

            return NextResponse.json({ success: true, data: mentalHealthRecord });
        } catch (createError) {
            console.error('Error creating record:', createError);
            return NextResponse.json(
                { error: 'Failed to create mental health record' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Failed to save mental health data:', error);
        return NextResponse.json(
            { error: 'Failed to save mental health data' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        try {
            const records = await MentalHealth.find({
                userId: session.user.email
            }).sort({ timestamp: -1 }).lean();

            return NextResponse.json(records);
        } catch (findError) {
            console.error('Error finding records:', findError);
            return NextResponse.json(
                { error: 'Failed to retrieve mental health records' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Failed to fetch mental health records:', error);
        return NextResponse.json(
            { error: 'Failed to fetch mental health records' },
            { status: 500 }
        );
    }
}
