app.controller('ProductDetailController', ['$scope', '$http', 'loggedIn', 'rootUrl',
'$location', 'GetContext', 'serviceCartCount',
'$state', '$stateParams', '$sce', '$rootScope', '$translate', '$timeout', '$q','$controller', 'FlickityService',
function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount,
    $state, $stateParams, $sce, $rootScope, $translate, $timeout, $q, $controller , FlickityService) {
        $scope.items1 = [1,2,3,4,5];
        $scope.items2 = [1,2,3,4,5,6,7,8,9,10];

    console.log('Product Detail controller loaded.');
    var dataService = rootUrl.RootUrl;
    var Context = GetContext.Context();
    $scope.selectedProductQuantity = 1;
    $scope.selectedProductQuantitys;
    $scope.selectedItem = "";
    $scope.Allergies = [];
    $scope.hasBanner = false;
    $scope.Product = { ProductImages: [], ProductDetail: {}, ProductFeatures: [], ProductVariants: [], DeliveryOptions: [], ProductDescription: {}, MultiPriceList: [], QtyDiscountList: [] };
    $scope.skuID = $stateParams.skuID;
    $scope.cultureID = 1;
    $scope.LoggedIn = false;
    $scope.init = function () {
        $rootScope.ShowLoader = true;
        $scope.Product.ProductDetail.SKUID = $stateParams.skuID;
        $scope.Product.ProductDetail.IsWishList = false;

        $scope.GetShoppingCartCount();
        $scope.GetSaveForCartCount();
        $scope.GetProductImages();
        $scope.GetProductDetailsDescription();
        $scope.GetProductFeatures();
        $scope.GetProductVariants();
        $scope.GetMultiPrice();
        $scope.GetQtyDiscount();
        $scope.GetProductDeliveryOptions();
        $scope.GetProductDetails();
        Fancybox.bind("[data-fancybox]", {
            // Your custom options
            closeButton:true,
            Thumbs: false,
            Toolbar: {
                display: {
                  left: [],
                  middle: [],
                  right: [],
                },
            },
            Carousel: {
                Navigation: false,
              },
          });

    }

    $scope.$watch('ProductList', function (old, nuew) {
        if (old === nuew) return;
        $timeout(function () {
            $rootScope.ShowLoader = false;
        });
    });

    $scope.GetMultiPrice = function () {
        $http({
            url: dataService + "/GetProductMultiPriceDetails?skuID=" + $scope.skuID,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },

        }).then(function (result) {
            result = result.data;
            $scope.Product.MultiPriceList = result;
        });
    }

    $scope.GetQtyDiscount = function () {
        $http({
            url: dataService + "/GetProductQtyDiscountDetails?skuID=" + $scope.skuID,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },

        }).then(function (result) {
            result = result.data;
            $scope.Product.QtyDiscountList = result;

        })
    }


    $scope.GetProductImages = function () {
        //if ($rootScope.ShowLoader == false) {
        //    $rootScope.ShowLoader = true;
        //}
        $http({
            url: dataService + "/GetProductDetailImages?skuID=" + $scope.skuID,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },

        }).then(function (result) {
            result = result.data;
            $scope.Product.ProductImages = result;
            const element = angular.element(document.getElementById('demo-slider'));
            $timeout(() => {
                $scope.options = {
                    imagesLoaded: true,
                    draggable: true,
wrapAround: true
                };
                // Initialize our Flickity instance
                FlickityService.create(element[0], element[0].id ,  $scope.options);
            }, 300);
            // $('.main-carousel').flickity({
            //     wrapAround: true,
            //     contain: true
            // });
            $scope.hasBanner = true;
        })
            , function (err) {
                //if ($rootScope.ShowLoader == true) {
                //    $rootScope.ShowLoader = false;
                //}
            }
    }

    $scope.GetProductDetails = function () {
        //if ($rootScope.ShowLoader == false) {
        //    $rootScope.ShowLoader = true;
        //}
        $http({
            url: dataService + "/GetProductDetail?skuID=" + $scope.skuID + "&cultureID=" + $scope.cultureID,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },

        }).then(function (result) {
            result = result.data;


            $scope.Product.ProductDetail = result;



            $scope.Product.ProductDetail.Allergies.forEach(data => {
                $scope.Allergies.push(data.Value)
            });


            if ($rootScope.ShowLoader == true) {
                $rootScope.ShowLoader = false;
            }

            $timeout(function () {
                $('.fancybox').fancybox({
                    'loop': false,
                    helpers: {
                        title: { type: 'over' }
                    }, // helpers
                    thumbs : {
                        autoStart : true,
                        axis      : 'x'
                      },
                    beforeShow: function () {
                        this.title = (this.title ? '' + this.title + '' : '') + 'Image ' +
                            (this.index + 1) + ' of ' + (this.group ? this.group.length : 1);
                    }, // beforeShow
                    allowPageScroll: 'vertical',

                });
            });
        })
            , function (err) {
                //if ($rootScope.ShowLoader == true) {
                //    $rootScope.ShowLoader = false;
                //}
            }
    }

    $scope.GetProductFeatures = function () {
        //if ($rootScope.ShowLoader == false) {
        //    $rootScope.ShowLoader = true;
        //}
        $http({
            url: dataService + "/GetProductFeatures?skuID=" + $scope.skuID,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },

        }).then(function (result) {
            result = result.data;
            $scope.Product.ProductFeatures = result;
        })
            , function (err) {

            }
    };

    $scope.GetProductVariants = function () {
        //if ($rootScope.ShowLoader == false) {
        //    $rootScope.ShowLoader = true;
        //}
        $http({
            url: dataService + "/GetProductVariant?skuID=" + $scope.skuID + "&cultureID=" + $scope.cultureID,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },

        }).then(function (result) {
            result = result.data;

            if (result != null) {
                if (result[0] != null) {
                    $scope.Product.ProductVariants = result;
                    if ($scope.Product.ProductVariants != undefined && $scope.Product.ProductVariants != null) {
                        if ($scope.Product.ProductVariants.length > 0) {
                            if ($scope.Product.ProductVariants[0] != null && $scope.Product.ProductVariants[0] != undefined) {
                                $scope.selectedItem = $scope.Product.ProductVariants[0].ProductSKUMapIID;
                            }
                        }
                    }
                }
            }
            //if ($rootScope.ShowLoader == true) {
            //    $rootScope.ShowLoader = false;
            //}
        })
            , function (err) {
                //if ($rootScope.ShowLoader == true) {
                //    $rootScope.ShowLoader = false;
                //}
            }
    }

    $scope.GetProductDeliveryOptions = function () {
        $http({
            url: dataService + "/GetProductDeliveryTypeList?skuID=" + $scope.skuID + "&cultureID=" + $scope.cultureID,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },

        }).then(function (result) {
            result = result.data;
            $scope.Product.DeliveryOptions = result;
        })
            , function (err) {
            }
    }

    $scope.GetProductDetailsDescription = function () {
        $http({
            url: dataService + "/GetProductDetailsDescription?skuID=" + $scope.skuID + "&cultureID=" + $scope.cultureID,
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },

        }).then(function (result) {
            result = result.data;
            $scope.Product.ProductDescription = result;
        })
            , function (err) {
            }
    }

    $scope.SkipValidation = function (value) {
        if (value) {
            var el = document.createElement('div');
            $(el).text(value);
            var text = $(el).html();
            return $sce.trustAsHtml(jQuery.parseHTML(text)[0].textContent)
        }

        return "";
    };

    $scope.GetPropertyName = function (properties, propertyType) {
        if (properties != null && properties != undefined) {
            for (var i = 0; i <= properties.length - 1; i++) {
                if (properties[i] != null && properties[i] != undefined) {
                    if (properties[i].PropertyTypeName == propertyType && properties[i].ProductSKUMapIID == $scope.skuID) {
                        return properties[i].PropertyName;
                    }
                }
            }
        }
        return "";
    };

    $scope.GetShoppingCartCount = function () {
        var cartPromise = serviceCartCount.getProductCount(Context, dataService);
        cartPromise.then(function (result) {
            $scope.ShoppingCartCount = result;
        }, function () {

        });

    }

    $scope.GetSaveForCartCount = function () {
        var loggedInPromise = loggedIn.CheckLogin(Context, dataService);
        loggedInPromise.then(function (model) {

            if (model.data) {
                if (model.data.LoginID) {
                    $scope.LoggedIn = true;
                    var SaveForLaterCountPromise = serviceCartCount.getSaveForLaterCount(Context, dataService);
                    SaveForLaterCountPromise.then(function (result) {
                        $scope.SaveForLaterCount = result.data;
                    });
                }
            }
        }, function () { });
    }

    $scope.getNumber = function (num) {
        return new Array(num);
    }

    $scope.range = function (start, end) {
        var result = [];
        for (var i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    };

    $scope.OptionClick = function () {
        $('.rightnav-cont').toggle();
    };

    $scope.updateQty = function (qty) {
        var inputVal = parseInt(qty);

        if (inputVal == 0) {
            inputVal = 1;
        }

        if (isNaN(inputVal)) {
            inputVal = "";
        }

        $scope.selectedProductQuantity = inputVal;
        $('#qtydropdown').val(inputVal).trigger('input');
    };

    $scope.resetNoQty = function (qty) {
        var inputVal = parseInt(qty);
        if (isNaN(inputVal)) {
            inputVal = 1;
        }
        $scope.selectedProductQuantity = inputVal;
        $('#qtydropdown').val(inputVal).trigger('input');
    };

    $scope.decreaseQty = function (qty) {
        if (qty > 1) {
            var inputVal = parseInt(qty) - 1;
            $scope.selectedProductQuantity = inputVal;
            $('#qtydropdown').val(inputVal).trigger('input');
        }
    };

    $scope.increaseQty = function (qty) {
        var inputVal = parseInt(qty) + 1;
        $scope.selectedProductQuantity = inputVal;
        $('#qtydropdown').val(inputVal).trigger('input');
    };


    $scope.AddtoCart = function (product, redirect) {
        if ($scope.selectedProductQuantity <= 0) {
            $translate(['PLEASESELECTQUANTITY']).then(function (translation) {
                $rootScope.ErrorMessage = translation.PLEASESELECTQUANTITY;
                $(".error-msg").removeClass('showMsg');
                $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                    $(this).removeClass('showMsg');
                    $(this).dequeue();
                });
            });
            return;
        }

        $rootScope.AddtoCart(product, $scope.selectedProductQuantity).then(function () {
            $scope.GetShoppingCartCount();

            if(redirect) {
                $state.go("singlecheckout");
            }
        });
    }

    $('ul.tabNav a').click(function () {
        var curChildIndex = $(this).parent().prevAll().length + 1;
        $(this).parent().parent().children('.current').removeClass('current');
        $(this).parent().addClass('current');
        $(this).parent().parent().next('.tabContainer').children('.current').slideDown('fast', function () {
            $(this).removeClass('current');
            $(this).parent().children('div:nth-child(' + curChildIndex + ')').slideUp('normal', function () {
                $(this).addClass('current');
                //$(this).parent().children('div:nth-child(' + curChildIndex + ')').ScrollTo();
            });
        });
        return false;
    });

    $scope.GetErrorImage = function () {
        return rootUrl.ErrorProductImageUrl;
    }

    $scope.hasChanged = function (option) {
        if (option != "" && option != null && option != undefined) {
            $state.go("productdetails", { skuID: option }, { reload: true });
        }
    };

    $scope.init();

}]);
