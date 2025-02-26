import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGO environment variable");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts)
            .then((mongoose) => {
                return mongoose;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
}

// Add User model schema
const UserSchema = new mongoose.Schema({
  email: String,
  // Add other user fields as needed
});

// Create User model if it doesn't exist
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    return user?.email || null;
  } catch (error) {
    console.error('Error fetching user email:', error);
    return null;
  }
}

export default connectToDatabase;