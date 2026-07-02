import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

function Timer({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const end = new Date(endsAt).getTime();
      const diff = end - now;
      if (diff <= 0) { setTimeLeft('00:00'); return; }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const isLow = timeLeft && timeLeft.startsWith('0') && parseInt(timeLeft.split(':')[1]) < 60;

  return (
    <div className={`font-mono text-4xl font-bold tracking-wider text-center py-4 ${
      isLow ? 'text-crimson-400 animate-pulse' : 'text-gold-400'
    }`}>
      {timeLeft || '--:--'}
    </div>
  );
}

export default function ChallengeArena() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [givingUp, setGivingUp] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);
  const [showGiveUp, setShowGiveUp] = useState(false);

  const fetchChallenge = useCallback(async () => {
    try {
      const res = await api.get(`/challenges/${id}`);
      setChallenge(res.data.data);
    } catch (err) {
      toast.error('Challenge not found');
      navigate('/friends');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchChallenge();
    if (socket) socket.emit('challenge:join', id);
    return () => { if (socket) socket.emit('challenge:leave', id); };
  }, [id, socket, fetchChallenge]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdated = (data) => {
      if (data.challenge && data.challenge._id === id) setChallenge(data.challenge);
    };
    socket.on('challenge:updated', handleUpdated);
    return () => socket.off('challenge:updated', handleUpdated);
  }, [socket, id]);

  const handleSubmit = async () => {
    if (!submissionUrl.trim()) return toast.error('Please provide your LeetCode submission URL');
    if (!submissionUrl.trim().includes('leetcode.com')) return toast.error('Please enter a valid LeetCode URL');
    setSubmitting(true);
    try {
      const res = await api.post(`/challenges/${id}/submit`, { leetcodeSubmissionUrl: submissionUrl.trim() });
      setChallenge(res.data.data);
      toast.success('Solution submitted!');
      setShowSubmit(false);
      setSubmissionUrl('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  const handleGiveUp = async () => {
    setGivingUp(true);
    try {
      const res = await api.post(`/challenges/${id}/giveup`);
      setChallenge(res.data.data);
      toast('You gave up — opponent wins');
      setShowGiveUp(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to give up');
    } finally { setGivingUp(false); }
  };

  if (loading) {
    return (
      <div className="page flex items-center justify-center min-h-[60vh]">
        <div className="dot-loader"><span /><span /><span /></div>
      </div>
    );
  }

  if (!challenge) return null;

  const userId = String(user?._id);
  const challengerId = String(challenge.challengerId?._id || challenge.challengerId);
  const opponentId = String(challenge.opponentId?._id || challenge.opponentId);
  const winnerId = String(challenge.winner?._id || challenge.winner || '');

  const isChallenger = challengerId === userId;
  const isPending = challenge.status === 'pending';
  const isActive = challenge.status === 'active';
  const isCompleted = challenge.status === 'completed' || challenge.status === 'expired';

  // Use role-based submission fields (not "my"/"their" to avoid confusion)
  const challengerSub = challenge.challengerSubmission;
  const opponentSub = challenge.opponentSubmission;
  const mySub = isChallenger ? challengerSub : opponentSub;
  const theirSub = isChallenger ? opponentSub : challengerSub;
  const iSubmitted = !!(mySub?.submittedAt);
  const theySubmitted = !!(theirSub?.submittedAt);
  const bothSubmitted = iSubmitted && theySubmitted;

  const iWon = winnerId === userId;
  const theyWon = winnerId && !iWon;
  const isForfeit = challenge.events?.some(e => e.event === 'give_up');
  const isExpired = challenge.status === 'expired';
  const isDraw = challenge.result === 'draw' || (isExpired && !iSubmitted && !theySubmitted);

  const getStatusText = () => {
    if (isPending) return isChallenger
      ? `Waiting for ${challenge.opponentId?.name} to accept...`
      : `${challenge.challengerId?.name} challenged you!`;
    if (isExpired && !iSubmitted && !theySubmitted) return 'Time expired — no submissions';
    if (isForfeit) return 'Battle ended by forfeit';
    if (bothSubmitted) return 'Both submitted — battle concluded';
    if (iSubmitted && !theySubmitted) return 'You submitted — waiting for opponent';
    if (theySubmitted && !iSubmitted) return 'Opponent submitted — submit before time runs out!';
    return 'Battle in progress!';
  };

  const getResultTitle = () => {
    if (isForfeit) return iWon ? 'Victory by Forfeit' : 'Defeat by Forfeit';
    if (isExpired && !iSubmitted && !theySubmitted) return 'Time Expired';
    if (iWon) return 'Victory!';
    if (theyWon) return 'Defeat';
    return 'Draw';
  };

  const getResultDetail = () => {
    if (isForfeit) return iWon ? 'Your opponent gave up' : 'You forfeited the match';
    if (isExpired && !iSubmitted && !theySubmitted) return 'Neither player submitted before the timer ran out';
    if (iWon) return bothSubmitted ? 'Both submitted — you were faster!' : 'You submitted first — well fought!';
    if (theyWon) return iSubmitted ? 'Both submitted — your opponent was faster' : 'Your opponent submitted first';
    return 'The battle ended in a draw';
  };

  return (
    <div className="page max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Challenge Arena</h1>
          <p className="text-stone-400 text-sm tracking-wide font-medium mt-1">{getStatusText()}</p>
        </div>
        <span className={`badge ${isCompleted ? 'badge-green' : isActive ? 'badge-gold' : 'badge-orange'}`}>
          {isExpired ? 'EXPIRED' : isCompleted ? 'COMPLETED' : isActive ? 'ACTIVE' : 'PENDING'}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Timer + Players + Actions */}
        <div className="lg:col-span-1 space-y-5">
          {/* Timer */}
          {(isActive || isCompleted) && challenge.endsAt && (
            <div className="card-stone p-4">
              <div className="text-[10px] text-stone-500 tracking-[0.15em] uppercase font-bold text-center mb-2">
                {isCompleted ? 'Total Time' : 'Time Remaining'}
              </div>
              <Timer endsAt={challenge.endsAt} />
              {isActive && (
                <div className="h-1 bg-stone-700 rounded-full mt-3 overflow-hidden">
                  <div className="progress-fire h-full" />
                </div>
              )}
            </div>
          )}

          {/* Players — clear role-based labels */}
          <div className="card-stone p-5 space-y-4">
            {/* Challenger row */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-gold-gradient flex items-center justify-center text-sm font-bold text-stone-900 shadow-stone flex-shrink-0">
                {challenge.challengerId?.name?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-stone-100 text-sm tracking-wide truncate">
                    {challenge.challengerId?.name}
                  </p>
                  {isChallenger && <span className="text-[10px] text-stone-500 font-medium">YOU</span>}
                </div>
                {challengerSub?.submittedAt ? (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    Solved at {new Date(challengerSub.submittedAt).toLocaleTimeString()}
                  </p>
                ) : isActive && !isChallenger ? (
                  <p className="text-[11px] text-stone-600 font-medium mt-0.5">Not submitted yet</p>
                ) : null}
              </div>
              {winnerId === challengerId && <span className="badge badge-gold shrink-0 text-[10px]">WINNER</span>}
            </div>

            <div className="text-center font-serif font-bold text-stone-500 text-sm tracking-[0.15em]">VS</div>

            {/* Opponent row */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-stone-700 flex items-center justify-center text-sm font-bold text-stone-300 border border-stone-600/40 flex-shrink-0">
                {challenge.opponentId?.name?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-stone-100 text-sm tracking-wide truncate">
                    {challenge.opponentId?.name}
                  </p>
                  {!isChallenger && <span className="text-[10px] text-stone-500 font-medium">YOU</span>}
                </div>
                {opponentSub?.submittedAt ? (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    Solved at {new Date(opponentSub.submittedAt).toLocaleTimeString()}
                  </p>
                ) : isActive && isChallenger ? (
                  <p className="text-[11px] text-stone-600 font-medium mt-0.5">Not submitted yet</p>
                ) : null}
              </div>
              {winnerId === opponentId && <span className="badge badge-gold shrink-0 text-[10px]">WINNER</span>}
            </div>
          </div>

          {/* Battle info */}
          <div className="card-stone p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-400 font-medium">Difficulty</span>
              <span className="font-bold text-stone-100">{challenge.difficulty}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-400 font-medium">Time Limit</span>
              <span className="font-bold text-stone-100">{challenge.timeLimit} min</span>
            </div>
            {challenge.startedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-stone-400 font-medium">Started</span>
                <span className="font-bold text-stone-100">{new Date(challenge.startedAt).toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* ── Action buttons ── */}
          {/* Submit (active, haven't submitted yet) */}
          {isActive && !iSubmitted && (
            <button onClick={() => setShowSubmit(true)} className="btn-primary w-full py-3">
              Submit Solution
            </button>
          )}

          {/* Already submitted, waiting for opponent */}
          {isActive && iSubmitted && !theySubmitted && (
            <div className="card-stone p-4 text-center border-emerald-500/15 bg-emerald-500/2">
              <p className="text-emerald-400 text-sm font-bold">You submitted</p>
              <p className="text-stone-500 text-xs mt-1 font-medium">Waiting for opponent or timer to expire</p>
            </div>
          )}

          {/* Opponent submitted, you haven't — urgency */}
          {isActive && theySubmitted && !iSubmitted && (
            <div className="card-stone p-4 text-center border-amber-500/15 bg-amber-500/2">
              <p className="text-amber-400 text-sm font-bold">Opponent submitted!</p>
              <p className="text-stone-500 text-xs mt-1 font-medium">Submit before time runs out</p>
            </div>
          )}

          {/* Pending: Accept/Decline (for opponent) */}
          {isPending && !isChallenger && (
            <div className="flex gap-2">
              <button
                onClick={async () => { try { await api.post(`/challenges/${id}/accept`); fetchChallenge(); } catch (err) { toast.error('Failed to accept'); } }}
                className="btn-primary flex-1 py-2.5"
              >
                Accept Challenge
              </button>
              <button
                onClick={async () => { try { await api.post(`/challenges/${id}/decline`); navigate('/friends'); } catch (err) { toast.error('Failed to decline'); } }}
                className="btn-danger py-2.5 px-4"
              >
                Decline
              </button>
            </div>
          )}

          {/* Pending: Cancel (for challenger) */}
          {isPending && isChallenger && (
            <button
              onClick={async () => { try { await api.post(`/challenges/${id}/cancel`); navigate('/friends'); } catch (err) { toast.error('Failed to cancel'); } }}
              className="btn-secondary w-full py-2.5 text-sm"
            >
              Cancel Challenge
            </button>
          )}

          {/* Give Up — always available during active battle */}
          {isActive && (
            <button
              onClick={() => setShowGiveUp(true)}
              className="btn-danger w-full py-2 text-sm"
            >
              Give Up / Forfeit
            </button>
          )}
        </div>

        {/* Right: Result + Problem */}
        <div className="lg:col-span-2 space-y-5">
          {/* Result banner */}
          {isCompleted && (
            <div className={`card-marble p-8 text-center ${
              iWon ? 'border-gold-500/20' : isDraw ? 'border-amber-500/15' : 'border-crimson-500/15'
            }`}>
              <div className="text-5xl mb-4 font-serif">{iWon ? '✦' : isDraw ? '—' : '✧'}</div>
              <h2 className="text-2xl font-serif font-bold text-stone-100 tracking-wider">{getResultTitle()}</h2>
              <p className="text-stone-400 mt-2 font-medium">{getResultDetail()}</p>
            </div>
          )}

          {/* Problem */}
          {challenge.problem?.title && (
            <div className="card-stone p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge text-[10px] ${
                      challenge.difficulty === 'Easy' ? 'badge-green' :
                      challenge.difficulty === 'Medium' ? 'badge-orange' : 'badge-red'
                    }`}>{challenge.difficulty}</span>
                    {challenge.problem.topicTags?.slice(0, 3).map(tag => (
                      <span key={tag} className="badge text-[10px] text-stone-400 border-stone-500/20 bg-stone-700/30">{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-serif font-bold text-xl text-stone-100 tracking-wide">
                    {challenge.problem.questionFrontendId}. {challenge.problem.title}
                  </h3>
                </div>
              </div>

              {challenge.problem.content && (
                <div
                  className="prose prose-sm prose-invert max-w-none mt-4 text-stone-300 text-sm leading-relaxed
                    [&_pre]:bg-stone-800 [&_pre]:border [&_pre]:border-stone-700/50 [&_pre]:rounded-sm [&_pre]:p-4 [&_pre]:text-xs
                    [&_code]:bg-stone-800 [&_code]:text-amber-400 [&_code]:px-1 [&_code]:rounded-sm
                    [&_strong]:text-stone-100 [&_em]:text-stone-200
                    [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
                  dangerouslySetInnerHTML={{ __html: challenge.problem.content }}
                />
              )}

              <a href={challenge.problem.leetcodeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-gold-400 hover:text-gold-300 text-sm font-bold tracking-wide transition-colors">
                Open on LeetCode <span className="text-xs">→</span>
              </a>
            </div>
          )}

          {/* Pending state */}
          {isPending && (
            <div className="card-stone p-12 text-center">
              <div className="font-serif text-5xl text-stone-600 mb-5">◆</div>
              <h3 className="font-serif font-bold text-xl text-stone-100 tracking-wide mb-2">Awaiting Response</h3>
              <p className="text-stone-400 font-medium max-w-md mx-auto">
                {isChallenger
                  ? `You challenged ${challenge.opponentId?.name} to a ${challenge.difficulty} battle (${challenge.timeLimit} min). Waiting for them to accept.`
                  : `${challenge.challengerId?.name} challenged you to a ${challenge.difficulty} battle (${challenge.timeLimit} min). Accept to begin!`}
              </p>
            </div>
          )}

          {/* Submission timeline during active battle */}
          {isActive && (challengerSub?.submittedAt || opponentSub?.submittedAt) && (
            <div className="card-stone p-5">
              <h4 className="font-serif font-bold text-stone-100 tracking-wide mb-3">Submission Timeline</h4>
              <div className="space-y-3">
                {challengerSub?.submittedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-stone-300 font-medium">{challenge.challengerId?.name}</span>
                    <span className="text-stone-500 text-xs">{new Date(challengerSub.submittedAt).toLocaleTimeString()}</span>
                    {winnerId === challengerId && <span className="badge badge-gold ml-auto text-[10px]">Leading</span>}
                  </div>
                )}
                {opponentSub?.submittedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-stone-300 font-medium">{challenge.opponentId?.name}</span>
                    <span className="text-stone-500 text-xs">{new Date(opponentSub.submittedAt).toLocaleTimeString()}</span>
                    {winnerId === opponentId && <span className="badge badge-gold ml-auto text-[10px]">Leading</span>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Submit Modal ── */}
      {showSubmit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm" onClick={() => setShowSubmit(false)} />
          <div className="relative w-full max-w-md card-marble p-6 animate-scale-in">
            <span className="absolute top-2.5 left-2.5 w-1.5 h-1.5 bg-gold-500/15" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-gold-500/15" />
            <span className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 bg-gold-500/15" />
            <span className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 bg-gold-500/15" />

            <h3 className="font-serif font-bold text-lg text-stone-100 tracking-wide mb-1">Submit Your Solution</h3>
            <p className="text-stone-400 text-sm font-medium mb-5">
              Paste your LeetCode submission URL after solving.
              {theySubmitted && <span className="text-amber-400 font-bold block mt-1">Opponent already submitted — hurry!</span>}
            </p>

            <div className="mb-5">
              <label className="label">LeetCode Submission URL</label>
              <input type="url" className="input text-sm" placeholder="https://leetcode.com/submissions/detail/..."
                value={submissionUrl} onChange={e => setSubmissionUrl(e.target.value)} autoFocus />
              <p className="text-[10px] text-stone-500 mt-1.5 font-medium">Must be a valid LeetCode URL (leetcode.com/submissions/...)</p>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 py-2.5">
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </button>
              <button onClick={() => setShowSubmit(false)} className="btn-secondary px-4 py-2.5">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Give Up Confirmation Modal ── */}
      {showGiveUp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm" onClick={() => setShowGiveUp(false)} />
          <div className="relative w-full max-w-sm card-marble p-6 animate-scale-in border-crimson-500/20">
            <span className="absolute top-2.5 left-2.5 w-1.5 h-1.5 bg-crimson-500/20" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-crimson-500/20" />
            <span className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 bg-crimson-500/20" />
            <span className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 bg-crimson-500/20" />

            <h3 className="font-serif font-bold text-lg text-crimson-400 tracking-wide mb-1">Give Up?</h3>
            <p className="text-stone-400 text-sm font-medium mb-5">
              This will forfeit the match. Your opponent will win. This cannot be undone.
            </p>

            <div className="flex gap-3">
              <button onClick={handleGiveUp} disabled={givingUp} className="btn-danger flex-1 py-2.5">
                {givingUp ? 'Forfeiting...' : 'Yes, Give Up'}
              </button>
              <button onClick={() => setShowGiveUp(false)} className="btn-secondary px-4 py-2.5">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
