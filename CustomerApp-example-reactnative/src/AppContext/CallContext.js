import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import appSettings from "../../Client/appSettings";
import callContextCache from "../utils/callContextCache";

const CallContext = createContext();
const client = process.env.CLIENT;

export const CallContextProvider = ({ children }) => {
  const AppSettings = appSettings[client];

  // const [userName, setUserName] = useState("");
  // const [mobileNo1, setMobileNo1] = useState("");
  const [otp, setOTP] = useState("");
  // const [loginID, setLoginID] = useState("");
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  // const [customerID, setCustomerID] = useState("");
  const [callContext, setCallContext] = useState(null);

  // const fullName = `${firstName} ${lastName}`.trim();

  // Fetch device IP
  const fetchIPAddress = async () => {
    try {
      const ip = await Network.getIpAddressAsync();
      return ip;
    } catch (error) {
      console.error("❌ Failed to get device IP:", error);
    }
  };

  // Load user data from AsyncStorage
  // const loadUserData = async () => {
  //   try {
  //     const storedUser = await AsyncStorage.getItem("userData");
  //     const userData = storedUser ? JSON.parse(storedUser) : null;

  //     if (userData) {
  //       setUserName(userData?.LoginEmailID || "");
  //       setLoginID(userData?.LoginID || "");
  //       setCustomerID(userData.Customer?.CustomerIID || "");
  //       setMobileNo1(userData.Customer?.TelephoneNumber || "");
  //       setFirstName(userData.Customer?.FirstName || "");
  //       setLastName(userData.Customer?.LastName || "");
  //     }
  //   } catch (error) {
  //     console.error("❌ Error fetching userData:", error);
  //   }
  // };

  // Build callContext object
  // const createCallContextObject = () => ({
  //   CompanyID: "",
  //   EmailID: userName || "",
  //   IPAddress: ipAddress || "",
  //   LoginID: loginID || "",
  //   GUID: "",
  //   CurrencyCode: AppSettings.DefaultCurrency,
  //   UserId: loginID || "",
  //   ApiKey: "",
  //   UserRole: "",
  //   UserClaims: "",
  //   LanguageCode: "",
  //   SiteID: "",
  //   UserReferenceID: "",
  //   AppVersion: "3.6.0",
  //   IsShareHolder: false,
  //   EmiratesID: null,
  //   MobileNumber: mobileNo1 || "",
  //   OTP: otp || "",
  //   IsGuestUser: false,
  //   IsProfileCompleted: true,
  //   CustomerID: customerID || "",
  //   IsCustomerAdmin: false,
  //   LoginEmailID: userName || "",
  //   LoggedInUser: fullName || "",
  //   ClientTimeZone: -330,
  //   BranchIID: "",
  // });

  // Store callContext in AsyncStorage
  const storeCallContext = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("userData");
      const userData = storedUser ? JSON.parse(storedUser) : null;
      const ipAddress = await fetchIPAddress();

      // Get stored language preference
      const storedLanguage = await AsyncStorage.getItem("appLanguage");

      const context = {
        CompanyID: "",
        EmailID: userData?.LoginEmailID,
        IPAddress: ipAddress,
        LoginID: userData?.LoginID,
        GUID: "",
        CurrencyCode: AppSettings?.DefaultCurrency,
        UserId: userData?.LoginID,
        ApiKey: "",
        UserRole: "",
        UserClaims: "",
        LanguageCode: storedLanguage || "en",
        SiteID: "",
        UserReferenceID: "",
        AppVersion: AppSettings?.AppVersion,
        IsShareHolder: false,
        EmiratesID: null,
        MobileNumber: userData?.Customer?.TelephoneNumber,
        OTP: otp || "",
        IsGuestUser: false,
        IsProfileCompleted: userData?.IsProfileCompleted,
        CustomerID: userData?.Customer?.CustomerIID,
        IsCustomerAdmin: false,
        LoginEmailID: userData?.LoginEmailID,
        LoggedInUser: userData?.LoginUserID,
        ClientTimeZone: -330,
        BranchIID: userData?.DefaultBranchID,
      };
      await callContextCache.set(context);
      await AsyncStorage.setItem("@CallContext", JSON.stringify(context));
      setCallContext(context);
    } catch (error) {
      console.error("❌ Failed to store CallContext:", error);
    }
  };

  // Clear callContext and related data
  const clearCallContext = async () => {
    try {
      await callContextCache.clearAll();
      await AsyncStorage.removeItem("userData");
      setCallContext(null);
      // setMobileNo1("");
      setOTP("");
      // setLoginID("");
      // setUserName("");
      // setFirstName("");
      // setLastName("");
      // setCustomerID("");
    } catch (error) {
      console.error("❌ Failed to clear CallContext:", error);
    }
  };

  // Initialize user data + device IP
  useEffect(() => {
    const initialize = async () => {
      const parsedContext = await callContextCache.get();
      if (
        !parsedContext ||
        !parsedContext?.MobileNumber ||
        parsedContext.MobileNumber.trim() === "" ||
        !parsedContext?.EmailID ||
        parsedContext.EmailID.trim() === ""
      ) {
        await storeCallContext();
      } else {
        setCallContext(parsedContext);
      }
    };
    initialize();
  }, []);

  return (
    <CallContext.Provider
      value={{
        callContext,
        setOTP,
        setCallContext,
        // setMobileNo1,
        // loadUserData,
        fetchIPAddress,
        // createCallContextObject,
        storeCallContext,
        clearCallContext,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

// Custom hook to use call context
export const useCallContext = () => useContext(CallContext);
