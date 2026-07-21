import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { watchlistApi } from '../services/watchlistApi';

const LOCAL_STORAGE_KEY = 'cinema_watchlist';

const WatchlistContext = createContext(null);

export const WatchlistProvider = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to extract movieId from item
  const getMovieIdFromItem = (item) => {
    if (!item) return null;
    return item.movieId || item.movie?.id || item.id;
  };

  // Helper to read local storage
  const getLocalWatchlist = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse local watchlist:', e);
      return [];
    }
  };

  // Save to local storage
  const saveLocalWatchlist = (items) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save local watchlist:', e);
    }
  };

  // Sync / Load watchlist
  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    if (isLoggedIn) {
      try {
        const data = await watchlistApi.getWatchlist();
        if (Array.isArray(data)) {
          // Normalize items format: ensuring movie object and movieId are present
          const normalized = data.map(item => ({
            ...item,
            movieId: item.movieId || item.movie?.id,
            movie: item.movie || item
          }));
          setWatchlist(normalized);
          saveLocalWatchlist(normalized);
        }
      } catch (err) {
        console.error('Error fetching backend watchlist:', err);
        // Fallback to local storage on error
        setWatchlist(getLocalWatchlist());
      } finally {
        setLoading(false);
      }
    } else {
      setWatchlist(getLocalWatchlist());
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist, user]);

  // Check if movie is in watchlist
  const isInWatchlist = useCallback((movieId) => {
    if (!movieId) return false;
    const numId = Number(movieId);
    return watchlist.some(item => Number(getMovieIdFromItem(item)) === numId);
  }, [watchlist]);

  // Toggle watchlist state
  const toggleWatchlist = async (movie) => {
    if (!movie) return;
    const targetId = Number(movie.id || movie.movieId);
    const currentlyIn = isInWatchlist(targetId);

    if (currentlyIn) {
      // Remove
      await removeFromWatchlist(targetId);
    } else {
      // Add
      await addToWatchlist(movie);
    }
  };

  // Add to watchlist
  const addToWatchlist = async (movie) => {
    if (!movie) return;
    const targetId = Number(movie.id || movie.movieId);

    // Prevent duplicates
    if (isInWatchlist(targetId)) return;

    const newItem = {
      movieId: targetId,
      movie: movie,
      createdAt: new Date().toISOString()
    };

    // Optimistic state update
    const updatedList = [newItem, ...watchlist.filter(i => Number(getMovieIdFromItem(i)) !== targetId)];
    setWatchlist(updatedList);
    saveLocalWatchlist(updatedList);

    if (isLoggedIn) {
      try {
        await watchlistApi.add(targetId);
      } catch (err) {
        console.error('Error adding to watchlist via API:', err);
        // If conflict (409), it's already in DB, keep local state
      }
    }
  };

  // Remove from watchlist
  const removeFromWatchlist = async (movieId) => {
    if (!movieId) return;
    const targetId = Number(movieId);

    // Optimistic state update
    const updatedList = watchlist.filter(item => Number(getMovieIdFromItem(item)) !== targetId);
    setWatchlist(updatedList);
    saveLocalWatchlist(updatedList);

    if (isLoggedIn) {
      try {
        await watchlistApi.remove(targetId);
      } catch (err) {
        console.error('Error removing from watchlist via API:', err);
      }
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        loading,
        isInWatchlist,
        toggleWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        refreshWatchlist: fetchWatchlist
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
