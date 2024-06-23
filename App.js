import { StatusBar } from "expo-status-bar";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/screens/Home";
import Login from "./src/screens/Login";
// import * as SplashScreen from 'expo-splash-screen'
// import * as Font from 'expo-font'
import Welcome from "./src/screens/Welcome";
import ChartRoom from "./src/screens/ChartRoom";
import HeaderMain from "./src/components/Header";
import Message from "./src/screens/Message";
import GlobalState from "./src/contexts/index";
import { SocketProvider } from "./src/contexts/SocketHandler";
import { VideoProvider } from "./src/contexts/VideoContexts";
import { GlobalContext } from "./src/contexts/index";
import { DatabaseProvider } from "./src/contexts/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Video from "./src/screens/Video";
// import Toast from 'react-native-toast-message';
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from '@expo/vector-icons';
import Logo from "./assets/Logo.png";
import Audio from "./src/screens/Audio";
// For Ontime Delivery
import DHome from "./src/screens/DeliveryScreen/Home"


const Stack = createNativeStackNavigator();


const toastConfig = {
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "pink" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "400",
      }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 17,
      }}
      text2Style={{
        fontSize: 15,
      }}
    />
  ),
  /*
    Or create a completely new type - `tomatoToast`,
    building the layout from scratch.

    I can consume any custom `props` I want.
    They will be passed when calling the `show` method (see below)
  */
  tomatoToast: ({ text1, text2, names, props }) => (
    <View
      style={{
        height: 60,
        width: "80%",
        backgroundColor: "black",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 30,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
    >
      <View
        style={{
          width: "50%",
          flexDirection: "row",
          // backgroundColor: "blue",
          height: "auto",
          alignItems:"center",
          gap:10
          // paddingBottom:10
        }}
      >
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 50,
            borderWidth: 2,
            borderColor: "white",
          }}
        >
          <Image
            source={Logo}
            style={{ borderRadius: 50, width: "90%", height: "100%" }}
            resizeMode="stretch"
          />
        </View>
        <Text style={{color:"white"}}>{names}</Text>
      </View>

      <View style={{
          width: "40%",
          flexDirection: "row",
          // backgroundColor: "blue",
          height: "auto",
          alignItems:"center",
          justifyContent:"space-between",
          paddingHorizontal:15
          // paddingBottom:10
        }}>
        <TouchableOpacity onPress={props.onPress}>
          
          <Ionicons name="call" size={24} color="green" />
        </TouchableOpacity>

        <TouchableOpacity onPress={props.onPresst}>
  
          <MaterialIcons name="call-end" size={34} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  ),
};


export default function App() {
  useEffect(() => {
    
    getData()
   

  }, [])

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('MyDetailed');
      const  vsrs =jsonValue != null ? JSON.parse(jsonValue) : null;

      console.log(vsrs.Tel)
    } catch (e) {
      // error reading value
    }
  };
  return (
    <GlobalState>
      <DatabaseProvider>
        <NavigationContainer>
          <SocketProvider>
            <Stack.Navigator>
            <Stack.Screen name="Welcome" component={Welcome} />
            
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Login" component={Login} />
              {/* <Stack.Screen name="Welcome" component={Welcome} /> */}
              <Stack.Screen
                name="ChartRoom"
                component={ChartRoom}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="Message"
                component={Message}
                options={{
                  headerShown: false,
                }}
              />

              <Stack.Screen name="Tv" component={Video} />

              <Stack.Screen name="Vioce" component={Audio} />

              <Stack.Screen name="DHome" component={DHome} />
            </Stack.Navigator>
            <Toast config={toastConfig} />
          </SocketProvider>
        </NavigationContainer>
      </DatabaseProvider>
    </GlobalState>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
