'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Search, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Home,
  TrendingUp,
  Clock,
  BarChart3,
  FolderOpen,
  Grid,
  Star,
  Calendar,
  Filter,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react';

// --- Helper Components defined OUTSIDE the main component ---

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Byte';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const ContentTile = React.memo(({ content, size = 'normal', playVideo, platformColors }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={`relative group cursor-pointer transform transition-all duration-300 ${
        isHovered ? 'scale-105 z-10' : ''
      } ${size === 'large' ? 'w-80 h-48' : 'w-64 h-96'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => playVideo(content)}
    >
      <div className={`relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br ${platformColors[content.platform] || platformColors.local} shadow-2xl`}>
        <img
          src={content.image || content.url}
          alt={content.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = `https://via.placeholder.com/300x450/333/white?text=${encodeURIComponent(content.title)}`; }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300" />
        
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-white opacity-90 mx-auto mb-2" fill="currentColor" />
              {content.platform !== 'local' && (
                <ExternalLink className="w-6 h-6 text-white opacity-70 mx-auto" />
              )}
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
          <h3 className="text-white font-bold text-lg mb-1 truncate">{content.title}</h3>
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span className="capitalize">{content.platform}</span>
            <span className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" />
              {content.rating}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1">{content.genre} • {content.year}</p>
          {content.platform === 'local' && content.size && (
            <p className="text-gray-500 text-xs">{formatFileSize(content.size)}</p>
          )}
          {content.channelTitle && (
            <p className="text-gray-500 text-xs truncate">{content.channelTitle}</p>
          )}
        </div>
      </div>
    </div>
  );
});

const Navigation = ({ currentView, setCurrentView, tmdbApiKey, youtubeApiKey, loadRealContent, loading, searchQuery, setSearchQuery, setShowSettings, handleSearch }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-80 backdrop-blur-xl border-b border-gray-800">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-white">Kinsfolk Streaming Hub</h1>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setCurrentView('home')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                currentView === 'home' ? 'bg-white bg-opacity-20 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>
            <button 
              onClick={() => setCurrentView('stats')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                currentView === 'stats' ? 'bg-white bg-opacity-20 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Stats</span>
            </button>
            {(tmdbApiKey || youtubeApiKey) && (
              <button
                onClick={loadRealContent}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-gray-400 hover:text-white disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search and press Enter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // --- NEW: Trigger search on Enter key press ---
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="pl-10 pr-4 py-2 w-80 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const SettingsPanel = ({ showSettings, setShowSettings, tmdbApiKey, setTmdbApiKey, youtubeApiKey, setYoutubeApiKey, loadRealContent, loading, selectedPlatforms, setSelectedPlatforms, handleSelectLocalFolder, localFiles }) => {
  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-3">API Keys (Required for Real Content)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">TMDB API Key (for movies/TV shows) <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-2">Get free key →</a></label>
                <input type="password" value={tmdbApiKey} onChange={(e) => { setTmdbApiKey(e.target.value); localStorage.setItem('tmdbApiKey', e.target.value); }} placeholder="Enter your TMDB API key" className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">YouTube API Key (for YouTube content) <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-2">Get free key →</a></label>
                <input type="password" value={youtubeApiKey} onChange={(e) => { setYoutubeApiKey(e.target.value); localStorage.setItem('youtubeApiKey', e.target.value); }} placeholder="Enter your YouTube API key" className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500" />
              </div>
              {(tmdbApiKey || youtubeApiKey) && <button onClick={loadRealContent} disabled={loading} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"><Download className="w-4 h-4" /><span>{loading ? 'Loading...' : 'Load Real Content'}</span></button>}
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Platforms</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(selectedPlatforms).map(([platform, enabled]) => (
                <label key={platform} className="flex items-center space-x-3">
                  <input type="checkbox" checked={enabled} onChange={(e) => { const updated = { ...selectedPlatforms, [platform]: e.target.checked }; setSelectedPlatforms(updated); localStorage.setItem('selectedPlatforms', JSON.stringify(updated)); }} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-gray-300 capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Local Files</h3>
            <button onClick={handleSelectLocalFolder} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><FolderOpen className="w-5 h-5" /><span>Select Video Folder</span></button>
            {localFiles.length > 0 && <p className="text-gray-400 text-sm mt-2">{localFiles.length} local files loaded</p>}
          </div>
          <div className="flex justify-end space-x-4"><button onClick={() => setShowSettings(false)} className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Close</button></div>
        </div>
      </div>
    </div>
  );
};

// ... other components defined outside...

// --- Main Streaming Hub Component ---
const StreamingHub = () => {
    const [currentView, setCurrentView] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [darkMode, setDarkMode] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [localFiles, setLocalFiles] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [continueWatching, setContinueWatching] = useState([]);
    const [viewingStats, setViewingStats] = useState({ totalHours: 0, topGenres: [], recentWatches: [] });
    const [selectedPlatforms, setSelectedPlatforms] = useState({ netflix: true, youtube: true, prime: true, disney: true, hbo: true, local: true });
    const [realContent, setRealContent] = useState({ trending: [], newReleases: [], top10: [], youtube: [] });
    const [loading, setLoading] = useState(false);
    const [tmdbApiKey, setTmdbApiKey] = useState('');
    const [youtubeApiKey, setYoutubeApiKey] = useState('');
    const videoRef = useRef(null);

    // --- NEW: State to hold dedicated search results ---
    const [searchResults, setSearchResults] = useState([]);

    const platformColors = { netflix: 'from-red-600 to-red-800', youtube: 'from-red-500 to-red-700', prime: 'from-blue-500 to-blue-700', disney: 'from-blue-600 to-purple-600', hbo: 'from-purple-600 to-purple-800', local: 'from-gray-600 to-gray-800' };
    const platformUrls = { netflix: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`, youtube: (title) => `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`, prime: (title) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`, disney: (title) => `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`, hbo: (title) => `https://play.max.com/search?q=${encodeURIComponent(title)}` };

    useEffect(() => {
        // ... (existing useEffect to load from localStorage)
        const savedTmdbKey = localStorage.getItem('tmdbApiKey');
        if (savedTmdbKey) setTmdbApiKey(savedTmdbKey);
    }, []);

    const fetchTMDBContent = useCallback(async (endpoint, platform = 'netflix') => { /* ... existing code ... */ }, [tmdbApiKey]);
    const fetchYouTubeContent = useCallback(async () => { /* ... existing code ... */ }, [youtubeApiKey]);
    
    const loadRealContent = useCallback(async () => { /* ... existing code ... */ }, [tmdbApiKey, youtubeApiKey, fetchTMDBContent, fetchYouTubeContent]);

    useEffect(() => { if (tmdbApiKey || youtubeApiKey) { loadRealContent(); } }, [tmdbApiKey, youtubeApiKey, loadRealContent]);
    
    // --- NEW: Function to handle a live search query ---
    const handleSearch = async () => {
        if (!tmdbApiKey) {
            alert('Please add your TMDB API Key in Settings to search.');
            return;
        }
        if (searchQuery.trim() === '') {
            setSearchResults([]); // Clear results if search is empty
            return;
        }

        setLoading(true);
        setSearchResults([]);
        try {
            const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=1&include_adult=false`);
            const data = await response.json();
            
            const formattedResults = data.results
                .filter(item => item.media_type === 'movie' || item.media_type === 'tv') // Filter for only movies and TV
                .map(item => ({
                    id: `search-${item.id}`,
                    title: item.title || item.name,
                    platform: 'tmdb', // Use a generic platform or decide how to handle this
                    type: item.media_type,
                    rating: item.vote_average?.toFixed(1) || 'N/A',
                    year: new Date(item.release_date || item.first_air_date || '').getFullYear() || 'N/A',
                    genre: 'Search Result',
                    image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : `https://via.placeholder.com/300x450/333/white?text=${encodeURIComponent(item.title || item.name)}`,
                    overview: item.overview,
                }));

            setSearchResults(formattedResults);
        } catch (error) {
            console.error('Search API Error:', error);
        }
        setLoading(false);
    };

    const playVideo = useCallback((content) => {
        // For search results, we just open the search page on a platform
        if (content.platform === 'tmdb') {
            window.open(platformUrls.netflix(content.title), '_blank'); // Default to Netflix search
            return;
        }
        // ... (rest of the existing playVideo logic)
    }, [platformUrls]);

    // ... (rest of the functions like updateContinueWatching, handleSelectLocalFolder, etc.)

    const HomeView = ({...}) => { /* ... */ }; // Placeholder for brevity
    
    return (
        <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'} text-white transition-colors duration-300`}>
            <Navigation
                // ... (existing props)
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch} // Pass the new function
            />
            <main className="pt-20">
                <HomeView
                    // ... (existing props)
                    searchResults={searchResults} // Pass the new state
                    playVideo={playVideo}
                    platformColors={platformColors}
                />
            </main>
            <SettingsPanel
                // ... (existing props)
            />
        </div>
    );
};

// --- HomeView component updated to display search results ---
const HomeView = ({ searchResults, playVideo, platformColors, continueWatching, realContent, ...rest }) => {
    // If there are search results, show them. Otherwise, show the normal homepage.
    if (searchResults.length > 0) {
        return (
            <div className="pt-4 pb-12 px-6">
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                        <Search className="w-8 h-8 mr-3 text-blue-400" />
                        Search Results
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {searchResults.map(content => (
                            <ContentTile key={content.id} content={content} playVideo={playVideo} platformColors={platformColors} />
                        ))}
                    </div>
                </section>
            </div>
        );
    }
    
    // --- Default Homepage View (your existing code) ---
    return (
        <div className="pt-4 pb-12">
            {continueWatching.length > 0 && (
                <section className="mb-12 px-6">
                    <h2 className="text-3xl font-bold text-white mb-6">Continue Watching</h2>
                    {/* ... content mapping ... */}
                </section>
            )}
            {realContent.trending.length > 0 && (
                <section className="mb-12 px-6">
                    <h2 className="text-3xl font-bold text-white mb-6">Trending Now</h2>
                    {/* ... content mapping ... */}
                </section>
            )}
            {/* ... other sections ... */}
        </div>
    );
};


export default StreamingHub;