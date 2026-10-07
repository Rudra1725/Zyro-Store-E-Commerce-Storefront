const OWNER_PHONE = "919096925270"; // Target WhatsApp
const ADMIN_SECRET_PIN = "7020";   // Change your PIN here

const initialProducts = [
  {
    id: "zyro-101",
    title: "Aether Pro Wireless ANC Headphones",
    desc: "Spatial audio, active noise cancelling with 40-hour battery life and fast charging.",
    price: 3499,
    originalPrice: 5999,
    category: "Audio",
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80"
  },
  {
    id: "zyro-102",
    title: "CyberPulse RGB Mechanical Keyboard",
    desc: "Hot-swappable tactile switches, frosted polycarbonate casing & south-facing LEDs.",
    price: 2899,
    originalPrice: 4299,
    category: "Peripherals",
    badge: "HOT",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&q=80"
  },
  {
    id: "zyro-103",
    title: "Quantum 65W GaN Travel Charger",
    desc: "Ultra-compact dual USB-C + USB-A ports with smart dynamic power delivery.",
    price: 1199,
    originalPrice: 1999,
    category: "Power",
    badge: "SALE",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=80"
  },
  {
    id: "zyro-104",
    title: "Phantom X Precision Wireless Mouse",
    desc: "Ultra-lightweight 58g chassis, 26,000 DPI optical sensor, zero latency radio link.",
    price: 1699,
    originalPrice: 2799,
    category: "Peripherals",
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&q=80"
  },
  {
    id: "zyro-105",
    title: "SonicPod True Wireless Earbuds",
    desc: "Ceramic dynamic drivers, wireless charging case, low-latency gaming mode.",
    price: 1499,
    originalPrice: 2999,
    category: "Audio",
    badge: null,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&q=80"
  },
  {
    id: "zyro-106",
    title: "Nova 20,000mAh Magnetic Power Bank",
    desc: "Qi2 wireless rapid charging + 30W bi-directional USB-PD with digital LED display.",
    price: 2199,
    originalPrice: 3499,
    category: "Power",
    badge: "HOT",
    image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=700&q=80"
  }
];

let products = JSON.parse(localStorage.getItem("zyro_products")) || initialProducts;
let cart = JSON.parse(localStorage.getItem("zyro_cart")) || {};
let isAdminMode = false;
let activeCategory = "All";
let searchQuery = "";
let uploadedImageBase64 = "";
let logoClickCount = 0;
let logoClickTimer = null;

function saveProducts() {
  localStorage.setItem("zyro_products", JSON.stringify(products));
  renderCatalog();
}

function saveCart() {
  localStorage.setItem("zyro_cart", JSON.stringify(cart));
  renderCartUI();
}

/* Secret / Controlled Admin Access */
function checkAdminAccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const hasUrlTrigger = urlParams.get('admin') === '1' || urlParams.get('admin') === 'true';
  const isSavedAdmin = localStorage.getItem("zyro_is_admin") === "true";

  if (hasUrlTrigger || isSavedAdmin) {
    const btn = document.getElementById("adminToggleBtn");
    btn.classList.remove("hidden");
    btn.classList.add("flex");
  }

  if (isSavedAdmin) {
    enableAdminMode();
  }
}

// Secret: Triple-click the Z logo
function handleLogoSecretClick() {
  logoClickCount++;
  clearTimeout(logoClickTimer);
  logoClickTimer = setTimeout(() => {
    logoClickCount = 0;
  }, 800);

  if (logoClickCount === 3) {
    logoClickCount = 0;
    const btn = document.getElementById("adminToggleBtn");
    btn.classList.remove("hidden");
    btn.classList.add("flex");
    promptAdminAuth();
  }
}

function promptAdminAuth() {
  if (isAdminMode) {
    if (confirm("Do you want to log out of Admin Mode?")) {
      logoutAdminMode();
    }
  } else {
    document.getElementById("adminAuthModal").classList.remove("hidden");
    document.getElementById("adminAuthModal").classList.add("flex");
    document.getElementById("adminPinInput").value = "";
    document.getElementById("adminPinInput").focus();
  }
}

function closeAdminAuthModal() {
  document.getElementById("adminAuthModal").classList.add("hidden");
  document.getElementById("adminAuthModal").classList.remove("flex");
}

function verifyAdminPin() {
  const entered = document.getElementById("adminPinInput").value;
  if (entered === ADMIN_SECRET_PIN) {
    localStorage.setItem("zyro_is_admin", "true");
    closeAdminAuthModal();
    enableAdminMode();
    showToast("Admin Mode Activated");
  } else {
    alert("Incorrect Admin PIN");
    document.getElementById("adminPinInput").value = "";
  }
}

function enableAdminMode() {
  isAdminMode = true;
  document.getElementById("adminBanner").classList.remove("hidden");
  document.getElementById("adminBanner").classList.add("flex");

  const btn = document.getElementById("adminToggleBtn");
  btn.classList.remove("hidden");
  btn.classList.add("flex", "bg-indigo-600", "text-white");
  btn.classList.remove("bg-slate-800/80", "text-slate-300");
  document.getElementById("adminToggleLabel").textContent = "Exit Admin";

  renderCatalog();
}

function logoutAdminMode() {
  isAdminMode = false;
  localStorage.removeItem("zyro_is_admin");
  document.getElementById("adminBanner").classList.add("hidden");
  document.getElementById("adminBanner").classList.remove("flex");

  const btn = document.getElementById("adminToggleBtn");
  btn.classList.remove("bg-indigo-600", "text-white");
  btn.classList.add("bg-slate-800/80", "text-slate-300");
  document.getElementById("adminToggleLabel").textContent = "Owner Login";

  showToast("Logged out of Admin Mode");
  renderCatalog();
}

/* Product Grid */
function renderCatalog() {
  const grid = document.getElementById("productGrid");
  const emptyState = document.getElementById("emptyCatalogState");

  const filtered = products.filter(p => {
    const matchesCategory = (activeCategory === "All") || (p.category === activeCategory);
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  grid.innerHTML = filtered.map(p => {
    const hasOriginal = p.originalPrice && Number(p.originalPrice) > Number(p.price);
    const discountPct = hasOriginal ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

    return `
      <div class="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group">
        <div class="relative w-full aspect-[4/3] bg-zyro-950 overflow-hidden">
          <img 
            src="${p.image || 'https://placehold.co/600x400/0b0f19/818cf8?text=Zyro+Gear'}" 
            alt="${p.title}" 
            onerror="this.src='https://placehold.co/600x400/0b0f19/818cf8?text=Zyro+Product'"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            ${p.badge ? `
              <span class="px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase bg-indigo-600/90 text-white backdrop-blur-md">
                ${p.badge}
              </span>
            ` : ''}
            ${discountPct > 0 ? `
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zyro-emerald/90 text-white">
                ${discountPct}% OFF
              </span>
            ` : ''}
          </div>
          <div class="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-slate-300 backdrop-blur-md">
            ${p.category || 'Gear'}
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-display font-bold text-base text-white tracking-wide leading-snug line-clamp-1 group-hover:text-indigo-400 transition-colors">
              ${p.title}
            </h3>
            <p class="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              ${p.desc || 'No description provided.'}
            </p>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/80">
            <div class="flex items-baseline gap-2 mb-3">
              <span class="font-display font-bold text-lg text-white">₹${Number(p.price).toLocaleString('en-IN')}</span>
              ${hasOriginal ? `
                <span class="text-xs text-slate-500 line-through">₹${Number(p.originalPrice).toLocaleString('en-IN')}</span>
              ` : ''}
            </div>

            <button 
              onclick="addToCart('${p.id}')"
              class="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
            >
              <i class="fa-solid fa-plus text-[10px]"></i>
              <span>Add to Bag</span>
            </button>

            ${isAdminMode ? `
              <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
                <button 
                  onclick="openProductModal('${p.id}')" 
                  class="py-1.5 px-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <i class="fa-solid fa-pen text-[10px]"></i> Edit
                </button>
                <button 
                  onclick="deleteProduct('${p.id}')" 
                  class="py-1.5 px-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <i class="fa-solid fa-trash text-[10px]"></i> Delete
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterCategory(cat) {
  activeCategory = cat;
  const pills = document.querySelectorAll("#categoryPills .cat-pill");
  pills.forEach(pill => {
    if (pill.textContent === cat) {
      pill.className = "cat-pill active px-3.5 py-1.5 rounded-full text-xs font-medium bg-indigo-600 text-white transition-colors";
    } else {
      pill.className = "cat-pill px-3.5 py-1.5 rounded-full text-xs font-medium bg-zyro-850 hover:bg-zyro-800 text-slate-300 border border-slate-700/60 transition-colors";
    }
  });
  renderCatalog();
}

function handleSearch(val) {
  searchQuery = val.trim();
  renderCatalog();
}

/* Cart Management */
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  const p = products.find(x => x.id === id);
  showToast(`Added "${p ? p.title.substring(0, 20) + '...' : 'Item'}" to bag`);
}

function changeQuantity(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) {
    delete cart[id];
  }
  saveCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  showToast("Item removed from bag");
}

function renderCartUI() {
  const itemsContainer = document.getElementById("cartItemsContainer");
  const buyerForm = document.getElementById("buyerDetailsContainer");
  const badge = document.getElementById("cartCountBadge");
  const drawerCount = document.getElementById("cartCountDrawer");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalEl = document.getElementById("cartTotal");

  const itemIds = Object.keys(cart);
  const totalItemCount = itemIds.reduce((sum, id) => sum + cart[id], 0);

  badge.textContent = totalItemCount;
  drawerCount.textContent = totalItemCount;

  if (itemIds.length === 0) {
    buyerForm.classList.add("hidden");
    itemsContainer.innerHTML = `
      <div class="h-64 flex flex-col items-center justify-center text-center p-6">
        <div class="w-14 h-14 rounded-2xl bg-zyro-850 flex items-center justify-center text-slate-600 text-xl mb-3">
          <i class="fa-solid fa-bag-shopping"></i>
        </div>
        <h4 class="text-sm font-bold text-slate-300">Your bag is empty</h4>
        <p class="text-xs text-slate-500 mt-1 max-w-[200px]">Browse our collection and add tech essentials.</p>
      </div>
    `;
    subtotalEl.textContent = "₹0";
    totalEl.textContent = "₹0";
    return;
  }

  buyerForm.classList.remove("hidden");
  let grandTotal = 0;
  itemsContainer.innerHTML = itemIds.map(id => {
    const prod = products.find(p => p.id === id);
    if (!prod) return '';

    const qty = cart[id];
    const lineTotal = Number(prod.price) * qty;
    grandTotal += lineTotal;

    return `
      <div class="flex items-center gap-3 p-3 bg-zyro-950 rounded-2xl border border-slate-800">
        <img 
          src="${prod.image}" 
          alt="${prod.title}" 
          onerror="this.src='https://placehold.co/100x100/0b0f19/818cf8?text=Gear'"
          class="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
        />
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-white truncate">${prod.title}</h4>
          <p class="text-[11px] text-slate-400 mt-0.5">₹${Number(prod.price).toLocaleString('en-IN')}</p>
          
          <div class="flex items-center gap-2 mt-2">
            <div class="flex items-center border border-slate-700 rounded-lg bg-zyro-900 overflow-hidden">
              <button onclick="changeQuantity('${id}', -1)" class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 text-xs">-</button>
              <span class="w-7 text-center text-xs font-bold text-slate-200">${qty}</span>
              <button onclick="changeQuantity('${id}', 1)" class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 text-xs">+</button>
            </div>
            <button onclick="removeFromCart('${id}')" class="text-slate-500 hover:text-rose-400 text-xs p-1 ml-auto">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
        <div class="text-right pl-2">
          <span class="text-xs font-bold font-display text-indigo-300">₹${lineTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>
    `;
  }).join('');

  subtotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
  totalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
}

function openCartDrawer() {
  document.getElementById("cartBackdrop").classList.remove("pointer-events-none", "opacity-0");
  document.getElementById("cartBackdrop").classList.add("opacity-100");
  document.getElementById("cartDrawer").classList.remove("translate-x-full");
}

function closeCartDrawer() {
  document.getElementById("cartBackdrop").classList.remove("opacity-100");
  document.getElementById("cartBackdrop").classList.add("opacity-0", "pointer-events-none");
  document.getElementById("cartDrawer").classList.add("translate-x-full");
}

/* WhatsApp Checkout with Buyer Information */
function proceedToWhatsApp() {
  const itemIds = Object.keys(cart);
  if (itemIds.length === 0) {
    showToast("Your cart is empty! Add products first.");
    return;
  }

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();

  if (!name || !phone || !address) {
    showToast("Please fill in your Name, Phone, and Address!");
    document.getElementById("custName").focus();
    return;
  }

  let orderSummary = `*⚡ NEW ORDER INQUIRY - ZYRO STORE ⚡*\n`;
  orderSummary += `─────────────────────────\n`;
  orderSummary += `*CUSTOMER DETAILS:*\n`;
  orderSummary += `• Name: ${name}\n`;
  orderSummary += `• Mobile: ${phone}\n`;
  orderSummary += `• Delivery Address: ${address}\n`;
  orderSummary += `─────────────────────────\n`;
  orderSummary += `*ORDER ITEMS:*\n`;

  let total = 0;
  let count = 1;

  itemIds.forEach(id => {
    const prod = products.find(p => p.id === id);
    if (prod) {
      const qty = cart[id];
      const sub = Number(prod.price) * qty;
      total += sub;
      orderSummary += `*${count}. ${prod.title}*\n`;
      orderSummary += `   • Quantity: ${qty}\n`;
      orderSummary += `   • Rate: ₹${Number(prod.price).toLocaleString('en-IN')}\n`;
      orderSummary += `   • Subtotal: ₹${sub.toLocaleString('en-IN')}\n\n`;
      count++;
    }
  });

  orderSummary += `─────────────────────────\n`;
  orderSummary += `*TOTAL PAYABLE:* ₹${total.toLocaleString('en-IN')}\n`;
  orderSummary += `*DELIVERY:* Standard Fast Dispatch (FREE)\n`;
  orderSummary += `─────────────────────────\n`;
  orderSummary += `Hello! I have submitted my order details above. Please confirm availability and send payment info.`;

  const encoded = encodeURIComponent(orderSummary);
  const waUrl = `https://wa.me/${OWNER_PHONE}?text=${encoded}`;
  
  window.open(waUrl, '_blank');
}

/* Product Admin Operations */
function openProductModal(id = null) {
  uploadedImageBase64 = "";
  const modal = document.getElementById("productModal");
  const heading = document.getElementById("modalHeading");
  const preview = document.getElementById("editImagePreview");

  if (id) {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    heading.textContent = "Edit Product";
    document.getElementById("editId").value = prod.id;
    document.getElementById("editTitle").value = prod.title;
    document.getElementById("editDesc").value = prod.desc || "";
    document.getElementById("editPrice").value = prod.price;
    document.getElementById("editOriginalPrice").value = prod.originalPrice || "";
    document.getElementById("editCategory").value = prod.category || "Audio";
    document.getElementById("editBadge").value = prod.badge || "";
    document.getElementById("editImageUrl").value = prod.image && prod.image.startsWith("http") ? prod.image : "";
    preview.src = prod.image || "https://placehold.co/100x100/0b0f19/818cf8?text=Gear";
    uploadedImageBase64 = prod.image || "";
  } else {
    heading.textContent = "Add New Product";
    document.getElementById("productForm").reset();
    document.getElementById("editId").value = "";
    preview.src = "https://placehold.co/100x100/0b0f19/818cf8?text=New";
    uploadedImageBase64 = "";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function handleLocalImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImageBase64 = e.target.result;
      document.getElementById("editImagePreview").src = uploadedImageBase64;
      document.getElementById("editImageUrl").value = "";
    };
    reader.readAsDataURL(file);
  }
}

function previewUrlImage(url) {
  if (url.trim()) {
    uploadedImageBase64 = url.trim();
    document.getElementById("editImagePreview").src = url.trim();
  }
}

function saveProductChanges(e) {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const title = document.getElementById("editTitle").value.trim();
  const desc = document.getElementById("editDesc").value.trim();
  const price = parseFloat(document.getElementById("editPrice").value) || 0;
  const originalPrice = parseFloat(document.getElementById("editOriginalPrice").value) || null;
  const category = document.getElementById("editCategory").value;
  const badge = document.getElementById("editBadge").value.trim() || null;
  const urlInput = document.getElementById("editImageUrl").value.trim();

  const image = uploadedImageBase64 || urlInput || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80";

  if (id) {
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        title,
        desc,
        price,
        originalPrice,
        category,
        badge,
        image
      };
      showToast(`Updated "${title}"`);
    }
  } else {
    const newProduct = {
      id: "zyro-" + Date.now(),
      title,
      desc,
      price,
      originalPrice,
      category,
      badge,
      image
    };
    products.unshift(newProduct);
    showToast(`Added new product "${title}"`);
  }

  saveProducts();
  saveCart();
  closeProductModal();
}

function deleteProduct(id) {
  const p = products.find(x => x.id === id);
  products = products.filter(x => x.id !== id);
  delete cart[id];
  saveProducts();
  saveCart();
  showToast(`Removed "${p ? p.title.substring(0, 15) : 'item'}"`);
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  toastMsg.textContent = msg;

  toast.classList.remove("translate-y-20", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-20", "opacity-0");
  }, 2500);
}

// Startup
checkAdminAccess();
renderCatalog();
renderCartUI();