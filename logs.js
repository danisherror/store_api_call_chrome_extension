let logs = [];
let filteredLogs = [];

function renderTable(data) {
  const tbody = document.getElementById('apiTableBody');
  tbody.innerHTML = '';
  if(data.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="6" style="text-align:center;">No matching logs found</td>`;
    tbody.appendChild(row);
    return;
  }
  data.forEach(log => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td title="${log.url}">${log.url}</td>
      <td>${log.method}</td>
      <td>${log.statusCode || log.error || 'Pending'}</td>
      <td>${log.timeStamp}</td>
      <td>${log.responseTime || ''}</td>
      <td>${log.type}</td>
    `;
    tbody.appendChild(row);
  });
}

// Sort by key helper
function sortByKey(array, key, asc = true) {
  return array.sort((a, b) => {
    if (!a[key]) return 1;
    if (!b[key]) return -1;
    if (a[key] < b[key]) return asc ? -1 : 1;
    if (a[key] > b[key]) return asc ? 1 : -1;
    return 0;
  });
}

// Extract unique methods for filter dropdown
function populateMethodFilter() {
  const methodSet = new Set(logs.map(log => log.method));
  const select = document.getElementById('methodFilter');
  methodSet.forEach(method => {
    const option = document.createElement('option');
    option.value = method;
    option.textContent = method;
    select.appendChild(option);
  });
}

// Apply filters + search and render table
function applyFilters() {
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  const methodFilter = document.getElementById('methodFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;

  filteredLogs = logs.filter(log => {
    // Search filter
    const matchSearch = log.url.toLowerCase().includes(searchQuery) ||
                        log.method.toLowerCase().includes(searchQuery);

    if (!matchSearch) return false;

    // Method filter
    if (methodFilter && log.method !== methodFilter) return false;

    // Status filter
    if (statusFilter) {
      const statusCode = log.statusCode || 0;
      const hasError = !!log.error;

      if (statusFilter === 'success' && !(statusCode >= 200 && statusCode < 400)) return false;
      if (statusFilter === 'error' && !(statusCode >= 400 && statusCode < 600)) return false;
      if (statusFilter === 'pending' && !log.statusCode && !log.error) return false;
      if (statusFilter === 'failed' && !statusCode && log.error) return false;
    }

    return true;
  });

  renderTable(filteredLogs);
}

// Sorting on header click
document.querySelectorAll('th').forEach(header => {
  header.addEventListener('click', () => {
    const key = header.dataset.key;
    const asc = header.asc = !header.asc;
    filteredLogs = sortByKey(filteredLogs, key, asc);
    renderTable(filteredLogs);
  });
});

// Event listeners for filters
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('methodFilter').addEventListener('change', applyFilters);
document.getElementById('statusFilter').addEventListener('change', applyFilters);

// Load logs from storage and initialize
chrome.storage.local.get(['apiLogs'], (result) => {
  logs = result.apiLogs || [];
  populateMethodFilter();
  filteredLogs = [...logs];
  renderTable(filteredLogs);
});
