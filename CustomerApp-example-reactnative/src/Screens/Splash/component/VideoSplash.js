import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Video } from "expo-av";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import appSettings from "../../../../Client/appSettings";

const client = process.env.CLIENT;
const AppSettings = appSettings[client];
const targetScreen = AppSettings?.screens?.Welcome_screen;

const VideoSplash = ({ onFinish }) => {
  const navigation = useNavigation();
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const [styles, setStyle] = useState(ClientStyles(client, "Splash"));

  // Load and set client-specific styles
  useEffect(() => {
    const clientStyle = ClientStyles(client, "Splash");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("❌ Client style not found for:", client);
    }
  }, [client]);

  // Video playback + navigation handling
  useFocusEffect(
    useCallback(() => {
      // Reset video playback to start
      videoRef.current?.setPositionAsync(0);
      videoRef.current?.playAsync();

      // Navigate after video duration (3.4s)
      timerRef.current = setTimeout(() => {
        onFinish(); 
      }, 3400);

      // Cleanup timer when unmounting or leaving screen
      return () => clearTimeout(timerRef.current);
    }, [onFinish])
  );

  const splashVideo ="" ;

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require(`../../../assets/images/client/${client}/spashscreenvideo.mp4`)}
        style={styles.video}
        resizeMode="contain"
        shouldPlay
        isLooping={false}
        useNativeControls={false}
        onError={(error) => console.error("Video playback error:", error)}
      />
    </View>
  );
};

export default VideoSplash;
