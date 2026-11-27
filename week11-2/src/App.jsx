import { useMemo, useState } from 'react';
import './App.css';
import headphonesImage from './assets/products/headphones.jpg';
import watchImage from './assets/products/watch.jpg';
import sneakersImage from './assets/products/sneakers.jpg';
import backpackImage from './assets/products/backpack.jpg';
import cameraImage from './assets/products/camera.jpg';

const products = [
  { id: 1, name: 'Wireless Headphones', price: 45000, category: 'Audio', image: headphonesImage, note: 'Rich sound, made for the everyday.' },
  { id: 2, name: 'Smart Watch', price: 65000, category: 'Wearables', image: watchImage, note: 'A little more insight in every day.' },
  { id: 3, name: 'Everyday Sneakers', price: 55000, category: 'Style', image: sneakersImage, note: 'An easy pair for all-day plans.' },
  { id: 4, name: 'City Backpack', price: 35000, category: 'Carry', image: backpackImage, note: 'Room for the essentials and then some.' },
  { id: 5, name: 'Compact Camera', price: 120000, category: 'Tech', image: cameraImage, note: 'Keep the moments worth remembering.' }
];

const formatWon = value => `₩${value.toLocaleString('ko-KR')}`;

function App() {
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('All items');
  const categories = ['All items', ...new Set(products.map(product => product.category))];
  const visibleProducts = category === 'All items'
    ? products
    : products.filter(product => product.category === category);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  function addToCart(product) {
    setCart(previous => {
      const existing = previous.find(item => item.id === product.id);
      return existing
        ? previous.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...previous, { ...product, quantity: 1 }];
    });
  }

  function updateQuantity(id, amount) {
    setCart(previous => previous
      .map(item => item.id === id ? { ...item, quantity: item.quantity + amount } : item)
      .filter(item => item.quantity > 0));
  }

  function removeItem(id) {
    setCart(previous => previous.filter(item => item.id !== id));
  }

  return (
    <div className="store-shell">
      <header className="store-header">
        <a className="store-brand" href="#top" aria-label="Everyday Edit home">
          <span className="brand-symbol" aria-hidden="true">E</span>
          <span>everyday edit<small>OBJECTS FOR DAILY LIFE</small></span>
        </a>
        <div className="store-profile">
          <span className="profile-avatar" aria-hidden="true">M</span>
          <span className="profile-info">Mahendra<small>ID 202537251</small></span>
          <a className="github-link" href="https://github.com/mahendraacharya045-byte/web-programming/tree/main/week11-2" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </header>

      <main id="top">
        <section className="store-hero">
          <div className="hero-copy">
            <span className="hero-kicker"><i /> THE WEEKEND EDIT · VOL. 12</span>
            <h1>Good things for<br />everyday living.</h1>
            <p>Useful tech and thoughtful essentials, chosen to make the everyday feel a little better.</p>
            <a className="hero-link" href="#collection">Explore the collection <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-product product-back">✦</div>
            <div className="hero-product product-front">E</div>
            <span className="hero-caption">CURATED · 05 ITEMS</span>
          </div>
        </section>

        <div className="store-layout" id="collection">
          <section className="product-area" aria-labelledby="collection-title">
            <div className="collection-heading">
              <div><span className="section-kicker">GOOD FINDS, NO FUSS</span><h2 id="collection-title">Shop the collection</h2></div>
              <span className="product-count">{visibleProducts.length} {visibleProducts.length === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="category-row" aria-label="Filter products by category">
              {categories.map(item => (
                <button key={item} className={`category-pill ${category === item ? 'active' : ''}`} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>
              ))}
            </div>
            <div className="product-grid">
              {visibleProducts.map(product => {
                const inCart = cart.find(item => item.id === product.id);
                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-image-wrap">
                      <img src={product.image} alt={product.name} />
                      <span className="product-category">{product.category}</span>
                      {inCart && <span className="added-label">In your bag · {inCart.quantity}</span>}
                    </div>
                    <div className="product-details">
                      <div className="product-title-row"><h3>{product.name}</h3><span>{formatWon(product.price)}</span></div>
                      <p>{product.note}</p>
                      <button type="button" className={`add-button ${inCart ? 'added' : ''}`} onClick={() => addToCart(product)}>
                        {inCart ? 'Add another' : 'Add to bag'} <span aria-hidden="true">{inCart ? '+' : '↗'}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="cart-panel" aria-labelledby="cart-title">
            <div className="cart-heading"><div><span className="section-kicker">YOUR PICKS</span><h2 id="cart-title">Shopping bag</h2></div><span className="cart-count">{itemCount}</span></div>
            {cart.length === 0 ? (
              <div className="cart-empty"><span className="empty-bag" aria-hidden="true">＋</span><strong>Your bag is empty</strong><p>Choose something from the collection to get started.</p></div>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div className="cart-item" key={item.id}>
                    <img src={item.image} alt="" />
                    <div className="cart-item-copy"><strong>{item.name}</strong><span>{formatWon(item.price)}</span><div className="quantity-controls">
                      <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, -1)}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div></div>
                    <button type="button" className="remove-item" aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="cart-total"><span>Subtotal</span><strong>{formatWon(total)}</strong></div>
            <p className="cart-note">{itemCount ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your bag` : 'Your total will appear here.'}</p>
          </aside>
        </div>
      </main>
      <footer className="store-footer">EVERYDAY EDIT <span>·</span> MAHENDRA <span>·</span> 202537251</footer>
    </div>
  );
}

export default App;
