
import React, { useContext, useEffect, useState } from 'react'
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
import { GlobalContext } from '.'
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
//   import { GlobalContext } from "../contexts/index";
 import {SocketContext} from "./SocketHandler"


 export const VideoContext = React.createContext()

// export function useVideo() {
//   return useContext(VideoContext)
// }

export function VideoProvider({  children }) {
//   const [socket, setSocket] = useState()
  const { id } = useContext(GlobalContext)


  let names;
  let connectedUser;
  const [socketActive, setSocketActive] = useState(false);
  const [calling, setCalling] = useState(false);
  // Video Scrs
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // const [isModalVisible, setModalVisible] = useState(false);
  const [Nameses, setNameses] = useState("")

  const [isCallActive, setIsCallActive] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  let reurl = 1;


  const conn =new WebSocket(`ws://10.0.2.2:8000`);

  // const [conn, setConn] = useState(
  //   new WebSocket(`ws://10.0.2.2:8000?userName=${id}`)
  // );

  // const [conn, setConn] = useState(
  //   new WebSocket(`ws://104.198.75.214?userName=${id}`)
  // );

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

  const [callToUsername, setCallToUsername] = useState(null);

  

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
  
            case "answer":
              handleAnswer(data.answer);
              // console.log("Answer", data.answer);
              break;
            //when a remote peer sends an ice candidate to us
            case "candidate":
              handleCandidate(data.candidate);
              console.log("Candidate");
              break;
            case "leave":
              handleLeave();
              console.log("Leave");
              break;
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
  
      let isFront = false;
  
      // Create a new MediaStream for the local video feed
  
      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            width: { min: 500 },
            height: { min: 300 },
            frameRate: { min: 30 },
            facingMode: "user",
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
  
            // reconnecting()
  
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
        }
      };
    

   
  }, []);


  const send = (message) => {
    //attach the other peer username to our messages
    if (connectedUser) {
      message.name = connectedUser;
      // console.log("Connected iser in end----------", message);
    }

    conn.send(JSON.stringify(message));
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

        // Send pc.localDescription to peer
      });
    });
  };

  //when somebody sends us an offer
  // const handleOffers = async (offer, name) => {
  //   console.log(name + " is calling you.");

  //   console.log("Accepting Call===========>", offer);
  //   connectedUser = name;

  //   try {
  //     await yourConn.setRemoteDescription(new RTCSessionDescription(offer));

  //     yourConn.ontrack = (event) => {
  //       console.log("Track added", event);
  //       setRemoteStream(event.streams[0]);
  //     };

  //     const answer = await yourConn.createAnswer();

  //     await yourConn.setLocalDescription(answer);
  //     send({
  //       type: "answer",
  //       answer: answer,
  //       // To:callToUsername
  //     });
  //     setModalVisible(false)
  //   } catch (err) {
  //     console.log("Offerr Error", err);
  //   }
  // };

  const handleOffer = async (offer, name) => {
    names = name;
    return new Promise((resolve, reject) => {
      Alert.alert(`${name} is calling. Accept call?`, "", [
        { text: "Cancel", onPress: () => reject("Call rejected") },
        { text: "Accept", onPress: () => resolve("Call accepted") },
      ]);
    })
      .then(async (response) => {
        if (response === "Call accepted") {
          // setOffer(offer);
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


  const acceptCall = async (offer) => {
    try {
      await yourConn.setRemoteDescription(new RTCSessionDescription(offer));

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
      console.log("Offer Error", err);
    }
    setModalVisible(false);
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


  const rejectCall = async () => {
    send({
      type: "leave",
    });
    ``;
    setOffer(null);

    handleLeave();
  };

  

  /**
   * Calling Stuff Ends
   */

  
  

  return (
    <VideoContext.Provider value={{localStream, setLocalStream,remoteStream, setRemoteStream,callToUsername, setCallToUsername,onCall,reconnecting}}>
      {children}
    </VideoContext.Provider>
  )
}