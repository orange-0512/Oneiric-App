import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, TouchableOpacity } from 'react-native';

export default function IntroPage4({ onNext }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        
        <View style={styles.topSection}>
          <Text style={styles.text}>相信你準備好開始了！</Text>
        </View>
        
        <View style={styles.imageContainer}>
          <Image 
            source={require('./assets/intro_4_ready.png')} 
            style={styles.image} 
            resizeMode="contain"
          />
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.button} onPress={onNext}>
            <Text style={styles.buttonText}>開始拾夢！</Text>
          </TouchableOpacity>
        </View>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8BFE7', // Light Purple matching the design
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 80,
  },
  text: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
  },
  bottomSection: {
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FFE888', // Yellow
    borderRadius: 16,
    height: 56,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    color: '#000000',
  },
});
