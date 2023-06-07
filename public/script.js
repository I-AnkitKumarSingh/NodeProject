// Fetch and display crypto data
fetch('/api/crypto-data')
  .then(response => response.json())
  .then(data => {
    const table = document.getElementById('crypto-table');

    data.forEach(item => {
      const row = table.insertRow();
      row.insertCell().textContent = item.name;
      row.insertCell().textContent = item.last;
      row.insertCell().textContent = item.buy;
      row.insertCell().textContent = item.sell;
      row.insertCell().textContent = item.volume;
      row.insertCell().textContent = item.base_unit;
    });
  })
  .catch(error => {
    console.error('Error fetching crypto data', error);
  });
