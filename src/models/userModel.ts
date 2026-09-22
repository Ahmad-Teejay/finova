import mongoose,{ Schema, Document } from "mongoose";

export interface IUser extends Document{
    username: string,
    email: string,
    password: string,
    isVerified: boolean,
    isAdmin: boolean,
}

const userSchema =  new Schema<IUser>(
    {
        username: {
            type: String,
            required: [true, "username is required"],
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            required: [true, "email is required"],
            unique: true,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "password is required"],

        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isAdmin: {
            type: Boolean,
            default: false,
        }

    },
    {

        timestamps: true,
    }
)

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema)

export default User;