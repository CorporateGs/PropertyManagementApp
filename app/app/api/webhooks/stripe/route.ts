import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// POST /api/webhooks/stripe - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      logger.warn("Stripe webhook received without signature");
      return badRequest("Missing Stripe signature");
    }

    // TODO: Verify webhook signature using Stripe SDK
    // const isValidSignature = await verifyStripeSignature(body, signature);
    // if (!isValidSignature) {
    //   logger.warn("Invalid Stripe webhook signature");
    //   return badRequest("Invalid signature");
    // }

    // Parse webhook body
    const event = JSON.parse(body);

    logger.info("Stripe webhook received", {
      eventType: event.type,
      eventId: event.id,
    });

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        logger.info("Unhandled Stripe event type", { eventType: event.type });
    }

    return ok({ received: true }, "Webhook processed successfully");
  } catch (error) {
    logger.error("Failed to process Stripe webhook", { error });
    return serverError(error);
  }
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    // Find payment record by Stripe payment intent ID
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (!payment) {
      logger.warn("Payment not found for successful payment intent", {
        paymentIntentId: paymentIntent.id,
      });
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paymentDate: new Date(),
        stripeTransactionId: paymentIntent.charges.data[0]?.id,
        metadata: {
          ...payment.metadata,
          stripePaymentIntent: paymentIntent,
        },
      },
    });

    // TODO: Send payment confirmation email to tenant
    // await EmailService.sendPaymentConfirmation({
    //   tenantId: payment.tenantId,
    //   amount: payment.amount,
    //   paymentDate: new Date(),
    // });

    logger.info("Payment marked as successful", {
      paymentId: payment.id,
      amount: payment.amount,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    logger.error("Failed to handle payment intent succeeded", { error });
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    // Find payment record by Stripe payment intent ID
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (!payment) {
      logger.warn("Payment not found for failed payment intent", {
        paymentIntentId: paymentIntent.id,
      });
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        metadata: {
          ...payment.metadata,
          stripePaymentIntent: paymentIntent,
          failureReason: paymentIntent.last_payment_error?.message,
        },
      },
    });

    // TODO: Send payment failure notification to tenant and staff
    // await EmailService.sendPaymentFailureNotification({
    //   tenantId: payment.tenantId,
    //   amount: payment.amount,
    //   failureReason: paymentIntent.last_payment_error?.message,
    // });

    logger.info("Payment marked as failed", {
      paymentId: payment.id,
      paymentIntentId: paymentIntent.id,
      failureReason: paymentIntent.last_payment_error?.message,
    });
  } catch (error) {
    logger.error("Failed to handle payment intent failed", { error });
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription: any) {
  try {
    // TODO: Create subscription record in database
    // await prisma.subscription.create({
    //   data: {
    //     stripeSubscriptionId: subscription.id,
    //     customerId: subscription.customer,
    //     status: subscription.status,
    //     currentPeriodStart: new Date(subscription.current_period_start * 1000),
    //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    //     cancelAtPeriodEnd: subscription.cancel_at_period_end,
    //   },
    // });

    logger.info("Subscription created", {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
    });
  } catch (error) {
    logger.error("Failed to handle subscription created", { error });
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: any) {
  try {
    // TODO: Update subscription record in database
    // await prisma.subscription.update({
    //   where: { stripeSubscriptionId: subscription.id },
    //   data: {
    //     status: subscription.status,
    //     currentPeriodStart: new Date(subscription.current_period_start * 1000),
    //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    //     cancelAtPeriodEnd: subscription.cancel_at_period_end,
    //   },
    // });

    logger.info("Subscription updated", {
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error) {
    logger.error("Failed to handle subscription updated", { error });
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: any) {
  try {
    // TODO: Update subscription record in database
    // await prisma.subscription.update({
    //   where: { stripeSubscriptionId: subscription.id },
    //   data: {
    //     status: "CANCELED",
    //     canceledAt: new Date(),
    //   },
    // });

    logger.info("Subscription canceled", {
      subscriptionId: subscription.id,
    });
  } catch (error) {
    logger.error("Failed to handle subscription deleted", { error });
  }
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    // TODO: Record invoice payment in database
    // await prisma.invoicePayment.create({
    //   data: {
    //     stripeInvoiceId: invoice.id,
    //     amount: invoice.amount_paid,
    //     currency: invoice.currency,
    //     paidAt: new Date(),
    //     stripeTransactionId: invoice.charge,
    //   },
    // });

    logger.info("Invoice payment succeeded", {
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
    });
  } catch (error) {
    logger.error("Failed to handle invoice payment succeeded", { error });
  }
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice: any) {
  try {
    // TODO: Record invoice payment failure
    logger.warn("Invoice payment failed", {
      invoiceId: invoice.id,
      amount: invoice.amount_due,
    });
  } catch (error) {
    logger.error("Failed to handle invoice payment failed", { error });
  }
}