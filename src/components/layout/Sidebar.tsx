import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Tags, 
  Archive, 
  Users, 
  BookOpen, 
  History, 
  BarChart, 
  Database, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'POS', path: '/pos', icon: ShoppingCart },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Inventory', path: '/inventory', icon: Archive },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Utang', path: '/utang', icon: BookOpen },
  { name: 'Sales History', path: '/sales', icon: History },
  { name: 'Reports', path: '/reports', icon: BarChart },
  { name: 'Backup & Restore', path: '/backup', icon: Database },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-primary text-primary-foreground h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          Sari-Sari Store
        </h1>
        <p className="text-xs text-primary-foreground/70 mt-1">Inventory & Utang Manager</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-primary-foreground/10">
        <div className="text-xs text-primary-foreground/50 text-center">
          V1.0 - Offline Mode
        </div>
      </div>
    </aside>
  );
}
