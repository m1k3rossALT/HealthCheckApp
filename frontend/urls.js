const urlMap = {
  "ICMRM": [
    "https://icmrm.cardinalhealth.net/icmrm/admin/jsf/login.jsp",
    "https://cmecmpharma1.cardinalhealth.net:9443/icmrm/admin/jsf/login.jsp"
  ],
  "MEDICMRM": [
    "https://medicmrm.cardinalhealth.net/icmrm/admin/jsf/login.jsp",
    "https://cmecmpharma1.cardinalhealth.net:9443/icmrm/admin/jsf/login.jsp"
  ],
  "ICN - Navigator": [
    "https://contentmanager.cardinalhealth.net/navigator/",
    "https://lpec5009cmnpa01.cardinalhealth.net:9444/navigator/"
  ],
  "ICN - CMIS": [
    "https://ecmapp.appzone.dmz/navigator",
    "https://CMECMCMIS1.appzone.dmz/navigator"
  ],
  "ICN - Desktops": [
    "https://contentmanager.cardinalhealth.net/navigator/?desktop=CCA",
    "https://contentmanager.cardinalhealth.net/navigator/?desktop=ICCSAP",
    "https://contentmanager.cardinalhealth.net/navigator/?desktop=Presource"
  ],
  "Other URLs": [
    "https://ecmimagews.cardinalhealth.net/ECMContentService/ECMContentSummaryService_v2_1",
    "https://ecmwebclient.cardinalhealth.net/ECMWebClient/"
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
