import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import { LabTest } from '@/schema/labTest';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { diseaseId, answers, riskScore } = await req.json();

    await connectToDatabase();
    
    const labTest = new LabTest({
      userId: session.user.email,
      diseaseId,
      answers,
      riskScore
    });

    await labTest.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save lab test:', error);
    return NextResponse.json(
      { error: 'Failed to save lab test' },
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
    
    const tests = await LabTest.find({ userId: session.user.email })
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Failed to fetch lab tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab tests' },
      { status: 500 }
    );
  }
}
