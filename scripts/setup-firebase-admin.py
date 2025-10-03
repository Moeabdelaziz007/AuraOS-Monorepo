#!/usr/bin/env python3
"""
AuraOS Firebase Admin SDK Setup
This script initializes Firebase Admin SDK for backend operations
"""

import os
import sys
import json

try:
    import firebase_admin
    from firebase_admin import credentials, firestore, storage
except ImportError:
    print("❌ Error: firebase-admin package not installed")
    print("\nInstall it with:")
    print("  pip install firebase-admin")
    sys.exit(1)

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    
    # Check if service account key exists
    key_path = "serviceAccountKey.json"
    if not os.path.exists(key_path):
        print("❌ Error: serviceAccountKey.json not found")
        print("\nPlease download the service account key from Firebase Console:")
        print("1. Go to https://console.firebase.google.com/")
        print("2. Select project 'auraos-ac2e0'")
        print("3. Settings → Service accounts")
        print("4. Generate new private key")
        print("5. Save as 'serviceAccountKey.json' in project root")
        sys.exit(1)
    
    # Load and validate service account key
    try:
        with open(key_path, 'r') as f:
            key_data = json.load(f)
            project_id = key_data.get('project_id')
            print(f"✓ Service account key loaded")
            print(f"  Project ID: {project_id}")
    except json.JSONDecodeError:
        print("❌ Error: Invalid JSON in serviceAccountKey.json")
        sys.exit(1)
    
    # Initialize Firebase Admin
    try:
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'auraos-ac2e0.firebasestorage.app'
        })
        print("✓ Firebase Admin SDK initialized")
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        sys.exit(1)
    
    return True

def test_firestore():
    """Test Firestore connection"""
    try:
        db = firestore.client()
        # Try to read from a collection
        test_ref = db.collection('_test').document('connection')
        test_ref.set({
            'timestamp': firestore.SERVER_TIMESTAMP,
            'status': 'connected'
        })
        print("✓ Firestore connection successful")
        # Clean up test document
        test_ref.delete()
        return True
    except Exception as e:
        print(f"⚠ Firestore test failed: {e}")
        return False

def test_storage():
    """Test Storage connection"""
    try:
        bucket = storage.bucket()
        print(f"✓ Storage bucket connected: {bucket.name}")
        return True
    except Exception as e:
        print(f"⚠ Storage test failed: {e}")
        return False

def main():
    print("🔥 AuraOS Firebase Admin SDK Setup")
    print("=" * 40)
    print()
    
    # Initialize Firebase
    if not initialize_firebase():
        sys.exit(1)
    
    print()
    print("Testing Firebase services...")
    print()
    
    # Test services
    firestore_ok = test_firestore()
    storage_ok = test_storage()
    
    print()
    print("=" * 40)
    if firestore_ok and storage_ok:
        print("✅ All Firebase services are working!")
    else:
        print("⚠ Some services failed (check permissions)")
    print()
    
    # Show configuration
    print("Firebase Configuration:")
    print(f"  Project ID: auraos-ac2e0")
    print(f"  Auth Domain: auraos-ac2e0.firebaseapp.com")
    print(f"  Storage Bucket: auraos-ac2e0.firebasestorage.app")
    print()
    
    print("Next steps:")
    print("1. Deploy apps: ./scripts/deploy-firebase.sh")
    print("2. Test deployed URLs")
    print("3. Configure custom domains (optional)")
    print()

if __name__ == "__main__":
    main()
