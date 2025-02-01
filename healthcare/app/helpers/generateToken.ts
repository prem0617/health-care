import jwt from "jsonwebtoken";

export interface Payload {
  name: string;
  email: string;
}

export const generateToken = (payload: Payload) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET!;

    const token = jwt.sign(payload, JWT_SECRET);

    return token;
  } catch (error) {
    console.log(error);
  }
};
