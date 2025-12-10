// import { NextRequest, NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import connectDB from '@/lib/mongodb';
// import CheckoutSession from '@/lib/models/CheckoutSession';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-11-17.clover',
// });

// // Stripe Price ID
// const STRIPE_PRICE_ID = 'price_1SZcbRLuri6v0Ok6uWQdtTg8';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { formData, accountNames } = body;

//     // Calculate quantity (number of domains)
//     const quantity = parseInt(formData.numberOfDomains) || 1;

//     // Check if customer with this email already exists
//     let customerId: string | null = null;
    
//     try {
//       const existingCustomers = await stripe.customers.list({
//         email: formData.email,
//         limit: 1,
//       });

//       if (existingCustomers.data.length > 0) {
//         // Customer exists, use existing customer ID
//         customerId = existingCustomers.data[0].id;
//         console.log('Using existing customer:', customerId);
//       } else {
//         // Create new customer
//         const newCustomer = await stripe.customers.create({
//           email: formData.email,
//           name: formData.name,
//           phone: formData.phone || undefined,
//           metadata: {
//             companyName: formData.companyName || '',
//           },
//         });
//         customerId = newCustomer.id;
//         console.log('Created new customer:', customerId);
//       }
//     } catch (error: any) {
//       console.error('Error checking/creating customer:', error);
//       // Continue without customer ID - Stripe will create one from email
//     }

//     // Create line items using the price ID
//     const lineItems = [
//       {
//         price: STRIPE_PRICE_ID,
//         quantity: quantity,
//       },
//     ];

//     // Prepare metadata (keep it under 500 characters per value)
//     // Store only essential info, accountNames will be stored separately if needed
//     const metadata: Record<string, string> = {
//       customerName: formData.name || '',
//       customerEmail: formData.email || '',
//       customerPhone: formData.phone || '',
//       companyName: formData.companyName || '',
//       packageType: formData.packageType || '',
//       numberOfDomains: formData.numberOfDomains || '1',
//     };

//     // Add domains (truncate if too long)
//     if (formData.packageType === 'byod' && formData.customDomains?.length > 0) {
//       const domains = formData.customDomains.join(', ');
//       metadata.customDomains = domains.length > 400 ? domains.substring(0, 400) + '...' : domains;
//     } else if (formData.selectedDomains?.length > 0) {
//       const domains = formData.selectedDomains.join(', ');
//       metadata.selectedDomains = domains.length > 400 ? domains.substring(0, 400) + '...' : domains;
//     }

//     // Add other fields if they fit
//     if (formData.website && formData.website.length < 200) {
//       metadata.website = formData.website;
//     }
//     if (formData.dnsProvider && formData.dnsProvider.length < 100) {
//       metadata.dnsProvider = formData.dnsProvider;
//     }
//     if (formData.providerEmail && formData.providerEmail.length < 200) {
//       metadata.providerEmail = formData.providerEmail;
//     }

//     // Note: accountNames is too large for metadata, you'll need to store it in your database
//     // when the webhook is received, or use a different approach

//     // Create checkout session
//     const sessionConfig: Stripe.Checkout.SessionCreateParams = {
//       payment_method_types: ['card'],
//       line_items: lineItems,
//       mode: 'subscription', // Changed to subscription mode for recurring price
//       success_url: `${process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin')}/order-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin')}/order-form`,
//       metadata: metadata,
//     };

//     // Use existing customer ID if found, otherwise use email (Stripe will create customer)
//     if (customerId) {
//       sessionConfig.customer = customerId;
//     } else {
//       sessionConfig.customer_email = formData.email;
//     }

//     const session = await stripe.checkout.sessions.create(sessionConfig);

//     // Store accountNames temporarily in MongoDB (will be retrieved in webhook)
//     if (accountNames && accountNames.length > 0) {
//       try {
//         await connectDB();
//         const expiresAt = new Date();
//         expiresAt.setHours(expiresAt.getHours() + 24); // Expire after 24 hours

//         await CheckoutSession.create({
//           sessionId: session.id,
//           accountNames: JSON.stringify(accountNames),
//           expiresAt: expiresAt,
//         });
//         console.log('Account names stored temporarily for session:', session.id);
//       } catch (dbError: any) {
//         console.error('Error storing account names:', dbError);
//         // Don't fail the checkout if storage fails
//       }
//     }

//     return NextResponse.json({ 
//       sessionId: session.id, 
//       url: session.url,
//       accountNamesCount: accountNames?.length || 0
//     });
//   } catch (error: any) {
//     console.error('Stripe checkout error:', error);
//     return NextResponse.json(
//       { error: error.message || 'Failed to create checkout session' },
//       { status: 500 }
//     );
//   }
// }


// app/api/create-checkout-session/route.ts (or wherever your file is)
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import CheckoutSession from '@/lib/models/CheckoutSession';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

// Price IDs
const PRICE_IDS = {
  byod: process.env.STRIPE_PRICE_ID_BYOD,
  full: process.env.STRIPE_PRICE_ID_FULL,
} as const;

// Optional coupon from .env (can be empty or undefined → Stripe ignores it safely)
const DEFAULT_COUPON_ID = process.env.STRIPE_COUPON_ID_FREE_MONTH || undefined;

console.log(DEFAULT_COUPON_ID)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData, accountNames } = body;

    if (!formData?.packageType) {
      return NextResponse.json(
        { error: 'packageType is required' },
        { status: 400 }
      );
    }

    const packageType = formData.packageType as 'byod' | 'full';
    const priceId = PRICE_IDS[packageType];

    if (!priceId) {
      console.error(`No Stripe Price ID configured for packageType: ${packageType}`);
      return NextResponse.json(
        { error: 'Invalid package type or pricing not configured' },
        { status: 500 }
      );
    }

    const quantity = packageType === 'byod'
      ? Math.max(1, parseInt(formData.numberOfDomains) || 1)
      : 1;

    // === Customer Logic ===
    let customerId: string | undefined;

    try {
      const existing = await stripe.customers.list({
        email: formData.email,
        limit: 1,
      });

      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: formData.email,
          name: formData.name,
          phone: formData.phone || undefined,
          metadata: { companyName: formData.companyName || '' },
        });
        customerId = customer.id;
      }
    } catch (err) {
      console.warn('Customer lookup/create failed, falling back to email-only');
    }

    // === Metadata ===
    const metadata: Record<string, string> = {
      customerName: formData.name || '',
      customerEmail: formData.email || '',
      customerPhone: formData.phone || '',
      companyName: formData.companyName || '',
      packageType,
      numberOfDomains: String(formData.numberOfDomains || quantity),
    };

    if (packageType === 'byod' && Array.isArray(formData.customDomains)) {
      metadata.customDomains = formData.customDomains.join(', ').slice(0, 500);
    }
    if (packageType === 'full' && Array.isArray(formData.selectedDomains)) {
      metadata.selectedDomains = formData.selectedDomains.join(', ').slice(0, 500);
    }

    ['website', 'dnsProvider', 'providerEmail'].forEach((key) => {
      if (formData[key] && typeof formData[key] === 'string' && formData[key].length < 200) {
        metadata[key] = formData[key];
      }
    });

    // === Checkout Session Config ===
const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-form`,
      customer: customerId,
      customer_email: customerId ? undefined : formData.email,
      metadata,

      // Auto-apply free month coupon if set
      ...(DEFAULT_COUPON_ID && {
        discounts: [{ coupon: DEFAULT_COUPON_ID }],
      }),

      // Only allow manual promo codes if we're NOT auto-applying one
      ...(DEFAULT_COUPON_ID ? {} : { allow_promotion_codes: true }),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    // === Store accountNames for webhook ===
    if (accountNames?.length > 0) {
      try {
        await connectDB();
        await CheckoutSession.create({
          sessionId: session.id,
          accountNames: JSON.stringify(accountNames),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      } catch (err) {
        console.error('DB save failed (non-critical):', err);
      }
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}