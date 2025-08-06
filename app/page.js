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
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    netflix: true,
    youtube: true,
    prime: true,
    disney: true,
    hbo: true
  });
  const [realContent, setRealContent] = useState({
    trending: [],
    newReleases: [],
    top10: [],
    youtube: []
  });
  const [loading, setLoading] = useState(false);
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [youtubeApiKey, setYoutubeApiKey] = useState('');

  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Platform colors and URLs
  const platformColors = {
    netflix: 'from-red-600 to-red-800',
    youtube: 'from-red-500 to-red-700',
    prime: 'from-blue-500 to-blue-700',
    disney: 'from-blue-600 to-purple-600',
    hbo: 'from-purple-600 to-purple-800',
    local: 'from-gray-600 to-gray-800'
  };

  const platformUrls = {
    netflix: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
    youtube: (title) => `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
    prime: (title) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`,
    disney: (title) => `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`,
    hbo: (title) => `https://play.max.com/search?q=${encodeURIComponent(title)}`
  };

  // Load saved data on mount
  useEffect(() => {
    const savedContinueWatching = localStorage.getItem('continueWatching');
    const savedStats = localStorage.getItem('viewingStats');
    const savedPlatforms = localStorage.getItem('selectedPlatforms');
    const savedTmdbKey = localStorage.getItem('tmdbApiKey');
    const savedYoutubeKey = localStorage.getItem('youtubeApiKey');
    
    if (savedContinueWatching) setContinueWatching(JSON.parse(savedContinueWatching));
    if (savedStats) setViewingStats(JSON.parse(savedStats));
    if (savedPlatforms) setSelectedPlatforms(JSON.parse(savedPlatforms));
    if (savedTmdbKey) setTmdbApiKey(savedTmdbKey);
    if (savedYoutubeKey) setYoutubeApiKey(savedYoutubeKey);
  }, []);

  // Fetch real content from APIs
  const fetchTMDBContent = async (endpoint, platform = 'netflix') => {
    if (!tmdbApiKey) return [];
    
    try {
      const response = await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${tmdbApiKey}&language=en-US&page=1`);
      const data = await response.json();
      
      return data.results?.slice(0, 10).map(item => ({
        id: `${platform}-${item.id}`,
        title: item.title || item.name,
        platform: platform,
        type: item.media_type || (item.title ? 'movie' : 'series'),
        rating: item.vote_average?.toFixed(1) || 'N/A',
        year: new Date(item.release_date || item.first_air_date || '2024').getFullYear(),
        genre: 'Drama', // TMDB genres would require additional API call
        image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : `https://via.placeholder.com/300x450/333/white?text=${encodeURIComponent(item.title || item.name)}`,
        overview: item.overview,
        tmdbId: item.id
      })) || [];
    } catch (error) {
      console.error('TMDB API Error:', error);
      return [];
    }
  };

  const fetchYouTubeContent = async () => {
    if (!youtubeApiKey) return [];
    
    try {
      const queries = ['movie trailers 2024', 'netflix series 2024', 'popular movies', 'tv shows 2024'];
      const allVideos = [];
      
      for (const query of queries) {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&key=${youtubeApiKey}`);
        const data = await response.json();
        
        if (data.items) {
          const videos = data.items.map(item => ({
            id: `youtube-${item.id.videoId}`,
            title: item.snippet.title,
            platform: 'youtube',
            type: 'video',
            rating: '4.5',
            year: new Date(item.snippet.publishedAt).getFullYear(),
            genre: 'Entertainment',
            image: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
            overview: item.snippet.description,
            videoId: item.id.videoId,
            channelTitle: item.snippet.channelTitle
          }));
          allVideos.push(...videos);
        }
      }
      
      return allVideos.slice(0, 10);
    } catch (error) {
      console.error('YouTube API Error:', error);
      return [];
    }
  };

  const loadRealContent = useCallback(async () => {
    if (!tmdbApiKey && !youtubeApiKey) return;
    
    setLoading(true);
    try {
      // Fetch from different endpoints to simulate different platforms
      const [trending, popular, topRated, youtube] = await Promise.all([
        fetchTMDBContent('trending/all/week', 'netflix'),
        fetchTMDBContent('movie/popular', 'prime'),
        fetchTMDBContent('tv/top_rated', 'disney'),
        fetchYouTubeContent()
      ]);

      setRealContent({
        trending: [...trending, ...youtube.slice(0, 5)],
        newReleases: popular,
        top10: topRated,
        youtube: youtube
      });
    } catch (error) {
      console.error('Error loading content:', error);
    }
    setLoading(false);
  }, [tmdbApiKey, youtubeApiKey]); // Dependencies for useCallback

  // === THIS IS THE ONLY CHANGE ===
  // Automatically load content when API keys are detected from storage
  useEffect(() => {
    if (tmdbApiKey || youtubeApiKey) {
      loadRealContent();
    }
  }, [tmdbApiKey, youtubeApiKey, loadRealContent]);
  // === END OF CHANGE ===

  // File System Access API for local files
  const handleSelectLocalFolder = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await window.showDirectoryPicker();
        const files = [];
        
        for await (const [name, handle] of dirHandle.entries()) {
          if (handle.kind === 'file' && (name.endsWith('.mp4') || name.endsWith('.mkv') || name.endsWith('.avi') || name.endsWith('.mov'))) {
            const file = await handle.getFile();
            files.push({
              id: `local-${Date.now()}-${Math.random()}`,
              title: name.replace(/\.[^/.]+$/, ""),
              platform: 'local',
              type: 'video',
              file: file,
              url: URL.createObjectURL(file),
              duration: 0,
              size: file.size,
              lastModified: file.lastModified
            });
          }
        }
        
        setLocalFiles(files);
        localStorage.setItem('localFiles', JSON.stringify(files.map(f => ({ ...f, file: null, url: null }))));
      } else {
        alert('File System Access API is not supported in this browser. Please use Chrome or Edge.');
      }
    } catch (err) {
      console.error('Error accessing files:', err);
    }
  };

  // Video player functions
  const playVideo = (content) => {
    if (content.platform === 'local') {
      setCurrentVideo(content);
      setCurrentView('player');
    } else if (content.platform === 'youtube' && content.videoId) {
      window.open(`https://www.youtube.com/watch?v=${content.videoId}`, '_blank');
      updateContinueWatching(content);
    } else {
      // For streaming platforms, open search results
      window.open(platformUrls[content.platform](content.title), '_blank');
      updateContinueWatching(content);
    }
  };

  const updateContinueWatching = (content, currentTime = 0) => {
    const updated = continueWatching.filter(item => item.id !== content.id);
    updated.unshift({ ...content, lastWatched: Date.now(), currentTime });
    const trimmed = updated.slice(0, 10);
    setContinueWatching(trimmed);
    localStorage.setItem('continueWatching', JSON.stringify(trimmed));
    
    // Update viewing stats
    const newStats = { ...viewingStats };
    newStats.totalHours += currentTime / 3600; // Convert seconds to hours
    newStats.recentWatches.unshift({
      title: content.title,
      platform: content.platform,
      watchedAt: Date.now()
    });
    newStats.recentWatches = newStats.recentWatches.slice(0, 20);
    setViewingStats(newStats);
    localStorage.setItem('viewingStats', JSON.stringify(newStats));
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Save progress for local files every 10 seconds
      if (currentVideo && Math.floor(videoRef.current.currentTime) % 10 === 0) {
        updateContinueWatching(currentVideo, videoRef.current.currentTime);
      }
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get all content combined
  const getAllContent = () => {
    const allContent = [
      ...realContent.trending,
      ...realContent.newReleases,
      ...realContent.top10,
      ...localFiles
    ];
    
    return allContent.filter(item => {
      const platformMatch = selectedPlatforms[item.platform];
      const searchMatch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.channelTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      return platformMatch && searchMatch;
    });
  };

  // Content tile component
  const ContentTile = ({ content, size = 'normal' }) => {
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
        <div className={`relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br ${platformColors[content.platform]} shadow-2xl`}>
          <img 
            src={content.image || content.url} 
            alt={content.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/300x450/333/white?text=${encodeURIComponent(content.title)}`;
            }}
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
  };

  // Navigation component
  const Navigation = () => (
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
                placeholder="Search across all platforms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  // Settings panel
  const SettingsPanel = () => showSettings && (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
        
        <div className="space-y-6">
          {/* API Keys Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">API Keys (Required for Real Content)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  TMDB API Key (for movies/TV shows)
                  <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-2">
                    Get free key →
                  </a>
                </label>
                <input
                  type="password"
                  value={tmdbApiKey}
                  onChange={(e) => {
                    setTmdbApiKey(e.target.value);
                    localStorage.setItem('tmdbApiKey', e.target.value);
                  }}
                  placeholder="Enter your TMDB API key"
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  YouTube API Key (for YouTube content)
                  <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-2">
                    Get free key →
                  </a>
                </label>
                <input
                  type="password"
                  value={youtubeApiKey}
                  onChange={(e) => {
                    setYoutubeApiKey(e.target.value);
                    localStorage.setItem('youtubeApiKey', e.target.value);
                  }}
                  placeholder="Enter your YouTube API key"
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500"
                />
              </div>
              {(tmdbApiKey || youtubeApiKey) && (
                <button
                  onClick={loadRealContent}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{loading ? 'Loading...' : 'Load Real Content'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Platforms Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Platforms</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(selectedPlatforms).map(([platform, enabled]) => (
                <label key={platform} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => {
                      const updated = { ...selectedPlatforms, [platform]: e.target.checked };
                      setSelectedPlatforms(updated);
                      localStorage.setItem('selectedPlatforms', JSON.stringify(updated));
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-gray-300 capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Local Files Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Local Files</h3>
            <button
              onClick={handleSelectLocalFolder}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FolderOpen className="w-5 h-5" />
              <span>Select Video Folder</span>
            </button>
            {localFiles.length > 0 && (
              <p className="text-gray-400 text-sm mt-2">{localFiles.length} local files loaded</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowSettings(false)}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Video player component
  const VideoPlayer = () => currentVideo && (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={currentVideo.url}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        autoPlay
      />
      
      {showControls && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black to-transparent p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <div 
                className="w-full h-2 bg-gray-600 rounded-full cursor-pointer"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button onClick={togglePlayPause} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full">
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" fill="currentColor" />}
                </button>
                <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.volume = volume === 0 ? 1 : 0;
                      setVolume(volume === 0 ? 1 : 0);
                    }
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
                >
                  {volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <button 
                  onClick={() => {
                    if (videoRef.current.requestFullscreen) {
                      videoRef.current.requestFullscreen();
                    }
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
                >
                  <Maximize className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => {
                    setCurrentVideo(null);
                    setCurrentView('home');
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Stats view
  const StatsView = () => (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8">Viewing Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-8 h-8 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Watch Time</h3>
          </div>
          <p className="text-3xl font-bold text-blue-400">{Math.round(viewingStats.totalHours)} hrs</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <h3 className="text-xl font-semibold text-white">Continue Watching</h3>
          </div>
          <p className="text-3xl font-bold text-green-400">{continueWatching.length}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Grid className="w-8 h-8 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Local Files</h3>
          </div>
          <p className="text-3xl font-bold text-purple-400">{localFiles.length}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Star className="w-8 h-8 text-yellow-400" />
            <h3 className="text-xl font-semibold text-white">Total Content</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{getAllContent().length}</p>
        </div>
      </div>

      {/* Recent watches */}
      {viewingStats.recentWatches.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Watches</h3>
          <div className="space-y-3">
            {viewingStats.recentWatches.slice(0, 10).map((watch, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                <div>
                  <p className="text-white font-medium">{watch.title}</p>
                  <p className="text-gray-400 text-sm capitalize">{watch.platform}</p>
                </div>
                <p className="text-gray-500 text-sm">
                  {new Date(watch.watchedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Main home view
  const HomeView = () => {
    const allContent = getAllContent();
    const hasContent = allContent.length > 0;

    return (
      <div className="pt-24 pb-12">
        {/* API Setup Notice */}
        {!tmdbApiKey && !youtubeApiKey && (
          <div className="mx-6 mb-8 bg-blue-900 bg-opacity-50 border border-blue-700 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Settings className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Setup Required</h3>
            </div>
            <p className="text-gray-300 mb-4">
              To load real content from streaming platforms, add your free API keys in Settings.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.themoviedb.org/settings/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Get TMDB Key (Free)
              </a>
              <a 
                href="https://console.developers.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Get YouTube Key (Free)
              </a>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Open Settings
              </button>
            </div>
          </div>
        )}

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section className="mb-12 px-6">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <Clock className="w-8 h-8 mr-3 text-blue-400" />
              Continue Watching
            </h2>
            <div className="flex space-x-6 overflow-x-auto pb-4">
              {continueWatching.map(content => (
                <ContentTile key={`continue-${content.id}`} content={content} size="large" />
              ))}
            </div>
          </section>
        )}

        {/* Trending Now */}
        {realContent.trending.length > 0 && (
          <section className="mb-12 px-6">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-red-400" />
              Trending Now
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {realContent.trending.filter(content => {
                const platformMatch = selectedPlatforms[content.platform];
                const searchMatch = searchQuery === '' || 
                  content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  content.genre?.toLowerCase().includes(searchQuery.toLowerCase());
                return platformMatch && searchMatch;
              }).map(content => (
                <ContentTile key={content.id} content={content} />
              ))}
            </div>
          </section>
        )}

        {/* New Releases */}
        {realContent.newReleases.length > 0 && (
          <section className="mb-12 px-6">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <Calendar className="w-8 h-8 mr-3 text-green-400" />
              Popular Movies
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {realContent.newReleases.filter(content => {
                const platformMatch = selectedPlatforms[content.platform];
                const searchMatch = searchQuery === '' || 
                  content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  content.genre?.toLowerCase().includes(searchQuery.toLowerCase());
                return platformMatch && searchMatch;
              }).map(content => (
                <ContentTile key={content.id} content={content} />
              ))}
            </div>
          </section>
        )}

        {/* Top Rated TV Shows */}
        {realContent.top10.length > 0 && (
          <section className="mb-12 px-6">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <Star className="w-8 h-8 mr-3 text-yellow-400" />
              Top Rated TV Shows
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {realContent.top10.filter(content => {
                const platformMatch = selectedPlatforms[content.platform];
                const searchMatch = searchQuery === '' || 
                  content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  content.genre?.toLowerCase().includes(searchQuery.toLowerCase());
                return platformMatch && searchMatch;
              }).map(content => (
                <ContentTile key={content.id} content={content} />
              ))}
            </div>
          </section>
        )}

        {/* YouTube Content */}
        {realContent.youtube.length > 0 && selectedPlatforms.youtube && (
          <section className="mb-12 px-6">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <Play className="w-8 h-8 mr-3 text-red-500" />
              YouTube Highlights
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {realContent.youtube.filter(content => {
                const searchMatch = searchQuery === '' || 
                  content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  content.channelTitle?.toLowerCase().includes(searchQuery.toLowerCase());
                return searchMatch;
              }).map(content => (
                <ContentTile key={content.id} content={content} />
              ))}
            </div>
          </section>
        )}

        {/* Local Files */}
        {localFiles.length > 0 && selectedPlatforms.local && (
          <section className="mb-12 px-6">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <FolderOpen className="w-8 h-8 mr-3 text-purple-400" />
              Local Files ({localFiles.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {localFiles.filter(content => {
                const searchMatch = searchQuery === '' || 
                  content.title.toLowerCase().includes(searchQuery.toLowerCase());
                return searchMatch;
              }).map(content => (
                <ContentTile key={content.id} content={content} />
              ))}
            </div>
          </section>
        )}

        {/* Search Results */}
        {searchQuery && (
          <section className="mb-12 px-6">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <Search className="w-8 h-8 mr-3 text-blue-400" />
              Search Results for "{searchQuery}" ({allContent.length})
            </h2>
            {allContent.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {allContent.map(content => (
                  <ContentTile key={content.id} content={content} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No results found for "{searchQuery}"</p>
                <p className="text-gray-500 text-sm mt-2">Try a different search term or load content from APIs</p>
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {!hasContent && !searchQuery && (
          <div className="text-center py-20 px-6">
            <div className="max-w-md mx-auto">
              <TrendingUp className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Welcome to Kinsfolk Streaming Hub!</h3>
              <p className="text-gray-400 mb-8">
                Your unified streaming experience starts here. Add your API keys to load real content from streaming platforms, or add local video files to get started.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Setup API Keys
                </button>
                <button
                  onClick={handleSelectLocalFolder}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Local Videos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'} transition-colors duration-300`}>
      <Navigation />
      
      {currentView === 'home' && <HomeView />}
      {currentView === 'stats' && <StatsView />}
      {currentView === 'player' && <VideoPlayer />}
      
      <SettingsPanel />
    </div>
  );
};

export default StreamingHub;