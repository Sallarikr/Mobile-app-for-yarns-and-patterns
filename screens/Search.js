import { Button, Input, Text } from '@rneui/themed';
import { ActionSheetIOS, Alert, StyleSheet, View } from 'react-native';
import { useState, useEffect } from "react";
import { decode, encode } from 'base-64';
import { API_USERNAME, API_PASSWORD } from '@env';
import { initializeApp } from 'firebase/app';
import { getDatabase, push, ref, onValue } from 'firebase/database';
import firebaseConfig from '../firebaseConfig';

if (!global.btoa) {
  global.btoa = encode;
}
if (!global.atob) {
  global.atob = decode;
}

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function Search() {

  const [itemType, setItemType] = useState();
  const [search, setSearch] = useState('');
  const [searhBarText, setSearchBarText] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [yarnName, setYarnName] = useState('');
  const [creator, setCreator] = useState('');
  const [patternName, setPatternName] = useState('');
  const [items, setItems] = useState([]);

  const searchContent = async () => {

    const options = {
      headers: {
        'Authorization': 'Basic ' + btoa(`${API_USERNAME}:${API_PASSWORD}`)
      }
    };

    try {
      if (itemType === 'pattern') {
        const ravelryPatternURL = 'https://api.ravelry.com/patterns/search.json?query=' + search;
        if (search.length === 0) {
          Alert.alert('Please enter some text to the search bar')
        } else {
          fetch(ravelryPatternURL, options)
            .then(res => res.json())
            .then(data => {
              const patternArray = [];
              if (data && data.patterns) {
                data.patterns.forEach(pattern => {
                  const patternInfo = {
                    designer: pattern.designer.name,
                    name: pattern.name,
                  };
                  patternArray.push(patternInfo);
                });
              }
              if (patternArray.length === 0) {
                Alert.alert('No patterns found');
              } else {
                /////tietokantaan lisäys
              }           
              console.log(patternArray); // POISTA
            });
        }
      } else if (itemType === 'yarn') {
        const ravelryYarnURL = 'https://api.ravelry.com/yarns/search.json?query=' + search;
        if (search.length === 0) {
          Alert.alert('Please enter some text to the search bar')
        } else {
          fetch(ravelryYarnURL, options)
            .then(res => res.json())
            .then(data => {
              const yarnArray = [];
              if (data && data.yarns) {
                data.yarns.forEach(yarn => {
                  const yarnInfo = {
                    manufacturer: yarn.yarn_company_name,
                    name: yarn.name,
                  };
                  yarnArray.push(yarnInfo);
                });
                if (yarnArray.length === 0) {
                  Alert.alert('No yarns found');
                } else {
                  /////tietokantaan lisäys
               //   Alert.alert(yarnArray[0].manufacturer + ' ' + yarnArray[0].name)
                }
              }
              console.log(yarnArray);
            });
        }
      }
    } catch (error) {
      console.error('Error', error);
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

    useEffect(() => {
    const itemsRef = ref(database, 'items/');
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      const results = data ? Object.keys(data).map(key => ({ key, ...data[key] })) : [];
      setItems(results);
    })
  }, []);

  return (

    <View style={styles.container}>
      <Text style={styles.h1}>Pattern and yarn search</Text>
      <Button onPress={categorySheet} color='#d9a5cc' title="What category do you want to search?" />
      <Input
        inputContainerStyle={styles.input}
        placeholder={searhBarText}
        onChangeText={search => setSearch(search)}
        value={search}
      />
      <View style={styles.searchContainer}>
        <View style={{ flex: 1 }}>
        </View><View style={styles.searchButton}>
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
        </View>
      </View>
    </View>
  )
}

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: {
    fontSize: 30,
    margin: 10,
  },
  input: {
    width: 350,
    marginLeft: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 10,
  },
  picker: {
    height: 50,
    width: 200,
    borderColor: "lightgrey",
    borderWidth: 1,
    marginLeft: 20,
  },
  searchButton: {
    marginRight: 20,
  },

  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    width: 100,
    marginTop: 10,
    marginRight: 10,
  },
});