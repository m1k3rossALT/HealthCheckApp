const urlMap = {
  "Authentication": [
    "https://example.com/auth1",
    "https://example.com/auth2"
  ],
  "Payments": [
    "https://example.com/pay1",
    "https://example.com/pay2"
  ],
  "User Profile": [
    "https://example.com/profile1",
    "https://example.com/profile2"
  ],
  "Notifications": [
    "https://example.com/notify1"
  ],
  "Analytics": [
    "https://example.com/analytics1",
    "https://example.com/analytics2"
  ],
  "Admin Panel": [
    "https://example.com/admin1",
    "https://example.com/admin2"
  ]
};

async function checkCategory(category) {
  const urls = urlMap[category] || [];
  const failed = [];

  await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) failed.push(url);
      } catch {
        failed.push(url);
      }
    })
  );

  const row = document.querySelector(`tr[data-category="${category}"]`);
  const statusCell = row.querySelector(".status-cell");
  const failureCell = row.querySelector(".failures-cell");

  // Reset styles
  statusCell.className = "status-cell";

  if (failed.length === 0) {
    statusCell.classList.add("status-green");
    statusCell.textContent = "Green";
    failureCell.textContent = "-";
  } else if (failed.length < urls.length) {
    statusCell.classList.add("status-orange");
    statusCell.textContent = "Orange";
    failureCell.textContent = failed.join(", ");
  } else {
    statusCell.classList.add("status-red");
    statusCell.textContent = "Red";
    failureCell.textContent = failed.join(", ");
  }

  // Re-align buttons after height changes
  alignButtons();
}

function checkAllCategories() {
  Object.keys(urlMap).forEach((category) => {
    checkCategory(category);
  });
}
