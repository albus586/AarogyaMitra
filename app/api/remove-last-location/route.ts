// app/api/remove-last-location/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Emergency from '@/schema/emergency';

export async function DELETE() {
  try {
    await connectToDatabase();
    
    // Find the most recent emergency record
    const lastEmergency = await Emergency.findOne().sort({ timestamp: -1 });

    if (!lastEmergency) {
      return NextResponse.json({ error: 'No emergency records found' }, { status: 404 });
    }

    // Delete the most recent record
    await Emergency.findByIdAndDelete(lastEmergency._id);

    // Find the new most recent record (previously second-last)
    const newLastEmergency = await Emergency.findOne().sort({ timestamp: -1 });

    if (!newLastEmergency) {
      return NextResponse.json({ message: 'Last location removed. No more locations available.' }, { status: 200 });
    }

    // Parse and return the new last location
    const [latitude, longitude] = newLastEmergency.location.split(',').map(Number);

    return NextResponse.json({
      message: 'Last location removed successfully',
      newLastLocation: {
        coordinates: {
          lat: latitude,
          lng: longitude
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error removing last location:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}