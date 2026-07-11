# Create a shared mock for useAuth in setupTests.ts
sed -i "/vi.mock('firebase\/app'/i vi.mock('\/src\/context\/AuthContext', () => ({\n  useAuth: () => ({\n    user: { uid: '123', displayName: 'Test User' },\n    loading: false,\n    isAnonymous: false,\n    loginWithGoogle: vi.fn(),\n    logout: vi.fn(),\n    isFirebaseActive: true\n  }),\n  AuthProvider: ({ children }: any) => <div>{children}<\/div>\n}));\n" src/setupTests.ts

# We will remove the local vi.mock for AuthContext from the 4 test files
sed -i '/vi.mock(..\/context\/AuthContext/,/}));/d' src/components/ExamHubDashboard.test.tsx
sed -i '/vi.mock(..\/context\/AuthContext/,/}));/d' src/components/AchievementsShelf.test.tsx
sed -i '/vi.mock(..\/context\/AuthContext/,/}));/d' src/components/LeaderboardsDashboard.test.tsx
sed -i '/vi.mock(..\/context\/AuthContext/,/}));/d' src/components/AuthModal.test.tsx

