// extension/src/contentScript.js
// Content script injected into e-commerce pages

// Detect current e-commerce platform
function detectStore() {
  const hostname = window.location.hostname;
  if (hostname.includes("amazon.in")) return "amazon";
  if (hostname.includes("flipkart.com")) return "flipkart";
  if (hostname.includes("myntra.com")) return "myntra";
  if (hostname.includes("ajio.com")) return "ajio";
  if (hostname.includes("meesho.com")) return "meesho";
  if (hostname.includes("tataccliq.com")) return "tata_cliq";
  if (hostname.includes("croma.com")) return "croma";
  if (hostname.includes("nykaa.com")) return "nykaa";
  if (hostname.includes("firstcry.com")) return "firstcry";
  if (hostname.includes("reliance.com")) return "reliance";
  return null;
}

// Extract product information from page
function extractProductInfo() {
  let productTitle = "";
  let productPrice = 0;
  let productImage = "";

  // Amazon
  if (detectStore() === "amazon") {
    productTitle =
      document.querySelector("h1 span")?.textContent || document.title;
    const priceEl = document.querySelector(".a-price-whole");
    productPrice = priceEl
      ? parseFloat(priceEl.textContent.replace("₹", "").replace(",", ""))
      : 0;
    productImage = document.querySelector("img.a-dynamic-image")?.src || "";
  }

  // Flipkart
  if (detectStore() === "flipkart") {
    productTitle =
      document.querySelector("span._6EBuvT")?.textContent || document.title;
    const priceEl = document.querySelector("._30jeq3._16Jk6d");
    productPrice = priceEl
      ? parseFloat(priceEl.textContent.replace("₹", "").replace(",", ""))
      : 0;
  }

  // Myntra
  if (detectStore() === "myntra") {
    productTitle =
      document.querySelector("h1.productMainheading")?.textContent ||
      document.title;
    const priceEl = document.querySelector(".discountedPriceText");
    productPrice = priceEl
      ? parseFloat(priceEl.textContent.replace("₹", "").replace(",", ""))
      : 0;
  }

  return {
    title: productTitle.trim().substring(0, 200),
    price: productPrice,
    image: productImage,
    url: window.location.href,
    store: detectStore(),
  };
}

// Create and inject comparison widget
function injectComparisonWidget(comparison) {
  // Remove existing widget
  const existing = document.getElementById("dealhub-widget");
  if (existing) existing.remove();

  const widget = document.createElement("div");
  widget.id = "dealhub-widget";
  widget.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 380px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    border: 2px solid #007AFF;
    z-index: 99999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  if (!comparison.found) {
    widget.innerHTML = `
      <div style="padding: 16px; text-align: center; color: #666;">
        <p>Product not found in DealHub database</p>
        <button onclick="window.open('https://dealhub.in/product/add', '_blank')" 
                style="padding: 8px 16px; background: #007AFF; color: white; border: none; border-radius: 6px; cursor: pointer;">
          Add Product
        </button>
      </div>
    `;
  } else {
    const bestPrice = comparison.bestPrice || 0;
    const alternatives = comparison.alternatives || [];

    widget.innerHTML = `
      <div style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">DealHub Comparison</h3>
          <button onclick="document.getElementById('dealhub-widget').remove()" 
                  style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">×</button>
        </div>

        <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
          <p style="margin: 0; font-size: 12px; color: #666; margin-bottom: 4px;">Best Price on DealHub</p>
          <p style="margin: 0; font-size: 20px; font-weight: 700; color: #007AFF;">₹${bestPrice.toLocaleString()}</p>
        </div>

        <div style="max-height: 180px; overflow-y: auto;">
          ${alternatives
            .map(
              (alt) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; 
                        border-bottom: 1px solid #eee; cursor: pointer;"
                 onclick="window.open('${alt.affiliateUrl || alt.url}', '_blank')">
              <div>
                <p style="margin: 0; font-size: 12px; color: #666;">${alt.store}</p>
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">₹${alt.price.toLocaleString()}</p>
              </div>
              <div style="text-align: right;">
                ${alt.discount ? `<span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">${alt.discount}% OFF</span>` : ""}
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <button onclick="chrome.runtime.sendMessage({action: 'setAlert', data: {productTitle: '${comparison.product.title}', targetPrice: ${bestPrice}, alertType: 'below'}}); alert('Alert set!');" 
                style="width: 100%; padding: 12px; margin-top: 12px; background: #007AFF; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
          Set Price Alert
        </button>
      </div>
    `;
  }

  document.body.appendChild(widget);
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showComparison") {
    injectComparisonWidget(request.data);
    sendResponse({ success: true });
  }

  if (request.action === "triggerComparison") {
    const product = extractProductInfo();
    chrome.runtime.sendMessage(
      {
        action: "getComparison",
        data: product,
      },
      (response) => {
        if (!chrome.runtime.lastError) {
          injectComparisonWidget(response);
        }
      },
    );
  }
});

// Auto-run comparison on page load
window.addEventListener("load", () => {
  // Delay to ensure all DOM elements are loaded
  setTimeout(() => {
    const product = extractProductInfo();
    if (product.title) {
      chrome.runtime.sendMessage(
        {
          action: "getComparison",
          data: product,
        },
        (response) => {
          if (!chrome.runtime.lastError && response?.found) {
            injectComparisonWidget(response);
          }
        },
      );
    }
  }, 1000);
});

// Track affiliate clicks
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-affiliate-id]");
  if (link) {
    const affiliateId = link.getAttribute("data-affiliate-id");
    chrome.runtime.sendMessage({
      action: "trackClick",
      data: { affiliateLinkId: affiliateId },
    });
  }
});
