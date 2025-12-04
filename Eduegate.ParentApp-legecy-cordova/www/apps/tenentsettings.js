app.factory("tenantSettings", function ($http) {
  // List your tenants here; you could fetch from an API instead
  var tenants = {
    1: { id: 1, name: "School A" },
    2: { id: 2, name: "School B" },
    3: { id: 3, name: "School C" }
  };

  // Default tenant
  var currentTenantId = 1;

  return {
    getTenant: function () {
      return tenants[currentTenantId];
    },
    setTenant: function (tenantId) {
      if (tenants[tenantId]) {
        currentTenantId = tenantId;
        // Persist across reloads if desired
        localStorage.setItem("selectedTenant", tenantId);
      } else {
        console.warn("Unknown tenant:", tenantId);
      }
    },
    listTenants: function () {
      return Object.values(tenants);
    }
  };
});
