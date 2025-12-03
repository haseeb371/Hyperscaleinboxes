import mongoose, { Schema, Document, Model } from 'mongoose';

// Temporary storage for checkout session data (especially accountNames)
export interface ICheckoutSession extends Document {
  sessionId: string; // Stripe checkout session ID
  accountNames: string; // JSON stringified array of account names
  createdAt: Date;
  expiresAt: Date; // Auto-delete after 24 hours
}

const CheckoutSessionSchema: Schema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accountNames: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index - auto-delete expired documents
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const CheckoutSession: Model<ICheckoutSession> = 
  mongoose.models.CheckoutSession || 
  mongoose.model<ICheckoutSession>('CheckoutSession', CheckoutSessionSchema);

export default CheckoutSession;



