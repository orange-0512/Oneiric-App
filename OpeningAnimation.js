import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function OpeningAnimation({ onComplete }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity 0

  useEffect(() => {
    // Start with fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animation sequence
    const sequence = async () => {
      // Frame 0 is already shown
      await new Promise(r => setTimeout(r, 300));
      setFrameIndex(1);
      
      await new Promise(r => setTimeout(r, 300));
      setFrameIndex(2);
      
      await new Promise(r => setTimeout(r, 300));
      setFrameIndex(3);
      
      await new Promise(r => setTimeout(r, 300));
      setFrameIndex(4);
      
      // Hold final frame for a bit then transition
      await new Promise(r => setTimeout(r, 600));
      
      // Fade out before navigating
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    };

    sequence();
  }, []);

  // Placeholder for the sprite sheet logic. 
  // Since we have one image with multiple frames, we'd typically crop it.
  // For now, I'll display the whole image but this logic is ready for individual frames or sprite sheet slicing.
  // Assuming the user will provide individual assets or we slice the sprite later.
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* 
          Displaying the sprite sheet. 
          In a real implementation with a sprite sheet, we would use:
          <Image source={require('./assets/animation_sprites.png')} style={{ transform: [{ translateX: -frameIndex * FRAME_WIDTH }] }} />
          inside a masked View.
          For now, just showing the image to verify asset presence.
        */}
        <Image 
          source={require('./assets/animation_sprites.png')} 
          style={styles.image} 
          resizeMode="contain"
        />
        {/* Debug Text to show frame progress */}
        {/* <Text style={{position: 'absolute', bottom: 50}}>Frame: {frameIndex}</Text> */}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    bottom: 150, 
  }
});
