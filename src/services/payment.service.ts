import paypal from 'paypal-rest-sdk';
import { config } from 'dotenv';
import { Order, PaymentMethod } from '../entities/Order.entity';

config();

paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID || '',
  client_secret: process.env.PAYPAL_SECRET || '',
});

// Vérifier que les credentials PayPal sont configurés
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
  console.warn('⚠️  PayPal credentials not configured. PayPal payments will fail.');
  console.warn('   Please set PAYPAL_CLIENT_ID and PAYPAL_SECRET in your .env file');
}

export interface PayPalPaymentResponse {
  paymentId: string;
  approvalUrl: string;
}

export class PaymentService {
  static async createPayPalPayment(
    order: Order,
    returnUrl: string,
    cancelUrl: string
  ): Promise<PayPalPaymentResponse> {
    return new Promise((resolve, reject) => {
      const paymentJson = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
        transactions: [
          {
            item_list: {
              items: order.items.map((item) => ({
                name: item.name,
                sku: item.product_id,
                price: (item.price / 100).toFixed(2),
                currency: 'EUR',
                quantity: item.qty,
              })),
            },
            amount: {
              currency: 'EUR',
              total: (order.total_price / 100).toFixed(2),
            },
            description: `Commande ${order.numero_commande}`,
          },
        ],
      };

      paypal.payment.create(paymentJson, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          const approvalUrl = payment.links?.find((link) => link.rel === 'approval_url');
          if (approvalUrl && payment.id) {
            resolve({
              paymentId: payment.id,
              approvalUrl: approvalUrl.href,
            });
          } else {
            reject(new Error('Failed to create PayPal payment'));
          }
        }
      });
    });
  }

  static async executePayPalPayment(
    paymentId: string,
    payerId: string
  ): Promise<{ success: boolean; transactionId?: string }> {
    return new Promise((resolve, reject) => {
      paypal.payment.execute(paymentId, { payer_id: payerId }, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          if (payment.state === 'approved') {
            const transactionId = payment.transactions?.[0]?.related_resources?.[0]?.sale?.id;
            resolve({ success: true, transactionId });
          } else {
            resolve({ success: false });
          }
        }
      });
    });
  }

  static validatePaymentMethod(method: string): method is PaymentMethod {
    return method === PaymentMethod.CASH || method === PaymentMethod.PAYPAL;
  }
}

