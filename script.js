const products = [
  {
    id: 1,
    name: "Kinder sladký dort",
    category: "cake",
    price: 1000,
    desc: "Velký sladký dort z oblíbených Kinder dobrot s výraznou stuhou.",
    badge: "NEJOBLÍBENĚJŠÍ",
    image: "images/produkt-1.png"
  },
  {
    id: 2,
    name: "Vánoční modrá kytice",
    category: "bouquet",
    price: 550,
    desc: "Sladká vánoční kytice v modrém provedení se zimní výzdobou.",
    badge: "NOVINKA",
    image: "images/produkt-2.jpeg"
  },
  {
    id: 3,
    name: "Vánoční červená kytice",
    category: "bouquet",
    price: 590,
    desc: "Elegantní vánoční sladká kytice v červených a zelených tónech.",
    badge: "VÁNOCE",
    image: "images/produkt-3.jpeg"
  },
  {
    id: 4,
    name: "Raffaello & Kinder dort",
    category: "cake",
    price: 600,
    desc: "Sladký dort s Raffaello, Kinder a ozdobnými červenými růžemi.",
    badge: "TOP",
    image: "images/produkt-4.jpeg"
  },
  {
    id: 5,
    name: "Kinder mini box",
    category: "gift",
    price: 500,
    desc: "Roztomilý sladký dárek vhodný jako malé překvapení pro radost.",
    badge: "",
    image: "images/produkt-6.webp"
  },
  }
];

let activeCategory = "all";
let cart = JSON.parse(localStorage.getItem("floreaCart") || "[]");

const productsGrid = document.getElementById("productsGrid");
const productSearch = document.getElementById("productSearch");
const globalSearch = document.getElementById("globalSearch");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const productModal = document.getElementById("productModal");
const modalContent = document.getElementById("modalContent");

const formatPrice = value => `${value.toLocaleString("cs-CZ")} Kč`;

function filteredProducts(term = "") {
  const search = term.trim().toLowerCase();

  return products.filter(product => {
    const categoryOk = activeCategory === "all" || product.category === activeCategory;
    const searchOk = !search ||
      product.name.toLowerCase().includes(search) ||
      product.desc.toLowerCase().includes(search);
    return categoryOk && searchOk;
  });
}

function renderProducts(term = productSearch.value) {
  const list = filteredProducts(term);

  if (!list.length) {
    productsGrid.innerHTML = `<div class="no-results">Žádný produkt neodpovídá vašemu hledání.</div>`;
    return;
  }

  productsGrid.innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-image">
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
        <img src="${product.image}" alt="${product.name}" class="product-photo">
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.desc}</p>
        <div class="product-meta">
          <span class="price">${formatPrice(product.price)}</span>
          <div class="product-actions">
            <button class="small-btn" data-detail="${product.id}">Detail</button>
            <button class="small-btn dark" data-add="${product.id}">Přidat</button>
          </div>
        </div>
      </div>
    </article>
  `).join("");
}

function saveCart() {
  localStorage.setItem("floreaCart", JSON.stringify(cart));
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);
  existing ? existing.qty++ : cart.push({id, qty: 1});

  saveCart();
  renderCart();
  openCart();
}

function changeQty(id, amount) {
  const item = cart.find(x => x.id === id);
  if (!item) return;

  item.qty += amount;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);

  saveCart();
  renderCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = count;

  if (!cart.length) {
    cartItems.innerHTML = `<p class="empty-cart">Váš košík je zatím prázdný.</p>`;
    cartTotal.textContent = "0 Kč";
    return;
  }

  let total = 0;

  cartItems.innerHTML = cart.map(item => {
    const product = products.find(x => x.id === item.id);
    if (!product) return "";

    total += product.price * item.qty;

    return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h4>${product.name}</h4>
          <p>${formatPrice(product.price)}</p>
          <div class="qty-controls">
            <button data-minus="${product.id}">−</button>
            <span>${item.qty}</span>
            <button data-plus="${product.id}">+</button>
          </div>
        </div>
        <button class="remove-item" data-remove="${product.id}">×</button>
      </div>
    `;
  }).join("");

  cartTotal.textContent = formatPrice(total);
}

function openCart() {
  cartPanel.classList.add("open");
  overlay.classList.add("show");
}

function closeCart() {
  cartPanel.classList.remove("open");
  overlay.classList.remove("show");
}

function openModal(id) {
  const product = products.find(x => x.id === id);
  if (!product) return;

  modalContent.innerHTML = `
    <div class="modal-product">
      <img src="${product.image}" alt="${product.name}">
      <div>
        ${product.badge ? `<div class="section-label">${product.badge}</div>` : ""}
        <h2>${product.name}</h2>
        <p>${product.desc}</p>
        <div class="price">${formatPrice(product.price)}</div>
        <button class="btn btn-primary" data-modal-add="${product.id}">Přidat do košíku</button>
      </div>
    </div>
  `;

  productModal.classList.add("open");
}

document.getElementById("filters").addEventListener("click", e => {
  const button = e.target.closest(".filter");
  if (!button) return;

  document.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
  button.classList.add("active");
  activeCategory = button.dataset.category;
  renderProducts();
});

productSearch.addEventListener("input", () => renderProducts(productSearch.value));

document.getElementById("searchBtn").addEventListener("click", () => {
  document.getElementById("searchPanel").classList.add("open");
  globalSearch.focus();
});

document.getElementById("closeSearch").addEventListener("click", () => {
  document.getElementById("searchPanel").classList.remove("open");
});

globalSearch.addEventListener("input", () => {
  productSearch.value = globalSearch.value;
  document.getElementById("searchPanel").classList.remove("open");
  document.getElementById("products").scrollIntoView({behavior:"smooth"});
  renderProducts(globalSearch.value);
});

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

productsGrid.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  const detail = e.target.closest("[data-detail]");

  if (add) addToCart(Number(add.dataset.add));
  if (detail) openModal(Number(detail.dataset.detail));
});

cartItems.addEventListener("click", e => {
  const plus = e.target.closest("[data-plus]");
  const minus = e.target.closest("[data-minus]");
  const remove = e.target.closest("[data-remove]");

  if (plus) changeQty(Number(plus.dataset.plus), 1);
  if (minus) changeQty(Number(minus.dataset.minus), -1);

  if (remove) {
    cart = cart.filter(x => x.id !== Number(remove.dataset.remove));
    saveCart();
    renderCart();
  }
});

document.getElementById("modalClose").addEventListener("click", () => {
  productModal.classList.remove("open");
});

productModal.addEventListener("click", e => {
  if (e.target === productModal) productModal.classList.remove("open");
});

modalContent.addEventListener("click", e => {
  const button = e.target.closest("[data-modal-add]");
  if (!button) return;

  addToCart(Number(button.dataset.modalAdd));
  productModal.classList.remove("open");
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) {
    alert("Košík je zatím prázdný.");
    return;
  }

  alert("Tato verze webu je demo. Pro skutečné objednávky lze později napojit objednávkový formulář.");
});

document.getElementById("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  alert("Děkujeme za zprávu! Formulář je zatím v demo režimu.");
  e.target.reset();
});

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.addEventListener("click", e => {
  if (e.target.tagName === "A") navLinks.classList.remove("open");
});

const chatToggle = document.getElementById("chatToggle");
const chatWindow = document.getElementById("chatWindow");
const chatClose = document.getElementById("chatClose");
const chatMessages = document.getElementById("chatMessages");

chatToggle.addEventListener("click", () => chatWindow.classList.toggle("open"));
chatClose.addEventListener("click", () => chatWindow.classList.remove("open"));

const replies = {
  "Chci dárek k narozeninám": "Na narozeniny doporučuji sladký dort nebo dárkový box. Máte rozpočet od 350 Kč.",
  "Chci sladkou kytici": "Máme sladké kytice v různých barevných provedeních. Vyberte si produkt v nabídce.",
  "Chci dárek do 500 Kč": "V nabídce najdete produkty za 350 Kč, 450 Kč a 490 Kč.",
  "Jak objednat?": "Vyberte produkt, přidejte ho do košíku a následně nás můžete kontaktovat přes e-mail nebo Instagram."
};

document.querySelectorAll(".quick-replies button").forEach(button => {
  button.addEventListener("click", () => {
    const message = button.dataset.message;
    chatMessages.insertAdjacentHTML("beforeend", `<div class="user-message">${message}</div>`);
    chatMessages.insertAdjacentHTML("beforeend", `<div class="bot-message">${replies[message]}</div>`);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
});

renderProducts();
renderCart();
