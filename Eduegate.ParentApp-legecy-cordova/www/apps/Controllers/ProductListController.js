app.controller('ProductListController', ['$scope', '$http', 'loggedIn', 'rootUrl',
    '$location', 'GetContext', '$state', '$stateParams', '$sce', '$rootScope', '$q', 'serviceCartCount', 'serviceAddToCart', '$timeout',
    function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $stateParams, $sce, $rootScope,
        $q, serviceCartCount, serviceAddToCart, $timeout) {

        console.log('All Product lists Controller loaded.');
        var dataService = rootUrl.RootUrl;
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
        $scope.searchText = "";
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
        $(".filtersection").hide();
        KTScrolltop.createInstances();
        var scrollTopElement = document.querySelector("#scrolltop_control");
        var scrollTop = KTScrolltop.getInstance(scrollTopElement);
        $scope.init = function () {
            // $scope.pullRefresh();
            // $(".pagesections").scroll(function () {
            //     $scope.scrollPoint = $(this).scrollTop();
            //     if ($scope.scrollPoint === 0) {
            //         $scope.pullRefresh();
            //     }
            //     else {
            //         $scope.destroyRefresh();
            //     }
            // });

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
            $scope.searchText = $stateParams.searchText;
            $scope.SelectedSortValue = $stateParams.sortText;
            $scope.filterVal = $stateParams.filterValue;
            $scope.filterBy = $stateParams.filterBy;
            $scope.FilterText = $stateParams.filterText;

            if (!($stateParams.isCategory == undefined || $stateParams.isCategory == '' || $stateParams.isCategory == null || $stateParams.isCategory == 'false')) {
                $scope.isCategory = true;
                $scope.showRelevance = false;
            }

            if ($scope.searchTitle != undefined && $scope.searchTitle != '' && $scope.searchTitle != null) {
                $scope.searchTitle = decodeURI($scope.searchTitle);
            }
            if ($scope.searchText != undefined && $scope.searchText != '' && $scope.searchText != null) {
                $scope.searchText = decodeURI($scope.searchText);
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

        };
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
                            $.each(itemFacet.FaceItems, function (index, itemFacetItems) {
                                if (itemValues == itemFacetItems.code && itemValues != '' && itemValues != null && itemValues != undefined) {
                                    //console.log(itemFacet);
                                    itemFacetItems.Selected = true;
                                    if (itemFacet.Name != "skutags") {
                                        $scope.selectedFilters.push(itemFacetItems);
                                        if ($scope.FilterText == "" || $scope.FilterText == undefined || $scope.FilterText == null) {
                                            $scope.FilterText = itemFacetItems.key;
                                        }
                                        else {
                                            $scope.FilterText = $scope.FilterText + "," + itemFacetItems.key;
                                        }
                                    }
                                    return false;
                                }
                            });
                        });
                    });
                });
            }
        }
var cancelToken = null;

$scope.GetProducts = function (attachwaypoints) {
    if ($scope.lazyLoadPageNumber === 1) {
        $scope.FilterText = "";
        $scope.selectedFilters = [];
    }

    // Cancel ongoing request
    if (cancelToken) {
        cancelToken.resolve();
    }

    cancelToken = $q.defer();

    $scope.attachWayPoints = false;

    $http({
        method: 'GET',
        url: dataService + '/OnlineStoreGetProductSearch',
        params: {
            pageIndex: $scope.lazyLoadPageNumber,
            pageSize: $scope.pageSize,
            searchText: $scope.searchText,
            searchVal: $scope.filterVal,
            searchBy: $scope.filterBy,
            sortBy: $scope.SelectedSortValue,
            isCategory: $scope.isCategory,
            pageType: $scope.pageType
        },
        headers: {
            'Accept': 'application/json;charset=UTF-8',
            'Content-Type': 'application/json; charset=utf-8',
            'CallContext': JSON.stringify(Context)
        },
        timeout: cancelToken.promise
    }).then(function (response) {
        var result = response.data;

        $('#LoadLi').css('display', 'none');

        if (result.CatalogGroups && result.CatalogGroups.length > 0) {
            angular.forEach(result.CatalogGroups, function (item) {
                $scope.ProductListList.push(item);
            });

            if (result.PageIndex) {
                $scope.lazyLoadPageNumber = result.PageIndex;
                $rootScope.PageNumber = result.PageIndex;
            }

            if ($scope.IsFacetLoad) {
                $scope.ProductListViewModel = result;
                angular.forEach($scope.ProductListViewModel.FacetItems, function (itemFacet) {
                    itemFacet.Selected = false;
                });
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
                $timeout(function () {
                    attachwaypoints = false;
                    $scope.attachWayPoints = false;
                }, 100);
            } else {
                $timeout(function () {
                    if ($scope.isLazyLoadData) {
                        $scope.attachWayPoints = true;
                        $scope.InitializeWayPoint();
                    }
                }, 1000);
            }

            $scope.NoProducts = false;

        } else {
            attachwaypoints = false;
            $scope.attachWayPoints = false;

            if ($scope.lazyLoadPageNumber === 1) {
                $scope.Stop = true;

                $timeout(function () {
                    $scope.NoProducts = true;
                });
            }

            if ($scope.IsFacetLoad) {
                $scope.ProductListViewModel = result;
                angular.forEach($scope.ProductListViewModel.FacetItems, function (itemFacet) {
                    itemFacet.Selected = false;
                });
                $scope.IsFacetLoad = false;
            }

            if ($scope.lazyLoadPageNumber === 1) {
                SetDefaultFilters($scope.filterVal, true);
            }
        }

        $timeout(function () {
            $scope.attachWayPoints = attachwaypoints;
        }, 100);

        cancelToken = null;
        $rootScope.ShowPreLoader = false;
        $rootScope.ShowLoader = false;

    }, function (error) {
        // If not a cancelled request, handle error
        if (error.status !== -1) {
            console.error("Error loading products", error);
        }
        cancelToken = null;
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
            }, 100);
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
            $(".sortbyoption").addClass("card position-fixed");

            
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

        $scope.SetSortValue = function () {
            $scope.CloseSortOption();
            $scope.lazyLoadPageNumber = 0;
            $scope.ReloadList(event);
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
            $scope.searchText = searchText;

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

        $scope.GeneralFilterClick = function (facetItem, event) {
            event.preventDefault();
            $timeout(function () {
                facetItem.Selected = !facetItem.Selected;
                $.each(facetItem.FaceItems, function (index, item) {
                    item.Selected = !item.Selected;
                });

                $scope.lazyLoadPageNumber = 0;
                $scope.ReloadList(event);
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

        $scope.ReloadList = function (event) {
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

                        filterValues = filterValues + item.code;
                    }
                });

                if (filterValues != '' && filter == '')
                    filter = facet.Name + ':' + filterValues;
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
            $scope.searchText = searchText;
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


        $scope.ClearFilter = function () {
            $rootScope.PageNumber = 0;
            $state.go('productlists', {
                searchText: $scope.searchText, filterBy: "", filterValue: "", filterText: "", sortText: $scope.SelectedSortValue, pageType: $scope.pageType, searchTitle: $scope.searchTitle
            }, {
                reload: true, inherit: false, cache: false
            });
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

        $scope.FilterClose = function () {
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

        $scope.AddtoCart = function (product, quantity) {
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
                $('.grid').addClass('col-12');
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
                $('.grid').removeClass('col-12');
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
            $timeout(function () {
                parentProduct.SelectedCatalog = selectedCatalog;
            }, 100);
        };


        $scope.init();
    }]);