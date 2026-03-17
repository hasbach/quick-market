import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import SyncPage from './components/SyncPage';

function App() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/items.json')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        const cats = [...new Set(data.filter(i => i.Category).map(item => item.Category))];
        setCategories(cats);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load items:", err);
        setLoading(false);
      });
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product['Product Name'] === product['Product Name']);
      if (existing) {
        return prev.map(item => 
          item.product['Product Name'] === product['Product Name']
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (product, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(product);
      return;
    }
    setCart(prev => prev.map(item =>
      item.product['Product Name'] === product['Product Name']
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (product) => {
    setCart(prev => prev.filter(item => item.product['Product Name'] !== product['Product Name']));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const priceVal = parseFloat(item.product.Price.replace(/,/g, '')) || 0;
      return total + priceVal * item.quantity;
    }, 0);
  };

  const handleCheckout = () => {
    const total = calculateTotal().toLocaleString('en-US');
    let message = "Hello Quick Market, I would like to order:\n\n";
    cart.forEach(item => {
      message += `- ${item.quantity}x ${item.product['Product Name']} (LBP ${item.product.Price})\n`;
    });
    message += `\n*Total: LBP ${total}*`;
    
    // Address format
    const address = "جبل محسن - بناية الدريعي - مقابل المهنية";
    message += `\n\nDelivery Address: ${address}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/96181200580?text=${encodedMessage}`, "_blank");
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.Category === selectedCategory;
    const matchesSearch = item['Product Name'].toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (window.location.pathname === '/syncproducts') {
    return (
      <div className="app-container">
        <Header cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} onOpenCart={() => setIsCartOpen(true)} />
        <SyncPage />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} onOpenCart={() => setIsCartOpen(true)} />
      
      <main className="main-content">
        <div className="hero-section glass-panel fade-in">
          <h2>Welcome to Quick Market</h2>
          <p>Order your favorite local products online and get them delivered to your doorstep!</p>
          <div className="contact-info">
            <span>📍 جبل محسن - بناية الدريعي - مقابل المهنية</span>
            <span>📱 81-200580</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner pulse"></div>
        ) : (
          <div className="store-section">
            <aside className="category-sidebar glass-panel slide-in-left">
              <h3>Categories</h3>
              <ul className="category-list">
                <li 
                  className={selectedCategory === "All" ? "active" : ""}
                  onClick={() => setSelectedCategory("All")}
                >
                  All Items
                </li>
                {categories.map(cat => (
                  <li 
                    key={cat} 
                    className={selectedCategory === cat ? "active" : ""}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            </aside>
            
            <div className="products-area">
              <div className="search-container glass-panel slide-in-right">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="products-grid">
                {filteredItems.map(item => (
                  <ProductCard 
                    key={item['Product Name']} 
                    product={item} 
                    onAddToCart={addToCart} 
                  />
                ))}
                {filteredItems.length === 0 && (
                  <div className="empty-state">No products found matching your criteria.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default App;
