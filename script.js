/* =========================================================
   NEVER FOLD FRAGRANCES — MASTER JAVASCRIPT
   Cart -> Checkout -> Receipt use one shared data source.

   LOCKED PRICES:
   Never Fold Original Bottle = $30
   Never Fold Original Refill = $20
   Scent Vault Item = $70
   Shipping = $6.99 when SHIPPING is selected at checkout

 
   ========================================================= */

(() => {
  "use strict";
/* =========================================================
     TADIE4ENT — NEVER FOLD 7-DAY TRIAL
     ========================================================= */

  const APP_MODE = "TRIAL"; // TRIAL or FULL
  const TRIAL_DAYS = 0;
  const INSTALL_KEY = "neverfold_trial_start";
  function getTrialStart() {
    return Number(
      localStorage.getItem(INSTALL_KEY)
    ) || 0;
  }

  function getTrialDaysUsed() {
    const start = getTrialStart();

    if (!start) {
      return 0;
    }

    const elapsed =
      Date.now() - start;

    return Math.floor(
      elapsed / (1000 * 60 * 60 * 24)
    );
  }

  function isTrialExpired() {
    if (APP_MODE === "FULL") {
      return false;
    }

    const start = getTrialStart();

    if (!start) {
      return false;
    }

    return getTrialDaysUsed() >= TRIAL_DAYS;
  }
     function showTrialExpired() {
    document.body.innerHTML = `
      <div class="trial-screen">
        <div class="trial-box">

          <h1>TaDie4ENT</h1>

          <h2>Your 7-Day Trial Has Ended</h2>

          <p>
            Thank you for trying your custom Never Fold Fragrances app.
          </p>

          <p>
            Ready to keep your custom business app?
          </p>

          <div class="trial-buttons">

            <a
              class="trial-contact-button"
              href="sms:+19036170239?body=Hi%20TaDasha!%20I'm%20ready%20to%20talk%20about%20keeping%20my%20Never%20Fold%20app."
            >
              📱 Contact TaDie4ENT
            </a>

          </div>

          <p class="trial-powered">
            Powered by <strong>TaDie4ENT Custom Apps</strong>
          </p>

        </div>
      </div>
    `;
  }

function checkTrial() {

  if (APP_MODE === "FULL") {
    return false;
  }

  const start = getTrialStart();

  if (!start) {
    window.location.href =
      "trial-agreement.html";

    return true;
  }

  if (isTrialExpired()) {
    showTrialExpired();
    return true;
  }

  return false;
}
  const CART_KEY = "neverFoldCart";
  const CART_KEY = "neverFoldCart";
  const ORDER_KEY = "neverFoldLastOrder";
  const LEGACY_CART_KEY = "cart";

  const ORIGINAL_PRICE = 30;
  const REFILL_PRICE = 20;
  const VAULT_PRICE = 70;
  const SHIPPING_RATE = 6.99;



  const ORIGINALS = {
    "amirahs-touch": "Amirah's Touch",
    "benitas-love": "Benita's Love",
    "evette-my-love": "Evette My Love",
    "irish-the-land": "Irish The Land",
    "king-mardy-the-great": "King Mardy The Great",
    "lilly-of-da-valley": "Lilly of Da Valley",
    "man-of-the-hour": "Man of the Hour",
    "nieko-valley": "Nieko Valley",
    "players-get-chose": "Players Get Chose",
    "queen-gwen": "Queen Gwen"
  };

  /* =========================================================
     BASIC HELPERS
     ========================================================= */

  const money = value => `$${Number(value || 0).toFixed(2)}`;

  const qs = (selector, root = document) =>
    root.querySelector(selector);

  const qsa = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const first = (...selectors) => {
    for (const selector of selectors) {
      const element = qs(selector);

      if (element) {
        return element;
      }
    }

    return null;
  };

  const safeNumber = (value, fallback = 0) => {
    const number = Number(
      String(value ?? "").replace(/[^0-9.-]/g, "")
    );

    return Number.isFinite(number)
      ? number
      : fallback;
  };

  const clampQuantity = value => {
    const number = Math.floor(
      safeNumber(value, 1)
    );

    return Math.max(
      1,
      Math.min(99, number)
    );
  };

  const slugify = value =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const escapeHTML = value =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  function setText(target, value) {
    const element =
      typeof target === "string"
        ? qs(target)
        : target;

    if (element) {
      element.textContent = value;
    }
  }

  function setMoney(selectors, value) {
    const list =
      Array.isArray(selectors)
        ? selectors
        : [selectors];

    list.forEach(selector => {
      const element = qs(selector);

      if (element) {
        element.textContent = money(value);
      }
    });
  }

  function readJSON(key, fallback) {
    try {
      const raw =
        localStorage.getItem(key);

      return raw
        ? JSON.parse(raw)
        : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  }

  /* =========================================================
     CART DATA
     ========================================================= */

  function normalizeItem(item) {
    const quantity =
      clampQuantity(item?.quantity);

    const unitPrice =
      safeNumber(
        item?.unitPrice ??
        item?.price,
        0
      );

    return {
      id:
        String(
          item?.id ||
          `${slugify(item?.name)}-${slugify(item?.type)}`
        ),

      name:
        String(
          item?.name ||
          "Never Fold Item"
        ),

      type:
        String(
          item?.type ||
          "item"
        ),

      unitPrice:
        unitPrice,

      quantity:
        quantity,

      lineTotal:
        Number(
          (
            unitPrice *
            quantity
          ).toFixed(2)
        )
    };
  }

  function loadCart() {
    let cart =
      readJSON(
        CART_KEY,
        null
      );

    /*
       One-time migration from an older
       localStorage key named "cart".
    */
    if (!Array.isArray(cart)) {
      const legacy =
        readJSON(
          LEGACY_CART_KEY,
          []
        );

      cart =
        Array.isArray(legacy)
          ? legacy.map(normalizeItem)
          : [];

      writeJSON(
        CART_KEY,
        cart
      );
    }

    return cart.map(
      normalizeItem
    );
  }

  function saveCart(cart) {
    const clean =
      cart.map(
        normalizeItem
      );

    writeJSON(
      CART_KEY,
      clean
    );

    updateCartBadges(
      clean
    );

    return clean;
  }

  /* =========================================================
     CALCULATIONS
     ========================================================= */

  function calculateCart(
    cart = loadCart()
  ) {
    const clean =
      cart.map(
        normalizeItem
      );

    const itemCount =
      clean.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      );

    const subtotal =
      Number(
        clean.reduce(
          (sum, item) =>
            sum + item.lineTotal,
          0
        ).toFixed(2)
      );

 /*
   Shipping is added at checkout
   only when SHIPPING is selected.
*/
 const shipping = 0;

const total =
  Number(
    (
      subtotal +
      shipping
    ).toFixed(2)
  );

return {
  itemCount,
  subtotal,
  shipping,
  total
};


  }

  /* =========================================================
     CART BADGE
     ========================================================= */

  function updateCartBadges(
    cart = loadCart()
  ) {
    const count =
      cart.reduce(
        (sum, item) =>
          sum +
          clampQuantity(
            item.quantity
          ),
        0
      );

    qsa(".cart-count")
      .forEach(element => {
        element.textContent =
          String(count);
      });

    const current =
      qs("#cartCount");

    if (current) {
      current.textContent =
        String(count);
    }
  }

  /* =========================================================
     ADD ITEM TO CART
     ========================================================= */

  function addItem(
    item,
    goToCart = false
  ) {
    const incoming =
      normalizeItem(item);

    const cart =
      loadCart();

    const existing =
      cart.find(entry =>
        entry.id === incoming.id &&
        entry.type === incoming.type &&
        entry.unitPrice === incoming.unitPrice
      );

    if (existing) {
      existing.quantity =
        clampQuantity(
          existing.quantity +
          incoming.quantity
        );

      existing.lineTotal =
        Number(
          (
            existing.unitPrice *
            existing.quantity
          ).toFixed(2)
        );
    } else {
      cart.push(
        incoming
      );
    }

    saveCart(
      cart
    );

    if (goToCart) {
      window.location.href =
        "cart.html";
    }

    return cart;
  }

  /* =========================================================
     PRODUCT PAGE
     ========================================================= */

  function getProductSlug() {
    return (
      new URLSearchParams(
        window.location.search
      ).get("product") ||
      ""
    );
  }

  function getProductName() {
    const slug =
      getProductSlug();

    if (ORIGINALS[slug]) {
      return ORIGINALS[slug];
    }

    const fromPage =
      first(
        "#productName",
        "[data-product-name]",
        ".product-info h1",
        ".product-details h1"
      );

    return (
      fromPage?.textContent?.trim() ||
      "Never Fold Original"
    );
  }

  function getDisplayedQuantity(
    root = document
  ) {
    const element =
      qs("#productQuantity", root) ||
      qs("#quantity", root) ||
      qs("[data-product-quantity]", root) ||
      qs(".quantity-number", root) ||
      qs(".product-quantity-number", root);

    if (!element) {
      return 1;
    }

    return clampQuantity(
      "value" in element
        ? element.value
        : element.textContent
    );
  }

  function writeDisplayedQuantity(
    value,
    root = document
  ) {
    const quantity =
      clampQuantity(value);

    const elements = [
      qs("#productQuantity", root),
      qs("#quantity", root),
      qs("[data-product-quantity]", root),
      qs(".quantity-number", root),
      qs(".product-quantity-number", root)
    ].filter(Boolean);

    elements.forEach(element => {
      if ("value" in element) {
        element.value =
          quantity;
      } else {
        element.textContent =
          quantity;
      }
    });

    updateProductTotal(
      quantity
    );
  }

  function updateProductTotal(
    quantity =
      getDisplayedQuantity()
  ) {
    const total =
      ORIGINAL_PRICE *
      clampQuantity(quantity);

    setMoney(
      [
        "#productTotal",
        "#totalPrice",
        "[data-product-total]"
      ],
      total
    );
  }

  function initProductPage() {
    if (
      !qs(".product-page") &&
      !qs("#productName")
    ) {
      return;
    }

    const name =
      getProductName();

    setText(
      "#productName",
      name
    );

    setText(
      "#bottleName",
      name
    );

    const priceElement =
      first(
        "#productPrice",
        "[data-product-price]"
      );

    if (priceElement) {
      priceElement.textContent =
        money(
          ORIGINAL_PRICE
        );
    }

    updateProductTotal();

    qsa(
      ".product-minus, .product-quantity .minus, .quantity-minus, [data-action='product-minus']"
    ).forEach(button => {
      button.addEventListener(
        "click",
        () => {
          writeDisplayedQuantity(
            getDisplayedQuantity() -
            1
          );
        }
      );
    });

    qsa(
      ".product-plus, .product-quantity .plus, .quantity-plus, [data-action='product-plus']"
    ).forEach(button => {
      button.addEventListener(
        "click",
        () => {
          writeDisplayedQuantity(
            getDisplayedQuantity() +
            1
          );
        }
      );
    });

    const quantityInput =
      first(
        "#productQuantity",
        "#quantity",
        ".product-quantity input"
      );

    if (
      quantityInput &&
      "addEventListener" in quantityInput
    ) {
      quantityInput.addEventListener(
        "input",
        () => {
          writeDisplayedQuantity(
            quantityInput.value
          );
        }
      );
    }

    qsa(
      "#addToCart, #productAddToCart, .add-to-cart, .add-cart-button, [data-action='add-product']"
    ).forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.preventDefault();

          addItem(
            {
              id:
                `original-${slugify(name)}`,

              name:
                name,

              type:
                "Never Fold Original",

              unitPrice:
                ORIGINAL_PRICE,

              quantity:
                getDisplayedQuantity()
   }
  );
        const originalText =
  button.textContent;

button.textContent =
  "ADDED ✓";

setTimeout(
  () => {
    button.textContent =
      originalText;
  },
  900
);   
        }
      );
    });
  }

  /* =========================================================
     VAULT PAGE
     ========================================================= */

  function initVaultPage() {
    const vaultItems =
      qsa(".vault-item");

    if (!vaultItems.length) {
      return;
    }

    vaultItems.forEach(item => {
      const header =
        qs(
          ".vault-item-header",
          item
        );

      const minus =
        qs(
          ".vault-minus",
          item
        );

      const plus =
        qs(
          ".vault-plus",
          item
        );

      const quantityElement =
        qs(
          ".vault-quantity-number",
          item
        );

      const addButton =
        qs(
          ".vault-add-cart",
          item
        );

      header?.addEventListener(
        "click",
        () => {
          const isOpen =
            item.classList.toggle(
              "open"
            );

          item.classList.toggle(
            "active",
            isOpen
          );

          header.setAttribute(
            "aria-expanded",
            String(isOpen)
          );
        }
      );

      const getQuantity =
        () =>
          clampQuantity(
            quantityElement?.textContent ||
            1
          );

      const setQuantity =
        value => {
          if (quantityElement) {
            quantityElement.textContent =
              clampQuantity(value);
          }
        };

      minus?.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          setQuantity(
            getQuantity() -
            1
          );
        }
      );

      plus?.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          setQuantity(
            getQuantity() +
            1
          );
        }
      );

      addButton?.addEventListener(
        "click",
        event => {
          event.preventDefault();

          const brand =
            item.dataset.brand ||
            qs(
              ".vault-item-header strong",
              item
            )?.textContent?.trim() ||
            "Scent Vault Selection";

          const price =
            safeNumber(
              item.dataset.price,
              VAULT_PRICE
            );

       addItem(
  {
    id:
      `vault-${slugify(brand)}`,

    name:
      brand,

    type:
      "Scent Vault",

    unitPrice:
      price,

    quantity:
      getQuantity()
}
);
          const originalText =
            addButton.textContent;

          addButton.textContent =
            "ADDED ✓";

          setTimeout(
            () => {
              addButton.textContent =
                originalText;
            },
            900
          );
        }
      );
    });

    const search =
      qs("#vaultSearch");

    search?.addEventListener(
      "input",
      () => {
        const term =
          search.value
            .trim()
            .toLowerCase();

        vaultItems.forEach(item => {
          const brand =
            String(
              item.dataset.brand ||
              ""
            ).toLowerCase();

          item.hidden =
            term &&
            !brand.includes(term);
        });

        qsa(
          ".vault-letter-section"
        ).forEach(section => {
          const visible =
            qsa(
              ".vault-item",
              section
            ).some(
              item =>
                !item.hidden
            );

          section.hidden =
            !visible;
        });
      }
    );
  }

  /* =========================================================
     REFILLS PAGE
     ========================================================= */

  function getSelectedRefillScent() {
    const checked =
      qs(
        ".refill-page input[type='radio']:checked"
      ) ||
      qs(
        "input[name='refillScent']:checked"
      ) ||
      qs(
        "input[name='scent']:checked"
      );

    if (!checked) {
      return "";
    }

    return (
      checked.dataset.name ||
      checked.value ||
      checked.closest("label")
        ?.textContent
        ?.trim() ||
      ""
    );
  }

  function getRefillQuantity() {
    const element =
      first(
        "#refillQuantity",
        "[data-refill-quantity]",
        ".refill-quantity-number",
        ".refill-quantity input"
      );

    if (!element) {
      return 1;
    }

    return clampQuantity(
      "value" in element
        ? element.value
        : element.textContent
    );
  }

  function setRefillQuantity(
    value
  ) {
    const quantity =
      clampQuantity(value);

    const element =
      first(
        "#refillQuantity",
        "[data-refill-quantity]",
        ".refill-quantity-number",
        ".refill-quantity input"
      );

    if (element) {
      if ("value" in element) {
        element.value =
          quantity;
      } else {
        element.textContent =
          quantity;
      }
    }

    setMoney(
      [
        "#refillTotal",
        "#refillOrderTotal",
        "[data-refill-total]"
      ],
      quantity *
      REFILL_PRICE
    );
  }

  function initRefillPage() {
    if (
      !qs(".refill-page")
    ) {
      return;
    }

    setRefillQuantity(
      getRefillQuantity()
    );

    qsa(
      ".refill-minus, .refill-quantity .minus, [data-action='refill-minus']"
    ).forEach(button => {
      button.addEventListener(
        "click",
        () => {
          setRefillQuantity(
            getRefillQuantity() -
            1
          );
        }
      );
    });

    qsa(
      ".refill-plus, .refill-quantity .plus, [data-action='refill-plus']"
    ).forEach(button => {
      button.addEventListener(
        "click",
        () => {
          setRefillQuantity(
            getRefillQuantity() +
            1
          );
        }
      );
    });

    const quantityInput =
      first(
        "#refillQuantity",
        ".refill-quantity input"
      );

    quantityInput?.addEventListener(
      "input",
      () => {
        setRefillQuantity(
          quantityInput.value
        );
      }
    );

    qsa(
      "#addRefillToCart, #refillAddToCart, .refill-add-cart, .order-refill-button, [data-action='add-refill']"
    ).forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.preventDefault();

          const scent =
            getSelectedRefillScent();

          if (!scent) {
            alert(
              "Choose a Never Fold scent for your refill."
            );

            return;
          }

          addItem(
            {
              id:
                `refill-${slugify(scent)}`,

              name:
                `${scent} Refill`,

              type:
                "Never Fold Refill",

              unitPrice:
                REFILL_PRICE,

              quantity:
                getRefillQuantity()
          }
  );  
      const originalText =
  button.textContent;

button.textContent =
  "ADDED ✓";

setTimeout(
  () => {
    button.textContent =
      originalText;
  },
  900
);     
        }
      );
    });
  }

  /* =========================================================
     FINDER PAGE
     ========================================================= */

  function initFinderPage() {
    const finder =
      qs(".finder-page");

    if (!finder) {
      return;
    }

    const button =
      first(
        "#findMyScent",
        ".finder-button",
        ".find-scent-button",
        "[data-action='find-scent']"
      );

    button?.addEventListener(
      "click",
      event => {
        event.preventDefault();

        const checked =
          qsa(
            ".finder-page input[type='radio']:checked, .finder-page input[type='checkbox']:checked"
          );

        const answers =
          checked.map(input =>
            String(
              input.value ||
              ""
            ).toLowerCase()
          );

        /*
           Stable match using only our
           real fragrance names.
           No invented scent notes.
        */
        const seed =
          answers.join("|") ||
          "never-fold";

        let hash = 0;

        for (
          let index = 0;
          index < seed.length;
          index++
        ) {
          hash =
            (
              (hash << 5) -
              hash +
              seed.charCodeAt(index)
            ) | 0;
        }

        const names =
          Object.values(
            ORIGINALS
          );

        const recommendation =
          names[
            Math.abs(hash) %
            names.length
          ];

        const resultName =
          first(
            "#finderResultName",
            "#resultScent",
            "[data-finder-result-name]"
          );

        const resultText =
          first(
            "#finderResultText",
            "#resultMessage",
            "[data-finder-result-text]"
          );

        if (resultName) {
          resultName.textContent =
            recommendation;
        }

        if (resultText) {
          resultText.textContent =
            "Your Never Fold match. Tap below to view the scent.";
        }

        const resultLink =
          first(
            "#finderResultLink",
            "[data-finder-result-link]"
          );

        if (resultLink) {
          const slug =
            Object.keys(
              ORIGINALS
            ).find(
              key =>
                ORIGINALS[key] ===
                recommendation
            );

          resultLink.href =
            `product.html?product=${slug}`;
        }

        const result =
          first(
            "#finderResult",
            ".finder-result",
            ".quiz-result"
          );

        if (result) {
          result.hidden =
            false;

          result.classList.remove(
            "hidden"
          );

          result.scrollIntoView({
            behavior:
              "smooth",

            block:
              "center"
          });
        }
      }
    );
  }

  /* =========================================================
     CART PAGE
     ========================================================= */

  function changeCartQuantity(
    index,
    delta
  ) {
    const cart =
      loadCart();

    if (!cart[index]) {
      return;
    }

    const next =
      cart[index].quantity +
      delta;

    if (next <= 0) {
      cart.splice(
        index,
        1
      );
    } else {
      cart[index].quantity =
        clampQuantity(next);

      cart[index].lineTotal =
        Number(
          (
            cart[index].unitPrice *
            cart[index].quantity
          ).toFixed(2)
        );
    }

    saveCart(
      cart
    );

    renderCart();
  }

  function removeCartItem(
    index
  ) {
    const cart =
      loadCart();

    if (!cart[index]) {
      return;
    }

    cart.splice(
      index,
      1
    );

    saveCart(
      cart
    );

    renderCart();
  }

  function renderCart() {
    const container =
      qs("#cartItems");

    if (!container) {
      return;
    }

    const cart =
      loadCart();

    const totals =
      calculateCart(
        cart
      );

    const empty =
      qs("#emptyCart");

    const summary =
      qs("#cartSummary");

    const checkoutButton =
      qs("#checkoutButton");

    container.innerHTML =
      "";

    if (!cart.length) {
      if (empty) {
        empty.style.display =
          "";
      }

      if (summary) {
        summary.dataset.empty =
          "true";
      }

      setText(
        "#cartItemCount",
        "0 ITEMS"
      );

      setMoney(
        "#cartSubtotal",
        0
      );

      setMoney(
        "#cartShipping",
        0
      );



      setMoney(
        "#cartTotal",
        0
      );

      if (checkoutButton) {
        checkoutButton.setAttribute(
          "aria-disabled",
          "true"
        );

        checkoutButton.onclick =
          event => {
            event.preventDefault();
          };
      }

      updateCartBadges(
        cart
      );

      return;
    }

    if (empty) {
      empty.style.display =
        "none";
    }

    if (summary) {
      summary.dataset.empty =
        "false";
    }

    if (checkoutButton) {
      checkoutButton.removeAttribute(
        "aria-disabled"
      );

      checkoutButton.onclick =
        null;
    }

    cart.forEach(
      (item, index) => {
        const row =
          document.createElement(
            "article"
          );

        row.className =
          "cart-item";

        row.innerHTML = `
          <div class="cart-item-badge">
            NF
          </div>

          <div class="cart-details">

            <span class="cart-item-type">
              ${escapeHTML(item.type)}
            </span>

            <h3>
              ${escapeHTML(item.name)}
            </h3>

            <p>
              ${money(item.unitPrice)} each
            </p>

            <div class="cart-item-bottom">

              <div class="cart-quantity">

                <button
                  type="button"
                  class="cart-minus"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>
                  ${item.quantity}
                </span>

                <button
                  type="button"
                  class="cart-plus"
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

              <strong class="cart-line-total">
                ${money(item.lineTotal)}
              </strong>

            </div>

            <button
              type="button"
              class="remove-button"
            >
              REMOVE
            </button>

          </div>
        `;

        qs(
          ".cart-minus",
          row
        )?.addEventListener(
          "click",
          () => {
            changeCartQuantity(
              index,
              -1
            );
          }
        );

        qs(
          ".cart-plus",
          row
        )?.addEventListener(
          "click",
          () => {
            changeCartQuantity(
              index,
              1
            );
          }
        );

        qs(
          ".remove-button",
          row
        )?.addEventListener(
          "click",
          () => {
            removeCartItem(
              index
            );
          }
        );

        container.appendChild(
          row
        );
      }
    );

    setText(
      "#cartItemCount",
      `${totals.itemCount} ${
        totals.itemCount === 1
          ? "ITEM"
          : "ITEMS"
      }`
    );

    setMoney(
      "#cartSubtotal",
      totals.subtotal
    );

    setMoney(
      "#cartShipping",
      totals.shipping
    );

   setMoney(
  "#cartTotal",
  totals.total
);

  
    updateCartBadges(
      cart
    );
  }

  /* =========================================================
     CHECKOUT
     ========================================================= */

  function renderOrderItems(
    container,
    cart
  ) {
    if (!container) {
      return;
    }

    container.innerHTML =
      cart.map(item => `
        <div class="checkout-item">

          <div>
            <strong>
              ${escapeHTML(item.name)}
            </strong>

            <small>
              ${escapeHTML(item.type)}
              · Qty ${item.quantity}
            </small>
          </div>

          <strong>
            ${money(item.lineTotal)}
          </strong>

        </div>
      `).join("");
  }

  function getFieldValue(
    ...selectors
  ) {
    const element =
      first(
        ...selectors
      );

    return (
      element?.value?.trim?.() ||
      ""
    );
  }

function renderCheckout() {
  const page = qs(".checkout-page");

  if (!page) {
    return;
  }

  const cart = loadCart();
  const totals = calculateCart(cart);

  const itemsContainer =
    first(
      "#checkoutItems",
      "#orderItems",
      "[data-checkout-items]"
    );

  renderOrderItems(
    itemsContainer,
    cart
  );

  const empty =
    first(
      "#checkoutEmpty",
      "#emptyOrder",
      "[data-checkout-empty]"
    );

  if (empty) {
    empty.hidden =
      cart.length > 0;

    empty.classList.toggle(
      "hidden",
      cart.length > 0
    );
  }

  setMoney(
    [
      "#checkoutSubtotal",
      "#orderSubtotal"
    ],
    totals.subtotal
  );

  const pickupButton =
    qs("#pickupButton");

  const shippingButton =
    qs("#shippingButton");

  const deliveryMethod =
    qs("#deliveryMethod");

  const street = qs("#street");
  const city = qs("#city");
  const state = qs("#state");
  const zip = qs("#zip");
const shippingAddressSection =
  qs("#shippingAddressSection");
  function updateDelivery(method) {

    const shipping =
      method === "shipping" && cart.length
        ? SHIPPING_RATE
        : 0;

    if (deliveryMethod) {
      deliveryMethod.value = method;
    }

    pickupButton?.classList.toggle(
      "active",
      method === "pickup"
    );

    shippingButton?.classList.toggle(
      "active",
      method === "shipping"
    );

    setMoney(
      [
        "#checkoutShipping",
        "#orderShipping"
      ],
      shipping
    );

    setMoney(
      [
        "#checkoutTotal",
        "#orderTotal"
      ],
      totals.subtotal + shipping
    );

    const needsAddress =
      method === "shipping";
     if (shippingAddressSection) {
  shippingAddressSection.hidden =
    !needsAddress;
}


    [street, city, state, zip]
      .forEach(field => {
        if (field) {
          field.required =
            needsAddress;
        }
      });
  }

  pickupButton?.addEventListener(
    "click",
    () => {
      updateDelivery("pickup");
    }
  );

  shippingButton?.addEventListener(
    "click",
    () => {
      updateDelivery("shipping");
    }
  );

  setMoney(
    [
      "#checkoutShipping",
      "#orderShipping"
    ],
    0
  );

  setMoney(
    [
      "#checkoutTotal",
      "#orderTotal"
    ],
    totals.subtotal
  );
/* =========================================
   PAYMENT METHOD SELECTION
========================================= */

const paymentButtons =
  qsa(".payment-method-button");

const paymentMethod =
  qs("#paymentMethod");

const paymentInstructions =
  qs("#paymentInstructions");

paymentButtons.forEach(button => {

  button.addEventListener("click", () => {

    paymentButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    const method =
      button.dataset.paymentMethod;

    if (paymentMethod) {
      paymentMethod.value = method;
    }

    if (!paymentInstructions) return;

    paymentInstructions.hidden = false;

    if (method === "Chime") {
      paymentInstructions.innerHTML =
        "<strong>CHIME</strong><br>Send payment to $Demardia-Goss-1";
    }

    if (method === "Cash App") {
      paymentInstructions.innerHTML =
        "<strong>CASH APP</strong><br>Send payment to $Lillie05Anne";
    }

    if (method === "Apple Pay") {
      paymentInstructions.innerHTML =
        "<strong>APPLE PAY</strong><br>Send payment to 9037016851";
    }

    if (method === "Cash") {
      paymentInstructions.innerHTML =
        "<strong>CASH</strong><br>Payment due at pickup.";
    }

  });

});
   
  const placeOrderButton =
    first(
      "#placeOrderButton",
      "#placeOrder",
      ".place-order-button"
    );

  if (
    placeOrderButton &&
    !cart.length
  ) {
    placeOrderButton.disabled =
      true;
  }

  initCheckoutSubmission(
    cart
  );
}

  /* =========================================================
     BUILD ORDER
     ========================================================= */

  function buildOrder(
    cart = loadCart()
  ) {
    const totals =
      calculateCart(
        cart
      );

    const fullName =
      getFieldValue(
        "#fullName",
        "#customerName",
        "[name='name']"
      ) ||
      [
        getFieldValue(
          "#firstName",
          "[name='firstName']"
        ),

        getFieldValue(
          "#lastName",
          "[name='lastName']"
        )
      ]
        .filter(Boolean)
        .join(" ");

    return {
      orderNumber:
        `NF-${Date.now()
          .toString()
          .slice(-8)}`,

      createdAt:
        new Date()
          .toISOString(),
deliveryMethod: getFieldValue("#deliveryMethod"),
      customer: {
        name:
          fullName,

        email:
          getFieldValue(
            "#email",
            "#customerEmail",
            "[name='email']"
          ),

        phone:
          getFieldValue(
            "#phone",
            "#customerPhone",
            "[name='phone']"
          )
      },

      shippingAddress: {
        street:
          getFieldValue(
            "#street",
            "#address",
            "[name='street']",
            "[name='address']"
          ),

        unit:
          getFieldValue(
            "#unit",
            "#apt",
            "#suite",
            "[name='unit']",
            "[name='apt']"
          ),

        city:
          getFieldValue(
            "#city",
            "[name='city']"
          ),

        state:
          getFieldValue(
            "#state",
            "[name='state']"
          ),

        zip:
          getFieldValue(
            "#zip",
            "#postalCode",
            "[name='zip']"
          )
      },

      notes:
        getFieldValue(
          "#orderNotes",
          "#notes",
          "[name='notes']"
        ),

      items:
        cart.map(
          normalizeItem
        ),

     subtotal:
  totals.subtotal,

shipping:
  getFieldValue("#deliveryMethod") === "shipping"
    ? SHIPPING_RATE
    : 0,

total:
  totals.subtotal +
  (
    getFieldValue("#deliveryMethod") === "shipping"
      ? SHIPPING_RATE
      : 0
  ),

paymentMethod:
  getFieldValue("#paymentMethod"),

paymentStatus:
  getFieldValue("#paymentMethod") === "Cash"
    ? "CASH DUE AT PICKUP"
    : "PAYMENT INSTRUCTIONS PROVIDED"
    };
  }

  /* =========================================================
     COMPLETE ORDER
     ========================================================= */

  function saveOrderAndGoToReceipt() {
    const cart =
      loadCart();

    if (!cart.length) {
      alert(
        "Your cart is empty."
      );

      return false;
    }

    const order =
      buildOrder(
        cart
      );

    /*
       Save receipt data FIRST.
    */
    writeJSON(
      ORDER_KEY,
      order
    );

    /*
       Then clear cart.
    */
    saveCart([]);

    window.location.href =
      "receipt.html";

    return true;
  }

  function initCheckoutSubmission(
    cart
  ) {
    if (!cart.length) {
      return;
    }

    const form =
      first(
        "#checkoutForm",
        "form.checkout-form",
        ".checkout-page form"
      );

    const button =
      first(
        "#placeOrderButton",
        "#placeOrder",
        ".place-order-button"
      );

  

    if (form) {
    form.addEventListener(
  "submit",
  event => {
    event.preventDefault();

 const deliveryMethod =
  getFieldValue("#deliveryMethod");

if (!deliveryMethod) {
  alert("Choose PICKUP or SHIPPING before placing your order.");
  return;
}

const paymentMethod =
  getFieldValue("#paymentMethod");

 if (!paymentMethod) {
  alert("Choose a payment method before placing your order.");
  return;
}

if (
  paymentMethod === "Cash" &&
  deliveryMethod !== "pickup"
) {
  alert("Cash payment is available for PICKUP orders only.");
  return;
}

saveOrderAndGoToReceipt();
  }
);  
    }

    if (
      button &&
      !button.disabled &&
      !form
    ) {
      button.addEventListener(
        "click",
        event => {
          event.preventDefault();

          saveOrderAndGoToReceipt();
        }
      );
    }
  }

  /* =========================================================
     RECEIPT
     ========================================================= */

  function renderReceipt() {
    const page =
      qs(".receipt-page");

    if (
      !page &&
      !qs("#receiptItems")
    ) {
      return;
    }

    const order =
      readJSON(
        ORDER_KEY,
        null
      );

    if (!order) {
      return;
    }

    setText(
      "#orderNumber",
      order.orderNumber ||
      ""
    );

    setText(
      "#orderDate",
      order.createdAt
        ? new Date(
            order.createdAt
          ).toLocaleString()
        : ""
    );

    setText(
      "#customerName",
      order.customer?.name ||
      ""
    );

    setText(
      "#customerEmail",
      order.customer?.email ||
      ""
    );

    setText(
      "#customerPhone",
      order.customer?.phone ||
      ""
    );
setText(
  "#receiptPaymentMethod",
  order.paymentMethod ||
  ""
);
    const items =
      qs("#receiptItems");

    if (items) {
      items.innerHTML =
        (order.items || [])
          .map(item => `
            <div class="receipt-item">

              <div>

                <strong>
                  ${escapeHTML(item.name)}
                </strong>

                <small>
                  ${escapeHTML(item.type)}
                  · Qty ${item.quantity}
                </small>

              </div>

              <strong>
                ${money(item.lineTotal)}
              </strong>

            </div>
          `)
          .join("");
    }

    setMoney(
      "#receiptSubtotal",
      order.subtotal ||
      0
    );

    setMoney(
      "#receiptShipping",
      order.shipping ||
      0
    );

   
    setMoney(
      "#receiptTotal",
      order.total ||
      0
    );

    const address =
      [
        order.shippingAddress?.street,
        order.shippingAddress?.unit,
        order.shippingAddress?.city,
        order.shippingAddress?.state,
        order.shippingAddress?.zip
      ]
        .filter(Boolean)
        .join(", ");

  setText(
  "#receiptAddress",
  order.deliveryMethod === "pickup"
    ? "PICKUP"
    : address
);

    setText(
      "#shippingAddress",
      address
    );

    const status =
      first(
        "#paymentStatus",
        "[data-payment-status]"
      );

    if (status) {
      status.textContent =
        order.paymentStatus ||
        "NOT PROCESSED";
    }
  }
/* =========================================================
   EXTRAS PAGE
   ========================================================= */

function initExtrasPage() {
  const card =
    qs(".extras-product-card");

  if (!card) return;

  const minus =
    qs(".extras-minus", card);

  const plus =
    qs(".extras-plus", card);

  const qtyEl =
    qs(".extras-quantity-number", card);

  const add =
    qs(".extras-add-cart", card);

const colorButtons =
  qsa(".extras-color-button", card);

colorButtons.forEach(button => {
  button.onclick = function (event) {
    event.preventDefault();

    colorButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
  };
});
  
   
  const getQty = () =>
    clampQuantity(
      qtyEl?.textContent || 1
    );

  const setQty = value => {
    if (qtyEl) {
      qtyEl.textContent =
        clampQuantity(value);
    }
  };

  minus?.addEventListener(
    "click",
    () => {
      setQty(
        getQty() - 1
      );
    }
  );

  plus?.addEventListener(
    "click",
    () => {
      setQty(
        getQty() + 1
      );
    }
  );

add?.addEventListener(
  "click",
  event => {
    event.preventDefault();

    const selectedColor =
      qs(".extras-color-button.active", card);

    if (!selectedColor) {
      alert("Choose a color first.");
      return;
    }

    const color =
      selectedColor.dataset.color;

addItem({
  id: `never-fold-pro-2-${slugify(color)}`,
  name: `Never Fold Pro 2 — ${color}`,
  type: "Never Fold Extras",
  price: 50,
  unitPrice: 50,
  quantity: getQty()
});
     
      const originalText =
        add.textContent;

      add.textContent =
        "ADDED ✓";

      setTimeout(
        () => {
          add.textContent =
            originalText;
        },
        900
      );
    }
  );
}
  /* =========================================================
     GLOBAL NEVER FOLD FUNCTIONS
     ========================================================= */

  window.NeverFold =
    Object.freeze({
      prices:
        Object.freeze({
          original:
            ORIGINAL_PRICE,

          refill:
            REFILL_PRICE,

          vault:
            VAULT_PRICE,

          shipping:
            SHIPPING_RATE
        }),

      getCart:
        () =>
          loadCart(),

      calculateCart:
        () =>
          calculateCart(
            loadCart()
          ),

      addItem:
        addItem,

      renderCart:
        renderCart,

      completeOrder:
        saveOrderAndGoToReceipt
    });

  /* =========================================================
     START EVERYTHING
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
           if (checkTrial()) {
      return;
    }
      updateCartBadges();

      initProductPage();

      initVaultPage();

      initRefillPage();
       
initExtrasPage();
       
      initFinderPage();

      renderCart();

      renderCheckout();

      renderReceipt();
    }
  );

})();



