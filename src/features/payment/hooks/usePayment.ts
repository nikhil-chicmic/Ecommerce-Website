import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import type { RootState } from '../../../store';
import { setCurrentOrder, setProcessing, setError, updateOrderStatus } from '../store/orderSlice';
import { clearCart } from '../../cart/store/cartSlice';
import { paymentApi } from '../api/paymentApi';
import type { RazorpaySuccessResponse } from '../types';
import { logger } from '../../../utils';

export const usePayment = () => {
  const dispatch = useDispatch();
  const { currentOrder, isProcessing, error } = useSelector((state: RootState) => state.order);
  const { user } = useSelector((state: RootState) => state.auth);
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  
  const [showMockModal, setShowMockModal] = useState(false);

  const initiateCheckout = async () => {
    if (!user) {
      dispatch(setError('User not authenticated'));
      return;
    }
    if (items.length === 0) {
      dispatch(setError('Cart is empty'));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setError(null));

      // 1. Create order on backend
      const order = await paymentApi.createOrder(user.id, items, totalAmount);
      dispatch(setCurrentOrder(order));
      
      // 2. Open Payment Modal (Simulation)
      setShowMockModal(true);

    } catch (err: any) {
      logger.error('Checkout initialization failed', err);
      dispatch(setError(err.message || 'Failed to initialize checkout'));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handlePaymentSuccess = async (response: RazorpaySuccessResponse) => {
    setShowMockModal(false);
    if (!currentOrder) return;

    try {
      dispatch(setProcessing(true));
      
      // 3. Verify on backend
      const isValid = await paymentApi.verifyPayment({
        ...response,
        internalOrderId: currentOrder.id
      });

      if (isValid) {
        dispatch(updateOrderStatus({ status: 'PAID', paymentId: response.razorpay_payment_id }));
        dispatch(clearCart()); // Success - empty the cart
        logger.info('Payment successful and verified');
      } else {
        throw new Error('Signature verification failed');
      }
    } catch (err: any) {
      logger.error('Verification failed', err);
      dispatch(updateOrderStatus({ status: 'FAILED' }));
      dispatch(setError('Payment verification failed. If money was deducted, it will be refunded.'));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handlePaymentFailure = () => {
    setShowMockModal(false);
    if (currentOrder) {
      dispatch(updateOrderStatus({ status: 'FAILED' }));
      dispatch(setError('Payment cancelled or failed. You can try again.'));
    }
  };

  return {
    currentOrder,
    isProcessing,
    error,
    showMockModal,
    initiateCheckout,
    handlePaymentSuccess,
    handlePaymentFailure
  };
};
