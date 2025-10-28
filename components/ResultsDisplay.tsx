import React from 'react';

interface ResultsDisplayProps {
  results: {
    freeSlots: Array<{
      day: string;
      time: string;
    }>;
    busySlots: Array<{
      day: string;
      time: string;
    }>;
    weeklyGrid: Record<string, Record<string, { isBusy: boolean; scheduleNames: string[] }>>;
    availableLabs: Record<string, Record<string, string[]>>;
    extractedSchedules: any[];
  };
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '8:00 AM - 9:20 AM',
    '9:30 AM - 10:50 AM',
    '11:00 AM - 12:20 PM',
    '11:00 AM - 1:50 PM',
    '12:30 PM - 1:50 PM',
    '2:00 PM - 4:50 PM',
    '3:30 PM - 4:50 PM',
  ];
  
  const groupedByDay = results.freeSlots.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot.time);
    return acc;
  }, {} as Record<string, string[]>);

  const sortedDays = Object.keys(groupedByDay).sort((a, b) => 
    daysOrder.indexOf(a) - daysOrder.indexOf(b)
  );

  // Group busy slots by schedule and day
  const schedulesBusySlots = results.extractedSchedules.map(schedule => {
    const busyByDay = schedule.busySlots.reduce((acc: any, slot: any) => {
      if (!acc[slot.day]) {
        acc[slot.day] = [];
      }
      acc[slot.day].push(slot.time);
      return acc;
    }, {} as Record<string, string[]>);
    return { fileName: schedule.fileName, busyByDay, totalBusy: schedule.busySlots.length };
  });

  return (
    <div className="space-y-6">
      {/* Complete Weekly Schedule Grid */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📅</span>
          Complete Weekly Schedule
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          All time slots for the entire week. Green = Free, Red = Busy (someone has class)
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">
                  Time / Day
                </th>
                {daysOrder.map(day => (
                  <th key={day} className="border border-gray-300 px-2 py-2 font-semibold">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time, timeIdx) => (
                <tr key={timeIdx}>
                  <td className="border border-gray-300 px-2 py-2 font-medium bg-gray-50 text-xs">
                    {time}
                  </td>
                  {daysOrder.map(day => {
                    const slot = results.weeklyGrid?.[day]?.[time];
                    const isBusy = slot?.isBusy || false;
                    const scheduleNames = slot?.scheduleNames || [];
                    const availableLabs = results.availableLabs?.[day]?.[time] || [];
                    
                    return (
                      <td
                        key={day}
                        className={`border border-gray-300 px-2 py-2 text-center ${
                          isBusy 
                            ? 'bg-red-100 hover:bg-red-200' 
                            : 'bg-green-100 hover:bg-green-200'
                        } cursor-pointer transition-colors`}
                        title={
                          isBusy 
                            ? `Busy: ${scheduleNames.join(', ')}` 
                            : availableLabs.length > 0
                            ? `Free - Labs: ${availableLabs.join(', ')}`
                            : 'Free - No labs available'
                        }
                      >
                        {isBusy ? (
                          <div className="space-y-1">
                            <div className="text-red-700 font-semibold text-xs">🔒 BUSY</div>
                            {scheduleNames.length > 0 && (
                              <div className="text-xs text-red-600">
                                {scheduleNames.length} schedule{scheduleNames.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-green-700 font-semibold text-xs">✓ FREE</div>
                            {availableLabs.length > 0 && (
                              <div className="text-xs text-green-600">
                                {availableLabs.length} lab{availableLabs.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-700">
              {timeSlots.length * daysOrder.length}
            </div>
            <div className="text-sm text-gray-600">Total Time Slots</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-700">
              {results.busySlots?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Busy Slots (Someone has class)</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700">
              {results.freeSlots?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Free Slots (Available for hangout)</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <strong>💡 How to read:</strong> Hover over any cell to see details. 
          Green cells are free for everyone. Red cells mean at least one person has a class.
        </div>
      </div>

      {/* Detected Busy Slots Section */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📅</span>
          Detected Schedules ({results.extractedSchedules.length})
        </h2>
        
        {schedulesBusySlots.map((schedule, idx) => (
          <div key={idx} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3">
              <h3 className="font-semibold text-lg">
                {schedule.fileName}
              </h3>
              <p className="text-sm opacity-90">
                Total busy slots: {schedule.totalBusy}
              </p>
            </div>
            
            {schedule.totalBusy === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-lg">⚠️ No classes detected in this schedule</p>
                <p className="text-sm mt-2">
                  This might indicate an OCR issue. Check the extracted text below.
                </p>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {daysOrder.map(day => {
                    const slots = schedule.busyByDay[day] || [];
                    if (slots.length === 0) return null;
                    
                    return (
                      <div key={day} className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                          {day}
                        </h4>
                        <div className="space-y-1">
                          {slots.map((time, timeIdx) => (
                            <div
                              key={timeIdx}
                              className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                            >
                              🔒 {time}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {Object.keys(schedule.busyByDay).length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No busy slots grouped (possible parsing issue)
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>💡 Troubleshooting:</strong> If you see "No classes detected," the OCR might not have 
            recognized the text properly. Try:
          </p>
          <ul className="text-sm text-gray-600 mt-2 ml-4 space-y-1">
            <li>• Using a higher quality image</li>
            <li>• Ensuring the text is clear and horizontal</li>
            <li>• Converting to PDF with selectable text</li>
            <li>• Checking the extracted text in the debug section below</li>
          </ul>
        </div>
      </div>

      {/* Free Time Slots Section */}
      <div className="bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="mr-2">🎯</span>
        Your Free Time Slots
      </h2>

      {results.freeSlots.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600">😢 No common free time slots found</p>
          <p className="text-sm text-gray-500 mt-2">
            Try uploading different schedules or check if the OCR correctly detected the times.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDays.map((day) => (
            <div key={day} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-indigo-600 text-white px-4 py-2 font-semibold">
                {day}
              </div>
              <div className="p-4 space-y-3">
                {groupedByDay[day].map((time, index) => {
                  const availableLabs = results.availableLabs[day]?.[time] || [];
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">⏰</span>
                          <span className="font-semibold text-gray-800">{time}</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Free
                        </span>
                      </div>
                      
                      {availableLabs.length > 0 ? (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2 flex items-center">
                            <span className="mr-1">🔬</span>
                            Available Labs ({availableLabs.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {availableLabs.map((lab, labIndex) => (
                              <span
                                key={labIndex}
                                className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium"
                              >
                                {lab}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-2">
                          No labs available during this time
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
          <span className="mr-2">💡</span>
          Tips
        </h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>These are time slots when all uploaded schedules are free</li>
          <li>Available labs are shown for each free time slot</li>
          <li>Perfect for planning group study sessions or hangouts!</li>
        </ul>
      </div>

      {results.extractedSchedules && results.extractedSchedules.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium bg-gray-100 px-4 py-2 rounded">
            🔍 View Extracted Schedule Data (Debug)
          </summary>
          <div className="mt-2 space-y-4">
            {results.extractedSchedules.map((schedule, idx) => (
              <div key={idx} className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">{schedule.fileName}</h4>
                <div className="bg-gray-50 rounded p-3 text-xs overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap">{schedule.rawText}</pre>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
