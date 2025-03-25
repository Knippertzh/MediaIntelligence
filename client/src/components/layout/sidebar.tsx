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
            viewBox="0 0 160 40" 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-auto"
          >
            {/* DCI */}
            <path 
              d="M8.5,10.7c-0.8,0.3-1.4,0.8-1.9,1.3c-0.5,0.6-0.8,1.2-1,2c-0.2,0.8-0.3,1.6-0.3,2.5v7c0,0.9,0.1,1.7,0.3,2.5c0.2,0.8,0.5,1.4,1,2c0.5,0.6,1.1,1,1.9,1.3c0.8,0.3,1.8,0.5,3,0.5h12.2c0.9,0,1.7-0.1,2.4-0.3c0.7-0.2,1.3-0.5,1.7-0.9c0.5-0.4,0.8-0.9,1-1.5c0.2-0.6,0.3-1.2,0.3-1.9v-11c0-0.7-0.1-1.3-0.3-1.9C28.6,12,28.3,11.5,27.8,11.1c-0.5-0.4-1-0.7-1.7-0.9c-0.7-0.2-1.5-0.3-2.4-0.3H11.5C10.3,10,9.3,10.2,8.5,10.7z M25,14.4v10.8c0,0.2-0.1,0.4-0.2,0.6c-0.1,0.2-0.3,0.3-0.5,0.4c-0.2,0.1-0.5,0.1-0.8,0.1H13.2c-0.6,0-1.1-0.1-1.5-0.4c-0.4-0.3-0.6-0.6-0.7-1.1c-0.1-0.5-0.2-1-0.2-1.6v-6.3c0-0.6,0.1-1.1,0.2-1.6c0.1-0.5,0.3-0.8,0.7-1.1c0.4-0.3,0.9-0.4,1.5-0.4h10.3c0.3,0,0.6,0,0.8,0.1c0.2,0.1,0.4,0.2,0.5,0.4C24.9,14,25,14.2,25,14.4z" 
              fill="#00A0DE"
            />
            <path 
              d="M59.2,10.7c-0.8,0.3-1.5,0.8-2,1.3c-0.5,0.6-0.9,1.2-1.1,2c-0.2,0.8-0.3,1.6-0.3,2.5v7c0,0.9,0.1,1.7,0.3,2.5c0.2,0.8,0.6,1.4,1.1,2c0.5,0.6,1.2,1,2,1.3c0.8,0.3,1.8,0.5,3,0.5h11.1v-3.8h-9.7c-0.6,0-1.1-0.1-1.6-0.4c-0.4-0.3-0.7-0.6-0.8-1.1c-0.1-0.5-0.2-1-0.2-1.6v-6.3c0-0.6,0.1-1.1,0.2-1.6c0.1-0.5,0.4-0.8,0.8-1.1c0.4-0.3,0.9-0.4,1.6-0.4h9.7V10H62.2C61,10,60,10.2,59.2,10.7z" 
              fill="#00A0DE"
            />
            <path 
              d="M47,29.7c-0.8,0-1.6-0.1-2.3-0.4c-0.8-0.3-1.4-0.7-1.9-1.2c-0.5-0.5-0.9-1.2-1.2-2c-0.3-0.8-0.4-1.6-0.4-2.5V10h4.4v13.1c0,0.6,0.1,1.1,0.4,1.4c0.3,0.3,0.6,0.5,1.1,0.5h2.7v4.7H47z" 
              fill="#00A0DE"
            />
            {/* MEDIA */}
            <path 
              d="M84.3,10l-2.6,20h-3.9l-2.1-13.9L73.7,30h-3.9l-2.6-20h3.7l1.3,12.1L73.9,10h3.5l1.7,12.1L80.4,10H84.3z" 
              fill="#CCCCCC"
            />
            <path 
              d="M92.9,30H89V10h8.8c0.9,0,1.7,0.2,2.4,0.5c0.7,0.3,1.2,0.8,1.5,1.5c0.4,0.7,0.6,1.5,0.6,2.6v11c0,1-0.2,1.9-0.6,2.6c-0.4,0.7-0.9,1.2-1.5,1.5c-0.7,0.3-1.5,0.5-2.4,0.5H92.9z M92.9,13.8v12.4h4.1c0.3,0,0.6-0.1,0.8-0.2c0.2-0.1,0.3-0.3,0.4-0.6c0.1-0.3,0.1-0.6,0.1-0.9v-9c0-0.3,0-0.6-0.1-0.9c-0.1-0.3-0.2-0.4-0.4-0.6c-0.2-0.1-0.5-0.2-0.8-0.2H92.9z" 
              fill="#CCCCCC"
            />
            <path 
              d="M113.2,30h-9.5V10h9.5c0.9,0,1.7,0.2,2.4,0.5c0.7,0.3,1.2,0.8,1.5,1.5c0.4,0.7,0.6,1.5,0.6,2.6v11c0,1-0.2,1.9-0.6,2.6c-0.4,0.7-0.9,1.2-1.5,1.5C114.9,29.8,114.1,30,113.2,30z M108.4,13.8v12.4h4.1c0.3,0,0.6-0.1,0.8-0.2c0.2-0.1,0.3-0.3,0.4-0.6c0.1-0.3,0.1-0.6,0.1-0.9v-9c0-0.3,0-0.6-0.1-0.9c-0.1-0.3-0.2-0.4-0.4-0.6c-0.2-0.1-0.5-0.2-0.8-0.2H108.4z" 
              fill="#CCCCCC"
            />
            <path 
              d="M119.6,10h3.9v20h-3.9V10z" 
              fill="#CCCCCC"
            />
            <path 
              d="M131.9,10l5.5,20h-3.9l-0.8-3.3h-5.2l-0.8,3.3h-3.9l5.5-20H131.9z M133.3,23.1l-1.9-7.3l-1.9,7.3H133.3z" 
              fill="#CCCCCC"
            />
          </svg>
          <span className="font-semibold text-lg">CRM</span>
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
