import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    SafeAreaView,
    Image,
    Dimensions,
    StatusBar,
    Alert
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, SlideInRight } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { ChevronLeft, Phone, Video, MoreVertical, Send, Paperclip, Smile } from 'lucide-react-native';
import { chatService, Message } from '../services/chatService';
import { listingService } from '../services/listingService';
import { auth } from '../core/config/firebase';

const { width } = Dimensions.get('window');

export const ChatRoomScreen = ({ route, navigation }: any) => {
    const { theme, spacing, isDark } = useTheme();
    const {
        chatId = 'demo_chat',
        otherName = 'Seller',
        otherAvatar = 'https://i.pravatar.cc/150?u=seller',
        productImage = '',
        productPrice = '',
        productTitle = '',
        productId = ''
    } = route?.params || {};

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        console.log('=== CHAT ROOM SCREEN MOUNTED ===');
        console.log('Chat ID:', chatId);
        console.log('Other User:', otherName);
        console.log('Product:', productTitle, productPrice);
        console.log('Current User:', auth.currentUser?.uid, auth.currentUser?.displayName);

        const unsubscribe = chatService.subscribeToMessages(chatId, (data) => {
            console.log('=== MESSAGES RECEIVED ===');
            console.log('Total messages:', data.length);
            data.forEach((msg, index) => {
                console.log(`Message ${index + 1}:`, {
                    id: msg.id,
                    senderId: msg.senderId,
                    text: msg.text,
                    createdAt: msg.createdAt
                });
            });
            setMessages(data);
            setLoading(false);

            // Scroll to bottom when new messages arrive
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        return () => {
            console.log('Unsubscribing from messages');
            unsubscribe();
        };
    }, [chatId]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const text = inputText.trim();
        const userId = auth.currentUser?.uid;

        console.log('=== SENDING MESSAGE ===');
        console.log('Chat ID:', chatId);
        console.log('User ID:', userId);
        console.log('Message:', text);

        if (!userId) {
            console.error('❌ No user logged in');
            return;
        }

        setInputText('');

        try {
            const messageId = await chatService.sendMessage(chatId, userId, text);
            console.log('✅ Message sent successfully:', messageId);
        } catch (error: any) {
            console.error('❌ Failed to send message');
            console.error('Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
        }
    };

    const renderMessage = ({ item, index }: { item: Message, index: number }) => {
        const isMe = item.senderId === auth.currentUser?.uid || item.senderId === 'anonymous';
        const formatTime = (ts: any) => {
            if (!ts) return '';
            const date = ts.toDate ? ts.toDate() : new Date(ts);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
        };
        const time = formatTime(item.createdAt);

        return (
            <MotiView
                from={{
                    opacity: 0,
                    translateX: isMe ? 50 : -50,
                }}
                animate={{
                    opacity: 1,
                    translateX: 0,
                }}
                transition={{
                    type: 'timing',
                    duration: 300,
                    delay: index * 50,
                }}
                style={[
                    styles.messageRow,
                    isMe ? styles.myRow : styles.theirRow
                ]}
            >
                <View
                    style={[
                        styles.bubble,
                        isMe ? styles.myBubble : styles.theirBubble
                    ]}
                >
                    <View style={styles.bubbleInner}>
                        <Typography variant="bodyMedium" style={[
                            styles.messageText,
                            isMe ? styles.messageTextMe : styles.messageTextTheir
                        ]}>
                            {item.text}
                        </Typography>
                        <View style={styles.timeContainer}>
                            <Typography variant="bodySmall" style={[
                                styles.timestamp,
                                isMe ? styles.timestampMe : styles.timestampTheir
                            ]}>
                                {time}
                            </Typography>
                        </View>
                    </View>
                </View>
            </MotiView>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* WhatsApp Style Header with Product Info */}
            <SafeAreaView style={styles.safeHeader}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Image source={{ uri: otherAvatar }} style={styles.headerAvatar} />
                        <View style={styles.headerInfo}>
                            <Typography variant="h3" style={styles.headerName}>{otherName}</Typography>
                            <Typography variant="bodySmall" style={styles.headerStatus}>online</Typography>
                        </View>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Video size={22} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Phone size={22} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <MoreVertical size={22} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Product Info Bar */}
                {productImage && (
                    <MotiView
                        from={{ opacity: 0, translateY: -20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400 }}
                        style={styles.productBar}
                    >
                        <Image source={{ uri: productImage }} style={styles.productThumb} />
                        <View style={styles.productInfo}>
                            <Typography style={styles.productTitle} numberOfLines={1}>
                                {productTitle}
                            </Typography>
                            <Typography style={styles.productPrice}>{productPrice}</Typography>
                        </View>
                        <TouchableOpacity
                            onPress={async () => {
                                if (productId) {
                                    setLoading(true);
                                    try {
                                        const productData = await listingService.getListingById(productId);
                                        if (productData) {
                                            navigation.navigate('ProductDetails', { product: productData });
                                        } else {
                                            Alert.alert('Error', 'Product details not found.');
                                        }
                                    } catch (err) {
                                        Alert.alert('Error', 'Failed to fetch product details.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                            style={styles.viewProductButton}
                        >
                            <Typography style={styles.viewProductText}>View</Typography>
                        </TouchableOpacity>
                    </MotiView>
                )}
            </SafeAreaView>

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id || Math.random().toString()}
                renderItem={renderMessage}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* WhatsApp Style Input Footer */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
                style={styles.footer}
            >
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Smile size={24} color="#5E5E5E" />
                    </TouchableOpacity>

                    <TextInput
                        placeholder="Message"
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholderTextColor="#999"
                        multiline
                    />

                    <TouchableOpacity style={styles.attachButton}>
                        <Paperclip size={22} color="#5E5E5E" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSend}
                        style={styles.sendButton}
                        disabled={!inputText.trim()}
                    >
                        <View style={[
                            styles.sendCircle,
                            { backgroundColor: inputText.trim() ? '#002f34' : '#E2E8F0' }
                        ]}>
                            <Send size={20} color={inputText.trim() ? '#FFF' : '#94A3B8'} />
                        </View>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ECE5DD',
    },
    safeHeader: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    headerAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        color: '#000',
        fontSize: 17,
        fontWeight: '600',
    },
    headerStatus: {
        color: '#667781',
        fontSize: 13,
        marginTop: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    productThumb: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#E5E7EB',
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#002f34',
    },
    viewProductButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: '#002f34',
        borderRadius: 6,
    },
    viewProductText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFF',
    },
    listContent: {
        paddingTop: 12,
        paddingHorizontal: 8,
        paddingBottom: 20,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 4,
        maxWidth: '78%',
    },
    myRow: {
        alignSelf: 'flex-end',
    },
    theirRow: {
        alignSelf: 'flex-start',
    },
    bubble: {
        paddingTop: 6,
        paddingBottom: 4,
        paddingHorizontal: 10,
        borderRadius: 16,
        maxWidth: '100%',
        minWidth: 60,
    },
    myBubble: {
        backgroundColor: '#002f34',
        borderBottomRightRadius: 2,
    },
    theirBubble: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    bubbleInner: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
        paddingRight: 4,
        marginBottom: 2,
    },
    messageTextMe: {
        color: '#FFFFFF',
    },
    messageTextTheir: {
        color: '#002f34',
    },
    timeContainer: {
        alignSelf: 'flex-end',
        marginLeft: 'auto',
        paddingLeft: 8,
    },
    timestamp: {
        fontSize: 10,
        marginBottom: 2,
    },
    timestampMe: {
        color: 'rgba(255,255,255,0.6)',
    },
    timestampTheir: {
        color: '#8696a0',
    },
    footer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'ios' ? 34 : 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 28,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    attachButton: {
        padding: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#002f34',
        maxHeight: 120,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    sendButton: {
        marginLeft: 4,
    },
    sendCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#002f34',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});

