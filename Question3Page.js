import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function Question3Page({ onNext }) {
  const [selectedGender, setSelectedGender] = useState(null);
  const options = ['男', '女', '不透露'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressDot, styles.activeDot]} />
          <View style={[styles.progressDot, styles.activeDot]} />
          <View style={[styles.progressDot, styles.activeDot]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        <Text style={styles.title}>請問您的性別是？</Text>

        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                selectedGender === option && styles.selectedOption
              ]}
              onPress={() => setSelectedGender(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedGender && (
          <TouchableOpacity style={styles.button} onPress={() => onNext(selectedGender)}>
            <Text style={styles.buttonText}>確認</Text>
          </TouchableOpacity>
        )}
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
  optionsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 60,
  },
  optionButton: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#ffe888',
    borderRadius: 100, // Fully rounded
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#ffe888',
  },
  optionText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#000000',
  },
  button: {
    position: 'absolute',
    bottom: 100,
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
    color: '#7c4bff',
  },
});
