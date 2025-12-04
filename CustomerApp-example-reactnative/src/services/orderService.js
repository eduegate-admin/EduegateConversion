import apiClient from "./apiClient";
import callContextCache from "../utils/callContextCache";

const OrderService = {
  generateOrder: async (payloadOrder) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.post(
        `/appdata/GenerateOrder`,
        payloadOrder,
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
  getOrderHistory: async () => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/appdata/GetOrderHistoryDetails?pageSize=12&pageNo=1`,
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
  getOrderHistoryDetails: async (ID) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/appdata/GetOrderHistoryItemDetail?headID=${ID}`,
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
  ReOrder: async (cartID, ID) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/appdata/ReOrder?CartID=${cartID}&headID=${ID}`,
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
  CancelOrder: async (ID) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/ecommerce/CancelOrder?headID=${ID}`,
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
  // ecommerce/GetCartActivities?cartID=113437&type=undefined
  getCartActivities: async (CartID) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/ecommerce/GetCartActivities?cartID=${CartID}&type=undefined`,
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
  getCartActivitiesAction: async (payload) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.post(
        `/ecommerce/UpdateCartActivitiesAction`,
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
    } catch (error) {
      throw error;
    }
  },
  GetComments: async (entityTypeID, referenceID) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/ecommerce/GetComments?entityTypeID=${entityTypeID}&referenceID=${referenceID}`,
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
  ReadContentsByID: async (ContentID) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/contentfile/ReadContentsByID?contentID=${ContentID}`,
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : "",
            "Content-Type": "application/json, text/plain, */*",
            callContext: JSON.stringify(callContext) || "",
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  SaveComment: async (payload) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.post(`/ecommerce/SaveComment`, payload, {
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
  DeleteComment: async (commentID) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.delete(
        `/ecommerce/DeleteComment?commentID=${commentID}`,
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
  emailInvoice: async (orderID, email) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.post(
        `/appdata/EmailInvoice`,
        {
          orderID: orderID,
          email: email,
        },
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

export default OrderService;
