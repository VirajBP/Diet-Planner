// Pexels Video Fetch Service
// Replace 'YOUR_PEXELS_API_KEY' with your actual API key or import from a secure config
import PEXELS_API_KEY from '../../backend/.env';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY';

export async function fetchExerciseVideos(query = 'exercise', perPage = 10) {
  const url = `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/api/pexels/videos?query=${encodeURIComponent(query)}&per_page=${perPage}`;
  console.log('[Pexels] Fetching videos from:', url);
  try {
    const response = await fetch(url);
    console.log('[Pexels] Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Pexels] Backend proxy failed:', response.status, errorText);
      throw new Error('Failed to fetch videos: ' + response.status);
    }
    const data = await response.json();
    console.log('[Pexels] Data received:', data);
    return data.videos || [];
  } catch (error) {
    console.error('[Pexels] Fetch error:', error);
    return [];
  }
} 