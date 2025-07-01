document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/urls')
    .then(res => res.json())
    .then(data => {
      const categories = Object.keys(data);

      categories.forEach((categoryName, index) => {
        const ul = document.querySelector(`.category-cell[data-index="${index}"] .dropdown-list`);
        const toggle = document.querySelector(`.category-cell[data-index="${index}"] .dropdown-toggle`);

        // Populate dropdown list
        if (data[categoryName] && ul) {
          const urls = data[categoryName].urls || data[categoryName]; // fallback for old format
          urls.forEach(url => {
            const li = document.createElement('li');
            li.textContent = url;
            ul.appendChild(li);
          });
        }

        // Add toggle behavior
        if (toggle) {
          toggle.addEventListener('click', () => {
            ul.style.display = ul.style.display === 'block' ? 'none' : 'block';
          });
        }
      });

      // Attach category names for checking later
      window.categoryNames = categories;
    })
    .catch(err => console.error('❌ Failed to load URLs:', err));
});

function checkCategory(index) {
  const category = window.categoryNames?.[index];
  if (!category) {
    console.warn(`No category found for index ${index}`);
    return;
  }

  const statusCell = document.getElementById(`status-${index}`);
  const failuresCell = document.getElementById(`failures-${index}`);

  statusCell.className = 'status-cell';
  statusCell.textContent = 'Checking...';
  statusCell.style.backgroundColor = '#ffc107'; // orange
  failuresCell.textContent = '';

  // Step 1: Health Check
  fetch(`http://localhost:3000/check?category=${encodeURIComponent(category)}`)
    .then(res => res.json())
    .then(healthData => {
      if (healthData.status === 'green') {
        // Step 2: Login Check
        statusCell.textContent = 'Health ✅, checking login...';
        return fetch(`http://localhost:3000/check-login?category=${encodeURIComponent(category)}`)
          .then(res => res.json())
          .then(loginData => {
            if (loginData.success) {
              statusCell.textContent = '✅ All OK (Health + Login)';
              statusCell.classList.add('status-green');
            } else {
              statusCell.textContent = 'Login ❌';
              statusCell.classList.add('status-red');
              failuresCell.textContent = loginData.reason || 'Login check failed';
            }
          });
      } else {
        // Health failed
        statusCell.textContent = `Health ❌`;
        statusCell.classList.add('status-red');

        if (Array.isArray(healthData.failed) && healthData.failed.length > 0) {
          failuresCell.textContent = healthData.failed.join('\n');
        }
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
