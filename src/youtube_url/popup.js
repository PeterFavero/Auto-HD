document.getElementById('recordBtn').addEventListener('click', function() {
    const urlToOpen = "https://www.google.com"; // Replace with your custom URL
    chrome.tabs.create({ url: urlToOpen }, function(tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: startRecording, // Define this function to start recording
      });
    });
  });
  
  function startRecording() {
    // Recording logic here
    console.log('Recording started...');
  }

  