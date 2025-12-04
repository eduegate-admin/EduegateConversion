import apiClient from "./apiClient";
import callContextCache from "../utils/callContextCache";

const bookletService = {
  GetBooklets: async (branchID = "") => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(`/marketing/GetBooklets?branchID=${branchID}`, {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : "",
          "Content-Type": "application/json",
          callContext: JSON.stringify(callContext) || "",
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default bookletService;
