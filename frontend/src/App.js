import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppProvider } from './contexts/AppContext';
import { Toaster } from './components/ui/sonner';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar';
import ShoppingList from './pages/ShoppingList';
import Recipes from './pages/Recipes';
import Settings from './pages/Settings';
import { Home, Calendar, ShoppingCart, ChefHat, Settings as SettingsIcon } from 'lucide-react';
import './i18n/i18n';
import './App.css';

const Navigation = () => {
  const { t } = useTranslation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: t('nav.dashboard') },
    { path: '/calendar', icon: Calendar, label: t('nav.calendar') },
    { path: '/shopping', icon: ShoppingCart, label: t('nav.shopping') },
    { path: '/recipes', icon: ChefHat, label: t('nav.recipes') },
    { path: '/settings', icon: SettingsIcon, label: t('nav.settings') }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-stone-100 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.02)]" data-testid="main-navigation">
      <div className="max-w-md mx-auto md:max-w-lg relative">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'text-[#0F4C5C]'
                    : 'text-stone-400 hover:text-stone-600'
                }`
              }
              data-testid={`nav-${item.path.substring(1)}`}
            >
              <item.icon className="w-5 h-5" strokeWidth={1.75} />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-warm-sand">
          <Navigation />
          <main className="pt-4 pb-20 md:pt-20 md:pb-4 px-4 max-w-md mx-auto md:max-w-lg">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/shopping" element={<ShoppingList />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <Toaster position="top-center" richColors />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
