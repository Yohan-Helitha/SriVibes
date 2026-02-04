import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { colors } from '../theme/colors';
import AccountScreen from './AccountScreen';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Mock data - will be replaced with API data
const LOCATIONS = ['Kurunegala', 'Kandy', 'Polonnaruwa', 'Ella', 'Colombo'];

const HOTELS = [
  {
    id: '1',
    name: 'Hotel Willow Lake',
    location: 'Kurunegala',
    price: 3000,
    image: 'https://via.placeholder.com/300x200',
    rating: 'Top Rated',
  },
  {
    id: '2',
    name: 'Hotel Willow Lake',
    location: 'Kurunegala',
    price: 5000,
    image: 'https://via.placeholder.com/300x200',
    rating: 'Top Rated',
  },
  // Add more hotels as needed
];

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    'Montserrat-ExtraBold': require('../../assets/fonts/Montserrat-ExtraBold.ttf'),
    'Montserrat-SemiBold': require('../../assets/fonts/Montserrat-SemiBold.ttf'),
  });

  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoSRI}>SRI</Text>
          <Text style={styles.logoVibes}>Vibes</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Category Icons */}
      <View style={styles.categorySection}>
        <TouchableOpacity style={styles.categoryButton}>
          <View style={styles.categoryIconContainer}>
            <Ionicons name="bed-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.categoryText}>Hotels</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryButton}>
          <View style={styles.categoryIconContainer}>
            <Ionicons name="restaurant-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.categoryText}>Restaurants</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryButton}>
          <View style={styles.categoryIconContainer}>
            <Ionicons name="bag-handle-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.categoryText}>Shoping</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryButton}>
          <View style={styles.categoryIconContainer}>
            <Ionicons name="bus-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.categoryText}>Buses</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color={colors.primary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ( e.g: flower shops )"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Location Tags */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.locationScrollView}
        contentContainerStyle={styles.locationContainer}
      >
        {LOCATIONS.map((location) => (
          <TouchableOpacity
            key={location}
            style={[
              styles.locationTag,
              selectedLocation === location && styles.locationTagActive,
            ]}
            onPress={() => setSelectedLocation(location)}
          >
            <Text
              style={[
                styles.locationTagText,
                selectedLocation === location && styles.locationTagTextActive,
              ]}
            >
              {location}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main content area (switches by bottom tab) */}
      {activeTab === 'home' ? (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.cardsGrid}>
            {HOTELS.map((hotel) => (
              <View key={hotel.id} style={styles.card}>
                <View style={styles.cardImageContainer}>
                  <Image 
                    source={{ uri: hotel.image }} 
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(hotel.id)}
                  >
                    <Ionicons
                      name={favorites.has(hotel.id) ? 'heart' : 'heart-outline'}
                      size={24}
                      color={favorites.has(hotel.id) ? '#FF0000' : '#000'}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {hotel.name}
                  </Text>
                  <Text style={styles.cardLocation}>{hotel.location}</Text>
                  <View style={styles.cardFooter}>
                    {hotel.rating && (
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>{hotel.rating}</Text>
                      </View>
                    )}
                    <View style={styles.priceContainer}>
                      <Text style={styles.fromText}>from</Text>
                      <Text style={styles.priceText}>LKR {hotel.price}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : activeTab === 'favourite' ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No favourites yet.</Text>
        </View>
      ) : activeTab === 'bookings' ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No bookings yet.</Text>
        </View>
      ) : activeTab === 'account' ? (
        <AccountScreen />
      ) : null}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={24}
            color={activeTab === 'home' ? colors.primary : '#666'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'home' && styles.navTextActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('favourite')}
        >
          <Ionicons
            name={activeTab === 'favourite' ? 'heart' : 'heart-outline'}
            size={24}
            color={activeTab === 'favourite' ? colors.primary : '#666'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'favourite' && styles.navTextActive,
            ]}
          >
            Favourite
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('bookings')}
        >
          <MaterialIcons
            name="receipt-long"
            size={24}
            color={activeTab === 'bookings' ? colors.primary : '#666'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'bookings' && styles.navTextActive,
            ]}
          >
            bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('account')}
        >
          <Ionicons
            name={activeTab === 'account' ? 'person' : 'person-outline'}
            size={24}
            color={activeTab === 'account' ? colors.primary : '#666'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'account' && styles.navTextActive,
            ]}
          >
            My Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSRI: {
    fontSize: 28,
    color: colors.white,
    fontFamily: 'Montserrat-ExtraBold',
  },
  logoVibes: {
    fontSize: 28,
    color: colors.white,
    fontFamily: 'Montserrat-SemiBold',
  },
  notificationButton: {
    position: 'absolute',
    right: 20,
    top: 50,
    padding: 8,
  },
  categorySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  categoryButton: {
    alignItems: 'center',
    width: 80,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: colors.textDark,
    textAlign: 'center',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
  },
  locationScrollView: {
    maxHeight: 50,
  },
  locationContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  locationTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  locationTagActive: {
    backgroundColor: colors.primary,
  },
  locationTagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  locationTagTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  fromText: {
    fontSize: 9,
    color: '#666',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
