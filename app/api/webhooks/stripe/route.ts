import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import CheckoutSession from '@/lib/models/CheckoutSession';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

// Route segment config for webhook
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Log received event for debugging
    console.log('Webhook event received:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString(),
    });

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('Processing checkout.session.completed:', {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          mode: session.mode,
          customerEmail: session.customer_email,
          hasMetadata: !!session.metadata,
        });
        
        // Extract metadata
        const metadata = session.metadata;
        
        if (!metadata) {
          console.error('No metadata found in checkout session:', {
            sessionId: session.id,
            sessionObject: JSON.stringify(session, null, 2),
          });
          // Return error so Stripe knows to retry
          return NextResponse.json(
            { error: 'No metadata found in checkout session' },
            { status: 400 }
          );
        }

        // Deduplication: Check if order already exists
        try {
          await connectDB();
          
          const existingOrder = await Order.findOne({ 
            orderId: session.id,
            stripeSessionId: session.id 
          });

          if (existingOrder) {
            console.log('Order already exists, skipping duplicate:', session.id);
            return NextResponse.json({ 
              received: true, 
              message: 'Order already processed (duplicate prevented)' 
            });
          }

          // Retrieve the full session with line items to get quantity
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items', 'subscription'],
          });

          // Get subscription ID if it's a subscription
          const subscriptionId = typeof fullSession.subscription === 'string' 
            ? fullSession.subscription 
            : fullSession.subscription?.id;

          // Get customer ID
          const customerId = typeof fullSession.customer === 'string'
            ? fullSession.customer
            : fullSession.customer?.id;

          // Parse domains from metadata
          const customDomains = metadata.customDomains 
            ? metadata.customDomains.split(', ').filter(d => d && d !== '...')
            : undefined;
          
          const selectedDomains = metadata.selectedDomains
            ? metadata.selectedDomains.split(', ').filter(d => d && d !== '...')
            : undefined;

          // Retrieve accountNames from temporary storage first
          let accountNames: string | undefined;
          try {
            const checkoutSession = await CheckoutSession.findOne({ sessionId: session.id });
            if (checkoutSession) {
              accountNames = checkoutSession.accountNames;
              // Delete the temporary storage after retrieving
              await CheckoutSession.deleteOne({ sessionId: session.id });
            }
          } catch (accountNamesError: any) {
            console.error('Error retrieving account names:', accountNamesError);
            // Continue without accountNames
          }

          // Calculate order details
          const numberOfDomains = parseInt(metadata.numberOfDomains || '1');
          const accountsPerDomain = 50; // Fixed at 50 accounts per domain
          const totalAccounts = numberOfDomains * accountsPerDomain;
          const quantity = fullSession.line_items?.data[0]?.quantity || numberOfDomains;
          const amountTotal = session.amount_total || 0;
          const amountCharged = amountTotal; // Same as total for now
          
          // Calculate price per domain
          const pricePerDomain = quantity > 0 ? Math.round(amountTotal / quantity) : 0;
          
          // Get subscription status if available
          let subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | undefined;
          if (subscriptionId) {
            try {
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);
              subscriptionStatus = subscription.status as any;
            } catch (subError) {
              console.error('Error retrieving subscription:', subError);
            }
          }

          // Create order document
          const orderData: any = {
            orderId: session.id, // Order ID is the Stripe session ID
            stripeSessionId: session.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            customerName: metadata.customerName || '',
            customerEmail: session.customer_email || metadata.customerEmail || '',
            customerPhone: metadata.customerPhone || undefined,
            companyName: metadata.companyName || undefined,
            website: metadata.website || undefined,
            packageType: metadata.packageType as 'byod' | 'full',
            numberOfDomains: numberOfDomains,
            quantity: quantity,
            accountsPerDomain: accountsPerDomain,
            totalAccounts: totalAccounts,
            amountTotal: amountTotal,
            amountCharged: amountCharged,
            currency: session.currency || 'usd',
            pricePerDomain: pricePerDomain,
            customDomains: customDomains,
            selectedDomains: selectedDomains,
            dnsProvider: metadata.dnsProvider || undefined,
            providerEmail: metadata.providerEmail || undefined,
            additionalRequirements: metadata.additionalRequirements || undefined,
            accountNames: accountNames, // Add accountNames if available
            status: 'in-review' as const, // Initial status is in-review
            progressStatus: 'Order received and under review',
            progressPercentage: 0, // Start at 0%
            paymentStatus: 'paid' as const, // Payment completed since webhook fired
            subscriptionStatus: subscriptionStatus,
            priority: 'normal' as const,
            emailAccountsCreated: 0, // Will be updated as accounts are created
            domainsConfigured: 0, // Will be updated as domains are configured
          };
          
          // Set last payment date
          if (session.payment_status === 'paid') {
            orderData.lastPaymentDate = new Date();
          }
          
          // Calculate next billing date for subscriptions
          if (subscriptionId) {
            try {
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);
              const periodEnd = (subscription as any).current_period_end;
              if (periodEnd && typeof periodEnd === 'number') {
                orderData.nextBillingDate = new Date(periodEnd * 1000);
              }
            } catch (subError) {
              console.error('Error retrieving subscription for billing date:', subError);
            }
          }

          // Save order to database
          const order = new Order(orderData);
          await order.save();

          console.log('Order saved successfully:', {
            orderId: session.id,
            customerEmail: session.customer_email,
            amountTotal: session.amount_total,
            hasAccountNames: !!accountNames,
          });

          // Here you can:
          // 1. Send confirmation email
          // 2. Process the order (create email accounts, etc.)
          // 3. Notify your team

        } catch (dbError: any) {
          console.error('Database error in checkout.session.completed:', {
            error: dbError.message,
            stack: dbError.stack,
            sessionId: session.id,
          });
          // Return error so Stripe knows to retry
          return NextResponse.json(
            { error: 'Database error processing order', details: dbError.message },
            { status: 500 }
          );
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        // Handle successful payment
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        // Handle failed payment
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`, {
          eventId: event.id,
          eventType: event.type,
        });
    }

    return NextResponse.json({ 
      received: true,
      eventType: event.type,
      eventId: event.id,
    });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

