import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Alert } from 'react-native';
import { supabase } from './lib/supabase';

export default function SignUpPage({ onNavigateToSignIn, onSignUpSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      alert('請輸入信箱和密碼');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        Alert.alert(
          '註冊成功',
          '請檢查您的信箱以驗證帳戶，然後登入。',
          [{ text: '好', onPress: () => onNavigateToSignIn && onNavigateToSignIn() }]
        );
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentContainer}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>創建新帳戶</Text>
              <Text style={styles.subtitle}>
                嗨，歡迎來到拾夢，{'\n'}請輸入完整資訊以創建新帳戶！
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="您的信箱"
                  placeholderTextColor="#9CA3AF" // grey-400
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Feather name="mail" size={18} color="#9CA3AF" style={styles.icon} />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="您的密碼"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.iconButton}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={styles.signupButtonText}>{loading ? '建立中...' : '建立'}</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>已經有帳戶？</Text>
              <TouchableOpacity style={styles.loginLinkButton} onPress={onNavigateToSignIn}>
                <Text style={styles.loginLinkText}>前往登入</Text>
                <Feather name="chevron-right" size={16} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4CFED', // Background color from code
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 40, // 2.5rem
    fontWeight: '700',
    color: '#4B5563', // grey-600
    marginBottom: 12,
    fontFamily: 'jf-openhuninn-2.0',
  },
  subtitle: {
    fontSize: 15, // 0.9375rem
    color: '#6B7280', // grey-500
    textAlign: 'center',
    fontFamily: 'jf-openhuninn-2.0',
  },
  formSection: {
    marginBottom: 48, // Increased margin to match design spacing
    gap: 16,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 56, // h-14
    paddingHorizontal: 20,
    paddingRight: 50, // Space for icon
    borderRadius: 28, // rounded-full
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // bg-white/50
    fontSize: 15,
    color: '#4B5563', // text-grey-600
    fontFamily: 'jf-openhuninn-2.0',
  },
  icon: {
    position: 'absolute',
    right: 20,
  },
  iconButton: {
    position: 'absolute',
    right: 20,
    padding: 4,
  },
  signupButton: {
    width: '100%',
    height: 56, // h-14
    borderRadius: 28,
    backgroundColor: '#8B7FE8', // Button color from code
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    shadowColor: '#8B7FE8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 5,
  },
  signupButtonText: {
    fontSize: 17, // 1.0625rem
    fontWeight: '600',
    color: '#FFFFFF', // text-white
    fontFamily: 'jf-openhuninn-2.0',
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280', // grey-500
    marginBottom: 8,
    fontFamily: 'jf-openhuninn-2.0',
  },
  loginLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563', // grey-600
    marginRight: 4,
    fontFamily: 'jf-openhuninn-2.0',
  },
});
