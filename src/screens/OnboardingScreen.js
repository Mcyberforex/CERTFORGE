import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { C } from '../theme';

const { width } = Dimensions.get('window');
const firstName = 'Malik';

const SLIDES = [
  {
    emoji: '👋',
    title: `Welcome, ${firstName}`,
    body: "Your personal CompTIA Network+ study app. Learn the material, take quizzes, and level up — just like a game.",
    color: C.cyan,
  },
  {
    emoji: '📚',
    title: 'Study. Quiz. Pass.',
    body: "Pick a topic, read the lessons, then take the quiz. You need to score 80% or higher to pass a topic and unlock the next one.",
    color: C.purple,
  },
  {
    emoji: '🔥',
    title: 'Earn XP & Streaks',
    body: "Every correct answer earns XP and builds your streak. Answer questions in a row to keep the 🔥 going. The more you practice, the higher your level.",
    color: C.amber,
  },
  {
    emoji: '🏆',
    title: "You're ready.",
    body: "Start with Domain 1 — Network Fundamentals. Work through each topic, ace the quizzes, and unlock every domain.",
    color: C.green,
  },
];

export default function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    if (step >= SLIDES.length - 1) {
      onDone();
      return;
    }
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(s => s + 1);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Big emoji */}
        <View style={[styles.emojiCircle, { borderColor: slide.color + '55', backgroundColor: slide.color + '15' }]}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </View>

        {/* Text */}
        <Text style={[styles.title, { color: slide.color }]}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && { backgroundColor: slide.color, width: 20 }]}
            />
          ))}
        </View>
      </Animated.View>

      {/* Button */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: slide.color }]}
        onPress={goNext}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>
          {isLast ? "LET'S GO →" : 'NEXT →'}
        </Text>
      </TouchableOpacity>

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity style={styles.skip} onPress={onDone}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 48,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  emoji: { fontSize: 56 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 16,
    color: C.textSec,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.bgElevated,
  },
  btn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  skip: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: C.textDim,
  },
});
