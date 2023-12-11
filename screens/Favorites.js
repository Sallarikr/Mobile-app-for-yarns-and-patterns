import { Alert, Keyboard, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from "react-native-modal";
import { Button, Card, Image, Text } from '@rneui/themed';
import { useState, useEffect } from 'react';
import PatternsImg from '../images/PatternsImg.jpg';
import YarnsImg from '../images/YarnsImg.jpg';
import { initializeApp } from 'firebase/app';
import { getDatabase, remove, ref, onValue } from 'firebase/database';
import firebaseConfig from '../firebaseConfig';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function Favorites() {

  const [isPatternsModalVisible, setPatternsModalVisible] = useState(false);
  const [isPatternInfoModalVisible, setPatternInfoModalVisible] = useState(false);
  const [isYarnsModalVisible, setYarnsModalVisible] = useState(false);
  const [isYarnInfoModalVisible, setYarnInfoModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchText, setSearchText] = useState('');

  const patterns = favorites.filter((item) => item.itemType === 'pattern');
  const yarns = favorites.filter((item) => item.itemType === 'yarn');

  const togglePatternsModal = () => {
    setPatternsModalVisible(!isPatternsModalVisible);
  };

  const togglePatternInfoModal = (key) => {
    const selectedItem = favorites.find(item => item.key === key);
    setSelectedItem(selectedItem);
    setPatternInfoModalVisible(!isPatternInfoModalVisible);
  };

  const toggleYarnsModal = () => {
    setYarnsModalVisible(!isYarnsModalVisible);
  };

  const toggleYarnInfoModal = (key) => {
    const selectedItem = favorites.find(item => item.key === key);
    setSelectedItem(selectedItem);
    setYarnInfoModalVisible(!isYarnInfoModalVisible);
  };

  useEffect(() => {
    const itemsRef = ref(database, 'items/');
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      const items = data ? Object.keys(data).map(key => ({ key, ...data[key] })) : [];
      setFavorites(items);
    });
  }, []);

  const deleteItem = (key) => {
    remove(
      ref(database, 'items/' + key))
    Alert.alert('Item deletion was a success')
  }

  const confirmDeletion = (key) => {
    Alert.alert(
      'Delete',
      'Are you sure you want to delete this item from your favorites?',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Yes',
          onPress: () => deleteItem(key),
        }
      ],
      {
        cancelable: true
      }
    );
  }

  const filteredPatterns = patterns.filter((item) =>
    item.designer.toLowerCase().includes(searchText.toLowerCase()) ||
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.yarn_weight.toLowerCase().includes(searchText.toLowerCase()) ||
    item.craft.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredYarns = yarns.filter((item) =>
    item.manufacturer.toLowerCase().includes(searchText.toLowerCase()) ||
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.yarn_weight.toLowerCase().includes(searchText.toLowerCase())
  );

  const clearSearch = () => {
    setSearchText('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.modalCardContainer}>
      <Card>
        <TouchableOpacity onPress={togglePatternsModal}>
          <Image source={PatternsImg} style={styles.buttonImage} />
        </TouchableOpacity>
        <Modal isVisible={isPatternsModalVisible} style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.container}>
              <View style={styles.listContainer}>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search patterns..."
                    onChangeText={(text) => setSearchText(text)}
                    value={searchText}
                  /></View>
                <Button style={styles.searchButton} title="Clear" onPress={clearSearch} color="#d9a5cc" />
                <ScrollView showsVerticalScrollIndicator={false}>
                  {filteredPatterns.map((item) => (
                    <Card key={item.key} containerStyle={styles.cardContainer}>
                      <Text style={styles.h1}>Designer: {item.designer}</Text>
                      <Text style={styles.h1}>Pattern name: {item.name}</Text>
                      <View>
                        <Image
                          style={styles.images}
                          source={{ uri: item.image }}
                        /></View>
                      <Modal isVisible={isPatternInfoModalVisible} style={styles.modal}>
                        <View style={styles.modalContent}>
                          <View style={styles.container}>
                            {selectedItem && selectedItem.itemType === 'pattern' && (
                              <Card key={selectedItem.id} containerStyle={styles.cardContainer}>
                                <View style={styles.textContainer}>
                                  <Text style={styles.h2}>{selectedItem.name}</Text>
                                  <Text></Text>
                                  <Text style={styles.h1}>♡ Craft: {selectedItem.craft ?? 'Unknown'}</Text>
                                  <Text style={styles.h1}>♡ Is the pattern free: {item.free ? 'Yes' : 'No'}</Text>
                                  <Text style={styles.h1}>♡ Available languages: {selectedItem.languages.join(', ') ?? 'Unknown'}</Text>
                                  <Text style={styles.h1}>♡ Yarn weight: {selectedItem.yarn_weight ?? 'Unknown'}</Text>
                                  <Text style={styles.h1}>♡ Needle or hook size: {selectedItem.needles.join(', ') ?? 'Unknown'}</Text>
                                  <Text style={styles.h1}>♡ Required meters:  {Math.round((selectedItem.yardage_min || 0) * 0.9144)} - {Math.round((selectedItem.yardage_max || 0) * 0.9144)} meters</Text>
                                  <Text style={styles.h1}>♡ Required yardage: {selectedItem.yardage_min ?? 0} - {selectedItem.yardage_max ?? 0} yards</Text>
                                  <Text style={styles.h1}>♡ Source: {selectedItem.sourceName ?? 'Unknown'}</Text>
                                </View>
                              </Card>
                            )}
                            <Button title="Close" onPress={togglePatternInfoModal} color="#d9a5cc" />
                          </View>
                        </View>
                      </Modal>
                      <View style={styles.buttonContainer}>
                        <Button
                          buttonStyle={{ width: 85 }}
                          titleStyle={{ fontSize: 16 }}
                          color='#d9a5cc'
                          onPress={() => togglePatternInfoModal(item.key)}
                          icon={{
                            size: 16,
                            name: 'information-outline',
                            type: 'ionicon',
                            color: '#ffffff'
                          }}
                        />
                        <View style={styles.space} />
                        <Button
                          buttonStyle={{ width: 85 }}
                          titleStyle={{ fontSize: 16 }}
                          color='#d9a5cc'
                          onPress={() => confirmDeletion(item.key)}
                          icon={{
                            size: 16,
                            name: 'trash-outline',
                            type: 'ionicon',
                            color: '#ffffff'
                          }}
                        />
                      </View>
                    </Card>
                  ))}
                </ScrollView>
                <Button title="Close" onPress={togglePatternsModal} color='#d9a5cc' />
              </View>
            </View>
          </View>
        </Modal>
      </Card>
      <Card>
        <TouchableOpacity onPress={toggleYarnsModal}>
          <Image source={YarnsImg} style={styles.buttonImage} />
        </TouchableOpacity>
        <Modal isVisible={isYarnsModalVisible} style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.container}>
              <View style={styles.listContainer}>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search yarns..."
                    onChangeText={(text) => setSearchText(text)}
                    value={searchText}
                  /></View>
                <Button style={styles.searchButton} title="Clear" onPress={clearSearch} color="#d9a5cc" />
                <ScrollView showsVerticalScrollIndicator={false}>
                  {filteredYarns.map((item) => (
                    <Card key={item.key} containerStyle={styles.cardContainer}>
                      <Text style={styles.h1}>Manufacturer: {item.manufacturer}</Text>
                      <Text style={styles.h1}>Yarn name: {item.name}</Text>
                      <View>
                        <Image
                          style={styles.images}
                          source={{ uri: item.image }}
                        /></View>
                      <Modal isVisible={isYarnInfoModalVisible} style={styles.modal}>
                        <View style={styles.modalContent}>
                          <View style={styles.container}>
                            {selectedItem && selectedItem.itemType === 'yarn' && (
                              <Card key={selectedItem.id} containerStyle={styles.cardContainer}>
                                <View style={styles.textContainer}>
                                  <Text style={styles.h1}>♡ Yarn weight: {item.yarn_weight ?? 'Unknown'}</Text>
                                  <Text style={styles.h1}>♡ Grams: {item.grams ?? 'Unknown'} grams</Text>
                                  <Text style={styles.h1}>♡ Yardage: {item.yardage ?? 0} yards</Text>
                                  <Text style={styles.h1}>♡ Yardage in meters: {Math.round((item.yardage || 0) * 0.9144)} meters</Text>
                                  <Text style={styles.h1}>♡ Machine washable: {item.machine_washable ? 'Yes' : 'No'}</Text>
                                  <Text style={styles.h1}>♡ Discontinued: {item.discontinued ? 'Yes' : 'No'}</Text>
                                </View>
                              </Card>
                            )}
                            <Button title="Close" onPress={toggleYarnInfoModal} color="#d9a5cc" />
                          </View>
                        </View>
                      </Modal>
                      <View style={styles.buttonContainer}>
                        <Button
                          buttonStyle={{ width: 85 }}
                          titleStyle={{ fontSize: 16 }}
                          color='#d9a5cc'
                          onPress={() => toggleYarnInfoModal(item.key)}
                          icon={{
                            size: 16,
                            name: 'information-outline',
                            type: 'ionicon',
                            color: '#ffffff'
                          }}
                        />
                        <View style={styles.space} />
                        <Button
                          buttonStyle={{ width: 85 }}
                          titleStyle={{ fontSize: 16 }}
                          color='#d9a5cc'
                          onPress={() => confirmDeletion(item.key)}
                          icon={{
                            size: 16,
                            name: 'trash-outline',
                            type: 'ionicon',
                            color: '#ffffff'
                          }}
                        />
                      </View>
                    </Card>
                  ))}
                </ScrollView>
                <Button title="Close" onPress={toggleYarnsModal} color='#d9a5cc' />
              </View>
            </View>
          </View>
        </Modal>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'top',
  },
  listContainer: {
    flex: 1,
    width: 350,
  },
  textContainer: {
    width: '90%'
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 5,
  },
  space: {
    width: 5,
  },
  cardContainer: {
    marginBottom: 5,
    width: 325,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    height: '100%',
  },
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#d9a5cc',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonImage: {
    width: 300,
    height: 225,
  },
  images: {
    width: 275,
    height: 275,
  },
  h1: {
    fontSize: 20,
  },
  h2: {
    fontSize: 25,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    width: '90%',
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 10,
    width: 365,
  },
  searchButton: {
    marginRight: 35,
    alignItems: 'center',
  },
});