import { Link, Route, Routes, useLocation } from 'react-router-dom';
import HistoryPage from './pages/HistoryPage';
import MainPage from './pages/MainPage';

function BloomMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="markPetal" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff1f2" />
          <stop offset="55%" stopColor="#fda4af" />
          <stop offset="100%" stopColor="#f4584a" />
        </radialGradient>
        <radialGradient id="markCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fbbf24" />
        </radialGradient>
      </defs>
      <g transform="translate(32 32)">
        <g fill="url(#markPetal)">
          <ellipse cx="0" cy="-16" rx="9" ry="15" />
          <ellipse cx="0" cy="-16" rx="9" ry="15" transform="rotate(60)" />
          <ellipse cx="0" cy="-16" rx="9" ry="15" transform="rotate(120)" />
          <ellipse cx="0" cy="-16" rx="9" ry="15" transform="rotate(180)" />
          <ellipse cx="0" cy="-16" rx="9" ry="15" transform="rotate(240)" />
          <ellipse cx="0" cy="-16" rx="9" ry="15" transform="rotate(300)" />
        </g>
        <circle r="6.5" fill="url(#markCore)" />
      </g>
    </svg>
  );
}

function App() {
  const location = useLocation();
  const isHistory = location.pathname.startsWith('/history');

  return (
    <div className="min-h-screen bg-sand-50 bg-bloom-radial">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium text-primary-700 ring-1 ring-primary-100 backdrop-blur">
            <BloomMark className="h-4 w-4" />
            <span>나의 리듬을 부드럽게</span>
          </div>
          <Link to="/" className="flex items-center justify-center gap-3">
            <BloomMark className="h-10 w-10 drop-shadow-sm" />
            <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Bloom
            </h1>
          </Link>
          <p className="mt-3 text-sm text-gray-600 sm:text-base">
            마지막 생리 시작일과 평균 주기만 알려주세요.
            <br className="sm:hidden" />
            <span className="text-gray-500">
              {' '}
              다음 일정과 컨디션 흐름을 살며시 짚어드릴게요.
            </span>
          </p>
          <nav className="mt-5 inline-flex rounded-full bg-white/80 p-1 text-sm shadow-petal ring-1 ring-primary-100/70 backdrop-blur">
            <Link
              to="/"
              className={`rounded-full px-4 py-1.5 font-medium transition ${
                !isHistory
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-primary-700 hover:bg-primary-50'
              }`}
            >
              오늘의 리듬
            </Link>
            <Link
              to="/history"
              className={`rounded-full px-4 py-1.5 font-medium transition ${
                isHistory
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-primary-700 hover:bg-primary-50'
              }`}
            >
              이력 관리
            </Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>

        <footer className="mt-14 flex flex-col items-center gap-1 text-center text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <BloomMark className="h-3.5 w-3.5 opacity-70" />
            <span className="font-medium text-gray-500">Bloom</span>
          </div>
          <p>나의 리듬을 부드럽게 따라가는 주기 다이어리</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
