// In a new file or your main services.js file

app.factory('aiModelService', function($q) {
    let faceMeshModel = null;
    let featureExtractor = null;
    let isLoading = false;
    let loadingPromise = null;

    // This is the main public function of the service
    function getModels() {
        // If the models are already loaded, return them immediately.
        if (faceMeshModel && featureExtractor) {
            console.log("🤖 AI models already loaded. Returning cached instances.");
            // $q.when() wraps a value in a promise, so the return type is always a promise.
            return $q.when({ faceMeshModel, featureExtractor });
        }

        // If models are currently being loaded, return the existing promise.
        // This prevents multiple calls from trying to load the models simultaneously.
        if (isLoading) {
            console.log("🤖 AI models are currently loading. Returning existing promise.");
            return loadingPromise;
        }

        // If models are not loaded and not currently loading, start the loading process.
        console.log("🤖 AI models not loaded. Starting the loading process...");
        isLoading = true;

        loadingPromise = $q(async (resolve, reject) => {
            try {
                // Use Promise.all to load both models in parallel for speed.
                const models = await Promise.all([
                    faceLandmarksDetection.load(
                        faceLandmarksDetection.SupportedPackages.mediaPipeFacemesh,
                        { maxFaces: 1 }
                    ),
                    mobilenet.load()
                ]);

                // Store the loaded models in our service variables.
                faceMeshModel = models[0];
                featureExtractor = models[1];
                
                isLoading = false;
                console.log("✅ All AI models loaded successfully and are now cached.");
                
                // Resolve the promise with the loaded models.
                resolve({ faceMeshModel, featureExtractor });

            } catch (err) {
                isLoading = false;
                console.error("❌ Failed to load AI models:", err);
                reject(err); // Reject the promise if loading fails.
            }
        });

        return loadingPromise;
    }

    // Return the public interface of the service.
    return {
        getModels: getModels
    };
});