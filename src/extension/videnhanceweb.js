// GSAP and ScrollTrigger code (remains unchanged)
import gsap from "https://cdn.skypack.dev/gsap@3.12.2";
import { ScrollTrigger } from "https://cdn.skypack.dev/gsap@3.12.2/ScrollTrigger";

if (!CSS.supports("animation-timeline: scroll()")) {
  gsap.registerPlugin(ScrollTrigger);
  const HEADER = document.querySelector("header");
  gsap.to(".search-controls", {
    width: HEADER.offsetWidth - 66,
    scrollTrigger: {
      scrub: 0.25,
      ease: "none",
      start: 0,
      end: HEADER.offsetHeight
    }
  });
  gsap.to(".logo svg", {
    yPercent: -25,
    opacity: 0,
    scrollTrigger: {
      scrub: 0.25,
      ease: "none",
      start: 0,
      end: HEADER.offsetHeight * 0.8
    }
  });
  gsap.to(".search-wrapper", {
    boxShadow: "0 5px 10px hsl(0 0% 0%)",
    scrollTrigger: {
      scrub: 0.25,
      ease: "none",
      start: HEADER.offsetHeight,
      end: HEADER.offsetHeight * 1.5
    }
  });
  gsap.to(".search-wrapper", {
    background: "var(--bg)",
    scrollTrigger: {
      scrub: 0.25,
      ease: "none",
      start: HEADER.offsetHeight,
      end: HEADER.offsetHeight * 1.5
    }
  });
  gsap.to(".sneaky-bear", {
    transform:
      "rotate(90deg) translateX(calc(var(--header-height) * 0.125)) translateY(50%)",
    scrollTrigger: {
      scrub: 0.25,
      ease: "none",
      start: HEADER.offsetHeight * 1.5,
      end: HEADER.offsetHeight * 2
    }
  });
}

// Loader and YouTube Video integration
// document
//   .getElementById("youtubeLinkInput")
//   .addEventListener("keypress", function (e) {
//     if (e.key === "Enter") {
//       handleSearchInput();
//     }
//   });

// document
//   .getElementById("searchButton")
//   .addEventListener("click", handleSearchInput);

function handleSearchInput() {
  const url = document.getElementById("youtubeLinkInput").value.trim();
  const video = document.getElementById("youtubeVideo");
  const loader = document.querySelector(".loader");

  if (url) {
    const videoId = extractYoutubeId(url);
    if (videoId) {
      showLoaderAndLoadVideo(videoId);
    }
  } else {
    // Hide loader and video if the input is empty
    loader.style.display = "none";
    video.style.display = "none";
    video.src = ""; // Remove the src from the iframe
  }
}

function extractYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function showLoaderAndLoadVideo(videoId) {
  const loader = document.querySelector(".loader");
  const video = document.getElementById("youtubeVideo");

  // Show loader and hide video
  loader.style.display = "block";
  video.style.display = "none";

  // Set timeout for loader, then load video
  setTimeout(() => {
    loader.style.display = "none";
    video.style.display = "block";
    video.src = "https://www.youtube.com/embed/" + videoId;
  }, 5000); // Loader timeout (5 seconds)
}
