// In your services.js or app.js
app.factory('offlineStorageService', function($q, $window) {
  var db;
  var DB_NAME = 'SchoolTransportDB';
  var DB_VERSION = 1; // Increment this if you change the store structure
  var STORE_NAME = 'students';
  var FACE_DATA_STORE_NAME = 'face_descriptors';

  // Function to initialize the database
function initDb() {
  var deferred = $q.defer();
  if (db) {
    return $q.when(db);
  }

  try {
    var request = $window.indexedDB.open(DB_NAME, DB_VERSION);
  } catch (ex) {
    console.error("IndexedDB open failed:", ex);
    deferred.reject("IndexedDB open failed: " + ex.message);
    return deferred.promise;
  }

  request.onerror = function(event) {
    console.error("Database error event:", event);
    deferred.reject("Database error: " + (event.target.error ? event.target.error.message : "Unknown error"));
  };

  request.onsuccess = function(event) {
    db = event.target.result;
    deferred.resolve(db);
  };

  request.onupgradeneeded = function(event) {
    // var store = event.target.result.createObjectStore(STORE_NAME, { keyPath: 'StudentIID' });
    // store.createIndex('admissionNumber', 'AdmissionNumber', { unique: false });
    //    store.createIndex('studentName', 'StudentName', { unique: false });
    var database = event.target.result;
            // Create the students store
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                var studentStore = database.createObjectStore(STORE_NAME, { keyPath: 'StudentIID' });
                studentStore.createIndex('studentName', 'StudentName', { unique: false });
            }
            // --- NEW: Create the face descriptors store ---
            if (!database.objectStoreNames.contains(FACE_DATA_STORE_NAME)) {
                // We don't need a keyPath, we will use a static key 'faceDatabase'
                database.createObjectStore(FACE_DATA_STORE_NAME);
            }
  };

  return deferred.promise;
}


  // --- Public Methods for your Controller ---
  return {
    /**
     * Deletes all existing students and saves the new list.
     * This is a simple and robust sync strategy.
     * @param {Array} students - The array of student objects from the API.
     */
    saveStudents: function(students) {
      var deferred = $q.defer();
      initDb().then(function(db) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);

        // 1. Clear all old data
        store.clear();

        // 2. Add all new data
        students.forEach(function(student) {
          store.put(student);
        });

        tx.oncomplete = function() {
          deferred.resolve("Students saved successfully.");
        };
        tx.onerror = function(event) {
          console.error("Save students transaction error:", event.target.error);
          deferred.reject("Failed to save students.");
        };
      });
      return deferred.promise;
    },
getAllStudents: function() {
    var deferred = $q.defer();
    initDb().then(function(db) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var store = tx.objectStore(STORE_NAME);
        var request = store.getAll(); // This gets all records from the store

        request.onsuccess = function() {
            deferred.resolve(request.result); // Returns an array of all student objects
        };
        request.onerror = function(event) {
            console.error("Get all students error:", event.target.error);
            deferred.reject("Failed to get all students.");
        };
    });
    return deferred.promise;
},
    /**
     * Retrieves a single student by their ID from local storage.
     * @param {number} studentId - The StudentIID to find.
     */
    getStudentById: function(studentId) {
      var deferred = $q.defer();
      initDb().then(function(db) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var store = tx.objectStore(STORE_NAME);
        var request = store.get(studentId);

        request.onsuccess = function() {
          deferred.resolve(request.result); // Returns the student object or undefined if not found
        };
        request.onerror = function(event) {
          console.error("Get student by ID error:", event.target.error);
          deferred.reject("Failed to get student.");
        };
      });
      return deferred.promise;
    },
    // --- NEW FUNCTION: Save the processed face database ---
        saveFaceDatabase: function(faceData) {
            var deferred = $q.defer();
            initDb().then(function(db) {
                var tx = db.transaction(FACE_DATA_STORE_NAME, 'readwrite');
                var store = tx.objectStore(FACE_DATA_STORE_NAME);
                // We save the entire array under a single, static key
                store.put(faceData, 'faceDatabase'); 
                
                tx.oncomplete = function() {
                    console.log("✅ Face database saved to IndexedDB.");
                    deferred.resolve();
                };
                tx.onerror = function(event) {
                    console.error("Save face database error:", event.target.error);
                    deferred.reject("Failed to save face database.");
                };
            });
            return deferred.promise;
        },

        // --- NEW FUNCTION: Load the processed face database ---
        loadFaceDatabase: function() {
            var deferred = $q.defer();
            initDb().then(function(db) {
                var tx = db.transaction(FACE_DATA_STORE_NAME, 'readonly');
                var store = tx.objectStore(FACE_DATA_STORE_NAME);
                var request = store.get('faceDatabase');

                request.onsuccess = function() {
                    // request.result will be the array we saved, or undefined if it doesn't exist
                    deferred.resolve(request.result || []); 
                };
                request.onerror = function(event) {
                    console.error("Load face database error:", event.target.error);
                    deferred.reject("Failed to load face database.");
                };
            });
            return deferred.promise;
        }
  };
});