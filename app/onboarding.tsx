import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Bell, ShoppingBag, Truck, CheckCircle } from 'lucide-react-native';
import { registerForPushNotificationsAsync, scheduleLocalNotification } from '../lib/pushNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    icon: ShoppingBag,
    title: 'Bienvenue Vendeurs',
    description: 'Gérez vos missions et développez vos ventes avec des reposteurs qualifiés.',
  },
  {
    id: 2,
    icon: Truck,
    title: 'Missions en temps réel',
    description: 'Suivez l\'avancement de vos produits confiés aux reposteurs directement depuis l\'app.',
  },
  {
    id: 3,
    icon: Bell,
    title: 'Soyez notifié instantanément',
    description: 'Recevez les notifications de nouvelles missions, validations et mises à jour importantes.',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
    }
  };


  const handleEnableNotifications = async () => {
    try {
      setLoading(true);

      // Demander les permissions
      const token = await registerForPushNotificationsAsync();

      // Stocker le token localement pour l'envoyer plus tard quand l'utilisateur se connecte
      if (token) {
        await AsyncStorage.setItem('pending_push_token', token);
      }

      // Marquer l'onboarding comme terminé
      await AsyncStorage.setItem('onboarding_completed', 'true');

      // Rediriger vers le login
      router.replace('/login');
    } catch (error) {
      console.error('Erreur lors de l\'activation des notifications:', error);
      // Continuer quand même
      await AsyncStorage.setItem('onboarding_completed', 'true');
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          return (
            <View key={slide.id} style={[styles.slide, { width }]}>
              <View style={styles.iconContainer}>
                <Icon size={80} color="#10b981" strokeWidth={1.5} />
              </View>

              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentSlide === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        {currentSlide < slides.length - 1 ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Suivant</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.enableButton}
            onPress={handleEnableNotifications}
            disabled={loading}
          >
            <Bell size={20} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.enableButtonText}>
              {loading ? 'Activation...' : 'Activer les notifications'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#10b981',
    width: 24,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#10b981',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  enableButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
  },
  buttonIcon: {
    marginRight: 8,
  },
  enableButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
