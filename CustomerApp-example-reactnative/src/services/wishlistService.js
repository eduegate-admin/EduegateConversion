import apiClient from "./apiClient";
import callContextCache from "../utils/callContextCache";
import wishlistManager from "./wishlistManager";

const wishlistService = {
  AddSaveForLater: async (SKUID) => {
    try {
      if (!SKUID) return;

      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/appdata/AddSaveForLater?skuID=${SKUID}`,
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : "",
            "Content-Type": "application/json",
            callContext: JSON.stringify(callContext) || "",
          },
        }
      );

      // Update wishlist context if API call was successful
      if (
        response &&
        response.success !== false &&
        response.status !== "error"
      ) {
        // Refresh the entire wishlist to get complete product details
        wishlistManager.refreshWishlist();
      }

      return response;
    } catch (error) {
      throw error;
    }
  },
  RemoveSaveForLater: async (SKUID) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/appdata/RemoveSaveForLater?skuID=${SKUID}`,
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : "",
            "Content-Type": "application/json",
            callContext: JSON.stringify(callContext) || "",
          },
        }
      );

      // Update wishlist context if API call was successful
      if (
        response &&
        response.success !== false &&
        response.status !== "error"
      ) {
        // Refresh the entire wishlist to ensure data consistency
        wishlistManager.refreshWishlist();
      }

      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default wishlistService;
