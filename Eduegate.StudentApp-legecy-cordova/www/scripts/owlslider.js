app.directive('owlslider', function ($timeout) {
  return function (scope, element, attrs) {
      scope.$watch("hasBanner", function (value) {//I change here
          var val = value || null;
          if (val) {
              $timeout(function () {
                  //alert($("#owl-demo"));
                  $("#owl-demo").owlCarousel({
                      items: 1,
                      autoplay: true,
                      autoplayTimeout: 5000,
                      slideSpeed: 2000,
                      nav: false,
                      loop: true,
                      lazyLoad: true
                  });
                  //$("#owl-demo").trigger('play.owl.autoplay', [10]);
              }, 0);
          }
      });
  };
});