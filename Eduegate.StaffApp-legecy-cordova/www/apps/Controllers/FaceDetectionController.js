app.controller("FaceDetectionController", [
  "$scope",
  "$timeout",
  "studentDataService",
  "offlineStorageService",
  "GetContext",
  "rootUrl",
    "aiModelService",
  function (
    $scope,
    $timeout,
    studentDataService,
    offlineStorageService,
    GetContext,
    rootUrl,
    aiModelService 
  ) {
    // Centralized UI state management
    $scope.ui = {
      loading: true,
      message: "Initializing...",
      statusClass: "status-neutral",
      livenessMessage: "Liveness: Analyzing...",
      livenessClass: "unknown",
      matchFound: false,
    };
    $scope.ContentService = rootUrl.ContentServiceUrl;
    var context = GetContext.Context();

    // --- Element and Model Variables ---
    let video, stream, canvas, ctx;
    let faceMeshModel = null;
    let featureExtractor = null;
    let faceDatabase = [];
    $scope.recognitionInterval = null;

    // --- Liveness & State Variables ---
    const EAR_THRESHOLD = 0.29;
    const EAR_CONSECUTIVE_FRAMES = 2;
    const BLINKS_REQUIRED = 2;
    const BLINK_CHECK_WINDOW_MS = 5000;
    let earConsecutiveFramesCount = 0;
    let blinkCountInWindow = 0;
    let lastBlinkCheckTime = Date.now();
    let detectionState = "AWAITING_LIVENESS";
    let livenessGracePeriodTimer = null;
    let lastBestMatch = { name: "unknown", score: 0 }; // To display continuous feedback

    // --- AngularJS Scope Variables ---
    $scope.isLoading = false;
    $scope.syncMessage = "";
    $scope.foundStudent = null;
    let matchCandidate = null;
    let matchCandidateId = null; 
    let consecutiveMatchCount = 0;
    const CONSECUTIVE_FRAMES_NEEDED = 3; // Require 3 good frames in a row
    $scope.init = async function () {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        console.log(`✅ TF.js backend is set to '${tf.getBackend()}'`);

        $scope.ui.message = "Loading AI models...";

        // [faceMeshModel, featureExtractor] = await Promise.all([
        //   faceLandmarksDetection.load(
        //     faceLandmarksDetection.SupportedPackages.mediaPipeFacemesh,
        //     { maxFaces: 1 }
        //   ),
        //   mobilenet.load(),
        // ]);
        console.log("✅ All AI models loaded successfully.");
        const models = await aiModelService.getModels();
        faceMeshModel = models.faceMeshModel;
        featureExtractor = models.featureExtractor;
        
        console.log("✅ AI models received from service.");
        faceDatabase = await buildFaceDatabase(faceMeshModel, featureExtractor);

        $scope.ui.message = "Accessing camera...";
        video = document.getElementById("video");
        // *** NEW: Get canvas and context ***
        canvas = document.getElementById("overlayCanvas");
        ctx = canvas.getContext("2d");

        stream = await navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "user" } })
          .catch(() => navigator.mediaDevices.getUserMedia({ video: true }));

        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
          // *** NEW: Set canvas dimensions to match video ***
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          $scope.startCombinedDetectionLoop();
        };
      } catch (err) {
        console.error("Initialization failed: ", err);
        $timeout(() => {
          $scope.ui.loading = false;
          $scope.ui.message = `Error: ${err.message}`;
          $scope.ui.statusClass = "status-error";
        });
      }
    };

    function requestCameraPermissionAndStart() {
    if (window.cordova && cordova.plugins && cordova.plugins.permissions) {
      var permissions = cordova.plugins.permissions;

      permissions.checkPermission(permissions.CAMERA, function (status) {
        if (status.hasPermission) {
          console.log("✅ Camera permission already granted");
          $scope.init();
        } else {
          console.log("⚠️ Requesting camera permission...");
          permissions.requestPermission(permissions.CAMERA, function (status) {
            if (status.hasPermission) {
              console.log("✅ Camera permission granted after request");
              $scope.init();
            } else {
              console.error("❌ Camera permission denied by user");
              alert("Camera access is required for face detection to work.");
            }
          }, function (error) {
            console.error("❌ Permission request error:", error);
          });
        }
      }, function (error) {
        console.error("❌ Permission check error:", error);
      });
    } else {
      console.warn("Cordova permissions plugin not available. Assuming browser environment.");
      $scope.init();
    }
  }


    // *** NEW DRAWING FUNCTION ***
    function drawFaceFeedback(predictions, bestMatch) {
      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!predictions || predictions.length === 0) {
        return; // No face found, nothing to draw
      }

      const face = predictions[0];
      const topLeft = face.boundingBox.topLeft;
      const bottomRight = face.boundingBox.bottomRight;

      const xMin = topLeft[0];
      const yMin = topLeft[1];
      const xMax = bottomRight[0];
      const yMax = bottomRight[1];
      const boxColor = detectionState === "RECOGNIZING" ? "#00FF00" : "#FFA500"; // Green for recognizing, Orange otherwise
      const textColor = "#FFFFFF";

      // 1. Draw the bounding box (square)
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);

      // 2. Draw the face mesh points
      ctx.fillStyle = boxColor;
      for (const point of face.scaledMesh) {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 1, 0, 2 * Math.PI); // Draw a 1px radius dot
        ctx.fill();
      }

      // 3. Draw the recognition status text
      if (detectionState === "RECOGNIZING") {
        const text = `${bestMatch.name} (${(bestMatch.score * 100).toFixed(
          0
        )}%)`;
        ctx.font = "18px Arial";
        ctx.fillStyle = textColor;
        ctx.fillText(text, xMin, yMin > 20 ? yMin - 10 : yMax + 20); // Position text above or below box
      }
    }

    // --- MAIN DETECTION LOOP ---
    $scope.startCombinedDetectionLoop = function () {
      if (faceDatabase.length === 0 || !faceMeshModel || !featureExtractor) {
        $scope.ui.message = "Error: Models or database not ready.";
        return;
      }

      $timeout(() => {
        $scope.ui.loading = false;
        $scope.ui.message = "Ready. Please position your face and blink twice.";
        detectionState = "AWAITING_LIVENESS";
      });

      if ($scope.recognitionInterval) clearInterval($scope.recognitionInterval);

      $scope.recognitionInterval = setInterval(async () => {
        if (video.readyState < 3 || detectionState === "MATCH_FOUND") return;

        // NEW, CORRECTED CODE
        const predictions = await faceMeshModel.estimateFaces({
          input: video,
          flipHorizontal: false,
          returnBoundingBox: true, // <-- ADD THIS LINE
        });

        // *** NEW: Call drawing function on every frame ***
        drawFaceFeedback(predictions, lastBestMatch);

        if (predictions.length === 0) {
            $timeout(() => { // Use $timeout to ensure UI updates
              $scope.ui.message = "Please position your face in the camera view.";
            });
          return;
        }

        // --- State 1: Awaiting Liveness ---
        if (detectionState === "AWAITING_LIVENESS") {
          lastBestMatch = { name: "unknown", score: 0 };
          const keypoints = predictions[0].scaledMesh;
          const leftEye = [362, 385, 387, 263, 373, 380].map(
            (i) => keypoints[i]
          );
          const rightEye = [133, 158, 160, 33, 144, 153].map(
            (i) => keypoints[i]
          );
          const avgEAR = (calculateEAR(leftEye) + calculateEAR(rightEye)) / 2.0;
          if (avgEAR < EAR_THRESHOLD) {
            earConsecutiveFramesCount++;
          } else {
            if (earConsecutiveFramesCount >= EAR_CONSECUTIVE_FRAMES) {
              blinkCountInWindow++;
              if (blinkCountInWindow >= BLINKS_REQUIRED) {
                console.log("✅ Liveness Confirmed!");
                detectionState = "RECOGNIZING";
                $timeout(() => {
                  $scope.ui.livenessMessage = "Liveness: Real";
                  $scope.ui.livenessClass = "real";
                  $scope.ui.message = "Liveness OK. Recognizing face...";
                });
                livenessGracePeriodTimer = setTimeout(() => {
                  if (detectionState === "RECOGNIZING") {
                    detectionState = "AWAITING_LIVENESS";
                    blinkCountInWindow = 0;
                    $timeout(() => {
                      $scope.ui.message =
                        "Could not find a match. Please try again.";
                    });
                  }
                }, 10000);
              }
            }
            earConsecutiveFramesCount = 0;
          }
          if (Date.now() - lastBlinkCheckTime > BLINK_CHECK_WINDOW_MS) {
            blinkCountInWindow = 0;
            lastBlinkCheckTime = Date.now();
          }
          $timeout(() => {
            $scope.ui.livenessMessage = `Blinks: ${blinkCountInWindow}/${BLINKS_REQUIRED}`;
            $scope.ui.livenessClass = "unknown";
          });
        }

        // --- State 2: Recognizing Face ---
        if (detectionState === "RECOGNIZING") {
          let croppedFaceTensor = null,
            liveDescriptor = null;
          try {
            const face = predictions[0];
            croppedFaceTensor = await getCroppedFaceTensor(video, face);
            // const inputTensor = tf.browser.fromPixels(croppedFaceTensor).expandDims(0);

            liveDescriptor = featureExtractor.infer(croppedFaceTensor, {
              embedding: true,
            });

            // if (liveDescriptor) {
            //   let bestMatch = { name: "unknown", score: 0.85, id: null }; // Using your 0.7 threshold
            //   for (const entry of faceDatabase) {
            //     const score = cosineSimilarity(
            //       liveDescriptor,
            //       entry.descriptor
            //     );
            //     console.log(
            //       `Comparing with ${entry.name}. Score: ${score.toFixed(4)}`
            //     );
            //     if (score > bestMatch.score) {
            //       bestMatch = { name: entry.name, score: score, id: entry.id };
            //     }
            //   }
            //   lastBestMatch = bestMatch; // *** NEW: Update the display variable

            //   if (bestMatch.name !== "unknown") {
            //     $scope.handleMatchFound(bestMatch.id);
            //   }
            // }
            if (liveDescriptor) {
              let bestMatchInFrame = { name: "unknown", score: 0.85, id: null };
              for (const entry of faceDatabase) {
                const score = cosineSimilarity(
                  liveDescriptor,
                  entry.descriptor
                );
                // console.log(
                //   `Comparing with ${entry.name}. Score: ${score.toFixed(4)}`
                // );
                if (score > bestMatchInFrame.score) {
                  bestMatchInFrame = {
                    name: entry.name,
                    score: score,
                    id: entry.id,
                  };
                }
              }
              lastBestMatch = bestMatchInFrame;
              if (
                bestMatchInFrame.id !== null &&
                bestMatchInFrame.id === matchCandidateId
              ) {
                consecutiveMatchCount++;
                $timeout(() => {
                  $scope.ui.message = `Confirming ${bestMatchInFrame.name}... ${consecutiveMatchCount}/${CONSECUTIVE_FRAMES_NEEDED}`;
                });
              } else {
                matchCandidateId = bestMatchInFrame.id;
                consecutiveMatchCount = 1;
              }
              if (consecutiveMatchCount >= CONSECUTIVE_FRAMES_NEEDED) {
                $scope.handleMatchFound(matchCandidateId);
              }
            }
          } finally {
            if (croppedFaceTensor) croppedFaceTensor.dispose();
            if (liveDescriptor) liveDescriptor.dispose();
          }
        }
      }, 300);
    };

    // --- Controller Functions (handleMatchFound, cleanup, etc.) ---

    // (The rest of your functions: getCroppedFaceTensor, buildFaceDatabase, cosineSimilarity, etc. remain the same)

    // *** MODIFIED ***
    // $scope.handleMatchFound = function (studentId) {
    //   if (detectionState === "MATCH_FOUND") return;
    //   detectionState = "MATCH_FOUND";

    //   clearTimeout(livenessGracePeriodTimer);
    //   clearInterval($scope.recognitionInterval);
    //   $scope.recognitionInterval = null;

    //   // Clear the canvas on final match
    //   if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    //   offlineStorageService.getStudentById(studentId).then(function (student) {
    //     if (student) {
    //       $timeout(() => {
    //         $scope.ui.matchFound = true;
    //         $scope.ui.message = `✅ Match Confirmed! Welcome, ${student.StudentName}.`;
    //         $scope.ui.statusClass = "status-success";
    //         $scope.foundStudent = student;
    //       });
    //     } else {
    //       // This is a failsafe in case something went wrong
    //       $timeout(() => {
    //         $scope.ui.message = `Error: Match found, but could not retrieve student profile for ID ${studentId}.`;
    //         $scope.ui.statusClass = "status-error";
    //       });
    //     }
    //   });
    // };
// In your FaceDetectionController.js

$scope.handleMatchFound = function (studentId) {
    if (detectionState === "MATCH_FOUND") return;
    detectionState = "MATCH_FOUND";

    clearTimeout(livenessGracePeriodTimer);
    clearInterval($scope.recognitionInterval);
    $scope.recognitionInterval = null;

    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    offlineStorageService.getStudentById(studentId).then(function (student) {
        if (student) {
            console.log("Match found, handing off to parent controller:", student);
            
            // --- THIS IS THE KEY CHANGE ---
            // Call the handler function on the parent's scope.
            // AngularJS's scope inheritance makes this possible.
            if (typeof $scope.$parent.handleFaceRecognitionResult === 'function') {
                $scope.$parent.handleFaceRecognitionResult(student);
            } else {
                console.error("Parent handler function 'handleFaceRecognitionResult' not found!");
                // Optionally show an error to the user
                $timeout(() => {
                  $scope.ui.message = `Error: Could not communicate with the main screen.`;
                  $scope.ui.statusClass = "status-error";
                });
            }
            
        } else {
            $timeout(() => {
                $scope.ui.message = `Error: Match found, but could not retrieve student profile for ID ${studentId}.`;
                $scope.ui.statusClass = "status-error";
            });
        }
    });
};
    // *** MODIFIED ***
    $scope.$on("$destroy", function () {
      if ($scope.recognitionInterval) clearInterval($scope.recognitionInterval);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      // Clear the canvas on controller destruction
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      console.log("FaceDetectionController destroyed. Cleaned up resources.");
    });

    // ... (Your other functions like syncStudentData, calculateEAR, etc. are unchanged)

    // --- HELPER FUNCTIONS FOR MATH ---
    function cosineSimilarity(tensorA, dataB) {
      let tensorB = null;
      try {
        tensorB = tf.tensor(dataB);
        // const a = tensorA.flatten();
        // const b = tensorB.flatten();
        //   const a = tf.flatten(tensorA);
        // const b = tf.flatten(tensorB);
        const a = tf.reshape(tensorA, [-1]);
        const b = tf.reshape(tensorB, [-1]);
        // const dotProduct = a.dot(b).dataSync()[0];
        const dotProduct = tf.dot(a, b).dataSync()[0];
        // const aNorm = a.norm().dataSync()[0];
        // const bNorm = b.norm().dataSync()[0];
        const aNorm = tf.norm(a).dataSync()[0];
        const bNorm = tf.norm(b).dataSync()[0];
        a.dispose();
        b.dispose();
        return dotProduct / (aNorm * bNorm);
      } finally {
        if (tensorB) {
          tensorB.dispose();
        }
      }
    }
    // async function buildFaceDatabase(faceDetector, mobileNet) {
    //   $scope.ui.message = "Loading student profiles...";
    //   const students = await offlineStorageService.getAllStudents();
    //   if (!students || students.length === 0)
    //     throw new Error("No student data in storage. Please sync.");
    //   const database = [];
    //   $scope.ui.message = `Processing ${students.length} student profiles...`;
    //   for (const student of students) {
    //     try {
    //       const imageUrl = `${$scope.ContentService}/ReadImageContentsByID?contentID=${student.StudentProfile}`;
    //       const response = await fetch(imageUrl, {
    //         method: "GET",
    //         headers: {
    //           Accept: "application/json;charset=UTF-8",
    //           "Content-type": "application/json; charset=utf-8",
    //           CallContext: JSON.stringify(context),
    //         },
    //       });
    //       if (!response.ok) {
    //         throw new Error(
    //           `Server returned an error: ${response.status} ${response.statusText}`
    //         );
    //       }
    //       const imageBlob = await response.blob();
    //       const dataUrl = await new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.onloadend = () => resolve(reader.result);
    //         reader.onerror = reject;
    //         reader.readAsDataURL(imageBlob);
    //       });
    //       const img = new Image();
    //       img.src = dataUrl;
    //       await new Promise((resolve, reject) => {
    //         img.onload = resolve;
    //         img.onerror = () =>
    //           reject(
    //             new Error(
    //               `Could not load image data for ${student.StudentName}`
    //             )
    //           );
    //       });
    //       const faces = await faceDetector.estimateFaces({
    //         input: img,
    //         returnBoundingBox: true,
    //       });
    //       if (faces.length > 0) {
    //         const faceTensor = await getCroppedFaceTensor(img, faces[0]);
    //         if (!faceTensor) {
    //           console.warn(
    //             `Skipping ${student.StudentName} due to cropping failure.`
    //           );
    //           continue; 
    //         }
    //         const descriptorTensor = mobileNet.infer(faceTensor, {
    //           embedding: true,
    //         });
    //         const descriptorData = await descriptorTensor.data();
    //         faceTensor.dispose();
    //         descriptorTensor.dispose();
    //         database.push({
    //           name: student.StudentName,
    //           id: student.StudentIID, 
    //           descriptor: Array.from(descriptorData),
    //         });
    //       } else {
    //         console.warn(`Could not find a face for ${student.StudentName}`);
    //       }
    //     } catch (e) {
    //       console.error(
    //         `Failed to process image for ${student.StudentName}:`,
    //         e
    //       );
    //     }
    //   }

    //   if (database.length === 0) {
    //     throw new Error("Could not create any face profiles from images.");
    //   }

    //   const totalStudents = students.length;
    //   const successfulProfiles = database.length;
    //   if (successfulProfiles < totalStudents) {
    //     console.warn(
    //       `Warning: Successfully created ${successfulProfiles} of ${totalStudents} face profiles. ${
    //         totalStudents - successfulProfiles
    //       } profiles failed to load.`
    //     );
    //   }

    //   console.log(`✅ Face Database created with ${database.length} entries.`);
    //   return database;
    // }




    // Replace your existing getCroppedFaceTensor with this one
   
   // In FaceDetectionController.js

async function buildFaceDatabase(faceDetector, mobileNet) {
    $scope.ui.message = "Loading face profiles...";

    // --- NEW LOGIC: Try to load from the database first ---
    let cachedDatabase = await offlineStorageService.loadFaceDatabase();
    
    // We will assume for now we want to rebuild if the cache is empty.
    // In a real app, you would add a "Force Sync" button for the user.
    if (cachedDatabase && cachedDatabase.length > 0) {
        console.log(`✅ Loaded ${cachedDatabase.length} face profiles from local storage.`);
        $scope.ui.message = "Face profiles loaded.";
        return cachedDatabase; // Return the cached data and we are done!
    }

    // --- If cache is empty, proceed with the original processing ---
    console.log("No cached face data found. Building database from images...");
    $scope.ui.message = "Processing student photos for the first time...";

    const students = await offlineStorageService.getAllStudents();
    if (!students || students.length === 0) {
        throw new Error("No student data in storage. Please sync first.");
    }
    
    const newDatabase = [];
    $scope.ui.message = `Processing ${students.length} student profiles...`;

    // The image processing loop is the same as before
    for (const student of students) {
        try {
            const imageUrl = `${$scope.ContentService}/ReadImageContentsByID?contentID=${student.StudentProfile}`;
            const response = await fetch(imageUrl, { /* headers */ });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            
            const imageBlob = await response.blob();
            const dataUrl = await new Promise((res, rej) => {
                const reader = new FileReader();
                reader.onloadend = () => res(reader.result);
                reader.onerror = rej;
                reader.readAsDataURL(imageBlob);
            });
            const img = new Image();
            img.src = dataUrl;
            await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

            const faces = await faceDetector.estimateFaces({ input: img, returnBoundingBox: true });

            if (faces.length > 0) {
                const faceTensor = await getCroppedFaceTensor(img, faces[0]);
                if (!faceTensor) continue;

                const descriptorTensor = mobileNet.infer(faceTensor, { embedding: true });
                const descriptorData = await descriptorTensor.data();
                faceTensor.dispose();
                descriptorTensor.dispose();
                
                newDatabase.push({
                    name: student.StudentName,
                    id: student.StudentIID,
                    descriptor: Array.from(descriptorData),
                });
            } else {
                console.warn(`Could not find a face for ${student.StudentName}`);
            }
        } catch (e) {
            console.error(`Failed to process image for ${student.StudentName}:`, e);
        }
    }

    if (newDatabase.length === 0) {
        throw new Error("Could not create any face profiles from images.");
    }
    
    // --- NEW LOGIC: Save the newly created database for next time! ---
    await offlineStorageService.saveFaceDatabase(newDatabase);
    
    console.log(`✅ Face Database created and cached with ${newDatabase.length} entries.`);
    return newDatabase;
}
   
    async function getCroppedFaceTensor(imageSource, face, desiredSize = 224) {
      // --- ROBUSTNESS CHECK ---
      // If the face object is invalid or is missing the box, abort.
      if (!face || !face.boundingBox) {
        console.error(
          "getCroppedFaceTensor was called with invalid face data (no box property)."
        );
        return null; // Return null to indicate failure
      }
      // --- END OF CHECK ---

      // Extract coordinates from the topLeft and bottomRight arrays
      // const padding = 20;

      const xMin = face.boundingBox.topLeft[0]; // <-- CHANGED
      const yMin = face.boundingBox.topLeft[1]; // <-- CHANGED
      const xMax = face.boundingBox.bottomRight[0]; // <-- CHANGED
      const yMax = face.boundingBox.bottomRight[1]; // <-- CHANGED

      const padding = (xMax - xMin) * 0.1; // 10% padding

      // Calculate coordinates with padding
      const x = xMin - padding;
      const y = yMin - padding;
      const width = xMax - xMin + 2 * padding;
      const height = yMax - yMin + 2 * padding;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(imageSource, x, y, width, height, 0, 0, width, height);

      //       let tensor = tf.browser.fromPixels(canvas);
      //       let resizedTensor = tf.image.resizeBilinear(tensor, [
      //         desiredSize,
      //         desiredSize,
      //       ]);
      //  let castedTensor = tf.cast(resizedTensor, 'float32');
      // let subtractedTensor = tf.sub(castedTensor, 127.5); // Use static tf.sub
      // let normalizedTensor = tf.div(subtractedTensor, 127.5); // Use static tf.div
      // let batchedTensor = tf.expandDims(normalizedTensor, 0); // tf.expandDims is already static

      //       tensor.dispose();
      //       resizedTensor.dispose();
      //       normalizedTensor.dispose();

      //       return batchedTensor;

      // Use tf.tidy to automatically clean up intermediate tensors
      return tf.tidy(() => {
        const tensor = tf.browser.fromPixels(canvas);

        // Resize the image
        const resizedTensor = tf.image.resizeBilinear(tensor, [
          desiredSize,
          desiredSize,
        ]);

        // Cast to float32, but DO NOT normalize. .infer() will do that.
        const castedTensor = tf.cast(resizedTensor, "float32");

        // The .infer() method handles adding the batch dimension, so we return a 3D tensor.
        return castedTensor;
      });
    }

    function distance(p1, p2) {
      const dx = p1[0] - p2[0];
      const dy = p1[1] - p2[1];
      return Math.sqrt(dx * dx + dy * dy);
    }
    function calculateEAR(eyeLandmarks) {
      const p1 = eyeLandmarks[0];
      const p2 = eyeLandmarks[1];
      const p3 = eyeLandmarks[2];
      const p4 = eyeLandmarks[3];
      const p5 = eyeLandmarks[4];
      const p6 = eyeLandmarks[5];
      const verticalDist1 = distance(p2, p6);
      const verticalDist2 = distance(p3, p5);
      const horizontalDist = distance(p1, p4);
      const ear = (verticalDist1 + verticalDist2) / (2.0 * horizontalDist);
      return ear;
    }
    // ... syncStudentData function ...
    $scope.syncStudentData = function () {
      $scope.isLoading = true;
      $scope.syncMessage = "Syncing student data from server...";
      $scope.foundStudent = null;
      var employeeLoginID = 123;
      var context = GetContext.Context();
      studentDataService
        .getStudentIdentifiers(employeeLoginID)
        .success(function (studentList) {
          if (studentList && studentList.length > 0) {
            $scope.syncMessage =
              "Saving " + studentList.length + " students to phone storage...";
            offlineStorageService
              .saveStudents(studentList)
              .then(function (successMsg) {
                $scope.syncMessage = successMsg + " Sync complete.";
                $scope.isLoading = false;
              })
              .catch(function (errorMsg) {
                $scope.syncMessage = "Error: " + errorMsg;
                $scope.isLoading = false;
              });
          } else {
            $scope.syncMessage = "No students found for this route.";
            $scope.isLoading = false;
          }
        })
        .error(function (error) {
          $scope.syncMessage = "Failed to fetch data from server.";
          console.error("API Error:", error);
          $scope.isLoading = false;
        });
    };
    // *** NEW FUNCTION FOR YOUR BUTTON ***
    $scope.resetDetection = function () {
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      $timeout(() => {
        $scope.ui.matchFound = false;
        $scope.ui.statusClass = "status-neutral";
        $scope.ui.livenessClass = "unknown";
        $scope.foundStudent = null;

        // Reset state variables
        blinkCountInWindow = 0;
        lastBestMatch = { name: "unknown", score: 0 };

        // Restart the detection loop
        $scope.startCombinedDetectionLoop();
      });
    };

    $scope.init();

    document.addEventListener('deviceready', function () {
      requestCameraPermissionAndStart();
    }, false);

  },
]);
