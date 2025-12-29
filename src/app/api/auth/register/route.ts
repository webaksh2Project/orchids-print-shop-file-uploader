import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, shopName } = await request.json();

    if (!email || !password || !shopName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const shopId = nanoid(10);

    const user = await User.create({
      email,
      password: hashedPassword,
      shopName,
      shopId,
    });

    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      shopId: user.shopId,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        shopName: user.shopName,
        shopId: user.shopId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
