import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  // Description if available (not in CSV, but requested if available)
  const description = product.Description || product.Category;
  // Format price if it's string, we keep it, otherwise format
  
  return (
    <div className="product-card fade-in">
      <div className="product-image-container">
        {product.localImage ? (
          <img src={product.localImage} alt={product['Product Name']} className="product-image" loading="lazy" />
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>
      <div className="product-info">
        <span className="product-category">{product.Category}</span>
        <h3 className="product-title">{product['Product Name']}</h3>
        <p className="product-desc">{description}</p>
        <div className="product-footer">
          <span className="product-price">LBP {product.Price}</span>
          <button className="btn-add" onClick={() => onAddToCart(product)}>
            Add to Cart +
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
