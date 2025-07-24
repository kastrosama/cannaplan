import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EasterEggScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🐣 Easter Egg Coming Soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
