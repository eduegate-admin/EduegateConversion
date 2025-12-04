app.controller('ProductCategoryController', ['$scope', '$http', 'loggedIn', 'rootUrl', 
'$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', '$q', 'serviceCartCount','serviceAddToCart','$translate','$timeout',
function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope,
    $q, serviceCartCount,serviceAddToCart,$translate,$timeout) {
    //console.log('All Product lists loaded.');
    //var dataService = "http://23.99.125.157:9096/MobileAppWrapper/AppDataService.svc";
    var dataService = rootUrl.RootUrl;
    $rootScope.CurrentPageName = 'ProductCategoryList';

    $scope.ShoppingCartCount = 0;
    $scope.ProductListList = [];
    $scope.ProductListCategory = [];
    $scope.ProductListBrand = [];
    $scope.ProductListSkuTags = [];
    $scope.attachWayPoints = true;//By default we have to attach the waypoints and load the data
    $scope.isLazyLoadData = true; // By default we are showimg lazyload data;
    $scope.lazyLoadPageNumber = 0;
    $scope.IsFacetLoad = true;
    $scope.ProductListViewModel = [];
    $scope.Math = window.Math;
    var Context = GetContext.Context();
    $scope.SaveForLaterCount = 0;
    $scope.SortText = "";
    $scope.searchTitle = $stateParams.searchTitle;
    $scope.ShowFilter = $stateParams.showfilter;
    $scope.CategorySearchText = "";
    $scope.SelectedSortValue = "";
    $scope.filterVal = "";
    $scope.filterBy = "";
    $scope.filterCategoryVal = "";
    $scope.filterCategoryBy = "";
    $scope.FilterText = "";
    $scope.pageType = $stateParams.pageType;
    $scope.NoProducts = false;
    $scope.Stop = false;
    $scope.selectedFilters = [];
    $scope.isCategory = false;
    $scope.showRelevance = true;
    $scope.scrollPoint = 0;
    $scope.refresher = null;
    $scope.FilterCaption = null;
    $rootScope.CartItemQuantity = [];
    $scope.IsLoadAll = true;
    KTScrolltop.createInstances();
    var scrollTopElement = document.querySelector("#scrolltop_control");
    var scrollTop = KTScrolltop.getInstance(scrollTopElement);
    var colorCode = ["#843e6c", "#9a4fd4", "#28373b", "#a62f1b", "#9a4fd4", "#187d0b", "#d1ad30", "#21c73b", "#d11b62"];

    $scope.init = function () {
        $rootScope.GetCartQuantity();
        
        var loggedInPromise = loggedIn.CheckLogin(Context, dataService);

        loggedInPromise.then(function (model) {
            if (model.data) {
                if (model.data.LoginID) {
                    //Loggedin User
                    $scope.LoggedIn = true;
                    var SaveForLaterCountPromise = serviceCartCount.getSaveForLaterCount(Context, dataService);
                    SaveForLaterCountPromise.then(function (result) {
                        $scope.SaveForLaterCount = result.data;
                    });
                }
            }
        }, function () { });

        //$timeout(function () {
        $scope.CategorySearchText = $stateParams.searchText;
        $scope.SelectedSortValue = $stateParams.sortText;
        $scope.filterVal = $stateParams.filterValue;
        $scope.filterBy = $stateParams.filterBy;
        $scope.FilterText = $stateParams.filterText;
        $scope.FilterCaption = $stateParams.caption;
        $scope.SelectedCategory = $stateParams.category;

        if (!($stateParams.isCategory == undefined || $stateParams.isCategory == '' || $stateParams.isCategory == null || $stateParams.isCategory == 'false')) {
            $scope.isCategory = true;
            $scope.showRelevance = false;
        }

        if ($scope.searchTitle != undefined && $scope.searchTitle != '' && $scope.searchTitle != null) {
            $scope.searchTitle = decodeURI($scope.searchTitle);
        }
        if ($scope.CategorySearchText != undefined && $scope.CategorySearchText != '' && $scope.CategorySearchText != null) {
            $scope.CategorySearchText = decodeURI($scope.CategorySearchText);
        }
        //});
        $scope.pageSize = 12;
        $scope.InitializeWayPoint();
        $scope.GetShoppingCartCount();
        if (!$scope.isCategory) {
            $scope.GetSortValue();
        }
        $scope.BrandCheckRequired = false;
        $scope.CategoryCheckRequired = false;
        if ($scope.filterBy != undefined && $scope.filterBy != '' && $scope.filterVal != undefined && $scope.filterVal != '') {
            if ($scope.filterBy == 'brand' || $scope.filterBy == "catbrand" || $scope.filterBy == "catbrandsku") {
                $scope.BrandCheckRequired = true;
            }
            if ($scope.filterBy == 'category' || $scope.filterBy == "catbrand" || $scope.filterBy == "catbrandsku") {
                $scope.CategoryCheckRequired = true;
            }

        }
        if ($scope.ShowFilter === "true") {
            $scope.OpenFilter();

        }

    };

    $scope.AddToCart = function(productDetail, selectedQuantity) {
        $rootScope.AddtoCart(productDetail,selectedQuantity).then(function()
        {
            $scope.GetShoppingCartCount()
        });
    }

    $scope.GetShoppingCartCount = function () {
        var cartPromise = serviceCartCount.getProductCount(Context, rootUrl.RootUrl);
        cartPromise.then(function (result) {
            $scope.ShoppingCartCount = result;
        }, function () {

        });
    }

    $scope.OptionClick = function () {
        $('.rightnav-cont').toggle();
    }

    function SetDefaultFilters(filterVal, isCategory) {
        if (filterVal != undefined && filterVal != null && filterVal != '') {
            $.each(filterVal.split("||"), function (index, item) {
                var vFirstSplit = item.split(":");
                $.each(vFirstSplit[1].split(","), function (index, itemValues) {
                    $.each($scope.ProductListViewModel.FacetsDetails, function (index, itemFacet) {
                        var backgroundColorIndex = 0;

                        $.each(itemFacet.FaceItems, function (index, itemFacetItems) {
                            setFilter(itemFacetItems, backgroundColorIndex, itemValues, itemFacet);
                            $.each(itemFacetItems.FaceItems, function (index, itemFacetItems2) {
                                setFilter(itemFacetItems2, backgroundColorIndex, itemValues, itemFacet);
                            });
                        });
                    });
                });
            });
            $timeout(function () {
                $scope.scrolltoViewCategory();
            }, 0);
        }
    }

    function setFilter(itemFacetItems, backgroundColorIndex, itemValues, itemFacet) {
        if (itemValues == itemFacetItems.code && itemValues != '' && itemValues != null && itemValues != undefined) {
            //console.log(itemFacet);
            itemFacetItems.Selected = true;
            if (itemFacet.Name != "skutags") {
                if ($scope.FilterText == "" || $scope.FilterText == undefined || $scope.FilterText == null) {
                    $scope.FilterText = itemFacetItems.key;
                }
                else {
                    $scope.FilterText = $scope.FilterText + "," + itemFacetItems.key;
                }
            }
        }

        itemFacetItems.InitialsText = null;

        if (!itemFacetItems.ItemImage || itemFacetItems.ItemImage === "images/noimage.png") {
            var matches = itemFacetItems.key.split(' ') || [];
            itemFacetItems.InitialsText = ((matches[0] && matches[0][0] || '') + (matches.length > 1 && matches[matches.length - 1] && matches[matches.length - 1][0] || '')).toUpperCase();
            itemFacetItems.backgroundColor = colorCode[backgroundColorIndex];
            backgroundColorIndex = (backgroundColorIndex === colorCode.length - 1) ? 0 : backgroundColorIndex + 1;
        }

        if ($scope.SelectedCategory == itemFacetItems.code) {
            itemFacetItems.Selected = true;
        }

        if (itemFacetItems.Selected && $scope.selectedFilters.find(x => x.code == itemFacetItems.code) == null) {
            $scope.selectedFilters.push(itemFacetItems);
        }
    }

var canceler;

$scope.GetProducts = function(attachwaypoints) {
    if ($scope.lazyLoadPageNumber === 1) {
        $scope.FilterText = "";
        $scope.selectedFilters = [];
    }

    // Cancel previous request if any
    if (canceler) {
        canceler.resolve();
    }
    canceler = $q.defer();

    $scope.attachWayPoints = false;

    $http({
        method: 'GET',
        url: dataService + '/OnlineStoreGetProductSearch',
        params: {
            pageIndex: $scope.lazyLoadPageNumber,
            pageSize: $scope.pageSize,
            searchText: $scope.CategorySearchText,
            searchVal: $scope.filterVal,
            searchBy: $scope.filterBy,
            sortBy: $scope.SelectedSortValue,
            isCategory: $scope.isCategory,
            pageType: $scope.pageType
        },
        headers: {
            Accept: 'application/json;charset=UTF-8',
            'Content-type': 'application/json; charset=utf-8',
            CallContext: JSON.stringify(Context)
        },
        timeout: canceler.promise
    }).then(function(response) {
        var result = response.data;

        if (result.WarningMessage && result.PageIndex === 1) {
            $timeout(function() {
                $rootScope.showModalWindow(
                    "notification",
                    "Alert!",
                    result.WarningMessage,
                    "Okay",
                    null,
                    function() {},
                    null
                );
            }, 500);
        }

        if (result.DisplayMessage && result.PageIndex === 1) {
            $timeout(function() {
                $(".licartClick").notify(result.DisplayMessage, {
                    position: "bottom right",
                    arrowSize: 8,
                    className: "info",
                    autoHide: false,
                    clickToHide: false
                });
            }, 500);
        }

        $('#LoadLi').css('display', 'none');

        if (result.CatalogGroups && result.CatalogGroups.length > 0) {
            angular.forEach(result.CatalogGroups, function(item) {
                $scope.ProductListList.push(item);
            });

            if (result.PageIndex) {
                $scope.lazyLoadPageNumber = result.PageIndex;
                $rootScope.PageNumber = result.PageIndex;
            }

            if ($scope.IsFacetLoad) {
                $scope.ProductListViewModel = result;
                $scope.IsFacetLoad = false;
            }

            if ($scope.lazyLoadPageNumber === 1) {
                SetDefaultFilters($scope.filterVal, true);
            }

            if ($scope.isCategory) {
                $scope.SelectedSortValue = result.DefaultSort;
                $scope.GetSortValue();
            }

            if (result.CatalogGroups.length === 0) {
                attachwaypoints = false;
                $scope.attachWayPoints = false;
            } else {
                if ($scope.isLazyLoadData) {
                    $scope.attachWayPoints = true;
                    $scope.InitializeWayPoint();
                }
            }

            $scope.NoProducts = false;
        } else {
            attachwaypoints = false;
            $scope.attachWayPoints = false;

            if ($scope.lazyLoadPageNumber === 1) {
                $scope.Stop = true;
                $scope.NoProducts = true;
            }

            if ($scope.IsFacetLoad) {
                $scope.ProductListViewModel = result;
                angular.forEach($scope.ProductListViewModel.FacetItems, function(itemFacet) {
                    itemFacet.Selected = false;
                });
                $scope.IsFacetLoad = false;
            }

            if ($scope.lazyLoadPageNumber === 1) {
                SetDefaultFilters($scope.filterVal, true);
            }
        }

        $scope.attachWayPoints = attachwaypoints;
        canceler = null;

        $rootScope.ShowPreLoader = false;
        $rootScope.ShowLoader = false;

    }, function(error) {
        if (error && error.status !== -1) {
            // Handle error if needed
        }
        $rootScope.ShowPreLoader = false;
        $rootScope.ShowLoader = false;
    });
};


    $scope.InitializeWayPoint = function () {
        $timeout(function () {
            var opts = {
                offset: '150%',
                context: ".list-container"
            };

            $(".AttachWayPointsDiv").waypoint(function () {
                //alert($scope.attachWayPoints);
                if ($scope.attachWayPoints && $scope.lazyLoadPageNumber - $rootScope.PageNumber <= 1) {
                    $("#LoadLi").css("display", "block");
                    //alert($scope.lazyLoadPageNumber);
                    $rootScope.PageNumber = $scope.lazyLoadPageNumber;
                    $scope.lazyLoadPageNumber = $scope.lazyLoadPageNumber + 1;

                    $scope.GetProducts(true);
                    $('ul.productlist li').each(function () {
                        var color_wrap = $(this).find('.color-innerwrap').width();
                        //$(this).find('.color-innerwrap').css('width', color_wrap);
                        var colorcount = $(this).find('.color-innerwrap a.color-variance').length;
                        var totalwidth = colorcount * 28 + 40;
                        $(this).find('.color-innerwrap span.variance-wrap').css('width', totalwidth);
                        var coloritemwrap = $(this).find('.color-innerwrap span.variance-wrap').width();
                        //console.log(coloritemwrap);
                        if (coloritemwrap > color_wrap) {
                            $(this).find('.controllers').show();
                        }
                        else {
                            $(this).find('.controllers').hide();
                        }
                    });

                } else {

                    //$("#LoadLi").css("display", "none");
                }
            }, opts);
            //}
        });
    }

    $scope.SkipValidation = function (value) {
        if (value) {
            return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
        }
    };

    $scope.ShowSortOption = function () {
        if ($(".lnkOverlay").is(':visible')) {
            $(".lnkOverlay").toggle();
        }
        $('.sortoverlay').show();
        $('.sortbyoption').fadeIn();
    }

    $scope.CloseSortOption = function () {
        $('.sortoverlay').hide();
        $('.sortbyoption').fadeOut("fast");
    }

    $scope.CloseSortOverlay = function (event) {
        $(event.target).hide();
        $('.sortbyoption').fadeOut("fast");
    }

    $scope.GetSortValue = function () {
        $scope.isCategory = false;
        if ($scope.SelectedSortValue == "relevance" || $scope.SelectedSortValue == "" || $scope.SelectedSortValue == undefined || $scope.SelectedSortValue == null) {
            $scope.SelectedSortValue = "relevance";
            if ($rootScope.UserLanguage == "en") {
                $scope.SortText = "Relevance";
            }
            else if ($rootScope.UserLanguage == "ar") {
                $scope.SortText = "ملائمة";
            }
        }
        else if ($scope.SelectedSortValue == "price-low") {
            if ($rootScope.UserLanguage == "en") {
                $scope.SortText = "Price Low to High";
            }
            else if ($rootScope.UserLanguage == "ar") {
                $scope.SortText = "السعر الأدني الي السعر الأعلي";
            }
        }
        else if ($scope.SelectedSortValue == "price-high") {

            if ($rootScope.UserLanguage == "en") {
                $scope.SortText = "Price High to Low";
            }
            else if ($rootScope.UserLanguage == "ar") {
                $scope.SortText = "السعر الأعلي الي السعر الأدني";
            }
        }
        else if ($scope.SelectedSortValue == "best-sellers") {

            if ($rootScope.UserLanguage == "en") {
                $scope.SortText = "Best-Sellers";
            }
            else if ($rootScope.UserLanguage == "ar") {
                $scope.SortText = "المنتجات الأكثر مبيعا";
            }
        }
        else if ($scope.SelectedSortValue == "new-arrivals") {

            if ($rootScope.UserLanguage == "en") {
                $scope.SortText = "New Arrivals";
            }
            else if ($rootScope.UserLanguage == "ar") {
                $scope.SortText = "كل ما هو جديد";
            }
        }
    }

    $scope.SetSortValue = function (sortValue) {
        $scope.SelectedSortValue = sortValue;
        $scope.CloseSortOption();
        $scope.ReloadList();
        $scope.GetSortValue();
    };

    $scope.FilterSearch = function (event, obj, filterBy) {
        $scope.ReloadList(event);
    };

    JSLINQ.fn.ForEachSelected = function (callback, code) {
        var i = 0;
        for (var i = 0; i < this.items.length; value = i++) {
            if (this.items[i].code == code) {
                if (this.items[i].Selected == false || this.items[i].Selected == undefined || this.items[i].Selected == null || this.items[i].Selected == '') {
                    this.items[i].Selected = true;
                }
                else {
                    this.items[i].Selected = false;
                }
            }
            //this.items[i].Selected = undefined;
        }

        return this;
    };

    JSLINQ.fn.ForEach = function (callback) {
        var i = 0;
        for (var i = 0; i < this.items.length; value = i++) {
            this.items[i].Selected = undefined;
        }

        return this;
    };

    $scope.CategorySearch = function (searchText, pageSize, searchVal, searchBy) {
        $scope.FilterText = "";
        var list = [];
        for (var i = 0; i < $scope.ProductListCategory.length; i++) {
            var objectList = $scope.ProductListCategory[i];
            if (objectList.Selected == true) {
                list.push(objectList.code);
            }
        }
        $scope.lazyLoadPageNumber = 0;
        $scope.pageSize = pageSize;
        $scope.CategorySearchText = searchText;

        if ($scope.filterVal == "" || $scope.filterVal == null || $scope.filterVal == undefined) {
            $scope.filterVal = "cat:" + list.toString();
            $scope.filterBy = "category";
        }
        else {
            var filterValSplit = $scope.filterVal.split("||");

            if (filterValSplit.length > 1) {
                if (!(list.toString() == "" || list.toString() == undefined || list.toString() == null)) {
                    $scope.filterVal = "cat:" + list.toString() + "||" + filterValSplit[1];
                    $scope.filterBy = "catbrand";
                }
                else {
                    $scope.filterVal = filterValSplit[1];
                    $scope.filterBy = "brand";
                }

            }
            else {
                var catorbrandSplit = filterValSplit[0].split(":");
                if (catorbrandSplit[0] == "cat") {
                    //catorbrandSplit[0] = "cat:" + list.toString();
                    if (!(list.toString() == "" || list.toString() == undefined || list.toString() == null)) {
                        $scope.filterVal = "cat:" + list.toString();
                        $scope.filterBy = "category";
                    }
                    else {
                        $scope.filterVal = "";
                        $scope.filterBy = "";
                    }
                }
                else {
                    if (!(list.toString() == "" || list.toString() == undefined || list.toString() == null)) {
                        $scope.filterVal = "cat:" + list.toString() + "||" + filterValSplit[0];
                        $scope.filterBy = "catbrand";
                    }
                    else {
                        $scope.filterVal = filterValSplit[0];
                        $scope.filterBy = "brand";
                    }
                }
            }
        }

        $scope.attachWayPoints = true;
        $scope.ProductListList = [];
        $scope.FilterClose();
        //$scope.IsFacetLoad = true;
        $scope.InitializeWayPoint();
    }

    $scope.FilterBySingleCategoryClick = function (facetItem, event) {
        $timeout(function () {
            $.each($scope.ProductListViewModel.FacetsDetails[0].FaceItems, function (index, item) {
                item.Selected = false;
            });

            facetItem.Selected = !facetItem.Selected;
            $scope.lazyLoadPageNumber = 0;
            $scope.ReloadList(event);
        });
    }

    $scope.GeneralFilterClick = function (facetItem, event) {
        event.preventDefault();
        $timeout(function () {
            $scope.$apply(function () {
                facetItem.Selected = !facetItem.Selected;

                $.each(facetItem.FaceItems, function (index, item) {
                    item.Selected = !item.Selected;
                });

                $scope.lazyLoadPageNumber = 0;
                $scope.ReloadList(event);
            });
        });
    }

    $scope.ClearSelectedFilters = function (event) {
        angular.forEach($scope.selectedFilters, function (value, key) {
            angular.forEach(value.FaceItems, function (value1, key) {
                value1.Selected = false;
            });
            value.Selected = false;
        });
        $scope.ReloadList(event);
    }

    $scope.ReloadList = function (event, searchText) {

        if (searchText) {
            $scope.CategorySearchText = searchText;
        }

        var filter = '';
        if ($stateParams.filterValue) {
            filter = $stateParams.filterValue;
        }

        var filterValues = '';
        var facetCode = '';

        $.each($scope.ProductListViewModel.FacetsDetails, function (index, facet) {
            filterValues = '';
            facetCode = facet.Name;

            $.each(facet.FaceItems, function (index, item) {
                if (item.Selected) { //selected items

                    if (filterValues != '')
                        filterValues = filterValues + ',';

                    filterValues = filterValues + item.value;
                }

                $.each(item.FaceItems, function (index, item1) {
                    if (item1.Selected) { //selected items

                        if (filterValues != '')
                            filterValues = filterValues + ',';

                        filterValues = filterValues + item1.value;
                    }
                });
            });

            if (filterValues != '' && filter == '')
                filter = facet.Name + ':' + filterValues;
            else if (filter.includes(facet.Name)) {
                filter = filter + ',' + filterValues;
            }
            else if (filterValues != '')
                filter = filter + '||' + facet.Name + ':' + filterValues;
        });

        $timeout(function () {
            $scope.filterVal = filter;
            $scope.lazyLoadPageNumber = 0;

            $scope.attachWayPoints = true;
            $scope.ProductListList = [];
            $scope.FilterClose();
            $scope.InitializeWayPoint();
        });
    };

    $scope.BrandCheck = function (searchText, pageSize, searchVal, searchBy) {
        $scope.FilterText = "";
        var list = [];
        for (var i = 0; i < $scope.ProductListBrand.length; i++) {
            var objectList = $scope.ProductListBrand[i];
            if (objectList.Selected == true) {
                list.push(objectList.code);
            }
        }
        $scope.lazyLoadPageNumber = 0;
        $scope.pageSize = pageSize;
        $scope.CategorySearchText = searchText;
        if ($scope.filterVal == "" || $scope.filterVal == null || $scope.filterVal == undefined) {
            $scope.filterVal = "brands:" + list.toString();
            $scope.filterBy = "brand";
        }
        else {
            var filterValSplit = $scope.filterVal.split("||");
            if (filterValSplit.length > 1) {
                if (!(list.toString() == "" || list.toString() == undefined || list.toString() == null)) {
                    $scope.filterVal = filterValSplit[0] + "||" + "brands:" + list.toString();
                    $scope.filterBy = "catbrand";
                }
                else {
                    $scope.filterVal = filterValSplit[0];
                    $scope.filterBy = "category";
                }
            }
            else {
                var catorbrandSplit = filterValSplit[0].split(":");
                if (catorbrandSplit[0] == "brands") {
                    //catorbrandSplit[0] = "cat:" + list.toString();
                    if (!(list.toString() == "" || list.toString() == undefined || list.toString() == null)) {
                        $scope.filterVal = "brands:" + list.toString();
                        $scope.filterBy = "brand";
                    }
                    else {
                        $scope.filterVal = "";
                        $scope.filterBy = "";
                    }
                }
                else {
                    if (!(list.toString() == "" || list.toString() == undefined || list.toString() == null)) {
                        $scope.filterVal = filterValSplit[0] + "||" + "brands:" + list.toString();
                        $scope.filterBy = "catbrand";
                    }
                    else {
                        $scope.filterVal = filterValSplit[0];
                        $scope.filterBy = "category";
                    }
                }
            }
        }
        $scope.attachWayPoints = true;
        //$(".items").html("");
        $scope.ProductListList = [];
        $scope.FilterClose();
        //$scope.IsFacetLoad = true;
        $scope.InitializeWayPoint();

    }
    $scope.showSearchBar = function () {
        $(".home-menu").toggle();
        $('#autocomplete').focus();
    }
    $rootScope.hideSearchBar = function () {
        $(".searchBarInner").hide();
    }

    $scope.ClearFilter = function () {
        $rootScope.PageNumber = 0;
        $state.go('productlists', {
            searchText: $scope.CategorySearchText, filterBy: "", filterValue: "", filterText: "", sortText: $scope.SelectedSortValue, pageType: $scope.pageType, searchTitle: $scope.searchTitle
        }, {
            reload: true, inherit: false, cache: false
        });
    }
    $scope.OpenFilter = function () {
        if (!$rootScope.ShowFilter) return;

        if ($(".lnkOverlay").is(':visible')) {
            $(".lnkOverlay").toggle();
        }
        $('.productlisting').hide();
        $(".filtersection").show();
        $(".filtersection").addClass("fixed-top");
        $(".app-toolbar").hide();
        

        
        $(".filtersection .togglecontent").hide();
        $(".filtersection .fl-left ul li").removeClass("active");

        $(".toggletab ul li:first-child").addClass('active');
        $(".toggletab ul li.active ul").css('display', 'block');
    }
    $scope.FilterClick = function () {

        if ($(".lnkOverlay").is(':visible')) {
            $(".lnkOverlay").toggle();
        }
        $('.productlisting').hide();
        $(".filtersection").show();
        $(".filtersection").addClass("fixed-top");
        $(".app-toolbar").hide();
        

        
        $(".filtersection .togglecontent").hide();
        $(".filtersection .fl-left ul li").removeClass("active");

        $(".toggletab ul li:first-child").addClass('active');
        $(".toggletab ul li.active ul").css('display', 'block');
        //$(".filtersection .fl-right .togglecontent:nth-of-type(1)").show();
        //$(".filtersection .fl-left ul li:nth-of-type(1)").addClass("active");

        //if ($scope.filterBy == 'brand') {
        //    $(".filtersection .fl-right .togglecontent:nth-of-type(2)").show();
        //    $(".filtersection .fl-left ul li:nth-of-type(2)").addClass("active");
        //}
        //else {
        //    $(".filtersection .fl-right .togglecontent:nth-of-type(1)").show();
        //    $(".filtersection .fl-left ul li:nth-of-type(1)").addClass("active");
        //}

        //if ($(".displayfacet .checked").length > 0) {
        //    var firstCheckedValue = $(".displayfacet .checked").closest(".displayfacet").attr('data-attr');
        //    $('.filterlist ul li a[data-attr="' + firstCheckedValue + '"]').closest('li').addClass('active');
        //    $('.filtersection .fl-right .togglecontent[data-attr="' + firstCheckedValue + '"]').show();
        //}
        //else {
        //    $(".filtersection .fl-right .togglecontent:nth-of-type(1)").show();
        //    $(".filtersection .fl-left ul li:nth-of-type(1)").addClass("active");
        //}

    }

    $scope.FilterClose = function (event, flag) {
        window.localStorage.setItem("ShowFilter", flag);
        $rootScope.ShowFilter = flag;
        $('.productlisting').show();
        $(".filtersection").hide();
        $(".app-toolbar").show();


    }

    $scope.OptionClickFilter = function (event) {
        var obj = event.target;
        var check = $(obj).find('input[type="checkbox"]');
        if ($(obj).is(':checked')) {
            $(obj).find('span.check').addClass('checked');
        }
        else {
            $(obj).find('span.check').removeClass('checked');
            $(obj).parents('.togglecontent').find('.checkAll input[type="checkbox"]').removeAttr('checked');
            $(obj).parents('.togglecontent').find('span.checkAll').removeClass('checked');
        }
    }

    $scope.SetSelectFilter = function (faceItem) {
    }

    $scope.FilterOptionClick = function (event) {
        var obj = event.target;
        if ($(obj).prop("tagName").toLowerCase() == "label") {
            obj = $(obj).parent();
        }
        event.preventDefault();
        var catattr = $(obj).attr('data-attr');

        //$(".togglecontent").slideUp();
        $(obj).closest("li").toggleClass("active");
        if ($(obj).closest("li").hasClass("active")) {
            $(".toggletab ul li").removeClass('active');
            $(".togglecontent").slideUp('fast');
            $(obj).closest("li").addClass("active");
            $(".togglecontent." + catattr).slideDown('fast');
        }
        else {
            $(obj).closest("li").removeClass("active");
            $(".togglecontent." + catattr).slideUp('fast');
        }

    }

    $scope.AddtoCart = function (product, quantity, event) {
        event && event.stopPropagation();
        $rootScope.AddtoCart(product, quantity).then(function () {
            $scope.GetShoppingCartCount();
        });
    }

    $scope.GetProductImage = function (imagePath) {
        return rootUrl.ImageUrl + imagePath;
    }

    $scope.ErrorImage = function () {
        return rootUrl.ErrorProductImageUrl;
    }

    $scope.ProductLists = [];
    $scope.Products = function () {
        $scope.ProductLists = [];
        var url = dataService + "/GetProducts?widgetType=All";

        $http.get(url).then(function (results) {
            $scope.ProductLists = results.data;
        });
    }

    $scope.ListViewChange = function (event) {

        var obj = event.target.parentElement;
        //$('.sort-filter ul li.gridview').on('click', function () {

        $(obj).toggleClass('active');
        if ($(obj).hasClass('active')) {
            $('.list-container').addClass('listview');
            //$scope.IsFacetLoad = true;
            $scope.InitializeWayPoint();
            $('ul.productlist li').each(function () {
                var color_wrap = $(this).find('.color-innerwrap').width();
                //$(this).find('.color-innerwrap').css('width', color_wrap);
                var colorcount = $(this).find('.color-innerwrap a.color-variance').length;
                var totalwidth = colorcount * 28 + 40;
                $(this).find('.color-innerwrap span.variance-wrap').css('width', totalwidth);
                var coloritemwrap = $(this).find('.color-innerwrap span.variance-wrap').width();
                //console.log(coloritemwrap);
                if (coloritemwrap > color_wrap) {
                    $(this).find('.controllers').show();
                }
                else {
                    $(this).find('.controllers').hide();
                }
            });
        }
        else {
            $('.list-container').removeClass('listview');
            //$scope.IsFacetLoad = true;
            $scope.InitializeWayPoint();
            $('ul.productlist li').each(function () {
                var color_wrap = $(this).find('.color-innerwrap').width();
                //$(this).find('.color-innerwrap').css('width', color_wrap);
                var colorcount = $(this).find('.color-innerwrap a.color-variance').length;
                var totalwidth = colorcount * 28 + 40;
                $(this).find('.color-innerwrap span.variance-wrap').css('width', totalwidth);
                var coloritemwrap = $(this).find('.color-innerwrap span.variance-wrap').width();
                //console.log(coloritemwrap);
                if (coloritemwrap > color_wrap) {
                    $(this).find('.controllers').show();
                }
                else {
                    $(this).find('.controllers').hide();
                }
            });
        }
        //});
    }

    // $scope.pullRefresh = function () {
    //     $scope.refresher = PullToRefresh.init({
    //         mainElement: '.pagesections',
    //         triggerElement: ".pagesections",
    //         onRefresh: function () {
    //             $scope.Products();
    //         }
    //     });
    // }

    // $scope.destroyRefresh = function () {
    //     $scope.refresher.destroy();
    // }

    $scope.SelectCatalog = function (parentProduct, selectedCatalog, event) {
        if (event != undefined && event != null) {
            event.preventDefault();
        }
        parentProduct.SelectedCatalog = selectedCatalog;
    };

    $scope.scrolltoViewCategory = function () {
        var sum = 0;
        var catOffSet = $(".catMenuListInner ul li.selected").offset();

        if (catOffSet) {
            var offsetSelectedCat = catOffSet.left;
            $('.catMenuListInner ul li').each(function () { sum += $(this).width(); });
            var scrollToLeftVal = offsetSelectedCat - 60;
            var scrollLeftArabic = sum - Math.abs(offsetSelectedCat) - $(document).width() + 30;
            if ($rootScope.UserLanguage == "en") {
                $(".catMenuListInner ul").scrollLeft(scrollToLeftVal);
            }
            else if ($rootScope.UserLanguage == "ar") {
                $(".catMenuListInner ul").scrollLeft(scrollLeftArabic);
            }
        }
    }

    $scope.LoadProductByAllSubCategory = function (loadDetails) {
        $scope.IsLoadAll = true;
        var categoryFacet = $scope.ProductListViewModel.FacetsDetails.find(x => x.Name == "Category");
        categoryFacet.FaceItems.forEach(x => x.Selected = false);
        $scope.filterVal = $stateParams.filterValue;
        $scope.lazyLoadPageNumber = 0;

        $scope.attachWayPoints = true;
        $scope.ProductListList = [];
        $scope.FilterClose();
        $scope.InitializeWayPoint();
    }

    $scope.LoadProductBySubCategory = function (loadDetails) {
        $scope.IsLoadAll = false;
        var categoryFacet = $scope.ProductListViewModel.FacetsDetails.find(x => x.Name == "Category");
        categoryFacet.FaceItems.forEach(x => x.Selected = false);
        $scope.filterVal = loadDetails.filterValue;
        $scope.lazyLoadPageNumber = 0;

        $scope.attachWayPoints = true;
        $scope.ProductListList = [];
        $scope.FilterClose();
        $scope.InitializeWayPoint();
    }

    $scope.init();
}]);