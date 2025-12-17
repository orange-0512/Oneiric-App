import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ButtonStyle from './ButtonStyle';

export default function WelcomePage2({ onNext }) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>這裡可以幫助你</Text>
        <Text style={styles.text}>快速將夢境記下</Text>
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
