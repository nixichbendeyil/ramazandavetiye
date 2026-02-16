import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { Calendar as CalendarUI } from '../components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Calendar as CalendarIcon, Users, MapPin, Trash2, Edit2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { de, tr } from 'date-fns/locale';

const CalendarPage = () => {
  const { t } = useTranslation();
  const { language, events, addEvent, updateEvent, deleteEvent, getEventsByDate } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  // Get events for a specific date to show in calendar
  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
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
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList className="bg-stone-100">
            <TabsTrigger value="month" data-testid="month-view-btn">
              {t('calendar.monthView')}
            </TabsTrigger>
            <TabsTrigger value="week" data-testid="week-view-btn">
              {t('calendar.weekView')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Month View */}
      {viewMode === 'month' && (
        <motion.div variants={itemVariants}>
          <Card className="border-stone-200" data-testid="month-calendar">
            <CardContent className="p-4">
              <CalendarUI
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={locale}
                className="rounded-md w-full"
                modifiers={{
                  hasEvent: (date) => getEventsForDay(date).length > 0,
                  hasHosting: (date) => getEventsForDay(date).some(e => e.type === 'hosting'),
                  hasInvited: (date) => getEventsForDay(date).some(e => e.type === 'invited')
                }}
                modifiersStyles={{
                  hasHosting: { backgroundColor: '#dcfce7', borderRadius: '8px' },
                  hasInvited: { backgroundColor: '#fef3c7', borderRadius: '8px' }
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dayEvents = getEventsForDay(date);
                    return (
                      <div className="w-full">
                        <span>{date.getDate()}</span>
                        {dayEvents.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  event.type === 'hosting' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <motion.div variants={itemVariants}>
          <Card className="border-stone-200" data-testid="week-calendar">
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`p-2 rounded-xl text-center transition-all ${
                        isSelected 
                          ? 'bg-emerald-600 text-white' 
                          : isToday 
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'hover:bg-stone-100'
                      }`}
                      data-testid={`week-day-${format(day, 'yyyy-MM-dd')}`}
                    >
                      <div className="text-xs opacity-70">
                        {format(day, 'EEE', { locale })}
                      </div>
                      <div className="text-lg font-semibold">
                        {format(day, 'd')}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs truncate px-1 py-0.5 rounded ${
                                isSelected 
                                  ? 'bg-white/20' 
                                  : event.type === 'hosting' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {event.name}
                            </div>
                          ))}
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

      {/* Selected Date Events */}
      <motion.div variants={itemVariants}>
        <Card className="border-stone-200" data-testid="selected-date-events">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-playfair text-lg text-stone-800 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600" />
                {format(selectedDate, 'PPP', { locale })}
              </CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700"
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
            </div>
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
                      <div className="flex-1">
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
                          <Users className="w-4 h-4" />
                          {event.name}
                        </h3>
                        {event.location && (
                          <p className="text-sm text-stone-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                        {event.notes && (
                          <p className="text-sm text-stone-500 mt-2">{event.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(event)}
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
