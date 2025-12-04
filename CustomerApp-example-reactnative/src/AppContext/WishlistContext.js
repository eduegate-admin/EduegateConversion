import React, { createContext, useContext, useState, useEffect } from "react";
import ProductService from "../services/productService";
import { useAppContext } from "./AppContext";
import wishlistManager from "../services/wishlistManager";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistData, setWishlistData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { token } = useAppContext();

  // Load wishlist data once when user is authenticated
  const loadWishlist = async () => {
    if (!token || isLoaded || isLoading) return;

    try {
      setIsLoading(true);
      const response = await ProductService.getSaveForLater();
      setWishlistData(response.data || []);
      setIsLoaded(true);
      console.log("✅ Wishlist loaded successfully");
    } catch (error) {
      console.error("❌ Error loading wishlist:", error);
      setWishlistData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset wishlist on logout
  useEffect(() => {
    if (!token) {
      setWishlistData([]);
      setIsLoaded(false);
      setIsLoading(false);
    } else if (!isLoaded && !isLoading) {
      loadWishlist();
    }
  }, [token]);

  // Refresh wishlist from server
  const refreshWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await ProductService.getSaveForLater();
      setWishlistData(response.data || []);
      console.log("✅ Wishlist refreshed successfully");
    } catch (error) {
      console.error("❌ Error refreshing wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register callbacks with wishlist manager
  useEffect(() => {
    wishlistManager.registerCallbacks(
      addToWishlist,
      removeFromWishlist,
      refreshWishlist
    );

    // Cleanup on unmount
    return () => {
      wishlistManager.clearCallbacks();
    };
  }, []);

  // Add item to wishlist locally
  const addToWishlist = (item) => {
    const exists = wishlistData.find(
      (existingItem) => existingItem.SKUID === item.SKUID
    );
    if (!exists) {
      setWishlistData((prev) => [...prev, item]);
    }
  };

  // Remove item from wishlist locally
  const removeFromWishlist = (skuId) => {
    setWishlistData((prev) => prev.filter((item) => item.SKUID !== skuId));
  };

  // Get wishlist data (no API call)
  const getWishlist = () => {
    return { data: wishlistData };
  };

  // Check if item is in wishlist
  const isInWishlist = (skuId) => {
    return wishlistData.some((item) => item.SKUID === skuId);
  };

  const value = {
    wishlistData,
    isLoading,
    isLoaded,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loadWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
