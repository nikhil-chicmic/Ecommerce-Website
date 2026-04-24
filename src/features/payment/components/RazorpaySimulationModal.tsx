import React from 'react';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import type { Order, RazorpaySuccessResponse } from '../types';

interface Props {
  order: Order;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onFailure: () => void;
}

export const RazorpaySimulationModal: React.FC<Props> = ({ order, onSuccess, onFailure }) => {
  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <ShieldAlert size={20} style={{ color: 'var(--brand-primary)' }} />
          <h3>Razorpay Simulation Environment</h3>
        </div>
        
        <div className="payment-modal-body">
          <p>This is a simulated secure payment gateway.</p>
          <div className="payment-details-box">
            <p><strong>Order ID:</strong> {order.razorpayOrderId}</p>
            <p><strong>Amount Payable:</strong> ${order.totalAmount.toFixed(2)}</p>
          </div>
          
          <p className="instruction">Select an outcome to test the system flow:</p>
          
          <div className="payment-actions">
            <button 
              className="btn-sim success"
              onClick={() => onSuccess({
                razorpay_payment_id: `pay_${Math.random().toString(36).substring(2, 10)}`,
                razorpay_order_id: order.razorpayOrderId || '',
                razorpay_signature: 'mock_valid_signature_hash'
              })}
            >
              <CheckCircle size={18} /> Simulate Success
            </button>
            
            <button 
              className="btn-sim fail-verify"
              onClick={() => onSuccess({
                razorpay_payment_id: 'fail_simulation',
                razorpay_order_id: order.razorpayOrderId || '',
                razorpay_signature: 'mock_invalid_signature_hash'
              })}
            >
              <ShieldAlert size={18} /> Simulate Verification Failure
            </button>

            <button 
              className="btn-sim fail"
              onClick={onFailure}
            >
              <XCircle size={18} /> Simulate Cancel/Failure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
