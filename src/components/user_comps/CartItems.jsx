import { Minus, Plus, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';

function CartItems({ 
  inStockItems, 
  outOfStockItems, 
  updatingItems, 
  updateQuantity, 
  removeItem,
  error,
  clearError 
}) {
  return (
    <div className="lg:col-span-2">
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
          <button 
            onClick={clearError}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* In Stock Items */}
      {inStockItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8B5A7C]" />
              Available Items ({inStockItems.length})
            </h3>
          </div>
          <div className="p-4">
            {inStockItems.map((item, index) => (
              <CartItemCard
                key={item.productId}
                item={item}
                isLast={index === inStockItems.length - 1}
                updatingItems={updatingItems}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
                inStock={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Out of Stock Items */}
      {outOfStockItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              </div>
              Out of Stock ({outOfStockItems.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              These items are currently unavailable and won't be included in your order
            </p>
          </div>
          <div className="p-4">
            {outOfStockItems.map((item, index) => (
              <CartItemCard
                key={item.productId}
                item={item}
                isLast={index === outOfStockItems.length - 1}
                updatingItems={updatingItems}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
                inStock={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component for individual cart items
function CartItemCard({ item, isLast, updatingItems, updateQuantity, removeItem, inStock }) {
  return (
    <div 
      className={`flex items-center gap-4 ${!inStock ? 'opacity-60' : ''} ${
        !isLast ? 'border-b border-gray-100 pb-4 mb-4' : ''
      }`}
    >
      {item.image ? (
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
        />
      ) : (
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
          <span className="text-gray-400 text-xs">No Image</span>
        </div>
      )}
      
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
        <p className="text-sm text-gray-600 mb-1">{item.brand}</p>
        <p className="text-sm text-gray-500">{item.size}</p>
        
        {/* Stock status */}
        {inStock ? (
          item.stockQuantity <= 5 && item.stockQuantity > 0 && (
            <p className="text-sm text-orange-600 font-medium">
              Only {item.stockQuantity} left!
            </p>
          )
        ) : (
          <p className="text-sm text-red-600 font-medium">Out of Stock</p>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-gray-900">
            ${item.price.toFixed(2)}
          </span>
          {item.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${item.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {inStock ? (
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button 
              onClick={() => updateQuantity(item.productId, item.quantity - 1)} 
              className="p-2 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={updatingItems.has(item.productId) || item.quantity <= 1}
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">
              {updatingItems.has(item.productId) ? '...' : item.quantity}
            </span>
            <button 
              onClick={() => updateQuantity(item.productId, item.quantity + 1)} 
              className="p-2 hover:bg-gray-100 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                updatingItems.has(item.productId) || 
                item.quantity >= item.stockQuantity
              }
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg">
            Qty: {item.quantity}
          </div>
        )}
        
        <button 
          onClick={() => removeItem(item.productId)} 
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={inStock && updatingItems.has(item.productId)}
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default CartItems;