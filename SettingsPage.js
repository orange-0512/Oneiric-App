import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, TouchableWithoutFeedback, Keyboard, Modal } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function SettingsPage({ userData, onUpdateNickname, onNavigate, t, language, setLanguage, onLogout }) {
  const [activeModal, setActiveModal] = useState(null); // 'language', 'privacy', 'terms', 'rating', 'about', 'tagManagement'
  const [localNickname, setLocalNickname] = useState(userData?.nickname || '');

  useEffect(() => {
    if (userData?.nickname) {
      setLocalNickname(userData.nickname);
    }
  }, [userData?.nickname]);

  const handleNicknameSubmit = () => {
    if (localNickname !== userData?.nickname) {
      onUpdateNickname(localNickname);
    }
    Keyboard.dismiss();
  };

  const menuItems = [
    { label: '標籤管理', icon: 'tag', action: () => onNavigate('tagManagement') },
    { label: t.settings_language, icon: 'globe', action: () => setActiveModal('language') },
    { label: t.settings_privacy, icon: 'lock', action: () => setActiveModal('privacy') },
    { label: t.settings_terms, icon: 'file-text', action: () => setActiveModal('terms') },
    { label: t.settings_rating, icon: 'star', action: () => {} },
    { label: t.settings_about, icon: 'info', action: () => {} },
    { label: '登出', icon: 'log-out', action: onLogout },
  ];

  const privacyPolicyText = `...`; 
  const termsText = `...`;

  const renderLanguageModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={activeModal === 'language'}
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.languageContainer}>
          {[
            { code: 'zh-TW', label: '繁體中文' },
            { code: 'zh-CN', label: '簡體中文' },
            { code: 'en', label: 'English' }
          ].map((lang, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.languageButton,
                language === lang.code && styles.languageButtonActive
              ]}
              onPress={() => {
                setLanguage(lang.code);
                setActiveModal(null);
              }}
            >
              <Text style={[
                styles.languageButtonText,
                language === lang.code && styles.languageButtonTextActive
              ]}>{lang.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => setActiveModal(null)}>
          <Ionicons name="close-circle" size={48} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const renderPrivacyModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={activeModal === 'privacy'}
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Text style={styles.privacyTitle}>{t.settings_privacy}</Text>
          </View>
          <ScrollView style={styles.privacyContent}>
            <Text style={styles.privacyText}>{privacyPolicyText}</Text>
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => setActiveModal(null)}>
          <Ionicons name="close-circle" size={48} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const renderTermsModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={activeModal === 'terms'}
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Text style={styles.privacyTitle}>{t.settings_terms}</Text>
          </View>
          <ScrollView style={styles.privacyContent}>
            <Text style={styles.privacyText}>{termsText}</Text>
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => setActiveModal(null)}>
          <Ionicons name="close-circle" size={48} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.mascotContainer}>
              <Image source={require('./assets/home_mascot.png')} style={styles.mascot} resizeMode="contain" />
            </View>
            <Image source={require('./assets/logo_text.png')} style={styles.logoText} resizeMode="contain" />
            <Text style={styles.version}>{t.settings_version}</Text>
          </View>

          {/* Nickname Section */}
          <View style={styles.nicknameSection}>
            <Text style={styles.nicknameLabel}>{t.settings_nickname}</Text>
            <TextInput 
              style={styles.nicknameInput}
              value={localNickname}
              onChangeText={setLocalNickname}
              placeholder={t.settings_nickname_placeholder}
              placeholderTextColor="#A3A3A3"
              onEndEditing={handleNicknameSubmit} 
            />
          </View>

          {/* Menu List */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconCircle} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Feather name="chevron-right" size={24} color="#737373" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Share Card */}
          <View style={styles.shareCard}>
            <View style={styles.shareContent}>
              <Image source={require('./assets/home_mascot.png')} style={styles.shareMascotLeft} resizeMode="contain" />
              <Text style={styles.shareText}>{t.settings_share}</Text>
               <Image source={require('./assets/home_mascot.png')} style={styles.shareMascotRight} resizeMode="contain" />
            </View>
          </View>
          
          {/* Bottom Spacer */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Modals */}
        {renderLanguageModal()}
        {renderPrivacyModal()}
        {renderTermsModal()}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BFB4DC', // Light purple background matching design
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mascotContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  mascot: {
    width: 100,
    height: 100,
  },
  logoText: {
    width: 120, // Adjust width as needed based on image aspect ratio
    height: 40,
    marginBottom: 8,
  },
  version: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#000000',
  },
  nicknameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  nicknameLabel: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#000000',
    marginRight: 16,
  },
  nicknameInput: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#737373',
    width: 150,
    textAlign: 'center',
    paddingVertical: 4,
  },
  menuContainer: {
    backgroundColor: '#E8E3D5', // Beige container
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#A3A3A3', // Grey circle
    marginRight: 16,
  },
  menuLabel: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 16,
    color: '#000000',
  },
  shareCard: {
    backgroundColor: '#E8E3D5',
    borderRadius: 32,
    padding: 24,
    height: 180,
    justifyContent: 'center',
  },
  shareContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  shareText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    color: '#000000',
    zIndex: 1,
    textAlign: 'center',
    flex: 1,
  },
  shareMascotLeft: {
    width: 80,
    height: 80,
  },
  shareMascotRight: {
    width: 80,
    height: 80,
    transform: [{ scaleX: -1 }], // Flip image
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(191, 180, 220, 0.95)', // Semi-transparent purple matching background
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 8,
    width: 200,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#7C4BFF',
  },
  languageButtonText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  languageButtonTextActive: {
    color: '#FFFFFF',
  },
  closeButton: {
    marginTop: 20,
  },
  privacyCard: {
    backgroundColor: '#7C4BFF', // Deep purple
    width: '80%',
    height: '60%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  privacyHeader: {
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingVertical: 8,
    width: 120,
    alignSelf: 'center',
  },
  privacyTitle: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    color: '#000000',
  },
  privacyContent: {
    flex: 1,
  },
  privacyText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
  },
});
