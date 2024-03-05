# _SharprAI_, Real-Time Video Enhancement Extension

## Introduction

Welcome to this repository! _SharprAI_ is a performance-critical chrome extension focussed on using generative AI to enhance low-quality or pixelated video in the user's browser in real time. Our long-term goal is to revolutionize streaming by eliminating the need for anyone to stream low-quality video using our service.

## Technical Overview 

_SharprAI_ has two components: a serverside component, which you can find in the directory `src/backend`, and a clientside component, which you can find in the directory `src/extension`. Our solution architecture works by having the user download the extension, and having the option to upscale their current tab by clicking on the extension icon, after which point they should full screen their video, and navigate into a new tab the extension will open that plays an upscaled version of their previous tab. The way this works on the serverside backend is that the extension starts recording the user's current tab as soon as it is activated in 10-second clips, stores those clips as they are generated in an AWS s3 bucket, sends the clip's s3 object urls to the server, which runs them through the best available [opensource pretrained upscaling software](https://github.com/styler00dollar/VSGAN-tensorrt-docker) using the code in `src/backend/app.py`, saves the output clips to another s3 bucket that are sent back to be played using the HTTP Live Streaming (HLS) protocol in the m3u8 format. 
