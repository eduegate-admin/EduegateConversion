  app.config(function ($indexedDBProvider) {    
    $indexedDBProvider
      .connection('eduegateDB')
      .upgradeDatabase(1, function(event, db, tx){
        var objStore = db.createObjectStore('DriverScheduleLogs', {keyPath: 'DriverScheduleLogIID'});
        // objStore.createIndex('DriverScheduleLogIID_idx', 'DriverScheduleLogIID', {unique: false});
        objStore.createIndex('StudentID_idx', 'StudentID', {unique: false});
        objStore.createIndex('EmployeeID_idx', 'EmployeeID', {unique: false});
        objStore.createIndex('SheduleDate_idx', 'SheduleDate', {unique: false});
        objStore.createIndex('RouteID_idx', 'RouteID', {unique: false});
        objStore.createIndex('RouteStopMapIDidx', 'RouteStopMapID', {unique: false});
        objStore.createIndex('VehicleID_idx', 'VehicleID', {unique: false});
        objStore.createIndex('SheduleLogStatusID_idx', 'SheduleLogStatusID', {unique: false});
        objStore.createIndex('StopEntryStatusID_idx', 'StopEntryStatusID', {unique: false});
        objStore.createIndex('Status_idx', 'Status', {unique: false});
        objStore.createIndex('VehicleRegistrationNumber_idx', 'VehicleRegistrationNumber', {unique: false});
        objStore.createIndex('VehicleType_idx', 'VehicleType', {unique: false});
        objStore.createIndex('RouteCode_idx', 'RouteCode', {unique: false});
        objStore.createIndex('StopName_idx', 'StopName', {unique: false});
        objStore.createIndex('AdmissionNumber_idx', 'AdmissionNumber', {unique: false});
        objStore.createIndex('StudentName_idx', 'StudentName', {unique: false});
        objStore.createIndex('ClassName_idx', 'ClassName', {unique: false});
        objStore.createIndex('SectionName_idx', 'SectionName', {unique: false});
        objStore.createIndex('IsStudentIn_idx', 'IsStudentIn', {unique: false});
        objStore.createIndex('EmployeeCode_idx', 'EmployeeCode', {unique: false});
        objStore.createIndex('StaffName_idx', 'StaffName', {unique: false});
        objStore.createIndex('IsStaffIn_idx', 'IsStaffIn', {unique: false});
        objStore.createIndex('IsPickupStop_idx', 'IsPickupStop', {unique: false});
        objStore.createIndex('IsDropStop_idx', 'IsDropStop', {unique: false});
        objStore.createIndex('IsDataSyncedToLive_idx', 'IsDataSyncedToLive', {unique: false});
        objStore.createIndex('LoginID_idx', 'LoginID', {unique: false});
        objStore.createIndex('ScheduleLogType_idx', 'ScheduleLogType', {unique: false});
        
      });
  });