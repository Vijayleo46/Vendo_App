# 🛍️ Vendo - Marketplace & Job Portal

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Stars](https://img.shields.io/github/stars/Vijayleo46/trust_market?style=flat-square)
![Issues](https://img.shields.io/github/issues/Vijayleo46/trust_market?style=flat-square)
![Forks](https://img.shields.io/github/forks/Vijayleo46/trust_market?style=flat-square)

</div>

A modern React Native marketplace app built with Expo, Firebase, and NativeWind. Buy, sell products, and find jobs - all in one place!

## ✨ Features

### 🛒 Marketplace
- Browse and search products across multiple categories
- Post products for sale with multiple images
- Real-time chat with sellers
- Wishlist functionality
- Advanced filtering and search

### 💼 Job Portal
- Post and browse job listings
- Filter by job type, location, and salary
- Apply directly through the app
- Company profiles with logos
- Skills-based matching

### 👤 User Features
- Firebase Authentication (Email/Password)
- User profiles with photo upload
- KYC verification system
- My listings management
- Chat system for buyers and sellers

### 🎨 UI/UX
- Beautiful OLX-inspired design
- Smooth animations with Moti & Reanimated
- Dark mode support
- Haptic feedback
- Responsive layouts

## 🚀 Tech Stack

- **Framework:** React Native (Expo)
- **Styling:** NativeWind (Tailwind CSS)
- **Backend:** Firebase (Firestore, Auth, Storage)
- **Navigation:** React Navigation
- **Animations:** Moti, React Native Reanimated
- **Language:** TypeScript

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Vijayleo46/trust_market.git

# Navigate to project directory
cd trust_market

# Install dependencies
npm install

# Start the app
npm start
```

## 🔧 Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Update `src/core/config/firebase.ts` with your Firebase config
4. Set up Firestore security rules from `firestore.rules`
5. Set up Storage security rules from `storage.rules`

## 📱 Running the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## 📸 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/250x500?text=Home+Screen" alt="Home Screen" width="250"/>
  <img src="https://via.placeholder.com/250x500?text=Job+Listings" alt="Job Listings" width="250"/>
  <img src="https://via.placeholder.com/250x500?text=Product+Details" alt="Product Details" width="250"/>
</div>

## 🗂️ Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/         # App screens
├── services/        # Firebase services
├── navigation/      # Navigation configuration
├── theme/          # Theme and styling
├── core/           # Core configuration
└── utils/          # Utility functions
```

## 🔥 Firebase Collections

- `users` - User profiles and data
- `products` - Product listings
- `jobs` - Job postings
- `chats` - Chat conversations
- `listings` - General listings

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

Built with ❤️ by [Vijayleo46](https://github.com/Vijayleo46)

## 📊 Stats

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=Vijayleo46&show_icons=true&theme=radical)

---

<div align="center">

⭐ Star this repo if you find it helpful!

[![GitHub followers](https://img.shields.io/github/followers/Vijayleo46?style=social)](https://github.com/Vijayleo46)
[![GitHub stars](https://img.shields.io/github/stars/Vijayleo46/trust_market?style=social)](https://github.com/Vijayleo46/trust_market/stargazers)

</div>
