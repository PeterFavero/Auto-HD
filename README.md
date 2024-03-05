# _SharprAI_, Real-Time Video Enhancement Extension


## Introduction

Welcome to this repository! _SharprAI_ is a performance-critical chrome extension focussed on using generative AI to enhance low-quality or pixelated video in the user's browser in real time. Our mission is to transform the streaming experience by making it possible for everyone to enjoy high-quality video without the need for high-bandwidth streaming.

In this README, you'll find a technical overview of how _SharprAI_ works, straightforward setup instructions to get you started with video upscaling on your machine, and an comprehensive technical deep-dive of our software's capabilities and implementation.


## Technical Overview 

### Architecture:
SharprAI operates through a client-server model:
* Client-side: The Chrome extension (`src/extension`) allows users to enhance videos directly within their browser.
* Server-side: The serverside backend (`src/backend`) uses the latest opensource video upscaling technology to improve video quality.

### Workflow: 
#### Clientside:
1. Users install the SharprAI extension in their Chrome browser.
2. To upscale a video, users click on the SharprAI extension icon while watching a video.
3. The extension begins capturing the current tab's video in 10-second segments (refered to as "input clips").
4. These input clips are uploaded to an AWS S3 bucket.
5. The S3 object URLs of the input clips are sent to the server.
#### Serverside:
7. The S3 object URLS of the input clips queued for sequential processing.
8. The server upscales the input clips through [VSGAN-tensorrt-docker](https://github.com/styler00dollar/VSGAN-tensorrt-docker) to produce upscaled video (referred to as"output clips").
9. The output clips are uploaded to a different AWS 3s bucket.
#### Clientside:
10. The ouput clips are live-streamed back to the user's browser using the HLS protocol in m3u8 format.
