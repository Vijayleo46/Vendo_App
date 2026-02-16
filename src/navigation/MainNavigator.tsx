import React, { useEffect, useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation, useFocusEffect } from '@react-navigation/native';
import { PostTypeSelector } from '../components/post/PostTypeSelector';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Home, Search, Plus, MessageCircle, User, House, Store, Grid3X3, Layout, ShoppingBag } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { BlurView } from 'expo-blur';
import { SimpleWorkingTabBar } from '../components/common/SimpleWorkingTabBar';
import { TabScreenWrapper } from '../components/common/TabScreenWrapper';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { PostScreen } from '../screens/PostScreen';
import { PostJobScreen } from '../screens/PostJobScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { ChatRoomScreen } from '../screens/ChatRoomScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ImageViewerScreen } from '../screens/ImageViewerScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { KycScreen } from '../screens/KycScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { MyListingsScreen } from '../screens/MyListingsScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

import { authService } from '../services/authService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabBarBackground = () => {
    const { isDark } = useTheme();
    if (Platform.OS === 'ios') {
        return (
            <BlurView
                intensity={80}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />
        );
    }
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF' }]} />;
};

const PostButton = ({ children, onPress }: any) => {
    const { theme } = useTheme();
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[
                styles.postButton,
                {
                    backgroundColor: theme.primary,
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                }
            ]}
            onPress={onPress}
        >
            {children}
        </TouchableOpacity>
    );
};

const TabNavigator = () => {
    const { theme } = useTheme();
    const [isPostModalVisible, setIsPostModalVisible] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const navigation = useNavigation<any>();

    const handlePostTypeSelect = (type: 'product' | 'job' | 'service') => {
        setIsPostModalVisible(false);
        if (type === 'job') {
            navigation.navigate('PostJob');
        } else {
            navigation.navigate('PostItem', { type });
        }
    };

    // Screen wrapper components with focus tracking
    const HomeScreenWrapper = () => (
        <TabScreenWrapper onFocus={() => setActiveTabIndex(0)} tabIndex={0}>
            <HomeScreen />
        </TabScreenWrapper>
    );

    const SearchScreenWrapper = () => (
        <TabScreenWrapper onFocus={() => setActiveTabIndex(1)} tabIndex={1}>
            <SearchScreen />
        </TabScreenWrapper>
    );

    const PostScreenWrapper = () => (
        <TabScreenWrapper onFocus={() => setActiveTabIndex(2)} tabIndex={2}>
            <PostScreen />
        </TabScreenWrapper>
    );

    const ChatScreenWrapper = () => (
        <TabScreenWrapper onFocus={() => setActiveTabIndex(3)} tabIndex={3}>
            <ChatScreen />
        </TabScreenWrapper>
    );

    const ProfileScreenWrapper = () => (
        <TabScreenWrapper onFocus={() => setActiveTabIndex(4)} tabIndex={4}>
            <ProfileScreen />
        </TabScreenWrapper>
    );

    const tabs = [
        {
            name: 'HomeTab',
            icon: Home, // Changed back to original Home icon
            onPress: () => {
                console.log('Home tab onPress called - navigating to HomeTab');
                navigation.navigate('HomeTab');
            }
        },
        {
            name: 'SearchTab',
            icon: Search,
            onPress: () => {
                console.log('Search tab onPress called - navigating to SearchTab');
                navigation.navigate('SearchTab');
            }
        },
        {
            name: 'PostTab',
            icon: Plus,
            onPress: () => {
                console.log('Post tab onPress called - showing modal');
                setIsPostModalVisible(true);
            }
        },
        {
            name: 'ChatTab',
            icon: MessageCircle,
            onPress: () => {
                console.log('Chat tab onPress called - navigating to ChatTab');
                navigation.navigate('ChatTab');
            }
        },
        {
            name: 'ProfileTab',
            icon: User,
            onPress: () => {
                console.log('Profile tab onPress called - navigating to ProfileTab');
                navigation.navigate('ProfileTab');
            }
        }
    ];

    const handleTabPress = (index: number) => {
        console.log('MainNavigator handleTabPress called with index:', index);
        console.log('Tab name:', tabs[index].name);

        // Update active tab index immediately
        setActiveTabIndex(index);

        // Execute the tab's onPress function
        tabs[index].onPress();
    };

    return (
        <>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { display: 'none' }, // Hide default tab bar
                }}
                initialRouteName="HomeTab"
                screenListeners={{
                    tabPress: (e) => {
                        // Extract route name from the event target
                        const routeName = e.target?.split('-')[0];
                        const routeToIndex: { [key: string]: number } = {
                            'HomeTab': 0,
                            'SearchTab': 1,
                            'PostTab': 2,
                            'ChatTab': 3,
                            'ProfileTab': 4,
                        };

                        if (routeName && routeToIndex[routeName as keyof typeof routeToIndex] !== undefined) {
                            setActiveTabIndex(routeToIndex[routeName as keyof typeof routeToIndex]);
                        }
                    }
                }}
            >
                <Tab.Screen
                    name="HomeTab"
                    component={HomeScreenWrapper}
                    options={{ title: 'Home' }}
                />
                <Tab.Screen
                    name="SearchTab"
                    component={SearchScreenWrapper}
                    options={{ title: 'Search' }}
                />
                <Tab.Screen
                    name="PostTab"
                    component={PostScreenWrapper}
                    options={{ title: 'Post' }}
                />
                <Tab.Screen
                    name="ChatTab"
                    component={ChatScreenWrapper}
                    options={{ title: 'Chat' }}
                />
                <Tab.Screen
                    name="ProfileTab"
                    component={ProfileScreenWrapper}
                    options={{ title: 'Profile' }}
                />
            </Tab.Navigator>

            {/* Simple Working Tab Bar */}
            <SimpleWorkingTabBar
                tabs={tabs}
                activeIndex={activeTabIndex}
                onTabPress={handleTabPress}
            />

            <PostTypeSelector
                visible={isPostModalVisible}
                onClose={() => setIsPostModalVisible(false)}
                onSelect={handlePostTypeSelect}
            />
        </>
    );
};

export const MainNavigator = () => {
    const [user, setUser] = useState<any>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.subscribeToAuthChanges((u) => {
            setUser(u);
            setInitializing(false);
        });
        return () => unsubscribe();
    }, []);

    if (initializing) return null;

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main" component={TabNavigator} />
                        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
                        <Stack.Screen
                            name="ImageViewer"
                            component={ImageViewerScreen}
                            options={{
                                presentation: 'fullScreenModal',
                                animation: 'fade',
                                headerShown: false
                            }}
                        />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="PostItem" component={PostScreen} />
                        <Stack.Screen
                            name="PostJob"
                            component={PostJobScreen}
                            options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                            }}
                        />
                        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
                        <Stack.Screen name="KYC" component={KycScreen} />
                        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
                        <Stack.Screen name="UserProfile" component={ProfileScreen} />
                        <Stack.Screen
                            name="MyListings"
                            component={MyListingsScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Wishlist"
                            component={WishlistScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        borderTopWidth: 0,
        elevation: 0,
        height: Platform.OS === 'ios' ? 88 : 64,
        backgroundColor: 'transparent',
    },
    postButton: {
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
    },
});
