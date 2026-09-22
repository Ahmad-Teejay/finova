import mongoose,{ Schema, Document } from  'mongoose';

export interface ITransaction extends Document{
 user: mongoose.Types.ObjectId;
 type: "credit" | "debit";
 amount: number;
 description: string;
 status: "pending" | "success" | "failed";
 reference: string;
}

const transactionSchema = new Schema<ITransaction>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: ["credit", "debit"],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending",
        },

        reference: {
            type: String,
            required: true,
            unique: true,
        },
    },

    {
        timestamps: true,
    }
);


const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", transactionSchema)
export default Transaction;