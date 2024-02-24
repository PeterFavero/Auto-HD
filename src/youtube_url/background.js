chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("TESTING")
  if (request.action === "submitVideo") {
    (async () => {
      try {
        // Send the video URL to the server
        console.log(request.url)
        const response = await fetch('https://f060-128-84-126-64.ngrok-free.app/process-video', { // ngrok new url change!! "https://412b-128-84-124-184.ngrok.io/process-video"
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: "cors",
          body: JSON.stringify({ video_url: request.url }), // send youtube url!! instead of request.url, put the youtube url.
        });

        // Throw an error if the response is not OK
        if (!response.ok) {
          console.log("EROROROR")
          throw new Error(`Error: ${response.statusText}`);
        }

        // Receive the processed video URL from the server
        const data = await response.json();

        // Log success and open a new tab with the processed video
        console.log("-----------------------")
        console.log('Success:', data);
        console.log(data.processed_video_url)
        chrome.tabs.create({ url: data.processed_video_url }); // recieve s3 object url!!

        // Send a success response back to the sender
        sendResponse({ success: true, data: data });
      } catch (error) {
        sendResponse({ error: error.message });
      }
    })();
    // Indicates that you wish to send a response asynchronously
    return true;
  }
});
