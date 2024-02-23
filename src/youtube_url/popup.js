document.getElementById('recordBtn').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {

    //Get current tab url
    var currentURL = tabs[0].url;

    //if it isn't a yt url, make the current URL the yt homepage
    if( !isYouTubeUrl(currentURL) ) currentURL = "https://www.youtube.com/"

    //Open a new URL and start recording in the previous tab
    chrome.tabs.create({ url: currentURL }, function(tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: startRecording, // Define this function to start recording
      });
    });

  });
});

function isYouTubeUrl(url) {
  // Regular expression to match YouTube video URLs
  var youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
}
  
function startRecording() {
  // Recording logic here
  console.log('Recording started...');
}
