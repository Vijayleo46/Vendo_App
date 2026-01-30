import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SimpleGooeyShape } from './SimpleGooeyShape';
import { useTheme } from '../../theme/ThemeContext';

export const TabBarDebugger: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab Bar Debugger</Text>
      <Text style={styles.subtitle}>Current Index: {activeIndex}</Text>
      
      <View style={styles.buttonContainer}>
        {[0, 1, 2, 3, 4].map((index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              { backgroundColor: activeIndex === index ? theme.primary : '#ccc' }
            ]}
            onPress={() => {
              console.log('Debug button pressed, setting index to:', index);
              setActiveIndex(index);
            }}
          >
            <Text style={styles.buttonText}>{index}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.tabBarContainer}>
        <SimpleGooeyShape activeIndex={activeIndex} theme={theme} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 50,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabBarContainer: {
    height: 100,
    backgroundColor: 'white',
    borderRadius: 20,
    position: 'relative',
  },
});