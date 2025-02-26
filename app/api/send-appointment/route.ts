// filepath: /C:/Users/Jayant/Desktop/Healthcare4/Chronix/app/api/send-appointment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectToDatabase from '@/lib/mongodb';

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

    // Add +91 to the start of the user's mobile number
    const userMobileNumber = `+91${body.to}`;

    // Send WhatsApp message
    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      body: body.message,
      to: `whatsapp:${userMobileNumber}`,
    });

    return NextResponse.json({ 
      sid: message.sid
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/send-appointment:', error);
    console.error('Error details:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}