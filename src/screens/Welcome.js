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
  ScrollViewComponent
} from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { FlashList } from '@shopify/flash-list'
import Logo from '../../assets/Logo.png'
import CustomInput from '../components/CustomInput'
import CustomButton from '../components/CustomButton'
import One from '../../assets/HimgOne.png'
import Two from '../../assets/HImgt.png'
import { GlobalContext } from '../contexts'
import AsyncStorage from "@react-native-async-storage/async-storage";

const Welcome = ({ navigation }) => {
  const { height } = useWindowDimensions()

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
    
    getData()
   

  }, [])

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('MyDetailed');
      const  vsrs =jsonValue != null ? JSON.parse(jsonValue) : null;
      setId(vsrs.Tel)
      console.log(vsrs)
    } catch (e) {
      // error reading value
    }
  };
  

  const login = ()=>{
    navigation.navigate("Login")
  }
  const rooms = () => {
    navigation.navigate('ChartRoom')
  }



  const DATA = [
    { Frist: 'Ontime', znd: 'Profo' },
    { Frist: 'Ontime', znd: 'Appo' },
    { Frist: 'Ontime', znd: 'Delivery' },
    { Frist: 'Ontime', znd: 'Stay' },
    { Frist: 'Ontime', znd: 'Insurance' },
    { Frist: 'Ontime', znd: 'Trav' },
    { Frist: 'Ontime', znd: 'Vote' },
    { Frist: 'Ontime', znd: 'Arbitration' },
    { Frist: 'Ontime', znd: 'Chater' },
    { Frist: 'Ontime', znd: 'Security' },
    { Frist: 'Ontime', znd: 'MoneyDesk' },
    { Frist: 'Ontime', znd: 'Pay' }
  ]

  const imgdats = [
    { img: One }
    // {img:Two}
  ]

  const renderItem = ({ item }) => {
    // return
    return (
      <CustomButton
        borderR={30}
        width={130}
        color='#595d5e'
        padding={10}
        height={50}
        // text={item.Frist}
        fontsize={14}
        textcolor='white'
        zndText={item.znd}
        items='center'
        textcolorz='#e7e9bc'
        margin={5}
        weight={500}
        onPress={rooms}
      />
    )
  }

  const renderItem2 = ({ item }) => {
    // return
    return (
      <View style={{ flex: 1, width: '100%', height: '200%' }}>
        <Image
          source={item.img}
          style={{ marginVertical: 10, width: '90%', height: '100%' }}
          resizeMode='stretch'
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {id ? (
        <View style={styles.container}>
          <LinearGradient
            colors={['#fcefc3', '#d9e5d1']}
            style={styles.background}
          />

          <Image
            source={Logo}
            style={[styles.logo, { height: height * 0.2 }]}
            resizeMode='contain'
          />

          <View style={[styles.flash,{height: height * 0.30}]}>
            <FlashList
              data={DATA}
              renderItem={renderItem}
              estimatedItemSize={200}
              numColumns={3}
            />
          </View>


          <View
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '10%'
            }}
          >
            <ScrollView style={{ flex: 1, width: '100%' }}>
              <Image
                source={One}
                style={[styles.imgone]}
                resizeMode='stretch'
              />

              <Image
                source={Two}
                style={[styles.imgone]}
                resizeMode='stretch'
              />
            </ScrollView>
          </View>
        </View>
      ) : (
        <View
          style={{ flex: 1, alignItems: 'center' }}
        >
          <LinearGradient
            colors={['#fcefc3', '#d9e5d1']}
            style={styles.background}
          />

          <Image
            source={Logo}
            style={[styles.logo, { height: height * 0.4 }]}
            resizeMode='contain'
          />

          <Text style={{ fontSize: 18, fontWeight: 200, color: 'red' }}>
            {' '}
            Please go back and Login{' '}
          </Text>
          <CustomButton
            borderR={30}
            width='80%'
            color='black'
            padding={10}
            height={50}
            text='Login'
            fontsize={14}
            textcolor='white'
            // zndText={item.znd}
            items='center'
            textcolorz='#e7e9bc'
            margin={5}
            weight={500}
            onPress={login}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%'
  },
  logo: {
    width: '50%'
  },
  flash: {
    width: '100%',
    // alignItems:"center",
    // justifyContent:"center",
    // backgroundColor:"red",
  },
  flash2: {
    width: '100%',
    height: '100%',
    // alignItems:"center",
    // justifyContent:"center",
    backgroundColor: 'red',
    justifyContent: 'center'
  },
  imgone: {
    marginVertical: 10,
    width: '90%',
    height: 200
  }
})
export default Welcome
