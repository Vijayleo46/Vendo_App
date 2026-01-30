import React from 'react';
import { useFocusEffect } from '@react-navigation/native';

interface TabScreenWrapperProps {
  children: React.ReactNode;
  onFocus: () => void;
  tabIndex: number;
}

export const TabScreenWrapper: React.FC<TabScreenWrapperProps> = ({ 
  children, 
  onFocus, 
  tabIndex 
}) => {
  useFocusEffect(
    React.useCallback(() => {
      onFocus();
    }, [onFocus])
  );

  return <>{children}</>;
};