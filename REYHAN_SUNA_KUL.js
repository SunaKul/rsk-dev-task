(() => {
  'use strict';

  
// Only works on https://www.e-bebek.com 
 if (window.top !== window) { return; }
  if (
    location.protocol !== 'https:' ||
    location.origin !== 'https://www.e-bebek.com' ||
    !['/', '/index.html'].includes(location.pathname)
  ) {

   try {
      console.warn('[rk] wrong page:', location.href);
    } catch { }
    return;
  }


  // Getting the dataset from the given URL that is stated at guideline.
  const JSON_URL = "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json";
  const LS_PRODUCTS = "rk_products_v1";
  const TITLE = "Beğenebileceğinizi düşündüklerimiz";
  const LS_FAVS = "rk_favs_v1";

  const favSet = new Set((() => {
    try {
      return JSON.parse(localStorage.getItem(LS_FAVS) || "[]");
    } catch { return []; }
  })().map(String));

const fmtTRY = n => {
  const num = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(n) || 0);
  return num + " TL";
};

  const readJSON = (k, d) => {
    try {
      const s = localStorage.getItem(k);
      return s ? JSON.parse(s) : d;
    } catch { return d; }
  };
  const writeJSON = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch { }
  };

 // Getting the products with caching else fetching.
  function getProducts() {
    const cached = readJSON(LS_PRODUCTS, null);
    if (cached && Array.isArray(cached) && cached.length) return Promise.resolve(cached);

    return fetch(JSON_URL, { method: "GET", mode: "cors", credentials: "omit" })
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
        writeJSON(LS_PRODUCTS, arr);
        return arr;
      })
      .catch(() => []);
  }

  // I tried to build the carousel based on the existing one on the page. That's why in here looking for sample carousel and card.
  const selectedCarousel = (() => {
    const title = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(h => (h.textContent || "").trim().toLowerCase() === "sizin için seçtiklerimiz");
    return title ? (title.closest("eb-product-carousel") || title.closest("section,div,article") || title.parentElement) : null;
  })();
  const templateCard = selectedCarousel && selectedCarousel.querySelector(".product-item");

  // CSS attempts to make my carousel look like the sample banner and cards. They are not twins but sisters.
  const style = document.createElement("style");
  style.textContent = `
#rk-carousel-root{max-width:1280px;margin:16px auto;padding:0 8px;position:relative}
#rk-carousel-root .rk-bar{display:flex;align-items:center;gap:10px;margin:0 12px 12px}
#rk-carousel-root .rk-title{font-size:28px;font-weight:700;color:#4d4036}
#rk-carousel-root .rk-rail{position:relative;overflow:hidden}
#rk-carousel-root .rk-track{display:flex;gap:12px;transition:transform .35s ease;will-change:transform}

#rk-carousel-root .rk-arrow{
  width: 50px !important;
  height: 50px !important;
  font-size: 26px !important;
  border-radius: 50% !important;
  display: grid !important;
  place-items: center !important;
  z-index: 6 !important;
  border: 1px solid #ffd3a8 !important;
  background: #fff3e0 !important;
  color: #f18700 !important;
  box-shadow: 0 6px 16px rgba(0,0,0,.08) !important;
  position: absolute;         /* EKLE */
  top: 50%;                   /* EKLE */
  transform: translateY(-50%);/* EKLE */
  z-index: 6 !important;
}

#rk-carousel-root .rk-arrow:hover{
  background: #ffffff !important;
  color: #f18700 !important;
}

#rk-carousel-root .rk-rail{ overflow: visible !important; }

#rk-carousel-root .rk-prev{ left: -68px !important; }
#rk-carousel-root .rk-next{ right: -68px !important; }

@media (max-width: 768px){
  #rk-carousel-root .rk-prev{ left: -36px !important; }
  #rk-carousel-root .rk-next{ right: -36px !important; }
}

/* adjusting favorite (heart) icon's looking during hover, plain and clicked, yet not perfect. */
#rk-carousel-root .rk-heart-wrap { position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; cursor: pointer; z-index: 10; }
#rk-carousel-root .rk-heart-wrap .heart { position: relative; width: 100%; height: 100%; }
#rk-carousel-root .rk-heart-wrap .heart-icon { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; display: none; transition: opacity 0.2s ease; pointer-events: none; }

#rk-carousel-root .rk-heart-wrap .heart-icon.default { display: block; }

#rk-carousel-root .rk-heart-wrap:hover .heart-icon.default { display: none; }
#rk-carousel-root .rk-heart-wrap:hover .heart-icon.hovered { display: block; }

#rk-carousel-root .rk-heart-wrap.is-on .heart-icon { display: none; }
#rk-carousel-root .rk-heart-wrap.is-on .heart-icon.selected { display: block; }
#rk-carousel-root .add-to-cart-container {
  display: flex;
  justify-content: center;
  margin-top: auto;  
}

 /* add to card button */
#rk-carousel-root .add-to-cart-btn {
  width: 90%;        
  padding: 10px 0;   
  background-color: #fff7ec;
  color: #f18700;
  border: none;
  border-radius: 30px;  
  font-weight: 600;
  font-size: 14px;    
  cursor: pointer;
  transition: background-color 0.2s ease;
}

#rk-carousel-root .add-to-cart-btn:hover {
  background-color: #f18700;
  color: #fff;             
}

#rk-carousel-root .product-item { height: 540px; display: flex; flex-direction: column; justify-content: space-between; }

/* displaying price information (discounted and not discounted) */
#rk-carousel-root .product-item__price { 
  margin-top: auto; 
  padding-top: 12px; 
  display: flex; 
  flex-direction: column; 
  gap: 4px;
   margin-bottom: 60px;
}
#rk-carousel-root .rk-price-top{
  display:flex; 
  align-items:center; 
  gap:6px;
}
#rk-carousel-root .product-item__old-price{
  text-decoration: line-through;
  color:#999;
  font-size:14px;
}
#rk-carousel-root .product-item__percent{
  font-weight:700;
  font-size:14px;
  color:#f18700;
}
#rk-carousel-root .product-item__new-price{
  font-size:20px;
  font-weight:700;
  margin-top:2px;
}

#rk-carousel-root .discount-badge {
  color: #2ecc71;
  font-weight: 700;
 background: none; 
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 14px;
}

/* banner adjusting */
:root{

  --rk-banner-bg:    #fff4e8;   
  --rk-banner-bd:    #ffe3c7;   
  --rk-banner-text:  #4d4036;   
  --rk-accent:       #f18700;   
}

#rk-carousel-root .rk-bar{
  background: var(--rk-banner-bg);
  border: 1px solid var(--rk-banner-bd);
  border-radius: 14px;
  padding: 10px 16px;
  margin: 0 12px 16px;       
}
#rk-carousel-root .rk-title{
  color: var(--rk-banner-text);
  font-size: 20px;           
  font-weight: 700;
  line-height: 1.1;
}

#rk-carousel-root .rk-arrow{
  background: #fff;
  border: 1px solid var(--rk-banner-bd);
  color: var(--rk-accent);
  box-shadow: 0 6px 16px rgba(0,0,0,.08);
}


#rk-carousel-root .rk-rail{
  margin-top: 6px;
}
#rk-carousel-root eb-carousel-header { display:block; margin: 0 12px 12px; }
#rk-carousel-root {
  max-width:1280px;
  margin:16px auto;
  padding:0 8px; 
  position:relative;
}

#rk-carousel-root eb-carousel-header {
  display:block;
  margin:0;       
  padding:0 0 12px;
}

#rk-carousel-root .add-to-cart-container {
  margin-top: auto;  
  padding-bottom: 12px; 
}
/* displaying arrows */
#rk-carousel-root .rk-arrow[disabled]{
  opacity: 1 !important;
  cursor: pointer !important;
}

/* avoiding exceeding of products inside the rail */
#rk-carousel-root .rk-rail{
  overflow: hidden !important;
  position: relative;
}
/* percentage discount css */
#rk-carousel-root .product-item__percent,
#rk-carousel-root .carousel-product-price-percent {
  display: inline-flex; align-items: center;
  gap: 4px;font-weight: 700;
  font-size: 20px; color: #00a365 !important;
}

/* discount badge displaying */
#rk-carousel-root .discount-badge{
  background: #fff !important; 
  color: #00a365 !important;padding: 4px 8px;   line-height: 1;
  font-size: 20px;         
}
#rk-carousel-root .discount-badge .icon,
#rk-carousel-root .product-item__percent .icon-decrease{
  color: inherit !important;
  font-size: 0.95em;
}
#rk-carousel-root .product-item__old-price{
  font-size: 14px;
}
#rk-carousel-root .product-item__price{
  padding-top: 20px; 
}
#rk-carousel-root .product-item-content{
  display: flex;
  flex-direction: column;
  gap: 8px;
}

  `;
  document.head.appendChild(style);

// Building root carousel structure
const root = document.createElement("section");
root.id = "rk-carousel-root";

const header = document.createElement("eb-carousel-header");
header.innerHTML = `
  <div class="banner__titles">
    <h2 class="title-primary">${TITLE}</h2>
  </div>
`;

//  Rail, track and arrows building
const rail = document.createElement("div"); rail.className = "rk-rail";
const track = document.createElement("div"); track.className = "rk-track";
const prev = document.createElement("button"); prev.className = "rk-arrow rk-prev"; prev.textContent = "<";
const next = document.createElement("button"); next.className = "rk-arrow rk-next"; next.textContent = ">";

rail.appendChild(track);
root.appendChild(rail);
root.appendChild(prev);
root.appendChild(next);

root.appendChild(header);
root.appendChild(rail);

// Inserting the carousel into the page
if (selectedCarousel && selectedCarousel.parentNode) {
  selectedCarousel.parentNode.insertBefore(root, selectedCarousel);
} else {
  (document.querySelector("main,#main,[role='main']") || document.body)
    .insertBefore(root, document.body.children[1] || null);
}


//Add-remove from favorites mechanism
function attachFav(card, key, imgNode) {
  card.querySelectorAll("eb-add-to-wish-list, .heart, a[href='/login']").forEach(n => {
    if (n && n.parentNode && !n.closest(".rk-heart-wrap")) n.parentNode.removeChild(n);
  });

  const holder = (imgNode && imgNode.parentElement) ? imgNode.parentElement : card;
  holder.style.position = "relative";

  // Wrapping div elements
  const wrap = document.createElement("div");
  wrap.className = "rk-heart-wrap" + (favSet.has(key) ? " is-on" : "");
  wrap.style.cssText = "position:absolute;top:10px;right:10px;cursor:pointer;";
  wrap.setAttribute("role", "button");
  wrap.setAttribute("aria-label", "Favorilere ekle/çıkar");
  wrap.tabIndex = 0;

  const heart = document.createElement("div");
  heart.className = "heart";
  heart.innerHTML = `
    <img id="default-favorite" src="assets/svg/default-favorite.svg" alt="heart" class="heart-icon default">
    <img src="assets/svg/default-hover-favorite.svg" alt="hover heart" class="heart-icon hovered">
    <img src="assets/svg/added-favorite-hover.svg" alt="added heart" class="heart-icon selected">
  `;

  wrap.appendChild(heart);
  holder.appendChild(wrap);

  const block = (e) => { e.preventDefault(); e.stopPropagation(); };
  wrap.addEventListener("mousedown", block);
  wrap.addEventListener("touchstart", block, { passive: false });

// Change the state on click
  wrap.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (favSet.has(key)) {
      favSet.delete(key);
      wrap.classList.remove("is-on");
    } else {
      favSet.add(key);
      wrap.classList.add("is-on");
    }
    localStorage.setItem(LS_FAVS, JSON.stringify(Array.from(favSet)));
  });

  //Keyboard accessibility
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      wrap.click();
    }
  });
}


  // Filling the card with product data
  function patchCard(card, p) {
    card.removeAttribute("id");
    card.querySelectorAll("[id]").forEach(n => n.removeAttribute("id"));
    card.querySelectorAll(".stars-wrapper, cx-star-rating, .review-count").forEach(n => n.remove());
    card.querySelectorAll(".product-item__multiple-badge, .product__video-badge, .product__ar-badge").forEach(n => n.remove());

    const productLinks = [...card.querySelectorAll("a.product-item-anchor[href]")];
    productLinks.forEach(a => {
      a.href = p.url || "#";
      a.target = "_blank";
      a.rel = "noopener";
    });

    const h2 = card.querySelector("h2.product-item__brand");
    if (h2) h2.innerHTML = `<b>${(p.brand || "").trim()} - </b><span>${(p.name || "").trim()}</span>`;

    const imgs = [];
    const figImg = card.querySelector("figure img");
    if (figImg) imgs.push(figImg);
    const cxImg = card.querySelector("cx-media img");
    if (cxImg) imgs.push(cxImg);
    imgs.forEach(img => {
      const src = p.img || p.image || "";
      if (src) {
        img.src = src;
        img.setAttribute("data-src", src);
      }
      img.alt = (p.name || "").trim();
      img.classList.remove("is-loading", "lazyload");
      img.classList.add("lazyloaded");
    });

    let priceWrap = card.querySelector(".product-item__price");
    if (!priceWrap) {
      priceWrap = document.createElement("div");
      priceWrap.className = "product-item__price";
    }

    let topRow = priceWrap.querySelector(".rk-price-top");
    if (!topRow) {
      topRow = document.createElement("div");
      topRow.className = "rk-price-top";
      priceWrap.appendChild(topRow);
    }

    let oldEl = priceWrap.querySelector(".product-item__old-price");
    if (!oldEl) {
      oldEl = document.createElement("span");
      oldEl.className = "product-item__old-price";
    }

    let pctEl = priceWrap.querySelector(".product-item__percent, .carousel-product-price-percent");
    if (!pctEl) {
      pctEl = document.createElement("span");
      pctEl.className = "product-item__percent carousel-product-price-percent ml-2 discount-badge";

    }

    //New discounted price
    let newEl = priceWrap.querySelector(".product-item__new-price");
    if (!newEl) {
      newEl = document.createElement("span");
      newEl.className = "product-item__new-price";
    }

    // Get the dicounted price if any
    newEl.textContent = fmtTRY(p.price);
    if (p.original_price && p.original_price > p.price) {
      oldEl.style.display = "";
      oldEl.textContent = fmtTRY(p.original_price);
      const perc = Math.round(100 * (p.original_price - p.price) / Math.max(1, p.original_price));
      pctEl.style.display = "";
      pctEl.innerHTML = `%${perc} <i class="icon icon-decrease"></i>`;
      newEl.classList.add("discount-product");
    } else {
      oldEl.style.display = "none";
      pctEl.style.display = "none";
      newEl.classList.remove("discount-product");
    }

    topRow.innerHTML = "";
    if (oldEl.style.display !== "none") topRow.appendChild(oldEl);
    if (pctEl.style.display !== "none") topRow.appendChild(pctEl);

    if (!newEl.parentElement || newEl.parentElement !== priceWrap) {
      priceWrap.appendChild(newEl);
    } else {
      priceWrap.appendChild(newEl);
    }

     // Price wrap (content including old, new, pct)
    const content = card.querySelector(".product-item-content");
    if (content && !content.contains(priceWrap)) {
      content.appendChild(priceWrap);
    }

    //Add to cart button
    let btnContainer = card.querySelector(".add-to-cart-container");
    if (!btnContainer) {
      btnContainer = document.createElement("div");
      btnContainer.className = "add-to-cart-container";
      const btn = document.createElement("button");
      btn.className = "add-to-cart-btn";
      btn.textContent = "Sepete Ekle";
      btnContainer.appendChild(btn);
    }
   if (content && !btnContainer.parentElement) {
  content.appendChild(btnContainer);
}
card.appendChild(content);


    //Favorites
    card.querySelectorAll("eb-add-to-wish-list, .heart").forEach(n=>{ if (!n.closest(".rk-heart-wrap")) n.remove(); });
    attachFav(card, String(p.id), imgs[0] || null);
    card.addEventListener("click", (e) => {
      if (e.target.closest("a,button,input,.rk-heart-wrap")) return;
      if (p.url) window.open(p.url, "_blank", "noopener");
    });

    return card;
  }

  //Create a card from scratch if no template found
  function buildCard(p) {
    if (!templateCard) {
      const el = document.createElement("div");
      el.style.cssText = "border:1px solid #eee;border-radius:12px;padding:8px;width:335px;background:#fff";
      const im = document.createElement("img");
      im.src = p.img || p.image || "";
      im.alt = p.name || "";
      im.style.cssText = "width:100%;aspect-ratio:4/3;object-fit:contain;background:#fafafa";
      const nm = document.createElement("div");
      nm.innerHTML = `<b>${p.brand || ""} - </b>${p.name || ""}`;
      nm.style.margin = "6px 0";
      const pr = document.createElement("div");
      pr.textContent = fmtTRY(p.price);
      pr.style.fontWeight = "700";
      el.appendChild(im);
      el.appendChild(nm);
      el.appendChild(pr);
      el.addEventListener("click", () => {
        if (p.url) window.open(p.url, "_blank", "noopener");
      });
      return el;
    }
    const c = templateCard.cloneNode(true);
    const contents = c.querySelectorAll(".product-item-content");
    for (let i = 1; i < contents.length; i++) contents[i].remove();
    const promo = c.querySelector(".product-list-promo");
    if (promo) promo.style.display = "none";
    return patchCard(c, p);
  }

  const CARD_W = 260, GAP = 16;
  let idx = 0;

  function update() {
    const first = track.firstElementChild;
    const cardW = first ? Math.round(first.getBoundingClientRect().width) : CARD_W;
    const total = track.children.length;
    const visible = Math.max(1, Math.floor(rail.clientWidth / (cardW + GAP)));
    const maxIdx = Math.max(0, total - visible);
    idx = Math.max(0, Math.min(idx, maxIdx));
    track.style.transform = `translate3d(${-(cardW + GAP) * idx}px,0,0)`;
    prev.disabled = (idx <= 0);
    next.disabled = (idx >= maxIdx);
  }

  prev.addEventListener("click", () => { idx--; update(); });
  next.addEventListener("click", () => { idx++; update(); });
  new ResizeObserver(update).observe(rail);

//Rendering the products into the track
  function render(list) {
    track.innerHTML = "";
    list.forEach(p => {
      const holder = document.createElement("div");
      holder.style.cssText = `width:${CARD_W}px; margin-right:${GAP}px; flex:0 0 auto;`;
      holder.appendChild(buildCard(p));
      track.appendChild(holder);
    });
    update();
  }

  getProducts().then(render);
})();