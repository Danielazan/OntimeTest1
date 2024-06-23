import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Platform,
  Image,
  useWindowDimensions,
  Alert,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Pressable,
} from "react-native";
import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals,
} from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";
import { GlobalContext } from "../contexts/index";
import { useSocket } from "../contexts/SocketHandler";
import {
  Ionicons,
  MaterialIcons,
  Entypo,
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
  FontAwesome5 
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Callimg from "../../assets/woman.jpg";
import { FlashList } from "@shopify/flash-list";
import Logo from "../../assets/Image1.jpg";

const Audio = () => {
  const { height, width } = useWindowDimensions();
  let connectedUser;
  const [calling, setCalling] = useState(false);

  const { id } = useContext(GlobalContext);

  // let reurl = 1;

  const {
    socket,
    localStream,
    setLocalStream,
    remoteStream,
    setRemoteStream,
    callToUsername,
    setCallToUsername,
    yourConn,
    setYourConn,
    socketActive,
    setSocketActive,
    isFront,
    setIsFront,
    // connectedUser
  } = useSocket();

  const [iceCandidates, setIceCandidates] = useState([]);
  const [connection, setconnection] = useState(false);

  //   inCall Manager UseEffect

  useEffect(() => {
    if (socketActive) {
      try {
        InCallManager.start({ media: "audio" });
        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.setSpeakerphoneOn(true);
      } catch (err) {
        console.log("InApp Caller ---------------------->", err);
      }

      console.log("id is ", id);

      send({
        type: "login",
        name: id,
      });
    }
  }, [socketActive]);

  // webrtc call signal start here

  useEffect(() => {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = false;
  }, []);

  useEffect(() => {
    // console.log(yourConn);
    // alert(id);

    socket.onopen = () => {
      // console.log("Connected to the signaling server");

      alert("Connected to the signaling server");

      setSocketActive(true);
    };
    //when we got a message from a signaling server
    socket.onmessage = (msg) => {
      console.log("======incoming=======");

      let data;
      if (msg.type === "login") {
        data = {};
        console.log("user Accepted");
      } else {
        data = JSON.parse(msg.data);
        // console.log("Data --------------------->", data);
        switch (data.type) {
          case "answer":
            handleAnswer(data.answer);
            // console.log("Answer", data.answer);
            break;
          //when a remote peer sends an ice candidate to us
          case "candidate":
            handleCandidate(data.candidate);
            console.log("Candidate");
            break;
          // case "leave":
          //   handleLeave();
          //   console.log("Leave");
          //   break;
          default:
            break;
        }
      }
    };
    socket.onerror = function (err) {
      console.log("Got error", err);
    };
    /**
     * Socjket Signalling Ends
     */

    // Setup ice handling

    yourConn.addEventListener("iceconnectionstatechange", (event) => {
      let otherUser = callToUsername;

      console.log("###############", callToUsername);

      switch (yourConn.iceConnectionState) {
        case "connected":
          setconnection(true);
          console.log(".........icecandiate connected............");
          break;
        case "checking":
          console.log("checking....");
          break;
        case "completed":
          // Handle the call being connected here
          // For example, set video streams to visible
          // setVideoVisible(true); // Assuming you have a state variable to control video visibility
          console.log(
            "<<<<<<<<<<<<<________ICE Connection State completed:_____",
            yourConn.iceConnectionState
          );
          break;
        case "failed":
          // Handle the case where the ICE connection has failed
          console.log("ICE Connection State:", yourConn.iceConnectionState);
          console.log(
            "ICE connection failed. Handle the failure scenario.retying..."
          );

          const savedIceCandidates = [...iceCandidates];

          // Clear the saved ICE candidates
          setIceCandidates([]);

          // Send the saved ICE candidates
          for (const candidate of savedIceCandidates) {
            yourConn.addIceCandidate(new RTCIceCandidate(candidate));

            send({
              type: "candidate",
              candidate: candidate,
              To: callToUsername,
            });
          }

          // reconnecting()

          break;
        default:
          // Handle other ICE connection states if needed
          console.log("ICE Connection State:", yourConn.iceConnectionState);
          break;
      }
    });
  }, [socket]);

  useEffect(() => {
    
    if(callToUsername){
      reconnecting()
    }
  
  }, [])
  

  const send = (message) => {
    //attach the other peer username to our messages
    if (connectedUser) {
      message.name = connectedUser;
      // console.log("Connected iser in end----------", message);
    }

    socket.send(JSON.stringify(message));
  };

  const onCall = () => {
    // setCalling(true);

    connectedUser = callToUsername;
    console.log("Caling to", connectedUser);
    // create an offer

    yourConn.createOffer().then((offer) => {
      yourConn.setLocalDescription(offer).then(() => {
        console.log("Sending Offer");

        send({
          type: "V-offer",
          offer: offer,
          caller: id,
        });
      });
    });
  };

  //when we got an answer from a remote user
  const handleAnswer = (answer) => {
    console.log("answer =======================>", answer);

    yourConn
      .setRemoteDescription(new RTCSessionDescription(answer))
      .then(() => {
        console.log("Remote description set successfully with the answer");
      })
      .catch((error) => {
        console.error(
          "Error setting remote description with the answer:",
          error
        );
      });
  };

  //when we got an ice candidate from a remote user
  const handleCandidate = (candidate) => {
    console.log("Candidate ----------------->", candidate);
    yourConn.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const reconnecting = async () => {
    onCall();

    for (let i = 0; i < 5; i++) {
      console.log("Waiting for 30 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    onCall();
  };
  //hang up
  const hangUp = () => {
    send({
      type: "leave",
    });

    handleLeave();
  };

  const handleLeave = () => {
    connectedUser = null;
    setRemoteStream({ toURL: () => null });

    yourConn.close();
    // yourConn.onicecandidate = null;
    // yourConn.onaddstream = null;
  };

  const renderItem = ({ item }) => {
    // return
    return (
      <View
        style={{
          width: "95%",
          backgroundColor: "#468747",
          marginVertical: 10,
          marginHorizontal: 10,
          height: "70%",
          borderRadius: 50,
          padding: 15,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {isFront ? (
          <TouchableOpacity onPress={() => switchCamera()}>
            <MaterialCommunityIcons
              name="camera-flip-outline"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => switchCamera()}>
            <MaterialIcons name="flip-camera-ios" size={27} color="black" />
          </TouchableOpacity>
        )}

        <FontAwesome name="volume-up" size={27} color="black" />

        <Feather name="mic-off" size={27} color="black" />

        <MaterialIcons name="message" size={27} color="black" />
      </View>
    );
  };
  const DATA = [{ Frist: "Ontime", znd: "Profo" }];

  return (
    <View style={styles.root}>
      <ImageBackground source={Callimg} style={styles.backgroundImage}>
        <View style={styles.trans}></View>

        {/* <View style={styles.inputField}>
          <TextInput
            placeholder="enter a number to call"
            value={callToUsername}
            onChangeText={(text) => setCallToUsername(text)}
          />

          <Button
            title="Call"
            onPress={() => {
              console.log("calling", callToUsername);
              connectedUser = callToUsername;
              reconnecting();
            }}
            loading={calling}
          >
            Call
          </Button>
        </View> */}

        {connection && (
          <View style={[{ width: "100%", padding: 10 }]}>
            <Text>My friends audio</Text>
          </View>
        )}

        {localStream && <Text>My Audio shown</Text>}
        <View style={styles.VideoIcons}>

          <View style={{flexDirection:"row", justifyContent:"space-between", padding:20}}>
              <TouchableOpacity onPress={() => switchCamera()} style={{width:90,height:90, backgroundColor:"#464545", borderRadius:100, alignItems:"center", justifyContent:"center"}}>
                <Feather name="mic-off" size={40} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => switchCamera()} style={{width:90,height:90, backgroundColor:"#464545", borderRadius:100, alignItems:"center", justifyContent:"center"}}>
                <FontAwesome name="volume-up" size={40} color="white" />
              </TouchableOpacity>


              <TouchableOpacity onPress={() => switchCamera()} style={{width:90,height:90, backgroundColor:"#464545", borderRadius:100, alignItems:"center", justifyContent:"center"}}>
              <FontAwesome name="square" size={40} color="white" />
              </TouchableOpacity>

            {/* <MaterialIcons name="message" size={27} color="black" /> */}
          </View>

          <View style={{flexDirection:"row", justifyContent:"space-between", padding:20}}>

          <TouchableOpacity onPress={() => switchCamera()} style={{width:90,height:90, backgroundColor:"#464545", borderRadius:100, alignItems:"center", justifyContent:"center"}}>
          <MaterialCommunityIcons name="record-circle-outline" size={40} color="white" />
              </TouchableOpacity>

             <TouchableOpacity onPress={() => switchCamera()} style={{width:90,height:90, backgroundColor:"#464545", borderRadius:100, alignItems:"center", justifyContent:"center"}}>
             <FontAwesome5 name="video" size={40} color="white" />
              </TouchableOpacity>


              <TouchableOpacity onPress={() => switchCamera()} style={{width:90,height:90, backgroundColor:"#464545", borderRadius:100, alignItems:"center", justifyContent:"center"}}>
            <FontAwesome5 name="user-friends" size={40} color="white" />
              </TouchableOpacity>

            {/* <MaterialIcons name="message" size={27} color="black" /> */}
          </View>
        </View>

        <View style={styles.end}>
            <View style={{flexDirection:"row", alignItems:"flex-end", width:"50%", justifyContent:"space-between"}}>
            <TouchableOpacity onPress={() => switchCamera()} style={{width:90,height:90, backgroundColor:"red", borderRadius:100, alignItems:"center", justifyContent:"center"}}>
            <MaterialCommunityIcons name="phone-hangup" size={40} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => switchCamera()} style={{width:90,height:90, backgroundColor:"#464545", borderRadius:100, alignItems:"center", justifyContent:"center"}}>
              <MaterialCommunityIcons name="dots-grid" size={40} color="white" />
              </TouchableOpacity>
            </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#fff",
    flex: 1,
    position: "relative",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  inputField: {
    marginBottom: 10,
    flexDirection: "column",
  },
  videoContainer: {
    flex: 1,
    width: "100%",
    // minHeight: 450,
    position: "relative",
    backgroundColor: "#f6edc6",
    height: "auto",
  },

  videos: {
    backgroundColor: "red",
    width: "100%",
    height: "auto",
  },

  VideoIcons: {
    width: "100%",
    flexDirection: "column",
    // backgroundColor: "red",
    // alignItems: "flex-end",
    justifyContent: "space-evenly",
    gap: 5,
    marginTop: 70,
    height: "60%",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    // justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  trans: {
    position: "absolute",
    backgroundColor: "black",
    top: 0,
    // padding: 10,
    // borderRadius: 5,
    opacity: 0.5,
    // transition: "opacity 0.3s",
    width: "100%",
    height: "100%",
  },

  end:{
    width:"100%", 
  height:"20%", 
  alignItems:"flex-end"
}
});

export default Audio;
