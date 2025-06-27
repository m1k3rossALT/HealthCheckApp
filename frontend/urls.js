// No more hardcoded urlMap — now loaded dynamically

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
