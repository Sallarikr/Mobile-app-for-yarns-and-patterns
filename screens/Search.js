import { Button, Icon, Input, Text } from '@rneui/themed';
import { Card } from "@rneui/base";
import { ActionSheetIOS, ActivityIndicator, Alert, Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { useState, useEffect } from "react";
import { decode, encode } from 'base-64';
import { API_USERNAME, API_PASSWORD } from '@env';
import { initializeApp } from 'firebase/app';
import { getDatabase, push, get, ref, onValue } from 'firebase/database';
import firebaseConfig from '../firebaseConfig';

if (!global.btoa) {
  global.btoa = encode;
}
if (!global.atob) {
  global.atob = decode;
}

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function Search() {

  const [itemType, setItemType] = useState('');
  const [search, setSearch] = useState('');
  const [searchBarText, setSearchBarText] = useState('Please choose a category from above');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [searchedItems, setSearchedItems] = useState([]);
  
  const options = {
    headers: {
      'Authorization': 'Basic ' + btoa(`${API_USERNAME}:${API_PASSWORD}`)
    }
  };

  const fetchYarnWeight = async (patternId) => {
    const ravelryPatternItemURL = `https://api.ravelry.com/patterns/${patternId}.json`;
    const response = await fetch(ravelryPatternItemURL, options);
    const data = await response.json();
    const yarnWeight = data.pattern.yarn_weight ? data.pattern.yarn_weight.name : 'N/A';
    return yarnWeight;
  };

  const searchContent = async () => {
    try {
      setLoading(true);
      if (itemType === 'pattern') {
        const ravelryPatternURL = 'https://api.ravelry.com/patterns/search.json?query=' + search;
        if (search.length === 0) {
          Alert.alert('Please enter some text to the search bar')
        } else {
          fetch(ravelryPatternURL, options)
            .then((res) => res.json())
            .then(async (data) => {
              const patternArray = [];
              if (data && data.patterns) {
                for (const pattern of data.patterns) {
                  const sources = pattern.pattern_sources.map((source) => ({
                    sourceName: source.name,
                  }));
                  const sourceNames = sources[0]?.name === sources[1]?.name;
                  const sourceName = sourceNames
                    ? sources[0]?.sourceName
                    : `${sources[0]?.sourceName}/${sources[1]?.sourceName}`;
                  const patternInfo = {
                    id: pattern.id,
                    designer: pattern.designer.name,
                    name: pattern.name,
                    sources: sources,
                    sourceName: sourceName,
                  };
                  const yarnWeight = await fetchYarnWeight(pattern.id);
                  patternInfo.yarn_weight = yarnWeight;
                  patternArray.push(patternInfo);
                }
              }
              if (patternArray.length === 0) {
                Alert.alert('No patterns found');
              } else {
                setSearchedItems(patternArray);
              }
            })
            .finally(() => {
              setLoading(false);
            });
        }
      } else if (itemType === 'yarn') {
        const ravelryYarnURL = 'https://api.ravelry.com/yarns/search.json?query=' + search;
        if (search.length === 0) {
          Alert.alert('Please enter some text to the search bar')
        } else {
          fetch(ravelryYarnURL, options)
            .then(res => res.json())
            .then(async (data) => {
              const yarnArray = [];
              if (data && data.yarns) {
                data.yarns.forEach(yarn => {
                  const yarnInfo = {
                    id: yarn.id,
                    manufacturer: yarn.yarn_company_name,
                    name: yarn.name,
                    yarn_weight: yarn.yarn_weight.name,
                  };
                  yarnArray.push(yarnInfo);
                });
                if (yarnArray.length === 0) {
                  Alert.alert('No yarns found');
                } else {
                  setSearchedItems(yarnArray);
                }
              }
            })
            .finally(() => {
              setLoading(false);
            });
        }
      } else {
        if (itemType === ('') && (search.length === 0)) {
          Alert.alert("Please select a search category and enter some text to the search bar");
        } else if ((search.length > 0) && itemType === ('')) {
          Alert.alert("Please select a search category first");
        }
      }
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error', error);
      setLoading(false);
    }
  }

  const categorySheet = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Patterns', 'Yarns', 'Cancel'],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 2,
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          setItemType('pattern');
          setSearchBarText('Search from patterns...')
        } else if (buttonIndex === 1) {
          setItemType('yarn');
          setSearchBarText('Search from yarns...')
        } else {
          setItemType('');
          setSearchBarText('Please choose a category from above')
        }
      },
    );

  const loadSavedItems = () => {
    const itemsRef = ref(database, 'items/');
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      const results = data ? Object.keys(data).map(key => ({ key, ...data[key] })) : [];
      setItems(results);
    });
  };

  useEffect(() => {
    if (itemType === '') {
      loadSavedItems();
    }
  }, [itemType, loading]);

  const saveItem = async (item) => {
    try {
      const itemsRef = ref(database, 'items/');
      const snapshot = await get(itemsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const existingItem = Object.values(data).find(
          (savedItem) => savedItem.id === item.id && savedItem.itemType === itemType
        );
        if (existingItem) {
          Alert.alert('This item has already been added to favorites');
          return;
        }
      }
      if (itemType === 'pattern') {
        const sources = item.sources.map(source => source.sourceName).join('/');
        const newItemRef = push(ref(database, 'items/'), {
          'itemType': itemType,
          'id': item.id,
          'designer': item.designer,
          'name': item.name,
          'sourceName': sources,
          'yarn_weight': item.yarn_weight,
        });
        setItems((prevItems) => [
          ...prevItems,
          {
            'itemType': itemType,
            'id': item.id,
            'designer': item.designer,
            'name': item.name,
            'sourceName': sources,
            'yarn_weight': item.yarn_weight,
            'id': newItemRef.key,
          },
        ]);
        Alert.alert('Added to favorites');
      } else if (itemType === 'yarn') {
        const newItemRef = push(ref(database, 'items/'), {
          'itemType': itemType,
          'id': item.id,
          'manufacturer': item.manufacturer,
          'name': item.name,
          'yarn_weight': item.yarn_weight.name,

        });
        setItems((prevItems) => [
          ...prevItems,
          {
            'itemType': itemType,
            'id': item.id,
            'manufacturer': item.manufacturer,
            'name': item.name,
            'yarn_weight': item.yarn_weight.name,

            'id': newItemRef.key,
          },
        ]);
        Alert.alert('Added to favorites');
      }
    } catch (error) {
      Alert.alert('Something went wrong!')
    }
  };

  const confirmSave = (item, itemType) => {
    if (itemType === 'pattern') {
      Alert.alert(
        'Add the selected pattern to favorites?',
        '',
        [
          {
            text: 'Cancel',
          },
          {
            text: 'Yes',
            onPress: () => saveItem(item),
          }
        ],
        {
          cancelable: true
        }
      );
    } else if (itemType === 'yarn') {
      Alert.alert(
        'Add the selected yarn to favorites?',
        '',
        [
          {
            text: 'Cancel',
          },
          {
            text: 'Yes',
            onPress: () => saveItem(item),
          }
        ],
        {
          cancelable: true
        }
      );
    }
  }

  const clearSearch = () => {
    setItems([]);
    setSearch('');
    setItemType('');
    setSearchBarText('Please choose a category from above');
    setSearchedItems([]);
    setLoading(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Button onPress={categorySheet} color='#d9a5cc' title="What category do you want to search?" />
      <Input
        inputContainerStyle={styles.input}
        placeholder={searchBarText}
        onChangeText={search => setSearch(search)}
        value={search}
      />
      <View style={styles.searchContainer}>
        <View style={{ flex: 1 }}>
        </View>
        <View style={styles.searchButtons}>
          <Button
            title='Search'
            onPress={searchContent}
            color='#d9a5cc'
            icon={{
              size: 16,
              name: 'search-outline',
              type: 'ionicon',
              color: '#ffffff'
            }}
          />
          <View style={styles.space} />
          <Button
            onPress={clearSearch}
            color='#d9a5cc'
            title="Clear Search"
          />
        </View>
      </View>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d9a5cc" />
        </View>
      )}
      <ScrollView>
        {searchedItems.map((item) => (
          <Card key={item.id} containerStyle={styles.cardContainer}>
            <View>
              {itemType === 'pattern' ? (
                <View>
                  <Text>Designer: {item.designer}</Text>
                  <Text>Pattern name: {item.name}</Text>
                  <Text>Yarn weight: {item.yarn_weight}</Text>
                  <View>
                    {item.sources.map((source, index) => (
                      <View key={index}>
                        {index === 0 && (
                          <Text>Book or source: {source.sourceName}</Text>
                        )}
                        {index > 0 && (
                          <Text>/ {source.sourceName}</Text>
                        )}
                      </View>))}
                  </View>
                  <View style={styles.iconContainer}>
                    <Icon
                      onPress={() => confirmSave(item, 'pattern')}
                      size={30}
                      name='heart'
                      type='ionicon'
                      color='#d9a5cc'
                    />
                  </View>
                </View>
              ) : itemType === 'yarn' ? (
                <View>
                  <Text>Manufacturer: {item.manufacturer}</Text>
                  <Text>Yarn name: {item.name}</Text>
                  <Text>Yarn weight: {item.yarn_weight}</Text>
                  <Icon
                    onPress={() => confirmSave(item, 'yarn')}
                    size={30}
                    name='heart'
                    type='ionicon'
                    color='#d9a5cc'
                  />
                </View>
              ) : null}
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'top',
  },
  input: {
    width: 350,
    marginLeft: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 10,
  },
  searchButtons: {
    marginRight: 20,
    flexDirection: 'row'
  },
  space: {
    width: 5,
  },
  cardContainer: {
    marginBottom: 5,
    width: 350,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});