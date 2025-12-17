import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, TouchableOpacity } from 'react-native';

export default function IntroPage4({ onNext }) {
  // Note: This page has a button, so maybe no auto-navigation?
  // User said "welcome page1 接welcome page3 再接welcome page5 接welcome page6"
  // and "各自設定after delay 500ms".
  // But page 6 has a "Start" button. Usually the last page waits for user action.
  // I will assume the delay applies to transitions TO this page, or maybe this page also auto-advances?
  // Given the button "開始拾夢！", it implies manual interaction.
  // I will NOT add auto-navigation for this final page unless clarified.
  // Wait, "welcome page1 接welcome page3 再接welcome page5 接welcome page6"
  // It implies 1->3 (500ms), 3->5 (500ms), 5->6 (500ms).
  // Page 6 is the end.

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.textContainer}>
            <Text style={styles.text}>相信你準備好</Text>
            <Text style={styles.text}>開始了！</Text>
          </View>
          
          <Image 
            source={require('./assets/intro_4.png')} 
            style={styles.image} 
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>開始拾夢！</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E3D5', // Beige background
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 80,
    justifyContent: 'space-between', // Distribute space
    gap: 30,
  },
  card: {
    flex: 1, // Take remaining space
    backgroundColor: '#bfb4dc', // Purple
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically in card
    width: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40, // Space between text and image
  },
  text: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 28,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 40,
  },
  image: {
    width: 250,
    height: 250,
  },
  button: {
    backgroundColor: '#ffe888', // Yellow
    borderRadius: 10,
    height: 88, // Fixed height from spec/visual
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#000000',
  },
});
