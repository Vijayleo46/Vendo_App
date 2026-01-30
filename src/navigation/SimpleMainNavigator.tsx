import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { PostTypeSelector } from '../components/post/PostTypeSelector';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react-native';
import { SimpleWorkingTabBar } from '../components/common/SimpleWorkingTabBar';

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
import { WishlistScreen } from '../screens/WishlistScreen';

import { authService } from '../services/authService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
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

    const tabs = [
        {
            name: 'HomeTab',
            icon: Home,
            onPress: () => {
                console.log('🏠 Navigating to Home');
                navigation.navigate('HomeTab');
            }
        },
        {
            name: 'SearchTab',
            icon: Search,
            onPress: () => {
                console.log('🔍 Navigating to Search');
                navigation.navigate('SearchTab');
            }
        },
        {
            name: 'PostTab',
            icon: Plus,
            onPress: () => {
                console.log('➕ Opening Post Modal');
                setIsPostModalVisible(true);
            }
        },
        {
            name: 'ChatTab',
            icon: MessageCircle,
            onPress: () => {
                console.log('💬 Navigating to Chat');
                navigation.navigate('ChatTab');
            }
        },
        {
            name: 'ProfileTab',
            icon: User,
            onPress: () => {
                console.log('👤 Navigating to Profile');
                navigation.navigate('ProfileTab');
            }
        }
    ];

    const handleTabPress = (index: number) => {
        console.log(`🎯 Tab ${index} pressed: ${tabs[index].name}`);
        setActiveTabIndex(index);
        tabs[index].onPress();
    };

    return (
        <>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { display: 'none' },
                }}
                initialRouteName="HomeTab"
            >
                <Tab.Screen name="HomeTab" component={HomeScreen} />
                <Tab.Screen name="SearchTab" component={SearchScreen} />
                <Tab.Screen name="PostTab" component={PostScreen} />
                <Tab.Screen name="ChatTab" component={ChatScreen} />
                <Tab.Screen name="ProfileTab" component={ProfileScreen} />
            </Tab.Navigator>

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

export const SimpleMainNavigator = () => {
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
                            name="MyListings"
                            component={MyListingsScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Wishlist"
                            component={WishlistScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};