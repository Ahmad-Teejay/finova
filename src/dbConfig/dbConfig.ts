import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if(!MONGODB_URI){
    throw new Error("Please define MongoDB_URI in .env.local");
    
}

export async function connect(){
    try {
        await mongoose.connect(MONGODB_URI!)
        console.log("MongoDB connected!");
        
    } catch (error) {
        console.log("MongoDB connection failed", error)
        throw new Error("Database connection failed");
        
    }
}


