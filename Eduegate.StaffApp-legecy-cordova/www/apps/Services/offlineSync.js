app.service("offlineSync", [
  "$http",
  "GetContext",
  "$q",
  "$timeout",
  "rootUrl",
  "$translate",
  "$rootScope",
  "$indexedDB",
  function (
    $http,
    GetContext,
    $q,
    $timeout,
    rootUrl,
    $translate,
    $rootScope,
    $indexedDB
  ) {
    var context = GetContext.Context();
    var dataService = rootUrl.SchoolServiceUrl;
    //$rootScope.StorageData=[];

    function GetScheduleDatabyRouteOffline(
      IsPickup,
      passengerType,
      vehicleID,
      routeID
    ) {
      return $q(function (resolve, reject) {
        $indexedDB.openStore("DriverScheduleLogs", function (store) {
          store.getAll().then(function (det) {
            var data = det;
            var scheduledData;
            resolve(scheduledData);
          });
        });
      });
    }

    return {
      Sync: function () {
        $http({
          method: "GET",
          url: dataService + "/GetScheduleLogsByDateForOfflineDB",
          headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            CallContext: JSON.stringify(context),
          },
        }).then(
          function (result) {
            result = result.data;
            $indexedDB.openStore("DriverScheduleLogs", function (store) {
              store.clear().then(function () {
                // do something
              });
            });

            $indexedDB.openStore("DriverScheduleLogs", function (store) {
              result.forEach((data) => {
                // store.add($rootScope.StorageData);
                store
                  .upsert({
                    DriverScheduleLogIID: data.DriverScheduleLogIID,
                    StudentID: data.StudentID,
                    EmployeeID: data.EmployeeID,
                    SheduleDate: data.SheduleDate,
                    RouteID: data.RouteID,
                    RouteStopMapID: data.RouteStopMapID,
                    VehicleID: data.VehicleID,
                    SheduleLogStatusID: data.SheduleLogStatusID,
                    StopEntryStatusID: data.StopEntryStatusID,
                    Status: data.Status,
                    VehicleRegistrationNumber: data.VehicleRegistrationNumber,
                    VehicleType: data.VehicleType,
                    RouteCode: data.RouteCode,
                    StopName: data.StopName,
                    AdmissionNumber: data.AdmissionNumber,
                    StudentName: data.StudentName,
                    ClassName: data.ClassName,
                    SectionName: data.SectionName,
                    IsStudentIn: data.IsStudentIn,
                    EmployeeCode: data.EmployeeCode,
                    StaffName: data.StaffName,
                    IsStaffIn: data.IsStaffIn,
                    IsPickupStop: data.IsPickupStop,
                    IsDropStop: data.IsDropStop,
                    IsDataSyncedToLive: true,
                    LoginID: data.LoginID,
                    ScheduleLogType: data.ScheduleLogType
                  })
                  .then(function (e) { });
              });
            });
          },
          function (err) {

          }
        );
      },

      GetStudentsAndStaffScheduleDetails: function (all) {
        return $q(function (resolve, reject) {
          $indexedDB.openStore("DriverScheduleLogs", function (store) {
            store.getAll().then(function (det) {
              var data = det;
              var scheduledData = SetScheduleDetails(data);
              resolve(scheduledData);
            });
          });
        });
      },

      GetScheduleLogsByRouteOffline: function (
        IsPickup,
        passengerType,
        vehicleID,
        routeID
      ) {
        return $q(function (resolve, reject) {
          var scheduledData = [];
          $indexedDB.openStore("DriverScheduleLogs", function (store) {
            store.getAll().then(function (det) {
              var data = det;
              if (IsPickup == "IsPickup") {
                scheduledData = GetPickUPScheduleDatabyRoute(
                  data,
                  IsPickup,
                  passengerType,
                  vehicleID,
                  routeID
                );
              } else {
                scheduledData = GetDropScheduleDatabyRoute(
                  data,
                  IsPickup,
                  passengerType,
                  vehicleID,
                  routeID
                );
              }
              resolve(scheduledData);

            });
          });
        });
      },


      SyncLiveDB: function () {
        return $q(function (resolve, reject) {

          $indexedDB.openStore("DriverScheduleLogs", function (store) {
            store.getAll().then(function (det) {
              // Update scope
              var dat = det;
              var filteredData = dat.filter(
                (f) => f.IsDataSyncedToLive === false
              );

              if (filteredData.length > 0) {
                filteredData.forEach(function (data) {

                  var saveData = {
                    DriverScheduleLogIID: data.DriverScheduleLogIID,
                    StudentID: data.StudentID,
                    EmployeeID: data.EmployeeID,
                    SheduleDate: data.SheduleDate,
                    RouteID: data.RouteID,
                    RouteStopMapID: data.RouteStopMapID,
                    VehicleID: data.VehicleID,
                    SheduleLogStatusID: data.SheduleLogStatusID,
                    StopEntryStatusID: data.StopEntryStatusID,
                    ScheduleLogType: data.ScheduleLogType,
                    Status: data.Status
                  };
                  if ($rootScope.IsOnline) {
                    $http({
                      method: "POST",
                      url: dataService + "/SyncDriverScheduleLogs",
                      data: saveData,
                      headers: {
                        Accept: "application/json;charset=UTF-8",
                        "Content-type": "application/json; charset=utf-8",
                        CallContext: JSON.stringify(context),
                      },
                    })
                      .success(function (returnValue) {
                        if (returnValue != 0) {
                          $indexedDB.openStore(
                            "DriverScheduleLogs",
                            function (result) {
                              result.find(data.DriverScheduleLogIID)
                                .then(function (rowData) {
                                  if (rowData) {
                                    rowData.IsDataSyncedToLive = true;
                                    // rowData.SheduleLogStatusID = SheduleLogStatusID;
                                    // rowData.StopEntryStatusID = StopEntryStatusID;
                                    // rowData.IsStudentIn = IsStudentIn;
                                    // rowData.IsStaffIn = IsStaffIn;
                                    rowData.Status = data.Status;
                                    result.upsert(rowData);
                                  }
                                });

                            }
                          );
                        }
                        else {
                          resolve(false);
                        }
                      })
                      .error(function (err) { });
                  } else {
                    resolve(false);
                  }
                });
                resolve(true);
              }
              else {
                resolve(true);
              }
            });
          });
        });
      },

      UpdateIndexedDBINOUTStatus: function (
        DriverScheduleLogIID,
        SheduleLogStatusID,
        StopEntryStatusID,
        Status, IsStudentIn, IsStaffIn,  ScheduleLogType,
        SyncStatus
      ) {
        $indexedDB.openStore("DriverScheduleLogs", function (result) {

          result.find(DriverScheduleLogIID)
            .then(function (rowData) {
              if (rowData) {
                rowData.DriverScheduleLogIID = DriverScheduleLogIID
                rowData.IsDataSyncedToLive = SyncStatus;
                rowData.SheduleLogStatusID = SheduleLogStatusID;
                rowData.StopEntryStatusID = StopEntryStatusID;
                rowData.IsStudentIn = IsStudentIn;
                rowData.IsStaffIn = IsStaffIn;
                rowData.Status = Status;
                rowData.ScheduleLogType = ScheduleLogType;
                result.upsert(rowData);
              }
            });
        });
      },

    };

    function GetPickUPScheduleDatabyRoute(
      data,
      IsPickup,
      passengerType,
      vehicleID,
      routeID
    ) {
      PickOUTscheduledData = data.filter(
        (f) =>
          f.VehicleID === vehicleID &&
          f.RouteID === routeID &&
          f.ScheduleLogType === 'PICK-OUT'

      );
      PickINscheduledData = data.filter(
        (f) =>
          f.VehicleID === vehicleID &&
          f.RouteID === routeID &&
          f.ScheduleLogType === 'PICK-IN' &&
          f.Status === 'I'
      );

      const filteredData = PickOUTscheduledData
        .filter(
          f => PickINscheduledData.some(item => item.StudentID === f.StudentID && item.EmployeeID === f.EmployeeID));
      var ScheduleDetails = [];
      filteredData.forEach((vehicleDT) => {
        ScheduleDetails.push({
          DriverScheduleLogIID: vehicleDT.DriverScheduleLogIID,
          StudentID: vehicleDT.StudentID,
          EmployeeID: vehicleDT.EmployeeID,
          SheduleDate: vehicleDT.SheduleDate,
          RouteID: vehicleDT.RouteID,
          RouteStopMapID: vehicleDT.RouteStopMapID,
          VehicleID: vehicleDT.VehicleID,
          SheduleLogStatusID: vehicleDT.SheduleLogStatusID,
          StopEntryStatusID: vehicleDT.StopEntryStatusID,
          ScheduleLogType: vehicleDT.ScheduleLogType,
          Status: vehicleDT.Status,
          StudentRouteStopMap: {
            StudentID: vehicleDT.StudentID,
            AdmissionNumber: vehicleDT.AdmissionNumber,
            StudentName: vehicleDT.StudentName,
            ClassID: vehicleDT.ClassID,
            ClassName: vehicleDT.ClassName,
            SectionID: vehicleDT.SectionID,
            SectionName: vehicleDT.SectionName,
            StopName: vehicleDT.StopName,
            IsPickupStop: vehicleDT.IsPickupStop,
            IsDropStop: vehicleDT.IsDropStop,
            IsStudentIn: (vehicleDT.StudentID = !null ? (vehicleDT.Status == "O" ? false : true) : false),
            Status: vehicleDT.Status,
          },
          StaffRouteStopMap: {
            EmployeeID: vehicleDT.EmployeeID,
            EmployeeCode: vehicleDT.EmployeeCode,
            StaffName: vehicleDT.StaffName,
            StopName: vehicleDT.StopName,
            IsPickupStop: true,
            IsDropStop: false,
            IsStaffIn: (vehicleDT.EmployeeID != null ? (vehicleDT.Status == "O" ? false : true) : false),
            Status: vehicleDT.Status,
          }
        });
      });
      return ScheduleDetails;
    }

    function GetDropScheduleDatabyRoute(
      data,
      IsDropStop,
      passengerType,
      vehicleID,
      routeID
    ) {

      var filterData = data.filter(
        (f) =>
          f.VehicleID === vehicleID &&
          f.RouteID === routeID

      );

      var distinctData = [];
      var StopData = {};
      filterData.forEach((x) => {
        if (
          !distinctData.some(
            (y) => y.RouteID === x.RouteID
          )
        ) {
          distinctData.push({ RouteID: x.RouteID });
        }
      });

      // distinctData.forEach((routeDT) => {
      StopData = {
        RouteID: routeID,
        StopName: null,
        Stops: GetDropStops(filterData, vehicleID, routeID),

      };
      // });
      return StopData;
    }


    function SavePickUPScheduleDatabyRoute(
      data,
      IsPickup,
      passengerType,
      vehicleID,
      routeID
    ) {
      $indexedDB.openStore("people", function (store) {
        store.upsert(data).then(function (e) { });
      });
    }

    function SaveDropScheduleDatabyRoute(
      data,
      IsDropStop,
      passengerType,
      vehicleID,
      routeID
    ) {
      scheduledData = data.filter(
        (f) =>
          f.IsDropStop === true &&
          f.VehicleID === vehicleID &&
          f.RouteID === routeID &&
          f.StopEntryStatusID === 2 &&
          f.SheduleLogStatusID === 1
      );
      var ScheduleDetails = [];

      var driverScheduleID;
      scheduledData.forEach((vehicleDT) => {
        driverScheduleID = data.filter(
          (f) =>
            f.IsDropStop === true &&
            f.VehicleID === vehicleID &&
            f.RouteID === routeID &&
            f.StudentID === vehicleDT.StudentID &&
            f.EmployeeID === vehicleDT.EmployeeID &&
            f.StopEntryStatusID === 2 &&
            f.SheduleLogStatusID === Null
        );
        if (driverScheduleID == null) {
          driverScheduleID = data.filter(
            (f) =>
              f.IsDropStop === true &&
              f.VehicleID === vehicleID &&
              f.RouteID === routeID &&
              f.StudentID === vehicleDT.StudentID &&
              f.EmployeeID === vehicleDT.EmployeeID &&
              f.StopEntryStatusID === 2 &&
              f.SheduleLogStatusID != 1
          );
        }
        ScheduleDetails.push({
          DriverScheduleLogIID: driverScheduleID ?? 0,
          StudentID: vehicleDT.StudentID,
          EmployeeID: vehicleDT.EmployeeID,
          SheduleDate: vehicleDT.SheduleDate,
          RouteID: vehicleDT.RouteID,
          RouteStopMapID: vehicleDT.RouteStopMapID,
          VehicleID: vehicleDT.VehicleID,
          SheduleLogStatusID: null,
          StopEntryStatusID: vehicleDT.StopEntryStatusID,
          Status: "O",
          IsStudentIn: false,
          IsStaffIn: false
        });
      });
      return ScheduleDetails;
    }

    function SetScheduleDetails(scheduledData) {

      var ScheduleDetails = [];
      var distinctData = [];
      scheduledData.forEach((x) => {
        if (!distinctData.some((y) => y.VehicleID === x.VehicleID)) {
          distinctData.push({
            VehicleID: x.VehicleID,
            VehicleRegistrationNumber: x.VehicleRegistrationNumber,
            VehicleType: x.VehicleType,
          });
        }
      });
      distinctData.forEach((vehicleDT) => {
        ScheduleDetails.push({
          VehicleIID: vehicleDT.VehicleID,
          VehicleRegistrationNumber: vehicleDT.VehicleRegistrationNumber,
          VehicleType: vehicleDT.VehicleType,
          RoutesDetails: SetRouteDetails(scheduledData, vehicleDT.VehicleID),
        });
      });

      return ScheduleDetails;
    }

    function SetRouteDetails(scheduledData, xVehicleID) {
      var filterData = scheduledData.filter((f) => f.VehicleID === xVehicleID);
      var distinctData = [];
      var routeData = [];
      filterData.forEach((x) => {
        if (!distinctData.some((y) => y.RouteID === x.RouteID)) {
          distinctData.push({
            RouteID: x.RouteID,
            RouteCode: x.RouteCode,
            RouteDescription: x.RouteDescription,
          });
        }
      });
      distinctData.forEach((routeDT) => {
        routeData.push({
          RouteID: routeDT.RouteID,
          RouteCode: routeDT.RouteCode,
          VehicleType: routeDT.RouteDescription,
          Stops: Stops(filterData, xVehicleID, routeDT.RouteID),
        });
      });

      return routeData;
    }

    function SetRouteDetails(scheduledData, xVehicleID) {
      var filterData = scheduledData.filter((f) => f.VehicleID === xVehicleID);
      var distinctData = [];
      var routeData = [];
      filterData.forEach((x) => {
        if (!distinctData.some((y) => y.RouteID === x.RouteID)) {
          distinctData.push({
            RouteID: x.RouteID,
            RouteCode: x.RouteCode,
            RouteDescription: x.RouteDescription,
          });
        }
      });
      distinctData.forEach((routeDT) => {
        routeData.push({
          RouteID: routeDT.RouteID,
          RouteCode: routeDT.RouteCode,
          VehicleType: routeDT.RouteDescription,
          Stops: Stops(filterData, xVehicleID, routeDT.RouteID),
        });
      });

      return routeData;
    }

    function GetDropStops(filterData, xVehicleID, XRouteID) {

      var distinctData = [];
      var StopData = [];
      filterData.forEach((x) => {
        if (
          !distinctData.some(
            (y) => y.RouteID === x.RouteID && y.StopName === x.StopName
          )
        ) {
          distinctData.push({ RouteID: x.RouteID, StopName: x.StopName, RouteStopMapID: x.RouteStopMapID });
        }
      });
      distinctData.forEach((routeDT) => {
        StopData.push({
          RouteID: routeDT.RouteID,
          StopName: routeDT.StopName,
          StopsStudentDetails: GetDropStopsStudentDetails(
            filterData,
            xVehicleID,
            routeDT.RouteID,
            routeDT.StopName, routeDT.RouteStopMapID
          ),
          StopsStaffDetails: GetDropStopsStaffDetails(
            filterData,
            xVehicleID,
            routeDT.RouteID,
            routeDT.StopName, routeDT.RouteStopMapID
          ),
        });
      });

      return StopData;
    }

    function GetDropStopsStudentDetails(
      groupedRouteData,
      vehicleID,
      routeID,
      XStopName,
      routeStopMapID
    ) {
      var routeData;

      DropOUTscheduledData = groupedRouteData.filter(
        (f) =>
          f.VehicleID === vehicleID &&
          f.RouteID === routeID &&
          f.RouteStopMapID == routeStopMapID &&
          f.ScheduleLogType === 'DROP-OUT'

      );
      DropINscheduledData = groupedRouteData.filter(
        (f) =>
          f.VehicleID === vehicleID &&
          f.RouteID === routeID &&
          f.RouteStopMapID == routeStopMapID &&
          f.ScheduleLogType === 'DROP-IN' &&
          f.Status === 'I'
      );

      const filteredData = DropOUTscheduledData
        .filter(
          f => DropINscheduledData.some(item => item.StudentID != null && item.StudentID === f.StudentID));
      var ScheduleDetails = [];

      filteredData.forEach((x) => {
        ScheduleDetails.push({

          IsPickupStop: x.IsPickupStop,
          StudentName: x.StudentName,
          AdmissionNumber: x.AdmissionNumber,
          ClassID: x.ClassID,
          ClassName: x.ClassName,
          SectionName: x.SectionName,
          IsStudentIn: (x.Status=='A'?true:false),
          IsDropStop: true,
          DriverScheduleLogIID: x.DriverScheduleLogIID,
          StudentID: x.StudentID,
          ScheduleLogType: x.ScheduleLogType,
          Status: x.Status
        });
      });

      return ScheduleDetails;
    }

    function GetDropStopsStaffDetails(
      groupedRouteData,
      vehicleID,
      routeID,
      XStopName,
      routeStopMapID
    ) {
      var routeData;

      DropOUTscheduledData = groupedRouteData.filter(
        (f) =>
          f.VehicleID === vehicleID &&
          f.RouteID === routeID &&
          f.RouteStopMapID == routeStopMapID &&
          f.ScheduleLogType === 'DROP-OUT'

      );
      DropINscheduledData = groupedRouteData.filter(
        (f) =>
          f.VehicleID === vehicleID &&
          f.RouteID === routeID &&
          f.RouteStopMapID == routeStopMapID &&
          f.ScheduleLogType === 'DROP-IN' &&
          f.Status === 'I'
      );

      const filteredData = DropOUTscheduledData
        .filter(
          f => DropINscheduledData.some(item => item.EmployeeID != null && item.EmployeeID === f.EmployeeID));
      var ScheduleDetails = [];

      filteredData.forEach((x) => {
        ScheduleDetails.push({
          IsPickupStop: false,
          StaffID: x.EmployeeID,
          DriverScheduleLogIID: x.DriverScheduleLogIID,
          EmployeeCode: x.EmployeeCode,
          StaffName: x.StaffName,
          IsStudentIn: false,
          IsDropStop: true,
          IsStaffIn: (x.Status=='A'?true:false),
          ScheduleLogType: x.ScheduleLogType,
          Status: x.Status
        });
      });

      return ScheduleDetails;
    }


    function Stops(groupedRouteData, xVehicleID, XRouteID) {
      var filterData = groupedRouteData.filter(
        (f) => f.VehicleID === xVehicleID && f.RouteID == XRouteID
      );
      var distinctData = [];
      var StopData = [];
      filterData.forEach((x) => {
        if (
          !distinctData.some(
            (y) => y.RouteID === x.RouteID && y.StopName === x.StopName
          )
        ) {
          distinctData.push({ RouteID: x.RouteID, StopName: x.StopName });
        }
      });
      distinctData.forEach((routeDT) => {
        StopData.push({
          RouteID: routeDT.RouteID,
          StopName: routeDT.StopName,
          StopsStudentDetails: GetStopsStudentDetails(
            filterData,
            xVehicleID,
            routeDT.RouteID,
            routeDT.StopName
          ),
          StopsStaffDetails: GetStopsStaffDetails(
            filterData,
            xVehicleID,
            routeDT.RouteID,
            routeDT.StopName
          ),
        });
      });

      return StopData;
    }

    function GetStopsStudentDetails(
      groupedRouteData,
      xVehicleID,
      XRouteID,
      XStopName
    ) {
      var routeData;

      var filterData = groupedRouteData.filter(
        (f) =>
          f.VehicleID === xVehicleID &&
          f.RouteID === XRouteID &&
          f.StopName === XStopName &&
          f.StudentID != null &&
          (f.ScheduleLogType === 'PICK-IN' || f.ScheduleLogType === 'DROP-IN')
      );
      var distinctData = [];
      var StopsStudentDetails = [];
      filterData.forEach((x) => {
        if (
          !distinctData.some(
            (y) =>
              y.StudentID === x.StudentID &&
              y.DriverScheduleLogIID === x.DriverScheduleLogIID

          )
        ) {
          distinctData.push({
            IsPickupStop: x.IsPickupStop,
            StudentName: x.StudentName,
            AdmissionNumber: x.AdmissionNumber,
            ClassID: x.ClassID,
            ClassName: x.ClassName,
            SectionName: x.SectionName,
            IsStudentIn: x.IsStudentIn,
            IsDropStop: x.IsDropStop,
            DriverScheduleLogIID: x.DriverScheduleLogIID,
            StudentID: x.StudentID,
            ScheduleLogType: x.ScheduleLogType,
            Status: x.Status
          });
        }
      });

      return distinctData;
    }

    function GetStopsStaffDetails(
      groupedRouteData,
      xVehicleID,
      XRouteID,
      XStopName
    ) {
      var filterData = groupedRouteData.filter(
        (f) =>
          f.VehicleID === xVehicleID &&
          f.RouteID === XRouteID &&
          f.StopName === XStopName &&
          f.EmployeeID != null &&
          (f.ScheduleLogType === 'PICK-IN' || f.ScheduleLogType === 'DROP-IN')
      );
      var distinctData = [];
      filterData.forEach((x) => {
        if (
          !distinctData.some(
            (y) =>
              y.StaffID === x.EmployeeID &&
              y.DriverScheduleLogIID === x.DriverScheduleLogIID
          )
        ) {
          distinctData.push({
            IsPickupStop: x.IsPickupStop,
            StaffID: x.EmployeeID,
            StaffName: x.StaffName,
            IsStaffIn: x.IsStaffIn,
            IsDropStop: x.IsDropStop,
            EmployeeCode: x.EmployeeCode,
            DriverScheduleLogIID: x.DriverScheduleLogIID,
            ScheduleLogType: x.ScheduleLogType,
            Status: x.Status
          });
        }
      });

      return distinctData;
    }

    function UpdateStatusSyncedToLive(SheduleLog, IsDataSyncedToLive) {
      $indexedDB.openStore("DriverScheduleLogs", function (result) {
        result
          .upsert({
            DriverScheduleLogIID: DriverScheduleLogIID,
            SheduleLogStatusID: SheduleLogStatusID,
            StopEntryStatusID: StopEntryStatusID,
            Status: Status,
            IsDataSyncedToLive: SyncStatus,
          })
          .then(function (e) { });
      });
    }
  },
]);
