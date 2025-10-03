export const mockFirestoreDoc = {
  set: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockResolvedValue({
    exists: true,
    data: () => ({
      tier: 'free',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  }),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
};

export const mockFirestoreCollection = {
  doc: jest.fn().mockReturnValue(mockFirestoreDoc),
  add: jest.fn().mockResolvedValue({ id: 'doc_123' }),
  where: jest.fn().mockReturnThis(),
  get: jest.fn().mockResolvedValue({
    docs: [],
    empty: true,
  }),
};

export const mockFirestore = {
  collection: jest.fn().mockReturnValue(mockFirestoreCollection),
  doc: jest.fn().mockReturnValue(mockFirestoreDoc),
  batch: jest.fn().mockReturnValue({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  }),
  runTransaction: jest.fn((callback) => callback({
    get: jest.fn().mockResolvedValue(mockFirestoreDoc),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
};

export const mockFirebaseAdmin = {
  firestore: jest.fn().mockReturnValue(mockFirestore),
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
    applicationDefault: jest.fn(),
  },
};

export const createMockFirestoreDoc = (data: any) => ({
  ...mockFirestoreDoc,
  get: jest.fn().mockResolvedValue({
    exists: true,
    data: () => data,
  }),
});
