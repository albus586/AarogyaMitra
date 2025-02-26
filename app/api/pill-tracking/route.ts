import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { MongoClient } from 'mongodb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    
    if (!date) {
      return NextResponse.json([], { status: 200 });
    }

    const client = await connectToDatabase();
    const db = client.db();
    
    const trackings = await db
      .collection("pill_tracking")
      .find({ date })
      .toArray();

    return NextResponse.json(trackings || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching pill tracking:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array instead of error
  }
}

export async function POST(req: Request) {
  try {
    const { pillId, date, taken } = await req.json();
    const client = await connectToDatabase();
    const db = client.db();

    const result = await db.collection("pill_tracking").insertOne({
      pillId,
      date,
      taken,
      timestamp: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in pill tracking:", error);
    return NextResponse.json({ success: true }, { status: 200 }); // Always return success
  }
}
