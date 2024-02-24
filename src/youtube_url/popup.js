// document.getElementById('checkUrl').addEventListener('click', function() {
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     var activeTab = tabs[0];
//     if (activeTab.url && activeTab.url.includes("youtube.com/watch")) {
//       chrome.runtime.sendMessage({action: "submitVideo", url: activeTab.url});
//     }
//   });
// });

document.addEventListener('DOMContentLoaded', function() {
  var checkUrlButton = document.getElementById('checkUrl');
  if (checkUrlButton) {
      checkUrlButton.addEventListener('click', function() {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
              var currentTab = tabs[0];
              if (currentTab && isYouTubeUrl(currentTab.url)) {
                  chrome.runtime.sendMessage({ action: "submitVideo", url: currentTab.url });
                  console.log(currentTab)
              }
          });
      });
  }
});

function isYouTubeUrl(url) {
  var youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
}

function startRecording() {
  console.log('Recording started...');
  // Insert recording logic here
}
