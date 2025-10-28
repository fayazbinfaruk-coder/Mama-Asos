import { useState } from 'react';
import Head from 'next/head';
import FriendSelector from '@/components/FriendSelector';
import NewResultsDisplay from '@/components/NewResultsDisplay';
import ThemeToggle from '@/components/ThemeToggle';
import { scheduleAnalyzer } from '@/utils/newScheduleAnalyzer';

interface Friend {
  id?: string;
  name: string;
  courses: Array<{ course: string; section: string }>;
}

export default function Home() {
  const [step, setStep] = useState<'select' | 'results'>('select');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFriendsComplete = async (friends: Friend[]) => {
    console.log('🚀 Starting analysis with friends:', friends);
    
    setProcessing(true);
    setError('');
    setResults(null);

    try {
      const analysisResults = await scheduleAnalyzer.analyzeFriendSchedules(friends);
      
      console.log('✅ Analysis complete!');
      console.log('📊 Free slots:', analysisResults.freeSlots.length);

      const labResponse = await fetch('/api/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freeSlots: analysisResults.freeSlots }),
      });

      const labData = await labResponse.json();
      console.log('🏫 Lab data loaded');

      setResults({
        ...analysisResults,
        availableLabs: labData.availableLabs,
      });
      
      setStep('results');
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze schedules');
    } finally {
      setProcessing(false);
    }
  };

  const handleStartOver = () => {
    setStep('select');
    setResults(null);
    setError('');
  };

  return (
    <>
      <Head>
        <title>Mama Asos??</title>
        <meta name="description" content="Find the best times to hangout with friends!" />
      </Head>
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 transition-colors duration-300">
        <ThemeToggle />
        
        {/* Developer Info - Left Side */}
        <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-xs border-2 border-gray-200 dark:border-gray-700">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-3xl font-bold">
              FB
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Fayaz Bin Faruk</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Brac University</p>
          </div>
          
          <div className="space-y-3">
            <a
              href="https://github.com/fayaz-ovi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-3 transition-colors group"
            >
              <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">GitHub</span>
            </a>
            
            <a
              href="https://www.linkedin.com/in/fayaz-bin-faruk-9645b2216/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-lg p-3 transition-colors group"
            >
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-blue-200">LinkedIn</span>
            </a>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              Mama Asos??
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Select your friends' courses and find the perfect time to meet!
            </p>
          </div>

          {processing && (
            <div className="mb-8 bg-blue-500 dark:bg-blue-600 text-white rounded-2xl p-6 shadow-2xl animate-pulse">
              <div className="flex items-center justify-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                <span className="text-xl font-bold">Analyzing schedules...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-400 text-red-800 dark:text-red-300 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-lg">Error</h3>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {step === 'select' && !processing && (
            <>
              <FriendSelector onComplete={handleFriendsComplete} />
              
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  📚 How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl">
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="font-bold text-lg mb-2 dark:text-white">1. Select Friends</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Choose how many friends</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl">
                    <div className="text-4xl mb-3">📖</div>
                    <h3 className="font-bold text-lg mb-2 dark:text-white">2. Add Courses</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Enter courses and sections</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-xl">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="font-bold text-lg mb-2 dark:text-white">3. Find Times</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">See when everyone is free!</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'results' && results && !processing && (
            <>
              <div className="mb-6 flex justify-end">
                <button
                  onClick={handleStartOver}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>Start Over</span>
                </button>
              </div>
              <NewResultsDisplay results={results} />
            </>
          )}
        </div>
      </main>
    </>
  );
}
