let logs = [];

function renderTable(data) {
  const tbody = document.getElementById('apiTableBody');
  tbody.innerHTML = '';
  data.forEach(log => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${log.url}</td>
      <td>${log.method}</td>
      <td>${log.statusCode || log.error || 'Pending'}</td>
      <td>${log.timeStamp}</td>
      <td>${log.responseTime || ''}</td>
      <td>${log.type}</td>
    `;
    tbody.appendChild(row);
  });
}

function sortByKey(array, key, asc = true) {
  return array.sort((a, b) => {
    if (!a[key]) return 1;
    if (!b[key]) return -1;
    if (a[key] < b[key]) return asc ? -1 : 1;
    if (a[key] > b[key]) return asc ? 1 : -1;
    return 0;
  });
}

// Sorting
document.querySelectorAll('th').forEach(header => {
  header.addEventListener('click', () => {
    const key = header.dataset.key;
    const asc = header.asc = !header.asc;
    logs = sortByKey(logs, key, asc);
    renderTable(logs);
  });
});

// Search filter
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = logs.filter(log =>
    log.url.toLowerCase().includes(query) ||
    log.method.toLowerCase().includes(query)
  );
  renderTable(filtered);
});

// Load logs from storage
chrome.storage.local.get(['apiLogs'], (result) => {
  logs = result.apiLogs || [];
  renderTable(logs);
});
