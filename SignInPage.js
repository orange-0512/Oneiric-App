import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { supabase } from './lib/supabase';

export default function SignInPage({ onNavigateToSignUp, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('請輸入信箱和密碼');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (onLoginSuccess) {
        // Use email prefix as nickname for now, or fetch from profile if we had one
        const nickname = email.split('@')[0];
        onLoginSuccess({ nickname, ...data.user });
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
          <View style={styles.contentContainer}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>登入</Text>
              <Text style={styles.subtitle}>嗨，歡迎來到拾夢，請輸入您的信箱及密碼登入</Text>
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

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>忘記密碼？</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={styles.loginButtonText}>{loading ? '登入中...' : '登入'}</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>還沒有帳戶？</Text>
              <TouchableOpacity style={styles.signupLinkButton} onPress={onNavigateToSignUp}>
                <Text style={styles.signupLinkText}>前往註冊</Text>
                <Feather name="chevron-right" size={16} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E3D5', // Background color from code
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
    fontFamily: 'jf-openhuninn-2.0', // Using project font
  },
  subtitle: {
    fontSize: 15, // 0.9375rem
    color: '#6B7280', // grey-500
    textAlign: 'center',
    fontFamily: 'jf-openhuninn-2.0',
  },
  formSection: {
    marginBottom: 24,
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
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // bg-white/60
    fontSize: 15,
    color: '#4B5563', // text-grey-600
    fontFamily: 'jf-openhuninn-2.0',
    textAlignVertical: 'center', // Android fix
    paddingVertical: 0, // iOS fix for cursor alignment
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
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14, // 0.875rem
    color: '#4B5563', // grey-600
    fontFamily: 'jf-openhuninn-2.0',
  },
  loginButton: {
    width: '100%',
    height: 56, // h-14
    borderRadius: 28,
    backgroundColor: '#FFF1A8', // soft-yellow approximation
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    shadowColor: '#FFF1A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 17, // 1.0625rem
    fontWeight: '600',
    color: '#4B5563', // grey-600
    fontFamily: 'jf-openhuninn-2.0',
  },
  testButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#B9B4FF',
    marginTop: -32, // Pull up closer to login button
    marginBottom: 32,
    height: 48,
  },
  testButtonText: {
    color: '#7C4BFF',
    fontSize: 15,
    fontFamily: 'jf-openhuninn-2.0',
  },
  signupContainer: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#6B7280', // grey-500
    marginBottom: 8,
    fontFamily: 'jf-openhuninn-2.0',
  },
  signupLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signupLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563', // grey-600
    marginRight: 4,
    fontFamily: 'jf-openhuninn-2.0',
  },
});
