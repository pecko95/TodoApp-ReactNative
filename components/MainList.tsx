import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import {useAsyncStorage} from '@react-native-community/async-storage';
import {withNavigation} from 'react-navigation';

// List component
import TodoList from '../components/TodoList';
import SearchBar from './SearchBar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TodoItem from './TodoItem';
import BookmarkedItem from './BookmarkedItem';
import {ScrollView} from 'react-native-gesture-handler';
import {text} from '../styles/styles';

const MainList = (props: any) => {
  const {getItem} = useAsyncStorage('@todoList');
  const [todoListsArray, setTodoListsArray] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Get bookmarked items
  const [bookmarkedArray, setBookmarkedArray] = useState([] as Object[]);

  // Read saved items from local storage when app is opened
  useEffect(() => {
    readListFromStorage();

    // Read saved items from local storage when going back to home page
    props.navigation.addListener('willFocus', () => {
      readListFromStorage();
    });
  }, []);

  const readListFromStorage = async () => {
    const list = await getItem();

    // Check if list exists
    if (list !== null) {
      const parsedList = JSON.parse(list);
      let flatt: Object[] = [];
      parsedList.map((list: any) => flatt.push(...list.bookmarked));

      setTodoListsArray(parsedList);
      setBookmarkedArray(flatt);
    } else {
      setTodoListsArray([]);
    }
  };

  // Set the text to be used to filter the list out
  const searchList = (searchText: string) => {
    if (searchText !== '') {
      setSearchText(searchText);
    } else {
      setSearchText('');
    }
  };

  // Reload page on pull
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);

    await readListFromStorage();

    setRefreshing(false);

    console.log('BOOKMARKED ARRAY', bookmarkedArray);
  };

  return (
    <SafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* PAGE HEADER */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 30,
            paddingHorizontal: 20,
          }}>
          <SearchBar search={searchList} />
          <Icon
            name="note-add"
            size={30}
            color="grey"
            onPress={() =>
              props.navigation.navigate('CreateTodo', {
                type: 'list',
                title: 'Create New List',
              })
            }
          />
        </View>

        <View
          style={{
            padding: 10,
          }}>
          <Text style={[text.sectionTitle, {marginBottom: 20}]}>
            Todo Lists
          </Text>
          {todoListsArray && todoListsArray.length > 0 ? (
            searchText && searchText.length > 0 ? (
              // Check if searched item / list exists
              Boolean(
                todoListsArray.find(
                  (list: any) =>
                    list.title.toLowerCase().includes(searchText) ||
                    list.description.toLowerCase().includes(searchText),
                ),
              ) ? (
                // If it exists - filter only the resulst that match the search text
                todoListsArray
                  .filter(
                    (list: any) =>
                      list.title.toLowerCase().includes(searchText) ||
                      list.description.toLowerCase().includes(searchText),
                  )
                  .map((item: any) => (
                    <TodoList
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      date={item.date}
                      completed={item.listCompleted}
                    />
                  ))
              ) : (
                // If it doesnt exist - display message
                <Text style={[text.p, {marginBottom: 20}]}>
                  No such list was found
                </Text>
              )
            ) : (
              todoListsArray.map((item: any) => (
                <TodoList
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  date={item.date}
                  completed={item.listCompleted}
                />
              ))
            )
          ) : (
            <Text style={[text.p, {marginBottom: 20}]}>No lists found.</Text>
          )}

          <View
            style={{
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text style={text.sectionTitle}>BOOKMARKS</Text>
            <Icon
              name="bookmark"
              size={25}
              color="#1dd67a"
              style={{paddingLeft: 10}}
            />
          </View>
          {bookmarkedArray && bookmarkedArray.length > 0 ? (
            searchText && searchText.length > 0 ? (
              Boolean(
                bookmarkedArray.find((bookmark: any) =>
                  bookmark.todo.toLowerCase().includes(searchText),
                ),
              ) ? (
                bookmarkedArray
                  .filter((bookmark: any) =>
                    bookmark.todo.toLowerCase().includes(searchText),
                  )
                  .map((item: any) => (
                    <BookmarkedItem
                      key={item.todoID}
                      id={item.todoID}
                      text={item.todo}
                      listID={item.todoListID}
                      listTitle={item.todoListTitle}
                      completed={item.completed}
                      date={item.date}
                    />
                  ))
              ) : (
                <Text style={[text.p, {marginBottom: 20}]}>
                  No such bookmark found.
                </Text>
              )
            ) : (
              bookmarkedArray.map((item: any) => (
                <BookmarkedItem
                  key={item.todoID}
                  id={item.todoID}
                  text={item.todo}
                  listID={item.todoListID}
                  listTitle={item.todoListTitle}
                  completed={item.completed}
                  date={item.date}
                />
              ))
            )
          ) : (
            <Text style={[text.p, {marginBottom: 20}]}>
              No bookmarks found.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default withNavigation(MainList);
