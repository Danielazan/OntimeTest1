import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { GlobalContext } from ".";
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
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import Toast from 'react-native-toast-message';
import { useDatabase } from "./database";
export const SocketContext = React.createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState("");
  const { id,Tel } = useContext(GlobalContext);
  const navigation = useNavigation();
  let names;
  let connectedUser;
  const [socketActive, setSocketActive] = useState(false);
  const [calling, setCalling] = useState(false);
  // Video Scrs
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const database = useDatabase();

  // const [isModalVisible, setModalVisible] = useState(false);
  const [Nameses, setNameses] = useState("");

  const [isCallActive, setIsCallActive] = useState(false);

  const [isFront, setIsFront] = useState(false);

  const [iceCandidates, setIceCandidates] = useState([]);

  let reurl = 1;

  let conns;

  const [yourConn, setYourConn] = useState(
    //change the config as you need
    new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
        {
          urls: "turn:relay1.expressturn.com:3478",
          username: "ef38YUW8NOX55QFCTK",
          credential: "7kCItQu6noXpfA7W",
        },
      ],
    })
  );

  const [offerStatus, setOfferStatus] = useState(true);

  const [callToUsername, setCallToUsername] = useState("");

  useEffect(() => {
    if (id) {
    
      let conn;
  if (Platform.OS === 'android') {
    conn = new WebSocket(`ws://10.0.2.2:8000?userName=${id}`);
  } else if (Platform.OS === 'ios') {
    conn = new WebSocket(`ws://localhost:8000?userName=${id}`);
  } else {
    // Handle other platforms if needed
    throw new Error('Unsupported platform');
  }
  //     //Websocket for deployment 

      // const conn = new WebSocket(`ws://13.53.88.231:8000?userName=${id}`);

      console.log({navigation})
      conns = conn;
      setSocket(conn);

      alert(id);
      conn.onopen = () => {
        // console.log("Connected to the signaling server");

        alert("Connected to the signaling server");

        setSocketActive(true);
      };
      //when we got a message from a signaling server
      conn.onmessage = (msg) => {
        console.log("======incoming=======");

        let data;
        if (msg.type === "login") {
          data = {};
          console.log("user Accepted");
        } else {
          data = JSON.parse(msg.data);
          // console.log("Data --------------------->", data);
          switch (data.type) {
            case "login":
              // console.log("Login");
              alert("login");
              break;
            //when somebody wants to call us
            case "offer":
              handleOffer(data.offer, data.caller);

              // console.log("caller",data.caller);
              break;

              case "V-offer":
              handleVOffer(data.offer, data.caller);

              // console.log("caller",data.caller);
              break;

            case "answer":
              handleAnswer(data.answer);
              // console.log("Answer", data.answer);
              break;
            // when a remote peer sends an ice candidate to us
            // case "candidate":
            //   handleCandidate(data.candidate);
            //   console.log("Candidate");
            //   break;
            case "leave":
              handleLeave();
              console.log("Leave");
              break;

            case "incoming_Message":
          
              const blobData = JSON.stringify(data);

              // setMessages((previousMessages) =>
              //   GiftedChat.append(previousMessages, receivedMessage.message)
              // );

              if (database) {
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
              } else {
                console.error("Database is not available.");
              }

              alert(blobData);
          // console.log("==========",receivedMessage)
            default:
              break;
          }
        }
      };
      conn.onerror = function (err) {
        console.log("Got error", err);
      };
      /**
       * Socjket Signalling Ends
       */

      // let isFront = false;

      // Create a new MediaStream for the local video feed

      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            width: { min: 500 },
            height: { min: 300 },
            frameRate: { min: 30 },
           facingMode: (isFront ? "user" : "environment"),
          },
        })
        .then((stream) => {
          // Got stream!
          setLocalStream(stream);
          // setup stream listening

          const tracks = stream.getTracks();

          tracks.forEach((track) => {
            yourConn.addTrack(track, stream);
            console.log("track ================>kind", track.kind);
          });
        })
        .catch((error) => {
          // Log error
          console.log("error adding stream", error);
        });

      const remoteStream = new MediaStream();

       yourConn.ontrack = (event) => {
      const stream = event.streams[0];

      console.log(
        "======================================================================="
      );

      if (
        stream &&
        stream._tracks &&
        Array.isArray(stream._tracks) &&
        stream._tracks.length > 0
      ) {
        const audioTrack = stream._tracks.find(
          (track) => track.kind === "audio"
        );
        const videoTrack = stream._tracks.find(
          (track) => track.kind === "video"
        );

        if (audioTrack && videoTrack) {
          // const newStream = new MediaStream([audioTrack, videoTrack]);

          // setRemoteStream(newStream);

          const remote = new MediaStream();

          event.streams[0].getTracks().forEach((track) => {
            remote.addTrack(track);
          });

          setRemoteStream(remote);

          console.log(
            "<<<<<<<<<<<<<<<The stream contains both audio and video tracks=================:",
            remote.toURL()
          );
        } else if (audioTrack) {
          console.log("The stream contains only an audio track:", stream);
        } else if (videoTrack) {
          console.log("The stream contains only a video track:", stream);
        } else {
          console.log(
            "The stream does not contain audio or video tracks:",
            stream
          );
        }
      } else {
        console.log("Invalid stream object or no tracks found in the stream");
      }

      console.log("======event====stream", event.streams[0]);
    };

      // Setup ice handling

      yourConn.addEventListener("iceconnectionstatechange", (event) => {
        let otherUser = callToUsername;

        console.log("###############", callToUsername);

        switch (yourConn.iceConnectionState) {
          case "connected":
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
            console.log("ICE connection failed. Handle the failure scenario.");

            const savedIceCandidates = [...iceCandidates];
  
            // Clear the saved ICE candidates
            setIceCandidates([]);
          
            // Send the saved ICE candidates
            for (const candidate of savedIceCandidates) {
              yourConn.addIceCandidate(new RTCIceCandidate(candidate));
        
        
              send({
                type: "candidate",
                candidate:candidate,
                To: callToUsername,
              });
            }

            break;
          default:
            // Handle other ICE connection states if needed
            console.log("ICE Connection State:", yourConn.iceConnectionState);
            break;
        }
      });

      yourConn.onicecandidate = (event) => {
        console.log("can");
        if (event.candidate) {

          send({
            type: "candidate",
            candidate: event.candidate,
            To: callToUsername,
          });

           setIceCandidates([...iceCandidates, event.candidate]);
        }
      };

      return () => conn.close();
    }
  }, [id,database]);

  const send = (message) => {
    //attach the other peer username to our messages
    if (connectedUser) {
      message.name = connectedUser;
      // console.log("Connected iser in end----------", message);
    }

    conns.send(JSON.stringify(message));
  };
  

  const handleOffer = async (offer, name) => {
    names = name;
    return new Promise((resolve, reject) => {
      // Alert.alert(`${name} is calling. Accept call?`, "", [
      //   { text: "Cancel", onPress: () => reject("Call rejected") },
      //   { text: "Accept", onPress: () => resolve("Call accepted") },
      // ]);

      Toast.show({
        type: 'tomatoToast',
        // And I can pass any custom props I want
        names:`${name} is calling..`,
        text1: "Accept",
        text2:"Cancel",
        props: { 
        onPress: ()=>resolve("Call accepted"),
        onPresst: ()=> reject("Call rejected")
  
       },
        visibilityTime: 7000 // 4 seconds
      });
    })
      .then(async (response) => {
        if (response === "Call accepted") {
          // setOffer(offer);
          navigation.navigate("Tv");
          console.log("Call accepted by user.", offer);
          connectedUser = name;

          try {
            await yourConn.setRemoteDescription(
              new RTCSessionDescription(offer)
            );

            yourConn.ontrack = (event) => {
              console.log("Track added", event);
              setRemoteStream(event.streams[0]);
            };

            const answer = await yourConn.createAnswer();

            await yourConn.setLocalDescription(answer);
            send({
              type: "answer",
              answer: answer,
              // To:callToUsername
            });

            
          } catch (err) {
            console.log("Offerr Error", err);
          }
          
        } else {
          console.log("Call rejected by user.");
          // Optionally, send a "reject" message to the caller
        }
      })
      .catch((error) => {
        console.log(error);
        // Handle the case when the user cancels or rejects the call
        // Optionally, send a "reject" message to the caller
      });
  };

  const handleVOffer = async (offer, name) => {
    names = name;
    return new Promise((resolve, reject) => {

      Toast.show({
        type: 'tomatoToast',
        // And I can pass any custom props I want
        names:`${name} is calling..`,
        text1: "Accept",
        text2:"Cancel",
        props: { 
        onPress: ()=>resolve("Call accepted"),
        onPresst: ()=> reject("Call rejected")
  
       },
        visibilityTime: 7000 // 4 seconds
      });
    })
      .then(async (response) => {
        if (response === "Call accepted") {
          // setOffer(offer);
          navigation.navigate("Vioce");
          console.log("Call accepted by user.", offer);
          connectedUser = name;

          try {
            await yourConn.setRemoteDescription(
              new RTCSessionDescription(offer)
            );

            yourConn.ontrack = (event) => {
              console.log("Track added", event);
              setRemoteStream(event.streams[0]);
            };

            const answer = await yourConn.createAnswer();

            await yourConn.setLocalDescription(answer);
            send({
              type: "answer",
              answer: answer,
              // To:callToUsername
            });

            
          } catch (err) {
            console.log("Offerr Error", err);
          }
          
        } else {
          console.log("Call rejected by user.");
          // Optionally, send a "reject" message to the caller
        }
      })
      .catch((error) => {
        console.log(error);
        // Handle the case when the user cancels or rejects the call
        // Optionally, send a "reject" message to the caller
      });
  };

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

  //when we got an answer from a remote user



  return (
    
      <SocketContext.Provider
        value={{
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
          setIsFront
        }}
       
      >
        {children}
      </SocketContext.Provider>
     
  );
}
