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
          data[categoryName].forEach(url => {
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

  console.log(`🔎 Checking ${category}`);

  fetch(`http://localhost:3000/check?category=${encodeURIComponent(category)}`)
    .then(res => res.json())
    .then(data => {
      const statusCell = document.getElementById(`status-${index}`);
      const failuresCell = document.getElementById(`failures-${index}`);

      statusCell.className = 'status-cell';
      failuresCell.textContent = '';

      if (data.status === 'green') statusCell.classList.add('status-green');
      else if (data.status === 'orange') statusCell.classList.add('status-orange');
      else if (data.status === 'red') statusCell.classList.add('status-red');

      statusCell.textContent = data.status.toUpperCase();

      if (data.failed.length > 0) {
        failuresCell.textContent = data.failed.join('\n');
      }
    })
    .catch(err => {
      console.error('❌ Check failed:', err);
      alert('Failed to check category URLs.');
    });
}

function checkAllCategories() {
  if (!window.categoryNames) return;

  for (let i = 0; i < window.categoryNames.length; i++) {
    checkCategory(i);
  }
}
