import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import { MentalHealth } from '@/schema/mentalHealth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    // Fetch the latest mental health record
    const latestRecord = await MentalHealth.findOne()
      .sort({ timestamp: -1 })
      .select('mentalFitnessScore voiceAnalysis');

    if (!latestRecord) {
      return res.status(404).json({ message: 'No mental health records found' });
    }

    res.status(200).json(latestRecord);
  } catch (error) {
    console.error('Error fetching mental health data:', error);
    res.status(500).json({ message: 'Error fetching mental health data' });
  }
}
