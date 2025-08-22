// components/user_comps/CheckoutForm.jsx - Fixed version
import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { Loader2, CreditCard, Shield } from 'lucide-react';

function CheckoutForm({
  clientSecret,
  orderId,
  onPaymentSuccess,
  onPaymentError,
  orderTotal,
  onBack,
  shippingAddress // Add shipping address prop
}) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentElementReady, setPaymentElementReady] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }
    setPaymentError(null);
  }, [stripe, elements]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setPaymentError('Stripe has not loaded yet. Please try again.');
      return;
    }

    if (!paymentElementReady) {
      setPaymentError('Payment form is still loading. Please wait.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Prepare billing details from shipping address
      const billingDetails = shippingAddress ? {
        name: shippingAddress.fullName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: {
          line1: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zipCode,
          country: shippingAddress.country === 'India' ? 'IN' : shippingAddress.country
        }
      } : {
        name: 'Customer',
        address: {
          country: 'IN'
        }
      };

      // Confirm the payment with billing details
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation/${orderId}`,
          payment_method_data: {
            billing_details: billingDetails
          }
        },
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        
        // Handle specific error types
        if (error.type === 'card_error') {
          setPaymentError(`Card Error: ${error.message}`);
        } else if (error.type === 'validation_error') {
          setPaymentError(`Validation Error: ${error.message}`);
        } else {
          setPaymentError(error.message || 'Payment failed. Please try again.');
        }
        
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent.id);
        onPaymentSuccess(orderId);
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        setPaymentError('Payment is being processed. Please wait...');
      } else {
        setPaymentError('Payment status unclear. Please check your order history.');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setPaymentError('An unexpected error occurred. Please try again.');
      onPaymentError('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fixed payment element options
  const paymentElementOptions = {
    layout: 'tabs',
    paymentMethodOrder: ['card'],
    fields: {
      billingDetails: {
        name: 'auto',
        email: 'auto',
        phone: 'auto',
        address: 'never' // We'll provide this in confirmPayment
      }
    },
    terms: {
      card: 'never'
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-[#8B5A7C]" />
          <h2 className="text-xl font-semibold text-gray-900">Complete Your Payment</h2>
        </div>
        <p className="text-gray-600">Order Total: ₹{orderTotal.toFixed(2)}</p>
      </div>

      {/* Show billing address info */}
      {shippingAddress && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Billing Address (Same as Shipping)</h3>
          <div className="text-sm text-gray-600">
            <p>{shippingAddress.fullName}</p>
            <p>{shippingAddress.address}</p>
            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
            <p>{shippingAddress.country}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Element */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <PaymentElement 
            options={paymentElementOptions}
            onReady={() => {
              setPaymentElementReady(true);
              console.log('Payment Element ready');
            }}
            onChange={(event) => {
              if (event.error) {
                setPaymentError(event.error.message);
                console.error('Payment Element error:', event.error);
              } else {
                setPaymentError(null);
              }
              
              if (event.complete) {
                console.log('Payment Element complete');
              }
            }}
          />
        </div>

        {/* Test Card Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Test Card:</strong> 4242 4242 4242 4242 | Any future expiry | Any 3-digit CVC
          </p>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Shield className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-800">
            Your payment information is secure and encrypted
          </p>
        </div>

        {/* Error Display */}
        {paymentError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{paymentError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back to Shipping
          </button>
          
          <button
            type="submit"
            disabled={!stripe || !elements || isProcessing || !paymentElementReady}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay ₹{orderTotal.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CheckoutForm;