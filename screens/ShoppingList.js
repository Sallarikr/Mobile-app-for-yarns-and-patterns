import React, { useState, useEffect } from "react";
import { Alert, ScrollView, StyleSheet, View, } from "react-native";
import { Button, Card, Text } from "@rneui/base";
import { getDatabase, ref, onValue, remove } from 'firebase/database';

export default function ShoppingList() {
  const [shoppingListItems, setShoppingListItems] = useState([]);
  const database = getDatabase();

  useEffect(() => {
    const shoppingListRef = ref(database, 'shoppingList/');
    onValue(shoppingListRef, (snapshot) => {
      const data = snapshot.val();
      const shoppingList = data ? Object.keys(data).map((key) => ({ key, ...data[key] })) : [];
      setShoppingListItems(shoppingList);
    });
  }, []);

  const deleteItem = async (key) => {
    try {
      const shoppingListRef = ref(database, 'shoppingList/' + key);
      await remove(shoppingListRef);
      if (Alert) {
        Alert.alert('Item deleted from shopping list');
      }
    } catch (error) {
      if (Alert) {
        Alert.alert('Error deleting item from shopping list');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {shoppingListItems.map((item) => (
          <Card key={item.key} containerStyle={styles.cardContainer}>
            <Text>Manufacturer: {item.manufacturer}</Text>
            <Text>Name: {item.name}</Text>
            <View style={styles.buttonContainer}>
              <Button
                buttonStyle={styles.deleteButton}
                titleStyle={{ fontSize: 16 }}
                color='#d9a5cc'
                title='Delete'
                onPress={() => deleteItem(item.key)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    marginBottom: 5,
    width: 350,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: '100%',
  },
});
