/* script.js — Full site logic: products, cart, admin, theme, reveal, contact, success */

/* -------- STORAGE KEYS -------- */
const KEYS = {
  PRODUCTS: "ib_products_v3",
  CART: "ib_cart_v3",
  THEME: "ib_theme_v3",
  CONTACTS: "ib_contacts_v3",
  LAST_ORDER: "ib_last_order_v3"
};

/* -------- SAMPLE PRODUCTS (seed) -------- */
const SAMPLE = [
  { id: "p1", name: "Classic Chocolate Cake", price: 450, img: "https://images.unsplash.com/photo-1542831371-d531d36971e6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2f0b4b3a6b285b3a5b0a2ab6e0d56c5a", cat: "cakes", desc: "Rich chocolate sponge with silky ganache." },
  { id: "p2", name: "Gulab Jamun (6 pcs)", price: 160, img: "https://i.ibb.co/vBtgXKw/gulab.jpg", cat: "sweets", desc: "Soft, syrupy and delightful local sweet." },
  { id: "p3", name: "Paneer Puff", price: 35, img: "https://i.ibb.co/4cGefHh/puff.jpg", cat: "snacks", desc: "Flaky puff stuffed with spiced paneer." },
  { id: "p4", name: "Fresh Brown Bread", price: 55, img: "https://i.ibb.co/1Kgjg1G/bread.jpg", cat: "breads", desc: "Whole wheat loaf, baked daily." },
  { id: "p5", name: "Kaju Katli (250g)", price: 420, img: "https://i.ibb.co/5TccwqH/kajukatli.jpg", cat: "sweets", desc: "Smooth cashew fudge — melt-in-mouth." },
  { id: "p6", name: "Butter Cookies (250g)", price: 150, img: "https://i.ibb.co/rbZpVVk/cookies.jpg", cat: "cookies", desc: "Buttery, crisp and nostalgic." }
];

/* -------- Local storage utils -------- */
function load(key, fallback){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

/* seed products if empty */
if(!localStorage.getItem(KEYS.PRODUCTS)) save(KEYS.PRODUCTS, SAMPLE);

/* -------- THEME (persist) -------- */
(function initTheme(){
  const t = localStorage.getItem(KEYS.THEME);
  if(t === "dark") document.documentElement.classList.add("dark");
})();
function toggleTheme(){
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem(KEYS.THEME, isDark ? "dark" : "light");
}
/* attach theme toggles if present */
["themeToggle","themeToggle2","themeToggle3","themeToggle4","themeToggle5"].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener("click", toggleTheme);
});

/* -------- Toast -------- */
function showToast(msg, timeout = 1400){
  const t = document.getElementById("toast") || document.getElementById("toast2") || document.getElementById("toast3") || document.getElementById("toast4") || document.getElementById("toast5") || document.getElementById("toast6");
  if(!t) return;
  t.textContent = msg; t.style.display = "block"; t.setAttribute("aria-hidden","false");
  setTimeout(()=>{ t.style.display = "none"; t.setAttribute("aria-hidden","true"); }, timeout);
}

/* -------- CART helpers -------- */
function getCart(){ return load(KEYS.CART, []); }
function saveCart(cart){ save(KEYS.CART, cart); updateCartCount(); }
function updateCartCount(){
  const c = getCart().reduce((s,i)=>s + (i.qty||1), 0);
  ["cartCount","cartCount2","cartCount3"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.textContent = c;
  });
}
updateCartCount();

/* add to cart (by product id) */
function addToCart(productId, qty = 1){
  const products = load(KEYS.PRODUCTS, []);
  const p = products.find(x=>x.id === productId);
  if(!p) return showToast("Product not found");
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if(item) item.qty += qty; else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty });
  saveCart(cart);
  showToast("Added to cart");
}

/* expose for inline buttons */
window.addToCart = addToCart;

/* -------- HOME preview (first 4) -------- */
(function renderHomePreview(){
  const grid = document.getElementById("previewGrid");
  if(!grid) return;
  const products = load(KEYS.PRODUCTS, []);
  const preview = products.slice(0,4);
  grid.innerHTML = preview.map(p => `
    <div class="card reveal">
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div class="meta">
        <div class="price">₹${p.price}</div>
        <div><button class="btn ghost" onclick="goToDetail('${p.id}')">View</button></div>
      </div>
    </div>
  `).join('');
  attachReveal();
})();

/* -------- PRODUCTS page rendering & filter -------- */
(function renderProducts(){
  const grid = document.getElementById("productGrid");
  if(!grid) return;
  const products = load(KEYS.PRODUCTS, []);
  function build(list){
    grid.innerHTML = list.map(p => `
      <div class="card reveal">
        <img src="${p.img}" alt="${p.name}">
        <h3>${p.name}</h3>
        <div class="meta">
          <div class="price">₹${p.price}</div>
          <div style="display:flex;gap:8px">
            <button class="btn ghost" onclick="goToDetail('${p.id}')">Details</button>
            <button class="btn" onclick="addToCart('${p.id}',1)">Add</button>
          </div>
        </div>
      </div>
    `).join('');
    attachReveal();
  }
  build(products);

  const search = document.getElementById("search");
  const cat = document.getElementById("category");
  if(search) search.addEventListener("input", filter);
  if(cat) cat.addEventListener("change", filter);
  function filter(){
    const q = search ? search.value.trim().toLowerCase() : "";
    const c = cat ? cat.value : "all";
    const filtered = products.filter(p => (c === "all" || p.cat === c) && p.name.toLowerCase().includes(q));
    build(filtered);
  }
})();

/* -------- PRODUCT DETAIL page -------- */
function goToDetail(id){
  localStorage.setItem("ib_view", id);
  window.location.href = "product.html";
}
(function renderDetail(){
  if(!window.location.pathname.includes("product.html")) return;
  const id = localStorage.getItem("ib_view");
  if(!id) return;
  const products = load(KEYS.PRODUCTS, []);
  const p = products.find(x=>x.id===id);
  if(!p) return;
  const container = document.getElementById("productDetail");
  container.innerHTML = `
    <div class="product-detail">
      <img src="${p.img}" alt="${p.name}">
      <div class="detail-meta">
        <h1>${p.name}</h1>
        <p class="muted">${p.desc || ""}</p>
        <div class="price" style="margin:12px 0;font-weight:800">₹ ${p.price}</div>
        <div class="qty-row">
          <label>Qty <input id="qty" type="number" min="1" value="1" style="width:72px;padding:6px;border-radius:6px;border:1px solid #ddd"></label>
        </div>
        <div style="display:flex;gap:10px;margin-top:12px">
          <button class="btn" id="addBtn">Add to Cart</button>
          <a class="btn ghost" href="cart.html">Go to Cart</a>
        </div>
      </div>
    </div>
  `;
  document.getElementById("addBtn").addEventListener("click", ()=>{
    const qty = Math.max(1, parseInt(document.getElementById("qty").value||1));
    addToCart(p.id, qty);
  });
})();

/* -------- CART page rendering & controls -------- */
(function renderCartPage(){
  if(!window.location.pathname.includes("cart.html")) return;
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");
  if(!list) return;
  function build(){
    const cart = getCart();
    if(cart.length === 0){ list.innerHTML = `<div class="muted">Your cart is empty.</div>`; if(totalEl) totalEl.textContent = "0"; return; }
    list.innerHTML = cart.map((it, idx) => `
      <div class="cart-item reveal">
        <div>
          <strong>${it.name}</strong>
          <div class="muted">₹${it.price} × <input type="number" value="${it.qty}" min="1" onchange="changeQty(${idx}, this.value)" style="width:64px;padding:6px;border-radius:6px;border:1px solid #ddd"></div>
        </div>
        <div style="text-align:right">
          <div>₹${it.price * it.qty}</div>
          <div style="margin-top:8px"><button class="btn ghost" onclick="removeFromCart(${idx})">Remove</button></div>
        </div>
      </div>
    `).join('');
    totalEl.textContent = cart.reduce((s,i)=>s + i.price * i.qty, 0);
    attachReveal();
  }
  window.changeQty = function(idx,v){ const cart = getCart(); cart[idx].qty = Math.max(1, parseInt(v)||1); saveCart(cart); build(); updateCartCount(); }
  window.removeFromCart = function(idx){ const cart = getCart(); cart.splice(idx,1); saveCart(cart); build(); updateCartCount(); showToast("Removed"); }
  window.clearCart = function(){ localStorage.removeItem(KEYS.CART); build(); updateCartCount(); showToast("Cart cleared"); }
  window.placeOrder = function(){
    const orderId = "ORD" + Math.floor(Math.random()*900000+100000);
    save(KEYS.LAST_ORDER, orderId);
    localStorage.removeItem(KEYS.CART);
    updateCartCount();
    window.location.href = "success.html";
  };
  build();
})();

/* expose placeOrder/clearCart for inline usage */
window.placeOrder = function(){ const orderId = "ORD" + Math.floor(Math.random()*900000+100000); save(KEYS.LAST_ORDER, orderId); localStorage.removeItem(KEYS.CART); updateCartCount(); window.location.href = "success.html"; };

/* -------- Success page show order id -------- */
(function renderSuccess(){
  if(!(window.location.pathname.includes("success.html") || window.location.pathname.includes("order-success"))) return;
  const id = load(KEYS.LAST_ORDER, "") || localStorage.getItem(KEYS.LAST_ORDER);
  const el = document.getElementById("orderId");
  if(el && id) el.textContent = `Order ID: ${id}`;
})();

/* -------- Contact form handling (local storage) -------- */
(function initContact(){
  const form = document.getElementById("contactForm");
  if(!form) return;
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = document.getElementById("cName").value.trim();
    const email = document.getElementById("cEmail").value.trim();
    const msg = document.getElementById("cMsg").value.trim();
    if(!name || !email || !msg) return showToast("Please complete the form");
    const contacts = load(KEYS.CONTACTS, []);
    contacts.push({ id: Date.now(), name, email, msg });
    save(KEYS.CONTACTS, contacts);
    showToast("Message sent — thanks!");
    form.reset();
  });
})();

/* -------- ADMIN: add/edit/delete products (localStorage) -------- */
(function adminPanel(){
  if(!window.location.pathname.includes("admin.html")) return;
  const list = document.getElementById("adminList");
  function build(){
    const products = load(KEYS.PRODUCTS, []);
    list.innerHTML = products.map(p=>{
      return `<div class="admin-row">
        <div style="display:flex;gap:12px;align-items:center"><img src="${p.img}" width="48" style="border-radius:8px"><div><div>${p.name}</div><div class="muted">₹${p.price}</div></div></div>
        <div><button class="btn ghost" onclick="adminEdit('${p.id}')">Edit</button> <button class="btn" onclick="adminDelete('${p.id}')">Delete</button></div>
      </div>`;
    }).join('');
  }
  window.adminAdd = function(){
    const name = document.getElementById("adminName").value.trim();
    const price = parseFloat(document.getElementById("adminPrice").value) || 0;
    const cat = document.getElementById("adminCat").value;
    const img = document.getElementById("adminImg").value.trim() || SAMPLE[0].img;
    if(!name || price<=0) return showToast("Provide name & price");
    const products = load(KEYS.PRODUCTS, []);
    const id = "p"+Date.now();
    products.unshift({ id, name, price, img, cat, desc: "" });
    save(KEYS.PRODUCTS, products);
    showToast("Product added");
    document.getElementById("adminName").value=""; document.getElementById("adminPrice").value=""; document.getElementById("adminImg").value="";
    build();
  };
  window.adminDelete = function(id){ let ps = load(KEYS.PRODUCTS, []); ps = ps.filter(p=>p.id!==id); save(KEYS.PRODUCTS, ps); build(); showToast("Removed"); }
  window.adminEdit = function(id){
    const ps = load(KEYS.PRODUCTS, []);
    const p = ps.find(x=>x.id===id); if(!p) return;
    document.getElementById("adminName").value = p.name;
    document.getElementById("adminPrice").value = p.price;
    document.getElementById("adminImg").value = p.img;
    document.getElementById("adminCat").value = p.cat;
    // remove old so Add will create updated
    const remaining = ps.filter(x=>x.id !== id); save(KEYS.PRODUCTS, remaining); build(); showToast("Edit values and click Add");
  };
  window.adminReset = function(){ document.getElementById("adminName").value=""; document.getElementById("adminPrice").value=""; document.getElementById("adminImg").value=""; }
  build();
})();

/* -------- Reveal on scroll & attachReveal initial -------- */
function attachReveal(){
  document.querySelectorAll(".reveal").forEach((el, i) => {
    setTimeout(()=> el.classList.add("active"), 80 + i*30);
  });
}
window.addEventListener("scroll", ()=> {
  document.querySelectorAll(".reveal").forEach(el=>{
    const rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight - 60) el.classList.add("active");
  });
});
attachReveal();

/* -------- Helper wrappers exposed to window for inline onclicks -------- */
window.goToDetail = goToDetail;
window.adminAdd = window.adminAdd;
window.adminDelete = window.adminDelete;
window.adminEdit = window.adminEdit;
window.adminReset = window.adminReset;

/* -------- Initialize cart count -------- */
updateCartCount();
