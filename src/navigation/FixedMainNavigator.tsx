import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { PostTypeSelector } from '../components/post/PostTypeSelector';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react-native';
import { ModernTabBar } from '../components/common/ModernTabBar';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { PostScreen } from '../screens/PostScreen';
import { PostJobScreen } from '../screens/PostJobScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { ChatRoomScreen } from '../screens/ChatRoomScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { KycScreen } from '../screens/KycScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { MyListingsScreen } from '../screens/MyListingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { LandingScreen } from '../screens/LandingScreen';
import { ImageViewerScreen } from '../screens/ImageViewerScreen';
import { WalletScreen } from '../screens/WalletScreen';

import { authService } from '../services/authService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const [isPostModalVisible, setIsPostModalVisible] = useState(false);

    const handlePostTypeSelect = (type: 'product' | 'job' | 'service') => {
        setIsPostModalVisible(false);
        if (type === 'job') {
            navigation.navigate('PostJob');
        } else {
            navigation.navigate('PostItem', { type });
        }
    };

    const tabs = [
        {
            name: 'HomeTab',
            label: 'Home',
            icon: Home,
            onPress: () => {
                console.log('🏠 Navigating to Home');
                navigation.navigate('HomeTab');
            }
        },
        {
            name: 'SearchTab',
            label: 'Search',
            icon: Search,
            onPress: () => {
                console.log('🔍 Navigating to Search');
                navigation.navigate('SearchTab');
            }
        },
        {
            name: 'PostTab',
            label: 'Post',
            icon: Plus,
            onPress: () => {
                console.log('➕ Opening Post Options');
                setIsPostModalVisible(true);
            }
        },
        {
            name: 'ChatTab',
            label: 'Chat',
            icon: MessageCircle,
            onPress: () => {
                console.log('💬 Navigating to Chat');
                navigation.navigate('ChatTab');
            }
        },
        {
            name: 'ProfileTab',
            label: 'Profile',
            icon: User,
            onPress: () => {
                console.log('👤 Navigating to Profile');
                navigation.navigate('ProfileTab');
            }
        }
    ];

    const handleTabPress = (index: number) => {
        console.log(`🎯 Tab ${index} pressed: ${tabs[index].name}`);
        console.log(`📍 Current screen: ${state.routes[state.index].name}`);
        console.log(`🎯 Target screen: ${tabs[index].name}`);

        tabs[index].onPress();
    };

    return (
        <>
            <ModernTabBar
                tabs={tabs}
                activeIndex={state.index}
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

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
            }}
            tabBar={(props) => <CustomTabBar {...props} />}
            initialRouteName="HomeTab"
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="SearchTab"
                component={SearchScreen}
                options={{ title: 'Search' }}
            />
            <Tab.Screen
                name="PostTab"
                component={PostScreen}
                options={{ title: 'Post' }}
            />
            <Tab.Screen
                name="ChatTab"
                component={ChatScreen}
                options={{ title: 'Chat' }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export const FixedMainNavigator = () => {
    const [user, setUser] = React.useState<any>(null);
    const [initializing, setInitializing] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = authService.subscribeToAuthChanges((u) => {
            setUser(u);
            setInitializing(false);
        });
        return () => unsubscribe();
    }, []);

    if (initializing) return null;

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={!user ? "Landing" : "Main"}
            >
                {!user ? (
                    <>
                        <Stack.Screen name="Landing" component={LandingScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main" component={TabNavigator} />
                        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
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
                        <Stack.Screen
                            name="EditProfile"
                            component={EditProfileScreen}
                            options={{ headerShown: false }}
                        />
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
                            name="ImageViewer"
                            component={ImageViewerScreen}
                            options={{
                                headerShown: false,
                                presentation: 'modal',
                                animation: 'fade',
                            }}
                        />
                        <Stack.Screen
                            name="Wallet"
                            component={WalletScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};