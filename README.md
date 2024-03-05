# _SharprAI_, Real-Time Video Enhancement Extension

## Introduction

Welcome to this repository! _SharprAI_ is a performance-critical chrome extension focussed on using generative AI to enhance low-quality or pixelated video in the user's browser in real time. Our mission is to transform the streaming experience by making it possible for everyone to enjoy high-quality video without the need for high-bandwidth streaming.

In this README, you'll find a technical overview of how _SharprAI_ works, straightforward setup instructions to get you started with video upscaling on your machine, and an comprehensive technical deep-dive of our software's capabilities and implementation.

## Technical Overview 

SharprAI operates through a client-server model:
* Client-side: The Chrome extension (`src/extension`) allows users to enhance videos directly within their browser.
* Server-side: The serverside backend (`src/backend`) uses the latest opensource video upscaling technology to improve video quality.

### Workflow
+ Users install the SharprAI extension in their Chrome browser.
+ To upscale a video, users click on the SharprAI extension icon while watching a video.
3. The extension begins capturing the current tab's video in 10-second segments.
4. These segments are uploaded to an AWS S3 bucket.
5. The S3 object URLs are sent to the server and queued for sequential processing.
which uses VSGAN-tensorrt-docker for real-time upscaling (see src/backend/app.py for implementation details).
6. The upscaled video segments are saved to a different S3 bucket and streamed back to the user's browser using the HLS protocol in m3u8 format.

_SharprAI_ has two components: a serverside component, which you can find in the directory `src/backend`, and a clientside component, which you can find in the directory `src/extension` (coming soon – need to get Joshua to upload it). Our solution architecture works by having the user download the extension, and having the option to upscale their current tab by clicking on the extension icon, after which point they should full screen their video, and navigate into a new tab the extension will open that plays an upscaled version of their previous tab. The way this works on the serverside backend is that the extension starts recording the user's current tab as soon as it is activated in 10-second clips, stores those clips as they are generated in an AWS s3 bucket, sends the clip's s3 object urls to the server, which runs them through the best available [opensource pretrained real-time upscaling software](https://github.com/styler00dollar/VSGAN-tensorrt-docker) using the code in `src/backend/app.py`, saves the output clips to another s3 bucket that are sent back to be played using the industry-standard HTTP Live Streaming (HLS) protocol in the m3u8 format. 
