import React, { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';

interface Friend {
  id: string;
  name: string;
  courses: Array<{ course: string; section: string }>;
}

interface FriendSelectorProps {
  onComplete: (friends: Friend[]) => void;
}

interface CourseData {
  course_name: string;
  section: string;
  schedule: Array<{
    day: string;
    start_time: string;
    end_time: string;
    room: string;
  }>;
}

const FriendSelector: React.FC<FriendSelectorProps> = ({ onComplete }) => {
  const [numFriends, setNumFriends] = useState<number>(2);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [step, setStep] = useState<'select-number' | 'add-friends'>('select-number');
  const [allCourses, setAllCourses] = useState<CourseData[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load courses data when component mounts
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const response = await fetch('/classes.json');
        const data: CourseData[] = await response.json();
        setAllCourses(data);
        
        // Get unique course names
        const uniqueCourses = Array.from(new Set(data.map(c => c.course_name))).sort();
        setAvailableCourses(uniqueCourses);
        
        console.log(`✅ Loaded ${data.length} course sections`);
        console.log(`📚 Found ${uniqueCourses.length} unique courses`);
      } catch (error) {
        console.error('❌ Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourses();
  }, []);

  const handleNumFriendsSubmit = () => {
    const initialFriends: Friend[] = Array.from({ length: numFriends }, (_, i) => ({
      id: `friend-${i + 1}`,
      name: `Friend ${i + 1}`,
      courses: [],
    }));
    setFriends(initialFriends);
    setStep('add-friends');
  };

  const handleFriendNameChange = (id: string, name: string) => {
    setFriends(friends.map(f => f.id === id ? { ...f, name } : f));
  };

  const handleAddCourse = (friendId: string) => {
    setFriends(friends.map(f => 
      f.id === friendId 
        ? { ...f, courses: [...f.courses, { course: '', section: '' }] }
        : f
    ));
  };

  const handleCourseChange = (friendId: string, courseIndex: number, field: 'course' | 'section', value: string) => {
    setFriends(friends.map(f => {
      if (f.id === friendId) {
        const newCourses = [...f.courses];
        newCourses[courseIndex] = { ...newCourses[courseIndex], [field]: value };
        
        // If course changed, reset section
        if (field === 'course') {
          newCourses[courseIndex].section = '';
        }
        
        return { ...f, courses: newCourses };
      }
      return f;
    }));
  };

  // Get available sections for a specific course
  const getAvailableSections = (courseName: string): string[] => {
    const sections = allCourses
      .filter(c => c.course_name === courseName)
      .map(c => c.section)
      .sort((a, b) => {
        // Sort numerically if possible
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.localeCompare(b);
      });
    return sections;
  };

  const handleRemoveCourse = (friendId: string, courseIndex: number) => {
    setFriends(friends.map(f => {
      if (f.id === friendId) {
        return { ...f, courses: f.courses.filter((_, i) => i !== courseIndex) };
      }
      return f;
    }));
  };

  const handleSubmit = () => {
    // Filter out friends with no courses and courses with no data
    const validFriends = friends
      .map(f => ({
        ...f,
        courses: f.courses.filter(c => c.course && c.section)
      }))
      .filter(f => f.courses.length > 0);

    if (validFriends.length === 0) {
      alert('Please add at least one course for at least one friend!');
      return;
    }

    onComplete(validFriends);
  };

  if (step === 'select-number') {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 transition-colors duration-300">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center">
            👥 How many friends do you want to meet?
          </h2>
          
          {loading && (
            <div className="mb-4 sm:mb-6 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 dark:border-blue-400 border-t-transparent"></div>
                <span className="text-sm sm:text-base text-blue-700 dark:text-blue-300 font-semibold">Loading course database...</span>
              </div>
            </div>
          )}
          
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setNumFriends(Math.max(2, numFriends - 1))}
                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-bold transition-colors"
              >
                −
              </button>
              
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white rounded-xl px-6 py-3 sm:px-8 sm:py-4 text-3xl sm:text-4xl font-bold min-w-[100px] sm:min-w-[120px] text-center">
                {numFriends}
              </div>
              
              <button
                onClick={() => setNumFriends(Math.min(10, numFriends + 1))}
                className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-bold transition-colors"
              >
                +
              </button>
            </div>

            <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Select between 2 and 10 friends
            </p>

            <button
              onClick={handleNumFriendsSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Loading courses...' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            📚 Add Course Schedules
          </h2>
          {availableCourses.length > 0 && (
            <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-600 text-green-800 dark:text-green-300 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold">
              ✅ {availableCourses.length} courses loaded
            </div>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {friends.map((friend, friendIndex) => (
            <div key={friend.id} className="border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                <input
                  type="text"
                  value={friend.name}
                  onChange={(e) => handleFriendNameChange(friend.id, e.target.value)}
                  className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none px-2 py-1 w-full sm:w-auto"
                  placeholder={`Friend ${friendIndex + 1} Name`}
                />
                <span className="bg-blue-500 dark:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-sm">
                  {friend.courses.length} {friend.courses.length === 1 ? 'course' : 'courses'}
                </span>
              </div>

              <div className="space-y-3">
                {friend.courses.map((course, courseIndex) => {
                  const availableSections = course.course ? getAvailableSections(course.course) : [];
                  
                  return (
                    <div key={courseIndex} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg shadow">
                      <span className="hidden sm:block sm:col-span-1 text-gray-600 dark:text-gray-400 font-semibold pt-2">{courseIndex + 1}.</span>
                      
                      {/* Course Searchable Select */}
                      <div className="sm:col-span-5">
                        <label className="block sm:hidden text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Course {courseIndex + 1}
                        </label>
                        <SearchableSelect
                          value={course.course}
                          onChange={(value) => handleCourseChange(friend.id, courseIndex, 'course', value)}
                          options={availableCourses}
                          placeholder="Search course (e.g., CSE421)"
                          type="course"
                        />
                        {course.course && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {getAvailableSections(course.course).length} sections available
                          </p>
                        )}
                      </div>
                      
                      {/* Section Searchable Select */}
                      <div className="sm:col-span-4">
                        <label className="block sm:hidden text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Section
                        </label>
                        <SearchableSelect
                          value={course.section}
                          onChange={(value) => handleCourseChange(friend.id, courseIndex, 'section', value)}
                          options={availableSections}
                          placeholder={course.course ? "Select section" : "Choose course first"}
                          type="section"
                        />
                        {course.course && !course.section && availableSections.length > 0 && (
                          <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                            ⚠️ Please select a section
                          </p>
                        )}
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveCourse(friend.id, courseIndex)}
                        className="sm:col-span-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors h-[42px] w-full sm:w-auto"
                        title="Remove this course"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => handleAddCourse(friend.id)}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>+</span>
                <span>Add Course for {friend.name}</span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => {
              setStep('select-number');
              setFriends([]);
            }}
            className="flex-1 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors text-sm sm:text-base"
          >
            ← Back
          </button>
          
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 dark:from-green-600 dark:to-blue-600 dark:hover:from-green-700 dark:hover:to-blue-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Find Free Times! 🎯
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendSelector;
