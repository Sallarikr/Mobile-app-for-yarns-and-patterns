import { Button, Icon, Image, Input, Text } from '@rneui/themed';
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

  const fetchPatternExtras = async (patternId) => {
    try {
      const ravelryPatternItemURL = `https://api.ravelry.com/patterns/${patternId}.json`;
      const response = await fetch(ravelryPatternItemURL, options);
      const data = await response.json();
      const craft = data.pattern.craft ? data.pattern.craft.name : 'Unknown';
      const languages = data.pattern.languages ? data.pattern.languages.map(lang => lang.name) : 'Unknown';
      const needles = data.pattern.pattern_needle_sizes ? data.pattern.pattern_needle_sizes.map(needle => needle.name) : 'Unknown';
      const yardage_min = data.pattern.yardage;
      const yardage_max = data.pattern.yardage_max;
      const yarn_weight = data.pattern.yarn_weight ? data.pattern.yarn_weight.name : 'Unknown';
      const patternExtras = {
        craft: craft,
        languages: languages,
        needles: needles,
        yardage_min: yardage_min,
        yardage_max: yardage_max,
        yarn_weight: yarn_weight,
      };
      return patternExtras;
    } catch (error) {
      console.error('Error fetching data:', error);
      return 'Unknown';
    }
  };

  const searchContent = async () => {
    try {
      setLoading(true);
      if (itemType === 'pattern') {
        const ravelryPatternURL = 'https://api.ravelry.com/patterns/search.json?query=' + search;
        if (search.length === 0) {
          setLoading(false);
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
                    free: pattern.free,
                    image: pattern.first_photo ? pattern.first_photo.medium_url : 'https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg',
                    pattern_extras: await fetchPatternExtras(pattern.id),
                  };
                  patternArray.push(patternInfo);
                }
              }
              if (patternArray.length === 0) {
                setLoading(false);
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
          setLoading(false);
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
                    discontinued: yarn.discontinued,
                    machine_washable: yarn.machine_washable,
                    grams: yarn.grams,
                    yardage: yarn.yardage,
                    image: yarn.first_photo ? yarn.first_photo.medium_url : 'https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg',
                  };
                  yarnArray.push(yarnInfo);
                });
                if (yarnArray.length === 0) {
                  setLoading(false);
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
          setLoading(false);
          Alert.alert("Please select a search category and enter some text to the search bar");
        } else if ((search.length > 0) && itemType === ('')) {
          setLoading(false);
          Alert.alert("Please select a search category first");
        }
      }
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error during search:', error);
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
          'free': item.free,
          'image': item.image,
          'craft': item.pattern_extras.craft,
          'languages': item.pattern_extras.languages,
          'needles': item.pattern_extras.needles,
          'yardage_min': item.pattern_extras.yardage_min,
          'yardage_max': item.pattern_extras.yardage_max,
          'yarn_weight': item.pattern_extras.yarn_weight,
        });
        setItems((prevItems) => [
          ...prevItems,
          {
            'itemType': itemType,
            'id': item.id,
            'designer': item.designer,
            'name': item.name,
            'sourceName': sources,
            'free': item.free,
            'image': item.image,
            'craft': item.pattern_extras.craft,
            'languages': item.pattern_extras.languages,
            'needles': item.pattern_extras.needles,
            'yardage_min': item.pattern_extras.yardage_min,
            'yardage_max': item.pattern_extras.yardage_max,
            'yarn_weight': item.pattern_extras.yarn_weight,
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
          'yarn_weight': item.yarn_weight,
          'discontinued': item.discontinued,
          'machine_washable': item.machine_washable,
          'grams': item.grams,
          'yardage': item.yardage,
          'image': item.image,
        });
        setItems((prevItems) => [
          ...prevItems,
          {
            'itemType': itemType,
            'id': item.id,
            'manufacturer': item.manufacturer,
            'name': item.name,
            'yarn_weight': item.yarn_weight,
            'discontinued': item.discontinued,
            'machine_washable': item.machine_washable,
            'grams': item.grams,
            'yardage': item.yardage,
            'image': item.image,
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

  const saveToShoppingList = async (item) => {
    try {
      const shoppingListRef = ref(database, 'shoppingList/');
      const snapshot = await get(shoppingListRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const existingItem = Object.values(data).find(
          (shoppingListItem) => shoppingListItem.id === item.id
        );
        if (existingItem) {
          Alert.alert('This item is already in the shopping list');
          return;
        }
      }
      const newItemRef = push(shoppingListRef, item);
      Alert.alert('Saved to shopping list');
    } catch (error) {
      Alert.alert('Error saving to Shopping List');
    }
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
            title="Clear"
            icon={{
              size: 16,
              name: 'close-circle-outline',
              type: 'ionicon',
              color: '#ffffff'
            }}
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
                  <Text style={styles.h1}>Designer: {item.designer ?? 'Unknown'}</Text>
                  <Text style={styles.h1}>Pattern name: {item.name ?? 'Unknown'}</Text>
                  <View>
                    <Image
                      style={styles.images}
                      source={{ uri: item.image }}
                    /></View>
                  <Text style={styles.text}>Free: {item.free ? 'Yes' : 'No'}</Text>
                  <Text style={styles.text}>Craft: {item.pattern_extras.craft ?? 'Unknown'}</Text>
                  <Text style={styles.text}>Languages: {item.pattern_extras.languages.join(', ') ?? 'Unknown'}</Text>
                  <Text style={styles.text}>Needles: {item.pattern_extras.needles.join(', ') ?? 'Unknown'}</Text>
                  <Text style={styles.text}>Yardage: {item.pattern_extras.yardage_min ?? 0} - {item.pattern_extras.yardage_max ?? 0} yards</Text>
                  <Text style={styles.text}>Yardage in meters: {Math.round(item.pattern_extras.yardage_min * 0.9144) ?? 0} - {Math.round(item.pattern_extras.yardage_max * 0.9144) ?? 0} meters</Text>
                  <Text style={styles.text}>Yarn weight: {item.pattern_extras.yarn_weight ?? 'Unknown'}</Text>
                  <View>
                    {item.sources.map((source, index) => (
                      <View key={index}>
                        {index === 0 && (
                          <Text style={styles.text}>Book or source: {source.sourceName}</Text>
                        )}
                        {index > 0 && (
                          <Text style={styles.text}>/ {source.sourceName}</Text>
                        )}
                      </View>))}
                  </View>
                  <View style={styles.iconContainer}>
                    <Icon
                      onPress={() => confirmSave(item, 'pattern')}
                      size={40}
                      name='heart'
                      type='ionicon'
                      color='#d9a5cc'
                    />
                  </View>
                </View>
              ) : itemType === 'yarn' ? (
                <View>
                  <Text style={styles.h1}>Manufacturer: {item.manufacturer ?? 'Unknown'}</Text>
                  <Text style={styles.h1}>Yarn name: {item.name ?? 'Unknown'}</Text>
                  <View>
                    <Image
                      style={styles.images}
                      source={{ uri: item.image }}
                    />
                  </View>
                  <Text style={styles.text}>Yarn weight: {item.yarn_weight ?? 'Unknown'}</Text>
                  <Text style={styles.text}>Discontinued: {item.discontinued ? 'Yes' : 'No'}</Text>
                  <Text style={styles.text}>Machine washable: {item.machine_washable ? 'Yes' : 'No'}</Text>
                  <Text style={styles.text}>Grams: {item.grams ?? 0} grams</Text>
                  <Text style={styles.text}>Yardage: {item.yardage ?? 0} yards</Text>
                  <Text style={styles.text}>Yardage in meters: {Math.round(item.yardage * 0.9144) ?? 0} meters</Text>
                  <View style={styles.yarnButtons}>
                    <Icon
                      onPress={() => confirmSave(item, 'yarn')}
                      size={40}
                      name='heart'
                      type='ionicon'
                      color='#d9a5cc'
                    />
                    <View style={styles.space} />
                    <Icon
                      onPress={() => saveToShoppingList(item)}
                      size={40}
                      name='cart'
                      type='ionicon'
                      color='#d9a5cc'
                    />
                  </View>
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
    marginRight: 35,
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
  images: {
    width: 300,
    height: 300,
  },
  h1: {
    fontSize: 20
  },
  text: {
    fontSize: 16
  },
  yarnButtons: {
    marginRight: 35,
    flexDirection: 'row',
    justifyContent: 'center'
  },
});