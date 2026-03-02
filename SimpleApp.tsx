import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';

const SimpleApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [products] = useState([
    { id: 1, title: 'iPhone 14 Pro', price: '₹ 89,999', image: 'https://via.placeholder.com/150', location: 'Kochi' },
    { id: 2, title: 'MacBook Air M2', price: '₹ 1,15,999', image: 'https://via.placeholder.com/150', location: 'Ernakulam' },
    { id: 3, title: 'Samsung Galaxy S23', price: '₹ 65,999', image: 'https://via.placeholder.com/150', location: 'Thrissur' },
    { id: 4, title: 'iPad Pro 11"', price: '₹ 75,999', image: 'https://via.placeholder.com/150', location: 'Kochi' },
  ]);

  const ProductCard = ({ product }: any) => (
    <View style={styles.productCard}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productPrice}>{product.price}</Text>
        <Text style={styles.productTitle}>{product.title}</Text>
        <Text style={styles.productLocation}>📍 {product.location}</Text>
      </View>
    </View>
  );

  const HomeScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>VENDO</Text>
        <Text style={styles.coins}>⭐ 150</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search products, jobs, services..."
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently Viewed</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {products.slice(0, 2).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fresh Recommendations</Text>
        <View style={styles.productsGrid}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const TabBar = () => (
    <View style={styles.tabBar}>
      {[
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'search', label: 'Search', icon: '🔍' },
        { id: 'post', label: 'Post', icon: '➕' },
        { id: 'chat', label: 'Chat', icon: '💬' },
        { id: 'profile', label: 'Profile', icon: '👤' },
      ].map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabItem, activeTab === tab.id && styles.activeTab]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.app}>
      <HomeScreen />
      <TabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  coins: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FBBF24', // Yellow color
    marginBottom: 15,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    marginRight: 10,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF', // White color
    backgroundColor: '#333',
    padding: 4,
    borderRadius: 4,
    textAlign: 'center',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  productLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default SimpleApp;