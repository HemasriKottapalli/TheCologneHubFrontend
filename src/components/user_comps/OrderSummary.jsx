import { Trash2, Lock, CreditCard } from 'lucide-react';

function OrderSummary({ 
  inStockItems,
  outOfStockItems,
  promoCode,
  setPromoCode,
  appliedPromo,
  applyPromoCode,
  removePromo,
  subtotal,
  promoDiscount,
  shipping,
  tax,
  total,
  onCheckout,
  checkoutLoading 
}) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Order Summary</h3>
          {outOfStockItems.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Only available items included in total
            </p>
          )}
        </div>
        
        <div className="p-4">
          {/* Promo Code Section */}
          <PromoCodeSection
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            appliedPromo={appliedPromo}
            applyPromoCode={applyPromoCode}
            removePromo={removePromo}
          />

          {/* Price Breakdown */}
          <PriceBreakdown
            inStockItems={inStockItems}
            subtotal={subtotal}
            appliedPromo={appliedPromo}
            promoDiscount={promoDiscount}
            shipping={shipping}
            tax={tax}
            total={total}
          />

          {/* Shipping Info */}
          <ShippingInfo shipping={shipping} subtotal={subtotal} />

          {/* Checkout Button */}
          <button
            className="w-full bg-[#8B5A7C] text-white py-3 rounded-lg font-semibold hover:bg-[#8B5A7C]/90 transition-colors flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={inStockItems.length === 0 || checkoutLoading}
            onClick={onCheckout}
          >
            <Lock className="w-4 h-4" />
            {checkoutLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : inStockItems.length === 0 ? (
              'No Items Available'
            ) : (
              'Secure Checkout'
            )}
          </button>

          {/* Security Info */}
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <CreditCard className="w-5 h-5" />
            <span className="text-sm">Secure payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Promo Code Section Component
function PromoCodeSection({ promoCode, setPromoCode, appliedPromo, applyPromoCode, removePromo }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Promo Code
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter code (try SAVE20)"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent outline-none"
        />
        <button
          onClick={applyPromoCode}
          disabled={!promoCode.trim()}
          className="px-4 py-2 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
      {appliedPromo && (
        <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded-lg">
          <span className="text-sm text-green-700">
            {appliedPromo.code} applied (-{appliedPromo.discount}%)
          </span>
          <button 
            onClick={removePromo} 
            className="text-green-600 hover:text-green-800"
            title="Remove promo code"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Price Breakdown Component
function PriceBreakdown({ inStockItems, subtotal, appliedPromo, promoDiscount, shipping, tax, total }) {
  return (
    <div className="space-y-3 mb-4">
      <div className="flex justify-between text-sm">
        <span>Subtotal ({inStockItems.length} items)</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      {appliedPromo && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount ({appliedPromo.discount}%)</span>
          <span>-${promoDiscount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span>Shipping</span>
        <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Tax (8%)</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      <div className="border-t pt-3">
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// Shipping Info Component
function ShippingInfo({ shipping, subtotal }) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg mb-4">
      <p className="text-sm text-gray-600">
        {shipping === 0 
          ? '🎉 Free shipping on orders over $100' 
          : `Add $${(100 - subtotal).toFixed(2)} more for free shipping`
        }
      </p>
    </div>
  );
}

export default OrderSummary;