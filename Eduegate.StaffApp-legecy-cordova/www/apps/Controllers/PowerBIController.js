app.controller("PowerBIController", [
  "$scope",
  "$http",
  "$state",
  "rootUrl",
  "$location",
  "$rootScope",
  "$stateParams",
  "GetContext",
  "$sce",
  "$timeout",
  "$window",
  function (
    $scope,
    $http,
    $state,
    rootUrl,
    $location,
    $rootScope,
    $stateParams,
    GetContext,
    $sce,
    $timeout,
    $window
  ) {
    console.log("PowerBIController loaded.");
    $scope.PageName = "PowerBIController";

    var PowerBIService = rootUrl.PowerBIServiceUrl;

    var models = window["powerbi-client"].models;
    $scope.init = function () {
      var reportContainer = $("#report-container-").get(0);
      $(function () {
        $http({
          method: "GET",
          url: PowerBIService + "/GetEmbedInfoAsync",
          params: { pageID: $scope.pageID },
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
        })
          .then(function (response) {
            var embedParams = response.data;

            var reportLoadConfig = {
              type: "report",
              tokenType: models.TokenType.Embed,
              accessToken: embedParams.EmbedToken.token,
              embedUrl: embedParams.EmbedReport[0].EmbedUrl,
              settings: {
                panes: {
                  filters: { visible: false },
                  pageNavigation: { visible: false },
                },
                layoutType: getLayoutType(),
                background: models.BackgroundType.Transparent,
              },
            };

            // Token expiry time
            tokenExpiry = embedParams.EmbedToken.Expiration;

            // Embed the report
            var report = powerbi.embed(reportContainer, reportLoadConfig);

            // Layout switching on window resize
            $window.addEventListener("resize", function () {
              var layoutType = getLayoutType();
              report.updateSettings({ layoutType: layoutType });
              console.log("Switched to layoutType:", layoutType);
            });

            function getLayoutType() {
              return $window.innerWidth <= 768
                ? models.LayoutType.MobilePortrait
                : models.LayoutType.Custom;
            }

            // Event handlers
            report.off("loaded");
            report.on("loaded", function () {
              console.log("Report load successful");
            });

            report.off("rendered");
            report.on("rendered", function () {
              console.log("Report render successful");
            });

            report.off("error");
            report.on("error", function (event) {
              var errorMsg = event.detail;
              console.error(errorMsg);
              // You can trigger a UI message here if needed
            });
          })
          .catch(function (err) {
            // Handle error UI
            var errorContainer = angular.element(
              document.querySelector(".error-container")
            );
            var embedContainer = angular.element(
              document.querySelector(".embed-container")
            );

            embedContainer.css("display", "none");
            errorContainer.css("display", "block");

            var errMessageHtml =
              "<strong>Error Details:</strong><br/>" +
              (err.data || err.statusText || "Unknown error");
            errMessageHtml = errMessageHtml.split("\n").join("<br/>");

            errorContainer.append(errMessageHtml);
          });
      });
    };
    $scope.init();
  },
]);
