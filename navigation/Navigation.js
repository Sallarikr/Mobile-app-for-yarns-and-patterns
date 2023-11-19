import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import * as React from "react";
import { Header } from '@rneui/themed';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Patterns from '../screens/Patterns';
import Search from '../screens/Search';
import Yarns from '../screens/Yarns';


//    const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


export default function App() {
    return (

        <View style={styles.container}>
            <Header
                backgroundColor="#FFCEEA"
                centerComponent={{
                    text: "Yarn and pattern stash",
                    style: { color: "#fff", fontSize: 22 },

                }}
                leftComponent={{ icon: "menu", color: "#fff", size: 28 }}
                rightComponent={{ icon: "person", color: "#fff", size: 28 }}
            />


            <NavigationContainer>
                <Tab.Navigator>
                    <Tab.Screen name="Home" component={Home} />
                    <Tab.Screen name="Search" icon="search" component={Search} />
                    <Tab.Screen name="Patterns" component={Patterns} />
                    <Tab.Screen name="Yarns" component={Yarns} />
                </Tab.Navigator>
            </NavigationContainer>

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 25,
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollview: {
        marginBottom: 20,
    },
});
