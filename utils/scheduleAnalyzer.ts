import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface TimeSlot {
  day: string;
  time: string;
}

interface Schedule {
  fileName: string;
  busySlots: TimeSlot[];
  rawText: string;
}

export class ScheduleAnalyzer {
  // Time slots matching your actual schedule format
  // Note: These are the ACTUAL time slots from your schedules
  private readonly timeSlots = [
    '8:00 AM - 9:20 AM',
    '9:30 AM - 10:50 AM',
    '11:00 AM - 12:20 PM',
    '11:00 AM - 1:50 PM',
    '12:30 PM - 1:50 PM',
    '2:00 PM - 4:50 PM',
    '3:30 PM - 4:50 PM',
  ];

  private readonly days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  /**
   * Extract text from image using Tesseract OCR with table detection
   */
  private async extractTextFromImage(file: File): Promise<string> {
    try {
      console.log('🖼️ Starting OCR with table structure detection...');
      
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
          }
        },
      });
      
      console.log('✅ OCR completed');
      console.log('📄 Raw text length:', result.data.text.length);
      console.log('📄 First 500 chars:', result.data.text.substring(0, 500));
      
      return result.data.text;
    } catch (error) {
      console.error('Error extracting text from image:', error);
      throw new Error(`Failed to extract text from ${file.name}`);
    }
  }

  /**
   * Extract text from PDF with better spatial awareness
   */
  private async extractTextFromPDF(file: File): Promise<string> {
    try {
      console.log('📄 Starting PDF extraction with spatial analysis...');
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Group text items by vertical position with tolerance
        const rowTolerance = 5;
        const rows: Record<number, Array<{ x: number; text: string }>> = {};
        
        textContent.items.forEach((item: any) => {
          const y = Math.round(item.transform[5] / rowTolerance) * rowTolerance;
          const x = Math.round(item.transform[4]);
          
          if (!rows[y]) rows[y] = [];
          rows[y].push({ x, text: item.str });
        });

        // Sort rows top to bottom and items left to right
        const sortedRows = Object.keys(rows)
          .map(Number)
          .sort((a, b) => b - a);

        for (const y of sortedRows) {
          const sortedItems = rows[y].sort((a, b) => a.x - b.x);
          const line = sortedItems.map(item => item.text).join(' ');
          fullText += line + '\n';
        }
      }

      console.log('✅ PDF extraction completed');
      console.log('📄 Text length:', fullText.length);
      console.log('📄 First 500 chars:', fullText.substring(0, 500));

      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(`Failed to extract text from ${file.name}`);
    }
  }

  /**
   * Parse extracted text to find busy time slots
   * NEW APPROACH: Build a structured table from extracted text
   */
  private parseSchedule(text: string): TimeSlot[] {
    const busySlots: TimeSlot[] = [];
    
    console.log('\n=== TABLE-BASED SCHEDULE PARSER ===');
    console.log('Raw text length:', text.length);
    
    // Split into lines
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    console.log('Total lines:', lines.length);
    console.log('\n📋 First 20 lines:');
    lines.slice(0, 20).forEach((line, i) => console.log(`${i}: ${line}`));
    
    // Step 1: Find the header row with day names
    const dayPattern = /(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/gi;
    let headerLine = -1;
    let dayPositions: Array<{ day: string; pattern: RegExp }> = [];
    
    for (let i = 0; i < Math.min(30, lines.length); i++) {
      const line = lines[i].toLowerCase();
      const dayMatches = line.match(dayPattern);
      
      if (dayMatches && dayMatches.length >= 4) {
        headerLine = i;
        console.log(`\n✅ Found header at line ${i}: ${lines[i]}`);
        console.log(`   Days found: ${dayMatches.join(', ')}`);
        
        // Create patterns to find content under each day
        const normalizedLine = lines[i].toLowerCase();
        ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach(day => {
          if (normalizedLine.includes(day)) {
            // Capitalize first letter
            const dayName = day.charAt(0).toUpperCase() + day.slice(1);
            dayPositions.push({
              day: dayName,
              pattern: new RegExp(`\\b${day}\\b`, 'i')
            });
          }
        });
        break;
      }
    }
    
    if (headerLine === -1) {
      console.error('❌ Could not find header row with day names!');
      console.log('💡 Trying alternative parsing...');
      return this.parseScheduleAlternative(text);
    }
    
    console.log(`\n📅 Day columns detected: ${dayPositions.map(d => d.day).join(', ')}`);
    
    // Step 2: Find time slot rows (rows that start with a time)
    const timePattern = /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/;
    const timeRows: Array<{ lineIndex: number; time: string; content: string }> = [];
    
    for (let i = headerLine + 1; i < lines.length; i++) {
      const line = lines[i];
      const timeMatch = line.match(timePattern);
      
      if (timeMatch) {
        // Try to find matching time slot
        let matchedSlot = '';
        
        for (const slot of this.timeSlots) {
          const [startTime] = slot.split(' - ');
          const normalizeTime = (t: string) => t.toLowerCase().replace(/\s+/g, '').replace(/^0/, '');
          
          if (normalizeTime(line).includes(normalizeTime(startTime))) {
            matchedSlot = slot;
            break;
          }
        }
        
        if (matchedSlot) {
          timeRows.push({
            lineIndex: i,
            time: matchedSlot,
            content: line
          });
          console.log(`\n⏰ Time row found at line ${i}: ${matchedSlot}`);
          console.log(`   Content: ${line.substring(0, 100)}...`);
        }
      }
    }
    
    console.log(`\n✅ Found ${timeRows.length} time slot rows`);
    
    // Step 3: For each time row, parse the content by day columns
    for (const timeRow of timeRows) {
      console.log(`\n🔍 Parsing: ${timeRow.time}`);
      
      // Collect content for this time slot (may span multiple lines)
      let rowContent = timeRow.content;
      
      // Look ahead for continuation lines (no time, not a header)
      for (let j = timeRow.lineIndex + 1; j < Math.min(timeRow.lineIndex + 5, lines.length); j++) {
        const nextLine = lines[j];
        
        // Stop if we hit another time slot
        if (nextLine.match(timePattern)) break;
        
        // Stop if we hit a header-like line
        const dayMatches = nextLine.toLowerCase().match(dayPattern);
        if (dayMatches && dayMatches.length >= 3) break;
        
        // Add this line to row content
        rowContent += ' ' + nextLine;
      }
      
      console.log(`   Full row content: ${rowContent.substring(0, 150)}...`);
      
      // Parse content for each day
      for (const dayPos of dayPositions) {
        // Find day keyword position
        const dayMatch = dayPos.pattern.exec(rowContent);
        
        if (!dayMatch) continue;
        
        const dayStartIndex = dayMatch.index;
        
        // Find next day position or end of string
        let dayEndIndex = rowContent.length;
        for (const otherDay of dayPositions) {
          if (otherDay.day === dayPos.day) continue;
          
          const otherMatch = otherDay.pattern.exec(rowContent.substring(dayStartIndex + dayPos.day.length));
          if (otherMatch) {
            const otherIndex = dayStartIndex + dayPos.day.length + otherMatch.index;
            if (otherIndex < dayEndIndex) {
              dayEndIndex = otherIndex;
            }
          }
        }
        
        // Extract content for this day
        const dayContent = rowContent.substring(dayStartIndex + dayPos.day.length, dayEndIndex).trim();
        
        // Remove common separators and clean up
        const cleanContent = dayContent
          .replace(/^[\s\-:|]+/, '')
          .replace(/[\s\-:|]+$/, '')
          .trim();
        
        console.log(`   📅 ${dayPos.day}: "${cleanContent}"`);
        
        // If there's substantial content (more than just punctuation), mark as busy
        const meaningfulContent = cleanContent.replace(/[\s\-:|,]+/g, '');
        
        if (meaningfulContent.length >= 3) {
          busySlots.push({
            day: dayPos.day,
            time: timeRow.time
          });
          console.log(`      ✅ BUSY (${meaningfulContent.length} chars of content)`);
        } else {
          console.log(`      ⬜ FREE (insufficient content: "${meaningfulContent}")`);
        }
      }
    }
    
    // Remove duplicates
    const uniqueSlots = busySlots.filter((slot, index, self) =>
      index === self.findIndex((s) => s.day === slot.day && s.time === slot.time)
    );

    console.log(`\n=== PARSING COMPLETE ===`);
    console.log(`Total busy slots found: ${uniqueSlots.length}`);
    
    // Group by day for summary
    const byDay: Record<string, number> = {};
    this.days.forEach(day => byDay[day] = 0);
    uniqueSlots.forEach(slot => byDay[slot.day]++);
    
    console.log('\n📊 Busy slots by day:');
    this.days.forEach(day => {
      const count = byDay[day];
      console.log(`   ${day}: ${count} ${count === 1 ? 'slot' : 'slots'}`);
    });

    return uniqueSlots;
  }
  
  /**
   * Alternative parsing when table structure is not clear
   * Uses a simpler line-by-line approach with pattern matching
   */
  private parseScheduleAlternative(text: string): TimeSlot[] {
    console.log('\n🔄 Using alternative parsing strategy...');
    
    const busySlots: TimeSlot[] = [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Look for patterns like: "Monday CSE421-07" or "CSE421 Monday"
    const classPattern = /[A-Z]{3}\d{3}[A-Z0-9\-]*/g;
    const dayPattern = /(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/gi;
    const timePattern = /(\d{1,2}:\d{2}\s*(?:AM|PM))/gi;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Find time slots
      const timeMatches = line.match(timePattern);
      if (!timeMatches) continue;
      
      // Match to our time slots
      let matchedSlot = '';
      for (const slot of this.timeSlots) {
        const [startTime] = slot.split(' - ');
        if (line.toLowerCase().includes(startTime.toLowerCase().replace(/^0/, ''))) {
          matchedSlot = slot;
          break;
        }
      }
      
      if (!matchedSlot) continue;
      
      console.log(`\n⏰ Found time: ${matchedSlot} in line: ${line.substring(0, 100)}`);
      
      // Find classes in this line and nearby lines
      const contextLines = [line];
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        contextLines.push(lines[j]);
      }
      const context = contextLines.join(' ');
      
      // Find days mentioned
      const dayMatches = Array.from(context.matchAll(dayPattern));
      const classMatches = Array.from(context.matchAll(classPattern));
      
      console.log(`   Found ${dayMatches.length} days, ${classMatches.length} classes`);
      
      // If we found classes and days, try to pair them
      if (dayMatches.length > 0 && classMatches.length > 0) {
        dayMatches.forEach(dayMatch => {
          const day = dayMatch[0].charAt(0).toUpperCase() + dayMatch[0].slice(1).toLowerCase();
          console.log(`   ✅ BUSY: ${day} at ${matchedSlot}`);
          busySlots.push({ day, time: matchedSlot });
        });
      }
    }
    
    console.log(`\n📋 Alternative parsing found ${busySlots.length} busy slots`);
    return busySlots;
  }

  /**
   * Create a complete weekly schedule grid and find free time slots
   * Returns both the complete grid and free slots
   */
  private analyzeWeeklySchedule(schedules: Schedule[]): {
    weeklyGrid: Record<string, Record<string, { isBusy: boolean; scheduleNames: string[] }>>;
    freeSlots: TimeSlot[];
    busySlots: TimeSlot[];
  } {
    console.log('\n=== CREATING WEEKLY SCHEDULE GRID ===');
    
    // Initialize complete weekly grid - ALL days, ALL time slots
    const weeklyGrid: Record<string, Record<string, { isBusy: boolean; scheduleNames: string[] }>> = {};
    
    for (const day of this.days) {
      weeklyGrid[day] = {};
      for (const time of this.timeSlots) {
        weeklyGrid[day][time] = {
          isBusy: false,
          scheduleNames: []
        };
      }
    }

    // Mark busy slots from all schedules
    console.log(`Processing ${schedules.length} schedules...`);
    
    for (const schedule of schedules) {
      console.log(`  - ${schedule.fileName}: ${schedule.busySlots.length} busy slots`);
      
      for (const busySlot of schedule.busySlots) {
        if (weeklyGrid[busySlot.day] && weeklyGrid[busySlot.day][busySlot.time]) {
          weeklyGrid[busySlot.day][busySlot.time].isBusy = true;
          weeklyGrid[busySlot.day][busySlot.time].scheduleNames.push(schedule.fileName);
        }
      }
    }

    // Extract free and busy slots from the grid
    const freeSlots: TimeSlot[] = [];
    const busySlots: TimeSlot[] = [];

    for (const day of this.days) {
      for (const time of this.timeSlots) {
        const slot = weeklyGrid[day][time];
        
        if (slot.isBusy) {
          busySlots.push({ day, time });
        } else {
          freeSlots.push({ day, time });
        }
      }
    }

    console.log(`\nWeekly Schedule Summary:`);
    console.log(`  Total slots: ${this.days.length * this.timeSlots.length}`);
    console.log(`  Busy slots: ${busySlots.length}`);
    console.log(`  Free slots: ${freeSlots.length}`);
    
    // Log daily summary
    for (const day of this.days) {
      const dayBusyCount = Object.values(weeklyGrid[day]).filter(slot => slot.isBusy).length;
      const dayFreeCount = this.timeSlots.length - dayBusyCount;
      console.log(`  ${day}: ${dayBusyCount} busy, ${dayFreeCount} free`);
    }

    return {
      weeklyGrid,
      freeSlots,
      busySlots
    };
  }

  /**
   * Main method to analyze multiple schedule files
   */
  async analyzeSchedules(files: File[]): Promise<{
    freeSlots: TimeSlot[];
    busySlots: TimeSlot[];
    weeklyGrid: Record<string, Record<string, { isBusy: boolean; scheduleNames: string[] }>>;
    extractedSchedules: Schedule[];
  }> {
    const schedules: Schedule[] = [];

    console.log(`\n=== ANALYZING ${files.length} SCHEDULE FILES ===`);

    for (const file of files) {
      try {
        console.log(`\nProcessing: ${file.name}`);
        let text: string;
        
        if (file.type.startsWith('image/')) {
          text = await this.extractTextFromImage(file);
        } else if (file.type === 'application/pdf') {
          text = await this.extractTextFromPDF(file);
        } else {
          console.warn(`Unsupported file type: ${file.type}`);
          continue;
        }

        console.log(`Extracted text length: ${text.length} characters`);
        const busySlots = this.parseSchedule(text);
        
        schedules.push({
          fileName: file.name,
          busySlots,
          rawText: text,
        });
        
        console.log(`✓ Added schedule: ${file.name} with ${busySlots.length} busy slots`);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        throw error;
      }
    }

    // Analyze complete weekly schedule
    const { weeklyGrid, freeSlots, busySlots } = this.analyzeWeeklySchedule(schedules);

    console.log('\n=== ANALYSIS COMPLETE ===');
    console.log(`Total schedules processed: ${schedules.length}`);
    console.log(`Free slots available: ${freeSlots.length}`);
    console.log(`Busy slots: ${busySlots.length}`);

    return {
      freeSlots,
      busySlots,
      weeklyGrid,
      extractedSchedules: schedules,
    };
  }
}
