app.controller('SearchController', ['$scope', '$http', 'loggedIn', 'rootUrl', 
    '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', '$q',
    function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope,
        $q) {
  var dataService = rootUrl.RootUrl;
  var Context = GetContext.Context();

  function highlight(str, term) {
      var finalStr = str;
      var vSplit = term.split(" ");
      for (var i = 0; i <= vSplit.length - 1; i++) {
          var tempStr = finalStr;
          //console.log("old  " + tempStr);
          tempStr = tempStr.replace(new RegExp('<span(.*?)>(.*?)<\/span>', 'gi'), '');
          //console.log("new   " + tempStr);
          var newRegex = new RegExp('(.*)? ((.*)?(' + vSplit[i] + ')(.*)?)', 'gi');

          var tempStr1 = tempStr.replace(newRegex, '$2');
          //console.log("tempstr1   " + tempStr1);
          var highlight_regex = new RegExp('(' + vSplit[i] + ')', 'gi');
          var newTempStr = tempStr1.replace(highlight_regex, '<span class="highlight">$1</span>');
          //console.log("newTempStr   " + newTempStr);
          finalStr = finalStr.replace(tempStr1, tempStr1.replace(tempStr1, newTempStr));
          //console.log("finalStr   " + finalStr);
      }
      //var highlight_regex = new RegExp('(' + term + ')', 'gi');
      return finalStr;
  };
  function suggest_keywords(term) {
      if (term.length <= 2) {
          return;
      }

      //results = deferred.promise;
      var matching_names = [];
      var deferred = $q.defer();

      $http({
          url: dataService + '/GetSkienKeywordsDictionary?searchtext=' + encodeURIComponent(term) + "&lng=en",
          method: 'GET',
          headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
          timeout: deferred.promise
      }).then(function (results) {
          //$scope.ProductList = result.Catalogs;
          deferred.resolve(results);
          //$rootScope.ShowLoader = false;
      }, function (err) { deferred.reject(err); });

      matching_names = deferred.promise;

    return $q.when(matching_names).then(
      (data, status, headers, config) => {
        const results = [];
        const fullresults = { TotalCount: 0, results: [], facets: [] };
        if(!data) return;
        if (data.TotalProductsCount != undefined && data.TotalProductsCount != null 
            && data.TotalProductsCount != '' && data.TotalProductsCount > 0) {
          fullresults.TotalCount = data.TotalProductsCount;
        }

        for (var i = 0; i < data.Catalogs.length; i++) {
          const item = data.Catalogs[i];
          item.label = $sce.trustAsHtml(highlight(item.ProductName, term));
          fullresults.results.push(item);         
        }

        for (var i = 0; i < data.FacetsDetails.length; i++) {
          var facetitem = data.FacetsDetails[i];
          facetitem.label = $sce.trustAsHtml(facetitem.FacetFullName);
          facetitem.term = term;
          // $scope.Facets.push(facetitem);
          // results.push({ label: buildProductCodeHTML(item, term, i, data.data.model.FacetItems), value: item.ProductName.replace(/<(?:.|\n)*?>/gm, '') });
          $.each(facetitem.FaceItems, (index, value) => {
            facetitem.FaceItems[index].label = $sce.trustAsHtml(value.key);
          });
          fullresults.facets.push(facetitem);
          // results.Facets.push(facetitem);
        }
        if (term.length <= 2) {

          }
          // this callback will be called asynchronously
          // when the response is available
      },
      function error(data, status, headers, config) {
          return data;
      });


  }
  $scope.autocomplete_options = {
      isDone: 0,
      suggest: suggest_keywords,
      //on_select: function (selected) {
      //    $rootScope.searchText = selected.value;
      //    $rootScope.SearchProducts();
      //}
      on_select: function (selected, type, isSubCategory, categoryIID) {

          if (type == 1) {//product details
              $rootScope.searchText = "";
              $state.go('productdetails', { skuID: selected }, { reload: true });
          }
          else if (type == 2) { //category
              $rootScope.searchText = "";
              if (isSubCategory) {
                  $state.go('productlists', { searchText: '', filterBy: 'category', filterValue: 'cat:' + selected, filterText: '', sortText: 'relevance', pageType: 'Search', searchTitle: '' }, { reload: true })
              }
              else {
                  $state.go('categoryhome', { categoryID: categoryIID, categoryCode: selected }, { reload: true });
              }
          }
          else if (type == 3) {//brand
              $rootScope.searchText = "";
              $state.go('productlists', { searchText: '', filterBy: 'brand', filterValue: 'brandcode:' + selected, filterText: '', sortText: 'relevance', pageType: 'Search', searchTitle: '' }, { reload: true })

          }
          else if (type == 4) { //all product search
              $rootScope.SearchProducts();
          }
          //$scope.LoadUrl(selected);

          //$rootScope.SearchText = selected.value;
          //$scope.ProductClick();
      }
  };
  $scope.SkipValidation = function (value) {
      if (value) {
          var values = jQuery.parseHTML(value);
          var finalText = '';
          for (var i = 0; i <= values.length - 1; i++) {
              finalText = finalText.concat($(values[i]).text());
          }
          return $sce.trustAsHtml(finalText);
      }
  };

}]);