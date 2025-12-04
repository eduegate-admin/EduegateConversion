import apiClient from "./apiClient";
import callContextCache from "../utils/callContextCache";

const CategoryService = {
  getCategoriesByBoilerplage: async (payload) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);
      const languageCode = payload?.LanguageCode;
      if (languageCode && callContext) {
        callContext.LanguageCode = languageCode;
      }
      console.log("callContext", callContext);
      const response = await apiClient.post(
        `/appdata/GetCategoriesByBoilerplage`,
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
  getAllCategories: async (languageCode = null) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      // Update callContext with language code if provided
      if (languageCode && callContext) {
        callContext.LanguageCode = languageCode;
      }

      const response = await apiClient.get(`/appdata/GetAllCategories`, {
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

export default CategoryService;
