document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('products-grid');
  const cartItemsEl = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total');
  const checkoutToggle = document.getElementById('checkoutToggle');
  const checkoutForm = document.getElementById('checkoutForm');
  const cancelCheckout = document.getElementById('cancelCheckout');
  const toast = document.getElementById('toast');
  const clearCartBtn = document.getElementById('clearCartBtn');

  const mobileNav = document.getElementById('mobileNav');
  const navOverlay = document.getElementById('navOverlay');
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const closeMobileNav = document.getElementById('closeMobileNav');

  const mobileCartToggle = document.getElementById('mobileCartToggle');
  const cartPanel = document.getElementById('cartPanel');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartCountEl = document.getElementById('cartCount');

  const SHIPPING = 2.50;
  let products = [];
  let cart = loadCart();

  function openNav(){
    closeCartIfMobile();
    if(!mobileNav) return;
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden','false');
    mobileNavToggle && mobileNavToggle.setAttribute('aria-expanded','true');
    navOverlay && showOverlay(navOverlay);
    lockBodyScroll();
    const first = mobileNav.querySelector('a');
    if(first) first.focus();
  }
  function closeNav(){
    if(!mobileNav) return;
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden','true');
    mobileNavToggle && mobileNavToggle.setAttribute('aria-expanded','false');
    navOverlay && hideOverlay(navOverlay);
    unlockBodyScroll();
    mobileNavToggle && mobileNavToggle.focus();
  }
  mobileNavToggle && mobileNavToggle.addEventListener('click', () => mobileNav && mobileNav.classList.contains('open') ? closeNav() : openNav());
  closeMobileNav && closeMobileNav.addEventListener('click', closeNav);
  navOverlay && navOverlay.addEventListener('click', () => { closeNav(); });

  function openCart(){
    if(window.innerWidth <= 820){
      if(!cartPanel) return;
      closeNav();
      cartPanel.scrollIntoView({behavior:'smooth', block:'start'});
      cartPanel.classList.add('mobile-highlight');
      setTimeout(()=> cartPanel.classList.remove('mobile-highlight'), 1200);
    } else {
      cartPanel && cartPanel.scrollIntoView({behavior:'smooth', block:'nearest'});
    }
  }
  function closeCartIfMobile(){
    return;
  }
  mobileCartToggle && mobileCartToggle.addEventListener('click', openCart);

  fetch('index.html').then(r => r.text()).then(text => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const nodes = doc.querySelectorAll('.menu-card');
    products = Array.from(nodes).map((figure, idx) => {
      const imgEl = figure.querySelector('img');
      const img = imgEl ? imgEl.getAttribute('src') : '';
      const titleEl = figure.querySelector('figcaption h3') || figure.querySelector('h3') || figure.querySelector('.title');
      const descEl = figure.querySelector('figcaption p') || figure.querySelector('p');
      const title = titleEl ? titleEl.textContent.trim() : `Produit ${idx+1}`;
      const desc = descEl ? descEl.textContent.trim() : '';
      const dataPrice = figure.getAttribute && figure.getAttribute('data-price');
      const price = dataPrice ? parseFloat(dataPrice) : (3 + idx * 0.75);
      return { id: 'p' + idx, title, desc, img, price: parseFloat(price.toFixed(2)) };
    });

    renderProducts();
    renderCart();
    updateCartCountUI();
  }).catch(err => {
    console.error('Erreur fetch index.html:', err);
    if(productsGrid) productsGrid.innerHTML = `<div class="muted">Produits introuvables — ouvrez via un serveur local (ex: python -m http.server).</div>`;
  });

  function renderProducts(){
    if(!productsGrid) return;
    productsGrid.innerHTML = '';
    if(!products.length){ productsGrid.innerHTML = '<p class="muted">Aucun produit disponible.</p>'; return; }
    products.forEach(p => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-thumb"><img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.title)}" loading="lazy"></div>
        <div class="product-info">
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.desc)}</p>
          <div class="product-meta">
            <div class="price">${p.price.toFixed(2)} €</div>
            <div class="product-actions">
              <button class="add-btn" data-id="${p.id}" type="button">Ajouter</button>
            </div>
          </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });

    productsGrid.querySelectorAll('.add-btn').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.id)));
  }

  function addToCart(id){
    const prod = products.find(p => p.id === id);
    if(!prod) return showToast('Produit introuvable');
    const exists = cart.find(i => i.id === id);
    if(exists) exists.qty++;
    else cart.push({ id: prod.id, title: prod.title, price: prod.price, qty: 1, img: prod.img, desc: prod.desc });
    saveCart(); renderCart(); updateCartCountUI(); showToast('Ajouté au panier');
  }

  function renderCart(){
    if(!cartItemsEl) return;
    cartItemsEl.innerHTML = '';
    if(cart.length === 0){ cartItemsEl.innerHTML = '<div class="muted">Le panier est vide.</div>'; }
    else {
      cart.forEach(item => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
          <div class="cart-item-thumb"><img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.title)}"></div>
          <div class="cart-item-info">
            <h4>${escapeHtml(item.title)}</h4>
            <div class="muted">${item.price.toFixed(2)} €</div>
          </div>
          <div class="cart-item-controls">
            <div class="qty-control">
              <button class="dec" data-id="${item.id}" type="button">−</button>
              <div class="small-qty">${item.qty}</div>
              <button class="inc" data-id="${item.id}" type="button">+</button>
            </div>
            <button class="remove-btn" data-id="${item.id}" type="button">Supprimer</button>
          </div>
        `;
        cartItemsEl.appendChild(el);
      });
    }

    cartItemsEl.querySelectorAll('.inc').forEach(b => b.addEventListener('click', (e) => changeQty(e.currentTarget.dataset.id, +1)));
    cartItemsEl.querySelectorAll('.dec').forEach(b => b.addEventListener('click', (e) => changeQty(e.currentTarget.dataset.id, -1)));
    cartItemsEl.querySelectorAll('.remove-btn').forEach(b => b.addEventListener('click', (e) => removeFromCart(e.currentTarget.dataset.id)));

    updateSummary(); updateCartCountUI();
  }

  function changeQty(id, delta){ const item = cart.find(i => i.id === id); if(!item) return; item.qty += delta; if(item.qty < 1) item.qty = 1; saveCart(); renderCart(); }
  function removeFromCart(id){ cart = cart.filter(i => i.id !== id); saveCart(); renderCart(); }

  function updateSummary(){
    const subtotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
    const total = subtotal > 0 ? subtotal + SHIPPING : 0;
    subtotalEl && (subtotalEl.textContent = subtotal.toFixed(2) + ' €');
    totalEl && (totalEl.textContent = total.toFixed(2) + ' €');
  }

  function updateCartCountUI(){
    const count = cart.reduce((s,i) => s + i.qty, 0);
    if(cartCountEl){ cartCountEl.textContent = count; cartCountEl.style.display = count === 0 ? 'none' : 'inline-flex'; }
  }

  function saveCart(){ try { localStorage.setItem('coffee_cart_v3', JSON.stringify(cart)); } catch(e){ console.warn('Impossible de sauvegarder le panier', e); } }
  function loadCart(){ try { const raw = localStorage.getItem('coffee_cart_v3'); return raw ? JSON.parse(raw) : []; } catch(e){ return []; } }

  checkoutToggle && checkoutToggle.addEventListener('click', () => { if(checkoutForm.classList.contains('hidden')) showCheckout(); else hideCheckout(); });
  cancelCheckout && cancelCheckout.addEventListener('click', hideCheckout);
  if(checkoutForm) checkoutForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if(cart.length === 0) return showToast('Le panier est vide');
    const fd = new FormData(checkoutForm); const name = fd.get('name'), phone = fd.get('phone'), address = fd.get('address');
    if(!name || !phone || !address) return showToast('Veuillez remplir tous les champs');
    showToast('Traitement de la commande...', 1200);
    setTimeout(() => { showToast('Merci — votre commande est confirmée !', 2400); cart = []; saveCart(); renderCart(); hideCheckout(); checkoutForm.reset(); }, 800);
  });

  function showCheckout(){ checkoutForm.classList.remove('hidden'); checkoutForm.setAttribute('aria-hidden','false'); checkoutToggle && (checkoutToggle.textContent = 'Fermer'); checkoutForm.scrollIntoView({behavior:'smooth', block:'center'}); }
  function hideCheckout(){ checkoutForm.classList.add('hidden'); checkoutForm.setAttribute('aria-hidden','true'); checkoutToggle && (checkoutToggle.textContent = 'Passer au paiement'); }

  clearCartBtn && clearCartBtn.addEventListener('click', () => { if(!confirm('Êtes-vous sûr de vouloir vider le panier ?')) return; cart = []; saveCart(); renderCart(); });

  let toastTimer = null;
  function showToast(msg, ms = 1400){ if(!toast) return; if(toastTimer) clearTimeout(toastTimer); toast.textContent = msg; toast.classList.remove('hidden'); toastTimer = setTimeout(() => { toast.classList.add('hidden'); toastTimer = null; }, ms); }

  function showOverlay(el){ if(!el) return; el.style.display = 'block'; requestAnimationFrame(()=> el.classList.add('visible')); }
  function hideOverlay(el){ if(!el) return; el.classList.remove('visible'); setTimeout(()=> el.style.display = 'none', 260); }

  let bodyLocks = 0;
  function lockBodyScroll(){ bodyLocks++; if(bodyLocks === 1) document.body.style.overflow = 'hidden'; }
  function unlockBodyScroll(force = false){ if(force) bodyLocks = 0; else bodyLocks = Math.max(0, bodyLocks - 1); if(bodyLocks === 0) document.body.style.overflow = ''; }

  window.addEventListener('resize', () => {
    if(window.innerWidth > 820){
      
      mobileNav && mobileNav.classList.remove('open');
      mobileNav && mobileNav.setAttribute('aria-hidden','true');
      navOverlay && hideOverlay(navOverlay);
      unlockBodyScroll(true);
    }
  });

  function escapeHtml(str){ if(!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

  renderCart(); updateCartCountUI();
});





document.getElementById('checkoutForm').addEventListener('submit', function(event) {
    event.preventDefault();

    
    const name = document.getElementById('orderName').value;
    const phone = document.getElementById('orderPhone').value;
    const address = document.getElementById('orderAddress').value;

    
    const cartItems = JSON.parse(localStorage.getItem('coffee_cart_v3')) || [];

    
    const items = cartItems.map(item => `${item.title} (x${item.qty})`); 
    const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0) + 2.50; 

    
    const order = {
        name: name,
        phone: phone,
        address: address,
        items: items,
        total: total.toFixed(2) + ' €',
        date: new Date().toLocaleString()
    };

    
    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    
    orders.push(order);

    
    localStorage.setItem('orders', JSON.stringify(orders));

    

    ;
});


    
function saveCart() {
    localStorage.setItem('coffee_cart_v3', JSON.stringify(cart));
}


function addToCart(id, title, price) {
    const product = {
        id,
        title,
        price,
        qty: 1  
    };

    
    const existingProduct = cart.find(item => item.id === id);
    if (existingProduct) {
        existingProduct.qty += 1;  
    } else {
        cart.push(product);  
    }

    saveCart();  
    renderCart();  
}


function saveCart() {
    localStorage.setItem('coffee_cart_v3', JSON.stringify(cart));
}


function renderCart() {
    const cartItemsEl = document.getElementById('cartItems');
    cartItemsEl.innerHTML = ''; 

    
    cart.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.classList.add('cart-item');
        itemEl.innerHTML = `
            <div class="cart-item-thumb">
                <img src="${item.img}" alt="${item.title}">
            </div>
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <div class="muted">${item.price} €</div>
                <div class="qty-control">
                    <span>Qty: ${item.qty}</span>
                </div>
            </div>
        `;
        cartItemsEl.appendChild(itemEl);
    });
    }