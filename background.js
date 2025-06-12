// chrome.webRequest.onBeforeRequest.addListener(
//     function(details)
//     {
//         if(details.url.includes('/api/'))
//         {
//             const apiCall= {
//                 url:details.url,
//                 method: details.method,
//                 timeStamp: new Date().toISOString(),
//                 type: details.type,
//                 requestId: details.requestId
//             }

//             chrome.storage.local.get(['apiLogs'],function(result)
//             {
//                 const apiLogs=result.apiLogs || [];
//                 apiLogs.push(apiCall);
//                 chrome.storage.local.set({apiLogs:apiLogs},function(){
//                     console.log('API call logged:',apiCall)
//                 });
//             });
//         }
//     },
//     {urls:['<all_urls>']},
//     ['requestBody']
// );

// chrome.webRequest.onCompleted.addListener(
//     function(details)
//     {
//         if(details.url.includes('/api/'))
//         {
//             chrome.storage.local.get(['apiLogs'],function(result)
//             {
//                 const apiLogs = result.apiLogs || [];
//                 const logEntry = apiLogs.find(log =>log.requestId===details.requestId);
//                 if(logEntry)
//                 {
//                     logEntry.statusCode = details.statusCode;
//                     logEntry.statusLine = details.statusLine;
//                     logEntry.responseTime = details.timeStamp;
//                     chrome.storage.local.set({apiLogs:apiLogs},function(){
//                         console.log('API response logged', logEntry);
//                     });
//                 }
//             });
//         }
//     },
//     {urls:['<all_urls>']}
// );

// chrome.webRequest.onErrorOccurred.addListener(
//     function(details)
//     {
//         if(details.url.includes('/api/'))
//         {
//             chrome.storage.local.get(['apiLogs'],function(result)
//             {
//                 const apiLogs = result.apiLogs || [];
//                 const logEntry = apiLogs.find(log =>log.requestId===details.requestId);
//                 if(logEntry)
//                 {
//                     logEntry.error = details.error;
//                     chrome.storage.local.set({apiLogs:apiLogs},function(){
//                         console.log('API error logged', logEntry);
//                     });
//                 }
//             });
//         }
//     },
//     {urls:['<all_urls>']}
// );

// Helper functions for storage
const getStorage = (key) =>
  new Promise((resolve) => chrome.storage.local.get([key], resolve));

const setStorage = (data) =>
  new Promise((resolve) => chrome.storage.local.set(data, resolve));

// Log API requests
async function handleBeforeRequest(details) {
  if (details.url.includes('/api/')) {
    const apiCall = {
      url: details.url,
      method: details.method,
      timeStamp: new Date().toISOString(),
      type: details.type,
      requestId: details.requestId
    };

    const result = await getStorage('apiLogs');
    const apiLogs = result.apiLogs || [];

    // Optional: Limit logs to 100 entries
    if (apiLogs.length >= 100) apiLogs.shift();

    apiLogs.push(apiCall);
    await setStorage({ apiLogs });
    console.log('[API Logger] Request logged:', apiCall);
  }
}

// Log API responses
async function handleCompleted(details) {
  if (details.url.includes('/api/')) {
    const result = await getStorage('apiLogs');
    const apiLogs = result.apiLogs || [];
    const logEntry = apiLogs.find(log => log.requestId === details.requestId);

    if (logEntry) {
      logEntry.statusCode = details.statusCode;
      logEntry.statusLine = details.statusLine;
      logEntry.responseTime = new Date().toISOString();

      await setStorage({ apiLogs });
      console.log('[API Logger] Response logged:', logEntry);
    }
  }
}

// Log API errors
async function handleError(details) {
  if (details.url.includes('/api/')) {
    const result = await getStorage('apiLogs');
    const apiLogs = result.apiLogs || [];
    const logEntry = apiLogs.find(log => log.requestId === details.requestId);

    if (logEntry) {
      logEntry.error = details.error;
      await setStorage({ apiLogs });
      console.log('[API Logger] Error logged:', logEntry);
    }
  }
}

// Register listeners
chrome.webRequest.onBeforeRequest.addListener(
  handleBeforeRequest,
  { urls: ['<all_urls>'] },
  ['requestBody']
);

chrome.webRequest.onCompleted.addListener(
  handleCompleted,
  { urls: ['<all_urls>'] }
);

chrome.webRequest.onErrorOccurred.addListener(
  handleError,
  { urls: ['<all_urls>'] }
);
