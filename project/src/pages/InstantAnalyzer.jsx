import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './analyzer.css';

const TONE = {
  skills: '#3B6FE0',
  semantic: '#1FA898',
  experience: '#7A5AF8',
  education: '#E39A3B',
  title: '#D9506A',
};

const DIM_INFO = {
  skills: 'Skills the job asks for that appear on your resume. Skills in the requirements count most.',
  semantic: "How closely your resume's topics and wording match the job's responsibilities.",
  experience: 'Years of experience on your resume compared with the years the job asks for.',
  education: 'Degree level and field of study compared with what the job asks for.',
  title: 'How closely your past roles and headline match this job title.',
};

const statusFor = (s) =>
  s >= 75 ? { label: 'Strong match', cls: 'high' } : s >= 55 ? { label: 'Moderate match', cls: 'mid' } : { label: 'Low match', cls: 'low' };

const getUiKey = (label) => {
  if (label.includes('Skill')) return 'skills';
  if (label.includes('Experience')) return 'experience';
  if (label.includes('Education')) return 'education';
  if (label.includes('Role')) return 'title';
  return 'semantic';
};

/* ---------- pieces (from Analysis.jsx) ---------- */

// The donut is the score: each segment is the points one area contributed.
function ScoreRing({ score, items, ready }) {
  const R = 74;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg className="ra-ring" viewBox="0 0 200 200" role="img" aria-label={`Overall score ${score} out of 100`}>
      <circle cx="100" cy="100" r={R} fill="none" stroke="var(--track)" strokeWidth="18" />
      <g transform="rotate(-90 100 100)">
        {items.map((it, i) => {
          const len = (it.contribution / 100) * C;
          const seg = (
            <circle
              key={it.key}
              className="ra-seg"
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={TONE[it.key] || '#8AA0B8'}
              strokeWidth="18"
              strokeDasharray={`${ready ? Math.max(len - 2, 0) : 0} ${C}`}
              strokeDashoffset={-offset}
              style={{ transitionDelay: `${i * 90}ms` }}
            />
          );
          offset += len;
          return seg;
        })}
      </g>
      <text x="100" y="104" textAnchor="middle" className="ra-ring-num">{score}</text>
      <text x="100" y="128" textAnchor="middle" className="ra-ring-sub">out of 100</text>
    </svg>
  );
}

// Shows where the score sits between Low (under 55), Moderate and Strong (75+).
function Bands({ score, ready }) {
  return (
    <div className="ra-bands" role="img" aria-label={`Score ${score}. Low is under 55, moderate is 55 to 74, strong is 75 and above.`}>
      <div className="ra-bands-track">
        <i className="low" style={{ width: '55%' }} />
        <i className="mid" style={{ width: '20%' }} />
        <i className="high" style={{ width: '25%' }} />
        <span className="ra-marker" style={{ left: `${ready ? score : 0}%` }} />
      </div>
      <div className="ra-bands-labels">
        <span style={{ width: '55%' }}>Low</span>
        <span style={{ width: '20%' }}>Moderate</span>
        <span style={{ width: '25%' }}>Strong</span>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function InstantAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [position, setPosition] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [over, setOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const fileInputRef = useRef(null);

  const score = analysisResult?.score ?? 0;
  useEffect(() => {
    if (!analysisResult) return;
    setReady(false);
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, [analysisResult]);

  const pickPdf = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Resume must be a PDF file.');
      return;
    }
    setError(null);
    setPdfFile(file);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!pdfFile || !jobDescription) {
      setError('Please provide both a job description and a resume PDF.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('jobDescription', jobDescription);
    formData.append('position', position);
    formData.append('resumePdf', pdfFile);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/analyzer`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysisResult(res.data); // Held purely in memory, nothing is saved
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  // Reset function to analyze another resume
  const handleReset = () => {
    setAnalysisResult(null);
    setJobDescription('');
    setPosition('');
    setPdfFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ---------- results view ---------- */
  if (analysisResult) {
    const a = analysisResult.analysis || {};
    const status = statusFor(score);
    const nextBand = score < 55 ? { to: 55, label: 'Moderate' } : score < 75 ? { to: 75, label: 'Strong' } : null;

    const scored = (a.breakdown || []).map((b) => {
      const uiKey = getUiKey(b.label);
      const contribution = +(b.score * b.weight).toFixed(1);
      const max = +(b.weight * 100).toFixed(1);
      return {
        key: uiKey,
        label: b.label,
        score: b.score,
        weight: b.weight,
        contribution,
        max,
        lost: +(max - contribution).toFixed(1),
      };
    });

    const strongest = scored.length ? [...scored].sort((x, y) => y.score - x.score)[0] : null;
    const biggestGap = scored.length ? [...scored].sort((x, y) => y.lost - x.lost)[0] : null;

    const foundSkills = a.skills?.found || [];
    const missingSkills = a.skills?.missing || [];
    const recommendations = a.recommendations || [];

    return (
      <div className="ra">
        <div className="ra-wrap">
          <button type="button" className="ra-btn ra-btn-ghost" onClick={handleReset} style={{ marginBottom: '20px' }}>
            ← Analyze another resume
          </button>

          <header>
            <h1>{position || 'Instant analysis'}</h1>
            <p className="ra-sub">This session is transient — nothing is saved.</p>
          </header>

          {/* 1. The answer first */}
          <section className="ra-card ra-hero">
            <ScoreRing score={score} items={scored} ready={ready} />
            <div>
              <span className={`ra-pill ${status.cls}`}>{status.label}</span>
              <h2 className="ra-headline" style={{ marginTop: 10 }}>
                {strongest && biggestGap && strongest.key !== biggestGap.key
                  ? `Strongest on ${strongest.label.toLowerCase()}. ${biggestGap.label} costs the most points.`
                  : score >= 75
                    ? 'This resume is well matched to the job.'
                    : 'This resume needs work to match the job.'}
              </h2>
              <p className="ra-lede">
                {biggestGap && biggestGap.lost >= 1
                  ? `${biggestGap.label} is where you lose the most: ${biggestGap.lost} of ${biggestGap.max} possible points.`
                  : 'Every area is close to its maximum.'}
              </p>

              <Bands score={score} ready={ready} />
              <p className="ra-next">
                {nextBand
                  ? `${nextBand.to - score} more ${nextBand.to - score === 1 ? 'point' : 'points'} to reach ${nextBand.label} match.`
                  : 'Already in the strong range.'}
              </p>
            </div>
          </section>

          {/* 2. Where the points went */}
          {scored.length > 0 && (
            <section className="ra-card">
              <h2>Where your points came from</h2>
              <p className="ra-note">Each bar is your score in that area. The points show what it added to your total, out of the most it could add.</p>
              {scored.map((row) => (
                <div className="ra-row pts" key={row.key}>
                  <div className="ra-name">
                    <span>
                      <i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, marginRight: 8, background: TONE[row.key] || '#8AA0B8' }} />
                      {row.label}
                      {biggestGap?.key === row.key && row.lost >= 1 && <span className="ra-flag">Biggest gap</span>}
                    </span>
                    <span className="ra-desc">{a[row.key]?.detail || DIM_INFO[row.key]}</span>
                  </div>
                  <div className="ra-track" aria-hidden="true">
                    <div className="ra-fill" style={{ width: ready ? `${row.score}%` : 0, background: TONE[row.key] || '#8AA0B8' }} />
                  </div>
                  <div className="ra-pts">
                    {Number(row.contribution).toFixed(1)} <small>/ {row.max}</small>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* 3. What to do about it */}
          <section className="ra-card">
            <h2>{recommendations.length ? 'AI recommendations to raise your score' : 'Nothing major to fix'}</h2>
            {recommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {recommendations.map((rec, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: '4px solid #1FA898',
                    gap: '16px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <b style={{ display: 'block', marginBottom: '6px', color: '#334155', fontSize: '15px' }}>Improvement tip</b>
                      <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>{rec}</p>
                    </div>
                    <span className="ra-tag quick" style={{ whiteSpace: 'nowrap', marginTop: '2px' }}>AI Tip</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ra-sub">This resume covers the required skills and matches the role closely.</p>
            )}
          </section>

          {/* 4. Skills detail */}
          <section className="ra-card">
            <h2>Skills comparison</h2>
            <div className="ra-chips">
              {foundSkills.map((s) => <span key={s} className="ra-chip found">{s}</span>)}
              {missingSkills.map((s) => <span key={s} className="ra-chip req" title="Missing">{s}</span>)}

              {!foundSkills.length && !missingSkills.length && (
                <span className="ra-note">No specific skills were detected to compare.</span>
              )}
            </div>
            <p className="ra-note" style={{ marginTop: '15px' }}>
              <i className="ra-key found" /> On your resume
              <i className="ra-key req" style={{ marginLeft: '15px' }} /> Missing from resume
            </p>
          </section>
        </div>
      </div>
    );
  }

  /* ---------- form view ---------- */
  return (
    <div className="ra">
      <div className="ra-wrap">
        <header className="ra-top">
          <div>
            <h1>Instant resume analyzer</h1>
            <p className="ra-sub">Test a resume against any job posting instantly. Nothing is saved.</p>
          </div>
        </header>

        <section className="ra-card">
          <form className="ra-form" onSubmit={handleAnalyze}>
            <div className="ra-two">
              <input
                type="text"
                placeholder="Target position, for example Full Stack Developer"
                aria-label="Target position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
              />
            </div>

            <div className="ra-two">
              <div className="ra-drop" style={{ '--tone': '#3B6FE0' }}>
                <h2>Job description</h2>
                <p className="ra-hint">Paste the full text of the posting</p>
                <textarea
                  placeholder="Paste job description here…"
                  aria-label="Job description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                />
              </div>

              <div
                className={`ra-drop${over ? ' is-over' : ''}`}
                style={{ '--tone': '#1FA898' }}
                onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => { e.preventDefault(); setOver(false); pickPdf(e.dataTransfer.files[0]); }}
              >
                <h2>Resume</h2>
                <p className="ra-hint">PDF only. Drop it here or browse.</p>
                <button type="button" className="ra-btn ra-btn-ghost" onClick={() => fileInputRef.current?.click()}>
                  Browse file
                </button>
                <input ref={fileInputRef} type="file" accept="application/pdf" hidden onChange={(e) => pickPdf(e.target.files[0])} />
                {pdfFile && <p className="ra-file">{pdfFile.name}</p>}
              </div>
            </div>

            {error && <div className="ra-notice err" role="status">{error}</div>}

            <div className="ra-submit">
              <button type="submit" className="ra-btn ra-btn-main" disabled={loading}>
                {loading ? 'Analyzing resume…' : 'Run instant analysis'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}