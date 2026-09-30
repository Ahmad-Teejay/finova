import mongoose,{ Schema, Document } from "mongoose";

export interface IUser extends Document{
    fullName: string,
    username: string,
    email: string,
    password: string,
    phone: string,
    accountNumber: string,
    transactionPinHash: string | null,
    isVerified: boolean,
    isAdmin: boolean,
}

const userSchema =  new Schema<IUser>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

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

        transactionPinHash: {
            type: String,
            default: null,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        accountNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
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