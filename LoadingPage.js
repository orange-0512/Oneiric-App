import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');

export default function LoadingPage({ onNavigateHome, onViewDream }) {
  // Removed auto-navigation

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>夢境已儲存 ✨</Text>
        
        <View style={styles.videoContainer}>
          <Image
            source={require('./assets/Loading.gif')}
            style={styles.gif}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subtitle}>靈感圖正在誕生中</Text>
        <Text style={styles.subtitleSmall}>約幾十秒鐘</Text>

        <TouchableOpacity style={styles.button} onPress={onNavigateHome}>
          <Text style={styles.buttonText}>回到首頁</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={onViewDream}>
          <Text style={styles.linkText}>檢視這則夢境</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BFB4DC', // Lavender background
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 28,
    color: '#000000',
    marginBottom: 40,
  },
  videoContainer: {
    width: 200,
    height: 200,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  subtitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 20,
    color: '#000000',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitleSmall: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 20,
    color: '#000000',
    marginBottom: 80,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#7C4BFF',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 24,
    marginBottom: 16,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#FFFFFF',
  },
  linkButton: {
    padding: 8,
  },
  linkText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
