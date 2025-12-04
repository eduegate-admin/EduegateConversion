import React, { createContext, useContext, useEffect, useState } from "react";
import { useWindowDimensions, Dimensions } from "react-native";

export const DimensionContext = createContext();

export const useDimensionContext = () => useContext(DimensionContext);

export const DimensionContextProvider = ({ children }) => {
  const dimensions = useWindowDimensions();
  const initHeight = Dimensions.get("window").height;
  const initWidth = Dimensions.get("window").width;

  const [windowWidth, setWindowWidth] = useState(initWidth);
  const [windowHeight, setWindowHeight] = useState(initHeight);
  const [isPortrait, setIsPortrait] = useState(false);

  const checkIsPortrait = () => {
    const screenDim = Dimensions.get("screen");
    return screenDim.height >= screenDim.width;
  };

  useEffect(() => {
    setIsPortrait(checkIsPortrait());

    // ⚠️ RN 0.81 uses the new event listener API
    const subscription = Dimensions.addEventListener("change", () => {
      setIsPortrait(checkIsPortrait());
    });

    return () => {
      subscription?.remove?.(); // clean up
    };
  }, []);

  useEffect(() => {
    setItem();
  }, [dimensions]);

  const setItem = () => {
    const { height, width } = dimensions;
    setWindowHeight(height);
    setWindowWidth(width);
  };

  return (
    <DimensionContext.Provider
      value={{
        windowWidth,
        windowHeight,
        isPortrait,
      }}
    >
      {children}
    </DimensionContext.Provider>
  );
};
