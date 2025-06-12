
const getStorage = (key) =>
  new Promise((resolve) => chrome.storage.local.get([key], resolve));

const setStorage = (data) =>
  new Promise((resolve) => chrome.storage.local.set(data, resolve));

// Log API requests
async function handleBeforeRequest(details) {
  if (details.type != "image" &&  details.type != "script" &&  details.type != "stylesheet"
      && details.type!= "main_frame" && details.type!= "ping"
  ) {
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
  if (details.type != "image" &&  details.type != "script" &&  details.type != "stylesheet"
      && details.type!= "main_frame" && details.type!= "ping"
  ) {
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
 if (details.type != "image" &&  details.type != "script" &&  details.type != "stylesheet"
      && details.type!= "main_frame" && details.type!= "ping"
  ) {
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
