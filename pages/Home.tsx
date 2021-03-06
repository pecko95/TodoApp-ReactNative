import React, { useState, useEffect } from "react";
import { useAsyncStorage } from "@react-native-community/async-storage";

// React native elements
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// Import styling
import { text, containers, buttons } from "../styles/styles";

// Import components
import MainList from "../components/MainList";

const Home = (props: any) => {
  // Fetch data from local storage to check if there are todos saved
  const [lists, setLists] = useState([]);
  const { getItem } = useAsyncStorage("@todoList");

  useEffect(() => {
    readFromStorage();
  })

  const readFromStorage = async () => {
    const savedLists = await getItem();

    if (savedLists !== null) {
      setLists(JSON.parse(savedLists));
    } else {
      setLists([]);
    }

  }

  return (
    <View>
      {lists && lists.length > 0 ?
        <MainList />
      :
        <View style={{
          height: "100%",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <Text style={[text.listTitle, { marginBottom: 10}]}>No lists found.</Text>
          <Text style={[text.pBig, { marginBottom: 20}]}>Create a new one?</Text>
          <TouchableOpacity 
            onPress={() => props.navigation.navigate("CreateTodo", {
              type: "list",
              title: "Create New List"
            })}
            style={[buttons.global, buttons.md]}
          >
            <Text style={text.p}>New</Text>
          </TouchableOpacity>
        </View>
      }
    </View>
  )
}

Home.navigationOptions = () => ({
  header: null
})

export default Home;