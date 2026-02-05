// extension/src/popup.js
// Handle popup UI interactions

document.addEventListener("DOMContentLoaded", async () => {
  const contentDiv = document.getElementById("content");

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Send message to content script to get current product
  chrome.tabs.sendMessage(tab.id, { action: "getProductData" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      contentDiv.innerHTML = `
          <div class="status">
            <p>Current page is not supported</p>
            <button class="button button-primary" onclick="window.open('https://dealhub.in')">
              Open DealHub
            </button>
          </div>
        `;
      return;
    }

    displayComparison(response);
  });
});

function displayComparison(data) {
  const contentDiv = document.getElementById("content");

  if (!data.found) {
    contentDiv.innerHTML = `
      <div class="status">
        <p>Product not found in our database</p>
        <button class="button button-primary" onclick="window.open('https://dealhub.in/product/add')">
          Add Product
        </button>
      </div>
    `;
    return;
  }

  const { product, bestPrice, alternatives, bankOffers } = data;

  let html = `
    <div class="product-card">
      <h3 style="font-size: 13px; margin-bottom: 8px;">${product.title}</h3>
      <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${product.brand || "Brand not available"}</p>
      <p class="price-display">₹${bestPrice.toLocaleString()}</p>
    </div>
  `;

  if (bankOffers && bankOffers.length > 0) {
    html += `
      <div class="bank-offers">
        <h3>💳 Bank Offers</h3>
        ${bankOffers
          .slice(0, 2)
          .map(
            (offer) => `
          <div class="bank-offer-item">
            ${offer.title}
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }

  if (alternatives && alternatives.length > 0) {
    html += `
      <div class="alternatives">
        <div style="padding: 12px; background: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
          <h3 style="font-size: 12px; font-weight: 600;">Better Prices</h3>
        </div>
        ${alternatives
          .map(
            (alt) => `
          <div class="alternative-item" onclick="window.open('${alt.affiliateUrl || alt.url}')">
            <div>
              <div class="store-name">${alt.store}</div>
              <div class="store-price">₹${alt.price.toLocaleString()}</div>
            </div>
            <div>
              ${
                alt.discount
                  ? `<span class="discount-badge">${alt.discount}% OFF</span>`
                  : ""
              }
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }

  html += `
    <button class="button button-primary" onclick="setAlert('${product.title}', ${bestPrice})">
      🔔 Set Price Alert
    </button>
    <button class="button button-secondary" onclick="window.open('https://dealhub.in')">
      Open DealHub
    </button>
  `;

  contentDiv.innerHTML = html;
}

function setAlert(title, price) {
  const targetPrice = Math.round(price * 0.9); // 10% below current
  chrome.runtime.sendMessage({
    action: "setAlert",
    data: {
      productTitle: title,
      targetPrice,
      alertType: "below",
    },
  });

  alert(`Alert set for ₹${targetPrice}`);
}
