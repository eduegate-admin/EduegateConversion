import apiClient from "./apiClient";
import callContextCache from "../utils/callContextCache";

const AppService = {
  GetCurrentAppVersion: async (currentAppVersion, appID) => {
    try {
      const callContext = await callContextCache.get();
      const response = await apiClient.get(
        `/appdata/CheckAppVersion?currentAppVersion=${currentAppVersion}&appID=${appID}`,
        {
          headers: {
            "Content-Type": "application/json",
            callContext: JSON.stringify(callContext) || "",
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default AppService;
