import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../components/common/Typography';
import { ChevronLeft, Camera, Save, Check } from 'lucide-react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { auth } from '../core/config/firebase';
import { updateProfile } from 'firebase/auth';
import { userService } from '../services/userService';
import { storageService } from '../services/storageService';
import * as ImagePicker from 'expo-image-picker';

export const EditProfileScreen = ({ navigation }: any) => {
    const user = auth.currentUser;
    const [name, setName] = useState(user?.displayName || 'Leo');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [success, setSuccess] = useState(false);
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

    useEffect(() => {
        // Fetch user profile data from Firestore
        const fetchProfile = async () => {
            if (user) {
                console.log('=== FETCHING USER PROFILE ===');
                console.log('User ID:', user.uid);
                try {
                    const profile = await userService.getProfile(user.uid);
                    if (profile) {
                        console.log('✅ Profile fetched:', profile);
                        setPhone(profile.phone || '');
                        setBio(profile.bio || '');
                        setLocation(profile.location || '');
                        if (profile.photoURL) {
                            setPhotoURL(profile.photoURL);
                            console.log('✅ Photo URL synced from database');
                        }
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const pickImage = async () => {
        if (Platform.OS === 'web') {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
            if (!result.canceled) handleImageSelected(result.assets[0].uri);
            return;
        }

        Alert.alert(
            'Change Profile Photo',
            'Choose a source',
            [
                {
                    text: 'Camera',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission needed', 'Camera access is required to take photos.');
                            return;
                        }
                        const result = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled) handleImageSelected(result.assets[0].uri);
                    },
                },
                {
                    text: 'Gallery',
                    onPress: async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled) handleImageSelected(result.assets[0].uri);
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleImageSelected = async (uri: string) => {
        if (!user) return;

        console.log('📸 Photo selected:', uri.substring(0, 50) + '...');
        setPhotoURL(uri);
        setLoading(true);
        setStatusText('Uploading...');

        try {
            console.log('📤 Automatic Sync: Uploading image...');
            const extension = uri.includes(';base64,') ? 'jpg' : (uri.split('.').pop()?.split('?')[0] || 'jpg');
            const storagePath = `avatars/${user.uid}/profile_${Date.now()}.${extension}`;
            const finalUrl = await storageService.uploadImage(uri, storagePath);

            console.log('📤 Automatic Sync: Updating Auth & Firestore...');
            await Promise.all([
                updateProfile(user, { photoURL: finalUrl }),
                userService.updateProfile(user.uid, {
                    photoURL: finalUrl,
                    updatedAt: new Date()
                })
            ]);

            setPhotoURL(finalUrl); // Update local state with remote URL

            await user.reload();
            console.log('✅ Automatic Sync Complete');
            Alert.alert('Success ✅', 'Profile photo updated! 🚀');
        } catch (error: any) {
            console.error('❌ Automatic Sync Failed:', error);
            Alert.alert('Upload Error', error.message || 'Failed to update photo');
            // Revert photoURL if upload failed
            setPhotoURL(user.photoURL || '');
        } finally {
            setLoading(false);
            setStatusText('');
        }
    };

    const handleSave = async () => {
        console.log('=== SAVING PROFILE TO BACKEND ===');
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'No user logged in');
            return;
        }

        setLoading(true);
        setStatusText('Saving...');

        try {
            // Failsafe timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Update timed out. Please check your connection.')), 45000)
            );

            const saveLogic = async () => {
                let finalPhotoURL = photoURL;

                // Robust check for local URI vs remote URL
                const isLocalUri = photoURL && (
                    photoURL.startsWith('file://') ||
                    photoURL.startsWith('content://') ||
                    photoURL.startsWith('blob:') ||
                    photoURL.startsWith('data:')
                );

                if (isLocalUri) {
                    setStatusText('Uploading photo...');
                    const extension = photoURL.includes(';base64,') ? 'jpg' : (photoURL.split('.').pop()?.split('?')[0] || 'jpg');
                    const storagePath = `avatars/${user.uid}/profile_${Date.now()}.${extension}`;
                    finalPhotoURL = await storageService.uploadImage(photoURL, storagePath);
                    setPhotoURL(finalPhotoURL); // Update local state
                }

                setStatusText('Updating profile...');
                await updateProfile(user, {
                    displayName: name.trim(),
                    photoURL: finalPhotoURL
                });

                setStatusText('Syncing database...');
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: name.trim(),
                    photoURL: finalPhotoURL,
                    phone: phone.trim(),
                    location: location.trim(),
                    bio: bio.trim(),
                    updatedAt: new Date(),
                };

                await userService.updateProfile(user.uid, userData as any);
                await user.reload();
                return true;
            };

            await Promise.race([saveLogic(), timeoutPromise]);

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                navigation.goBack();
            }, 2000);
        } catch (error: any) {
            console.error('=== PROFILE UPDATE ERROR ===', error);
            Alert.alert('Error', 'Failed to save profile: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
            setStatusText('');
        }
    };

    if (success) {
        return (
            <View style={styles.successContainer}>
                <Animated.View entering={ZoomIn} style={styles.successIcon}>
                    <Check size={60} color="#FFF" />
                </Animated.View>
                <Animated.View entering={FadeInUp.delay(300)}>
                    <Typography variant="h1" style={{ color: '#FFF', marginTop: 20, textAlign: 'center' }}>Success!</Typography>
                    <Typography style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 8 }}>
                        Profile details backend-il pass aayi!
                    </Typography>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#002f34" strokeWidth={2} />
                </TouchableOpacity>
                <Typography variant="h2" style={{ fontWeight: '700', fontSize: 20, color: '#002f34' }}>
                    Edit Profile
                </Typography>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    style={[styles.headerSaveBtn, loading && { opacity: 0.5 }]}
                >
                    {loading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#002f34" />
                            {statusText ? <Typography style={{ marginLeft: 8, fontSize: 12, color: '#002f34' }}>{statusText}</Typography> : null}
                        </View>
                    ) : (
                        <Typography style={{ color: '#002f34', fontWeight: '700' }}>
                            Save
                        </Typography>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Profile Photo */}
                <View style={styles.photoSection}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={pickImage}
                        style={styles.photoContainer}
                    >
                        <Image
                            key={photoURL}
                            source={{ uri: photoURL || 'https://i.pravatar.cc/150?u=default' }}
                            style={styles.photo}
                            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                        />
                        <View style={styles.cameraButton}>
                            <Camera size={18} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Typography variant="bodySmall" style={styles.label}>FULL NAME</Typography>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography variant="bodySmall" style={styles.label}>EMAIL</Typography>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={email}
                            editable={false}
                            placeholderTextColor="#9CA3AF"
                        />
                        <Typography variant="bodySmall" color="#9CA3AF" style={{ marginTop: 4 }}>
                            Email cannot be changed
                        </Typography>
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography variant="bodySmall" style={styles.label}>PHONE NUMBER</Typography>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter phone number"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography variant="bodySmall" style={styles.label}>LOCATION</Typography>
                        <TextInput
                            style={styles.input}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Enter your location"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography variant="bodySmall" style={styles.label}>BIO</Typography>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell us about yourself"
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <View style={styles.saveBtnInternal}>
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Save size={20} color="#FFF" />
                                <Typography style={styles.saveText}>Save Changes</Typography>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingBottom: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    headerSaveBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    photoContainer: {
        position: 'relative',
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E2E8F0',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#002f34',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#002f34',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    inputDisabled: {
        backgroundColor: '#F8FAFC',
        color: '#94A3B8',
        borderColor: '#F1F5F9',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    saveButton: {
        marginTop: 32,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#002f34',
        shadowColor: '#002f34',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnInternal: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    saveText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    successContainer: {
        flex: 1,
        backgroundColor: '#002f34',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
});
