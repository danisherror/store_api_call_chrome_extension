const getStorage = (key) =>
  new Promise((resolve) => chrome.storage.local.get([key], resolve));

const setStorage = (data) =>
  new Promise((resolve) => chrome.storage.local.set(data, resolve));

async function handleBeforeRequest(details) {
  if (!["image", "script", "stylesheet", "main_frame", "ping"].includes(details.type)) {
    const apiCall = {
      url: details.url,
      method: details.method,
      timeStamp: new Date().toISOString(),
      type: details.type,
      requestId: details.requestId,
    };

    const result = await getStorage("apiLogs");
    const apiLogs = result.apiLogs || [];

    if (apiLogs.length >= 100) apiLogs.shift();

    apiLogs.push(apiCall);
    await setStorage({ apiLogs });
    console.log("[API Logger] Request logged:", apiCall);
  }
}

async function handleCompleted(details) {
  if (!["image", "script", "stylesheet", "main_frame", "ping"].includes(details.type)) {
    const result = await getStorage("apiLogs");
    const apiLogs = result.apiLogs || [];
    const logEntry = apiLogs.find((log) => log.requestId === details.requestId);

    if (logEntry) {
      logEntry.statusCode = details.statusCode;
      logEntry.statusLine = details.statusLine;
      logEntry.responseTime = new Date().toISOString();

      await setStorage({ apiLogs });
      console.log("[API Logger] Response logged:", logEntry);
    }
  }
}

async function handleError(details) {
  if (!["image", "script", "stylesheet", "main_frame", "ping"].includes(details.type)) {
    const result = await getStorage("apiLogs");
    const apiLogs = result.apiLogs || [];
    const logEntry = apiLogs.find((log) => log.requestId === details.requestId);

    if (logEntry) {
      logEntry.error = details.error;
      await setStorage({ apiLogs });
      console.log("[API Logger] Error logged:", logEntry);
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  handleBeforeRequest,
  { urls: ["<all_urls>"] },
  ["requestBody"]
);

chrome.webRequest.onCompleted.addListener(handleCompleted, { urls: ["<all_urls>"] });

chrome.webRequest.onErrorOccurred.addListener(handleError, { urls: ["<all_urls>"] });
