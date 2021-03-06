import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Animated, Easing } from "react-native";
import AsyncStorage, { useAsyncStorage } from "@react-native-community/async-storage";
import { withNavigation } from "react-navigation";

// Unique IDs generator
import uuid from "uuid";
import PageHeading from "../components/PageHeading";

// Animated touchable opacity component
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const CreateTodo = (props: any) => {
  // const [editState, setEditState] = useState(false);
  const { getItem, setItem } = useAsyncStorage("@todoList");
  const [listArray, setListArray] = useState([]);

  // List properties
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    readFromStorage();

    if (props.navigation.getParam("state") === "edit") {
      editState();
    }


  }, [])
  const readFromStorage = async () => {
    const list = await getItem();

    if (list !== null) {
      setListArray(JSON.parse(list));
    } else {
      setListArray([]);
    }
  }

  // Get current date and time
  const currentDateAndTime = () => {
    const date = new Date();
    const currentDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}, ${date.getHours()}:${date.getMinutes() < 10 ? `0${date.getMinutes()}`:date.getMinutes()}` // Format: mm/dd/yyyy, hh:mm:ss

    return currentDate;
  }

  // Save new list to storage
  const saveList = async () => {
    // Fields must be filled
    if (!title || !description) return;

    // Update the array of lists / todo items
    const newListArray: Object[] = [...listArray];
    newListArray.push({
      id: uuid.v4().slice(0, 8),
      title,
      description,
      date: `Created: ${currentDateAndTime()}`,
      children: [],
      bookmarked: [],
      listCompleted: false    
    })

    saveToStorage(newListArray);
  }

  // Add and save todo items in a specific todo list
  const addTodoToList = async() => {
    // Must have title - what the todo is
    if (!title) return;

    // Add item to the list
    const listItems: any[] = [...listArray];
    const listID = props.navigation.getParam("id");
    let list = listItems.find((list: any) => list.id === listID);
    const listIndex = listItems.findIndex((list: any) => list.id === listID);

    // If list exists, push todo items to list childrens array
    if (list) {
      list.children.push({
        todo: title,
        todoID: uuid.v4().slice(0, 8),
        date: `Added: ${currentDateAndTime()}`,
        completed: false,
        todoListID: list.id,
        todoListTitle: list.title
      })
    }

    // Update the list with new children
    listItems.splice(listIndex, 1, list);

    // Save to storage
    await setItem(JSON.stringify(listItems));

    // Go back to the todo list
    props.navigation.pop(); 
  }

  const editState = () => {
    setTitle(props.navigation.getParam("listTitleInput"));
    setDescription(props.navigation.getParam("desc"));
  }
  
  const editItem = async () => {
    const editedListArray: any[] = [...listArray];
    const id = props.navigation.getParam("id");
    const listIndex = editedListArray.findIndex((item: any) => item.id === id)
    let listItem = editedListArray.find((item: any) => item.id === id);
    if (listItem) {
      listItem = {
        ...listItem,
        id,
        title,
        description,
        date: `Updated: ${currentDateAndTime()}`,
      }
    }
    // Update object at specific index
    editedListArray.splice(listIndex, 1, listItem)

    saveToStorage(editedListArray);
  }

  // Save new / updated item
  const saveToStorage = async (array: Object[]) => {
    // Save to storage
    await setItem(JSON.stringify(array));

    // Clear input fields
    setTitle("");
    setDescription("");

    props.navigation.navigate("Home")
  }

  // Clear storage from lists
  const clearStorage = async () => {
    await AsyncStorage.clear();

    // Go back to home page
    props.navigation.navigate("Home");
  }

  const [buttonAnimation] = useState(new Animated.Value(0));
  const tiggerButtonAction = (state: string, type: string) => {
    // Reset animation value
    buttonAnimation.setValue(0);

    Animated.spring(buttonAnimation, {
      toValue: 2,
      useNativeDriver: true
    }).start(() => {
      // Call action after animation ends
      if (state === "edit") {
        editItem();
      } else if (type === "item") {
        addTodoToList();
      } else {
        saveList();
      }
    });
  }

  const buttonScale = buttonAnimation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 1.2, 1]
  })

  return (
    <View>
      <PageHeading 
        id="" 
        extraIcon={props.navigation.getParam("type") === "list" ? true : false} 
        clearList={() => clearStorage()} 
      />

      {/* List / Item title */}
      <View style={{
        padding: 20
      }}>
        <Text>Title: </Text>
        <TextInput
          placeholder="Enter title..."
          onChangeText={(title: string) => setTitle(title)}
          value={title}
          style={{
            borderBottomWidth: 2,
            borderBottomColor: "#444"
          }}
        />
      </View>
      
      {/* List / Item description */}
      {props.navigation.getParam("type") === "list" ? 
        <View style={{
          padding: 20
        }}>
          <Text>Description: </Text>
          <TextInput
            placeholder="Enter description"
            onChangeText={(description: string) => setDescription(description)}
            value={description}
            multiline={true}
            numberOfLines={8}
            style={{
              padding: 10,
              textAlignVertical: "top",
              borderBottomColor: "#444",
              borderBottomWidth: 2
            }}
          />
        </View>
      : null }

      {/* Save / Edit button */}
      <View style={{
        margin: 20,
        alignItems: "center"
      }}>
        <AnimatedTouchableOpacity onPress={() => {
          tiggerButtonAction(props.navigation.getParam("state"), props.navigation.getParam("type"));
          // if (props.navigation.getParam("state") === "edit") {
          //   editItem();
          // } else if (props.navigation.getParam("type") === "item") {
          //   addTodoToList();
          // } else {
          //   saveList();
          // }}
        }}
        style={{
          padding: 10,
          borderWidth: 1,
          borderColor: "#999",
          borderRadius: 25,
          width: 120,
          justifyContent: "center",
          alignItems: "center",
          transform: [
            {
              scale: buttonScale
            }
          ]
        }}>
          <View>
            {props.navigation.getParam("type") === "list" ?
              <Text>{props.navigation.getParam("state") === "edit" ? 'Edit List' : 'Create List'}</Text>
            :
              <Text>Add todo</Text>
            }
          </View>
        </AnimatedTouchableOpacity>
      </View>
    </View>
  )
}

CreateTodo.navigationOptions = ({ navigation }: any) => ({
  title: navigation.getParam("title")
})

export default withNavigation(CreateTodo);