import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, TextInput, Switch, Platform, ActivityIndicator } from 'react-native';
import Animated, { FadeInUp, FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Camera, MapPin, ChevronRight, Check, X, ArrowRight, ArrowLeft, Image as ImageIcon, Trash2, Zap, MessageCircle, Phone, Wand2 } from 'lucide-react-native';
import { listingService } from '../services/listingService';
import { storageService } from '../services/storageService';
import { aiPriceService, PricePrediction } from '../services/aiPriceService';
import { auth } from '../core/config/firebase';
import { rentalService } from '../services/rentalService';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { View as MotiView } from 'moti';

const { width } = Dimensions.get('window');

const CATEGORIES = ['Mobiles', 'Electronics', 'Vehicles', 'Real Estate', 'Jobs', 'Services'];
const CONDITIONS = ['New', 'Used', 'Refurbished'];

export const PostScreen = ({ route, navigation }: any) => {
    const { theme, isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [success, setSuccess] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(route?.params?.type === 'job' ? 'Jobs' : 'Mobiles');
    const [condition, setCondition] = useState<'New' | 'Used' | 'Refurbished'>('New');
    const [details, setDetails] = useState({ chat: true, phone: false });
    const [isBoosted, setIsBoosted] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [location, setLocation] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [prediction, setPrediction] = useState<PricePrediction | null>(null);
    const postType = route?.params?.type || 'product';

    // Rental Specific State
    const [securityDeposit, setSecurityDeposit] = useState('');
    const [minRentalDays, setMinRentalDays] = useState('1');

    const pickImage = async (useCamera = false) => {
        if (images.length >= 5) {
            Alert.alert('Limit Reached', 'You can only add up to 5 images.');
            return;
        }

        let result;
        if (useCamera) {
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                selectionLimit: 5 - images.length,
                quality: 0.7,
            });
        }

        if (!result.canceled) {
            const selectedUris = result.assets.map(asset => asset.uri);
            const combinedImages = [...images, ...selectedUris].slice(0, 5);
            setImages(combinedImages);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleAIPredict = async () => {
        if (images.length === 0) {
            Alert.alert('No Image', 'Please upload an image first for AI to analyze.');
            return;
        }

        setAnalyzing(true);
        try {
            const result = await aiPriceService.predictPrice(images[0], category, condition);
            setPrediction(result);
        } catch (error) {
            Alert.alert('AI Error', 'Could not estimate price. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const applyPrice = (amount: number) => {
        setPrice(amount.toString());
        setPrediction(null);
    };

    const handlePublish = async () => {
        if (!title.trim() || !description.trim() || !price.trim() || !location.trim()) {
            Alert.alert('Missing Fields 📝', 'Please fill in all required fields (Title, Description, Price, Location).');
            return;
        }

        if (images.length === 0) {
            Alert.alert('No Images 📸', 'Please add at least one image to showcase your product.');
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            Alert.alert('Not Logged In 👤', 'Please login to publish products.');
            navigation.navigate('ProfileTab');
            return;
        }

        setLoading(true);
        try {
            setStatusText('Phase 2: Uploading images...');
            const uploadedUrls = await storageService.uploadMultipleImages(images, 'products', (msg) => {
                setStatusText(msg);
            });

            setStatusText('Phase 3: Preparing data...');

            const isMonetary = postType === 'product' || postType === 'rent';
            const finalPrice = isMonetary ? price.replace(/[^0-9.]/g, '') : price;

            const listingData = {
                title: title.trim(),
                description: description.trim(),
                price: finalPrice,
                rentPricePerDay: postType === 'rent' ? Number(finalPrice) : null,
                securityDeposit: postType === 'rent' ? Number(securityDeposit.replace(/[^0-9.]/g, '')) : 0,
                minimumRentalDays: postType === 'rent' ? Number(minRentalDays) : 1,
                category,
                condition: postType === 'product' ? condition : 'New',
                images: uploadedUrls,
                sellerId: currentUser.uid,
                sellerName: currentUser.displayName || currentUser.email || 'Seller',
                location: location.trim(),
                enableChat: details.chat,
                showPhone: details.phone,
                type: postType,
                status: 'active',
                isBoosted,
                views: 0,
                chatsCount: 0,
                createdAt: new Date(),
            };

            setStatusText('Phase 4: Saving to Database...');
            if (postType === 'rent') {
                await rentalService.createProduct({
                    title: listingData.title,
                    description: listingData.description,
                    category: listingData.category,
                    rentPricePerDay: listingData.rentPricePerDay || 0,
                    securityDeposit: listingData.securityDeposit,
                    minimumRentalDays: listingData.minimumRentalDays,
                    ownerId: listingData.sellerId,
                    images: listingData.images,
                    location: listingData.location,
                    availabilityStatus: 'available'
                });
            } else {
                await listingService.createListing(listingData as any);
            }

            setSuccess(true);
            setLoading(false);
            setStatusText('');
        } catch (error: any) {
            console.error('PUBLISH ERROR:', error);
            setLoading(false);
            Alert.alert('Publish Failed ❌', error.message);
        }
    };

    const handlePreview = () => {
        if (!title.trim() || !price) {
            Alert.alert('Incomplete Info', 'Please add title and price.');
            return;
        }
        navigation.navigate('ProductDetails', {
            product: {
                title, description, price, category, condition,
                images: images.length > 0 ? images : ['https://via.placeholder.com/600x400'],
                sellerName: auth.currentUser?.displayName || 'You',
                location, type: category === 'Jobs' ? 'job' : 'product',
                createdAt: new Date(), isPreview: true
            }
        });
    };

    if (success) {
        return (
            <View style={styles.successContainer}>
                <Animated.View entering={ZoomIn} style={styles.successIcon}>
                    <Check size={60} color="#FFF" />
                </Animated.View>
                <Typography variant="h1" style={{ color: '#FFF', marginTop: 20 }}>Published!</Typography>
                <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => navigation.navigate('MyListings')}
                >
                    <Typography style={styles.doneBtnText}>Go to My Ads</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.backHomeBtn}
                    onPress={() => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Main', params: { screen: 'HomeTab' } }],
                        });
                    }}
                >
                    <Typography style={styles.backHomeBtnText}>Back to Home</Typography>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.topHeader, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
                    <ArrowLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Typography style={[styles.headerTitle, { color: theme.text }]}>Create Ad</Typography>
                <TouchableOpacity onPress={handlePublish} disabled={loading}>
                    <Typography style={{ color: theme.text, fontWeight: '800' }}>
                        {loading ? '...' : 'SAVE'}
                    </Typography>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Custom Header Section */}
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 20 }}
                >
                    <Typography style={{ fontSize: 26, fontWeight: '900', color: theme.text }}>
                        {postType === 'job' ? 'Hire Someone' : postType === 'rent' ? 'Rent My Product' : 'Sell Something'}
                    </Typography>
                    <Typography style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '500' }}>
                        {postType === 'rent' ? 'Set your rental terms' : 'Add details to get best price'}
                    </Typography>
                </MotiView>

                {/* Studio Photo Section */}
                <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
                    <Typography style={styles.sectionLabel}>PHOTOS</Typography>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ overflow: 'visible' }}>
                        <TouchableOpacity onPress={() => pickImage()} style={[styles.studioUploadBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <View style={[styles.studioIconCircle, { backgroundColor: theme.surface }]}>
                                <Camera size={28} color={theme.text} />
                            </View>
                            <Typography style={[styles.studioText, { color: theme.text }]}>Add Photos</Typography>
                            <Typography style={[styles.studioSubtext, { color: theme.textTertiary }]}>{images.length}/5 photos</Typography>
                        </TouchableOpacity>

                        {images.map((img, index) => (
                            <View key={index} style={styles.studioImageContainer}>
                                <Image source={{ uri: img }} style={styles.studioImage} />
                                <TouchableOpacity onPress={() => removeImage(index)} style={styles.removePhotoBadge}>
                                    <X size={12} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Form Inputs */}
                <View style={{ paddingHorizontal: 20 }}>
                    <View style={styles.inputWrapper}>
                        <Typography style={[styles.inputLabel, { color: theme.textSecondary }]}>AD TITLE</Typography>
                        <TextInput
                            style={[styles.premiumInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                            placeholder={postType === 'rent' ? "What are you renting out?" : "What are you selling?"}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Typography style={[styles.inputLabel, { color: theme.textSecondary }]}>
                            {postType === 'rent' ? 'RENT PER DAY' : 'PRICE'}
                        </Typography>
                        <View style={[styles.priceInputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Typography style={[styles.currencySymbol, { color: theme.text }]}>₹</Typography>
                            <TextInput
                                style={[styles.priceInput, { color: theme.text }]}
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={price}
                                onChangeText={setPrice}
                                placeholderTextColor={theme.textTertiary}
                            />
                            {postType !== 'rent' && (
                                <TouchableOpacity onPress={handleAIPredict} style={styles.aiBtn}>
                                    <Wand2 size={18} color="#FFF" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {postType === 'rent' && (
                        <>
                            <View style={styles.inputWrapper}>
                                <Typography style={[styles.inputLabel, { color: theme.textSecondary }]}>SECURITY DEPOSIT (OPTIONAL)</Typography>
                                <View style={[styles.priceInputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                    <Typography style={[styles.currencySymbol, { color: theme.text }]}>₹</Typography>
                                    <TextInput
                                        style={[styles.priceInput, { color: theme.text }]}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                        value={securityDeposit}
                                        onChangeText={setSecurityDeposit}
                                        placeholderTextColor={theme.textTertiary}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Typography style={[styles.inputLabel, { color: theme.textSecondary }]}>MINIMUM RENTAL DAYS</Typography>
                                <TextInput
                                    style={[styles.premiumInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                                    placeholder="1"
                                    keyboardType="numeric"
                                    value={minRentalDays}
                                    onChangeText={setMinRentalDays}
                                />
                            </View>
                        </>
                    )}

                    <View style={styles.inputWrapper}>
                        <Typography style={[styles.inputLabel, { color: theme.textSecondary }]}>CATEGORY</Typography>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setCategory(cat)}
                                    style={[styles.catChip, { backgroundColor: theme.card, borderColor: theme.border }, category === cat && [styles.activeCatChip, { backgroundColor: theme.primary, borderColor: theme.primary }]]}
                                >
                                    <Typography style={[styles.catChipText, { color: theme.textSecondary }, category === cat && styles.activeCatChipText]}>{cat}</Typography>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Typography style={[styles.inputLabel, { color: theme.textSecondary }]}>DESCRIPTION</Typography>
                        <TextInput
                            style={[styles.premiumInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border, height: 120, textAlignVertical: 'top' }]}
                            placeholder="Tell sellers about your item..."
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Typography style={[styles.inputLabel, { color: theme.textSecondary }]}>LOCATION</Typography>
                        <View style={[styles.locationBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <MapPin size={20} color={theme.textTertiary} />
                            <TextInput
                                style={styles.locationInput}
                                placeholder="Search city/area"
                                value={location}
                                onChangeText={setLocation}
                            />
                        </View>
                    </View>

                    {/* Options */}
                    <View style={styles.optionRow}>
                        <Typography style={[styles.optionText, { color: theme.text }]}>Enable Chat</Typography>
                        <Switch
                            value={details.chat}
                            onValueChange={v => setDetails({ ...details, chat: v })}
                            trackColor={{ false: theme.border, true: theme.primary }}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.floatingBottom, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                <TouchableOpacity
                    style={[styles.mainPublishBtn, { backgroundColor: theme.primary }]}
                    onPress={handlePublish}
                    disabled={loading}
                >
                    <Typography style={styles.publishBtnText}>
                        {loading ? statusText : 'PUBLISH NOW'}
                    </Typography>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#FFF',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 12 },
    studioUploadBtn: {
        width: 110, height: 140, borderRadius: 20, backgroundColor: '#FFF',
        borderWidth: 2, borderColor: '#F1F5F9', borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
    },
    studioIconCircle: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC',
        justifyContent: 'center', alignItems: 'center', marginBottom: 8
    },
    studioText: { fontSize: 12, fontWeight: '800', color: '#002f34' },
    studioSubtext: { fontSize: 9, color: '#94A3B8', fontWeight: '600' },
    studioImageContainer: { width: 110, height: 140, borderRadius: 20, marginRight: 12 },
    studioImage: { width: '100%', height: '100%', borderRadius: 20 },
    removePhotoBadge: {
        position: 'absolute', top: -5, right: -5, width: 22, height: 22,
        borderRadius: 11, backgroundColor: '#EF4444', justifyContent: 'center',
        alignItems: 'center', borderWidth: 2, borderColor: '#FFF'
    },
    inputWrapper: { marginBottom: 24 },
    inputLabel: { fontSize: 11, fontWeight: '900', color: '#002f34', opacity: 0.4, letterSpacing: 1, marginBottom: 8 },
    premiumInput: {
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        fontWeight: '600',
        borderWidth: 1,
    },
    priceInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
    },
    currencySymbol: { fontSize: 18, fontWeight: '800', color: '#002f34', marginRight: 8 },
    priceInput: { flex: 1, height: 50, fontSize: 20, fontWeight: '800', color: '#002f34' },
    aiBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
    catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1F5F9' },
    activeCatChip: { backgroundColor: '#002f34', borderColor: '#002f34' },
    catChipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    activeCatChipText: { color: '#FFF' },
    locationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
    },
    locationInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#002f34' },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    optionText: { fontSize: 15, fontWeight: '700', color: '#002f34' },
    floatingBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopWidth: 1,
    },
    mainPublishBtn: {
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4
    },
    publishBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
    successContainer: { flex: 1, backgroundColor: '#002f34', justifyContent: 'center', alignItems: 'center' },
    successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    doneBtn: { marginTop: 30, backgroundColor: '#FFF', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25 },
    doneBtnText: { color: '#002f34', fontWeight: '800' },
    backHomeBtn: { marginTop: 15, backgroundColor: 'transparent', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25, borderWidth: 2, borderColor: '#FFF' },
    backHomeBtnText: { color: '#FFF', fontWeight: '800' }
});
