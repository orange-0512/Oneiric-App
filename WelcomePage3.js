import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ButtonStyle from './ButtonStyle';

// Placeholder for the image
const imgEllipse8 = "data:image/svg+xml,%3Csvg width='243' height='243' viewBox='0 0 243 243' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='121.5' cy='121.5' r='121.5' fill='%23E8DFF5'/%3E%3C/svg%3E";

export default function WelcomePage3({ onNext }) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>並且將內容</Text>
        <Text style={styles.text}>轉化為靈感圖</Text>
      </View>
      
      <View style={styles.circle} />
      
      <ButtonStyle text="下一步" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bfb4dc',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 115,
    paddingHorizontal: 73,
    paddingVertical: 132,
  },
  textContainer: {
    alignItems: 'center',
  },
  text: {
    fontSize: 28,
    lineHeight: 35,
    color: '#000000',
    fontFamily: 'jf-openhuninn-2.0',
    textAlign: 'center',
  },
  circle: {
    width: 243,
    height: 243,
    borderRadius: 121.5,
    backgroundColor: '#E8DFF5',
  },
});
