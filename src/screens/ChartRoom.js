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
  Alert, 
  Modal,
  TextInput,
} from "react-native";
import React, { useContext,useState,useEffect } from "react";
import CustomButton from "../components/CustomButton";
import Logo from "../../assets/Image1.jpg";
import { LinearGradient } from "expo-linear-gradient";
import { FlashList } from "@shopify/flash-list";
import { useDatabase } from "../contexts/database";
import { useSocket } from "../contexts/SocketHandler";
import { GlobalContext } from "../contexts/index";
import Model from "../components/Model";
import {
  Ionicons,
  MaterialIcons,
  Entypo,
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

const ChartRoom = ({ navigation }) => {
  const { height, width } = useWindowDimensions();

  const { socket,callToUsername,
    setCallToUsername, } = useSocket();

    const database = useDatabase();

    const [Name, setName] = useState(
      ""
    )

  const [modalVisible, setModalVisible] = useState(false);

  const { currentGroupName, setCurrentGroupName } = useContext(GlobalContext);

  const [DATA, setData] = useState([
    { Frist: "Ontime", znd: "Profo" },
  ])

  useEffect(() => {
    console.log("hello")
    database.transaction(function (tx) {
      tx.executeSql("SELECT * FROM ChatNames", [], (tx, results) => {
        var len = results.rows.length;
        for (let i = 0; i < len; i++) {
          const jsonString = results.rows.item(i).Names;

          // Parse the JSON string to a JavaScript object
         

          // Access the properties of the parsed object
          console.log("=======messages============>>>>>>>",jsonString);

          setData((prevArray) => [...prevArray, { znd:jsonString}]);
        }
      });
    });
  }, []);

  const Message = (roomids) => {
    setCurrentGroupName(roomids);
    console.log("clicked");
    socket.send(
      JSON.stringify({
        type: "JoinRoom",
        roomId: roomids,
      })
    );

    setCallToUsername(roomids)

    navigation.navigate("Message");

    // socket.send(JSON.stringify({
    //   type:"JoinRoom",
    //   roomId:"v12",
    // }))
  };

  const handlePressBack = () => {
    navigation.navigate("Welcome");
  };

  const AddChatName = (ChatName)=>{

    // const blobData = JSON.stringify({
    //   type: "chat_message",
    //   roomid: currentGroupName,
    //   message: messages,
    // });

    setData((prevArray) => [...prevArray, { znd:ChatName}]);

    
    database.transaction(function (tx) {
      tx.executeSql(
        "INSERT INTO ChatNames (Names) VALUES (?)",
        [ChatName],
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
    setName("")
    console.log(database);
    setModalVisible(!modalVisible)
  }


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
        <Pressable
          style={{ width: "60%", height: 50, justifyContent: "center" }}
          onPress={() => Message(item.znd)}
        >
          <Text>{item.znd}</Text>
        </Pressable>

        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <Text>{item.Frist}</Text>
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
        </Pressable>
      </View>
    );
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
              //   backgroundColor: 'blue'
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
              width: "20%",
              //   backgroundColor: 'blue'
            }}
          >
            <View style={{ borderWidth: 2, borderRadius: 50 }}>
              <Image source={Logo} style={[styles.logo]} resizeMode="cover" />
            </View>

            <TouchableOpacity>
              <Entypo name="dots-three-vertical" size={24} color="#07fe00" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentButton}>
          <CustomButton
            text="Conversations"
            height={40}
            width={width * 0.3}
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
            width={width * 0.15}
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
            width={width * 0.4}
            color="#5a5e5a"
            borderR={5}
            textcolor="#fcf988"
            padding={2}
            items="center"
            weight={800}
          />
        </View>
      </View>

      <View style={styles.flash}>
        <FlashList
          data={DATA}
          renderItem={renderItem}
          estimatedItemSize={200}
          numColumns={1}
          columnWrapperStyle={{
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 20,
          }}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.addChat,
          { height: height * 0.05, width: width * 0.15, top:height- 100, left: width-80 },
        ]}

        onPress={() => setModalVisible(true)}
      >
        
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Add A New Chart Member!</Text>

            <TextInput
            style={styles.TexInput}
          placeholder="enter a number to call"
          value={Name}
          onChangeText={(text) => setName(text)}
        />
            <View style={{flexDirection:"row"}}>
            <Pressable
              style={[styles.button, styles.buttonClose,{width:70, marginRight:15}]}
              onPress={() => AddChatName(Name)}
             >
              <Text style={styles.textStyle}>Add</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
            </View>
          </View>
        </View>
        
      </Modal>
      <MaterialCommunityIcons name="message-plus" size={24} color="black" />
    
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent:"center"
  },
  header: {
    width: "100%",
    height: 160,
    backgroundColor: "#69736a",
    alignItems: "center",
    paddingBottom: 14,
  },
  contentName: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    // backgroundColor: 'red'
    // marginBottom:4
  },
  contentUp: {
    alignItems: "center",

    flexDirection: "row",
    justifyContent: "center",
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  contentButton: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  flash: {
    width: "100%",
    height: "100%",
    // alignItems:"center",
    // justifyContent:"center",
    // backgroundColor:"red",
    flex: 1,
  },
  TexInput: {
    borderRadius: 50,
    borderWidth: 1,
    padding: 8,
  },
  addChat: {
    backgroundColor: "yellow",
    width: 50,
    height: 50,
    position: "absolute",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    marginTop:25
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 25,
    textAlign: 'center',
  },
});
export default ChartRoom;
