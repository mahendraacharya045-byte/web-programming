import { useState } from "react";

// 1. Product list: 6 items with name, price, image URL
const PRODUCTS = [
  { id: 1, name: "Canvas Backpack", price: 48, image: "https://picsum.photos/seed/backpack/300/200" },
  { id: 2, name: "Ceramic Mug", price: 14, image: "https://picsum.photos/seed/mug/300/200" },
  { id: 3, name: "Desk Lamp", price: 32, image: "https://picsum.photos/seed/lamp/300/200" },
  { id: 4, name: "Notebook Set", price: 9, image: "https://picsum.photos/seed/notebook/300/200" },
  { id: 5, name: "Wireless Mouse", price: 25, image: "https://picsum.photos/seed/mouse/300/200" },
  { id: 6, name: "Water Bottle", price: 18, image: "https://picsum.photos/seed/bottle/300/200" },
];

const money = (n) => `$${n.toFixed(2)}`;

function ProductList({ products, cart, onAdd, onRemove }) {
  return (
    <section className="products">
      {products.map((p) => {
        const inCart = cart.some((item) => item.id === p.id);
        return (
          <article className="card" key={p.id}>
            <img src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <p className="price">{money(p.price)}</p>
            {inCart ? (
              <button className="btn ghost" onClick={() => onRemove(p.id)}>Remove</button>
            ) : (
              <button className="btn" onClick={() => onAdd(p)}>Add to cart</button>
            )}
          </article>
        );
      })}
    </section>
  );
}

// 3. Cart sidebar: items + total computed from state
function CartPanel({ cart, onChangeQty, onRemove }) {
  // Derived value: computed from state on each render, not stored in state
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <aside className="cart">
      <h2>Your cart ({count})</h2>
      {cart.length === 0 && <p className="empty">Your cart is empty. Add a product to start.</p>}
      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            <div className="line">
              <span>{item.name}</span>
              <span>{money(item.price * item.qty)}</span>
            </div>
            {/* 4. Quantity controls */}
            <div className="qty">
              <button aria-label={`Decrease ${item.name}`} onClick={() => onChangeQty(item.id, -1)}>-</button>
              <span>{item.qty}</span>
              <button aria-label={`Increase ${item.name}`} onClick={() => onChangeQty(item.id, +1)}>+</button>
              <button className="link" onClick={() => onRemove(item.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="total">
        <span>Total</span>
        <strong>{money(total)}</strong>
      </div>
    </aside>
  );
}

// 5. ShoppingCart: owns the state (lifting state up), passes data down as props
// and handlers down as callbacks
export default function ShoppingCart() {
  const [cart, setCart] = useState([]); // array of { ...product, qty }

  // 2. Add: spread existing items + new item
  const addToCart = (product) =>
    setCart((prev) => [...prev, { ...product, qty: 1 }]);

  // Remove: filter creates a new array
  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  // Quantity: map creates a new array; drop the item if qty reaches 0
  const changeQty = (id, delta) =>
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );

  return (
    <div className="shop">
      <style>{css}</style>
      <header>
        <h1>Campus Shop</h1>
      </header>
      <div className="layout">
        <ProductList products={PRODUCTS} cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
        <CartPanel cart={cart} onChangeQty={changeQty} onRemove={removeFromCart} />
      </div>
    </div>
  );
}

const css = `
.shop { font-family: system-ui, sans-serif; max-width: 1000px; margin: 0 auto; padding: 24px; color: #1d2433; }
.shop h1 { margin: 0 0 20px; }
.layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }
.products { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
.card { border: 1px solid #dde1ea; border-radius: 10px; padding: 12px; background: #fff; }
.card img { width: 100%; height: 120px; object-fit: cover; border-radius: 6px; background: #eef1f6; }
.card h3 { margin: 10px 0 4px; font-size: 1rem; }
.price { margin: 0 0 10px; color: #4a5568; }
.btn { width: 100%; padding: 8px; border: 0; border-radius: 6px; background: #1f6f8b; color: #fff; cursor: pointer; font-size: 0.95rem; }
.btn.ghost { background: transparent; color: #1f6f8b; border: 1px solid #1f6f8b; }
.btn:focus-visible, .qty button:focus-visible { outline: 3px solid #f2a65a; outline-offset: 2px; }
.cart { position: sticky; top: 16px; border: 1px solid #dde1ea; border-radius: 10px; padding: 16px; background: #f7f8fb; }
.cart h2 { margin: 0 0 12px; font-size: 1.1rem; }
.cart ul { list-style: none; padding: 0; margin: 0; }
.cart li { padding: 10px 0; border-bottom: 1px solid #e3e6ee; }
.line { display: flex; justify-content: space-between; }
.qty { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.qty button { width: 28px; height: 28px; border: 1px solid #c5ccd9; border-radius: 6px; background: #fff; cursor: pointer; }
.qty .link { width: auto; margin-left: auto; border: 0; background: none; color: #b3402a; text-decoration: underline; }
.total { display: flex; justify-content: space-between; margin-top: 14px; font-size: 1.1rem; }
.empty { color: #6b7488; }
@media (max-width: 720px) { .layout { grid-template-columns: 1fr; } .cart { position: static; } }
`;
