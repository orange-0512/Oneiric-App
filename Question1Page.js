import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

export default function Question1Page({ onNext, onUpdateProfile }) {
  const [nickname, setNickname] = useState('');

  const handleNext = () => {
    if (nickname.trim()) {
      if (onUpdateProfile) {
        onUpdateProfile({ nickname: nickname.trim() });
      }
      onNext(nickname.trim());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View style={[styles.progressDot, styles.activeDot]} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
            </View>

            <Text style={styles.title}>怎麼稱呼你呢？</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="你的暱稱"
                placeholderTextColor="#8c8c8c"
                textAlign="center"
              />
            </View>

            {nickname.length > 0 && (
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>確認</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    paddingTop: 132,
    paddingHorizontal: 56,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 60,
  },
  progressDot: {
    width: 45,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#8c8c8c', // Inactive color
  },
  activeDot: {
    backgroundColor: '#ffe888', // Active color
  },
  title: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    letterSpacing: 0.32, // 2% of 16
    color: '#000000',
    marginBottom: 60,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 60,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#e8e2d2', // Light beige background for input
    borderRadius: 25,
    textAlign: 'center',
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 17,
    color: '#000000',
  },
  button: {
    position: 'absolute',
    bottom: 100, // Adjust based on layout
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 360,
    borderWidth: 1,
    borderColor: '#7c4bff',
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#7c4bff', // Button text color
  },
});
