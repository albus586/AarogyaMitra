// filepath: /C:/Users/Jayant/Desktop/Healthcare4/Chronix/app/api/send-whatsapp-message/route.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectToDatabase from '@/lib/mongodb';
import Emergency from '@/schema/emergency';

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

if (!twilioAccountSid || !twilioAuthToken) {
  throw new Error('Twilio credentials are not set in environment variables');
}

const client = twilio(twilioAccountSid, twilioAuthToken);

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Send WhatsApp message
    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      body: body.message,
      to: 'whatsapp:+918261961156',
    });

    // Parse the location from the message body
    const messageData = body.originalData; // Get the original data before stringification
    
    // Store emergency details in the database
    const emergency = new Emergency({
      name: messageData.name,
      age: messageData.age,
      phone: messageData.phone,
      location: `${messageData.latitude},${messageData.longitude}`, // Store location as string
    });
    
    await emergency.save();

    return NextResponse.json({ 
      sid: message.sid,
      emergencyId: emergency._id 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/send-whatsapp-message:', error);
    console.error('Error details:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}