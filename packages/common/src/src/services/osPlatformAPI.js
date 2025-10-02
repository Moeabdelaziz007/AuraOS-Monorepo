import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './FirebaseService';

/**
 * Operating Systems API Service
 */
export const operatingSystemsAPI = {
  // Get all operating systems
  getAll: async (options = {}) => {
    const { limit: limitCount = 20, startAfterDoc = null, orderByField = 'createdAt', orderDirection = 'desc' } = options;
    
    let q = query(
      collection(db, 'operating_systems'),
      orderBy(orderByField, orderDirection)
    );
    
    if (limitCount) q = query(q, limit(limitCount));
    if (startAfterDoc) q = query(q, startAfter(startAfterDoc));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get operating system by ID
  getById: async (id) => {
    const docRef = doc(db, 'operating_systems', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Operating system not found');
  },

  // Get operating systems by developer
  getByDeveloper: async (developer, options = {}) => {
    const { limit: limitCount = 20 } = options;
    
    const q = query(
      collection(db, 'operating_systems'),
      where('developer', '==', developer),
      orderBy('releaseDate', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get operating systems by category
  getByCategory: async (category, options = {}) => {
    const { limit: limitCount = 20 } = options;
    
    const q = query(
      collection(db, 'operating_systems'),
      where('categories', 'array-contains', category),
      orderBy('stats.averageRating', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Search operating systems
  search: async (searchTerm, options = {}) => {
    const { limit: limitCount = 20 } = options;
    
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - consider using Algolia for better search
    const q = query(
      collection(db, 'operating_systems'),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Create new operating system
  create: async (osData) => {
    const docRef = await addDoc(collection(db, 'operating_systems'), {
      ...osData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      stats: {
        totalReviews: 0,
        averageRating: 0,
        totalFavorites: 0,
        viewCount: 0,
        downloadCount: 0
      }
    });
    return docRef.id;
  },

  // Update operating system
  update: async (id, updateData) => {
    const docRef = doc(db, 'operating_systems', id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  // Delete operating system
  delete: async (id) => {
    const docRef = doc(db, 'operating_systems', id);
    await deleteDoc(docRef);
  }
};

/**
 * Reviews API Service
 */
export const reviewsAPI = {
  // Get reviews for an operating system
  getByOS: async (osId, options = {}) => {
    const { limit: limitCount = 10, startAfterDoc = null } = options;
    
    let q = query(
      collection(db, 'reviews'),
      where('operatingSystemId', '==', osId),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );
    
    if (limitCount) q = query(q, limit(limitCount));
    if (startAfterDoc) q = query(q, startAfter(startAfterDoc));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get reviews by user
  getByUser: async (userId, options = {}) => {
    const { limit: limitCount = 10 } = options;
    
    const q = query(
      collection(db, 'reviews'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get review by ID
  getById: async (id) => {
    const docRef = doc(db, 'reviews', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Review not found');
  },

  // Create new review
  create: async (reviewData) => {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'published',
      helpful: {
        helpfulCount: 0,
        notHelpfulCount: 0,
        voters: []
      }
    });
    return docRef.id;
  },

  // Update review
  update: async (id, updateData) => {
    const docRef = doc(db, 'reviews', id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  // Delete review
  delete: async (id) => {
    const docRef = doc(db, 'reviews', id);
    await deleteDoc(docRef);
  },

  // Vote on review helpfulness
  voteHelpful: async (reviewId, userId, isHelpful) => {
    const docRef = doc(db, 'reviews', reviewId);
    const review = await getDoc(docRef);
    
    if (!review.exists()) {
      throw new Error('Review not found');
    }
    
    const reviewData = review.data();
    const voters = reviewData.helpful.voters || [];
    
    if (voters.includes(userId)) {
      throw new Error('User has already voted on this review');
    }
    
    const updateData = {
      'helpful.voters': [...voters, userId]
    };
    
    if (isHelpful) {
      updateData['helpful.helpfulCount'] = (reviewData.helpful.helpfulCount || 0) + 1;
    } else {
      updateData['helpful.notHelpfulCount'] = (reviewData.helpful.notHelpfulCount || 0) + 1;
    }
    
    await updateDoc(docRef, updateData);
  }
};

/**
 * Features API Service
 */
export const featuresAPI = {
  // Get all features
  getAll: async (options = {}) => {
    const { limit: limitCount = 50, category = null } = options;
    
    let q = query(
      collection(db, 'features'),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    
    if (category) {
      q = query(q, where('category', '==', category));
    }
    
    if (limitCount) q = query(q, limit(limitCount));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get features by category
  getByCategory: async (category) => {
    const q = query(
      collection(db, 'features'),
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Create new feature
  create: async (featureData) => {
    const docRef = await addDoc(collection(db, 'features'), {
      ...featureData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      usage: {
        totalOSs: 0,
        popularity: 0
      }
    });
    return docRef.id;
  }
};

/**
 * OS Features API Service (Many-to-Many)
 */
export const osFeaturesAPI = {
  // Get features for an operating system
  getByOS: async (osId) => {
    const q = query(
      collection(db, 'os_features'),
      where('operatingSystemId', '==', osId),
      where('isVerified', '==', true)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get operating systems with a feature
  getByFeature: async (featureId) => {
    const q = query(
      collection(db, 'os_features'),
      where('featureId', '==', featureId),
      where('isVerified', '==', true)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Add feature to operating system
  addFeature: async (osId, featureId, metadata = {}) => {
    const docRef = await addDoc(collection(db, 'os_features'), {
      operatingSystemId: osId,
      featureId: featureId,
      createdAt: serverTimestamp(),
      isVerified: false,
      metadata
    });
    return docRef.id;
  },

  // Remove feature from operating system
  removeFeature: async (osId, featureId) => {
    const q = query(
      collection(db, 'os_features'),
      where('operatingSystemId', '==', osId),
      where('featureId', '==', featureId)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
};

/**
 * Favorites API Service
 */
export const favoritesAPI = {
  // Get user favorites
  getUserFavorites: async (userId, options = {}) => {
    const { limit: limitCount = 20 } = options;
    
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Add to favorites
  addFavorite: async (userId, osId, category = 'general', notes = '') => {
    // Check if already favorited
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('operatingSystemId', '==', osId)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error('Operating system already in favorites');
    }
    
    const docRef = await addDoc(collection(db, 'favorites'), {
      userId,
      operatingSystemId: osId,
      category,
      notes,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Remove from favorites
  removeFavorite: async (userId, osId) => {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('operatingSystemId', '==', osId)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  },

  // Check if favorited
  isFavorited: async (userId, osId) => {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('operatingSystemId', '==', osId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }
};

/**
 * Comparisons API Service
 */
export const comparisonsAPI = {
  // Get all public comparisons
  getPublic: async (options = {}) => {
    const { limit: limitCount = 20 } = options;
    
    const q = query(
      collection(db, 'comparisons'),
      where('isPublic', '==', true),
      orderBy('views', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get user comparisons
  getUserComparisons: async (userId, options = {}) => {
    const { limit: limitCount = 20 } = options;
    
    const q = query(
      collection(db, 'comparisons'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Create comparison
  create: async (comparisonData) => {
    const docRef = await addDoc(collection(db, 'comparisons'), {
      ...comparisonData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      likes: 0
    });
    return docRef.id;
  },

  // Update comparison
  update: async (id, updateData) => {
    const docRef = doc(db, 'comparisons', id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  // Increment view count
  incrementViews: async (id) => {
    const docRef = doc(db, 'comparisons', id);
    const comparison = await getDoc(docRef);
    
    if (comparison.exists()) {
      const currentViews = comparison.data().views || 0;
      await updateDoc(docRef, {
        views: currentViews + 1
      });
    }
  }
};

// Export all APIs
export const osPlatformAPI = {
  operatingSystems: operatingSystemsAPI,
  reviews: reviewsAPI,
  features: featuresAPI,
  osFeatures: osFeaturesAPI,
  favorites: favoritesAPI,
  comparisons: comparisonsAPI
};
