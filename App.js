import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { KaiseiTokumin_700Bold } from '@expo-google-fonts/kaisei-tokumin';

import OpeningAnimation from './OpeningAnimation';
import WelcomePage from './WelcomePage';
import WelcomePage2 from './WelcomePage2';
import WelcomePage3 from './WelcomePage3';
import WelcomePage4 from './WelcomePage4';
import WelcomePage5 from './WelcomePage5';
import SignInPage from './SignInPage';

import SignUpPage from './SignUpPage';

import IntroPage1 from './IntroPage1';
import IntroPage2 from './IntroPage2';
import IntroPage3 from './IntroPage3';
import IntroPage4 from './IntroPage4';

import Question1Page from './Question1Page';
import Question2Page from './Question2Page';
import Question3Page from './Question3Page';
import Question4Page from './Question4Page';

import Question5Page from './Question5Page';
import HomePage from './HomePage';
import RecordDreamPage from './RecordDreamPage';
import LoadingPage from './LoadingPage';
import TagManagementPage from './TagManagementPage';
import { translations } from './i18n/translations';
import { generateDreamImage } from './services/huggingface';
import { getUserProfile, createUserProfile, completeOnboarding, updateUserProfile } from './services/userProfile';
import { updateDream } from './services/storage';

// ... imports

const { height } = Dimensions.get('window');

export default function App() {
  const [fontsLoaded, error] = useFonts({
    'jf-openhuninn-2.0': require('./assets/fonts/jf-openhuninn-2.1.ttf'),
    'Kaisei_Tokumin-Bold': KaiseiTokumin_700Bold,
  });

  const [userData, setUserData] = useState({ nickname: 'User Name' });
  const [currentScreen, setCurrentScreen] = useState('signin');
  const [screenParams, setScreenParams] = useState({});
  const [lastDreamUpdate, setLastDreamUpdate] = useState(Date.now());
  
  // Language State
  const [language, setLanguage] = useState('zh-TW');
  const t = translations[language];

  // Animation State
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [isRecordPageVisible, setIsRecordPageVisible] = useState(false);

  // Onboarding State
  const [onboardingAnswers, setOnboardingAnswers] = useState({});

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  const navigateTo = (screen, params = {}) => {
    if (screen === 'record') {
      setScreenParams(params);
      setIsRecordPageVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }).start();
    } else {
      // If we are navigating AWAY from record page (e.g. back to home or to loading)
      if (isRecordPageVisible) {
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.in(Easing.exp),
        }).start(() => {
          setIsRecordPageVisible(false);
          if (screen !== 'home') { // If going to loading, switch screen after anim
             setCurrentScreen(screen);
             setScreenParams(params);
          }
        });
      } else {
        setCurrentScreen(screen);
        setScreenParams(params);
      }
    }
  };

  const handleUpdateNickname = (nickname) => {
    setUserData(prev => ({ ...prev, nickname }));
  };

  const handleSaveDream = (dreamId, summary, isEditing) => {
    // Close record page animation first
    navigateTo('loading', { dreamId });
    
    // Start background generation ONLY if it's a new dream (not editing)
    // or if we explicitly want to regenerate (future feature)
    if (summary && !isEditing) {
      console.log('Starting background image generation for dream:', dreamId);
      generateDreamImage(summary)
        .then(imageUrl => {
          console.log('Background generation success:', imageUrl);
          return updateDream(dreamId, { generatedImage: imageUrl });
        })
        .then(() => {
          console.log('Dream updated with generated image');
          setLastDreamUpdate(Date.now());
        })
        .catch(err => console.error('Background generation failed:', err));
    }
  };

  const handleLoginSuccess = async (user) => {
    if (user) {
      try {
        // Check if profile exists
        let profile = await getUserProfile(user.id);
        
        if (!profile) {
          // Create new profile if not exists
          console.log('Creating new profile for user:', user.id);
          profile = await createUserProfile(user.id, user.nickname || user.email?.split('@')[0]);
        }
        
        console.log('User profile:', profile);
        
        // Use profile nickname if available, otherwise fallback
        const displayNickname = profile?.nickname || user.email?.split('@')[0];
        setUserData(prev => ({ ...prev, nickname: displayNickname }));
        
        if (profile && profile.onboarding_completed) {
          // Skip onboarding
          navigateTo('home');
        } else {
          // Start onboarding
          navigateTo('intro1');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        // Fallback to intro if error
        navigateTo('intro1');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserData(null);
      navigateTo('signin');
    } catch (error) {
      console.error('Error logging out:', error);
      navigateTo('signin');
    }
  };

  const updateOnboardingAnswer = (questionId, answer) => {
    setOnboardingAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const finishOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await completeOnboarding(user.id, onboardingAnswers);
        console.log('Onboarding completed and saved');
      }
    } catch (error) {
      console.error('Error saving onboarding:', error);
    }
    navigateTo('home');
  };

  // ... renderScreen updates below
  const renderScreen = () => {
    switch (currentScreen) {
      case 'opening':
        return <OpeningAnimation onComplete={() => navigateTo('welcome')} />;
      
      case 'welcome':
        return <WelcomePage onNext={() => navigateTo('welcome2')} />;
      
      case 'welcome2':
        return <WelcomePage2 onNext={() => navigateTo('welcome3')} />;
      
      case 'welcome3':
        return <WelcomePage3 onNext={() => navigateTo('welcome4')} />;
      
      case 'welcome4':
        return <WelcomePage4 onNext={() => navigateTo('welcome5')} />;
      
      case 'welcome5':
        return <WelcomePage5 onNext={() => navigateTo('signin')} />;
      
      case 'signin':
        return <SignInPage
          onNavigateToSignUp={() => navigateTo('signup')}
          onLoginSuccess={handleLoginSuccess}
        />;
      
      case 'signup':
        return <SignUpPage
          onNavigateToSignIn={() => navigateTo('signin')}
          onSignUpSuccess={handleLoginSuccess}
        />;
      
      case 'intro1':
        return <IntroPage1 onNext={() => navigateTo('intro2')} />;
      
      case 'intro2':
        return <IntroPage2 onNext={() => navigateTo('intro3')} />;
      
      case 'intro3':
        return <IntroPage3 onNext={() => navigateTo('intro4')} />;
      
      case 'intro4':
        return <IntroPage4 onNext={() => navigateTo('question1')} />;
      
      case 'question1':
        return <Question1Page
          onNext={(answer) => {
            updateOnboardingAnswer('q1', answer);
            navigateTo('question2');
          }}
          onUpdateNickname={handleUpdateNickname}
        />;
      
      case 'question2':
        return <Question2Page 
          onNext={(answer) => {
            updateOnboardingAnswer('q2', answer);
            navigateTo('question3');
          }} 
        />;
      
      case 'question3':
        return <Question3Page 
          onNext={(answer) => {
            updateOnboardingAnswer('q3', answer);
            navigateTo('question4');
          }} 
        />;
      
      case 'question4':
        return <Question4Page 
          onNext={(answer) => {
            updateOnboardingAnswer('q4', answer);
            navigateTo('question5');
          }} 
        />;
      
      case 'question5':
        return <Question5Page 
          onNext={(answer) => {
            updateOnboardingAnswer('q5', answer);
            finishOnboarding();
          }} 
        />;
      
      case 'home':
        return <HomePage 
          userData={userData} 
          onNavigate={(screen, params) => navigateTo(screen, params)} 
          initialDreamId={screenParams.initialDreamId}
          newDream={screenParams.newDream}
          lastDreamUpdate={lastDreamUpdate}
          onUpdateNickname={handleUpdateNickname}
          language={language}
          setLanguage={setLanguage}
          t={t}
          onLogout={handleLogout}
        />;
      
      case 'tagManagement':
        return <TagManagementPage 
          onBack={() => navigateTo('home')}
          t={t}
        />;
      
      case 'loading':
        return <LoadingPage 
          onNavigateHome={() => navigateTo('home')} 
          onViewDream={() => navigateTo('home', { initialDreamId: screenParams.dreamId })}
        />;
      
      default:
        return <SignInPage 
          onNavigateToSignUp={() => navigateTo('signup')}
          onLoginSuccess={handleLoginSuccess} 
        />;
    }
  };

  // Wait for fonts to load
  if (!fontsLoaded && !error) {
    return null; // Or a loading screen
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="auto" />
      {renderScreen()}
      
      {/* Record Dream Page Overlay */}
      <Animated.View 
        style={[
          styles.overlay, 
          { 
            transform: [{ translateY: slideAnim }],
            zIndex: isRecordPageVisible ? 100 : -1, // Hide behind content when not active,
          }
        ]}
        pointerEvents={isRecordPageVisible ? 'auto' : 'none'}
      >
        {isRecordPageVisible && (
          <RecordDreamPage 
            onBack={() => navigateTo('home')} 
            onSave={handleSaveDream} 
            initialData={screenParams.initialData}
            t={t}
          />
        )}
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100, // Ensure it's on top
    backgroundColor: '#E8E3D5', // Match background to prevent transparency issues during slide
  },
});
