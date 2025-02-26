import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Doctor } from '@/schema/doctor';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const specialty = searchParams.get('specialty');
    const language = searchParams.get('language');
    const gender = searchParams.get('gender');
    
    // Build query
    let query: any = {};
    if (city) query.city = city;
    if (specialty) query.specialization = specialty;
    if (language) query.language = language;
    if (gender) query.gender = gender;

    const doctors = await Doctor.find(query);
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const doctor = await Doctor.create(data);
    return NextResponse.json(doctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    );
  }
}