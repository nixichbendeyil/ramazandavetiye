import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Sun, Moon, Users, MapPin, Clock } from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  const { prayerTimes, prayerTimesLoading, selectedCity, getEventsByDate } = useApp();
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isBeforeIftar, setIsBeforeIftar] = useState(true);

  const todayEvents = getEventsByDate(new Date());

  // Calculate countdown to Iftar or Sahur
  useEffect(() => {
    if (!prayerTimes) return;

    const calculateCountdown = () => {
      const now = new Date();
      const [maghribHour, maghribMin] = prayerTimes.Maghrib.split(':').map(Number);
      const [fajrHour, fajrMin] = prayerTimes.Fajr.split(':').map(Number);

      let targetTime = new Date();
      targetTime.setHours(maghribHour, maghribMin, 0, 0);

      // If it's after Maghrib, countdown to next Fajr (Sahur)
      if (now > targetTime) {
        targetTime = new Date();
        targetTime.setDate(targetTime.getDate() + 1);
        targetTime.setHours(fajrHour, fajrMin, 0, 0);
        setIsBeforeIftar(false);
      } else {
        setIsBeforeIftar(true);
      }

      const diff = targetTime - now;
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ hours, minutes, seconds });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const prayerList = [
    { key: 'Fajr', icon: <Moon className="w-4 h-4" />, label: t('dashboard.fajr') },
    { key: 'Dhuhr', icon: <Sun className="w-4 h-4" />, label: t('dashboard.dhuhr') },
    { key: 'Asr', icon: <Sun className="w-4 h-4" />, label: t('dashboard.asr') },
    { key: 'Maghrib', icon: <Moon className="w-4 h-4" />, label: t('dashboard.maghrib') },
    { key: 'Isha', icon: <Moon className="w-4 h-4" />, label: t('dashboard.isha') }
  ];

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

  return (
    <motion.div
      className="space-y-6 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      data-testid="dashboard-page"
    >
      {/* Header with hero image */}
      <motion.div 
        variants={itemVariants}
        className="relative h-48 rounded-2xl overflow-hidden"
      >
        <img 
          src="https://images.unsplash.com/photo-1759888107439-2b62433ef18b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwzfHxibHVlJTIwbW9zcXVlJTIwaXN0YW5idWwlMjBzdW5zZXQlMjBzaWxob3VldHRlfGVufDB8fHx8MTc3MTIyMDE3MHww&ixlib=rb-4.1.0&q=85"
          alt="Mosque at sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="font-playfair text-3xl font-bold">{t('dashboard.title')}</h1>
          <div className="flex items-center gap-2 mt-1 text-white/80">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{selectedCity}</span>
          </div>
        </div>
      </motion.div>

      {/* Countdown Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-emerald-700 text-white border-0 shadow-lg" data-testid="countdown-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-emerald-100">
              {isBeforeIftar ? t('dashboard.timeToIftar') : t('dashboard.timeToSahur')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-6" data-testid="countdown-display">
              <div className="text-center">
                <div className="text-5xl font-bold tabular-nums">{String(countdown.hours).padStart(2, '0')}</div>
                <div className="text-sm text-emerald-200 mt-1">{t('dashboard.hours')}</div>
              </div>
              <div className="text-5xl font-bold">:</div>
              <div className="text-center">
                <div className="text-5xl font-bold tabular-nums">{String(countdown.minutes).padStart(2, '0')}</div>
                <div className="text-sm text-emerald-200 mt-1">{t('dashboard.minutes')}</div>
              </div>
              <div className="text-5xl font-bold">:</div>
              <div className="text-center">
                <div className="text-5xl font-bold tabular-nums">{String(countdown.seconds).padStart(2, '0')}</div>
                <div className="text-sm text-emerald-200 mt-1">{t('dashboard.seconds')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Prayer Times */}
      <motion.div variants={itemVariants}>
        <Card className="border-stone-200" data-testid="prayer-times-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-playfair text-xl text-stone-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              {t('dashboard.prayerTimes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prayerTimesLoading ? (
              <div className="text-center py-4 text-stone-500">{t('common.loading')}</div>
            ) : prayerTimes ? (
              <div className="grid grid-cols-5 gap-2">
                {prayerList.map((prayer) => (
                  <div 
                    key={prayer.key}
                    className="text-center p-3 bg-stone-50 rounded-xl"
                    data-testid={`prayer-${prayer.key.toLowerCase()}`}
                  >
                    <div className="flex justify-center mb-2 text-emerald-600">
                      {prayer.icon}
                    </div>
                    <div className="text-xs text-stone-500 mb-1">{prayer.label}</div>
                    <div className="font-semibold text-stone-800 tabular-nums">
                      {prayerTimes[prayer.key]}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-stone-500">{t('common.error')}</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Events */}
      <motion.div variants={itemVariants}>
        <Card className="border-stone-200" data-testid="today-events-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-playfair text-xl text-stone-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              {t('dashboard.todayEvents')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <p className="text-stone-500 text-center py-4">{t('dashboard.noEvents')}</p>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div 
                    key={event.id}
                    className={`p-4 rounded-xl ${
                      event.type === 'hosting' 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'bg-amber-50 border border-amber-200'
                    }`}
                    data-testid={`event-${event.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge 
                          variant="secondary"
                          className={event.type === 'hosting' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-amber-600 text-white'
                          }
                        >
                          {event.type === 'hosting' ? t('calendar.hosting') : t('calendar.invited')}
                        </Badge>
                        <h3 className="font-semibold text-stone-800 mt-2">{event.name}</h3>
                        {event.location && (
                          <p className="text-sm text-stone-500 flex items-center gap-1 mt-1">
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
    </motion.div>
  );
};

export default Dashboard;
