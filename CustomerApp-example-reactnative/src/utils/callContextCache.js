import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * CallContext and AuthToken Cache Manager
 * Provides a singleton cache for callContext and authToken to avoid repeated AsyncStorage reads
 */
class CallContextCache {
  constructor() {
    this.cache = null;
    this.authToken = null;
    this.isLoading = false;
    this.isLoadingAuth = false;
    this.loadPromise = null;
    this.authLoadPromise = null;
  }

  /**
   * Get callContext from cache or AsyncStorage, with optional recreation callback
   * @param {Function} recreateCallback - Optional function to call if no cached context found
   * @returns {Promise<Object|null>} Parsed callContext object
   */
  async get(recreateCallback = null) {
    // Return cached value if available
    if (this.cache !== null) {
      return this.cache;
    }

    // If already loading, wait for the existing load operation
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading from AsyncStorage
    this.isLoading = true;
    this.loadPromise = this._loadFromStorage(recreateCallback);

    try {
      const result = await this.loadPromise;
      return result;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  /**
   * Load callContext from AsyncStorage
   * @private
   */
  async _loadFromStorage() {
    try {
      const storedContext = await AsyncStorage.getItem("@CallContext");
      if (storedContext) {
        this.cache = JSON.parse(storedContext);
        return this.cache;
      }

      return null;
    } catch (error) {
      console.error("Error loading callContext from AsyncStorage:", error);
      return null;
    }
  }

  /**
   * Get authToken from cache or AsyncStorage
   * @returns {Promise<string|null>} Auth token string
   */
  async getAuthToken() {
    // Return cached value if available
    if (this.authToken !== null) {
      return this.authToken;
    }

    // If already loading, wait for the existing load operation
    if (this.isLoadingAuth && this.authLoadPromise) {
      return this.authLoadPromise;
    }

    // Start loading from AsyncStorage
    this.isLoadingAuth = true;
    this.authLoadPromise = this._loadAuthFromStorage();

    try {
      const result = await this.authLoadPromise;
      return result;
    } finally {
      this.isLoadingAuth = false;
      this.authLoadPromise = null;
    }
  }

  /**
   * Load authToken from AsyncStorage
   * @private
   */
  async _loadAuthFromStorage() {
    try {
      const token = await AsyncStorage.getItem("authToken");
      this.authToken = token;
      return token;
    } catch (error) {
      console.error("Error loading authToken from AsyncStorage:", error);
      return null;
    }
  }

  /**
   * Update the cache with new callContext and store to AsyncStorage
   * @param {Object} newContext - New callContext object
   */
  async set(newContext) {
    try {
      this.cache = newContext;
      await AsyncStorage.setItem("@CallContext", JSON.stringify(newContext));
    } catch (error) {
      console.error("Error storing callContext to AsyncStorage:", error);
    }
  }

  /**
   * Update the auth token cache and store to AsyncStorage
   * @param {string} token - New auth token
   */
  async setAuthToken(token) {
    try {
      this.authToken = token;
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error storing authToken to AsyncStorage:", error);
    }
  }

  /**
   * Clear the cache and AsyncStorage
   */
  async clear() {
    try {
      this.cache = null;
      await AsyncStorage.removeItem("@CallContext");
    } catch (error) {
      console.error("Error clearing callContext from AsyncStorage:", error);
    }
  }

  /**
   * Clear the auth token cache and AsyncStorage
   */
  async clearAuthToken() {
    try {
      this.authToken = null;
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error clearing authToken from AsyncStorage:", error);
    }
  }

  /**
   * Clear both caches and AsyncStorage
   */
  async clearAll() {
    try {
      this.cache = null;
      this.authToken = null;
      await AsyncStorage.removeItem("@CallContext");
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }

  /**
   * Force refresh from AsyncStorage
   * @returns {Promise<Object|null>}
   */
  async refresh() {
    this.cache = null;
    return this.get();
  }

  /**
   * Force refresh auth token from AsyncStorage
   * @returns {Promise<string|null>}
   */
  async refreshAuthToken() {
    this.authToken = null;
    return this.getAuthToken();
  }
}

// Export singleton instance
export default new CallContextCache();
