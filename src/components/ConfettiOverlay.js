import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const EMOJIS = ['🎉', '🎊', '🏆', '⭐', '✨', '🔥', '💫', '🎓', '💪', '🌟', '🎯', '⚡'];
const COUNT = 32;

function Piece({ emoji, delay, startX, size, swingDir }) {
  const y   = useRef(new Animated.Value(-80)).current;
  const x   = useRef(new Animated.Value(0)).current;
  const op  = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const sc  = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const dur = 2800 + Math.random() * 1400;
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(op,  { toValue: 1,              duration: 250,  useNativeDriver: true }),
        Animated.timing(sc,  { toValue: 1,              duration: 300,  useNativeDriver: true }),
        Animated.timing(y,   { toValue: height + 100,   duration: dur,  useNativeDriver: true }),
        Animated.timing(x,   { toValue: swingDir * (60 + Math.random() * 80), duration: dur, useNativeDriver: true }),
        Animated.timing(rot, { toValue: swingDir * (3 + Math.random() * 5), duration: dur, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const spin = rot.interpolate({ inputRange: [-8, 8], outputRange: ['-480deg', '480deg'] });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        fontSize: size,
        left: startX,
        top: 0,
        opacity: op,
        transform: [{ translateX: x }, { translateY: y }, { rotate: spin }, { scale: sc }],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function ConfettiOverlay({ visible, onDone }) {
  const masterOp = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    masterOp.setValue(1);
    const t = setTimeout(() => {
      Animated.timing(masterOp, { toValue: 0, duration: 800, useNativeDriver: true }).start(() => {
        onDone?.();
      });
    }, 3000);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  const pieces = Array.from({ length: COUNT }, (_, i) => ({
    key: i,
    emoji: EMOJIS[i % EMOJIS.length],
    delay: i * 70 + Math.random() * 300,
    startX: (Math.random() * (width + 60)) - 30,
    size: 18 + Math.random() * 20,
    swingDir: Math.random() > 0.5 ? 1 : -1,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: masterOp, zIndex: 9999 }]}
    >
      {pieces.map(p => <Piece key={p.key} {...p} />)}
    </Animated.View>
  );
}
