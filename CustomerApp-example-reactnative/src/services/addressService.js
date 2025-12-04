import apiClient from "./apiClient";
import callContextCache from "../utils/callContextCache";

const AddressService = {
  getShippingAddress: async () => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/appdata/GetLastShippingAddress?addressID=0`,
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
  GetShippingAddressContacts: async () => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/appdata/GetShippingAddressContacts`,
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
  GetBillingAddress: async (parsedContext, authToken) => {
    try {
      const response = await apiClient.get(
        `/appdata/GetBillingAddress`,
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : "",
            "Content-Type": "application/json",
            callContext: JSON.stringify(parsedContext) || "",
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
GetAddressByContactID: async (contactID) => {
  try {
    // console.log('SERVICE: passed contactID:', contactID);

    const [callContext, authToken] = await Promise.all([
      callContextCache.get(),
      callContextCache.getAuthToken(),
    ]);

    const response = await apiClient.get(
      `/appdata/GetAddressByContactID?addressID=${contactID}`,
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
  RemoveContact: async (contactID) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/appdata/RemoveContact?contactID=${contactID}`,
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
  updateAddressInShoppingCart: async (payload) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.post(
        `/appdata/UpdateAddressinShoppingCart`,
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
  AddContact: async (payload) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.post(`/appdata/AddContact`, payload, {
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

  SavePersonalSettings: async (payload) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.post(
        `/appdata/SavePersonalSettings`,
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

  GetAreaByCityID: async (cityID = null) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const endpoint = cityID
        ? `/appdata/GetAreaByCityID?cityID=${cityID}`
        : `/appdata/GetAreaByCityID`;

      const response = await apiClient.get(endpoint, {
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

export default AddressService;
