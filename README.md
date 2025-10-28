# 🎓 Class Schedule Hangout Finder

A web application that helps university students find common free time slots to hangout by analyzing their class schedules. Upload multiple schedule images or PDFs, and the app will identify when everyone is free and which labs are available during those times.

## ✨ Features

- 📤 **Multi-file Upload**: Upload multiple class schedule images (JPG, PNG) or PDFs
- 🔍 **OCR Technology**: Client-side text extraction using Tesseract.js
- 📊 **Smart Analysis**: Automatically detects busy time slots from schedules
- 🆓 **Free Time Detection**: Finds common free time slots across all uploaded schedules
- 🔬 **Lab Availability**: Shows which labs are free during your available times
- 🔒 **Privacy-First**: All processing happens in your browser - no files uploaded to servers
- 🚀 **Fast & Responsive**: Built with Next.js and deployed on Vercel

## 🏗️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **OCR**: Tesseract.js (client-side image text extraction)
- **PDF Processing**: PDF.js
- **Deployment**: Vercel (free hosting)

## 📋 Time Slots & Class Types

The application works with 1.5-hour time slots from 8:00 AM to 5:00 PM:

- 08:00 AM - 09:30 AM
- 09:30 AM - 11:00 AM
- 11:00 AM - 12:30 PM
- 12:30 PM - 02:00 PM
- 02:00 PM - 03:30 PM
- 03:30 PM - 05:00 PM

### Class Duration Rules

**Theory Classes (ending in C, T, etc.)**: Occupy **1 time slot** (1.5 hours)
- Example: `CSE421-07-SRJ-10A-04C` at Thursday 9:30 AM
- Occupies: 9:30 AM - 11:00 AM only

**Lab Classes (ending in L)**: Occupy **2 consecutive time slots** (3 hours)
- Example: `CSE471-09-09F-27L` at Monday 11:00 AM
- Occupies: 11:00 AM - 12:30 PM AND 12:30 PM - 02:00 PM

This matches how university schedules typically work - labs are longer sessions!

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone or download this repository:
   ```bash
   cd "Mama Asos"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Project Structure

```
Mama Asos/
├── components/
│   ├── FileUpload.tsx       # File upload component
│   └── ResultsDisplay.tsx   # Results display component
├── pages/
│   ├── api/
│   │   └── labs.ts          # API route for lab availability
│   ├── _app.tsx             # Next.js app wrapper
│   ├── _document.tsx        # Custom document
│   └── index.tsx            # Main page
├── public/
│   └── lab_free.json        # Lab availability data
├── styles/
│   └── globals.css          # Global styles
├── utils/
│   └── scheduleAnalyzer.ts  # Schedule analysis logic
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── vercel.json              # Vercel deployment config
```

## 🌐 Deploying to Vercel

### Option 1: Deploy with Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts to complete deployment

### Option 2: Deploy with Vercel Dashboard

1. Push your code to GitHub, GitLab, or Bitbucket

2. Go to [vercel.com](https://vercel.com) and sign up/login

3. Click "New Project"

4. Import your repository

5. Vercel will auto-detect Next.js and configure build settings

6. Click "Deploy"

Your app will be live at `https://your-project-name.vercel.app`

## 📖 How to Use

1. **Upload Schedules**: 
   - Click "Browse Files" or drag and drop schedule images/PDFs
   - Schedules should be in table format (rows = time slots, columns = days)
   - You can upload multiple files (yours and your friends')

2. **Analyze**: 
   - Click "Find Free Times" button
   - The app will process all schedules using OCR
   - Lab classes (ending in 'L') are automatically detected and occupy 2 time slots

3. **View Results**:
   - See common free time slots across all schedules
   - Check which labs are available during those times
   - Plan your hangout sessions!

### 📊 Schedule Format

Your schedules should follow this table format:
```
TIME/DAY    | MONDAY       | TUESDAY      | WEDNESDAY
------------|--------------|--------------|-------------
8:00-9:30   | SOC101-11... |              | SOC101-11...
9:30-11:00  |              |              | CSE421-07...
11:00-12:30 | CSE471L-06...| CSE471-02... |
```

- **Empty cells**: Free time
- **Class codes**: Busy time
- **Classes ending in 'L'**: Lab classes (3 hours, 2 slots)
- **Other classes**: Theory classes (1.5 hours, 1 slot)

See `SCHEDULE_FORMAT.md` for detailed format guide.

## 🔧 Customization

### Updating Lab Availability

Edit `public/lab_free.json` to update lab availability information:

```json
{
  "Monday": {
    "08:00 AM - 09:30 AM": ["Lab1", "Lab2"],
    "09:30 AM - 11:00 AM": ["Lab1", "Lab3"]
  }
}
```

### Modifying Time Slots

To change time slots, update the `timeSlots` array in `utils/scheduleAnalyzer.ts`:

```typescript
private readonly timeSlots = [
  '08:00 AM - 09:30 AM',
  // Add or modify slots here
];
```

## 🐛 Troubleshooting

### OCR Not Working Well?

- Ensure schedule images are clear and high-resolution
- Make sure text is readable and not too skewed
- PDF schedules with selectable text work better than scanned images

### No Free Slots Found?

- Check if the OCR correctly detected the schedule (view "Extracted Schedule Data")
- Ensure your schedule format includes days and times
- Try uploading higher quality images

### Build Errors?

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

## 📝 Notes

- All file processing happens client-side - your schedules are never uploaded to a server
- The app works best with schedules that clearly show days of the week and times
- Supported file formats: JPG, PNG, GIF, BMP, PDF

## 🤝 Contributing

Feel free to fork this project and customize it for your university's needs!

## 📄 License

This project is open source and available for educational purposes.

## 🙋 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the extracted schedule data to see if OCR worked correctly
3. Try with different image formats or higher quality scans

---

Made with ❤️ for university students who want to hang out more!
