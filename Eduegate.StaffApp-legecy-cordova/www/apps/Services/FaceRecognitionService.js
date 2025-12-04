app.service('FaceRecognitionService', function ($http, $q) {

    const debugMessages = [];
  
    function debug(message) {
      console.log(message);
      debugMessages.push(message);
      if (debugMessages.length > 10) {
        debugMessages.shift(); // Keep last 10
      }
      const logDiv = document.getElementById('debugLog');
      if (logDiv) logDiv.innerHTML = debugMessages.join('<br>');
    }
  
    async function getLabeledFaceDescriptors() {
      debug("Loading reference faces...");
      try {
        const response = await $http.get('/api/person-folders');
        const folders = response.data;
  
        const descriptors = await Promise.all(folders.map(async (label) => {
          try {
            const img = await faceapi.fetchImage(`./labels/${label}/${label}.jpg`);
            const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();
  
            if (!detection) {
              debug(`No face detected for ${label}`);
              return null;
            }
  
            debug(`✓ Face loaded for ${label}`);
            return new faceapi.LabeledFaceDescriptors(label, [detection.descriptor]);
          } catch (err) {
            debug(`Error loading ${label}: ${err.message}`);
            return null;
          }
        }));
  
        return descriptors.filter(d => d !== null);
      } catch (error) {
        debug("Failed to fetch folders: " + error.message);
        return [];
      }
    }
  
    async function compareFace(videoElement) {
      const detection = await faceapi.detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
  
      if (!detection) {
        return { success: false, message: "❌ No face detected" };
      }
  
      const labeledDescriptors = await getLabeledFaceDescriptors();
      if (labeledDescriptors.length === 0) {
        return { success: false, message: "⚠️ No reference faces loaded" };
      }
  
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      const result = faceMatcher.findBestMatch(detection.descriptor);
      debug(`Match result: ${result.toString()}`);
  
      return { success: true, match: result };
    }
  
    return {
      debug,
      getLabeledFaceDescriptors,
      compareFace
    };
  });
  