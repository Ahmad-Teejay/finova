import mongoose,{ Schema, Document} from 'mongoose';

export interface IWallet extends Document {
   user: mongoose.Types.ObjectId;
   balance: number;
   currency: string;
}

const walletSchema = new Schema<IWallet>(
    {
        user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        trim: true,
    },

    balance: {
        type: Number,
        default: 0,
        min: 0,
    },

    currency: {
        type: String,
        default: "NGN",
        uppercase: true,
    },

  },

  {
    timestamps: true,
  }
    
);
const Wallet = mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", walletSchema)

export default Wallet;