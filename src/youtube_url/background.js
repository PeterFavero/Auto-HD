chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "startRecording") {
      console.log("Start recording the tab");
      // Implement recording functionality here
    }
  });
  