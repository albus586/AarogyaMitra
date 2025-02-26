import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import User from '@/schema/user';
import connectToDatabase from '@/lib/mongodb';

export async function POST(request: Request) {
    const { 
        name, email, password, confirmPassword, userType,
        age, phoneNo, bp, weight, heartRate,
        medicalHistory, allergies, reasonForVisit
    } = await request.json();

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    if (!name || !email || !password || !confirmPassword || !userType) {
        return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
        return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }
    if (confirmPassword !== password) {
        return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }
    if (password.length < 6) {
        return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 });
    }

    try {
        await connectToDatabase();
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            name,
            password: hashedPassword,
            userType,
            age,
            phoneNo,
            bp,
            weight,
            heartRate,
            medicalHistory,
            allergies,
            reasonForVisit
        });
        await newUser.save();
        
        // Return user data needed for auto sign-in
        return NextResponse.json({ 
            message: "User created", 
            user: {
                email,
                name,
                userType
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}