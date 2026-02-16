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
import { Plus, Users, MapPin, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Week view dates
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Get all events for the current week
  const weekEvents = weekDays.flatMap(day => 
    getEventsForDay(day).map(event => ({ ...event, dayDate: day }))
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

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
    : ['Pt', 'Sa', 'Ca', 'Pe', 'Cu', 'Ct', 'Pa'];

  return (
    <motion.div
      className="space-y-4 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-testid="calendar-page"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-gray-900">
          {t('calendar.title')}
        </h1>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
              viewMode === 'month' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid="month-view-btn"
          >
            {t('calendar.monthView')}
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
              viewMode === 'week' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
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
            className="space-y-4"
          >
            <Card className="border-gray-200 shadow-sm" data-testid="month-calendar">
              <CardContent className="p-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    data-testid="prev-month-btn"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h2 className="font-playfair text-lg font-semibold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy', { locale })}
                  </h2>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    data-testid="next-month-btn"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid - Compact for Mobile */}
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
                          relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all
                          ${isSelected 
                            ? 'bg-emerald-600 text-white' 
                            : isToday 
                              ? 'bg-emerald-100 text-emerald-800 font-semibold'
                              : isCurrentMonth
                                ? 'hover:bg-gray-100 text-gray-800'
                                : 'text-gray-300'
                          }
                        `}
                        data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                      >
                        <span className="text-sm">{format(day, 'd')}</span>
                        {/* Event Dots - Clear Color Distinction */}
                        {dayEvents.length > 0 && isCurrentMonth && (
                          <div className="flex gap-0.5 mt-0.5">
                            {hasHosting && (
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-600'}`} />
                            )}
                            {hasInvited && (
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`} />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span className="text-xs text-gray-600">{t('calendar.hosting')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs text-gray-600">{t('calendar.invited')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Events */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {format(selectedDate, 'EEEE, d. MMMM', { locale })}
                  </h3>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3" data-testid="add-event-btn">
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
                          <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                            <SelectTrigger data-testid="event-type-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hosting">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                                  {t('calendar.hosting')}
                                </div>
                              </SelectItem>
                              <SelectItem value="invited">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                                  {t('calendar.invited')}
                                </div>
                              </SelectItem>
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
                        <Button onClick={handleAddEvent} className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="save-event-btn">
                          {t('calendar.save')}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {selectedDateEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 text-sm">{t('calendar.noEvents')}</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          event.type === 'hosting'
                            ? 'bg-emerald-50 border-emerald-600'
                            : 'bg-amber-50 border-amber-500'
                        }`}
                        data-testid={`calendar-event-${event.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <Badge className={`text-xs ${event.type === 'hosting' ? 'bg-emerald-600' : 'bg-amber-500'} text-white`}>
                              {event.type === 'hosting' ? t('calendar.hosting') : t('calendar.invited')}
                            </Badge>
                            <h4 className="font-medium text-gray-900 mt-1 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{event.name}</span>
                            </h4>
                            {event.location && (
                              <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => openEditDialog(event)}
                            className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                            data-testid={`edit-event-${event.id}`}
                          >
                            <Edit2 className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Week View - Vertical Agenda Layout */}
        {viewMode === 'week' && (
          <motion.div
            key="week"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Horizontal Date Strip */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-3">
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
                        className={`flex flex-col items-center py-2 px-2 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : isToday
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'hover:bg-gray-100'
                        }`}
                        data-testid={`week-day-${format(day, 'yyyy-MM-dd')}`}
                      >
                        <span className="text-xs opacity-70">{format(day, 'EEE', { locale })}</span>
                        <span className="text-lg font-semibold">{format(day, 'd')}</span>
                        {/* Dots */}
                        <div className="flex gap-0.5 mt-1">
                          {hasHosting && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-600'}`} />}
                          {hasInvited && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`} />}
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
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="add-event-btn-week">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('calendar.addEvent')} - {format(selectedDate, 'd. MMM', { locale })}
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="add-event-dialog-week">
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
                    />
                  </div>
                  <div>
                    <Label>{t('calendar.eventType')}</Label>
                    <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hosting">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-600" />
                            {t('calendar.hosting')}
                          </div>
                        </SelectItem>
                        <SelectItem value="invited">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500" />
                            {t('calendar.invited')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('calendar.location')}</Label>
                    <Input
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder={t('calendar.location')}
                    />
                  </div>
                  <div>
                    <Label>{t('calendar.notes')}</Label>
                    <Textarea
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                      placeholder={t('calendar.notes')}
                    />
                  </div>
                  <Button onClick={handleAddEvent} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    {t('calendar.save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Vertical Agenda List */}
            <div className="space-y-2">
              {weekEvents.length === 0 ? (
                <Card className="border-gray-200">
                  <CardContent className="py-8">
                    <p className="text-gray-500 text-center text-sm">{t('calendar.noEvents')}</p>
                  </CardContent>
                </Card>
              ) : (
                weekEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl border-l-4 bg-white shadow-sm ${
                      event.type === 'hosting'
                        ? 'border-emerald-600'
                        : 'border-amber-500'
                    }`}
                    data-testid={`week-event-${event.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-shrink-0 text-center min-w-[50px]">
                        <div className="text-xs text-gray-500">{format(event.dayDate, 'EEE', { locale })}</div>
                        <div className="text-lg font-semibold text-gray-900">{format(event.dayDate, 'd')}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${event.type === 'hosting' ? 'bg-emerald-600' : 'bg-amber-500'} text-white`}>
                            {event.type === 'hosting' ? t('calendar.hosting') : t('calendar.invited')}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 mt-1 truncate">{event.name}</h4>
                        {event.location && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => openEditDialog(event)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
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
                <Select value={editingEvent.type} onValueChange={(value) => setEditingEvent({ ...editingEvent, type: value })}>
                  <SelectTrigger data-testid="edit-event-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hosting">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-600" />
                        {t('calendar.hosting')}
                      </div>
                    </SelectItem>
                    <SelectItem value="invited">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        {t('calendar.invited')}
                      </div>
                    </SelectItem>
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
