// /search/GetFacetSearch?searchText=
import apiClient from "./apiClient";
import callContextCache from "../utils/callContextCache";

const SearchService = {
  GetFacetSearch: async (searchText) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/search/GetFacetSearch?searchText=${searchText}`,
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
  GetProductSearch: async (
    pageIndex,
    pageSize,
    searchText,
    searchVal,
    searchBy,
    sortBy,
    isCategory,
    pageType
  ) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/appdata/GetProductSearch?pageIndex=${pageIndex}&pageSize=${pageSize}&searchText=${searchText}&searchVal=${searchVal}&searchBy=${searchBy}&sortBy=${sortBy}&isCategory=${isCategory}&pageType=${pageType}`,
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

export default SearchService;
