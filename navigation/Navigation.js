import * as React from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
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
            <NavigationContainer independent={true}>
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
                            } else if (route.name === '♡Yarns & patterns♡') {
                                iconName = focused ? 'home' : 'home';
                            } else if (route.name === 'Shopping List') {
                                iconName = focused ? 'shopping-cart' : 'shopping-cart';
                            }
                            return <Icon name={iconName} size={size} color={color} />;
                        },
                    })}
                >
                    <Tab.Screen name="♡Yarns & patterns♡" component={Home} options={{ headerShown: false }} />
                    <Tab.Screen name="Search" component={Search} options={{ headerShown: false }} />
                    <Tab.Screen name="Favorites" component={Favorites} options={{ headerShown: false }} />
                    <Tab.Screen name="Shopping List" component={ShoppingList} options={{ headerShown: false }} />
                </Tab.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});