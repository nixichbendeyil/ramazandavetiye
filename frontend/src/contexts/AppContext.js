import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// Initial sample data
const sampleEvents = [];

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
    image: 'https://images.unsplash.com/photo-1761828122856-8703baac8e86?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwyfHxiYWtsYXZhJTIwZGVzc2VydCUyMHBpc3RhY2hpb3xlbnwwfHx8fDE3NzEyMjAxNjd8MA&ixlib=rb-4.1.0&q=85',
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

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('shoppingItems', JSON.stringify(shoppingItems));
  }, [shoppingItems]);

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
    let dateStr;
    if (typeof date === 'string') {
      dateStr = date;
    } else {
      // Use local date format to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }
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
