import { NextResponse } from 'next/server';
import wordsData from '@/data/words.json';

export async function GET() {
  return NextResponse.json(wordsData);
}
