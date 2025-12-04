// Wishlist manager for updating context from services
class WishlistManager {
  constructor() {
    this.addToWishlistCallback = null;
    this.removeFromWishlistCallback = null;
    this.refreshWishlistCallback = null;
  }

  // Register callback functions from the context
  registerCallbacks(addCallback, removeCallback, refreshCallback) {
    this.addToWishlistCallback = addCallback;
    this.removeFromWishlistCallback = removeCallback;
    this.refreshWishlistCallback = refreshCallback;
  }

  // Update wishlist after adding item
  addItem(item) {
    if (this.addToWishlistCallback) {
      this.addToWishlistCallback(item);
    }
  }

  // Update wishlist after removing item
  removeItem(skuId) {
    if (this.removeFromWishlistCallback) {
      this.removeFromWishlistCallback(skuId);
    }
  }

  // Refresh entire wishlist from server
  refreshWishlist() {
    if (this.refreshWishlistCallback) {
      this.refreshWishlistCallback();
    }
  }

  // Clear callbacks (on unmount)
  clearCallbacks() {
    this.addToWishlistCallback = null;
    this.removeFromWishlistCallback = null;
    this.refreshWishlistCallback = null;
  }
}

// Create singleton instance
const wishlistManager = new WishlistManager();

export default wishlistManager;
