// Map of categories and their URLs
const urlMap = {
  "Category 1": [
    "https://www.google.com",
    "https://www.github.com"
  ],
  "Category 2": [
    "https://www.doesnotexist123.com",
    "https://httpstat.us/500"
  ],
  "Category 3": [
    "https://httpstat.us/200",
    "https://httpstat.us/403"
  ],
  "Category 4": [
    "https://www.microsoft.com"
  ],
  "Category 5": [
    "https://httpstat.us/404",
    "https://httpstat.us/503"
  ],
  "Category 6": [
    "https://httpstat.us/200"
  ]
};

// Check all URLs in a category
async function checkCategory(category) {
  const urls = urlMap[category] || [];
  let failed = [];

  const checks = await Promise.all(urls.map(async (url) => {
    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) failed.push(url);
    } catch (err) {
      failed.push(url);
    }
  }));

  const row = document.querySelector(`tr[data-category="${category}"]`);
  const statusCell = row.querySelector(".status-cell");
  const failureCell = row.querySelector(".failures-cell");

  // Reset classes
  statusCell.className = "status-cell";

  // Determine status color
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
}

// Check all categories at once
function checkAllCategories() {
  Object.keys(urlMap).forEach(checkCategory);
}
