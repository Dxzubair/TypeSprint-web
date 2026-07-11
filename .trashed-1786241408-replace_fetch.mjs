import fs from 'fs';

const file = 'src/components/AiCoachDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  const fetchAnalysis = async (userQuestion?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost') + '/api/ai-coach', 
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },`;

const replaceStr = `  const fetchAnalysis = async (userQuestion?: string) => {
    setLoading(true);
    setError(null);
    try {
      let idToken = '';
      if (auth?.currentUser) {
        idToken = await auth.currentUser.getIdToken();
      } else {
        throw new Error('User not authenticated. Please sign in to access AI Coach.');
      }

      const response = await fetch(
        (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost') + '/api/ai-coach', 
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${idToken}\`,
        },`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(file, content);
console.log('Replaced');
