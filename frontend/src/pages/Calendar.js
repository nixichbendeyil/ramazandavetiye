import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Calendar as CalendarIcon, Users, MapPin, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: 'hosting',
    location: '',
    notes: '',
    menu: []
  });

  const locale = language === 'de' ? de : tr;
  const selectedDateEvents = getEventsByDate(selectedDate);

  // Get events for a specific date
  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding days from previous month
    const startDay = getDay(start);
    const paddingStart = startDay === 0 ? 6 : startDay - 1; // Monday = 0
    const prevMonthDays = [];
    for (let i = paddingStart - 1; i >= 0; i--) {
      prevMonthDays.push(addDays(start, -(i + 1)));
    }
    
    // Add padding days from next month
    const totalDays = prevMonthDays.length + days.length;
    const paddingEnd = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
    const nextMonthDays = [];
    for (let i = 1; i <= paddingEnd; i++) {
      nextMonthDays.push(addDays(end, i));
    }
    
    return [...prevMonthDays, ...days, ...nextMonthDays];
  };

  // Week view dates
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleAddEvent = () => {
    if (!newEvent.name.trim()) return;
    
    addEvent({
      ...newEvent,
      date: selectedDate.toISOString().split('T')[0]
    });
    
    setNewEvent({ name: '', type: 'hosting', location: '', notes: '', menu: [] });
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

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const calendarDays = generateCalendarDays();
  const weekDayNames = language === 'de' 
    ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    : ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-6 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      data-testid="calendar-page"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-stone-800">
          {t('calendar.title')}
        </h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
            className={viewMode === 'month' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            data-testid="month-view-btn"
          >
            {t('calendar.monthView')}
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
            className={viewMode === 'week' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            data-testid="week-view-btn"
          >
            {t('calendar.weekView')}
          </Button>
        </div>
      </motion.div>

      {/* Main Content - Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View - Takes 2 columns on desktop */}
        <div className="lg:col-span-2">
          {/* Month View */}
          {viewMode === 'month' && (
            <motion.div 
              variants={itemVariants}
              key="month-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-stone-200" data-testid="month-calendar">
                <CardContent className="p-6">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateMonth('prev')}
                      className="hover:bg-stone-100"
                      data-testid="prev-month-btn"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="font-playfair text-xl font-semibold text-stone-800">
                      {format(currentMonth, 'MMMM yyyy', { locale })}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateMonth('next')}
                      className="hover:bg-stone-100"
                      data-testid="next-month-btn"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDayNames.map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-stone-500 py-2"
                      >
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
                            relative min-h-[80px] p-2 rounded-xl text-left transition-all
                            ${isSelected 
                              ? 'bg-emerald-600 text-white shadow-lg' 
                              : isToday 
                                ? 'bg-emerald-100 text-emerald-800'
                                : hasHosting
                                  ? 'bg-emerald-50 hover:bg-emerald-100'
                                  : hasInvited
                                    ? 'bg-amber-50 hover:bg-amber-100'
                                    : isCurrentMonth
                                      ? 'hover:bg-stone-100 text-stone-800'
                                      : 'text-stone-300 hover:bg-stone-50'
                            }
                          `}
                          data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                        >
                          <span className={`text-sm font-medium ${!isCurrentMonth && !isSelected ? 'opacity-40' : ''}`}>
                            {format(day, 'd')}
                          </span>
                          {dayEvents.length > 0 && isCurrentMonth && (
                            <div className="mt-1 space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={`
                                    text-xs truncate px-1.5 py-0.5 rounded
                                    ${isSelected 
                                      ? 'bg-white/20 text-white' 
                                      : event.type === 'hosting' 
                                        ? 'bg-emerald-200 text-emerald-800' 
                                        : 'bg-amber-200 text-amber-800'
                                    }
                                  `}
                                >
                                  {event.name}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-stone-500'}`}>
                                  +{dayEvents.length - 2} {language === 'de' ? 'mehr' : 'daha'}
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Week View */}
          {viewMode === 'week' && (
            <motion.div 
              variants={itemVariants}
              key="week-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-stone-200" data-testid="week-calendar">
                <CardContent className="p-6">
                  <div className="grid grid-cols-7 gap-3">
                    {weekDays.map((day) => {
                      const dayEvents = getEventsForDay(day);
                      const isSelected = isSameDay(day, selectedDate);
                      const isToday = isSameDay(day, new Date());

                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={`p-4 rounded-xl text-center transition-all min-h-[200px] flex flex-col ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-lg'
                              : isToday
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'hover:bg-stone-100 border border-stone-200'
                          }`}
                          data-testid={`week-day-${format(day, 'yyyy-MM-dd')}`}
                        >
                          <div className="text-xs opacity-70 mb-1">
                            {format(day, 'EEE', { locale })}
                          </div>
                          <div className="text-2xl font-semibold mb-3">
                            {format(day, 'd')}
                          </div>
                          <div className="flex-1 space-y-2">
                            {dayEvents.map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs p-2 rounded-lg text-left ${
                                  isSelected
                                    ? 'bg-white/20'
                                    : event.type === 'hosting'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                <div className="font-medium truncate">{event.name}</div>
                                {event.location && (
                                  <div className="truncate opacity-70 mt-0.5">{event.location}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Selected Date Events - Right Sidebar */}
        <div className="lg:col-span-1">
          <motion.div variants={itemVariants}>
            <Card className="border-stone-200 sticky top-24" data-testid="selected-date-events">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-playfair text-lg text-stone-800 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-emerald-600" />
                    <span className="truncate">{format(selectedDate, 'PPP', { locale })}</span>
                  </CardTitle>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
                      data-testid="add-event-btn"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {t('calendar.addEvent')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="add-event-dialog">
                    <DialogHeader>
                      <DialogTitle className="font-playfair">{t('calendar.addEvent')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>{t('calendar.guestName')}</Label>
                        <Input
                          value={newEvent.name}
                          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                          placeholder="z.B. Familie Yilmaz"
                          data-testid="event-name-input"
                        />
                      </div>
                      <div>
                        <Label>{t('calendar.eventType')}</Label>
                        <Select
                          value={newEvent.type}
                          onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                        >
                          <SelectTrigger data-testid="event-type-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hosting">{t('calendar.hosting')}</SelectItem>
                            <SelectItem value="invited">{t('calendar.invited')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('calendar.location')}</Label>
                        <Input
                          value={newEvent.location}
                          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                          placeholder={t('calendar.location')}
                          data-testid="event-location-input"
                        />
                      </div>
                      <div>
                        <Label>{t('calendar.notes')}</Label>
                        <Textarea
                          value={newEvent.notes}
                          onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                          placeholder={t('calendar.notes')}
                          data-testid="event-notes-input"
                        />
                      </div>
                      <Button
                        onClick={handleAddEvent}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        data-testid="save-event-btn"
                      >
                        {t('calendar.save')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length === 0 ? (
                  <p className="text-stone-500 text-center py-6">{t('calendar.noEvents')}</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-xl border ${
                          event.type === 'hosting'
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-amber-50 border-amber-200'
                        }`}
                        data-testid={`calendar-event-${event.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <Badge
                              className={
                                event.type === 'hosting'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-600 text-white'
                              }
                            >
                              {event.type === 'hosting' ? t('calendar.hosting') : t('calendar.invited')}
                            </Badge>
                            <h3 className="font-semibold text-stone-800 mt-2 flex items-center gap-2">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{event.name}</span>
                            </h3>
                            {event.location && (
                              <p className="text-sm text-stone-600 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </p>
                            )}
                            {event.notes && (
                              <p className="text-sm text-stone-500 mt-2 line-clamp-2">{event.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(event)}
                            className="flex-shrink-0"
                            data-testid={`edit-event-${event.id}`}
                          >
                            <Edit2 className="w-4 h-4 text-stone-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent data-testid="edit-event-dialog">
          <DialogHeader>
            <DialogTitle className="font-playfair">{t('calendar.edit')}</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <div className="space-y-4 pt-4">
              <div>
                <Label>{t('calendar.guestName')}</Label>
                <Input
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  data-testid="edit-event-name-input"
                />
              </div>
              <div>
                <Label>{t('calendar.eventType')}</Label>
                <Select
                  value={editingEvent.type}
                  onValueChange={(value) => setEditingEvent({ ...editingEvent, type: value })}
                >
                  <SelectTrigger data-testid="edit-event-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hosting">{t('calendar.hosting')}</SelectItem>
                    <SelectItem value="invited">{t('calendar.invited')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('calendar.location')}</Label>
                <Input
                  value={editingEvent.location}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  data-testid="edit-event-location-input"
                />
              </div>
              <div>
                <Label>{t('calendar.notes')}</Label>
                <Textarea
                  value={editingEvent.notes}
                  onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value })}
                  data-testid="edit-event-notes-input"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteEvent(editingEvent.id)}
                  className="flex-1"
                  data-testid="delete-event-btn"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {t('calendar.delete')}
                </Button>
                <Button
                  onClick={handleEditEvent}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
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
