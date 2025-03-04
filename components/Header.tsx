import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import HeaderLogo from '../assets/header-logo.svg';

const { width } = Dimensions.get('window');

export const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <HeaderLogo width={width * 0.4} height={45} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#34495e',
    paddingTop: 40,
    paddingBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 