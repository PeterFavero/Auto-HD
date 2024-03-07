// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// SAVES ON USER END AFTER FIRST PROCESSED VIDEO AND JUST ACCESSES IT FOR LATER CHROME EXTENTION WHICH WILL BE INSTANT

// Global variables to track extension activation and tabs with processed videos
let recentlyClicked = false;
const processedVideoTabs = new Map();
let videoStreamTabId = null;
let tabCreationCounter = 0; // Counter for the number of tabs created

chrome.action.onClicked.addListener(async (tab) => {
  // chrome.tabs.create({url: "vid_stream.html"}); // FOR TESTING REMOVE WHEN CORS AND CPS ARE DEALT WITH
  // return;                                       // FOR TESTING REMOVE WHEN CORS AND CPS ARE DEALT WITH
  console.log("Checking if record was recently clicked:")
  console.log(recentlyClicked);
  if (recentlyClicked) {
    console.log("Clicked too quickly! try again later")
    return;
  } else {
    tabCreationCounter = 0;    // Reset the tabCreationCounter at the start of each new session

    recentlyClicked = true;
    setTimeout(() => { recentlyClicked = false; }, 5000);
    console.log(recentlyClicked);
  }
  console.log("Starting the process");
  chrome.action.setIcon({ path: '/icons/recording.png' });
  const lock = await checkYoutubeBlocking(tab);
  console.log("lock after blocking:" + lock);

  //console.log(is_youtube);
  //var callbacks = [];
  /*const lock = function (callback) {
    if (is_youtube != null) {
      callbacks.push(callback)
    } else {
      $.longRunning(function)
    }
  }
  while (is_youtube == null) {
    setTimeout(isBlocking(is_youtube), 10000)
 
  }*/


});

//This function is LOCKED until the lock is opened
const recordScreen = async (lock, tab) => {
  if (lock == null) {
    console.log("Lock is currently unavailable");
  }
  if (!lock) {
    console.log("screen recording should start!")
    const existingContexts = await chrome.runtime.getContexts({});
    let recording = false;

    const offscreenDocument = existingContexts.find(
      (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
    );


    // If an offscreen document is not already open, create one.
    if (!offscreenDocument) {
      // Create an offscreen document.
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA', "DISPLAY_MEDIA"],
        justification: 'Recording from chrome.tabCapture API'
      });
    } else {
      recording = offscreenDocument.documentUrl.endsWith('#recording');
    }

    if (recording) {
      chrome.runtime.sendMessage({
        type: 'stop-recording',
        target: 'offscreen'
      });
      chrome.action.setIcon({ path: 'icons/not-recording.png' });
      return;
    }

    // Get a MediaStream for the active tab.
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tab.id
    });

    // Send the stream ID to the offscreen document to start recording.
    chrome.runtime.sendMessage({
      type: 'start-recording',
      target: 'offscreen',
      data: streamId
    });
  } else {
    console.log("Lock is true (this should happen SOMETIMES)");
  }
  console.log("Screen Recording Execution is finished!");
}


async function checkYoutubeBlocking(tab) {
  var lock = null
  console.log("Pre-lock");
  lock = await chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
    var currentTab = tabs[0];
    console.log("half way there")
    console.log(tabs)
    if (processedVideoTabs.has(currentTab.url)) {
      console.log("Extension activation for YouTube already handled for this tab.");
      console.log("Will extract the processed video from memory!")
      chrome.tabs.create({ url: processedVideoTabs.get(currentTab.url) }, (newTab) => { });
      return null;
    }
    if (currentTab && isYouTubeUrl(currentTab.url)) {
      chrome.runtime.sendMessage({ action: "submitVideo", url: currentTab.url });
      console.log(currentTab);
      console.log("The url is a Youtube url and so no screen recording will occur");
      lock = true;
      submitVideo(currentTab.url);
    } else {
      lock = false;
    }
    console.log("About to continue execution, if necassary");
    console.log(lock);
    recordScreen(lock, tab);
    return lock;
  });


  console.log("Post-lock (does not indicate the lock was necassarily skipped) ");
  return lock;
}

function isBlocking(flag) {
  if (flag == null) {
    return true;
  } else {
    return false;
  }

}
function isYouTubeUrl(url) {
  var youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
}


const submitVideo = async (url) => {
  console.log("Submitting video for processing");
  console.log(url)
  // await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
  // const simulatedProcessedVideoUrl = "https://output-sharpr.s3.us-east-2.amazonaws.com/out/HKGr2GZlSd4_mux.mkv";
  // //replace with await
  // const data = simulatedProcessedVideoUrl;
  // chrome.tabs.create({ url: data }, (newTab) => {
  //   processedVideoTabs.set(url, data);
  // });
  // console.log("Simulated processing complete. Opening in new tab:", simulatedProcessedVideoUrl);
  // console.log("Finished Submitting video, youtubeHandle:");
  // console.log(isYouTubeActivationHandled);

  try {
    // Send the video URL to the server
    console.log(url)
    const response = await fetch('https://73a5-128-84-126-64.ngrok-free.app/process-video', { // ngrok new url change!! "https://412b-128-84-124-184.ngrok.io/process-video"
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: "cors",
      body: JSON.stringify({ video_url: url }), // send youtube url!! instead of request, put the youtube url.
    });

    // Throw an error if the response is not OK
    if (!response.ok) {
      console.log("EROROROR")
      throw new Error(`Error: ${response.statusText}`);
    }

    // Receive the processed video URL from the server
    const data = await response.json();

    // Log success and open a new tab with the processed video
    console.log('Success:', data);
    console.log(data.processed_video_url)
    // Open a new tab with the processed video and track it
    chrome.tabs.create({ url: data.processed_video_url }, (newTab) => {
      processedVideoTabs.add(newTab.id);
      isYouTubeActivationHandled = true; // Set the flag to prevent reactivation
      chrome.action.setIcon({ path: 'icons/not-recording.png' })
    });

    // Send a success response back to the sender
    sendResponse({ success: true, data: data });
  } catch (error) {
    sendResponse({ error: error.message });
    chrome.action.setIcon({ path: 'icons/not-recording.png' });
  }
  // Indicates that you wish to send a response asynchronously
}

// This code would be in a background script or a script in a persistent background page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openVideoStreamTab") {
    if (tabCreationCounter > 1) {
      console.log("Not creating a new tab because the counter is greater than 1.");
      return; // Prevent creating a new tab
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Video Stream</title>
        <script src="http://hlsbook.net/wp-content/examples/hls.min.js"></script>
        <meta http-equiv="Content-Security-Policy"
        content="default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;">    
      </head>
      <body>
        <video id="video" controls preload="auto" width="640" height="360">
          <source src="https://enhance.s3.us-east-2.amazonaws.com/ts_files/level_4.m3u8" type="application/x-mpegURL">
        </video>
        <script>
          if (Hls.isSupported()) {
            var video = document.getElementById('video');
            var hls = new Hls();
            hls.loadSource('https://enhance.s3.us-east-2.amazonaws.com/ts_files/level_4.m3u8');
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play();
            });
          }
        </script>
      </body>
      </html>
    `;
    // Encode HTML content to base64
    const base64Html = btoa(unescape(encodeURIComponent(htmlContent)));
    // Create data URL
    const dataUrl = `data:text/html;base64,${base64Html}`;

    if (videoStreamTabId !== null) {
      chrome.tabs.get(videoStreamTabId, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          // The tab does not exist, so create a new one and update videoStreamTabId
          chrome.tabs.create({ url: dataUrl }, (newTab) => {
            videoStreamTabId = newTab.id;
            tabCreationCounter++; // Increment the counter
          });
        } else {
          // The tab exists, update it with the new video stream
          chrome.tabs.update(videoStreamTabId, { url: dataUrl });
        }
      });
    } else {
      // No tab is open for the video stream, create a new one
      chrome.tabs.create({ url: dataUrl }, (newTab) => {
        videoStreamTabId = newTab.id;
        tabCreationCounter++; // Increment the counter
      });
    }
  }
});

// Listen for tab closures or navigation away from the processed video
// chrome.tabs.onRemoved.addListener((tabId) => {
//   if (processedVideoTabs.delete(tabId)) {
//     // Check if there are no more processed video tabs
//     if (processedVideoTabs.size === 0) {
//       isYouTubeActivationHandled = false;
//     }
//   }
// });

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (processedVideoTabs.has(tabId) && changeInfo.url && !changeInfo.url.includes("youtube.com")) {
//     processedVideoTabs.delete(tabId);
//     // Check if there are no more processed video tabs
//     if (processedVideoTabs.size === 0) {
//       isYouTubeActivationHandled = false;
//     }
//   }
// });