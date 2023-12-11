import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation } from '@react-navigation/native';

const Authentication = () => {
  const navigation = useNavigation();
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      LocalAuthentication.hasHardwareAsync().then((result) => {
        setIsBiometricAvailable(result);
      });
    }
  }, []);

  const handleAuthenticate = async () => {
    try {
      if (isBiometricAvailable) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate with Biometrics',
        });
        if (result.success) {
          console.log('Authentication successful');
          navigation.navigate('♡Yarns & patterns♡');
        } else {
          console.log('Authentication failed');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      {isBiometricAvailable && (
        <TouchableOpacity onPress={handleAuthenticate} style={styles.button}>
          <Text style={styles.buttonText}>Authenticate with Biometrics</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#d9a5cc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Authentication;