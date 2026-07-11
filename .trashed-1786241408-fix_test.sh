sed -i "s/import { collection, getDocs, query, where, deleteDoc } from 'firebase\/firestore';/import { collection, getDocs, query, where, deleteDoc } from 'firebase\/firestore';\nimport { signInAnonymously } from 'firebase\/auth';\nimport { auth } from '..\/utils\/firebase';/g" src/tests/betaFeedback.test.tsx

cat << 'INNER_EOF' > temp_insert.txt
  beforeAll(async () => {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.warn('Failed to sign in anonymously for test:', e);
    }
  });
INNER_EOF

sed -i '/describe(.Beta Feedback End-to-End., () => {/r temp_insert.txt' src/tests/betaFeedback.test.tsx
