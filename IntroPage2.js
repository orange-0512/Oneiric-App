import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';

export default function IntroPage2({ onNext }) {
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
          <Text style={styles.text}>這裡可以快速將夢境紀錄下來！</Text>
          <Text style={styles.text}>並轉化成靈感圖及數據</Text>
        </View>
        <Image 
          source={require('./assets/intro_2.png')} 
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
    gap: 43, // Gap from Figma
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
    width: 300, // Adjusted size based on visual
    height: 300,
  },
});
