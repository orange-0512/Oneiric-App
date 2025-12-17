import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ButtonStyle from './ButtonStyle';

export default function WelcomePage5({ onNext }) {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>希望可以幫助你</Text>
        <Text style={styles.subtitle}>作為未來的創作發想</Text>
        
        <View style={styles.imageContainer}>
          <Image 
            source={require('./assets/welcome_5_mascot_v2.png')} 
            style={styles.image} 
            resizeMode="contain" 
          />
        </View>
      </View>
      
      <ButtonStyle text="OK" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bfb4dc',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 24,
    color: '#000000',
    fontFamily: 'jf-openhuninn-2.0',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#000000',
    fontFamily: 'jf-openhuninn-2.0',
    marginBottom: 40,
    textAlign: 'center',
  },
  imageContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
