app.directive('owlsliderdisableautoplay', function ($timeout) {
  return function (scope, element, attrs) {
      scope.$watch("hasBanner", function (value) {//I change here
          var val = value || null;
          if (val) {
              $timeout(function () {
                  //alert($("#owl-demo"));
                  $("#owl-demo").owlCarousel({
                      items: 1,
                      autoplay: true,
                      nav: false,
                      loop: false,
                      lazyLoad: true
                  });
                  //$("#owl-demo").trigger('owl.play', 2000);
              }, 0);
          }
      });
  };
});