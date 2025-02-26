import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

if (!twilioAccountSid || !twilioAuthToken) {
  throw new Error('Twilio credentials are not set in environment variables');
}

const client = twilio(twilioAccountSid, twilioAuthToken);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMobileNumber = `+91${body.to}`;
    
    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      body: body.message,
      to: `whatsapp:${userMobileNumber}`
    });

    return NextResponse.json({ 
      success: true,
      sid: message.sid 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error sending health alert:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
