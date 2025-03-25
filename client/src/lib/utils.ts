import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to readable string
export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date with time
export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format percentage from 0-100 to string with % sign
export function formatPercentage(value: number | undefined): string {
  if (value === undefined) return '0%';
  return `${Math.round(value)}%`;
}

// Get color class based on score
export function getScoreColorClass(score: number | undefined): string {
  if (score === undefined) return 'bg-gray-400';
  
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

// Get text for score rating
export function getScoreRating(score: number | undefined): string {
  if (score === undefined) return 'Unknown';
  
  if (score >= 70) return 'Hot Lead';
  if (score >= 40) return 'Warm Lead';
  return 'Cold Lead';
}

// Get badge color for market
export function getMarketBadgeColor(market: string | undefined): string {
  if (!market) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  
  const marketMap: Record<string, string> = {
    'Germany': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Austria': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Switzerland': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'USA': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Global': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };
  
  return marketMap[market] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
}

// Get badge color for lead status
export function getStatusBadgeColor(status: string | undefined): string {
  if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  
  const statusMap: Record<string, string> = {
    'new': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'contacted': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'qualified': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'proposal': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'won': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    'lost': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  
  return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
}

// Get icon color class based on insight type
export function getInsightIconColor(type: string): string {
  const typeMap: Record<string, string> = {
    'lead': 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    'content': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    'trend': 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    'reminder': 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
    'research': 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    'error': 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
  };
  
  return typeMap[type.toLowerCase()] || 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
}

// Get icon name based on insight type
export function getInsightIcon(type: string): string {
  const typeMap: Record<string, string> = {
    'lead': 'lightbulb',
    'content': 'donut_large',
    'trend': 'trending_up',
    'reminder': 'priority_high',
    'research': 'psychology',
    'error': 'error'
  };
  
  return typeMap[type.toLowerCase()] || 'insights';
}

// Convert object to query string parameters
export function toQueryString(params: Record<string, any>): string {
  const validParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return validParams ? `?${validParams}` : '';
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '…';
}
