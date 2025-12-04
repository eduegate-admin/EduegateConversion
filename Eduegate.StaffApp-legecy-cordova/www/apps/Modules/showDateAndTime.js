angular.module('yourApp', [])
  .filter('showDateAndTime', function() {
    return function(date) {
      var today = new Date();
      var dateObj = new Date(date);

      if (dateObj.toDateString() === today.toDateString()) {
        return dateObj.toLocaleTimeString(); // Show only the time
      } else {
        return dateObj.toLocaleDateString(); // Show the date
      }
    };
  });