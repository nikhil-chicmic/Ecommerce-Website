import { logger } from '../../../utils';
import type { CartItem } from '../../cart/types';
import type { Order, VerifyPaymentRequest } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentApi = {
  // Simulates backend creating an order in the database and fetching a Razorpay Order ID
  async createOrder(userId: string, items: CartItem[], totalAmount: number): Promise<Order> {
    await delay(800); // Simulate network
    
    if (!items.length || totalAmount <= 0) {
      throw new Error('Invalid order parameters');
    }

    const internalOrderId = `ord_${Math.random().toString(36).substring(2, 10)}`;
    const razorpayOrderId = `rzp_ord_${Math.random().toString(36).substring(2, 10)}`;

    const newOrder: Order = {
      id: internalOrderId,
      userId,
      items,
      totalAmount,
      status: 'PENDING',
      razorpayOrderId,
      createdAt: new Date().toISOString()
    };

    logger.info('Order created on mock server', newOrder);
    return newOrder;
  },

  // Simulates backend verifying the signature using the Razorpay secret
  async verifyPayment(data: VerifyPaymentRequest): Promise<boolean> {
    await delay(1500); // Simulate network and crypto validation
    
    logger.info('Verifying signature on mock server...', data);
    
    // In our simulation, we just assume validity unless the payment_id flags a failure
    if (data.razorpay_payment_id === 'fail_simulation') {
      return false;
    }
    
    return true;
  }
};
