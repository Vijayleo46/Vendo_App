import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, TextInput, ActivityIndicator, ScrollView, StatusBar } from 'react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Search, MoreHorizontal, MessageSquare, Bell, Heart, Shield, Star, CheckCircle } from 'lucide-react-native';
import { chatService, ChatThread } from '../services/chatService';
import { userService } from '../services/userService';
import { auth } from '../core/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const { width } = Dimensions.get('window');

const CHAT_FILTERS = [
    { id: 'all', label: 'All', icon: MessageSquare },
    { id: 'unread', label: 'Unread', icon: Bell },
    { id: 'important', label: 'Important', icon: Heart },
    { id: 'elite', label: 'Elite Buyer', icon: Shield },
];

const ChatListItem = ({ item, index, navigation }: { item: ChatThread, index: number, navigation: any }) => {
    const [otherProfile, setOtherProfile] = useState<any>(null);
    const otherUserId = item.participants.find(id => id !== auth.currentUser?.uid);

    useEffect(() => {
        if (otherUserId) {
            userService.getProfile(otherUserId).then(profile => {
                if (profile) setOtherProfile(profile);
            });
        }
    }, [otherUserId]);

    const title = otherProfile?.displayName || item.participantDetails?.[otherUserId || '']?.name || 'Chat';
    const avatar = otherProfile?.photoURL || item.participantDetails?.[otherUserId || '']?.avatar || 'https://i.pravatar.cc/150?u=default';
    const time = item.lastMessageAt ? new Date(item.lastMessageAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';

    return (
        <Animated.View entering={FadeInRight.delay(index * 50 + 100).springify()}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ChatRoom', {
                    chatId: item.id,
                    otherName: title,
                    otherAvatar: avatar,
                    productTitle: item.listingTitle,
                    productImage: item.participantDetails?.[otherUserId || '']?.avatar || '', // Fallback or fetch from listing
                    productId: item.listingId,
                })}
                style={styles.chatCard}
            >
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                    <View style={styles.onlineIndicator} />
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                        <Typography variant="bodyMedium" style={{ fontWeight: '600', fontSize: 16, color: '#000' }}>
                            {title}
                        </Typography>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {item.listingTitle && (
                                <Typography variant="bodySmall" style={{ fontSize: 10, color: '#6366F1', marginRight: 8, fontStyle: 'italic' }}>
                                    {item.listingTitle}
                                </Typography>
                            )}
                            <Typography variant="bodySmall" style={{ fontSize: 12, color: '#8E8E93' }}>
                                {time}
                            </Typography>
                            {(item.unreadCount || 0) > 0 && <View style={styles.unreadDot} />}
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, justifyContent: 'space-between' }}>
                        <Typography variant="bodySmall" color="#8E8E93" numberOfLines={1} style={{ flex: 1, fontSize: 14 }}>
                            {item.lastMessage || "Tap to start chatting"}
                        </Typography>
                        {item.isEliteBuyer && (
                            <View style={styles.eliteBadge}>
                                <Shield size={10} color="#FFD700" fill="#FFD700" />
                                <Typography style={styles.eliteText}>ELITE</Typography>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export const ChatScreen = ({ navigation }: any) => {
    const { theme, spacing, isDark } = useTheme();
    const [chats, setChats] = useState<ChatThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'products' | 'jobs'>('products');
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        console.log('=== CHAT SCREEN INITIALIZING ===');

        const initializeSubscription = (user: any) => {
            if (!user) {
                console.log('❌ No user logged in for chat subscription');
                setChats([]);
                setLoading(false);
                return;
            }

            console.log('✅ User ready for chat subscription:', user.uid);
            setLoading(true);

            return chatService.subscribeToUserChats(user.uid, (data) => {
                console.log('=== CHATS RECEIVED ===');
                console.log('Total chats:', data.length);
                setChats(data);
                setLoading(false);
            });
        };

        // First attempt with current user
        let currentUnsubscribe = initializeSubscription(auth.currentUser);

        // Also listen for auth state changes to catch delayed initialization
        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('Auth state changed in ChatScreen:', user?.uid);
            if (currentUnsubscribe) currentUnsubscribe();
            currentUnsubscribe = initializeSubscription(user);
        });

        return () => {
            console.log('Cleaning up chat subscriptions');
            if (currentUnsubscribe) currentUnsubscribe();
            authUnsubscribe();
        };
    }, []);

    // Separate chats by type (based on chat metadata or listing type)
    const productChats = chats.filter(chat => {
        return !chat.jobRelated;
    });

    const jobChats = chats.filter(chat => {
        return chat.jobRelated === true;
    });

    console.log('Product chats:', productChats.length);
    console.log('Job chats:', jobChats.length);

    const currentChats = activeTab === 'products' ? productChats : jobChats;

    const filteredChats = currentChats.filter(chat => {
        // Search Filter
        const otherUserId = chat.participants.find(id => id !== auth.currentUser?.uid);
        const otherUser = chat.participantDetails?.[otherUserId || ''];
        const matchesSearch = otherUser ? otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
        if (!matchesSearch) return false;

        // Quick Filters (Mock logic for now)
        if (activeFilter === 'unread') return (chat.unreadCount || 0) > 0;
        if (activeFilter === 'important') return chat.isImportant === true;
        if (activeFilter === 'elite') return chat.isEliteBuyer === true;

        return true;
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
            {/* WhatsApp Style Header */}
            <View style={[styles.header, { backgroundColor: theme.background }]}>
                <Typography variant="h1" style={{ fontSize: 24, fontWeight: '700', color: theme.text }}>
                    Chats
                </Typography>
            </View>

            {/* Premium Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchInner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Search size={18} color={theme.textTertiary} strokeWidth={2.5} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search chats"
                        placeholderTextColor={theme.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Quick Filters - Premium Chips */}
            <View style={{ marginBottom: 16 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                >
                    {CHAT_FILTERS.map((filter, index) => {
                        const isActive = activeFilter === filter.id;
                        const Icon = filter.icon;
                        return (
                            <Animated.View
                                key={filter.id}
                                entering={FadeInRight.delay(index * 100)}
                            >
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setActiveFilter(filter.id)}
                                    style={[
                                        styles.filterChip,
                                        { backgroundColor: theme.surface, borderColor: theme.border },
                                        isActive && [styles.activeFilterChip, { backgroundColor: theme.primary, borderColor: theme.primary }]
                                    ]}
                                >
                                    <Icon size={16} color={isActive ? '#FFFFFF' : theme.textSecondary} strokeWidth={2.5} />
                                    <Typography
                                        style={[
                                            styles.filterChipText,
                                            { color: theme.textSecondary },
                                            isActive && styles.activeFilterChipText
                                        ]}
                                    >
                                        {filter.label}
                                    </Typography>
                                    {filter.id === 'unread' && (
                                        <View style={styles.unreadCountBadge}>
                                            <Typography style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>
                                                {chats.filter(c => (c.unreadCount || 0) > 0).length}
                                            </Typography>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Tab Selector - Chats/Groups Style */}
            <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'products' && [styles.activeTab, { backgroundColor: theme.background }]]}
                    onPress={() => setActiveTab('products')}
                >
                    <Typography
                        variant="bodyMedium"
                        style={[
                            styles.tabText,
                            { color: theme.textSecondary },
                            activeTab === 'products' && [styles.activeTabText, { color: theme.primary }]
                        ]}
                    >
                        Products
                    </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'jobs' && [styles.activeTab, { backgroundColor: theme.background }]]}
                    onPress={() => setActiveTab('jobs')}
                >
                    <Typography
                        variant="bodyMedium"
                        style={[
                            styles.tabText,
                            { color: theme.textSecondary },
                            activeTab === 'jobs' && [styles.activeTabText, { color: theme.primary }]
                        ]}
                    >
                        Jobs
                    </Typography>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={[styles.emptyContainer, { marginTop: 100 }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Typography style={{ marginTop: 16, color: theme.textTertiary }}>Loading chats...</Typography>
                </View>
            ) : (
                <FlatList
                    data={filteredChats}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <Animated.View entering={FadeInUp.delay(300)} style={styles.emptyContainer}>
                            <View style={[styles.emptyIconCircle, { backgroundColor: theme.surface }]}>
                                <MessageSquare size={40} color={theme.textTertiary} />
                            </View>
                            <Typography variant="h3" style={{ marginTop: 20, color: theme.text }}>
                                No {activeTab} chats yet
                            </Typography>
                            <Typography variant="bodyMedium" style={{ textAlign: 'center', marginTop: 8, color: theme.textTertiary }}>
                                Your conversations about {activeTab} will appear here.
                            </Typography>
                        </Animated.View>
                    }
                    renderItem={({ item, index }) => (
                        <ChatListItem item={item} index={index} navigation={navigation} />
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#002f34',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    searchInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        height: 48,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '500',
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    activeFilterChip: {
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    activeFilterChipText: {
        color: '#FFFFFF',
    },
    unreadCountBadge: {
        backgroundColor: '#EF4444',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    eliteBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#002f34',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
        marginLeft: 8,
    },
    eliteText: {
        color: '#FFD700',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 0,
        borderBottomWidth: 0.5,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F3F4F6',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    cardContent: {
        flex: 1,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#002f34',
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
