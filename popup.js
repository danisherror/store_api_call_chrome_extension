document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('apiTableBody');
  const clearBtn = document.getElementById('clearBtn');

  // Load and display API logs
  chrome.storage.local.get(['apiLogs'], function (result) {
    const apiLogs = result.apiLogs || [];

    // Sort by most recent first
    apiLogs.sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp));

    apiLogs.forEach(log => {
      const row = document.createElement('tr');

      // Highlight row if there's an error
      if (log.error) {
        row.classList.add('error-row');
      }

      row.innerHTML = `
        <td>${log.url}</td>
        <td>${log.method}</td>
        <td>${log.statusCode || log.error || 'Pending'}</td>
        <td>${log.timeStamp}</td>
      `;
      tableBody.appendChild(row);
    });
  });

  // Clear log storage and reload
  clearBtn.addEventListener('click', function () {
    chrome.storage.local.set({ apiLogs: [] }, function () {
      location.reload();
    });
  });
});
