import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    doc,
    setDoc,
    updateDoc,
    getDocs
} from 'firebase/firestore';
import { db } from '../core/config/firebase';

export interface Message {
    id?: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: Timestamp;
}

export interface ChatThread {
    id: string;
    participants: string[];
    lastMessage: string;
    lastMessageAt: Timestamp;
    participantDetails: {
        [userId: string]: {
            name: string;
            avatar: string;
        }
    };
    listingType?: 'product' | 'job';
    listingId?: string;
    listingTitle?: string;
    jobRelated?: boolean;
    unreadCount?: number;
    isImportant?: boolean;
    isEliteBuyer?: boolean;
}

export const chatService = {
    // Create or get a chat thread between two users
    getOrCreateChat: async (
        user1Id: string,
        user2Id: string,
        user1Name: string,
        user2Name: string,
        listingType?: 'product' | 'job',
        listingId?: string,
        listingTitle?: string
    ) => {
        console.log('=== CREATING/GETTING CHAT ===');
        console.log('User 1:', user1Id, user1Name);
        console.log('User 2:', user2Id, user2Name);
        console.log('Listing Type:', listingType);

        try {
            const threadId = [user1Id, user2Id].sort().join('_');
            console.log('Thread ID:', threadId);

            const threadRef = doc(db, 'chats', threadId);

            // We'll use setDoc with merge to ensure it exists
            await setDoc(threadRef, {
                participants: [user1Id, user2Id],
                participantDetails: {
                    [user1Id]: { name: user1Name, avatar: `https://i.pravatar.cc/150?u=${user1Id}` },
                    [user2Id]: { name: user2Name, avatar: `https://i.pravatar.cc/150?u=${user2Id}` }
                },
                lastMessage: '',
                lastMessageAt: serverTimestamp(),
                listingType: listingType || 'product',
                listingId: listingId || '',
                listingTitle: listingTitle || '',
                jobRelated: listingType === 'job',
            }, { merge: true });

            console.log('✅ Chat thread created/updated with ID:', threadId);
            console.log('Metadata:', {
                listingType: listingType || 'product',
                listingId: listingId || '',
                listingTitle: listingTitle || ''
            });
            return threadId;
        } catch (error: any) {
            console.error('=== CREATE CHAT ERROR ===');
            console.error('Error:', error);
            throw error;
        }
    },

    // Send a message
    sendMessage: async (chatId: string, senderId: string, text: string) => {
        console.log('=== SENDING MESSAGE ===');
        console.log('Chat ID:', chatId);
        console.log('Sender ID:', senderId);
        console.log('Message:', text);

        try {
            // Add message to messages subcollection
            const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
                chatId,
                senderId,
                text,
                createdAt: serverTimestamp(),
            });

            console.log('✅ Message sent with ID:', messageRef.id);

            // Update last message in main thread doc
            await updateDoc(doc(db, 'chats', chatId), {
                lastMessage: text,
                lastMessageAt: serverTimestamp(),
            });

            console.log('✅ Chat thread updated');
            return messageRef.id;
        } catch (error: any) {
            console.error("=== SEND MESSAGE ERROR ===");
            console.error('Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
    },

    // Subscribe to chat threads for a user
    subscribeToUserChats: (userId: string, callback: (chats: ChatThread[]) => void) => {
        console.log('Subscribing to chats for user:', userId);
        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', userId)
            // Removed orderBy to avoid missing index errors on new projects
        );

        return onSnapshot(q, (snapshot) => {
            console.log('Firestore Snapshot received. Docs:', snapshot.docs.length);
            const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatThread));

            // Sort in-memory instead
            const sortedChats = chats.sort((a, b) => {
                const timeA = a.lastMessageAt?.seconds || 0;
                const timeB = b.lastMessageAt?.seconds || 0;
                return timeB - timeA;
            });

            callback(sortedChats);
        }, (error) => {
            console.error('=== CHAT SUBSCRIPTION ERROR ===');
            console.error(error);
        });
    },

    // Subscribe to messages in a thread
    subscribeToMessages: (chatId: string, callback: (messages: Message[]) => void) => {
        const q = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('createdAt', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            callback(messages);
        });
    }
};
