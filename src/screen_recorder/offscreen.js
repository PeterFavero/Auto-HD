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

chrome.runtime.onMessage.addListener(async (message) => {
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
        downloadRecording(event.data);
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
}

function downloadRecording(blobData) {
  const blob = new Blob([blobData], { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `recording-${Date.now()}.webm`; // You can name the recording as you like
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);  
  }, 100);
}
