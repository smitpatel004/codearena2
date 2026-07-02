import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ChallengeModal({ friend, onClose }) {
  const [difficulty, setDifficulty] = useState('Medium');
  const [timeLimit, setTimeLimit] = useState(20);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      await api.post('/challenges', {
        opponentId: friend.userId || friend._id,
        difficulty,
        timeLimit,
      });
      toast.success(`Challenge sent to ${friend.name}!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send challenge');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm card-marble p-6 animate-scale-in">
        {/* Corner marks */}
        <span className="absolute top-2.5 left-2.5 w-1.5 h-1.5 bg-gold-500/15" />
        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-gold-500/15" />
        <span className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 bg-gold-500/15" />
        <span className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 bg-gold-500/15" />

        <h3 className="font-serif font-bold text-lg text-stone-100 tracking-wide mb-1">
          Challenge {friend.name}
        </h3>
        <p className="text-stone-400 text-sm font-medium mb-6">
          Choose the battle parameters
        </p>

        {/* Difficulty */}
        <div className="mb-5">
          <label className="label">Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {['Easy', 'Medium', 'Hard'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`py-2.5 rounded-sm text-sm font-bold tracking-wide border transition-all ${
                  difficulty === d
                    ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                    : 'bg-stone-800/60 border-stone-600/30 text-stone-400 hover:border-stone-500/40'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Time Limit */}
        <div className="mb-6">
          <label className="label">Time Limit</label>
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 30].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeLimit(t)}
                className={`py-2.5 rounded-sm text-sm font-bold tracking-wide border transition-all ${
                  timeLimit === t
                    ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                    : 'bg-stone-800/60 border-stone-600/30 text-stone-400 hover:border-stone-500/40'
                }`}
              >
                {t} min
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSend}
            disabled={sending}
            className="btn-primary flex-1 py-2.5 text-sm"
          >
            {sending ? 'Sending...' : 'Send Challenge'}
          </button>
          <button onClick={onClose} className="btn-secondary px-4 py-2.5 text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
