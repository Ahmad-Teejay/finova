import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface AuthTokenPayload extends jwt.JwtPayload {
    userId: string,
    email: string,
}

export async function getCurrentUser(){
    const cookieStore =  await cookies();

    const token = cookieStore.get("token")?.value;

    if(!token){
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)

        if(typeof decoded === "string"){
            return null;
        }

        const payload = decoded as AuthTokenPayload;

        return payload;
    } catch (error) {
        console.error("Token verification failed", error)
        return null
    }
}