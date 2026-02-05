// extension/src/background.js
// Chrome Extension Service Worker

// Store for user and extension data
const extensionStorage = {
  userId: null,
  apiKey: null,
  apiUrl: "https://dealhub.in/api",
  extensionId: null,
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    // On first install, open onboarding page
    chrome.tabs.create({
      url: "chrome-extension://" + chrome.runtime.id + "/src/onboarding.html",
    });
  }

  // Generate and store extension ID
  const extensionId = "ext_" + Math.random().toString(36).substring(2, 11);
  chrome.storage.local.set({ extensionId });
  extensionStorage.extensionId = extensionId;
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getComparison") {
    handleProductComparison(request.data, sender.tab.id).then(sendResponse);
    return true; // Keep channel open for async response
  }

  if (request.action === "setAlert") {
    handleSetAlert(request.data, sender.url).then(sendResponse);
    return true;
  }

  if (request.action === "trackClick") {
    trackAffiliateClick(request.data).then(() =>
      sendResponse({ success: true }),
    );
    return true;
  }

  if (request.action === "getUserData") {
    chrome.storage.local.get(["userId", "apiKey"], (result) => {
      sendResponse(result);
    });
    return true;
  }
});

// Handle product comparison
async function handleProductComparison(data, tabId) {
  try {
    const { currentUrl, pageTitle, productTitle, productPrice, storeName } =
      data;

    // Check if extension is enabled for this site
    const response = await fetch(
      `${extensionStorage.apiUrl}/extension/detect`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Extension-ID": extensionStorage.extensionId || "",
        },
        body: JSON.stringify({
          extensionId: extensionStorage.extensionId,
          currentUrl,
          pageTitle,
          productTitle,
          productPrice,
          storeName,
        }),
      },
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const result = await response.json();

    // Inject comparison badge into page
    if (result.found) {
      chrome.tabs
        .sendMessage(tabId, {
          action: "showComparison",
          data: result,
        })
        .catch(() => {
          // Ignore error if content script not loaded
        });
    }

    return result;
  } catch (error) {
    console.error("Comparison error:", error);
    return { error: error.message, found: false };
  }
}

// Handle price alert setup
async function handleSetAlert(data, url) {
  try {
    const { productTitle, targetPrice, alertType } = data;

    // Get user ID from storage
    const user = await new Promise((resolve) => {
      chrome.storage.local.get(["userId", "apiKey"], resolve);
    });

    if (!user.userId) {
      return { error: "Please login to set price alerts" };
    }

    // Create alert via API
    const response = await fetch(`${extensionStorage.apiUrl}/alerts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.apiKey}`,
      },
      body: JSON.stringify({
        productTitle,
        targetPrice,
        alertType,
        sourceUrl: url,
      }),
    });

    if (!response.ok) throw new Error("Failed to create alert");

    return { success: true, message: "Alert created successfully" };
  } catch (error) {
    console.error("Alert creation error:", error);
    return { error: error.message };
  }
}

// Track affiliate clicks
async function trackAffiliateClick(data) {
  try {
    const { affiliateLinkId, productId, storeId } = data;

    const user = await new Promise((resolve) => {
      chrome.storage.local.get(["userId"], resolve);
    });

    await fetch(`${extensionStorage.apiUrl}/affiliate/track-click`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        affiliateLinkId,
        productId,
        storeId,
        userId: user.userId,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("Click tracking error:", error);
  }
}

// Context menu for quick comparison
chrome.contextMenus.create({
  id: "comparePrice",
  title: "Compare Price on DealHub",
  contexts: ["page"],
  targetUrlPatterns: [
    "*://*.amazon.in/*",
    "*://*.flipkart.com/*",
    "*://*.myntra.com/*",
    "*://*.ajio.com/*",
    "*://*.meesho.com/*",
    "*://*.tataccliq.com/*",
    "*://*.croma.com/*",
    "*://*.nykaa.com/*",
    "*://*.firstcry.com/*",
  ],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "comparePrice") {
    chrome.tabs
      .sendMessage(tab.id, {
        action: "triggerComparison",
      })
      .catch(() => {
        // Content script might not be loaded
      });
  }
});

// Periodic price update check (every 4 hours)
chrome.alarms.create("checkPrices", { periodInMinutes: 240 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkPrices") {
    console.log("Checking for price updates...");
    // TODO: Implement price check logic
  }
});
