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

/* chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target === 'offscreen') {
    switch (message.type) {
      case 'start-recording':
        await startRecording(message.data);
        break;
      case 'stop-recording':
        stopRecording();
        break;
      default:
        throw new Error(`Unrecognized message: ${message.type}`);
    }
  }
});

let recorder;
let mediaStream; // Defined outside to be accessible by both startRecording and stopRecording
let isRecording = false; // Track recording status

async function startRecording(streamId) {
  if (isRecording) {
    throw new Error('Recording is already in progress.');
  }

  isRecording = true; // Set recording status

  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    },
    video: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    }
  });

  const output = new AudioContext();
  const source = output.createMediaStreamSource(mediaStream);
  source.connect(output.destination);

  // Recursive function to start recording each segment
  const startSegment = () => {
    if (!isRecording) return; // Do not start if recording has been stopped

    recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        const blob = new Blob([event.data], { type: 'video/webm' });
        window.open(URL.createObjectURL(blob), '_blank');
      }
      // Call startSegment again to start a new recording after the previous one ended
      startSegment();
    };
    recorder.start();

    // Automatically stop recording after 10 seconds
    setTimeout(() => {
      if (recorder && recorder.state === 'recording') {
        recorder.stop();
      }
    }, 10000);
  };

  // Start the first segment
  startSegment();

  window.location.hash = 'recording';
}

function stopRecording() {
  isRecording = false; // Set recording status to indicate that we should not start a new segment

  if (recorder && recorder.state === 'recording') {
    recorder.stop();
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null; // Clear the mediaStream after stopping
  }

  window.location.hash = '';
} */

let isLastClip = null;

chrome.runtime.onMessage.addListener(async (message) => {
  console.log("help 1");
  if (message.target === 'offscreen') {
    switch (message.type) {
      case 'start-recording':
        await startRecording(message.data);
        break;
      case 'stop-recording':
        stopRecording();
        break;
      default:
        throw new Error(`Unrecognized message: ${message.type}`);
    }
  }
});

let clipNumber;
let recorder;
let mediaStream; // Defined outside to be accessible by both startRecording and stopRecording
let isRecording = false; // Track recording status

async function startRecording(streamId) {
  console.log("help 2");

  if (isRecording) {
    throw new Error('Recording is already in progress.');
  }

  clipNumber = 0;

  isRecording = true; // Set recording status

  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    },
    video: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
        maxWidth: 1280,
        maxHeight: 720
      }
    }
  });

  const output = new AudioContext();
  const source = output.createMediaStreamSource(mediaStream);
  source.connect(output.destination);

  // Recursive function to start recording each segment
  const startSegment = () => {
    console.log("help 3");

    if (!isRecording) return; // Do not start if recording has been stopped

    recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log("sent video to server rn");
        sendRecordingToServer(event.data);
      }
      // Call startSegment again to start a new recording after the previous one ended
      startSegment();
    };
    recorder.start();

    // Automatically stop recording after 10 seconds
    setTimeout(() => {
      if (recorder && recorder.state === 'recording') {
        recorder.stop();
      }
    }, 5000);
  };

  // Start the first segment
  startSegment();

  window.location.hash = 'recording';
}

function stopRecording() {
  console.log("help 4");

  isRecording = false; // Set recording status to indicate that we should not start a new segment\
  isLastClip = true; // The recording process is stopping, so the next clip is the last

  if (recorder && recorder.state === 'recording') {
    recorder.stop();
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null; // Clear the mediaStream after stopping
  }

  window.location.hash = '';
}

function sendRecordingToServer(blobData) {
  console.log("Sending recording to server");

  let fileName;
  if (!isLastClip) {
    // Standard naming for all but the last clip
    fileName = `videoname_${++clipNumber}.webm`;
    console.log(fileName);
  } else {
    // Special naming for the last clip, using negative of the second to last clip number
    fileName = `videoname_${-(++clipNumber)}.webm`;
    console.log(fileName);
  }

  const formData = new FormData();

  formData.append("file", blobData, fileName);

  fetch('https://73a5-128-84-126-64.ngrok-free.app/upload-video', {
    method: 'POST',
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      console.log("File uploaded successfully", data);
      chrome.runtime.sendMessage({ type: "videoLink", link: data.processed_video_url });
      console.log("File sent successfully", data);
      chrome.runtime.sendMessage({ action: "openVideoStreamTab" });
      console.log("File played successfully", data);
    })
    .catch(error => console.error("Error uploading file:", error));


  // const blob = new Blob([blobData], { type: 'video/webm' });
  // const url = URL.createObjectURL(blob);
  // const a = document.createElement('a');
  // a.style.display = 'none';
  // a.href = url;
  // // a.download = `recording-${Date.now()}.webm`; // You can name the recording as you like
  // document.body.appendChild(a);
  // a.click();
  // setTimeout(() => {
  //   document.body.removeChild(a);
  //   window.URL.revokeObjectURL(url);
  // }, 100);
}
