import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Users, MapPin, Calendar, Plus } from 'lucide-react';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { events, getEventsByDate, language } = useApp();

  // Get user name from localStorage
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || '';
  });

  // Listen for changes in localStorage (when updated from Settings)
  useEffect(() => {
    const handleStorageChange = () => {
      setUserName(localStorage.getItem('userName') || '');
    };
    window.addEventListener('storage', handleStorageChange);

    // Also check on focus (for same-tab updates)
    const checkUserName = () => {
      const stored = localStorage.getItem('userName') || '';
      if (stored !== userName) {
        setUserName(stored);
      }
    };
    window.addEventListener('focus', checkUserName);

    // Check periodically for same-tab updates
    const interval = setInterval(checkUserName, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkUserName);
      clearInterval(interval);
    };
  }, [userName]);

  const todayEvents = getEventsByDate(new Date());

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  const upcomingEvents = getUpcomingEvents();

  // Count statistics
  const hostingCount = events.filter(e => e.type === 'hosting').length;
  const invitedCount = events.filter(e => e.type === 'invited').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : 'tr-TR', options);
  };

  return (
    <motion.div
      className="space-y-5 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      data-testid="dashboard-page"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="relative h-44 rounded-2xl overflow-hidden shadow-premium"
      >
        <img
          src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=60"
          alt="Mosque silhouette"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F4C5C]/90 via-[#0F4C5C]/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="font-playfair text-3xl font-semibold">{t('dashboard.title')}</h1>
          {userName ? (
            <p className="text-white/90 text-sm mt-1 font-medium">{userName}</p>
          ) : (
            <p className="text-white/80 text-sm mt-1">
              {language === 'de' ? 'Deine Besuche & Einladungen' : 'Ziyaretlerin & Davetlerin'}
            </p>
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <Card className="bg-[#F0FDFA] border-[#0F766E]/20 shadow-sm rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-[#0F766E]">{hostingCount}</div>
            <div className="text-sm text-[#0F766E]/70 mt-1">
              {language === 'de' ? 'Besuche' : 'Ziyaretler'}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#FFFBEB] border-[#B45309]/20 shadow-sm rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-[#B45309]">{invitedCount}</div>
            <div className="text-sm text-[#B45309]/70 mt-1">
              {language === 'de' ? 'Einladungen' : 'Davetler'}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Events */}
      <motion.div variants={itemVariants}>
        <Card className="border-stone-200/60 shadow-premium rounded-2xl" data-testid="today-events-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-playfair text-lg text-stone-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#C6A87C]" />
              {t('dashboard.todayEvents')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-stone-400 mb-4">{t('dashboard.noEvents')}</p>
                <Link to="/calendar">
                  <Button className="bg-[#0F4C5C] hover:bg-[#0F4C5C]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    {language === 'de' ? 'Termin hinzufugen' : 'Etkinlik ekle'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-xl border-l-4 ${
                      event.type === 'hosting'
                        ? 'bg-[#F0FDFA] border-[#0F766E]'
                        : 'bg-[#FFFBEB] border-[#B45309]'
                    }`}
                    data-testid={`event-${event.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge
                          className={`text-xs font-medium ${
                            event.type === 'hosting'
                              ? 'bg-[#0F766E] hover:bg-[#0F766E]'
                              : 'bg-[#B45309] hover:bg-[#B45309]'
                          } text-white`}
                        >
                          {event.type === 'hosting' ? t('calendar.hosting') : t('calendar.invited')}
                        </Badge>
                        <h3 className={`font-medium mt-2 ${
                          event.type === 'hosting' ? 'text-[#115E59]' : 'text-[#92400E]'
                        }`}>{event.name}</h3>
                        {event.time && (
                          <p className={`text-sm mt-1 ${
                            event.type === 'hosting' ? 'text-[#115E59]/70' : 'text-[#92400E]/70'
                          }`}>
                            {event.time} Uhr
                          </p>
                        )}
                        {event.location && (
                          <p className={`text-sm flex items-center gap-1 mt-1 ${
                            event.type === 'hosting' ? 'text-[#115E59]/70' : 'text-[#92400E]/70'
                          }`}>
                            <MapPin className="w-3 h-3" /> {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Events */}
      <motion.div variants={itemVariants}>
        <Card className="border-stone-200/60 shadow-premium rounded-2xl" data-testid="upcoming-events-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="font-playfair text-lg text-stone-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0F4C5C]" />
              {language === 'de' ? 'Kommende Termine' : 'Yaklasan Etkinlikler'}
            </CardTitle>
            <Link to="/calendar">
              <Button variant="ghost" size="sm" className="text-[#0F4C5C]">
                {language === 'de' ? 'Alle' : 'Tumu'}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-stone-400 text-center py-4">
                {language === 'de' ? 'Keine kommenden Termine' : 'Yaklasan etkinlik yok'}
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl"
                  >
                    <div className={`w-2 h-10 rounded-full ${
                      event.type === 'hosting' ? 'bg-[#0F766E]' : 'bg-[#B45309]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 truncate">{event.name}</p>
                      <p className="text-sm text-stone-500">{formatDate(event.date)}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${
                        event.type === 'hosting'
                          ? 'border-[#0F766E] text-[#0F766E]'
                          : 'border-[#B45309] text-[#B45309]'
                      }`}
                    >
                      {event.type === 'hosting' ? t('calendar.hosting') : t('calendar.invited')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
