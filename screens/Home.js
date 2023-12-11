import { ImageBackground, StyleSheet, View } from 'react-native';
import Heart from '../images/Heart.png';

export default function Home() {
  return (
    <ImageBackground source={Heart} resizeMode="cover" style={styles.image}>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: 'center',
  },
})