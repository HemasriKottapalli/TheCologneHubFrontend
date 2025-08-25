// import React, { useState, useEffect } from 'react';
// import {
//   useStripe,
//   useElements,
//   PaymentElement,
// } from '@stripe/react-stripe-js';
// import { Loader2, CreditCard, Shield, AlertTriangle } from 'lucide-react';

// function CheckoutForm({
//   clientSecret,
//   orderId,
//   onPaymentSuccess,
//   onPaymentError,
//   orderTotal,
//   onBack,
//   shippingAddress
// }) {
//   const stripe = useStripe();
//   const elements = useElements();
  
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [paymentError, setPaymentError] = useState(null);
//   const [paymentElementReady, setPaymentElementReady] = useState(false);
//   const [isSubmitted, setIsSubmitted] = useState(false);

//   useEffect(() => {
//     if (!stripe || !elements) return;
//     setPaymentError(null);
//     setIsSubmitted(false);
//   }, [stripe, elements, clientSecret]);

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     // Prevent double submission
//     if (isSubmitted || isProcessing) {
//       console.warn('Form already submitted, ignoring duplicate submission');
//       return;
//     }

//     if (!stripe || !elements) {
//       setPaymentError('Payment system is not ready. Please refresh and try again.');
//       return;
//     }

//     if (!paymentElementReady) {
//       setPaymentError('Payment form is still loading. Please wait a moment.');
//       return;
//     }

//     if (orderTotal < 0.50) {
//       setPaymentError('Order total must be at least $0.50');
//       return;
//     }

//     setIsProcessing(true);
//     setIsSubmitted(true);
//     setPaymentError(null);

//     try {
//       console.log('Starting payment confirmation...');

//       // Prepare billing details
//       const billingDetails = {
//         name: shippingAddress?.fullName || 'Customer',
//         email: shippingAddress?.email || '',
//         phone: shippingAddress?.phone || '',
//         address: {
//           line1: shippingAddress?.addressLine1 || '',
//           line2: shippingAddress?.addressLine2 || '',
//           city: shippingAddress?.city || '',
//           state: shippingAddress?.state || '',
//           postal_code: shippingAddress?.zipCode || '',
//           country: 'US'
//         }
//       };

//       const { error, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         redirect: 'if_required',
//         confirmParams: {
//           return_url: `${window.location.origin}/order-confirmation/${orderId}`,
//           payment_method_data: {
//             billing_details: billingDetails
//           }
//         },
//       });

//       if (error) {
//         console.error('Payment confirmation error:', error);
//         handlePaymentFailure(error);
//       } else if (paymentIntent) {
//         console.log('Payment Intent Status:', paymentIntent.status);
//         handlePaymentResult(paymentIntent);
//       } else {
//         setPaymentError('Payment processing failed. Please try again.');
//         onPaymentError('Payment processing failed');
//       }
//     } catch (err) {
//       console.error('Unexpected payment error:', err);
//       setPaymentError('An unexpected error occurred. Please try again.');
//       onPaymentError('Payment processing failed');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handlePaymentResult = (paymentIntent) => {
//     switch (paymentIntent.status) {
//       case 'succeeded':
//         console.log('Payment succeeded:', paymentIntent.id);
//         onPaymentSuccess(orderId);
//         break;
        
//       case 'processing':
//         setPaymentError('Your payment is being processed. Please wait...');
//         setTimeout(() => {
//           window.location.reload();
//         }, 5000);
//         break;
        
//       case 'requires_payment_method':
//         setPaymentError('Your payment was not successful. Please try a different payment method.');
//         setIsSubmitted(false);
//         break;
        
//       default:
//         setPaymentError(`Payment status: ${paymentIntent.status}. Please contact support if this persists.`);
//         setIsSubmitted(false);
//         break;
//     }
//   };

//   const handlePaymentFailure = (error) => {
//     let errorMessage = 'Payment failed. Please try again.';
    
//     switch (error.type) {
//       case 'card_error':
//         switch (error.code) {
//           case 'card_declined':
//             errorMessage = 'Your card was declined. Please try a different payment method.';
//             break;
//           case 'insufficient_funds':
//             errorMessage = 'Insufficient funds. Please try a different card.';
//             break;
//           case 'expired_card':
//             errorMessage = 'Your card has expired. Please use a different card.';
//             break;
//           case 'incorrect_cvc':
//             errorMessage = 'Incorrect security code. Please check and try again.';
//             break;
//           case 'processing_error':
//             errorMessage = 'Processing error. Please try again in a moment.';
//             break;
//           default:
//             errorMessage = `Card Error: ${error.message}`;
//         }
//         setIsSubmitted(false);
//         break;
        
//       case 'validation_error':
//         errorMessage = `Please check your payment details: ${error.message}`;
//         setIsSubmitted(false);
//         break;
        
//       case 'api_connection_error':
//         errorMessage = 'Network error. Please check your connection and try again.';
//         setIsSubmitted(false);
//         break;
        
//       default:
//         errorMessage = error.message || 'Payment failed. Please try again.';
//         setIsSubmitted(false);
//     }
    
//     setPaymentError(errorMessage);
//     onPaymentError(errorMessage);
//   };

//   const paymentElementOptions = {
//     layout: 'tabs',
//     defaultValues: {
//       billingDetails: {
//         name: shippingAddress?.fullName || '',
//         email: shippingAddress?.email || '',
//         phone: shippingAddress?.phone || '',
//         address: {
//           line1: shippingAddress?.addressLine1 || '',
//           city: shippingAddress?.city || '',
//           state: shippingAddress?.state || '',
//           postal_code: shippingAddress?.zipCode || '',
//           country: 'US'
//         }
//       }
//     },
//     fields: {
//       billingDetails: {
//         name: 'auto',
//         email: 'auto',
//         phone: 'auto',
//         address: {
//           line1: 'auto',
//           line2: 'never',
//           city: 'auto',
//           state: 'auto',
//           postalCode: 'auto',
//           country: 'never'
//         }
//       }
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-lg p-6">
//       {/* Header */}
//       <div className="mb-6">
//         <div className="flex items-center gap-2 mb-2">
//           <CreditCard className="w-5 h-5 text-[#8B5A7C]" />
//           <h2 className="text-xl font-semibold text-gray-900">Complete Your Payment</h2>
//         </div>
//         <p className="text-gray-600">Order Total: <span className="font-bold text-lg">${orderTotal.toFixed(2)}</span></p>
//       </div>

//       {/* Billing Address Preview */}
//       {shippingAddress && (
//         <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//           <h3 className="text-sm font-medium text-gray-900 mb-2">Billing Address (Same as Shipping)</h3>
//           <div className="text-sm text-gray-600">
//             <p className="font-medium">{shippingAddress.fullName}</p>
//             <p>{shippingAddress.addressLine1}</p>
//             {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
//             <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
//             <p>United States</p>
//           </div>
//         </div>
//       )}

//       <div className="space-y-6">
//         {/* Payment Element Container */}
//         <div className="p-4 border border-gray-200 rounded-lg">
//           <PaymentElement 
//             options={paymentElementOptions}
//             onReady={() => {
//               setPaymentElementReady(true);
//               console.log('Payment Element ready');
//             }}
//             onChange={(event) => {
//               if (event.error) {
//                 console.error('Payment Element error:', event.error);
//                 setPaymentError(event.error.message);
//               } else {
//                 setPaymentError(null);
//               }
//             }}
//             onLoaderStart={() => {
//               console.log('Payment Element loading...');
//               setPaymentElementReady(false);
//             }}
//           />
//         </div>

//         {/* Security Notice */}
//         <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
//           <Shield className="w-4 h-4 text-green-600" />
//           <p className="text-sm text-green-800">
//             Your payment information is secure and encrypted
//           </p>
//         </div>

//         {/* Error Display */}
//         {paymentError && (
//           <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
//             <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//             <div>
//               <p className="text-sm text-red-800 font-medium">Payment Error</p>
//               <p className="text-sm text-red-700">{paymentError}</p>
//             </div>
//           </div>
//         )}

//         {/* Processing Status */}
//         {isProcessing && (
//           <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
//             <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
//             <p className="text-sm text-blue-800">Processing your payment securely...</p>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="flex gap-4 pt-4">
//           <button
//             type="button"
//             onClick={onBack}
//             disabled={isProcessing || isSubmitted}
//             className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             Back to Shipping
//           </button>
          
//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={!stripe || !elements || isProcessing || !paymentElementReady || isSubmitted}
//             className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//           >
//             {isProcessing ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Processing Payment...
//               </>
//             ) : isSubmitted ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Please wait...
//               </>
//             ) : (
//               <>
//                 <Shield className="w-4 h-4" />
//                 Pay ${orderTotal.toFixed(2)}
//               </>
//             )}
//           </button>
//         </div>
        
//         {/* Payment Method Info */}
//         <div className="text-center pt-2">
//           <p className="text-xs text-gray-500">
//             We accept all major credit cards and digital wallets
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CheckoutForm;

// components/user_comps/CheckoutForm.jsx - Updated version
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
      // Clean phone number for Stripe (E.164 format)
      const cleanedPhone = shippingAddress.phone 
        ? `+1${shippingAddress.phone.replace(/[^0-9]/g, '')}`
        : '';

      // Prepare billing details from shipping address
      const billingDetails = shippingAddress ? {
        name: shippingAddress.fullName,
        email: shippingAddress.email,
        phone: cleanedPhone,
        address: {
          line1: shippingAddress.addressLine1,
          line2: shippingAddress.addressLine2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zipCode,
          country: 'US'
        }
      } : {
        name: 'Customer',
        address: {
          country: 'US'
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
        <p className="text-gray-600">Order Total: ${orderTotal.toFixed(2)}</p>      
      </div>

      {/* Show billing address info */}
      {shippingAddress && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Billing Address (Same as Shipping)</h3>
          <div className="text-sm text-gray-600">
            <p>{shippingAddress.fullName}</p>
            <p>{shippingAddress.addressLine1}</p>
            {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
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
                Pay ${orderTotal.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CheckoutForm;