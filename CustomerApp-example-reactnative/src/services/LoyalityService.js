import apiClient from "./apiClient";
import callContextCache from "../utils/callContextCache";

const LoyalityService = {
  LoyaltyMinimumRedeem: async () => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(`/ecommerce/GetSettings?settingcodes=MinimumPointsForRedemption,LoyaltyMinimumRedeemAmount`, {
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
  GetCustomerSettings: async () => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(`/useraccount/GetCustomerSettings`, {
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
  GetCustomerLastTrnsactions: async (payload) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/useraccount/GetCustomerLastTrnsactions`,
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : "",
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

export default LoyalityService;
