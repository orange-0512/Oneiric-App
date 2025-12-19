import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, TouchableWithoutFeedback, Keyboard, Modal, Share } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function SettingsPage({ userData, onUpdateProfile, onNavigate, t, language, setLanguage, onLogout }) {
  const [activeModal, setActiveModal] = useState(null); // 'language', 'privacy', 'terms', 'rating', 'about', 'tagManagement'
  const [localNickname, setLocalNickname] = useState(userData?.nickname || '');

  useEffect(() => {
    if (userData?.nickname) {
      setLocalNickname(userData.nickname);
    }
  }, [userData?.nickname]);

  const handleNicknameSubmit = () => {
    if (localNickname !== userData?.nickname) {
      if (onUpdateProfile) {
        onUpdateProfile({ nickname: localNickname });
      }
    }
    Keyboard.dismiss();
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: '快來下載 Oneiric App，紀錄你的夢境！', // You can customize this message
        // url: 'https://example.com', // Optional: Add app store link here
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const menuItems = [
    { label: '標籤管理', icon: 'tag', action: () => onNavigate('tagManagement') },
    { label: t.settings_language, icon: 'globe', action: () => setActiveModal('language') },
    { label: t.settings_privacy, icon: 'lock', action: () => setActiveModal('privacy') },
    { label: t.settings_terms, icon: 'file-text', action: () => setActiveModal('terms') },
    { label: t.settings_rating, icon: 'star', action: () => {} },
    { label: t.settings_about, icon: 'info', action: () => {} },
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
            <Image source={require('./assets/settings_logo.png')} style={styles.settingsLogo} resizeMode="contain" />
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
              <React.Fragment key={index}>
                <TouchableOpacity style={styles.menuItem} onPress={item.action}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconCircle} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#737373" />
                </TouchableOpacity>
                {index < menuItems.length - 1 && <View style={styles.menuSeparator} />}
              </React.Fragment>
            ))}
          </View>

          {/* Share Card */}
          <TouchableOpacity style={styles.shareCard} onPress={handleShare}>
            <Image source={require('./assets/share_banner.png')} style={styles.shareBanner} resizeMode="cover" />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>登出</Text>
          </TouchableOpacity>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>關於</Text>
            <Text style={styles.footerText}>版本 1.0.0</Text>
            <View style={styles.footerSpacer} />
            <Text style={styles.footerCopyright}>© 2025 Oneiric</Text>
            <Text style={styles.footerCopyright}>Creative Commons Attribution 4.0</Text>
          </View>
          
          {/* Bottom Spacer */}
          <View style={{ height: 40 }} />
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
    paddingTop: 40, // Reduced from 60
  },
  header: {
    alignItems: 'center',
    marginBottom: 24, // Reduced from 32
  },
  settingsLogo: {
    width: 126, // Reduced by 30% from 180
    height: 126,
    marginBottom: 0,
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
    paddingVertical: 8, // Reduced vertical padding for container
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12, // Reduced padding
  },
  menuSeparator: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)', // Very light grey separator
    width: '100%',
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
    borderRadius: 32,
    height: 180,
    overflow: 'hidden', // Ensure image respects border radius
    marginBottom: 8,
  },
  shareBanner: {
    width: '100%',
    height: '100%',
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
  logoutButton: {
    marginTop: 24,
    backgroundColor: '#7C4BFF', // Purple background
    paddingVertical: 16,
    borderRadius: 30, // Pill shape
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 24, // Add horizontal margin if needed, or rely on container padding
  },
  logoutText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 18,
    color: '#FFFFFF', // White text
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 14,
    color: '#737373',
    marginBottom: 4,
  },
  footerSpacer: {
    height: 16,
  },
  footerCopyright: {
    fontFamily: 'jf-openhuninn-2.0',
    fontSize: 12,
    color: '#A3A3A3',
    marginBottom: 2,
  },
});
