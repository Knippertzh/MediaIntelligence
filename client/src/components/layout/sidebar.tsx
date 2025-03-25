import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  ClipboardList, 
  CheckSquare, 
  BarChart, 
  Settings, 
  HelpCircle,
  MoreVertical
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
}

const NavItem = ({ icon, label, href, active }: NavItemProps) => (
  <li>
    <Link href={href}>
      <a className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md",
        active 
          ? "bg-primary bg-opacity-10 text-primary" 
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      )}>
        <span className="mr-3 h-5 w-5">{icon}</span>
        {label}
      </a>
    </Link>
  </li>
);

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <svg 
            viewBox="0 0 50 24" 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-auto"
          >
            <path 
              d="M6.58 19.67l-1.69 3.83h-4.9L10.97 0h4.43l10.97 23.5h-4.9L19.8 19.67H6.58zm10.1-4.92c-1.05-2.39-2.1-4.78-3.16-7.85-.79 2.39-1.83 4.78-2.89 7.17h6.06l-.01.68z" 
              fill="#2563EB"
            />
            <path 
              d="M39.7 8.27V0h-4.89v23.5h4.9v-9.07c0-3.26 1.78-5.66 4.93-5.66.26 0 .53.14.79.14l.78-4.78c-.52-.14-1.04-.14-1.57-.14-2.62 0-4.4 1.78-4.93 4.28z" 
              fill="#64748B"
            />
          </svg>
          <span className="font-semibold text-lg">DCI Media CRM</span>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          <NavItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="Dashboard" 
            href="/" 
            active={location === "/"} 
          />
          
          <NavItem 
            icon={<Users className="h-5 w-5" />} 
            label="Leads" 
            href="/leads" 
            active={location === "/leads"} 
          />
          
          <NavItem 
            icon={<Building className="h-5 w-5" />} 
            label="Companies" 
            href="/companies" 
            active={location === "/companies"} 
          />
          
          <NavItem 
            icon={<ClipboardList className="h-5 w-5" />} 
            label="Projects" 
            href="/projects" 
            active={location === "/projects"} 
          />
          
          <NavItem 
            icon={<CheckSquare className="h-5 w-5" />} 
            label="Tasks" 
            href="/tasks" 
            active={location === "/tasks"} 
          />
          
          <NavItem 
            icon={<BarChart className="h-5 w-5" />} 
            label="Analytics" 
            href="/analytics" 
            active={location === "/analytics"} 
          />
        </ul>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-5"></div>
        
        {/* Settings Section */}
        <ul className="space-y-1">
          <NavItem 
            icon={<Settings className="h-5 w-5" />} 
            label="Settings" 
            href="/settings" 
            active={location === "/settings"} 
          />
          
          <NavItem 
            icon={<HelpCircle className="h-5 w-5" />} 
            label="Help Center" 
            href="/help" 
            active={location === "/help"} 
          />
        </ul>
      </nav>
      
      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              {user?.firstName ? user.firstName[0] : user?.username?.[0] || 'U'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.role || 'Account Manager'}
            </p>
          </div>
          <div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              onClick={() => logoutMutation.mutate()}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
