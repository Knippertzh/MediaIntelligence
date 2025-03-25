import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  change?: {
    value: number | string;
    type: 'increase' | 'decrease' | 'neutral';
    text: string;
  };
  icon: React.ReactNode;
  iconBgColor: string;
}

export function StatsCard({ title, value, change, icon, iconBgColor }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
          {change && (
            <div className="flex items-center mt-1 text-sm">
              {change.type === 'increase' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {change.type === 'decrease' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {change.type === 'neutral' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className={cn(
                "ml-1",
                change.type === 'increase' && "text-green-500 dark:text-green-400",
                change.type === 'decrease' && "text-red-500 dark:text-red-400",
                change.type === 'neutral' && "text-gray-500 dark:text-gray-400"
              )}>{change.value}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">{change.text}</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-full p-3", iconBgColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
