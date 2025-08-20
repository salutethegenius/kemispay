import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

// Webhook secret is optional for development
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

interface CreatePaymentLinkParams {
  productName: string;
  amount: number;
  vendorId: string;
}

class StripeService {
  async createPaymentLink({ productName, amount, vendorId }: CreatePaymentLinkParams) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: productName,
        metadata: {
          vendorId,
        },
      });

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
      });

      // Create payment link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        metadata: {
          vendorId,
        },
      });

      return paymentLink;
    } catch (error: any) {
      throw new Error(`Failed to create payment link: ${error.message}`);
    }
  }

  constructWebhookEvent(body: any, signature: string) {
    try {
      if (!STRIPE_WEBHOOK_SECRET) {
        // For development, skip webhook verification
        return JSON.parse(body);
      }
      return stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (error: any) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  async handlePaymentSuccess(session: any) {
    try {
      const { storage } = await import('../storage');
      
      // Extract vendor ID from metadata
      const vendorId = session.metadata?.vendorId;
      if (!vendorId) {
        throw new Error('Vendor ID not found in session metadata');
      }

      // Get payment details
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent, {
        expand: ['charges']
      });
      const charges = paymentIntent.charges?.data || [];
      const charge = charges[0];
      
      // Calculate fees (Stripe's fee structure: 2.9% + $0.30)
      const amount = paymentIntent.amount / 100; // Convert from cents
      const fees = (amount * 0.029) + 0.30;
      const netAmount = amount - fees;

      // Create payment record
      await storage.createPayment({
        vendorId,
        stripePaymentId: paymentIntent.id,
        payerName: session.customer_details?.name || 'Unknown',
        payerEmail: session.customer_details?.email,
        amount: amount.toString(),
        fees: fees.toFixed(2),
        netAmount: netAmount.toFixed(2),
        productName: session.display_items?.[0]?.custom?.name,
      });

      // Update vendor balance
      const vendor = await storage.getVendor(vendorId);
      if (vendor) {
        const newBalance = (parseFloat(vendor.balance) + netAmount).toFixed(2);
        const newTotalEarned = (parseFloat(vendor.totalEarned) + netAmount).toFixed(2);
        
        await storage.updateVendorBalance(vendorId, newBalance);
        await storage.updateVendorTotalEarned(vendorId, newTotalEarned);
      }

    } catch (error: any) {
      console.error('Error handling payment success:', error.message);
      throw error;
    }
  }
}

export const stripeService = new StripeService();
