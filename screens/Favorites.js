import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from "react-native-modal";
import { Button, Card, Text } from '@rneui/themed';
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
  const [isYarnsModalVisible, setYarnsModalVisible] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const patterns = favorites.filter((item) => item.itemType === 'pattern');
  const yarns = favorites.filter((item) => item.itemType === 'yarn');

  const togglePatternsModal = () => {
    setPatternsModalVisible(!isPatternsModalVisible);
  };

  const toggleYarnsModal = () => {
    setYarnsModalVisible(!isYarnsModalVisible);
  };

  useEffect(() => {
    const itemsRef = ref(database, 'items/');
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      const items = data ? Object.keys(data).map(key => ({ key, ...data[key] })) : [];
      setFavorites(items)
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
                <ScrollView showsVerticalScrollIndicator={false}>
                  {patterns.map((item) => (
                    <Card key={item.id} containerStyle={styles.cardContainer}>
                      <View style={styles.textContainer}>
                        {item.itemType === 'pattern' ? (
                          <View>
                            <Text>Designer: {item.designer}</Text>
                            <Text>Pattern name: {item.name}</Text>
                            <View style={styles.buttonContainer}>
                              <Button
                                titleStyle={{ fontSize: 16 }}
                                color='#d9a5cc'
                                onPress={() => information(item.key)}
                                icon={{
                                  size: 16,
                                  name: 'information-outline',
                                  type: 'ionicon',
                                  color: '#ffffff'
                                }}
                              />
                              <View style={styles.space} />
                              <Button
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
                          </View>
                        ) : null}
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
                <ScrollView showsVerticalScrollIndicator={false}>
                  {yarns.map((item) => (
                    <Card key={item.id} containerStyle={styles.cardContainer}>
                      <View style={styles.textContainer}>
                        {item.itemType === 'yarn' ? (
                          <View>
                            <Text>Manufacturer: {item.manufacturer}</Text>
                            <Text>Yarn name: {item.name}</Text>
                            <View style={styles.buttonContainer}>
                              <Button
                                titleStyle={{ fontSize: 16 }}
                                color='#d9a5cc'
                                onPress={() => information(item.key)}
                                icon={{
                                  size: 16,
                                  name: 'information-outline',
                                  type: 'ionicon',
                                  color: '#ffffff'
                                }}
                              />
                              <View style={styles.space} />
                              <Button
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
                          </View>
                        ) : null}
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
    width: 350
  },
  textContainer: {
    width: '90%'
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  space: {
    width: 5,
  },
  cardContainer: {
    marginBottom: 5,
    flex: 1,
  },
  modalCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonImage: {
    width: 225,
    height: 225,
  },
});