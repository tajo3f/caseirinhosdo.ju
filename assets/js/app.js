(() => {
  "use strict";

  const CONFIG = Object.freeze({
    company: "Caseirinhos do Ju",
    whatsapp: "5527996511588",
    instagram: "caseirinho.doju",
    storageKey: "caseirinhos_do_ju_cart_v6"
  });

  const catalog = window.CASEIRINHOS_CATALOG || { products: [] };
  const products = Array.isArray(catalog.products) ? catalog.products : [];
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const dom = {
    header: $(".site-header"),
    scrollProgress: $("#scrollProgress"),
    backTop: $("#backTop"),
    menuToggle: $("#menuToggle"),
    mobileNav: $("#mobileNav"),
    categoryTabs: $("#categoryTabs"),
    productsGrid: $("#productsGrid"),
    searchInput: $("#searchInput"),
    resultsCount: $("#resultsCount"),
    emptyState: $("#emptyState"),
    headerCartButton: $("#headerCartButton"),
    headerCartCount: $("#headerCartCount"),
    footerCartButton: $("#footerCartButton"),
    mobileCartButton: $("#mobileCartButton"),
    mobileCartCount: $("#mobileCartCount"),
    mobileCartTotal: $("#mobileCartTotal"),
    drawerOverlay: $("#drawerOverlay"),
    cartDrawer: $("#cartDrawer"),
    closeCartButton: $("#closeCartButton"),
    browseProductsButton: $("#browseProductsButton"),
    cartEmpty: $("#cartEmpty"),
    cartItems: $("#cartItems"),
    cartFooter: $("#cartFooter"),
    cartSubtotal: $("#cartSubtotal"),
    clearCartButton: $("#clearCartButton"),
    checkoutButton: $("#checkoutButton"),
    checkoutModal: $("#checkoutModal"),
    closeCheckoutButton: $("#closeCheckoutButton"),
    checkoutForm: $("#checkoutForm"),
    checkoutTotal: $("#checkoutTotal"),
    addressFields: $("#addressFields"),
    changeFields: $("#changeFields"),
    formError: $("#formError"),
    comboModal: $("#comboModal"),
    closeComboModal: $("#closeComboModal"),
    comboModalDescription: $("#comboModalDescription"),
    comboFlavorOptions: $("#comboFlavorOptions"),
    confirmComboButton: $("#confirmComboButton"),
    toast: $("#toast"),
    year: $("#year")
  };

  let selectedCategory = "Todos";
  let searchTerm = "";
  let cart = loadCart();
  let pendingCombo = { optionIndex: 0, flavor: "" };

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function productById(id) {
    return products.find((product) => Number(product.id) === Number(id));
  }

  function safeCartItem(item) {
    return item && typeof item === "object" && Number(item.productId) && Number(item.quantity) > 0 && Number.isFinite(Number(item.price));
  }

  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter(safeCartItem) : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(cart));
    } catch {
      // Storage may be unavailable in restricted browser modes; the cart still works in memory.
    }
  }

  function categories() {
    return ["Todos", ...new Set(products.map((product) => product.category).filter(Boolean))];
  }

  function filteredProducts() {
    const term = normalize(searchTerm);
    return products.filter((product) => {
      const categoryMatches = selectedCategory === "Todos" || product.category === selectedCategory;
      const searchable = normalize([
        product.name,
        product.category,
        product.description,
        product.badge,
        ...(product.flavors || []),
        ...(product.options || []).map((option) => option.label)
      ].join(" "));
      return categoryMatches && (!term || searchable.includes(term));
    });
  }

  function minPrice(product) {
    const prices = (product.options || []).map((option) => Number(option.price)).filter(Number.isFinite);
    return prices.length ? Math.min(...prices) : null;
  }

  function renderCategories() {
    if (!dom.categoryTabs) return;
    dom.categoryTabs.innerHTML = categories().map((category) => `
      <button type="button" class="category-tab${selectedCategory === category ? " active" : ""}" data-category="${category}" role="tab" aria-selected="${selectedCategory === category}">${category}</button>
    `).join("");
  }

  function renderProducts() {
    if (!dom.productsGrid) return;
    const visible = filteredProducts();
    dom.resultsCount.textContent = `${visible.length} ${visible.length === 1 ? "item" : "itens"}`;
    dom.emptyState.hidden = visible.length > 0;

    dom.productsGrid.innerHTML = visible.map((product, index) => {
      const options = Array.isArray(product.options) ? product.options : [];
      const hasOptions = !product.consultPrice && options.length > 0;
      const hasVariants = hasOptions && options.length > 1;
      const startPrice = minPrice(product);
      const priceLabel = product.consultPrice
        ? "Consultar valor"
        : `${hasVariants ? "a partir de " : ""}${money.format(startPrice || 0)}`;
      const optionMarkup = hasVariants ? `
        <label class="field-label" for="variant-${product.id}">Tamanho / opção</label>
        <select class="product-select" id="variant-${product.id}" data-variant-product="${product.id}">
          ${options.map((option, optionIndex) => `<option value="${optionIndex}">${option.label} · ${money.format(option.price)}</option>`).join("")}
        </select>
      ` : (hasOptions && options[0]?.label ? `<span class="field-label">${options[0].label}</span>` : "");
      const flavorMarkup = Array.isArray(product.flavors) && product.flavors.length ? `
        <label class="field-label" for="flavor-${product.id}">Sabor</label>
        <select class="product-select" id="flavor-${product.id}">
          ${product.flavors.map((flavor) => `<option value="${flavor}">${flavor}</option>`).join("")}
        </select>
      ` : "";
      const imageLoading = index < 2 ? `loading="eager"${index === 0 ? ` fetchpriority="high"` : ""}` : `loading="lazy"`;
      const actions = product.consultPrice ? `
        <div class="product-actions"><button type="button" class="add-product consult-product" data-consult="${product.id}">Consultar no WhatsApp</button></div>
      ` : `
        <div class="product-actions">
          <div class="qty-control" aria-label="Quantidade de ${product.name}">
            <button type="button" data-qty-minus="${product.id}" aria-label="Diminuir quantidade">−</button>
            <strong id="qty-${product.id}">1</strong>
            <button type="button" data-qty-plus="${product.id}" aria-label="Aumentar quantidade">+</button>
          </div>
          <button type="button" class="add-product" data-add="${product.id}">Adicionar</button>
        </div>
      `;

      return `
        <article class="product-card" data-vfx-tilt data-vfx-glare data-product-id="${product.id}">
          <div class="product-media">
            <img src="${product.image}" alt="${product.name} - Caseirinhos do Ju" width="1000" height="1000" ${imageLoading} decoding="async">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
          </div>
          <div class="product-content">
            <span class="product-category">${product.category}</span>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            ${product.slug ? `<a class="product-detail-link" href="produtos/${product.slug}/index.html" aria-label="Ver detalhes de ${product.name}">Ver detalhes do produto <span aria-hidden="true">→</span></a>` : ""}
            <div class="product-price" id="price-${product.id}">${priceLabel}</div>
            ${optionMarkup}
            ${flavorMarkup}
            ${actions}
          </div>
        </article>
      `;
    }).join("");
  }

  function selectedOption(product) {
    const select = $(`#variant-${product.id}`);
    const index = Number(select?.value || 0);
    return (product.options || [])[index] || (product.options || [])[0] || null;
  }

  function selectedFlavor(product) {
    const select = $(`#flavor-${product.id}`);
    return select?.value || (product.flavors || [])[0] || "";
  }

  function cardQuantity(productId) {
    return Math.max(1, Number($(`#qty-${productId}`)?.textContent || 1));
  }

  function changeCardQuantity(productId, delta) {
    const output = $(`#qty-${productId}`);
    if (!output) return;
    output.textContent = String(Math.max(1, Number(output.textContent || 1) + delta));
  }

  function addItem({ product, option, flavor = "", quantity = 1 }) {
    if (!product || !option || !Number.isFinite(Number(option.price))) return;
    const variant = [option.label, flavor].filter(Boolean).join(" · ");
    const key = `${product.id}::${variant || "padrao"}`;
    const existing = cart.find((item) => item.key === key);
    if (existing) {
      existing.quantity += Math.max(1, Number(quantity));
    } else {
      cart.push({
        key,
        productId: product.id,
        name: product.name,
        variant,
        price: Number(option.price),
        quantity: Math.max(1, Number(quantity)),
        image: product.image
      });
    }
    saveCart();
    updateCartUI();
    showToast(`${product.name} adicionado ao pedido`);
  }

  function addProductFromCard(productId) {
    const product = productById(productId);
    if (!product || product.consultPrice) return;
    addItem({
      product,
      option: selectedOption(product),
      flavor: selectedFlavor(product),
      quantity: cardQuantity(product.id)
    });
  }

  function consultProduct(productId) {
    const product = productById(productId);
    if (!product) return;
    const message = `Olá! Vim pelo site do ${CONFIG.company} e gostaria de saber o valor e a disponibilidade do ${product.name}.`;
    openWhatsApp(message);
  }

  function cartCount() {
    return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  function cartTotal() {
    return cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
  }

  function renderCart() {
    const hasItems = cart.length > 0;
    dom.cartEmpty.hidden = hasItems;
    dom.cartFooter.hidden = !hasItems;
    dom.cartItems.hidden = !hasItems;

    dom.cartItems.innerHTML = cart.map((item) => `
      <article class="cart-item">
        <img src="${item.image}" alt="" width="74" height="74" loading="lazy" decoding="async">
        <div>
          <h4>${item.name}</h4>
          ${item.variant ? `<small>${item.variant}</small>` : ""}
          <div class="cart-item__controls">
            <button type="button" data-cart-minus="${encodeURIComponent(item.key)}" aria-label="Diminuir quantidade">−</button>
            <strong>${item.quantity}</strong>
            <button type="button" data-cart-plus="${encodeURIComponent(item.key)}" aria-label="Aumentar quantidade">+</button>
            <button type="button" class="remove" data-cart-remove="${encodeURIComponent(item.key)}">Remover</button>
          </div>
        </div>
        <strong class="cart-item__price">${money.format(item.price * item.quantity)}</strong>
      </article>
    `).join("");

    dom.cartSubtotal.textContent = money.format(cartTotal());
    dom.checkoutTotal.textContent = money.format(cartTotal());
  }

  function updateCartUI() {
    renderCart();
    const count = cartCount();
    const total = cartTotal();
    dom.headerCartCount.textContent = String(count);
    dom.mobileCartCount.textContent = String(count);
    dom.mobileCartTotal.textContent = money.format(total);
    dom.mobileCartButton.hidden = count === 0;
  }

  function decodeKey(encoded) {
    try { return decodeURIComponent(encoded); } catch { return encoded; }
  }

  function changeCartQuantity(encodedKey, delta) {
    const key = decodeKey(encodedKey);
    const item = cart.find((entry) => entry.key === key);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter((entry) => entry.key !== key);
    saveCart();
    updateCartUI();
  }

  function removeCartItem(encodedKey) {
    const key = decodeKey(encodedKey);
    cart = cart.filter((entry) => entry.key !== key);
    saveCart();
    updateCartUI();
  }

  function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
    showToast("Carrinho limpo");
  }

  function lockBody(locked) {
    document.body.classList.toggle("no-scroll", locked);
  }

  function openCart() {
    dom.drawerOverlay.hidden = false;
    dom.cartDrawer.classList.add("open");
    dom.cartDrawer.setAttribute("aria-hidden", "false");
    lockBody(true);
    window.setTimeout(() => dom.closeCartButton?.focus(), 60);
  }

  function closeCart({ keepLocked = false } = {}) {
    dom.cartDrawer.classList.remove("open");
    dom.cartDrawer.setAttribute("aria-hidden", "true");
    dom.drawerOverlay.hidden = true;
    if (!keepLocked) lockBody(false);
  }

  function openCheckout() {
    if (!cart.length) return;
    closeCart({ keepLocked: true });
    dom.checkoutModal.hidden = false;
    dom.checkoutModal.setAttribute("aria-hidden", "false");
    const checkoutPanel = dom.checkoutModal.querySelector(".modal__panel");
    if (checkoutPanel) checkoutPanel.scrollTop = 0;
    dom.checkoutTotal.textContent = money.format(cartTotal());
    lockBody(true);
    window.setTimeout(() => dom.checkoutForm.elements.name?.focus({ preventScroll: true }), 60);
  }

  function closeCheckout() {
    dom.checkoutModal.hidden = true;
    dom.checkoutModal.setAttribute("aria-hidden", "true");
    const checkoutPanel = dom.checkoutModal.querySelector(".modal__panel");
    if (checkoutPanel) checkoutPanel.scrollTop = 0;
    dom.formError.hidden = true;
    lockBody(false);
  }

  function openCombo({ optionIndex = 0, flavor = "" } = {}) {
    const product = productById(11);
    if (!product) return;
    pendingCombo = { optionIndex: Math.min(Math.max(0, optionIndex), product.options.length - 1), flavor: flavor || product.flavors[0] };
    const option = product.options[pendingCombo.optionIndex];
    dom.comboModalDescription.textContent = `${option.label} · ${money.format(option.price)}. Escolha um sabor para adicionar ao pedido.`;
    dom.comboFlavorOptions.innerHTML = product.flavors.map((item, index) => `
      <label class="combo-flavor">
        <input type="radio" name="comboFlavor" value="${item}" ${item === pendingCombo.flavor || (!flavor && index === 0) ? "checked" : ""}>
        <span>${item}<b>✓</b></span>
      </label>
    `).join("");
    dom.comboModal.hidden = false;
    dom.comboModal.setAttribute("aria-hidden", "false");
    const comboPanel = dom.comboModal.querySelector(".modal__panel");
    if (comboPanel) comboPanel.scrollTop = 0;
    lockBody(true);
    window.setTimeout(() => $("input[name='comboFlavor']:checked", dom.comboModal)?.focus({ preventScroll: true }), 60);
  }

  function closeCombo() {
    dom.comboModal.hidden = true;
    dom.comboModal.setAttribute("aria-hidden", "true");
    const comboPanel = dom.comboModal.querySelector(".modal__panel");
    if (comboPanel) comboPanel.scrollTop = 0;
    lockBody(false);
  }

  function confirmCombo() {
    const product = productById(11);
    if (!product) return;
    const option = product.options[pendingCombo.optionIndex];
    const checked = $("input[name='comboFlavor']:checked", dom.comboModal);
    const flavor = checked?.value || product.flavors[0];
    addItem({ product, option, flavor, quantity: 1 });
    closeCombo();
  }

  function buildWhatsAppMessage(formData) {
    const itemLines = cart.map((item) => {
      const variant = item.variant ? `\n   ↳ ${item.variant}` : "";
      return `• ${item.quantity}x ${item.name}${variant}\n   ${money.format(item.price * item.quantity)}`;
    }).join("\n\n");

    const delivery = String(formData.get("delivery") || "Retirada");
    const payment = String(formData.get("payment") || "PIX");
    const addressParts = [
      formData.get("street"),
      formData.get("number"),
      formData.get("neighborhood"),
      formData.get("city"),
      formData.get("zip"),
      formData.get("complement")
    ].map((value) => String(value || "").trim()).filter(Boolean);
    const address = addressParts.length ? addressParts.join(", ") : "A confirmar";
    const notes = String(formData.get("notes") || "").trim() || "Sem observações.";
    const change = payment === "Dinheiro" && String(formData.get("change") || "").trim()
      ? `\n💵 Troco para: ${String(formData.get("change")).trim()}`
      : "";

    return [
      `Olá! Quero fazer um pedido no *${CONFIG.company}*. ❤️`,
      "",
      "*MEU PEDIDO*",
      "",
      itemLines,
      "",
      "━━━━━━━━━━━━━━",
      `*TOTAL DOS PRODUTOS: ${money.format(cartTotal())}*`,
      "━━━━━━━━━━━━━━",
      "",
      `👤 Nome: ${String(formData.get("name") || "").trim()}`,
      `📱 Telefone: ${String(formData.get("phone") || "").trim()}`,
      "",
      `📍 Recebimento: ${delivery}`,
      ...(delivery === "Entrega" ? [`🏠 Endereço: ${address}`] : []),
      "",
      `💳 Pagamento: ${payment}${change}`,
      "",
      `📝 Observações: ${notes}`,
      "",
      `Aguardo a confirmação de disponibilidade${delivery === "Entrega" ? " e da taxa de entrega" : ""}.`
    ].join("\n");
  }

  function openWhatsApp(message) {
    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
  }

  function validateCheckout(data) {
    const name = String(data.get("name") || "").trim();
    const phoneDigits = String(data.get("phone") || "").replace(/\D/g, "");
    const delivery = String(data.get("delivery") || "Retirada");
    if (name.length < 2) return "Informe seu nome para continuar.";
    if (phoneDigits.length < 10 || phoneDigits.length > 13) return "Informe um telefone válido com DDD.";
    if (delivery === "Entrega") {
      const required = [
        ["street", "rua"],
        ["number", "número"],
        ["neighborhood", "bairro"],
        ["city", "cidade"]
      ];
      const missing = required.find(([field]) => !String(data.get(field) || "").trim());
      if (missing) return `Para entrega, informe ${missing[1]}.`;
    }
    return "";
  }

  function formatPhone(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function formatZip(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => dom.toast.classList.remove("show"), 2100);
  }

  function setFilter(category) {
    if (!categories().includes(category)) return;
    selectedCategory = category;
    renderCategories();
    renderProducts();
  }

  function initScrollUI() {
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      if (dom.scrollProgress) dom.scrollProgress.style.width = `${pct}%`;
      dom.header?.classList.toggle("is-scrolled", window.scrollY > 12);
      dom.backTop?.classList.toggle("show", window.scrollY > 700);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initReveal() {
    const elements = $$(".reveal");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("in-view"));
      return;
    }
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px" });
    elements.forEach((element) => observer.observe(element));
  }

  function initSchema() {
    if (!products.length) return;
    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Cardápio Caseirinhos do Ju",
      itemListElement: products.filter((product) => !product.consultPrice).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: new URL(product.image, window.location.href).href,
          brand: { "@type": "Brand", name: CONFIG.company },
          offers: (product.options || []).map((option) => ({
            "@type": "Offer",
            priceCurrency: "BRL",
            price: Number(option.price).toFixed(2),
            description: option.label || product.name
          }))
        }
      }))
    };
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "O pedido é confirmado automaticamente?", acceptedAnswer: { "@type": "Answer", text: "Não. O site prepara a mensagem e o atendimento confirma disponibilidade, retirada ou entrega pelo WhatsApp." } },
        { "@type": "Question", name: "Quais sabores de esfirra estão disponíveis?", acceptedAnswer: { "@type": "Answer", text: "Queijo e Presunto, Queijo e Manjericão e Carne Temperada com Cheddar." } },
        { "@type": "Question", name: "O carrinho fica salvo?", acceptedAnswer: { "@type": "Answer", text: "Sim. O carrinho é salvo no navegador para continuar o pedido depois." } }
      ]
    };
    [itemList, faq].forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  }

  function focusableElements(container) {
    if (!container) return [];
    return $$(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      container
    ).filter((element) => !element.hidden && element.getClientRects().length > 0);
  }

  function trapFocus(container, event) {
    if (event.key !== "Tab" || !container) return;
    const focusables = focusableElements(container);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function initEvents() {
    dom.categoryTabs?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      setFilter(button.dataset.category);
    });

    dom.searchInput?.addEventListener("input", () => {
      searchTerm = dom.searchInput.value;
      renderProducts();
    });

    dom.productsGrid?.addEventListener("click", (event) => {
      const minus = event.target.closest("[data-qty-minus]");
      const plus = event.target.closest("[data-qty-plus]");
      const add = event.target.closest("[data-add]");
      const consult = event.target.closest("[data-consult]");
      if (minus) changeCardQuantity(Number(minus.dataset.qtyMinus), -1);
      if (plus) changeCardQuantity(Number(plus.dataset.qtyPlus), 1);
      if (add) addProductFromCard(Number(add.dataset.add));
      if (consult) consultProduct(Number(consult.dataset.consult));
    });

    dom.productsGrid?.addEventListener("change", (event) => {
      const select = event.target.closest("[data-variant-product]");
      if (!select) return;
      const product = productById(Number(select.dataset.variantProduct));
      const option = product?.options?.[Number(select.value)];
      const price = product ? $(`#price-${product.id}`) : null;
      if (price && option) price.textContent = money.format(option.price);
    });

    dom.cartItems?.addEventListener("click", (event) => {
      const minus = event.target.closest("[data-cart-minus]");
      const plus = event.target.closest("[data-cart-plus]");
      const remove = event.target.closest("[data-cart-remove]");
      if (minus) changeCartQuantity(minus.dataset.cartMinus, -1);
      if (plus) changeCartQuantity(plus.dataset.cartPlus, 1);
      if (remove) removeCartItem(remove.dataset.cartRemove);
    });

    [dom.headerCartButton, dom.footerCartButton, dom.mobileCartButton].forEach((button) => button?.addEventListener("click", openCart));
    dom.closeCartButton?.addEventListener("click", () => closeCart());
    dom.drawerOverlay?.addEventListener("click", () => closeCart());
    dom.browseProductsButton?.addEventListener("click", () => { closeCart(); $("#cardapio")?.scrollIntoView({ behavior: "smooth" }); });
    dom.clearCartButton?.addEventListener("click", clearCart);
    dom.checkoutButton?.addEventListener("click", openCheckout);
    dom.closeCheckoutButton?.addEventListener("click", closeCheckout);
    dom.checkoutModal?.addEventListener("click", (event) => { if (event.target === dom.checkoutModal) closeCheckout(); });

    const phoneInput = dom.checkoutForm?.elements?.phone;
    const zipInput = dom.checkoutForm?.elements?.zip;
    phoneInput?.addEventListener("input", () => { phoneInput.value = formatPhone(phoneInput.value); });
    zipInput?.addEventListener("input", () => { zipInput.value = formatZip(zipInput.value); });

    dom.checkoutForm?.addEventListener("change", (event) => {
      if (event.target.name === "delivery") dom.addressFields.hidden = event.target.value !== "Entrega";
      if (event.target.name === "payment") dom.changeFields.hidden = event.target.value !== "Dinheiro";
    });

    dom.checkoutForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(dom.checkoutForm);
      const error = validateCheckout(data);
      if (error) {
        dom.formError.textContent = error;
        dom.formError.hidden = false;
        return;
      }
      dom.formError.hidden = true;
      openWhatsApp(buildWhatsAppMessage(data));
    });

    $$("[data-combo-id]").forEach((card) => {
      card.querySelector("button")?.addEventListener("click", () => openCombo({ optionIndex: Number(card.dataset.optionIndex || 0) }));
    });

    $$('[data-open-combo]').forEach((button) => {
      button.addEventListener("click", () => openCombo({ optionIndex: 0, flavor: button.dataset.openCombo || "" }));
    });

    dom.closeComboModal?.addEventListener("click", closeCombo);
    dom.comboModal?.addEventListener("click", (event) => { if (event.target === dom.comboModal) closeCombo(); });
    dom.confirmComboButton?.addEventListener("click", confirmCombo);

    $$('[data-quick-add]').forEach((button) => {
      button.addEventListener("click", () => {
        const product = productById(Number(button.dataset.quickAdd));
        if (product?.options?.[0]) addItem({ product, option: product.options[0], quantity: 1 });
      });
    });

    $$('[data-filter]').forEach((link) => {
      link.addEventListener("click", () => setFilter(link.dataset.filter));
    });

    dom.menuToggle?.addEventListener("click", () => {
      const willOpen = dom.mobileNav.hidden;
      dom.mobileNav.hidden = !willOpen;
      dom.menuToggle.setAttribute("aria-expanded", String(willOpen));
    });
    $$("a", dom.mobileNav).forEach((link) => link.addEventListener("click", () => {
      dom.mobileNav.hidden = true;
      dom.menuToggle.setAttribute("aria-expanded", "false");
    }));

    dom.backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        if (!dom.checkoutModal.hidden) trapFocus(dom.checkoutModal, event);
        else if (!dom.comboModal.hidden) trapFocus(dom.comboModal, event);
        else if (dom.cartDrawer.classList.contains("open")) trapFocus(dom.cartDrawer, event);
        return;
      }
      if (event.key !== "Escape") return;
      if (!dom.checkoutModal.hidden) closeCheckout();
      else if (!dom.comboModal.hidden) closeCombo();
      else if (dom.cartDrawer.classList.contains("open")) closeCart();
      else if (!dom.mobileNav.hidden) {
        dom.mobileNav.hidden = true;
        dom.menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initPWA() {
    if ("serviceWorker" in navigator && ["http:", "https:"].includes(window.location.protocol)) {
      window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}), { once: true });
    }
  }

  function init() {
    // Estado inicial defensivo: nenhum overlay/modal pode nascer visível ao carregar a página.
    [dom.checkoutModal, dom.comboModal, dom.drawerOverlay].forEach((element) => {
      if (element) element.hidden = true;
    });
    dom.checkoutModal?.setAttribute("aria-hidden", "true");
    dom.comboModal?.setAttribute("aria-hidden", "true");
    dom.cartDrawer?.classList.remove("open");
    dom.cartDrawer?.setAttribute("aria-hidden", "true");
    lockBody(false);

    if (!products.length) {
      console.error("Caseirinhos: catalog data was not loaded.");
      if (dom.emptyState) dom.emptyState.hidden = false;
      return;
    }
    if (dom.year) dom.year.textContent = String(new Date().getFullYear());
    renderCategories();
    renderProducts();
    updateCartUI();
    initEvents();
    initScrollUI();
    initReveal();
    initSchema();
    initPWA();
  }

  init();
})();
