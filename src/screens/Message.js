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
  ScrollViewComponent,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState, useCallback, useContext } from "react";
import { LinearGradient } from "expo-linear-gradient";
// import messageData from '../../assets/data/messages.json'
import {
  Ionicons,
  MaterialIcons,
  Entypo,
  Feather,
  FontAwesome,
} from "@expo/vector-icons";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Send,
  SystemMessage,
  IMessage,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalContext } from "../contexts";
import { useSocket } from "../contexts/SocketHandler";
import { useDatabase } from "../contexts/database";
import Logo from "../../assets/Logo.png";
import CustomButton from "../components/CustomButton";
import { RTCView, RTCPeerConnection } from "react-native-webrtc";
import Toast from 'react-native-toast-message';


const Message = ({ navigation }) => {
  const { height } = useWindowDimensions();
  const [messages, setMessages] = useState([]);
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");

  const {socket} = useSocket();

  const database = useDatabase();

  // const [message, setMessages] = useState([])

  const { id, currentGroupName, setAllUsers } = useContext(GlobalContext);

  const messageData = [];

  const [msg, setMsg] = useState([]);

  // const formatDateWithoutTimezone = () => {
  //   const currentDate = new Date();
  //   const options = {
  //     weekday: "short",
  //     month: "short",
  //     day: "2-digit",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //     timeZoneName: "short",
  //   };
  //   const formattedDate = currentDate
  //     .toLocaleString("en-US", options)
  //     .replace(/ \(.+\)/, "");

  //   return formattedDate;
  // };

  useEffect(() => {
    socket.onopen = () => {
      console.log('Connected to WebSocket server')
      socket.send('Hello, WebSocket server!')
    }

    socket.onmessage = (event) => {
      // alert(event.data);
      if (event.type == "newpeer") {
        console.log("New user Join");
      } else {
        receivedMessage = JSON.parse(event.data);

        switch (receivedMessage.type) {
          case "newPeer":
            console.log("==========", receivedMessage.clientId);
            setAllUsers(receivedMessage.clientId);
            break;
          case "incoming_Message":
            
            const blobData = JSON.stringify(receivedMessage);

            setMessages((previousMessages) =>
              GiftedChat.append(previousMessages, receivedMessage.message)
            );

      

            alert(blobData);
            // console.log("==========",receivedMessage)
            break;
          default:
            console.log("Invalid messa ge type");
        }
      }

     
    };

    // socket.onclose = () => {
    //   console.log('Disconnected from WebSocket server');
    // };

    // alert(currentGroupName);


  }, [socket]);

  const fetchDataFromDatabase = () => {};


  useEffect(() => {
    
    database.transaction(function (tx) {
      tx.executeSql("SELECT * FROM message", [], (tx, results) => {
        var len = results.rows.length;
        for (let i = 0; i < len; i++) {
          const jsonString = results.rows.item(i).content;

          // Parse the JSON string to a JavaScript object
          const jsonObject = JSON.parse(jsonString);

          // Access the properties of the parsed object
          console.log("=======messages============>>>>>>>",jsonObject.message);

          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, jsonObject.message)
          );
        }
      });
    });
  }, []);

  const onSend = useCallback(
    (messages = []) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );

      const blobData = JSON.stringify({
        type: "chat_message",
        roomid: currentGroupName,
        To:currentGroupName,
        message: messages,
      });

      socket.send(
        JSON.stringify({
          type: "chat_message",
          roomid: currentGroupName,
          To:currentGroupName,
          message: messages,
        })
      );

      database.transaction(function (tx) {
        tx.executeSql(
          "INSERT INTO message (content) VALUES (?)",
          [blobData],
          (tx, results) => {
            console.log("Results", results.rowsAffected);
            if (results.rowsAffected > 0) {
              console.log("Data Inserted Successfully....");
            } else {
              console.log("Failed....");
            }
          }
        );
      });

      console.log(database);

      const test = "Hello, World"; // Replace with your message
    },
    [messages]
  );

  insertData = (text) => {
    database.transaction(function (tx) {
      tx.executeSql(
        "INSERT INTO message (content) VALUES (?)",
        [text],
        (tx, results) => {
          console.log("Results", results.rowsAffected);
          if (results.rowsAffected > 0) {
            console.log("Data Inserted Successfully....");
          } else {
            console.log("Failed....");
          }
        }
      );
    });
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: "#131313",
          color: "white",
          justifyContent: "center",
          marginHorizontal: 20,
          borderRadius: 20,
        }}
        textInputProps={{ color: "white", marginLeft: 22 }}
        renderActions={() => (
          <View
            style={{
              height: 44,
              justifyContent: "center",
              alignItems: "center",
              left: 5,
              flexDirection: "row",
              gap: 10,
            }}
          >
            <MaterialIcons name="emoji-emotions" color="#fcf988" size={28} />

            <Entypo name="attachment" color="#fcf988" size={28} />

            <MaterialIcons name="photo-camera" color="#fcf988" size={28} />

            {/* <Ionicons name='add' color='#fcf988' size={28} /> */}
          </View>
        )}
      />
    );
  };

  const handlePressBack = () => {
    navigation.navigate("ChartRoom");
  };

  const handlePressVideo = () => {
    navigation.navigate("Tv");
  };

  const handlePressAudio = () => {
    navigation.navigate("Vioce");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#fcefc3", "#d9e5d1"]}
        style={styles.background}
      />

      <View style={styles.header}>
        <View style={[styles.contentName, { marginTop: height * 0.05 }]}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "50%",
              gap: 5,
              marginLeft: 7,
              backgroundColor: "green",
            }}
          >
            <TouchableOpacity onPress={handlePressBack}>
              <Entypo name="arrow-with-circle-left" size={24} color="white" />
            </TouchableOpacity>

            <Text style={{ fontSize: 20 }}>OnTime Profo</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "35%",
              gap: 10,
              marginRight: 4,
              // backgroundColor: 'blue'
            }}
          >
            
            <TouchableOpacity onPress={handlePressAudio}>
            <FontAwesome name="phone" size={24} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePressVideo}>
              <Feather name="video" size={24} color="black" />
            </TouchableOpacity>

            <View style={{ borderWidth: 2, borderRadius: 50 }}>
              <Image source={Logo} style={[styles.logo]} resizeMode="cover" />
            </View>

            <TouchableOpacity>
              <Entypo name="dots-three-vertical" size={24} color="#07fe00" />
            </TouchableOpacity>
          </View>
        </View>

        {/* <View style={styles.contentButton}>
          <CustomButton
            text="Conversation"
            height={40}
            width={100}
            color="#5a5e5a"
            borderR={5}
            textcolor="#fcf988"
            padding={2}
            items="center"
            weight={800}
          />

          <CustomButton
            text="Find"
            height={40}
            width={90}
            color="#5a5e5a"
            borderR={5}
            textcolor="#fcf988"
            padding={2}
            items="center"
            weight={800}
          />

          <CustomButton
            text="Book an appointment"
            height={40}
            width={160}
            color="#5a5e5a"
            borderR={5}
            textcolor="#fcf988"
            padding={2}
            items="center"
            weight={800}
          />
        </View> */}
      </View>

      {!messages == [] ? (
        <ImageBackground style={{ flex: 1, marginBottom: insets.bottom }}>
          <GiftedChat
            messages={messages}
            onSend={(messages) => onSend(messages)}
            // onSend={()=>insertData()}
            onInputTextChanged={setText}
            // renderAvatar={null}
            user={{
              _id: id,
            }}
            // for the containers that hold the chat messages
            renderBubble={(props) => {
              return (
                <Bubble
                  {...props}
                  textStyle={{
                    right: {
                      color: "#000",
                    },
                  }}
                  wrapperStyle={{
                    left: {
                      backgroundColor: "#fff98b",
                    },
                    right: {
                      backgroundColor: "#ffffff",
                    },
                  }}
                />
              );
            }}
            // for changing the send button on the chat

            renderSend={(props) => (
              <View
                style={{
                  height: 44,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  paddingHorizontal: 14,
                }}
              >
                {/* {text === '' && (
              <>
                <Ionicons name="camera-outline" color="#fff68b" size={28} />
                <Ionicons name="mic-outline" color="#fff68b" size={28} />
              </>
            )} */}
                {text !== "" && (
                  <Send
                    {...props}
                    containerStyle={{
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="send" color="#fff68b" size={28} />
                  </Send>
                )}
              </View>
            )}
            renderInputToolbar={renderInputToolbar}
            // textInputProps={{
            //       style: { color: 'red' ,width:"100%", backgroundColor:"blue", justifyContent:"center"}
            //   }}
          />
        </ImageBackground>
      ) : (
        <View style={{ flex: 1, width: "100%" }}>
          <LinearGradient
            colors={["#fcefc3", "#d9e5d1"]}
            style={styles.background}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center'
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  header: {
    width: "100%",
    height: 120,
    backgroundColor: "#69736a",
    alignItems: "center",
    paddingBottom: 14,
  },
  flash: {
    width: "100%",
    height: "100%",
    // alignItems:"center",
    // justifyContent:"center",
    // backgroundColor:"red",
    flex: 1,
  },
  contentName: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    // backgroundColor: 'red'
    // marginBottom:4
  },
  contentButton: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
});
export default Message;
