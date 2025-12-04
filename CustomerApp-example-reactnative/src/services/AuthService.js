import apiClient from "./apiClient";
import callContextCache from "../utils/callContextCache";

const AuthService = {
  getAutoLoginFlag: async () => {
    try {
      const response = await apiClient.get(
        `/ecommerce/GetSetting?settingCode=DisableOTPScreen`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  Prefixes: async () => {
    try {
      const response = await apiClient.get(
        `/ecommerce/GetMobileNumberPrefixes`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  getUserByMobile: async (fullMobileNumber) => {
    try {
      const response = await apiClient.get(
        `/useraccount/GetUserByMobileNumber?mobileNumber=${fullMobileNumber}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  sendOtp: async (fullMobileNumber) => {
    try {
      const response = await apiClient.get(
        `/useraccount/SendOTP?mobileNumber=${fullMobileNumber}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  verifyOtp: async (mobileNumber, enteredOtp) => {
    try {
      const response = await apiClient.get(
        `/useraccount/ValidateOTP?mobileNumber=${mobileNumber}&otpText=${enteredOtp}&emailID=&deviceId=6b356755575fce31`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  Register: async (payload, authToken) => {
    try {
      const callContext = await callContextCache.get();
      const response = await apiClient.post(`/appdata/Register`, payload, {
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
   GetSyncSettings: async (authToken) => {
    try {
      const callContext = await callContextCache.get();
      const response = await apiClient.get(
        `/offlinedbsync/GetSyncSettings`,
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
     ChangeMobilerNumber: async (authToken, newMobile) => {
    try {
      const callContext = await callContextCache.get();
      const response = await apiClient.get(
        `/useraccount/ChangeMobilerNumber?mobileNumber=${newMobile}`,
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
  registerToken: async (token, authToken) => {
    try {
      const callContext = await callContextCache.get();
      const response = await apiClient.get(
        `/useraccount/RegisterUserDevice?token=${token}`,
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

export default AuthService;
