import React from 'react';

const Cart = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemove, onCheckout }) => {
  if (!isOpen) return null;

  // Calculate total price. Price in CSV has commas like "80,000".
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const priceVal = parseFloat(item.product.Price.replace(/,/g, '')) || 0;
      return total + priceVal * item.quantity;
    }, 0);
  };

  const total = calculateTotal();
  // Format with commas back
  const formattedTotal = total.toLocaleString('en-US');

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sidebar slide-in-right" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <span className="empty-icon">🛒</span>
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.product['Product Name']} className="cart-item">
                <div className="cart-item-img">
                  {item.product.localImage ? (
                    <img src={item.product.localImage} alt={item.product['Product Name']} />
                  ) : (
                    <div className="cart-img-placeholder"></div>
                  )}
                </div>
                <div className="cart-item-details">
                  <h4>{item.product['Product Name']}</h4>
                  <div className="cart-item-price">LBP {item.product.Price}</div>
                  <div className="cart-item-controls">
                    <button onClick={() => onUpdateQuantity(item.product, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.product, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button className="btn-remove" onClick={() => onRemove(item.product)}>🗑</button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>LBP {formattedTotal}</span>
            </div>
            <button className="btn-whatsapp pulse" onClick={onCheckout}>
              <span className="wa-icon">💬</span>
              Order via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
