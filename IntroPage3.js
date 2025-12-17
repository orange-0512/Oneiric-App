import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';

export default function IntroPage3({ onNext }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 3000); // 3000ms delay

    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>希望可以幫助你</Text>
          <Text style={styles.text}>作為未來的創作發想</Text>
        </View>
        <Image 
          source={require('./assets/intro_3_v2.png')} 
          style={styles.image} 
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bfb4dc', // Surface brand color
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 115, // Gap from Figma
    paddingVertical: 132,
  },
  textContainer: {
    alignItems: 'center',
  },
  text: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 20,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 35,
  },
  image: {
    width: 200,
    height: 212,
  },
});
