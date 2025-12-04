import React, { createContext, useContext, useEffect, useState } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import AppService from "../services/AppService";
import appSettings from "../../Client/appSettings";
import callContextCache from "../utils/callContextCache";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AppContext = createContext();
const client = process.env.CLIENT;
export const AppProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    isLoading: true,
    isNewUser: false,
  });
  const [appUpdate, setAppUpdate] = useState({ updated: null, major: null });

  useEffect(() => {
    AppUpdate();
    const checkToken = async () => {
      try {
        // const token = await callContextCache.getAuthToken();
        const token = await AsyncStorage.getItem("authToken");
        setAuthState({ token, isLoading: false, isNewUser: false });
      } catch (error) {
        console.error("Error checking auth token:", error);
      }
    };
    checkToken();
  }, []);

  const AppUpdate = async () => {
    try {
      const response = await AppService.GetCurrentAppVersion(
        appSettings[client]?.AppVersion,
        ""
      );
      if (response) {
        setAppUpdate({
          updated: response?.data?.IsUpdated,
          major: response?.data?.IsMajor,
        });
      }
    } catch (error) {
      console.error("Error fetching AppUpdate:", error);
    }
  };

  const login = async (token, isNewUser = false) => {
    await AsyncStorage.setItem("authToken", token);
    await callContextCache.setAuthToken(token);
    setAuthState({ token, isLoading: false, isNewUser });
  };

  const logout = async () => {
    await callContextCache.clearAuthToken();
    setAuthState({ token: null, isLoading: false, isNewUser: false });
  };

  const value = { ...authState, login, logout, appUpdate };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
export const useAppContext = () => useContext(AppContext);
