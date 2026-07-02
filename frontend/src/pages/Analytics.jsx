import { useState, useEffect } from 'react'
import { Pie, Doughnut, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  RadialLinearScale, PointElement, LineElement, Filler,
  CategoryScale, LinearScale,
} from 'chart.js'
import api from '../utils/api'
import toast from 'react-hot-toast'

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler, CategoryScale, LinearScale)

const textColor = '#b0a088'
const gridColor = 'rgba(184,150,44,0.06)'

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: textColor, font: { family: 'Inter', size: 10 }, padding: 10, boxWidth: 10 } },
  },
}

const pieOptions = {
  ...chartDefaults,
  plugins: {
    ...chartDefaults.plugins,
    tooltip: { backgroundColor: '#2a241c', titleColor: '#f0d78c', bodyColor: '#d4c8b0', borderColor: 'rgba(184,150,44,0.2)', borderWidth: 1 },
  },
}

const radarOptions = {
  ...chartDefaults,
  scales: {
    r: {
      angleLines: { color: gridColor }, grid: { color: gridColor },
      pointLabels: { color: textColor, font: { size: 10 } },
      ticks: { color: '#887860', backdropColor: 'transparent', stepSize: 20, font: { size: 9 } },
      suggestedMin: 0, suggestedMax: 100,
    },
  },
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  useEffect(() => {
    api.get('/analytics').then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const handleAiAnalysis = async () => {
    setAiLoading(true)
    try {
      const res = await api.post('/ai/analyze')
      setAnalysis(res.data.data)
      toast.success('AI analysis complete')
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed')
    } finally { setAiLoading(false) }
  }

  if (loading)
    return (
      <div className="page flex items-center justify-center min-h-[60vh]">
        <div className="dot-loader"><span /><span /><span /></div>
      </div>
    )

  const diffData = data?.difficultyDistribution
  const platData = data?.platformContribution
  const skillData = data?.skillBreakdown

  const pieChartData = diffData ? {
    labels: diffData.labels,
    datasets: [{ data: diffData.data, backgroundColor: ['rgba(80,160,100,0.6)', 'rgba(200,160,60,0.6)', 'rgba(200,80,80,0.6)'], borderColor: ['#50a064', '#c8a03c', '#c85050'], borderWidth: 2 }],
  } : null

  const doughnutData = platData ? {
    labels: platData.labels,
    datasets: [{ data: platData.data, backgroundColor: ['rgba(200,160,60,0.6)', 'rgba(80,120,180,0.6)', 'rgba(200,120,60,0.6)'], borderColor: ['#c8a03c', '#5078b4', '#c8783c'], borderWidth: 2 }],
  } : null

  const radarData = skillData ? {
    labels: skillData.labels,
    datasets: [{ label: 'Your Skills', data: skillData.data, backgroundColor: 'rgba(184,150,44,0.1)', borderColor: '#b8962c', pointBackgroundColor: '#b8962c', pointBorderColor: '#100e0c', borderWidth: 2 }],
  } : null

  return (
    <div className="page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="text-stone-400 text-sm tracking-wide font-medium mt-1">Visual breakdown of your performance</p>
        </div>
        <button id="ai-analyze-btn" onClick={handleAiAnalysis} disabled={aiLoading} className="btn-primary gap-2 text-sm">
          {aiLoading ? <><span className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />Analyzing...</> : 'Analyze Profile'}
        </button>
      </div>

      {data?.summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Skill Score', value: data.summary.skillScore, suffix: '/100' },
            { label: 'Total Solved', value: data.summary.totalSolved },
            { label: 'LC Contest', value: data.summary.contestRating },
            { label: 'CF Rating', value: data.summary.cfRating },
            { label: 'CC Rating', value: data.summary.ccRating },
          ].map(s => (
            <div key={s.label} className="card-stone p-4 text-center">
              <div className="text-2xl font-bold gradient-text tracking-tight">
                {s.value || 0}{s.suffix && <span className="text-sm text-stone-400 font-medium">{s.suffix}</span>}
              </div>
              <div className="text-[10px] text-stone-500 mt-1.5 tracking-[0.1em] uppercase font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <div className="card-sand p-5">
          <h3 className="font-serif font-bold text-stone-100 mb-3 tracking-wide">Difficulty Distribution</h3>
          <div className="flex justify-center" style={{ height: '200px' }}>
            {pieChartData && pieChartData.datasets[0].data.some(v => v > 0) ? <Pie data={pieChartData} options={pieOptions} /> : <div className="flex items-center text-stone-500 text-xs font-medium">No data yet</div>}
          </div>
        </div>
        <div className="card-sand p-5">
          <h3 className="font-serif font-bold text-stone-100 mb-3 tracking-wide">Platform Contribution</h3>
          <div className="flex justify-center" style={{ height: '200px' }}>
            {doughnutData && doughnutData.datasets[0].data.some(v => v > 0) ? <Doughnut data={doughnutData} options={pieOptions} /> : <div className="flex items-center text-stone-500 text-xs font-medium">No data yet</div>}
          </div>
        </div>
        <div className="card-sand p-5 md:col-span-2 lg:col-span-1">
          <h3 className="font-serif font-bold text-stone-100 mb-3 tracking-wide">Skill Breakdown</h3>
          <div className="flex justify-center" style={{ height: '230px' }}>
            {radarData ? <Radar data={radarData} options={radarOptions} /> : <div className="flex items-center text-stone-500 text-xs font-medium">No data</div>}
          </div>
        </div>
      </div>

      {analysis && (
        <div className="animate-slide-up space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-serif font-bold text-stone-100 tracking-wide">AI Analysis</h2>
            <span className="badge badge-purple">Gemini</span>
          </div>

          {analysis.summary && (
            <div className="card-marble p-6 border-gold-500/10">
              <p className="text-stone-200 leading-relaxed font-medium">{analysis.summary}</p>
              {analysis.nextMilestone && (
                <div className="mt-4 flex items-center gap-2 text-gold-400 font-bold text-sm tracking-wide">
                  <span className="font-serif">◆</span> Next milestone: {analysis.nextMilestone}
                </div>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="card-stone p-6 border-emerald-500/10 bg-emerald-500/2">
              <h3 className="font-serif font-bold text-emerald-400 mb-4 tracking-wide">Strengths</h3>
              <ul className="space-y-2.5">
                {analysis.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-stone-200 font-medium">
                    <span className="text-emerald-400 mt-0.5 font-serif">◆</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-stone p-6 border-red-500/10 bg-red-500/2">
              <h3 className="font-serif font-bold text-red-400 mb-4 tracking-wide">Weaknesses</h3>
              <ul className="space-y-2.5">
                {analysis.weaknesses?.map((w, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-stone-200 font-medium">
                    <span className="text-red-400 mt-0.5 font-serif">◆</span> {w}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-marble p-6 border-gold-500/10 sm:col-span-2">
              <h3 className="font-serif font-bold text-gold-400 mb-4 tracking-wide">Recommendations</h3>
              <ul className="space-y-2.5">
                {analysis.recommendations?.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-stone-200 font-medium">
                    <span className="w-5 h-5 rounded-sm bg-gold-500/10 text-gold-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            {analysis.recommendedTopics?.length > 0 && (
              <div className="card-stone p-6 sm:col-span-2">
                <h3 className="font-serif font-bold text-purple-400 mb-4 tracking-wide">Recommended Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.recommendedTopics.map((t, i) => (
                    <span key={i} className="badge badge-purple">{t}</span>
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
