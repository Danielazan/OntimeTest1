import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Platform,
  useWindowDimensions,
  Alert,
  TouchableOpacity,
  Modal,
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
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FontAwesome } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const CallTwo = () => {
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


  useEffect(() => {
    const videoTrack = localStream.getVideoTracks()[ 0 ];
    videoTrack.enabled = true;

  
}, [])
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
    // console.log(yourConn);
    alert(id);

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

    let isFront = false;

    // Create a new MediaStream for the local video feed

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
          type: "offer",
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

    for (let i = 0; i < 10; i++) {
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

  function switchCamera (){
    const videoTrack = localStream.getVideoTracks()[ 0 ];
    videoTrack._switchCamera();

    setIsFront(!isFront)
}

  // function resendIceCandidates() {
  //   // Get the local streams
  //   const localStreams = yourConn.getLocalStreams();

  //   // Get the ICE candidates from the local streams
  //   const iceCandidates = [];
  //   for (const stream of localStreams) {
  //     for (const track of stream.getTracks()) {
  //       if (track.kind === 'audio' || track.kind === 'video') {
  //         const candidate = new RTCIceCandidate({
  //           sdpMid: track.kind,
  //           sdpMLineIndex: track.track.kind === 'audio' ? 0 : 1,
  //           candidate: track.kind === 'audio' ? 'audio' : 'video'
  //         });
  //         iceCandidates.push(candidate);
  //       }
  //     }
  //   }

  //   // Send the ICE candidates to the remote peer
  //   for (const candidate of iceCandidates) {
  //     yourConn.addIceCandidate(candidate);
  //   }
  // }

  /**
   * Calling Stuff Ends
   */

  return (
    <View style={styles.root}>

      <View style={styles.videoContainer}>

        {connection && (
          <View style={[{ width: "100%", padding: 10 }]}>
            <RTCView
              streamURL={remoteStream.toURL()}
              objectFit={"cover"}
              mirror={true}
              style={[
                styles.remoteVideo,
                connection
                  ? { height: height * 0.6, width: width * 0.95 }
                  : null,
              ]}
              onError={(error) =>
                console.error("Error displaying video:", error)
              }
            />
          </View>
        )}

        <View
          style={[
            { width: "100%", height: "100%" },
            !connection ? { padding: 10 } : null,
          ]}
        >
          {localStream && (
            <RTCView
              streamURL={localStream.toURL()}
              zOrder={2}
              objectFit={"cover"}
              style={[
                styles.localVideo,
                connection
                  ? {
                      height: height * 0.25,
                      width: width * 0.5,
                      borderRadius: 50,
                      position: "absolute",
                      top: -94,
                      right: 5,
                      zIndex: 5,
                    }
                  : { height: height * 0.7, width: width * 0.95 },
              ]}
            />
            
          )}
           <View style={styles.VideoIcons}>

            {isFront ? <TouchableOpacity onPress={()=> switchCamera()}>
            <MaterialCommunityIcons name="camera-flip-outline" size={24} color="black" /> 
            </TouchableOpacity> :  <TouchableOpacity onPress={()=>switchCamera()}>
            <MaterialIcons name="flip-camera-ios" size={27} color="black" />
            </TouchableOpacity>}

          <FontAwesome name="volume-up" size={27} color="black" />

          <Feather name="mic-off" size={27} color="black" />

          <MaterialIcons name="message" size={27} color="black" />
        </View>
        </View>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#fff",
    flex: 1,
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
    flexDirection: "row",
    // backgroundColor:"red",
    gap:5,
    marginTop:5
  },
});

export default CallTwo;
