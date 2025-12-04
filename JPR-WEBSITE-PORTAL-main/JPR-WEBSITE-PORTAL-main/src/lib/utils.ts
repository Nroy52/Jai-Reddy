import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusEmoji(trend: 'up' | 'down' | 'neutral' | string): string {
  switch (trend) {
    case 'up':
      return '😊'; // Happy
    case 'neutral':
      return '😔'; // Sad (Not going really well)
    case 'down':
      return '😡'; // Anger (Critical)
    default:
      return '😊';
  }
}

export function calculateAggregateTrend(items: { trend: 'up' | 'down' | 'neutral' | string }[]): 'up' | 'down' | 'neutral' {
  if (!items || items.length === 0) return 'neutral';

  const counts = items.reduce((acc, item) => {
    acc[item.trend as string] = (acc[item.trend as string] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const up = counts['up'] || 0;
  const down = counts['down'] || 0;
  const neutral = counts['neutral'] || 0;

  // Logic: If any critical (down) > 30%, return down. 
  // If neutral > up, return neutral.
  // Else up.
  if (down > items.length * 0.3) return 'down';
  if (neutral > up) return 'neutral';
  return 'up';
}
