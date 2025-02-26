import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';
import User from '@/schema/user';
import connectToDatabase from '@/lib/mongodb';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Extract location from request headers
        const location = request.headers.get('x-user-location') as string | null;

        // Assuming user schema has fields: name, age, phone
        const userDetails = {
            name: user.name,
            age: user.age,
            phone: user.phoneNo,
            userRole: user.userType,
        };

        return NextResponse.json(userDetails);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
