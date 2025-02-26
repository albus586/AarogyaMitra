// app/api/get-location/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Emergency from '@/schema/emergency';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Find the most recent emergency record
    const emergency = await Emergency.findOne().sort({ timestamp: -1 });

    if (!emergency) {
      return NextResponse.json({ error: 'No emergency records found' }, { status: 404 });
    }

    // Parse the location string into coordinates
    const [latitude, longitude] = emergency.location.split(',').map(Number);

    return NextResponse.json({ 
      coordinates: {
        lat: latitude,
        lng: longitude
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching location:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}