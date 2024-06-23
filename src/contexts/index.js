import { createContext, useState } from "react";

export const GlobalContext = createContext();

function GlobalState({ children }) {
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [allChatRooms, setAllChatRooms] = useState([]);
  const [currentGroupName, setCurrentGroupName] = useState("");
  const [allChatMessages, setAllChatMessages] = useState([]);
  const [currentChatMesage, setCurrentChatMessage] = useState("");

  const [id, setId] = useState("");

  const [fristName, setFristName] = useState("");

  const [PassWord, setPassWord] = useState("");

  const [MiddleName, setMiddleName] = useState("");

  const [LastName, setLastName] = useState("");

  const [Address, setAddress] = useState("");

  const [Country, setCountry] = useState("");

  const [City, setCity] = useState("");

  const [State, setState] = useState("");

  const [Email, setEmail] = useState("");

  const [Nin, setNin] = useState("");

  const [Tel, setTel] = useState("");

  const [Gender, setGender] = useState("");

  const [UserName, setUserName] = useState("");

  const [Comfirm, setComfirm] = useState("");

  return (
    <GlobalContext.Provider
      value={{
        currentUserName,
        setCurrentUserName,
        currentUser,
        setCurrentUser,
        allUsers,
        setAllUsers,
        allChatRooms,
        setAllChatRooms,
        id,
        setId,
        currentGroupName,
        setCurrentGroupName,
        allChatMessages,
        setAllChatMessages,
        currentChatMesage,
        setCurrentChatMessage,

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
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export default GlobalState;
