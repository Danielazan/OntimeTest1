import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Logo from "../../assets/Logo.png";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import CheckBox from "../components/Checkbox";
import { GlobalContext } from "../contexts";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Home = ({ navigation }) => {
  const { height } = useWindowDimensions();

  const {
    id,
    setId,
    fristName,
    setFristName,
    PassWord,
    setPassWord,
    MiddleName,
    setMiddleName,
    LastName,
    setLastName,
    Address,
    setAddress,
    Country,
    setCountry,
    City,
    setCity,
    State,
    setState,
    Email,
    setEmail,
    Nin,
    setNin,
    Tel,
    setTel,
    Gender,
    setGender,
    UserName,
    setUserName,
    Comfirm,
    setComfirm,
  } = useContext(GlobalContext);


  useEffect(() => {
    getData();
    // const jsonValue = AsyncStorage.getItem('MyDetailed');
  }, []);

  //   removeValue = async () => {
  //   try {
  //     await AsyncStorage.removeItem('MyDetailed')
  //   } catch(e) {
  //     // remove error
  //   }

  //   console.log('Done.')
  // }
  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("MyDetailed");
      const vsrs = jsonValue != null ? JSON.parse(jsonValue) : null;

      console.log(vsrs);
    } catch (e) {
      // error reading value
    }
  };

  // const [UserName, setUserName] = useState("")

  const Register = async () => {
    const value = {
      fristName: fristName,
      PassWord: PassWord,
      MiddleName: MiddleName,
      LastName: LastName,
      Address: Address,
      Country: Country,
      City: City,
      State: State,
      Email: Email,
      Nin: Nin,
      Tel: Tel,
      Gender: Gender,
      UserName: UserName,
      Comfirm: Comfirm,
    };
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem("MyDetailed", jsonValue);
    } catch (e) {
      // saving error
    }
    setId(Tel)
    navigation.navigate("Welcome");
  };
  const [Tview, setTview] = useState(true);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#fcefc3", "#d9e5d1"]}
        style={styles.background}
      />
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={60}
        style={{ width: "100%", flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Image
              source={Logo}
              style={[styles.logo, { height: height * 0.2 }]}
              resizeMode="contain"
            />

            {Tview && (
              <View
                style={{
                  flex: 1,
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CustomInput
                  Radius={10}
                  Background="white"
                  placeholder="Frist Name"
                  value={fristName}
                  setvalue={setFristName}
                  width="80%"
                  height={45}
                  Hpadding="2%"
                  marginB="5%"
                  //    TextWidth= "80%"
                />
                <CustomInput
                  Radius={10}
                  Background="white"
                  placeholder="Middle Name"
                  value={MiddleName}
                  setvalue={setMiddleName}
                  width="80%"
                  height={45}
                  Hpadding="2%"
                  marginB="5%"
                  //    TextWidth= "80%"
                />
                <CustomInput
                  Radius={10}
                  Background="white"
                  placeholder="Last Name"
                  value={LastName}
                  setvalue={setLastName}
                  width="80%"
                  height={45}
                  Hpadding="2%"
                  marginB="5%"
                  //    TextWidth= "80%"
                />
                <CustomInput
                  Radius={10}
                  Background="white"
                  placeholder="Address"
                  value={Address}
                  setvalue={setAddress}
                  width="80%"
                  height={45}
                  Hpadding="2%"
                  marginB="5%"
                  //    TextWidth= "80%"
                />

                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    height: "auto",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 20,
                    // backgroundColor:"blue"
                  }}
                >
                  <CustomInput
                    Radius={5}
                    Background="white"
                    placeholder="Country"
                    value={Country}
                    setvalue={setCountry}
                    width="22%"
                    height="auto"
                    Hpadding="3%"
                    marginB="5%"
                    //    TextWidth= "80%"
                  />

                  <CustomInput
                    Radius={5}
                    Background="white"
                    placeholder="State"
                    value={State}
                    setvalue={setState}
                    width="22%"
                    height="auto"
                    Hpadding="2%"
                    marginB="5%"
                    //    TextWidth= "80%"
                  />

                  <CustomInput
                    Radius={5}
                    Background="white"
                    placeholder="City"
                    value={City}
                    setvalue={setCity}
                    width="22%"
                    height="auto"
                    Hpadding="2%"
                    marginB="5%"
                    //    TextWidth= "80%"
                  />
                </View>
                <CustomInput
                  Radius={10}
                  Background="white"
                  placeholder="Email"
                  value={Email}
                  setvalue={setEmail}
                  width="80%"
                  height={45}
                  Hpadding="2%"
                  marginB="5%"
                  //    TextWidth= "80%"
                />
                <CustomInput
                  Radius={10}
                  Background="white"
                  placeholder="Nin Verification"
                  value={Nin}
                  setvalue={setNin}
                  width="80%"
                  height={45}
                  Hpadding="2%"
                  marginB="5%"
                  //    TextWidth= "80%"
                />

                <CustomInput
                  Radius={10}
                  Background="white"
                  placeholder="Tel:"
                  value={Tel}
                  setvalue={setTel}
                  width="80%"
                  height={45}
                  Hpadding="2%"
                  marginB="5%"
                  //    TextWidth= "80%"
                />

                <CustomButton
                  width="50%"
                  text="Continue"
                  color="black"
                  textcolor="yellow"
                  borderR={10}
                  items="center"
                  padding="2%"
                  marginT="4%"
                  onPress={() => setTview(false)}
                />
              </View>
            )}

            {!Tview && (
              <View style={{ flex: 1, width: "100%", alignItems: "center" }}>
                <CustomInput
                  Radius={10}
                  Background="white"
                  placeholder="Tel:"
                  value={Tel}
                  setvalue={setTel}
                  width="80%"
                  height={45}
                  Hpadding="2%"
                  marginB="5%"
                  //    TextWidth= "80%"
                />

                <CustomInput
                  Radius={10}
                  Background="white"
                  placeholder="Gender"
                  value={Gender}
                  setvalue={setGender}
                  width="80%"
                  height={42}
                  Hpadding="2%"
                  marginB="5%"
                  //    TextWidth= "80%"
                />

                <CustomInput
                  Radius={10}
                  Background="white"
                  placeholder="UserName"
                  value={UserName}
                  setvalue={setUserName}
                  width="80%"
                  height={42}
                  Hpadding="2%"
                  marginB="5%"
                  //    TextWidth= "80%"
                />

                <CustomInput
                  Radius={10}
                  Background="white"
                  placeholder="Password"
                  value={PassWord}
                  setvalue={setPassWord}
                  width="80%"
                  height={42}
                  Hpadding="2%"
                  marginB="5%"
                  //    TextWidth= "80%"
                />

                <CustomInput
                  Radius={10}
                  Background="white"
                  placeholder="Comfirm Passowrd"
                  alue={Comfirm}
                  setvalue={setComfirm}
                  width="80%"
                  height={42}
                  Hpadding="2%"
                  marginB="5%"
                  //    TextWidth= "80%"
                />
                <CheckBox title="Terms & Condition Apply" />
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-around",
                    flexDirection: "row",
                  }}
                >
                  <CustomButton
                    width="30%"
                    text="Back"
                    color="black"
                    textcolor="yellow"
                    borderR={10}
                    items="center"
                    padding="2%"
                    marginT="4%"
                    onPress={() => setTview(true)}
                  />

                  <CustomButton
                    width="30%"
                    text="Next"
                    color="black"
                    textcolor="yellow"
                    borderR={10}
                    items="center"
                    padding="2%"
                    marginT="4%"
                    onPress={() => Register()}
                  />
                </View>

                <View
                  style={{
                    marginTop: 10,
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  <Text>Already have an account?</Text>

                  <Text style={{ color: "green" }}>Login</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  logo: {
    width: "50%",
  },

  keycontainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: "red",
  },
});

export default Home;
