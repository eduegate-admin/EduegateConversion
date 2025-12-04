app.directive('cachedSrc', function() {
  return {
    restrict: 'A', // Use as an attribute
    link: function(scope, element, attrs) {

      // Wait for the deviceready event to ensure plugins are loaded
      document.addEventListener('deviceready', onDeviceReady, false);

      function onDeviceReady() {
        // Get the remote URL from the attribute
        var remoteUrl = attrs.cachedSrc;
        var fallbackSrc = attrs.onErrorSrc; // Get the fallback image

        // If the URL is empty or invalid, use the fallback immediately
        if (!remoteUrl) {
            element.attr('src', fallbackSrc);
            return;
        }

        // Create a safe, unique filename from the remote URL
        // We replace special characters to create a valid filename.
        // A more robust solution might use an MD5 hash of the URL.
        var filename = remoteUrl.replace(/[\:/\?=&]/g, "_") + ".jpg";
        
        // This is the app's persistent private storage directory
        var localDirectory = cordova.file.dataDirectory;
        var localFileUrl = localDirectory + filename;

        // 1. CHECK IF THE FILE ALREADY EXISTS LOCALLY
        window.resolveLocalFileSystemURL(localFileUrl, 
          // --- SUCCESS: File exists (Cache Hit) ---
          function(fileEntry) {
            // Use the local file's native URL to display it
            console.log("CACHE HIT: Loading from " + fileEntry.nativeURL);
            element.attr('src', fileEntry.nativeURL);
          },
          // --- ERROR: File does not exist (Cache Miss) ---
          function() {
            console.log("CACHE MISS: Downloading " + remoteUrl);
            
            // 2. DOWNLOAD THE FILE
            // Note: cordova-plugin-file-transfer is deprecated. We use a modern approach.
            fetch(remoteUrl)
              .then(function(response) {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.blob();
              })
              .then(function(blob) {
                // Now we write the downloaded blob to the local file system
                window.resolveLocalFileSystemURL(localDirectory, 
                  function(dirEntry) {
                    dirEntry.getFile(filename, { create: true, exclusive: false }, 
                      function(fileEntry) {
                        // 3. SAVE THE FILE
                        fileEntry.createWriter(function(fileWriter) {
                          fileWriter.onwriteend = function() {
                            console.log("SUCCESS: Saved to " + fileEntry.nativeURL);
                            // Display the newly saved image
                            element.attr('src', fileEntry.nativeURL);
                          };
                          fileWriter.onerror = function(e) {
                            console.error('Failed file write: ' + e.toString());
                            element.attr('src', fallbackSrc);
                          };
                          fileWriter.write(blob);
                        });
                      }, 
                      function(err){ console.error("Could not get file", err); element.attr('src', fallbackSrc); });
                  }, 
                  function(err){ console.error("Could not resolve directory", err); element.attr('src', fallbackSrc); });
              })
              .catch(function(error) {
                console.error('Download failed:', error);
                // If download fails, use the fallback image
                element.attr('src', fallbackSrc);
              });
          }
        );
      }
    }
  };
});