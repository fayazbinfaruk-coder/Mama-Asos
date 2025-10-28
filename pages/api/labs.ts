import type { NextApiRequest, NextApiResponse } from 'next';
import labFreeData from '@/public/lab_free.json';

interface TimeSlot {
  day: string;
  time: string;
}

interface RequestBody {
  freeSlots: TimeSlot[];
}

interface ResponseData {
  availableLabs: Record<string, Record<string, string[]>>;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { freeSlots } = req.body as RequestBody;

    if (!freeSlots || !Array.isArray(freeSlots)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const availableLabs: Record<string, Record<string, string[]>> = {};

    // For each free slot, get available labs
    for (const slot of freeSlots) {
      const { day, time } = slot;

      // Initialize day object if not exists
      if (!availableLabs[day]) {
        availableLabs[day] = {};
      }

      // Get labs for this day and time
      const dayData = labFreeData[day as keyof typeof labFreeData];
      if (dayData && dayData[time as keyof typeof dayData]) {
        availableLabs[day][time] = dayData[time as keyof typeof dayData] as string[];
      } else {
        availableLabs[day][time] = [];
      }
    }

    res.status(200).json({ availableLabs });
  } catch (error) {
    console.error('Error processing labs request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
