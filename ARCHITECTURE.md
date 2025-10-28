# 🏗️ Architecture & Development Guide

## System Architecture

### Overview
```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    React Frontend                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │  │
│  │  │  Upload  │→ │   OCR    │→ │  Schedule Analyzer   │ │  │
│  │  │Component │  │Processing│  │    (Client-Side)     │ │  │
│  │  └──────────┘  └──────────┘  └──────────────────────┘ │  │
│  │                       ↓                                 │  │
│  │              ┌─────────────────┐                       │  │
│  │              │  Results Display │                       │  │
│  │              └─────────────────┘                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                           ↓ API Call                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                 Next.js API Route                       │  │
│  │         /api/labs → lab_free.json                      │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Frontend Layer (Client-Side)

#### `pages/index.tsx` - Main Page
- **Purpose**: Entry point and main UI orchestrator
- **Responsibilities**:
  - Manages application state
  - Coordinates file uploads
  - Triggers analysis
  - Displays results
  - Handles errors

#### `components/FileUpload.tsx` - File Upload Component
- **Purpose**: Handle file selection and upload UI
- **Features**:
  - Drag & drop support
  - Multi-file selection
  - File type validation (images, PDFs)
  - File list management
  - Visual feedback

#### `components/ResultsDisplay.tsx` - Results Component
- **Purpose**: Display analysis results
- **Features**:
  - Grouped by day
  - Time slot visualization
  - Lab availability display
  - No results messaging
  - Debug view for extracted data

### 2. Processing Layer (Client-Side)

#### `utils/scheduleAnalyzer.ts` - Core Logic
- **Purpose**: OCR and schedule analysis
- **Key Methods**:

```typescript
class ScheduleAnalyzer {
  // Extract text from images using Tesseract.js
  extractTextFromImage(file: File): Promise<string>
  
  // Extract text from PDFs using PDF.js
  extractTextFromPDF(file: File): Promise<string>
  
  // Parse extracted text to find busy slots
  parseSchedule(text: string): TimeSlot[]
  
  // Find common free time slots
  findFreeTimeSlots(schedules: Schedule[]): TimeSlot[]
  
  // Main entry point
  analyzeSchedules(files: File[]): Promise<Results>
}
```

**Parsing Algorithm**:
1. Normalize text to lowercase
2. Search for day keywords (monday, tuesday, etc.)
3. Search for time patterns (8:00 AM, 08:00, etc.)
4. Match times to standard 1.5-hour slots
5. Combine day + time to create busy slots
6. Compare all schedules to find common free times

### 3. Backend Layer (Server-Side)

#### `pages/api/labs.ts` - Lab Availability API
- **Purpose**: Provide lab availability data
- **Input**: List of free time slots
- **Output**: Available labs for each slot
- **Data Source**: `public/lab_free.json`

**Flow**:
```
POST /api/labs
Body: { freeSlots: [{ day, time }, ...] }
↓
Lookup each slot in lab_free.json
↓
Response: { availableLabs: { day: { time: [labs] } } }
```

### 4. Data Layer

#### `public/lab_free.json` - Lab Availability Data
```json
{
  "Monday": {
    "08:00 AM - 09:30 AM": ["09F-24L", "10G-33L"],
    // ... more time slots
  },
  // ... more days
}
```

**Structure**:
- Top level: Days of the week
- Second level: Time slots
- Values: Array of available lab codes

## Data Flow

### Upload & Analysis Flow
```
1. User uploads files
   ↓
2. FileUpload component validates files
   ↓
3. User clicks "Find Free Times"
   ↓
4. For each file:
   a. Detect file type (image/PDF)
   b. Extract text using appropriate method
   c. Parse text to find busy slots
   ↓
5. Analyze all schedules:
   a. Create matrix of all possible slots
   b. Mark busy slots from all schedules
   c. Identify slots free in ALL schedules
   ↓
6. Fetch lab availability:
   a. Send free slots to API
   b. API looks up each slot in lab_free.json
   c. Return available labs
   ↓
7. Display results to user
```

## OCR Processing Details

### Tesseract.js (Image OCR)
```typescript
Tesseract.recognize(file, 'eng', {
  logger: (m) => {
    // Progress tracking
    console.log(`OCR: ${(m.progress * 100).toFixed(0)}%`);
  },
})
```

**Optimization Tips**:
- Use high-resolution images
- Ensure good contrast
- Keep text horizontal
- Avoid handwritten text

### PDF.js (PDF Text Extraction)
```typescript
const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const textContent = await page.getTextContent();
  // Extract text from each item
}
```

**Benefits**:
- Faster than OCR for text-based PDFs
- More accurate for selectable text
- Works with multi-page documents

## Performance Considerations

### Client-Side Processing
**Pros**:
- No server costs
- Privacy (files never uploaded)
- Scales automatically
- Works on Vercel free tier

**Cons**:
- Limited by browser capabilities
- Can be slow for large files
- Memory constraints on mobile

**Optimizations**:
- Process files sequentially, not parallel
- Show progress indicators
- Limit file sizes if needed
- Use Web Workers for heavy processing (future enhancement)

### API Efficiency
- Simple JSON lookup (very fast)
- No database needed
- Cached by Next.js
- Minimal data transfer

## Technology Choices

### Why Next.js?
- Server-side rendering for better SEO
- API routes for backend logic
- Easy Vercel deployment
- Great developer experience
- Built-in optimization

### Why Client-Side OCR?
- No server costs
- Privacy preservation
- Vercel free tier compatible
- Instant processing (no uploads)
- Offline capability (future)

### Why Tailwind CSS?
- Rapid development
- Consistent design
- Small bundle size
- Easy customization
- Great defaults

## Deployment Architecture

### Vercel Deployment
```
GitHub/Git → Vercel
              ↓
         Next.js Build
              ↓
         Static Pages + API Routes
              ↓
         CDN Distribution
```

**Features**:
- Automatic HTTPS
- Global CDN
- Instant rollbacks
- Preview deployments
- Zero configuration

## Security Considerations

### Data Privacy
- Files processed in browser
- No server storage
- No external API calls (except for Tesseract worker)
- HTTPS enforced by Vercel

### Input Validation
- File type checking
- File size limits (can be added)
- XSS protection via React
- CSRF protection via Next.js

## Future Enhancements

### Potential Improvements
1. **Better OCR**
   - Custom training data for schedules
   - Multiple language support
   - Improved time parsing

2. **Performance**
   - Web Workers for parallel processing
   - Caching parsed schedules
   - Progressive image loading

3. **Features**
   - Save/load schedules
   - Share results via URL
   - Export to calendar
   - Room booking integration
   - Group collaboration features

4. **UX Improvements**
   - Real-time preview
   - Interactive schedule editing
   - Mobile app (PWA)
   - Dark mode

5. **Analytics**
   - Usage statistics
   - Popular free times
   - Lab utilization data

## Development Workflow

### Local Development
```bash
npm run dev    # Start dev server
npm run build  # Build for production
npm run start  # Run production build
npm run lint   # Check code quality
```

### Testing
```bash
# Manual testing checklist:
1. Upload single image
2. Upload multiple images
3. Upload PDF
4. Upload mixed files
5. Check OCR accuracy
6. Verify free slot detection
7. Check lab availability
8. Test error handling
```

### Deployment
```bash
vercel         # Deploy to preview
vercel --prod  # Deploy to production
```

## Troubleshooting Guide

### Common Issues

**Issue**: OCR not working
- Check console for errors
- Verify Tesseract.js loaded
- Check image quality
- Try different file

**Issue**: Wrong free times detected
- View extracted schedule data
- Check OCR text accuracy
- Verify time format in schedule
- Adjust parsing logic if needed

**Issue**: No labs showing
- Check lab_free.json format
- Verify day/time strings match exactly
- Check API response in network tab

**Issue**: Build fails
- Clear .next folder
- Delete node_modules
- Run npm install
- Check Node.js version

## Code Style Guide

### TypeScript
- Use interfaces for data structures
- Avoid `any` type when possible
- Add JSDoc comments for complex functions
- Use async/await over promises

### React
- Functional components only
- Use hooks for state management
- Keep components focused
- Extract reusable logic

### CSS
- Use Tailwind utilities first
- Custom CSS only when necessary
- Follow mobile-first approach
- Use semantic class names

## Contributing

### Before Submitting
1. Test all changes locally
2. Update documentation
3. Check TypeScript errors
4. Ensure responsive design
5. Test on mobile devices

---

**Need Help?** Check README.md and QUICKSTART.md for user-facing documentation.
