import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Prescription from '@/schema/prescription';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    const prescriptions = await Prescription.find({});
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching prescription data' });
  }
}
