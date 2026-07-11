# Firestore Security Specification - TypeSprint

## 1. Data Invariants

1. **User Ownership**: All user documents, custom paragraphs, folders, favorites, statistics, and history stored under `/users/{userId}` must strictly be owned by the authenticated user `userId`.
2. **Read/Write Access to Personal Data**: No user is permitted to read or write another user's private data, including typing history, settings, or profile detail (except public leaderboard entries).
3. **Public Leaderboard Integrity**: Every leaderboard entry must have a valid `userId` matching the authenticated user. A user cannot update or delete another user's leaderboard entry, and can only write valid stats (e.g. non-negative WPM, accuracy <= 100).
4. **Field Immutability**: Core fields like `uid`, `userId`, `createdAt`, or `originalOwnerId` must remain unchanged after creation.
5. **Strict Temporal Integrity**: Timestamps like `lastSynced` or `updatedAt` must match the server-generated `request.time`.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads attempt to break Identity, Integrity, and State boundaries:

### Payload 1: Identity Spoofing (Write other user's profile)
- **Target Path**: `/users/user_A` (with authenticated `uid = user_B`)
- **Payload**: `{ "profile": { "name": "Hacked Profile" } }`
- **Expected Result**: `PERMISSION_DENIED`

### Payload 2: Privilege Escalation (Self-Assigned Admin Role)
- **Target Path**: `/users/user_A` (with authenticated `uid = user_A`)
- **Payload**: `{ "profile": { "isAdmin": true, "role": "admin" } }`
- **Expected Result**: `PERMISSION_DENIED`

### Payload 3: Shadow Update / Ghost Field Injection
- **Target Path**: `/users/user_A`
- **Payload**: `{ "profile": { "name": "Player 1", "hackStatus": "unlocked" } }`
- **Expected Result**: `PERMISSION_DENIED` (strictly checked key list)

### Payload 4: Value Poisoning (Invalid Type for Stats)
- **Target Path**: `/users/user_A`
- **Payload**: `{ "stats": { "bestWpm": "one_hundred_wpm" } }`
- **Expected Result**: `PERMISSION_DENIED` (must be type number)

### Payload 5: Negative Value Poisoning (Negative XP/Level)
- **Target Path**: `/users/user_A`
- **Payload**: `{ "profile": { "xp": -500, "level": -5 } }`
- **Expected Result**: `PERMISSION_DENIED` (must be positive)

### Payload 6: Out of Bounds Value Poisoning (Extreme WPM)
- **Target Path**: `/users/user_A`
- **Payload**: `{ "stats": { "bestWpm": 999999 } }`
- **Expected Result**: `PERMISSION_DENIED` (bestWpm must be <= 500)

### Payload 7: Path Variable Poisoning / ID Poisoning
- **Target Path**: `/users/user_A/custom_paragraphs/some_malicious_id_with_junk_symbols_$$$$$$$$$$`
- **Payload**: `{ "title": "Injected Paragraph", "content": "Hello World" }`
- **Expected Result**: `PERMISSION_DENIED` (IDs must match alphanumeric regex)

### Payload 8: Leaderboard Identity Hijacking
- **Target Path**: `/leaderboard/leaderboard_A` (with authenticated `uid = user_B`)
- **Payload**: `{ "userId": "user_A", "bestWpm": 150 }`
- **Expected Result**: `PERMISSION_DENIED` (userId must equal request.auth.uid)

### Payload 9: Temporal Integrity Breach (Client-Injected Time)
- **Target Path**: `/users/user_A`
- **Payload**: `{ "lastSynced": "2030-01-01T00:00:00.000Z" }`
- **Expected Result**: `PERMISSION_DENIED` (must be `request.time`)

### Payload 10: Private PII Exposure
- **Target Path**: `/users/user_A` (Read attempt by `user_B`)
- **Expected Result**: `PERMISSION_DENIED` (Blanket reads or cross-user reads forbidden)

### Payload 11: Array Bound Exhaustion (Denial of Wallet)
- **Target Path**: `/users/user_A`
- **Payload**: `{ "completedLessons": ["L1", "L2", "L3", ... 500 more elements] }`
- **Expected Result**: `PERMISSION_DENIED` (arrays must have capped sizes)

### Payload 12: Leaderboard Record Forgery (WPM vs Accuracy)
- **Target Path**: `/leaderboard/user_A`
- **Payload**: `{ "userId": "user_A", "bestWpm": 120, "accuracy": 150 }`
- **Expected Result**: `PERMISSION_DENIED` (accuracy must be <= 100)

---

## 3. Test Runner: `firestore.rules.test.ts`

```typescript
import { 
  initializeTestEnvironment, 
  RulesTestEnvironment 
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'typesprint-e476d',
    firestore: {
      rules: require('fs').readFileSync('firestore.rules', 'utf8'),
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('TypeSprint Security Rules Red Team Audit', () => {
  it('Payload 1: Reject other user profile modifications', async () => {
    const context = testEnv.authenticatedContext('user_B');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    await expect(setDoc(docRef, { profile: { name: 'Hacked' } })).rejects.toThrow();
  });

  it('Payload 2: Reject privilege escalation', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    await expect(setDoc(docRef, { profile: { isAdmin: true, role: 'admin' } })).rejects.toThrow();
  });

  it('Payload 3: Reject shadow updates / ghost fields', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    await expect(setDoc(docRef, { profile: { name: 'Player 1', hackStatus: 'unlocked' } })).rejects.toThrow();
  });

  it('Payload 4: Reject invalid type specs for typing stats', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    await expect(setDoc(docRef, { stats: { bestWpm: 'one_hundred' } })).rejects.toThrow();
  });

  it('Payload 5: Reject negative levels or XP', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    await expect(setDoc(docRef, { profile: { xp: -1, level: -1 } })).rejects.toThrow();
  });

  it('Payload 6: Reject out of bounds values (speed hacking)', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    await expect(setDoc(docRef, { stats: { bestWpm: 9999 } })).rejects.toThrow();
  });

  it('Payload 7: Reject ID poisoning / junk characters in subcollection keys', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users/user_A/custom_paragraphs/some_malicious_id_$$$');
    await expect(setDoc(docRef, { title: 'Hacked', content: 'Injected content' })).rejects.toThrow();
  });

  it('Payload 8: Reject hijacking leaderboard entry names or user UIDs', async () => {
    const context = testEnv.authenticatedContext('user_B');
    const db = context.firestore();
    const docRef = doc(db, 'leaderboard', 'user_A');
    await expect(setDoc(docRef, { userId: 'user_A', bestWpm: 150 })).rejects.toThrow();
  });

  it('Payload 9: Reject client-injected temporal data', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    await expect(setDoc(docRef, { lastSynced: '2030-01-01T00:00:00Z' })).rejects.toThrow();
  });

  it('Payload 10: Reject cross-user read attempts', async () => {
    const context = testEnv.authenticatedContext('user_B');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    await expect(getDoc(docRef)).rejects.toThrow();
  });

  it('Payload 11: Reject bloated arrays (denial of wallet)', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    const hugeLessons = Array.from({ length: 500 }, (_, i) => `Lesson${i}`);
    await expect(setDoc(docRef, { completedLessons: hugeLessons })).rejects.toThrow();
  });

  it('Payload 12: Reject accuracy values greater than 100%', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'leaderboard', 'user_A');
    await expect(setDoc(docRef, { userId: 'user_A', bestWpm: 100, accuracy: 120 })).rejects.toThrow();
  });
});
```
