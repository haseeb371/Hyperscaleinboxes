import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  // Order ID is the Stripe session ID (unique identifier)
  orderId: string; // Stripe checkout session ID
  stripeSessionId: string; // Same as orderId, for clarity
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  
  // Customer Information
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  website?: string;
  
  // Order Details
  packageType: 'byod' | 'full';
  numberOfDomains: number;
  quantity: number; // Number of domains (for subscription quantity)
  accountsPerDomain: number; // Fixed at 50 accounts per domain
  totalAccounts: number; // Calculated: numberOfDomains * accountsPerDomain
  amountTotal: number; // Total amount in cents
  amountCharged: number; // Actual amount charged (same as amountTotal for now)
  currency: string;
  pricePerDomain: number; // Price per domain in cents
  
  // Domain Information
  customDomains?: string[];
  selectedDomains?: string[];
  dnsProvider?: string;
  providerEmail?: string;
  // Note: We don't store passwords for security
  
  // Account Names (stored as JSON string due to size)
  accountNames?: string; // JSON stringified array of account names
  
  // Additional Information
  additionalRequirements?: string;
  
  // Order Status & Progress
  status: 'in-review' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'on-hold';
  progressStatus: string; // Human-readable status like "Domain setup in progress"
  progressPercentage: number; // 0-100 percentage of completion
  
  // Future fields for order management
  assignedTo?: string; // Staff member assigned to process this order
  notes?: string; // Internal notes about the order
  estimatedCompletionDate?: Date; // When the order is expected to be completed
  actualCompletionDate?: Date; // When the order was actually completed
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // Order priority
  tags?: string[]; // Tags for categorization/filtering
  
  // Payment & Subscription Info
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  nextBillingDate?: Date; // Next subscription billing date
  lastPaymentDate?: Date; // Last successful payment date
  
  // Service Delivery
  emailAccountsCreated?: number; // Number of email accounts actually created
  domainsConfigured?: number; // Number of domains actually configured
  serviceStartDate?: Date; // When service actually started
  serviceEndDate?: Date; // When service ends (if applicable)
  
  // Support & Communication
  supportTickets?: string[]; // Array of support ticket IDs
  lastContactDate?: Date; // Last time customer was contacted
  communicationLog?: string; // Log of communications with customer
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true, // Index for fast lookups
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
      index: true,
    },
    customerPhone: String,
    companyName: String,
    website: String,
    packageType: {
      type: String,
      enum: ['byod', 'full'],
      required: true,
    },
    numberOfDomains: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    accountsPerDomain: {
      type: Number,
      default: 50, // Fixed at 50 accounts per domain
    },
    totalAccounts: {
      type: Number,
      required: true,
    },
    amountTotal: {
      type: Number,
      required: true,
    },
    amountCharged: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    pricePerDomain: {
      type: Number,
      required: true,
    },
    customDomains: [String],
    selectedDomains: [String],
    dnsProvider: String,
    providerEmail: String,
    accountNames: String, // Store as JSON string
    additionalRequirements: String,
    status: {
      type: String,
      enum: ['in-review', 'processing', 'completed', 'failed', 'cancelled', 'on-hold'],
      default: 'in-review',
    },
    progressStatus: {
      type: String,
      default: 'Order received and under review',
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    assignedTo: String,
    notes: String,
    estimatedCompletionDate: Date,
    actualCompletionDate: Date,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    tags: [String],
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'paid',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing'],
    },
    nextBillingDate: Date,
    lastPaymentDate: Date,
    emailAccountsCreated: {
      type: Number,
      default: 0,
    },
    domainsConfigured: {
      type: Number,
      default: 0,
    },
    serviceStartDate: Date,
    serviceEndDate: Date,
    supportTickets: [String],
    lastContactDate: Date,
    communicationLog: String,
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Prevent model recompilation in development
const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

