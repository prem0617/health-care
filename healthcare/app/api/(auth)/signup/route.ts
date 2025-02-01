import { generateToken, Payload } from "@/app/helpers/generateToken";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // User saved

    const user = {
      name: data.name,
      email: data.email,
      password: data.password,
    };

    const payload: Payload = {
      name: user.name,
      email: user.email,
    };

    const token = generateToken(payload);

    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
};
