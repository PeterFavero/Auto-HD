# _SharprAI_, Real-Time Video Enhancement Extension

## Introduction

Welcome to this repository! _SharprAI_ is a performance-critical chrome extension focussed on using generative AI to enhance low-quality or pixelated video in the user's browser in real time. 
Engineered a dockerized environment of an open-source [REAL ESRGAN model ↗](https://github.com/the-database/mpv-upscale-2x_animejanai) interfaced with a FlaskAPI on an AWS EC2 p2.xlarge instance, ensuring cost-effective scalability for GPU-intensive tasks through NVIDIA’s TensorRT SDK, leading to video enhancement in 2x time.

## Technical Overview 

### Architecture:

SharprAI operates through a client-server model:
* **Client-side:** The Chrome extension (`src/extension`) allows users to enhance videos directly within their browser.
* **Server-side:** The serverside backend (`src/backend`) uses the latest opensource video upscaling technology to improve video quality.

### Workflow: 
#### Clientside:
1. Users install the SharprAI extension in their Chrome browser.
2. To upscale a video, users click on the SharprAI extension icon while watching a video.
3. The extension begins capturing the current tab's video in 10-second segments ("input clips").
4. Input clips are uploaded to an AWS S3 bucket.
5. The S3 object URLs of the input clips are sent to the server.
#### Serverside:
7. The S3 object URLS of the input clips queued for sequential processing.
8. The server upscales the input clips through [VSGAN-tensorrt-docker](https://github.com/styler00dollar/VSGAN-tensorrt-docker) to produce upscaled clips ("output clips").
9. Output clips are turned into M3U8s to replicate professional-world HLS streaming
10. M3U8 are uploaded or updated on the AWS side

#### Clientside:
11. Output clips are live-streamed back to the user's browser using the HLS protocol in m3u8 format.
<br> a) Client already has s3 object url to the M3U8 so once the first clip is finished enhancing, new clips will automatically be added without client needing to reload the page

## Setup and Usage Instructions
Client-side:
1. Navigate to src folder
2. Download zip file of Extension
3. Unzip extension folder
4. Go to chrome://extensions, click developer mode
5. Click the load unpacked button and choose the unzipped Extension folder
6. Click on the icon whenever you want to enhance
  <br> a) Youtube videos will automatically be enhanced and played on a new tab
  <br> b) On other websites, after clicking the icon, full screen the tab for optimal viewing experience
     <br> After intial 10 second delay, the video will play continously on the same new tab until you stop enhancing


## Self-deploy steps

> **_NOTE:_**  To self-deploy, your machine needs to have an NVIDIA GPU running.

### Setting up server

Follow the self-deploy steps below on the instance to have the server up and working.

### Steps

1. `git clone https://github.com/nairvishnumail/Sharp-ai-ly.git`
2. Dockerize input and output directories `docker run -v "<project_path>/Sharpr-ai-ly/src/backend/ai/input:/input" -v "<project_path>/Sharpr-ai-ly/src/backend/ai/out:/out" -it `
3. `docker-compose run --rm vsgan_tensorrt`
4. `python app.py`
5. Get ngrok URL and paste link into extension code

You now have the server running on at [localhost:8080](http://localhost:8080)

Send a POST request with video_url in the body to `http://localhost:8080/process-video` to get back a S3 object URL for the processed video

For tunnelling a localhost environment, I used [ngrok](https://ngrok.com/download) that helped me hit the endpoint from different PCs

Server is ready to accept client videos!

## Overview
### Problem:
There are two sides to technological progress: a brighter, progressive future where new technology becomes further integrated into our lives and the thousands of old devices that fall into disuse to welcome the new change. As we approach another technological frontier with the advancement of AI, it is often easy to look at the bright future ahead, but it is far more important to see what and more importantly, who we leave behind. Low-quality videos and pictures often fall to the wayside despite the significant amount of childhood memories they hold. We aim to bring back these memories through our software. However, even more importantly, the advancement of technology can leave people behind. Limits on the availability of good graphics can worsen education, restrict communication, and widen disparities for people of lower socioeconomic status. We aim to bridge these disparities by bringing video enhancement to all.
### _Inspiration:_
Our journey to creating this suite of video enhancement tools stemmed from a critical realization: video content is not one-size-fits-all. By recognizing the diverse needs of audiences including live streamers, individuals who are colorblind, the elderly, and film preservationists, in addition to the general population, we set out to dismantle the barriers to digital content accessibility. We aim to harness the latest advancements in AI to elevate video quality and ensure that everyone, regardless of their age, socioeconomic status, or disability, can fully engage with and appreciate the richness of digital media.
### _What it does:_
SharprAI utilizes open-source video enhancement technology, we have developed a straightforward web interface that significantly simplifies the process of improving video quality. This platform represents a leap forward in our mission to make high-quality video content accessible to everyone.
Centralized Video Enhancement Hub: Our platform provides a seamless experience for users looking to enhance their video content. By uploading a YouTube video URL or an MP4 file directly to our website, users can witness the transformation of their videos in real time. The interface thoughtfully displays the enhanced video alongside the original, enabling immediate comparison and showcasing the dramatic improvements our technology delivers.
### _How it works:_
Our infrastructure is built around a powerful pipeline hosted on AWS Cloud, which serves as the foundation for our vision enhancement model. This setup enables our web interface to interact seamlessly with our backend. Here, videos are spliced and sent to the server, where they undergo real-time enhancement. Once processed, the enhanced video is promptly returned to the interface, ready to be displayed.
The Bread and Butter: Our core technology revolves around the Real-ESRGAN model, an AI-driven approach specifically designed for enhancing animated visuals. This model is adept at analyzing low-resolution footage and predicting a high-quality output by filling in missing details, reducing noise, and sharpening lines without compromising the animated original style. Trained on a comprehensive dataset of animated content, it ensures that each frame is not just clearer but also in line with the intent of the original creation.
### What's next?:
### _Dim Scene Enhancement:_ 
A challenge our currently implemented model faces is that with darker scenes, it ranks poorly in video enhancement because the model finds it difficult to find the contrast lines of buildings, faces, etc, and can’t accurately differentiate and enhance different artifacts in the frame. This algorithm will isolate these darker scenes, temporarily increase their brightness for more effective enhancement, and then restore the original brightness level before presenting the final, enhanced video to the user. This method aims to improve the model's ability to enhance details in low-light conditions, ensuring better video quality regardless of scene brightness.
Adding Color Grading for Colorblindness: We're taking our baseline video enhancement tech one step further by introducing color grading features. This means videos will not only look sharper but will also be more accessible for those with color blindness. It's all about making sure everyone gets the best viewing experience possible to us.
### _Content-Type Enhancement:_ 
Understanding the distinct characteristics of animated versus live-action footage, we're introducing a user-friendly feature that allows for the selection between enhancement modes tailored to each type. This approach enhances the viewing experience by applying model adjustments that are most appropriate for the content's nature.
### _Our Market:_
Our suite of tools is aimed at a broad user base, from individuals looking for a better viewing experience to live streamers and film restorationists seeking to enhance their video quality. Due to the accessibility and affordability of our product, we bring an attractive alternative to a new market of people that has been blocked off by paywalls and hardware limitations.We envision our largest market opportunity in licensing collaborations with leading live content creation platforms, scaling our reach and impact post-beta testing with companies such as Twitch, Tiktok, & Youtube Gaming. For an exploration of additional applications, including the transformative use of our real-time vision enhancement technology in various settings, please scroll down to the Proof of Concept section.
Differences from our Competitors:
The biggest advantage we have over our competitors is accessibility. We unlock the technology for the public - developers and non-developers alike. Our software program is downloadable by anyone with access to a computer and is completely free. In comparison, people choosing to opt-into services like RTX or Topaz Labs are locked behind a paywall that can scale as high as $300 per tool and hardware components such as a graphics card or large amounts of RAM to be used. Making our product more inclusive and available to a broader audience, enabling individuals from various economic backgrounds to access and utilize it.

