import React, { useState } from 'react';

interface NewResultsDisplayProps {
  results: {
    freeSlots: Array<{ day: string; time: string; startTime: string; endTime: string }>;
    busySlots: Array<{ day: string; time: string; friends: string[] }>;
    weeklyGrid: Record<string, Record<string, { isBusy: boolean; friendNames: string[] }>>;
    friendSchedules: Array<{ name: string; busySlots: Array<{ day: string; time: string; startTime: string; endTime: string }> }>;
    availableLabs?: Record<string, Record<string, string[]>>;
  };
}

const NewResultsDisplay: React.FC<NewResultsDisplayProps> = ({ results }) => {
  const [expandedFriend, setExpandedFriend] = useState<string | null>(null);

  const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '8:00 AM - 9:20 AM',
    '9:30 AM - 10:50 AM',
    '11:00 AM - 12:20 PM',
    '12:30 PM - 1:50 PM',
    '2:00 PM - 3:20 PM',
    '3:30 PM - 4:50 PM',
    '5:00 PM - 6:20 PM',
  ];

  const totalSlots = daysOrder.length * timeSlots.length;
  const freeCount = results.freeSlots.length;
  const busyCount = totalSlots - freeCount;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-xl">
          <div className="text-4xl font-bold mb-2">{freeCount}</div>
          <div className="text-green-100 font-semibold">✅ Free Time Slots</div>
          <div className="text-sm text-green-100 mt-2">When everyone can meet!</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-xl">
          <div className="text-4xl font-bold mb-2">{busyCount}</div>
          <div className="text-red-100 font-semibold">❌ Busy Time Slots</div>
          <div className="text-sm text-red-100 mt-2">Someone has class</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl">
          <div className="text-4xl font-bold mb-2">{results.friendSchedules.length}</div>
          <div className="text-blue-100 font-semibold">👥 Friends</div>
          <div className="text-sm text-blue-100 mt-2">Total schedules analyzed</div>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">📅</span>
          Complete Weekly Schedule
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">
                  Time / Day
                </th>
                {daysOrder.map(day => (
                  <th key={day} className="border-2 border-gray-300 dark:border-gray-600 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white px-4 py-3 text-center font-bold">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time}>
                  <td className="border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {time}
                  </td>
                  {daysOrder.map(day => {
                    const slot = results.weeklyGrid[day]?.[time];
                    const isFree = slot && !slot.isBusy;
                    const busyFriends = slot?.friendNames || [];
                    const labs = results.availableLabs?.[day]?.[time] || [];

                    return (
                      <td
                        key={day}
                        className={`border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold transition-all cursor-pointer group relative ${
                          isFree
                            ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/40 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-800 dark:text-red-300'
                        }`}
                        title={
                          isFree
                            ? labs.length > 0
                              ? `✅ FREE - Available labs: ${labs.join(', ')}`
                              : '✅ FREE - Everyone can meet!'
                            : `❌ BUSY - ${busyFriends.join(', ')}`
                        }
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-2xl">{isFree ? '✅' : '❌'}</span>
                          <span className="text-xs mt-1">{isFree ? 'Free' : busyFriends.length === 1 ? '1 busy' : `${busyFriends.length} busy`}</span>
                        </div>

                        {/* Hover tooltip */}
                        <div className="absolute z-10 invisible group-hover:visible bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg px-3 py-2 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap shadow-xl">
                          {isFree ? (
                            <div>
                              <div className="font-bold text-green-400 dark:text-green-300">✅ FREE TIME!</div>
                              {labs.length > 0 && (
                                <div className="text-xs mt-1">
                                  Labs: {labs.slice(0, 3).join(', ')}
                                  {labs.length > 3 && ` +${labs.length - 3} more`}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="font-bold text-red-400 dark:text-red-300">❌ Busy</div>
                              <div className="text-xs mt-1">{busyFriends.join(', ')}</div>
                            </div>
                          )}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-600 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Free - Everyone Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Busy - Someone has class</span>
          </div>
        </div>
      </div>

      {/* Friend Schedules Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">👥</span>
          Individual Schedules
        </h2>

        <div className="space-y-4">
          {results.friendSchedules.map(friend => {
            const isExpanded = expandedFriend === friend.name;
            const slotsByDay = friend.busySlots.reduce((acc, slot) => {
              if (!acc[slot.day]) acc[slot.day] = [];
              acc[slot.day].push(slot.time);
              return acc;
            }, {} as Record<string, string[]>);

            return (
              <div key={friend.name} className="border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFriend(isExpanded ? null : friend.name)}
                  className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 px-6 py-4 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">👤</span>
                    <span className="text-xl font-bold text-gray-800 dark:text-white">{friend.name}</span>
                    <span className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {friend.busySlots.length} busy slots
                    </span>
                  </div>
                  <span className="text-2xl transform transition-transform dark:text-gray-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-6 py-4 bg-white dark:bg-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {daysOrder.map(day => {
                        const slots = slotsByDay[day] || [];
                        if (slots.length === 0) return null;

                        return (
                          <div key={day} className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4">
                            <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">{day}</h4>
                            <div className="space-y-1">
                              {slots.map((slot, i) => (
                                <div key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                  <span className="text-red-500 dark:text-red-400 mr-2">●</span>
                                  {slot}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Free Time Slots List */}
      {results.freeSlots.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl shadow-2xl p-8 transition-colors duration-300">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="mr-3">🎯</span>
            Best Times to Meet ({results.freeSlots.length} slots)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daysOrder.map(day => {
              const dayFreeSlots = results.freeSlots.filter(slot => slot.day === day);
              if (dayFreeSlots.length === 0) return null;

              return (
                <div key={day} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-green-200 dark:border-green-700">
                  <h3 className="font-bold text-xl text-green-600 dark:text-green-400 mb-4">{day}</h3>
                  <div className="space-y-3">
                    {dayFreeSlots.map((slot, i) => {
                      const labs = results.availableLabs?.[slot.day]?.[slot.time] || [];
                      
                      return (
                        <div key={i} className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border-l-4 border-green-500 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-800/40 transition-colors">
                          <div className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">
                            ⏰ {slot.time}
                          </div>
                          
                          {labs.length > 0 ? (
                            <div className="mt-2">
                              <div className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                                📍 Available Labs ({labs.length}):
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {labs.map((lab, labIndex) => (
                                  <span 
                                    key={labIndex}
                                    className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full border border-blue-300 dark:border-blue-700"
                                  >
                                    {lab}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                              ⚠️ No labs available at this time
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewResultsDisplay;
