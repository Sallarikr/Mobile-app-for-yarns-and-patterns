import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as React from "react";
import { Card } from "@rneui/base";


export default function App() {
    return (
        <View style={styles.container}>

        <ScrollView>
            <Card containerStyle={{}} wrapperStyle={{}}>
                <Card.Title>Otsikko</Card.Title>
                <Card.Divider />
                <View
                    style={{
                        position: "relative",
                        alignItems: "center"
                    }}
                >
                    <Image
                        style={{ width: "100%", height: 100 }}
                        resizeMode="contain"
                        source={{
                            uri:
                                "https://m.media-amazon.com/images/I/81ojxqSBLFL.jpg"
                        }}
                    />
                    <Text>Teksti</Text>
                </View>
            </Card>


            <Card containerStyle={{}} wrapperStyle={{}}>
                <Card.Title>Otsikko</Card.Title>
                <Card.Divider />
                <View
                    style={{
                        position: "relative",
                        alignItems: "center"
                    }}
                >
                    <Image
                        style={{ width: "100%", height: 100 }}
                        resizeMode="contain"
                        source={{
                            uri:
                                "https://m.media-amazon.com/images/I/81ojxqSBLFL.jpg"
                        }}
                    />
                    <Text>Teksti</Text>
                </View>
            </Card>


            <Card containerStyle={{}} wrapperStyle={{}}>
                <Card.Title>Otsikko</Card.Title>
                <Card.Divider />
                <View
                    style={{
                        position: "relative",
                        alignItems: "center"
                    }}
                >
                    <Image
                        style={{ width: "100%", height: 100 }}
                        resizeMode="contain"
                        source={{
                            uri:
                                "https://m.media-amazon.com/images/I/81ojxqSBLFL.jpg"
                        }}
                    />
                    <Text>Teksti</Text>
                </View>
            </Card>


            <Card containerStyle={{}} wrapperStyle={{}}>
                <Card.Title>Otsikko</Card.Title>
                <Card.Divider />
                <View
                    style={{
                        position: "relative",
                        alignItems: "center"
                    }}
                >
                    <Image
                        style={{ width: "100%", height: 100 }}
                        resizeMode="contain"
                        source={{
                            uri:
                                "https://m.media-amazon.com/images/I/81ojxqSBLFL.jpg"
                        }}
                    />
                    <Text>Teksti</Text>
                </View>
            </Card>
        </ScrollView>
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