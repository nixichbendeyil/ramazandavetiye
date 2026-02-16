import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

// Initial sample data
const sampleEvents = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    type: 'hosting',
    name: 'Familie Yilmaz',
    location: '',
    notes: 'Iftar Dinner',
    menu: ['Linsensuppe', 'Pide', 'Baklava']
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    type: 'invited',
    name: 'Bei Familie Tork',
    location: 'Lunen',
    notes: 'Einladung zum Iftar',
    menu: []
  }
];

const sampleRecipes = [
  {
    id: '1',
    name: 'Mercimek Corbasi',
    nameDE: 'Linsensuppe',
    nameTR: 'Mercimek Corbasi',
    category: 'soup',
    prepTime: 30,
    image: 'https://images.unsplash.com/photo-1625937712842-061738bb1e2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHw0fHx0dXJraXNoJTIwbGVudGlsJTIwc291cCUyMGJvd2x8ZW58MHx8fHwxNzcxMjIwMTY3fDA&ixlib=rb-4.1.0&q=85',
    ingredients: ['Rote Linsen', 'Zwiebel', 'Karotte', 'Kartoffel', 'Tomatenmark'],
    instructions: 'Alle Zutaten kochen und purieren.',
    isFavorite: true
  },
  {
    id: '2',
    name: 'Baklava',
    nameDE: 'Baklava',
    nameTR: 'Baklava',
    category: 'dessert',
    prepTime: 90,
    image: 'https://images.unsplash.com/photo-1761828122856-8703baac8e86?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA8Mzl8MHwxfHNlYXJjaHwyfHxiYWtsYXZhJTIwZGVzc2VydCUyMHBpc3RhY2hpb3xlbnwwfHx8fDE3NzEyMjAxNjd8MA&ixlib=rb-4.1.0&q=85',
    ingredients: ['Filoteig', 'Pistazien', 'Butter', 'Zucker', 'Wasser'],
    instructions: 'Schichten, backen und mit Sirup ubergießen.',
    isFavorite: true
  }
];

const sampleShoppingItems = [
  { id: '1', name: 'Rote Linsen', quantity: '500g', category: 'grains', completed: false },
  { id: '2', name: 'Zwiebeln', quantity: '1kg', category: 'fruits', completed: false },
  { id: '3', name: 'Hackfleisch', quantity: '500g', category: 'meat', completed: false }
];

export const AppProvider = ({ children }) => {
  // Language state
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'de';
  });

  // City and country state
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('selectedCity') || 'Berlin';
  });
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem('selectedCountry') || 'Germany';
  });

  // Events state
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('events');
    return saved ? JSON.parse(saved) : sampleEvents;
  });

  // Recipes state
  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem('recipes');
    return saved ? JSON.parse(saved) : sampleRecipes;
  });

  // Shopping list state
  const [shoppingItems, setShoppingItems] = useState(() => {
    const saved = localStorage.getItem('shoppingItems');
    return saved ? JSON.parse(saved) : sampleShoppingItems;
  });

  // Prayer times state
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerTimesLoading, setPrayerTimesLoading] = useState(true);
  const [prayerTimesTimezone, setPrayerTimesTimezone] = useState('Europe/Berlin');

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('selectedCity', selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    localStorage.setItem('selectedCountry', selectedCountry);
  }, [selectedCountry]);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('shoppingItems', JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  // Fetch prayer times from Aladhan API with correct timezone
  const fetchPrayerTimes = useCallback(async () => {
    setPrayerTimesLoading(true);
    try {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      
      // Determine timezone based on country
      const timezone = selectedCountry === 'Germany' ? 'Europe/Berlin' : 'Europe/Istanbul';
      
      // Method 3 = Muslim World League (good for Europe)
      // Method 13 = Diyanet (Turkey's official calculation)
      const method = selectedCountry === 'Germany' ? 3 : 13;
      
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?city=${encodeURIComponent(selectedCity)}&country=${selectedCountry}&method=${method}&timezonestring=${timezone}`
      );
      const data = await response.json();
      
      if (data.code === 200) {
        setPrayerTimes(data.data.timings);
        // Store timezone info for countdown calculations
        setPrayerTimesTimezone(timezone);
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    } finally {
      setPrayerTimesLoading(false);
    }
  }, [selectedCity, selectedCountry]);

  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  // Event functions
  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString()
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id, updatedEvent) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updatedEvent } : event
    ));
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const getEventsByDate = (date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  // Recipe functions
  const addRecipe = (recipe) => {
    const newRecipe = {
      ...recipe,
      id: Date.now().toString()
    };
    setRecipes(prev => [...prev, newRecipe]);
  };

  const updateRecipe = (id, updatedRecipe) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === id ? { ...recipe, ...updatedRecipe } : recipe
    ));
  };

  const deleteRecipe = (id) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
  };

  const toggleFavorite = (id) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
    ));
  };

  // Shopping list functions
  const addShoppingItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      completed: false
    };
    setShoppingItems(prev => [...prev, newItem]);
  };

  const updateShoppingItem = (id, updatedItem) => {
    setShoppingItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updatedItem } : item
    ));
  };

  const deleteShoppingItem = (id) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleShoppingItem = (id) => {
    setShoppingItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const clearCompletedItems = () => {
    setShoppingItems(prev => prev.filter(item => !item.completed));
  };

  const value = {
    // Language
    language,
    setLanguage,
    // Location
    selectedCity,
    setSelectedCity,
    selectedCountry,
    setSelectedCountry,
    // Prayer times
    prayerTimes,
    prayerTimesLoading,
    fetchPrayerTimes,
    // Events
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByDate,
    // Recipes
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    // Shopping
    shoppingItems,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    toggleShoppingItem,
    clearCompletedItems
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
