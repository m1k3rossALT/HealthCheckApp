document.addEventListener('DOMContentLoaded', () => {
  const API_HEADERS = {
  'x-api-key': 'secretkey123'  // 🔐 Replace with your real key
  };

  fetch('http://localhost:3000/urls', {
    headers: API_HEADERS
  })
    .then(res => res.json())
    .then(data => {
      const categories = Object.keys(data);

      window.categoryNames = categories;
      window.urlData = data; // Save full URL config for health mapping

      categories.forEach((categoryName, index) => {
        const ul = document.querySelector(`.category-cell[data-index="${index}"] .dropdown-list`);
        const toggle = document.querySelector(`.category-cell[data-index="${index}"] .dropdown-toggle`);

        if (data[categoryName] && ul) {
          const urls = data[categoryName].urls || data[categoryName];
          urls.forEach(url => {
            const li = document.createElement('li');
            li.textContent = url;
            ul.appendChild(li);
          });
        }

        if (toggle) {
          toggle.addEventListener('click', () => {
            ul.style.display = ul.style.display === 'block' ? 'none' : 'block';
          });
        }
      });
    })
    .catch(err => console.error('❌ Failed to load URLs:', err));
});

function checkCategory(index) {
  const category = window.categoryNames?.[index];
  if (!category) return;

  const statusCell = document.getElementById(`status-${index}`);
  const failuresCell = document.getElementById(`failures-${index}`);

  statusCell.className = 'status-cell';
  statusCell.textContent = 'Checking...';
  statusCell.style.backgroundColor = '#ffc107';
  failuresCell.textContent = '';

  const API_HEADERS = {
  'x-api-key': 'secretkey123'  // 🔐 Replace with your real key
  };
  
  fetch(`http://localhost:3000/check-full?category=${encodeURIComponent(category)}`, {
    headers: API_HEADERS
    }
  )
    .then(res => res.json())
    .then(data => {
      const allUrls = window.urlData?.[category]?.urls || [];
      const failedUrls = Array.isArray(data.failed) ? data.failed : [];

      const loginResultsMap = new Map(
        (data.login?.results || []).map(r => [r.url.replace(/\/login$/, ''), r])
      );

      const mergedOutput = allUrls.map((url) => {
        const isUp = !failedUrls.includes(url);
        const loginInfo = loginResultsMap.get(url);

        if (!isUp) {
          return `❌ ${url} (URL Down)`;
        }

        if (loginInfo?.success === true) {
          return `✅ ${url} (Login Passed)`;
        } else {
          return `❌ ${url} (Login Failed)`;
        }
      });

      failuresCell.textContent = mergedOutput.join('\n');

      // Set overall category status in Column 2
      const total = allUrls.length;
      const urlFailures = failedUrls.length;
      const loginFailures = (data.login?.results || []).filter(r => r.success === false).length;

      if (urlFailures === total) {
        statusCell.textContent = 'Health ❌';
        statusCell.classList.add('status-red');
      } else if (urlFailures > 0 || loginFailures > 0) {
        statusCell.textContent = 'Partial ❌';
        statusCell.classList.add('status-orange');
      } else {
        statusCell.textContent = '✅ All OK';
        statusCell.classList.add('status-green');
      }
    })
    .catch(err => {
      console.error('❌ Check failed:', err);
      statusCell.textContent = 'Error ❌';
      statusCell.classList.add('status-red');
      failuresCell.textContent = 'Error while checking.';
    });
}

function checkAllCategories() {
  if (!window.categoryNames) return;

  for (let i = 0; i < window.categoryNames.length; i++) {
    checkCategory(i);
  }
}
