import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { cities } from '../i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Settings as SettingsIcon, Globe, MapPin, Info } from 'lucide-react';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { 
    language, 
    setLanguage, 
    selectedCity, 
    setSelectedCity, 
    selectedCountry, 
    setSelectedCountry 
  } = useApp();

  const handleLanguageChange = (checked) => {
    const newLang = checked ? 'tr' : 'de';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    const cityList = country === 'Germany' ? cities.germany : cities.turkey;
    setSelectedCity(cityList[0].name);
  };

  const currentCities = selectedCountry === 'Germany' ? cities.germany : cities.turkey;

  const getCityDisplayName = (city) => {
    return language === 'de' ? city.nameDE : city.nameTR;
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

      {/* Location Settings */}
      <motion.div variants={itemVariants}>
        <Card className="border-stone-200/60 shadow-premium rounded-2xl" data-testid="location-settings">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <MapPin className="w-5 h-5 text-[#0F4C5C]" />
              {t('settings.city')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Country Selection */}
            <div>
              <Label className="text-sm text-stone-500 mb-2 block">{t('settings.country')}</Label>
              <Select value={selectedCountry} onValueChange={handleCountryChange}>
                <SelectTrigger className="rounded-xl" data-testid="country-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Germany">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇩🇪</span>
                      {t('settings.germany')}
                    </div>
                  </SelectItem>
                  <SelectItem value="Turkey">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇹🇷</span>
                      {t('settings.turkey')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* City Selection */}
            <div>
              <Label className="text-sm text-stone-500 mb-2 block">{t('settings.selectCity')}</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="rounded-xl" data-testid="city-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {currentCities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {getCityDisplayName(city)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-stone-400">
              {language === 'de' 
                ? 'Die Gebetszeiten werden basierend auf deiner Stadtauswahl berechnet.' 
                : 'Namaz vakitleri sectiginiz sehre gore hesaplanir.'}
            </p>
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
                <span className="font-medium text-stone-800">1.0.0</span>
              </div>
              <div className="pt-2">
                <p className="text-sm text-stone-500">
                  {language === 'de' 
                    ? 'Fastenmonat-Kalender hilft dir, deine Einladungen und Besuche wahrend des Ramadan zu organisieren.' 
                    : 'Ramazan Takvimi, Ramazan ayinda davetlerinizi ve ziyaretlerinizi duzenlemenize yardimci olur.'}
                </p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-stone-400">
                  {language === 'de' 
                    ? 'Gebetszeiten werden von der Aladhan API bereitgestellt.' 
                    : 'Namaz vakitleri Aladhan API tarafindan saglaniyor.'}
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
