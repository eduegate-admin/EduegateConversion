//$(function () {
//    alert("hi");
//    $('#autocomplete').autocomplete({
//        source: function (request, response) {
//            $.ajax({
//                url: 'http://localhost/Skien.Suite.Services/MobileAppWrapper/AppDataService.svc' + '/GetSkienKeywordsDictionary?searchtext=' + 'logit' + "&lng=en",
//                dataType: "json",
//                //data: {
//                //    qry: $("#productName").val(),
//                //    maxRows: 5
//                //},
//                success: function (data) {
//                    alert('success');
//                    alert(data);

//                    //response($.map(data.productList, function (item) {
//                    //    alert(data.productList);
//                    //    console.log(item);
//                    //    return {
//                    //        label: item.productName,
//                    //        value: item.productName,
//                    //        id: item.productId
//                    //    }
//                    //}));
//                },
//                error: function (data) {
//                    //alert(data.productList);
//                    //console.log(typeof data);
//                    //console.log(data);
//                    alert('error');
//                }
//            });
//        },
//        serviceUrl: 'http://localhost/Skien.Suite.Services/MobileAppWrapper/AppDataService.svc' + '/GetSkienKeywordsDictionary?searchtext=' + 'logit' + "&lng=en",
//        select: function (event, ui) {
//            //alert(suggestion);
//            //alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
//        }
//    });
//});