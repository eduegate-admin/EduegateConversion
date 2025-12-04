import { useWishlist } from "../AppContext/WishlistContext";
import wishlistService from "../services/wishlistService";

export const useWishlistActions = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlist } =
    useWishlist();

  const addToSaveForLater = async (SKUID) => {
    try {
      // Call API first
      const response = await wishlistService.AddSaveForLater(SKUID);

      // If successful, update local state
      if (
        response &&
        response.success !== false &&
        response.status !== "error"
      ) {
        addToWishlist({ SKUID });
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const removeFromSaveForLater = async (SKUID) => {
    try {
      // Call API first
      const response = await wishlistService.RemoveSaveForLater(SKUID);

      // If successful, update local state
      if (
        response &&
        response.success !== false &&
        response.status !== "error"
      ) {
        removeFromWishlist(SKUID);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const getSaveForLater = () => {
    // Return cached data from context (no API call)
    return getWishlist();
  };

  return {
    addToSaveForLater,
    removeFromSaveForLater,
    getSaveForLater,
    isInWishlist,
  };
};
