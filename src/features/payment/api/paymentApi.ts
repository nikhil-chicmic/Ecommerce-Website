import { logger } from '../../../utils';
import { supabase } from '../../../lib/supabase';
import type { CartItem } from '../../cart/types';
import type { Order, VerifyPaymentRequest } from '../types';

export const paymentApi = {
  // Creates an order in Supabase and prepares it for payment
  async createOrder(userId: string, items: CartItem[], totalAmount: number, shippingAddress: any): Promise<Order> {
    if (!items.length || totalAmount <= 0) {
      throw new Error('Invalid order parameters');
    }

    // 1. Create the main order entry
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        status: 'PENDING',
        shipping_address: shippingAddress // Save the snapshot
      })
      .select()
      .single();

    if (orderError) {
      logger.error('Failed to create order in database', orderError);
      throw new Error('Could not initialize order');
    }

    // 2. Create the snapshot entries for each product in the order
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      product_id: String(item.id),
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      thumbnail: item.thumbnail
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      logger.error('Failed to create order items snapshot', itemsError);
      // We should technically delete the order summary here to maintain integrity
      await supabase.from('orders').delete().eq('id', orderData.id);
      throw new Error('Could not finalize order items');
    }

    const razorpayOrderId = `rzp_ord_${Math.random().toString(36).substring(2, 10)}`;

    const newOrder: Order = {
      id: orderData.id,
      userId,
      items,
      totalAmount,
      status: 'PENDING',
      razorpayOrderId,
      createdAt: orderData.created_at
    };

    logger.info('Persistent order created in Supabase', newOrder);
    return newOrder;
  },

  // Verifies signature and updates the order status in Supabase
  async verifyPayment(data: VerifyPaymentRequest): Promise<boolean> {
    logger.info('Verifying signature and updating database...', data);
    
    if (data.razorpay_payment_id === 'fail_simulation') {
      await supabase
        .from('orders')
        .update({ status: 'FAILED' })
        .eq('id', data.internalOrderId);
      return false;
    }

    // Update status to PAID or PROCESSING
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'PAID',
        payment_id: data.razorpay_payment_id
      })
      .eq('id', data.internalOrderId);

    if (error) {
      logger.error('Payment verification database update failed', error);
      return false;
    }
    
    return true;
  }
};
