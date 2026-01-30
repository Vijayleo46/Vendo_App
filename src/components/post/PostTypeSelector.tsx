import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Typography } from '../common/Typography';
import { Package, Briefcase } from 'lucide-react-native';

interface PostTypeSelectorProps {
  visible: boolean;
  onSelect: (type: 'product' | 'job' | 'service') => void;
  onClose: () => void;
}

export const PostTypeSelector: React.FC<PostTypeSelectorProps> = ({ visible, onSelect, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.content}>
              <Typography style={styles.title}>What do you want to post?</Typography>

              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onSelect('product');
                  onClose();
                }}
              >
                <View style={styles.iconContainer}>
                  <Package size={28} color="#8B7FE8" strokeWidth={2} />
                </View>
                <View style={styles.optionText}>
                  <Typography style={styles.optionTitle}>Sell a Product</Typography>
                  <Typography style={styles.optionDesc}>List items for sale</Typography>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onSelect('job');
                  onClose();
                }}
              >
                <View style={styles.iconContainer}>
                  <Briefcase size={28} color="#8B7FE8" strokeWidth={2} />
                </View>
                <View style={styles.optionText}>
                  <Typography style={styles.optionTitle}>Post a Job</Typography>
                  <Typography style={styles.optionDesc}>Hire for a position</Typography>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Typography style={styles.cancelText}>Cancel</Typography>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 28,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 3,
  },
  optionDesc: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  cancelButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
