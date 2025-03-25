import { useState } from 'react';
import { useTheme } from 'next-themes';
import { 
  Menu, Search, Bell, Plus, 
  Moon, Sun, ChevronDown
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    onMobileMenuToggle();
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Menu className="h-5 w-5 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300" />
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md ml-4 md:ml-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search leads, companies, or projects..." 
              className="pl-10 bg-gray-50 dark:bg-gray-700"
            />
          </div>
        </div>
        
        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 dark:bg-red-400"></span>
          </Button>
          
          {/* Create New Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Create New
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Users className="h-4 w-4 mr-2" />
                Lead
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Building className="h-4 w-4 mr-2" />
                Company
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ClipboardList className="h-4 w-4 mr-2" />
                Project
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckSquare className="h-4 w-4 mr-2" />
                Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-0 z-40 md:hidden transition-transform duration-300 transform",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="relative w-full max-w-xs h-full">
          <Sidebar />
        </div>
        
        <div 
          className="absolute inset-0 bg-gray-600 bg-opacity-75"
          onClick={toggleMobileMenu}
        ></div>
      </div>
    </header>
  );
}

import { Users, Building, ClipboardList, CheckSquare } from 'lucide-react';
