import apiClient from "./apiClient";
import callContextCache from "../utils/callContextCache";

const UserService = {
  getUserDetails: async () => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(`/appdata/GetUserDetails`, {
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
  getUserProfile: async (UserID) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const uid =
        UserID ?? callContext?.UserId ?? callContext?.LoginID ?? null;

      if (!uid) {
        throw new Error("UserID is undefined. Cannot fetch user profile.");
      }

      const response = await apiClient.get(
        `/useraccount/GetUserProfile?id=${uid}`,
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
  Logout: async () => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(`/appdata/Logout`, {
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
  deleteAccountRequest: async (payload) => {
    const [callContext, authToken] = await Promise.all([
      callContextCache.get(),
      callContextCache.getAuthToken(),
    ]);

    const response = await apiClient.post(
      `/appdata/CustomerFeedBack`,
      payload,
      {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : "",
          "Content-Type": "application/json",
          callContext: JSON.stringify(callContext) || "",
        },
      }
    );
    return response;
  },
};

export default UserService;
