import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socket, connectSocket, disconnectSocket } from '../utils/socket';
import { useAuth } from './AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);

  // Connect socket when user is authenticated
  useEffect(() => {
    if (user) {
      connectSocket(user._id);
      fetchPendingChallenges();
      fetchActiveChallenges();
    }
    return () => {
      disconnectSocket();
    };
  }, [user]);

  // ── Socket event listeners ──
  useEffect(() => {
    if (!user) return;

    const handleNewChallenge = (data) => {
      // Someone challenged ME — add to pending
      setPendingChallenges((prev) => {
        // Avoid duplicates
        if (prev.some((c) => c.challengeId === data.challengeId)) return prev;
        return [data, ...prev];
      });
      toast(
        `${data.challenger.name} challenges you! ${data.difficulty} · ${data.timeLimit}min — click to view`,
        {
          icon: '⚔',
          duration: 8000,
          onClick: () => {
            window.location.href = `/challenge/${data.challengeId}`;
          },
        }
      );
    };

    const handleAccepted = (data) => {
      // My challenge was accepted — navigate me to the arena!
      toast.success(`${data.opponent.name} accepted! Entering arena...`, { duration: 3000 });
      // Only redirect if not already on the challenge page
      const targetPath = `/challenge/${data.challengeId}`;
      if (window.location.pathname !== targetPath) {
        setTimeout(() => {
          window.location.href = targetPath;
        }, 800);
      }
      // Refresh active challenges
      fetchActiveChallenges();
    };

    const handleDeclined = (data) => {
      toast.error(`${data.opponent.name} declined your challenge`);
      fetchActiveChallenges();
    };

    const handleCancelled = () => {
      toast('Challenge was cancelled', { icon: 'ℹ' });
      fetchPendingChallenges();
      fetchActiveChallenges();
    };

    const handleUpdated = (data) => {
      if (data.challenge) {
        // Update local state if we have this challenge
        setActiveChallenge(data.challenge);
        setActiveChallenges((prev) =>
          prev.map((c) =>
            c.challengeId === data.challenge._id
              ? { ...c, status: data.challenge.status, winner: data.challenge.winner }
              : c
          )
        );
        setPendingChallenges((prev) =>
          prev.filter((c) => c.challengeId !== data.challenge._id)
        );
      }
      fetchActiveChallenges();
    };

    socket.on('challenge:new', handleNewChallenge);
    socket.on('challenge:accepted', handleAccepted);
    socket.on('challenge:declined', handleDeclined);
    socket.on('challenge:cancelled', handleCancelled);
    socket.on('challenge:updated', handleUpdated);

    return () => {
      socket.off('challenge:new', handleNewChallenge);
      socket.off('challenge:accepted', handleAccepted);
      socket.off('challenge:declined', handleDeclined);
      socket.off('challenge:cancelled', handleCancelled);
      socket.off('challenge:updated', handleUpdated);
    };
  }, [user]);

  // ── Fetch pending (incoming) challenges ──
  const fetchPendingChallenges = useCallback(async () => {
    try {
      const res = await api.get('/challenges/pending');
      setPendingChallenges(
        res.data.data.map((c) => ({
          challengeId: c._id,
          challenger: { id: c.challengerId._id, name: c.challengerId.name },
          difficulty: c.difficulty,
          timeLimit: c.timeLimit,
        }))
      );
    } catch {
      // Silently fail
    }
  }, []);

  // ── Fetch active challenges (sent + received) ──
  const fetchActiveChallenges = useCallback(async () => {
    try {
      const res = await api.get('/challenges/my', { params: { status: 'active', limit: 10 } });
      setActiveChallenges(
        res.data.data.map((c) => ({
          challengeId: c._id,
          challenger: { id: c.challengerId._id, name: c.challengerId.name },
          opponent: { id: c.opponentId._id, name: c.opponentId.name },
          difficulty: c.difficulty,
          timeLimit: c.timeLimit,
          status: c.status,
          winner: c.winner,
        }))
      );
    } catch {
      // Silently fail
    }
  }, []);

  const dismissChallenge = (challengeId) => {
    setPendingChallenges((prev) => prev.filter((c) => c.challengeId !== challengeId));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        pendingChallenges,
        activeChallenges,
        activeChallenge,
        setActiveChallenge,
        dismissChallenge,
        fetchPendingChallenges,
        fetchActiveChallenges,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
