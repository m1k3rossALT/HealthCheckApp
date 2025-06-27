document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/urls')
    .then(res => res.json())
    .then(data => {
      for (let i = 1; i <= 6; i++) {
        const categoryName = `Category ${i}`;
        const ul = document.querySelector(`.category-cell[data-index="${i}"] .dropdown-list`);
        const toggle = document.querySelector(`.category-cell[data-index="${i}"] .dropdown-toggle`);

        // Populate dropdown list
        if (data[categoryName] && ul) {
          data[categoryName].forEach(url => {
            const li = document.createElement('li');
            li.textContent = url;
            ul.appendChild(li);
          });
        }

        // Add toggle behavior
        toggle.addEventListener('click', () => {
          ul.style.display = ul.style.display === 'block' ? 'none' : 'block';
        });
      }
    })
    .catch(err => console.error('Failed to load URLs:', err));
});

function checkCategory(index) {
  const category = `Category ${index}`;
  console.log(`Checking Category ${category}`);

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
      console.error('Check failed:', err);
      alert('Failed to check category URLs.');
    });
}

function checkAllCategories() {
  for (let i = 1; i <= 6; i++) {
    checkCategory(i);
  }
}

