import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ButtonStyle({ text = "你好，我是按鈕", onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: '#ffe888',
    borderRadius: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: 84,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'jf-openhuninn-2.0',
    textAlign: 'center',
  },
});
