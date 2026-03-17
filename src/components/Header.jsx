import React from 'react';

const Header = ({ cartCount, onOpenCart }) => {
  return (
    <header className="glass-header">
      <div className="header-container">
        <div className="logo">
          <h1>Quick Market</h1>
          <span className="subtitle">Premium Local Store</span>
        </div>
        <div className="header-actions">
          <button className="cart-toggle" onClick={onOpenCart}>
            <span className="cart-icon">🛒</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
