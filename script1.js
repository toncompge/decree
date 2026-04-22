// Wait for the DOM to be fully loaded before initializing the app
document.addEventListener('DOMContentLoaded', () => {
  // Get references to the buttons and preview area
  const captureBtn = document.getElementById('captureBtn');      // Button: Capture full screen
  const capturePageBtn = document.getElementById('capturePageBtn'); // Button: Capture full web page
  const previewArea = document.getElementById('previewArea');    // Container for the captured image

  // === 1. Capture Full Screen (using Screen Capture API) ===
  captureBtn.addEventListener('click', async () => {
    try {
      // Show a prompt to the user to select a screen source (entire screen, window, tab)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',           // Capture screen, window, or tab
          width: { ideal: 1920 },         // Ideal width (1080p)
          height: { ideal: 1080 }         // Ideal height
        },
        audio: false                        // Optional: include audio
      });

      // Create a video element to preview the selected screen
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Show a loading message while user selects the source
      previewArea.innerHTML = '<p>Select your screen source...</p>';
      previewArea.appendChild(video);

      // Wait 3 seconds to allow user to choose the source (e.g., from a dropdown)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Stop the stream (release camera/microphone resources)
      stream.getTracks().forEach(track => track.stop());

      // Create a canvas to draw the current video frame
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0); // Draw video frame to canvas

      // Convert canvas to PNG image data URL
      const imgData = canvas.toDataURL('image/png');

      // Create an image element to display the screenshot
      const img = document.createElement('img');
      img.src = imgData;
      img.alt = 'Captured screen from desktop';

      // Clear preview area and add the image
      previewArea.innerHTML = '';
      previewArea.appendChild(img);

      // Add a download button for the user
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Download Screenshot';
      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = imgData;
        a.download = `screenshot-${new Date().toISOString().slice(0, 10)}.png`;
        a.click();
      };

      previewArea.appendChild(downloadBtn);

      // Notify the user that the capture was successful
      alert('✅ Screen capture completed successfully!');

    } catch (err) {
      // Handle errors (e.g., user denied permission, no screen sources)
      console.error('Error during screen capture:', err);
      alert('❌ Error: ' + err.message);
    }
  });

  // === 2. Capture Full Web Page (using html2canvas) ===
  capturePageBtn.addEventListener('click', async () => {
    try {
      // Show loading message
      previewArea.innerHTML = '<p>Creating full page screenshot...</p>';

      // Use html2canvas to capture the entire document body
      // Options:
      // - scale: 2 → higher resolution (retina-ready)
      // - useCORS: true → load images from different domains
      // - backgroundColor: white → ensure clean background
      const canvas = await html2canvas(document.body, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff'
      });

      // Convert canvas to PNG data URL
      const imgData = canvas.toDataURL('image/png');

      // Create image element
      const img = document.createElement('img');
      img.src = imgData;
      img.alt = 'Full web page screenshot';

      // Update preview area
      previewArea.innerHTML = '';
      previewArea.appendChild(img);

      // Add download button
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Download Page Screenshot';
      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = imgData;
        a.download = `page-screenshot-${new Date().toISOString().slice(0, 10)}.png`;
        a.click();
      };

      previewArea.appendChild(downloadBtn);

      // Notify user
      alert('✅ Full page screenshot created!');

    } catch (err) {
      // Handle errors in html2canvas (e.g., large images, missing fonts)
      console.error('Error during full page capture:', err);
      alert('❌ Error: ' + err.message);
    }
  });
});
