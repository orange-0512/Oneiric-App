import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';

export default function OpeningAnimation({ onComplete }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence: Fade In -> Wait -> Fade Out -> onComplete
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500, // Slow fade in
        useNativeDriver: true,
      }),
      Animated.delay(1000), // Hold
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500, // Quick fade out
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) {
        onComplete();
      }
    });
  }, []);
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image 
          source={require('./assets/opening_logo.png')} 
          style={styles.image} 
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BFB4DC', // Lavender background
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  image: {
    width: 200, // Adjusted width based on visual
    height: 200,
  }
});
