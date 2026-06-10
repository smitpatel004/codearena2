import { useState, useEffect } from 'react'
import { Pie, Doughnut, Radar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale,
  PointElement, LineElement, Filler, CategoryScale, LinearScale
} from 'chart.js'
import api from '../utils/api'
import toast from 'react-hot-toast'

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler, CategoryScale, LinearScale)

const chartDefaults = {
  plugins: { legend: { labels: { color: '#9ca3af', font: { family: 'Inter' } } } },
}

const pieOptions = { ...chartDefaults, maintainAspectRatio: true }
const radarOptions = {
  ...chartDefaults,
  scales: {
    r: {
      angleLines: { color: 'rgba(255,255,255,0.1)' },
      grid: { color: 'rgba(255,255,255,0.1)' },
      pointLabels: { color: '#9ca3af', font: { size: 11 } },
      ticks: { color: '#6b7280', backdropColor: 'transparent', stepSize: 20 },
      suggestedMin: 0, suggestedMax: 100,
    }
  }
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  useEffect(() => {
    api.get('/analytics')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load analytics. Refresh dashboard first.'))
      .finally(() => setLoading(false))
  }, [])

  const handleAiAnalysis = async () => {
    setAiLoading(true)
    try {
      const res = await api.post('/ai/analyze')
      setAnalysis(res.data.data)
      toast.success('AI analysis complete! 🤖')
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed. Make sure GEMINI_API_KEY is set.')
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) return (
    <div className="page flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const diffData = data?.difficultyDistribution
  const platData = data?.platformContribution
  const skillData = data?.skillBreakdown

  const pieChartData = diffData ? {
    labels: diffData.labels,
    datasets: [{
      data: diffData.data,
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(234,179,8,0.8)', 'rgba(239,68,68,0.8)'],
      borderColor: ['#10b981', '#eab308', '#ef4444'],
      borderWidth: 2,
    }]
  } : null

  const doughnutData = platData ? {
    labels: platData.labels,
    datasets: [{
      data: platData.data,
      backgroundColor: ['rgba(234,179,8,0.8)', 'rgba(59,130,246,0.8)', 'rgba(249,115,22,0.8)'],
      borderColor: ['#eab308', '#3b82f6', '#f97316'],
      borderWidth: 2,
    }]
  } : null

  const radarData = skillData ? {
    labels: skillData.labels,
    datasets: [{
      label: 'Your Skills',
      data: skillData.data,
      backgroundColor: 'rgba(99,102,241,0.2)',
      borderColor: '#6366f1',
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      borderWidth: 2,
    }]
  } : null

  return (
    <div className="page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="text-gray-400">Visual breakdown of your coding performance</p>
        </div>
        <button id="ai-analyze-btn" onClick={handleAiAnalysis} disabled={aiLoading}
          className="btn-primary gap-2">
          {aiLoading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
            : '🤖 Analyze My Profile'}
        </button>
      </div>

      {/* Summary row */}
      {data?.summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Skill Score', value: data.summary.skillScore, suffix: '/100' },
            { label: 'Total Solved', value: data.summary.totalSolved },
            { label: 'LC Contest', value: data.summary.contestRating },
            { label: 'CF Rating', value: data.summary.cfRating },
            { label: 'CC Rating', value: data.summary.ccRating },
          ].map(s => (
            <div key={s.label} className="glass p-4 text-center">
              <div className="text-2xl font-black gradient-text">{s.value || 0}<span className="text-sm text-gray-500">{s.suffix}</span></div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="glass p-6">
          <h3 className="section-title">🎯 Difficulty Distribution</h3>
          <div className="flex justify-center" style={{ height: '250px' }}>
            {pieChartData && pieChartData.datasets[0].data.some(v => v > 0)
              ? <Pie data={pieChartData} options={pieOptions} />
              : <div className="flex items-center text-gray-500 text-sm">No data — refresh dashboard first</div>}
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="section-title">🌐 Platform Contribution</h3>
          <div className="flex justify-center" style={{ height: '250px' }}>
            {doughnutData && doughnutData.datasets[0].data.some(v => v > 0)
              ? <Doughnut data={doughnutData} options={pieOptions} />
              : <div className="flex items-center text-gray-500 text-sm">No data — refresh dashboard first</div>}
          </div>
        </div>

        <div className="glass p-6 md:col-span-2 lg:col-span-1">
          <h3 className="section-title">🕸️ Skill Breakdown</h3>
          <div className="flex justify-center" style={{ height: '280px' }}>
            {radarData
              ? <Radar data={radarData} options={radarOptions} />
              : <div className="flex items-center text-gray-500 text-sm">No data</div>}
          </div>
        </div>
      </div>

      {/* AI Analysis Panel */}
      {analysis && (
        <div className="animate-slide-up space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🤖</span>
            <h2 className="text-xl font-bold text-white">AI Analysis Results</h2>
            <span className="badge-purple">Powered by Gemini</span>
          </div>

          {analysis.summary && (
            <div className="glass border border-brand-500/30 bg-brand-500/5 p-5">
              <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
              {analysis.nextMilestone && (
                <div className="mt-3 flex items-center gap-2 text-brand-400 font-medium text-sm">
                  <span>🎯</span> Next milestone: {analysis.nextMilestone}
                </div>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass p-6 border border-emerald-500/20">
              <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">✅ Strengths</h3>
              <ul className="space-y-2">
                {analysis.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-emerald-400 mt-0.5">◆</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass p-6 border border-red-500/20">
              <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2">⚠️ Weaknesses</h3>
              <ul className="space-y-2">
                {analysis.weaknesses?.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-red-400 mt-0.5">◆</span> {w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass p-6 border border-brand-500/20 sm:col-span-2">
              <h3 className="font-bold text-brand-400 mb-4">🚀 Recommendations</h3>
              <ul className="space-y-2">
                {analysis.recommendations?.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-brand-600/30 text-brand-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {analysis.recommendedTopics?.length > 0 && (
              <div className="glass p-6 sm:col-span-2">
                <h3 className="font-bold text-violet-400 mb-4">📚 Recommended Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.recommendedTopics.map((t, i) => (
                    <span key={i} className="badge-purple px-3 py-1.5">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
