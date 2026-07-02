import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

export default function ChallengeNotification({ challenge, onDismiss }) {
  const [handling, setHandling] = useState(false);
  const navigate = useNavigate();
  const { fetchPendingChallenges } = useSocket();

  const handleAccept = async () => {
    setHandling(true);
    try {
      const res = await api.post(`/challenges/${challenge.challengeId}/accept`);
      toast.success('Challenge accepted!');
      onDismiss(challenge.challengeId);
      // Navigate to challenge arena
      navigate(`/challenge/${challenge.challengeId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    } finally {
      setHandling(false);
    }
  };

  const handleDecline = async () => {
    setHandling(true);
    try {
      await api.post(`/challenges/${challenge.challengeId}/decline`);
      onDismiss(challenge.challengeId);
    } catch (err) {
      toast.error('Failed to decline');
    } finally {
      setHandling(false);
    }
  };

  return (
    <div className="card-stone p-4 border-gold-500/15 animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif font-bold text-stone-100 text-sm tracking-wide">
            {challenge.challenger.name}
          </p>
          <p className="text-stone-400 text-xs font-medium mt-0.5">
            {challenge.difficulty} · {challenge.timeLimit} min
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleAccept}
            disabled={handling}
            className="btn-primary text-xs px-3 py-1.5"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            disabled={handling}
            className="btn-danger text-xs px-3 py-1.5"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
