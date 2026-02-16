import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Settings as SettingsIcon, Globe, Info, User } from 'lucide-react';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useApp();

  // User name state - persisted in localStorage
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || '';
  });

  // Save user name to localStorage
  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  const handleLanguageChange = (checked) => {
    const newLang = checked ? 'tr' : 'de';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-5 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      data-testid="settings-page"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-playfair text-2xl font-semibold text-stone-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#0F4C5C]" />
          {t('settings.title')}
        </h1>
      </motion.div>

      {/* User Name */}
      <motion.div variants={itemVariants}>
        <Card className="border-stone-200/60 shadow-premium rounded-2xl" data-testid="user-settings">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <User className="w-5 h-5 text-[#0F4C5C]" />
              {language === 'de' ? 'Mein Name' : 'Adim'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm text-stone-500">
                {language === 'de' ? 'Name / Familie' : 'Isim / Aile'}
              </Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={language === 'de' ? 'z.B. Familie Muller' : 'orn. Muller Ailesi'}
                className="rounded-xl"
                data-testid="user-name-input"
              />
              {userName && (
                <p className="text-sm text-[#0F4C5C] font-medium mt-2">
                  {userName}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language Settings */}
      <motion.div variants={itemVariants}>
        <Card className="border-stone-200/60 shadow-premium rounded-2xl" data-testid="language-settings">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Globe className="w-5 h-5 text-[#0F4C5C]" />
              {t('settings.language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-800">Deutsch / Turkce</p>
                <p className="text-sm text-stone-500">
                  {language === 'de' ? 'Aktuell: Deutsch' : 'Mevcut: Turkce'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${language === 'de' ? 'text-[#0F4C5C]' : 'text-stone-400'}`}>
                  DE
                </span>
                <Switch
                  checked={language === 'tr'}
                  onCheckedChange={handleLanguageChange}
                  className="data-[state=checked]:bg-[#0F4C5C]"
                  data-testid="language-switch"
                />
                <span className={`text-sm font-medium ${language === 'tr' ? 'text-[#0F4C5C]' : 'text-stone-400'}`}>
                  TR
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* About */}
      <motion.div variants={itemVariants}>
        <Card className="border-stone-200/60 shadow-premium rounded-2xl" data-testid="about-settings">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Info className="w-5 h-5 text-[#0F4C5C]" />
              {t('settings.about')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-stone-500">{t('settings.version')}</span>
                <span className="font-medium text-stone-800">1.1.0</span>
              </div>
              <div className="pt-2">
                <p className="text-sm text-stone-500">
                  {language === 'de'
                    ? 'Ramadan-Kalender hilft dir, deine Einladungen und Besuche wahrend des Ramadan zu organisieren.'
                    : 'Ramazan Takvimi, Ramazan ayinda davetlerinizi ve ziyaretlerinizi duzenlemenize yardimci olur.'}
                </p>
              </div>
              <div className="pt-2 border-t border-stone-100">
                <p className="text-sm text-[#0F4C5C] font-medium">
                  {language === 'de' ? 'Erstellt von' : 'Yapimci'}: Karasu AK58
                </p>
              </div>
              <div className="pt-1">
                <p className="text-xs text-stone-400">
                  {language === 'de'
                    ? 'Alle Daten werden lokal auf deinem Gerat gespeichert.'
                    : 'Tum veriler cihazinizda yerel olarak saklanir.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Settings;
