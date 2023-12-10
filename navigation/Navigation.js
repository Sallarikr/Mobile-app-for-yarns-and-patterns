import * as React from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Header } from '@rneui/themed';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import Home from '../screens/Home';
import Favorites from '../screens/Favorites';
import Search from '../screens/Search';
import ShoppingList from '../screens/ShoppingList';

const Tab = createBottomTabNavigator();

export default function Navigation() {
    return (
        <View style={styles.container}>
            <Header
                backgroundColor="#d9a5cc"
                centerComponent={{
                    text: "Yarn and pattern stash",
                    style: { color: "#fff", fontSize: 22 },
                }}
                leftComponent={{ icon: "menu", color: "#fff", size: 28 }}
                rightComponent={{ icon: "person", color: "#fff", size: 28 }}
            />
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        "tabBarActiveTintColor": "#d9a5cc",
                        "tabBarInactiveTintColor": "lightgray",
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName;
                            if (route.name === 'Search') {
                                iconName = focused ? 'search' : 'search';
                            } else if (route.name === 'Favorites') {
                                iconName = focused ? 'heart' : 'heart';
                            } else if (route.name === 'Home') {
                                iconName = focused ? 'home' : 'home';
                            } else if (route.name === 'Shopping List') {
                                iconName = focused ? 'shopping-cart' : 'shopping-cart';
                            }
                            return <Icon name={iconName} size={size} color={color} />;
                        },
                    })}
                >
                    <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
                    <Tab.Screen name="Search" component={Search} />
                    <Tab.Screen name="Favorites" component={Favorites} />
                    <Tab.Screen name="Shopping List" component={ShoppingList} />
                </Tab.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
        flex: 1,
        backgroundColor: '#d9a5cc',
    },
});