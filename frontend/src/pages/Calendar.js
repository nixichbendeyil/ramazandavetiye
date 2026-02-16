import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Users, MapPin, Trash2, Edit2, ChevronLeft, ChevronRight, Share2, Clock, Check, UserPlus, UserCheck, UserX, X } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isSameMonth } from 'date-fns';
import { de, tr } from 'date-fns/locale';

const CalendarPage = () => {
  const { t } = useTranslation();
  const { language, events, addEvent, updateEvent, deleteEvent, getEventsByDate } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  const [newGuestName, setNewGuestName] = useState('');
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: 'hosting',
    location: '',
    address: '',
    time: '18:00',
    notes: '',
    menu: [],
    guests: []
  });

  const locale = language === 'de' ? de : tr;
  const selectedDateEvents = getEventsByDate(selectedDate);

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const startDay = getDay(start);
    const paddingStart = startDay === 0 ? 6 : startDay - 1;
    const prevMonthDays = [];
    for (let i = paddingStart - 1; i >= 0; i--) {
      prevMonthDays.push(addDays(start, -(i + 1)));
    }
    
    const totalDays = prevMonthDays.length + days.length;
    const paddingEnd = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
    const nextMonthDays = [];
    for (let i = 1; i <= paddingEnd; i++) {
      nextMonthDays.push(addDays(end, i));
    }
    
    return [...prevMonthDays, ...days, ...nextMonthDays];
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const weekEvents = weekDays.flatMap(day => 
    getEventsForDay(day).map(event => ({ ...event, dayDate: day }))
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleAddEvent = () => {
    if (!newEvent.name.trim()) return;
    addEvent({
      ...newEvent,
      date: selectedDate.toISOString().split('T')[0]
    });
    setNewEvent({ name: '', type: 'hosting', location: '', address: '', time: '18:00', notes: '', menu: [], guests: [] });
    setNewGuestName('');
    setIsAddDialogOpen(false);
  };

  const handleEditEvent = () => {
    if (!editingEvent || !editingEvent.name.trim()) return;
    updateEvent(editingEvent.id, editingEvent);
    setEditingEvent(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteEvent = (id) => {
    deleteEvent(id);
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (event) => {
    setEditingEvent({ ...event });
    setIsEditDialogOpen(true);
  };

  // Share event function
  const handleShareEvent = async (event) => {
    const eventDate = new Date(event.date);
    const formattedDate = format(eventDate, 'EEEE, d. MMMM yyyy', { locale });
    
    const shareText = event.type === 'hosting' 
      ? t('calendar.shareHostText')
      : t('calendar.shareInviteText');
    
    let message = `🌙 ${t('calendar.shareTitle')}\n\n`;
    message += `${shareText}\n\n`;
    message += `📅 ${t('calendar.shareDate')}: ${formattedDate}\n`;
    
    if (event.time) {
      message += `🕐 ${t('calendar.shareTime')}: ${event.time} Uhr\n`;
    }
    
    if (event.address) {
      message += `📍 ${t('calendar.shareAddress')}: ${event.address}\n`;
    } else if (event.location) {
      message += `📍 ${t('calendar.location')}: ${event.location}\n`;
    }
    
    if (event.notes) {
      message += `\n📝 ${event.notes}`;
    }

    // Check if Web Share API is available (mainly mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('calendar.shareTitle'),
          text: message
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          copyToClipboard(message);
        }
      }
    } else {
      // Fallback for desktop browsers
      copyToClipboard(message);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareMessage(t('calendar.shareCopied'));
      setTimeout(() => setShareMessage(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Guest management functions
  const addGuestToNewEvent = () => {
    if (!newGuestName.trim()) return;
    setNewEvent(prev => ({
      ...prev,
      guests: [...(prev.guests || []), { id: Date.now().toString(), name: newGuestName.trim(), status: 'pending' }]
    }));
    setNewGuestName('');
  };

  const removeGuestFromNewEvent = (guestId) => {
    setNewEvent(prev => ({
      ...prev,
      guests: (prev.guests || []).filter(g => g.id !== guestId)
    }));
  };

  const addGuestToEditingEvent = () => {
    if (!newGuestName.trim() || !editingEvent) return;
    setEditingEvent(prev => ({
      ...prev,
      guests: [...(prev.guests || []), { id: Date.now().toString(), name: newGuestName.trim(), status: 'pending' }]
    }));
    setNewGuestName('');
  };

  const removeGuestFromEditingEvent = (guestId) => {
    if (!editingEvent) return;
    setEditingEvent(prev => ({
      ...prev,
      guests: (prev.guests || []).filter(g => g.id !== guestId)
    }));
  };

  const updateGuestStatus = (guestId, status) => {
    if (!editingEvent) return;
    setEditingEvent(prev => ({
      ...prev,
      guests: (prev.guests || []).map(g => g.id === guestId ? { ...g, status } : g)
    }));
  };

  const getGuestStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'declined': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  const getGuestStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <UserCheck className="w-3 h-3" />;
      case 'declined': return <UserX className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const calendarDays = generateCalendarDays();
  const weekDayNames = language === 'de' 
    ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    : ['Pt', 'Sa', 'Ca', 'Pe', 'Cu', 'Ct', 'Pa'];

  return (
    <motion.div
      className="space-y-5 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-testid="calendar-page"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-semibold text-stone-900">
          {t('calendar.title')}
        </h1>
        <div className="flex bg-stone-100 p-1 rounded-full">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
              viewMode === 'month' 
                ? 'bg-[#0F4C5C] text-white shadow-sm' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
            data-testid="month-view-btn"
          >
            {t('calendar.monthView')}
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
              viewMode === 'week' 
                ? 'bg-[#0F4C5C] text-white shadow-sm' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
            data-testid="week-view-btn"
          >
            {t('calendar.weekView')}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Month View */}
        {viewMode === 'month' && (
          <motion.div
            key="month"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-5"
          >
            <Card className="border-stone-200/60 shadow-premium rounded-2xl" data-testid="month-calendar">
              <CardContent className="p-5">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-5">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                    data-testid="prev-month-btn"
                  >
                    <ChevronLeft className="w-5 h-5 text-stone-500" />
                  </button>
                  <h2 className="font-playfair text-lg font-medium text-stone-800">
                    {format(currentMonth, 'MMMM yyyy', { locale })}
                  </h2>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                    data-testid="next-month-btn"
                  >
                    <ChevronRight className="w-5 h-5 text-stone-500" />
                  </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-stone-400 py-2 uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const hasHosting = dayEvents.some(e => e.type === 'hosting');
                    const hasInvited = dayEvents.some(e => e.type === 'invited');

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all
                          ${isSelected 
                            ? 'bg-[#0F4C5C] text-white shadow-md' 
                            : isToday 
                              ? 'bg-[#0F4C5C]/10 text-[#0F4C5C] font-semibold'
                              : isCurrentMonth
                                ? 'hover:bg-stone-100 text-stone-700'
                                : 'text-stone-300'
                          }
                        `}
                        data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                      >
                        <span className="text-sm">{format(day, 'd')}</span>
                        {/* Event Dots */}
                        {dayEvents.length > 0 && isCurrentMonth && (
                          <div className="flex gap-1 mt-0.5">
                            {hasHosting && (
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-teal-300' : 'bg-[#0F766E]'}`} />
                            )}
                            {hasInvited && (
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-[#B45309]'}`} />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-8 mt-5 pt-4 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                    <span className="text-xs text-stone-500 font-medium">{t('calendar.hosting')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
                    <span className="text-xs text-stone-500 font-medium">{t('calendar.invited')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Events */}
            <Card className="border-stone-200/60 shadow-premium rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-stone-800">
                    {format(selectedDate, 'EEEE, d. MMMM', { locale })}
                  </h3>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-[#0F4C5C] hover:bg-[#0D3D4A] h-9 px-4 rounded-full shadow-sm" data-testid="add-event-btn">
                        <Plus className="w-4 h-4 mr-1.5" />
                        {t('calendar.addEvent')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto" data-testid="add-event-dialog">
                      <DialogHeader>
                        <DialogTitle className="font-playfair text-xl">{t('calendar.addEvent')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4 pb-4">
                        <div>
                          <Label className="text-stone-600">{t('calendar.guestName')}</Label>
                          <Input
                            value={newEvent.name}
                            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                            placeholder="z.B. Familie Yilmaz"
                            className="mt-1.5 rounded-xl"
                            data-testid="event-name-input"
                          />
                        </div>
                        <div>
                          <Label className="text-stone-600">{t('calendar.eventType')}</Label>
                          <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                            <SelectTrigger className="mt-1.5 rounded-xl" data-testid="event-type-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hosting">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                                  {t('calendar.hosting')}
                                </div>
                              </SelectItem>
                              <SelectItem value="invited">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
                                  {t('calendar.invited')}
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-stone-600">{t('calendar.time')}</Label>
                            <Input
                              type="time"
                              value={newEvent.time}
                              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                              className="mt-1.5 rounded-xl"
                              data-testid="event-time-input"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-600">{t('calendar.location')}</Label>
                            <Input
                              value={newEvent.location}
                              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                              placeholder={t('calendar.location')}
                              className="mt-1.5 rounded-xl"
                              data-testid="event-location-input"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-stone-600">{t('calendar.address')}</Label>
                          <Input
                            value={newEvent.address}
                            onChange={(e) => setNewEvent({ ...newEvent, address: e.target.value })}
                            placeholder="z.B. Musterstraße 123, 12345 Berlin"
                            className="mt-1.5 rounded-xl"
                            data-testid="event-address-input"
                          />
                        </div>
                        {/* Guest List Section - For both event types */}
                        <div>
                          <Label className="text-stone-600">
                            {newEvent.type === 'hosting' ? t('calendar.guests') : t('calendar.companions')}
                          </Label>
                          <div className="mt-1.5 flex gap-2">
                            <Input
                              value={newGuestName}
                              onChange={(e) => setNewGuestName(e.target.value)}
                              placeholder={newEvent.type === 'hosting' ? t('calendar.guestNamePlaceholder') : t('calendar.companionPlaceholder')}
                              className="rounded-xl flex-1"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGuestToNewEvent())}
                              data-testid="new-guest-input"
                            />
                            <Button
                              type="button"
                              onClick={addGuestToNewEvent}
                              size="icon"
                              className="bg-[#0F4C5C] hover:bg-[#0D3D4A] rounded-xl h-10 w-10"
                              data-testid="add-guest-btn"
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </div>
                          {/* Guest List */}
                          {newEvent.guests && newEvent.guests.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              {newEvent.guests.map((guest) => (
                                <div key={guest.id} className="flex items-center justify-between bg-stone-50 px-3 py-2 rounded-lg">
                                  <span className="text-sm text-stone-700">{guest.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeGuestFromNewEvent(guest.id)}
                                    className="text-stone-400 hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-stone-400 mt-2">
                              {newEvent.type === 'hosting' ? t('calendar.noGuests') : t('calendar.noCompanions')}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-stone-600">{t('calendar.notes')}</Label>
                          <Textarea
                            value={newEvent.notes}
                            onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                            placeholder={t('calendar.notes')}
                            className="mt-1.5 rounded-xl resize-none"
                            data-testid="event-notes-input"
                          />
                        </div>
                        <Button onClick={handleAddEvent} className="w-full bg-[#0F4C5C] hover:bg-[#0D3D4A] rounded-full h-11" data-testid="save-event-btn">
                          {t('calendar.save')}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {selectedDateEvents.length === 0 ? (
                  <p className="text-stone-400 text-center py-8 text-sm">{t('calendar.noEvents')}</p>
                ) : (
                  <div className="space-y-3">
                    {/* Share copied message */}
                    {shareMessage && (
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        {shareMessage}
                      </div>
                    )}
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-xl border-l-4 transition-all hover:shadow-sm ${
                          event.type === 'hosting'
                            ? 'bg-[#F0FDFA] border-[#0F766E]'
                            : 'bg-[#FFFBEB] border-[#B45309]'
                        }`}
                        data-testid={`calendar-event-${event.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <Badge className={`text-xs font-medium ${
                              event.type === 'hosting' 
                                ? 'bg-[#0F766E] hover:bg-[#0F766E]' 
                                : 'bg-[#B45309] hover:bg-[#B45309]'
                            } text-white`}>
                              {event.type === 'hosting' ? t('calendar.hosting') : t('calendar.invited')}
                            </Badge>
                            <h4 className={`font-medium mt-2 flex items-center gap-1.5 ${
                              event.type === 'hosting' ? 'text-[#115E59]' : 'text-[#92400E]'
                            }`}>
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{event.name}</span>
                            </h4>
                            {event.time && (
                              <p className={`text-xs flex items-center gap-1 mt-1 ${
                                event.type === 'hosting' ? 'text-[#115E59]/70' : 'text-[#92400E]/70'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {event.time} Uhr
                              </p>
                            )}
                            {(event.address || event.location) && (
                              <p className={`text-xs flex items-center gap-1 mt-1 ${
                                event.type === 'hosting' ? 'text-[#115E59]/70' : 'text-[#92400E]/70'
                              }`}>
                                <MapPin className="w-3 h-3" />
                                {event.address || event.location}
                              </p>
                            )}
                            {/* Guest/Companion count for all events */}
                            {event.guests && event.guests.length > 0 && (
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                  event.type === 'hosting' 
                                    ? 'bg-[#115E59]/10 text-[#115E59]' 
                                    : 'bg-[#92400E]/10 text-[#92400E]'
                                }`}>
                                  <Users className="w-3 h-3" />
                                  <span>{event.guests.length} {event.type === 'hosting' ? t('calendar.guestCount') : t('calendar.companions')}</span>
                                </div>
                                {event.type === 'hosting' && event.guests.filter(g => g.status === 'accepted').length > 0 && (
                                  <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    <UserCheck className="w-3 h-3" />
                                    <span>{event.guests.filter(g => g.status === 'accepted').length}</span>
                                  </div>
                                )}
                                {event.type === 'hosting' && event.guests.filter(g => g.status === 'declined').length > 0 && (
                                  <div className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                    <UserX className="w-3 h-3" />
                                    <span>{event.guests.filter(g => g.status === 'declined').length}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleShareEvent(event)}
                              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                              data-testid={`share-event-${event.id}`}
                            >
                              <Share2 className="w-4 h-4 text-[#0F4C5C]" />
                            </button>
                            <button
                              onClick={() => openEditDialog(event)}
                              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                              data-testid={`edit-event-${event.id}`}
                            >
                              <Edit2 className="w-4 h-4 text-stone-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <motion.div
            key="week"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Horizontal Date Strip */}
            <Card className="border-stone-200/60 shadow-premium rounded-2xl">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  {weekDays.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    const dayEvents = getEventsForDay(day);
                    const hasHosting = dayEvents.some(e => e.type === 'hosting');
                    const hasInvited = dayEvents.some(e => e.type === 'invited');

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`flex flex-col items-center py-2 px-2.5 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-[#0F4C5C] text-white shadow-md'
                            : isToday
                              ? 'bg-[#0F4C5C]/10 text-[#0F4C5C]'
                              : 'hover:bg-stone-100'
                        }`}
                        data-testid={`week-day-${format(day, 'yyyy-MM-dd')}`}
                      >
                        <span className="text-xs opacity-70 uppercase tracking-wider">{format(day, 'EEE', { locale })}</span>
                        <span className="text-lg font-semibold mt-0.5">{format(day, 'd')}</span>
                        <div className="flex gap-1 mt-1 h-2">
                          {hasHosting && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-teal-300' : 'bg-[#0F766E]'}`} />}
                          {hasInvited && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-[#B45309]'}`} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Add Event Button */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-[#0F4C5C] hover:bg-[#0D3D4A] rounded-full h-11 shadow-sm" data-testid="add-event-btn-week">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('calendar.addEvent')} - {format(selectedDate, 'd. MMM', { locale })}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-playfair text-xl">{t('calendar.addEvent')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label className="text-stone-600">{t('calendar.guestName')}</Label>
                    <Input
                      value={newEvent.name}
                      onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                      placeholder="z.B. Familie Yilmaz"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-stone-600">{t('calendar.eventType')}</Label>
                    <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                      <SelectTrigger className="mt-1.5 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hosting">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                            {t('calendar.hosting')}
                          </div>
                        </SelectItem>
                        <SelectItem value="invited">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
                            {t('calendar.invited')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-stone-600">{t('calendar.time')}</Label>
                      <Input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="mt-1.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-stone-600">{t('calendar.location')}</Label>
                      <Input
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder={t('calendar.location')}
                        className="mt-1.5 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-stone-600">{t('calendar.address')}</Label>
                    <Input
                      value={newEvent.address}
                      onChange={(e) => setNewEvent({ ...newEvent, address: e.target.value })}
                      placeholder="z.B. Musterstraße 123, 12345 Berlin"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-stone-600">{t('calendar.notes')}</Label>
                    <Textarea
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                      placeholder={t('calendar.notes')}
                      className="mt-1.5 rounded-xl resize-none"
                    />
                  </div>
                  <Button onClick={handleAddEvent} className="w-full bg-[#0F4C5C] hover:bg-[#0D3D4A] rounded-full h-11">
                    {t('calendar.save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Vertical Agenda List */}
            <div className="space-y-3">
              {weekEvents.length === 0 ? (
                <Card className="border-stone-200/60 rounded-2xl">
                  <CardContent className="py-10">
                    <p className="text-stone-400 text-center text-sm">{t('calendar.noEvents')}</p>
                  </CardContent>
                </Card>
              ) : (
                weekEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border-l-4 bg-white shadow-premium ${
                      event.type === 'hosting'
                        ? 'border-[#0F766E]'
                        : 'border-[#B45309]'
                    }`}
                    data-testid={`week-event-${event.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-shrink-0 text-center min-w-[48px]">
                        <div className="text-xs text-stone-400 uppercase tracking-wider">{format(event.dayDate, 'EEE', { locale })}</div>
                        <div className="text-xl font-semibold text-stone-800">{format(event.dayDate, 'd')}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge className={`text-xs font-medium ${
                          event.type === 'hosting' 
                            ? 'bg-[#0F766E] hover:bg-[#0F766E]' 
                            : 'bg-[#B45309] hover:bg-[#B45309]'
                        } text-white`}>
                          {event.type === 'hosting' ? t('calendar.hosting') : t('calendar.invited')}
                        </Badge>
                        <h4 className="font-medium text-stone-800 mt-1.5 truncate">{event.name}</h4>
                        {event.location && (
                          <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => openEditDialog(event)}
                        className="p-2 hover:bg-stone-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Edit2 className="w-4 h-4 text-stone-400" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl" data-testid="edit-event-dialog">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl">{t('calendar.edit')}</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <div className="space-y-4 pt-4">
              <div>
                <Label className="text-stone-600">{t('calendar.guestName')}</Label>
                <Input
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  className="mt-1.5 rounded-xl"
                  data-testid="edit-event-name-input"
                />
              </div>
              <div>
                <Label className="text-stone-600">{t('calendar.eventType')}</Label>
                <Select value={editingEvent.type} onValueChange={(value) => setEditingEvent({ ...editingEvent, type: value })}>
                  <SelectTrigger className="mt-1.5 rounded-xl" data-testid="edit-event-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hosting">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                        {t('calendar.hosting')}
                      </div>
                    </SelectItem>
                    <SelectItem value="invited">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
                        {t('calendar.invited')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-stone-600">{t('calendar.time')}</Label>
                  <Input
                    type="time"
                    value={editingEvent.time || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="mt-1.5 rounded-xl"
                    data-testid="edit-event-time-input"
                  />
                </div>
                <div>
                  <Label className="text-stone-600">{t('calendar.location')}</Label>
                  <Input
                    value={editingEvent.location || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="mt-1.5 rounded-xl"
                    data-testid="edit-event-location-input"
                  />
                </div>
              </div>
              <div>
                <Label className="text-stone-600">{t('calendar.address')}</Label>
                <Input
                  value={editingEvent.address || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, address: e.target.value })}
                  placeholder="z.B. Musterstraße 123, 12345 Berlin"
                  className="mt-1.5 rounded-xl"
                  data-testid="edit-event-address-input"
                />
              </div>
              {/* Guest List Section with Status Management - For both event types */}
              <div>
                <Label className="text-stone-600">
                  {editingEvent.type === 'hosting' ? t('calendar.guests') : t('calendar.companions')}
                </Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder={editingEvent.type === 'hosting' ? t('calendar.guestNamePlaceholder') : t('calendar.companionPlaceholder')}
                    className="rounded-xl flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGuestToEditingEvent())}
                    data-testid="edit-guest-input"
                  />
                  <Button
                    type="button"
                    onClick={addGuestToEditingEvent}
                    size="icon"
                    className="bg-[#0F4C5C] hover:bg-[#0D3D4A] rounded-xl h-10 w-10"
                    data-testid="edit-add-guest-btn"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
                {/* Guest List with Status */}
                {editingEvent.guests && editingEvent.guests.length > 0 ? (
                  <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                    {editingEvent.guests.map((guest) => (
                      <div key={guest.id} className="flex items-center justify-between bg-stone-50 px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-stone-700">{guest.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Status buttons - only for hosting events */}
                          {editingEvent.type === 'hosting' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateGuestStatus(guest.id, 'pending')}
                                className={`p-1.5 rounded-md transition-colors ${guest.status === 'pending' ? 'bg-stone-200' : 'hover:bg-stone-100'}`}
                                title={t('calendar.pending')}
                              >
                                <Users className={`w-3.5 h-3.5 ${guest.status === 'pending' ? 'text-stone-700' : 'text-stone-400'}`} />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateGuestStatus(guest.id, 'accepted')}
                                className={`p-1.5 rounded-md transition-colors ${guest.status === 'accepted' ? 'bg-green-100' : 'hover:bg-stone-100'}`}
                                title={t('calendar.accepted')}
                              >
                                <UserCheck className={`w-3.5 h-3.5 ${guest.status === 'accepted' ? 'text-green-600' : 'text-stone-400'}`} />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateGuestStatus(guest.id, 'declined')}
                                className={`p-1.5 rounded-md transition-colors ${guest.status === 'declined' ? 'bg-red-100' : 'hover:bg-stone-100'}`}
                                title={t('calendar.declined')}
                              >
                                <UserX className={`w-3.5 h-3.5 ${guest.status === 'declined' ? 'text-red-600' : 'text-stone-400'}`} />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => removeGuestFromEditingEvent(guest.id)}
                            className="p-1.5 hover:bg-red-50 rounded-md transition-colors ml-1"
                          >
                            <X className="w-3.5 h-3.5 text-stone-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 mt-2">
                    {editingEvent.type === 'hosting' ? t('calendar.noGuests') : t('calendar.noCompanions')}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-stone-600">{t('calendar.notes')}</Label>
                <Textarea
                  value={editingEvent.notes}
                  onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value })}
                  className="mt-1.5 rounded-xl resize-none"
                  data-testid="edit-event-notes-input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleDeleteEvent(editingEvent.id)}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-full"
                  data-testid="delete-event-btn"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  {t('calendar.delete')}
                </Button>
                <Button
                  onClick={handleEditEvent}
                  className="flex-1 bg-[#0F4C5C] hover:bg-[#0D3D4A] rounded-full"
                  data-testid="update-event-btn"
                >
                  {t('calendar.save')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CalendarPage;
