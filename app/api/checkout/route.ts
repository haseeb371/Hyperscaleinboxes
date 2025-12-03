import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import CheckoutSession from '@/lib/models/CheckoutSession';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

// Stripe Price ID
const STRIPE_PRICE_ID = 'price_1SZcbRLuri6v0Ok6uWQdtTg8';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData, accountNames } = body;

    // Calculate quantity (number of domains)
    const quantity = parseInt(formData.numberOfDomains) || 1;

    // Check if customer with this email already exists
    let customerId: string | null = null;
    
    try {
      const existingCustomers = await stripe.customers.list({
        email: formData.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        // Customer exists, use existing customer ID
        customerId = existingCustomers.data[0].id;
        console.log('Using existing customer:', customerId);
      } else {
        // Create new customer
        const newCustomer = await stripe.customers.create({
          email: formData.email,
          name: formData.name,
          phone: formData.phone || undefined,
          metadata: {
            companyName: formData.companyName || '',
          },
        });
        customerId = newCustomer.id;
        console.log('Created new customer:', customerId);
      }
    } catch (error: any) {
      console.error('Error checking/creating customer:', error);
      // Continue without customer ID - Stripe will create one from email
    }

    // Create line items using the price ID
    const lineItems = [
      {
        price: STRIPE_PRICE_ID,
        quantity: quantity,
      },
    ];

    // Prepare metadata (keep it under 500 characters per value)
    // Store only essential info, accountNames will be stored separately if needed
    const metadata: Record<string, string> = {
      customerName: formData.name || '',
      customerEmail: formData.email || '',
      customerPhone: formData.phone || '',
      companyName: formData.companyName || '',
      packageType: formData.packageType || '',
      numberOfDomains: formData.numberOfDomains || '1',
    };

    // Add domains (truncate if too long)
    if (formData.packageType === 'byod' && formData.customDomains?.length > 0) {
      const domains = formData.customDomains.join(', ');
      metadata.customDomains = domains.length > 400 ? domains.substring(0, 400) + '...' : domains;
    } else if (formData.selectedDomains?.length > 0) {
      const domains = formData.selectedDomains.join(', ');
      metadata.selectedDomains = domains.length > 400 ? domains.substring(0, 400) + '...' : domains;
    }

    // Add other fields if they fit
    if (formData.website && formData.website.length < 200) {
      metadata.website = formData.website;
    }
    if (formData.dnsProvider && formData.dnsProvider.length < 100) {
      metadata.dnsProvider = formData.dnsProvider;
    }
    if (formData.providerEmail && formData.providerEmail.length < 200) {
      metadata.providerEmail = formData.providerEmail;
    }

    // Note: accountNames is too large for metadata, you'll need to store it in your database
    // when the webhook is received, or use a different approach

    // Create checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription', // Changed to subscription mode for recurring price
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin')}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin')}/order-form`,
      metadata: metadata,
    };

    // Use existing customer ID if found, otherwise use email (Stripe will create customer)
    if (customerId) {
      sessionConfig.customer = customerId;
    } else {
      sessionConfig.customer_email = formData.email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Store accountNames temporarily in MongoDB (will be retrieved in webhook)
    if (accountNames && accountNames.length > 0) {
      try {
        await connectDB();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Expire after 24 hours

        await CheckoutSession.create({
          sessionId: session.id,
          accountNames: JSON.stringify(accountNames),
          expiresAt: expiresAt,
        });
        console.log('Account names stored temporarily for session:', session.id);
      } catch (dbError: any) {
        console.error('Error storing account names:', dbError);
        // Don't fail the checkout if storage fails
      }
    }

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      accountNamesCount: accountNames?.length || 0
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

