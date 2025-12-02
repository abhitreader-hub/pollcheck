import React, { useState } from 'react';
import { VoterStatsDashboard } from './components/VoterStats';
import { VoterList } from './components/VoterList';
import { PracticeVoting } from './components/PracticeVoting';
import { LoginModal } from './components/LoginModal';
import { logout } from './services/auth';
import { 
  Search, 
  LogOut,
  Vote,
  LayoutDashboard,
  Lock,
  CheckCircle2,
  Circle,
  Users,
  Heart
} from 'lucide-react';

type VoteFilter = 'all' | 'voted' | 'not_voted';

const App: React.FC = () => {
   const [currentPage, setCurrentPage] = useState<'dashboard' | 'search' | 'practice' | 'home'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [voteFilter, setVoteFilter] = useState<VoteFilter>('all');

  const handleVoteChange = () => {
    setStatsRefreshKey(k => k + 1);
  };

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleVotersClick = () => {
    if (isAuthenticated) {
      setCurrentPage('search');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    setCurrentPage('search');
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      setIsAuthenticated(false);
       setCurrentPage('home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 font-sans text-gray-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm shadow-gray-100/50">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group transition-transform hover:scale-[1.02] active:scale-[0.98]" 
              onClick={() => setCurrentPage('home')}
            >
              <div className="relative">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 rounded-full opacity-0 group-hover:opacity-60 blur-md transition-opacity duration-300"></div>
                <div className="relative p-0.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full">
                  <img 
                    src="/logomain.png" 
                    alt="PollCheck Logo" 
                    className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-full bg-white p-0.5" 
                  />
                </div>
              </div>
              <div className="flex flex-col">
                                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight leading-none">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600">Shiv Sena</span>
                </h1>
                <span className="text-[8px] sm:text-[9px] font-semibold text-gray-400 tracking-[0.15em] sm:tracking-[0.2em] uppercase hidden xs:block">
                  Voter Management
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Navigation Tabs */}
              <div className="flex bg-gray-100/80 p-1 rounded-xl mr-2 md:mr-4 shadow-inner">
                 {/* Dashboard button hidden
                <button
                  onClick={handleDashboardClick}
                  className={`flex items-center px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === 'dashboard' 
                      ? 'bg-white text-indigo-700 shadow-md shadow-indigo-100/50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
                >
                  {!isAuthenticated && <Lock size={13} className="mr-1.5 opacity-60" />}
                  <LayoutDashboard size={16} className="mr-1.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                 */}
                <button
                  onClick={handleVotersClick}
                  className={`flex items-center px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === 'search' 
                      ? 'bg-white text-indigo-700 shadow-md shadow-indigo-100/50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
                >
                  {!isAuthenticated && <Lock size={13} className="mr-1.5 opacity-60" />}
                  <Users size={16} className="mr-1.5" />
                  <span className="hidden sm:inline">Voters</span>
                </button>
               {/* Practice EVM button hidden
                <button
                  onClick={() => setCurrentPage('practice')}
                  className={`flex items-center px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === 'practice' 
                      ? 'bg-white text-indigo-700 shadow-md shadow-indigo-100/50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
                >
                  <Vote size={16} className="mr-1.5" />
                  <span className="hidden sm:inline">Practice EVM</span>
                  <span className="sm:hidden">EVM</span>
                </button>
                  */}
              </div>

              {(currentPage === 'dashboard' || currentPage === 'search') && isAuthenticated && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
                  title="Logout"
                >
                  <LogOut size={17} className="mr-1.5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {currentPage === 'dashboard' ? (
          <div className="animate-fade-in">
            {/* Stats Section */}
            <VoterStatsDashboard refreshKey={statsRefreshKey} />
          </div>
        ) : currentPage === 'search' ? (
          <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Voter Search</h2>
              <p className="text-gray-500 text-sm sm:text-base mt-0.5 sm:mt-1">Search and manage voter records</p>
            </div>

            {/* Search Toolbar */}
            <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
              <div className="relative flex-1 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-3 sm:py-3.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-sm transition-all shadow-sm hover:shadow-md hover:border-gray-300"
                    placeholder="Search by name or voter ID..."
                  />
                </div>
              </div>
              
              {/* Filter Buttons */}
              <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm w-full sm:w-auto">
                <button
                  onClick={() => setVoteFilter('all')}
                  className={`flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    voteFilter === 'all'
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users size={14} className="mr-1.5 sm:mr-2" />
                  All
                </button>
                <button
                  onClick={() => setVoteFilter('voted')}
                  className={`flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    voteFilter === 'voted'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle2 size={14} className="mr-1.5 sm:mr-2" />
                  Voted
                </button>
                <button
                  onClick={() => setVoteFilter('not_voted')}
                  className={`flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    voteFilter === 'not_voted'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Circle size={14} className="mr-1.5 sm:mr-2" />
                  Pending
                </button>
              </div>
            </div>

            {/* List Section */}
            <VoterList searchQuery={searchQuery} voteFilter={voteFilter} onVoteChange={handleVoteChange} />
          </div>
       ) : currentPage === 'home' ? (
          <div className="animate-fade-in flex items-center justify-center min-h-[70vh]">
            <img 
              src="/image.jpg" 
              alt="Welcome" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        ) : (
          <PracticeVoting />
        )}
      </main>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200/50 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-1.5">
            Made With <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" /> By 
            <a 
              href="https://brandingcatalyst.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 transition-all"
            >
              Branding Catalyst
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
