// Example usage and testing file for schedule analyzer

import { ScheduleAnalyzer } from './utils/scheduleAnalyzer';

/**
 * Example usage of the ScheduleAnalyzer class
 * This demonstrates how to use the analyzer programmatically
 */

// Example: Analyze schedules from files
async function analyzeScheduleFiles(files: File[]) {
  const analyzer = new ScheduleAnalyzer();
  
  try {
    const results = await analyzer.analyzeSchedules(files);
    
    console.log('Analysis Results:');
    console.log('=================');
    console.log(`Total free slots found: ${results.freeSlots.length}`);
    
    // Group by day
    const byDay: Record<string, string[]> = {};
    results.freeSlots.forEach(slot => {
      if (!byDay[slot.day]) {
        byDay[slot.day] = [];
      }
      byDay[slot.day].push(slot.time);
    });
    
    Object.entries(byDay).forEach(([day, times]) => {
      console.log(`\n${day}:`);
      times.forEach(time => console.log(`  - ${time}`));
    });
    
    return results;
  } catch (error) {
    console.error('Error analyzing schedules:', error);
    throw error;
  }
}

/**
 * Example: Manual schedule creation for testing
 * You can use this to test the analyzer without actual files
 */
const exampleSchedule1 = {
  fileName: 'student1-schedule.png',
  busySlots: [
    { day: 'Monday', time: '08:00 AM - 09:30 AM' },
    { day: 'Monday', time: '11:00 AM - 12:30 PM' },
    { day: 'Tuesday', time: '09:30 AM - 11:00 AM' },
    { day: 'Wednesday', time: '02:00 PM - 03:30 PM' },
  ],
  rawText: 'Sample schedule text...'
};

const exampleSchedule2 = {
  fileName: 'student2-schedule.pdf',
  busySlots: [
    { day: 'Monday', time: '09:30 AM - 11:00 AM' },
    { day: 'Tuesday', time: '08:00 AM - 09:30 AM' },
    { day: 'Wednesday', time: '11:00 AM - 12:30 PM' },
    { day: 'Thursday', time: '02:00 PM - 03:30 PM' },
  ],
  rawText: 'Sample schedule text...'
};

/**
 * Tips for creating schedules that OCR can read well:
 * 
 * 1. IMAGE QUALITY
 *    - Use high resolution (at least 300 DPI)
 *    - Ensure good lighting and contrast
 *    - Avoid blurry or pixelated images
 * 
 * 2. TEXT FORMAT
 *    - Clear, readable fonts
 *    - Horizontal text (not rotated)
 *    - Include day names (Monday, Tuesday, etc.)
 *    - Include time slots in format like "8:00 AM" or "08:00 AM"
 * 
 * 3. SCHEDULE STRUCTURE
 *    - Use table format if possible
 *    - Clearly separate days and time slots
 *    - Mark classes/labs clearly
 *    - Use consistent formatting
 * 
 * 4. FILE FORMATS
 *    - Best: PDF with selectable text
 *    - Good: High-quality PNG or JPG
 *    - Acceptable: Screenshots from schedule apps
 * 
 * 5. CONTENT
 *    - Include all days (Sunday-Saturday or Monday-Friday)
 *    - Show all time slots (8 AM - 5 PM)
 *    - Mark busy slots with course names
 *    - Leave free slots empty or marked as "Free"
 */

/**
 * Common schedule patterns that work well:
 */

// Pattern 1: Table format
const goodScheduleExample1 = `
  Time        | Monday         | Tuesday        | Wednesday
  ------------|----------------|----------------|----------------
  8:00-9:30   | Data Structures| Free           | Algorithms
  9:30-11:00  | Free           | Database Lab   | Algorithms
  11:00-12:30 | Web Development| Database Lab   | Free
`;

// Pattern 2: List format
const goodScheduleExample2 = `
  Monday:
    8:00 AM - 9:30 AM: Data Structures (Room 101)
    11:00 AM - 12:30 PM: Web Development (Room 205)
  
  Tuesday:
    9:30 AM - 11:00 AM: Database Lab (09F-24L)
    11:00 AM - 12:30 PM: Database Lab (09F-24L)
`;

// Pattern 3: Block format
const goodScheduleExample3 = `
  Week Schedule - Fall 2025
  
  Monday:
  08:00 AM - 09:30 AM | Computer Networks
  09:30 AM - 11:00 AM | Free
  11:00 AM - 12:30 PM | Software Engineering
  
  Tuesday:
  08:00 AM - 09:30 AM | Algorithms
  09:30 AM - 11:00 AM | Algorithms
  11:00 AM - 12:30 PM | Free
`;

/**
 * How the analyzer works:
 * 
 * 1. FILE PROCESSING
 *    - Images: Tesseract.js extracts text via OCR
 *    - PDFs: PDF.js extracts text from each page
 * 
 * 2. TEXT PARSING
 *    - Searches for day names (Monday, Tuesday, etc.)
 *    - Looks for time patterns (8:00 AM, 08:00, etc.)
 *    - Identifies schedule keywords (class, lecture, lab)
 *    - Maps times to standard 1.5-hour slots
 * 
 * 3. BUSY SLOT DETECTION
 *    - Combines day + time information
 *    - Creates list of busy slots for each schedule
 * 
 * 4. FREE SLOT CALCULATION
 *    - Compares all schedules
 *    - Finds time slots free in ALL schedules
 *    - Returns common free times
 * 
 * 5. LAB AVAILABILITY
 *    - Checks lab_free.json for each free slot
 *    - Returns available labs during free times
 */

export {
  analyzeScheduleFiles,
  exampleSchedule1,
  exampleSchedule2,
  goodScheduleExample1,
  goodScheduleExample2,
  goodScheduleExample3,
};

// Note: This is a reference file for understanding the system
// The actual implementation is in utils/scheduleAnalyzer.ts
