import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Plus, ShoppingCart, Trash2, Apple, Beef, Milk, Wheat, Salad, Coffee, Package, X } from 'lucide-react';

const ShoppingList = () => {
  const { t } = useTranslation();
  const { language, shoppingItems, addShoppingItem, deleteShoppingItem, toggleShoppingItem, clearCompletedItems } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [bulkItems, setBulkItems] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('fruits');

  const categories = [
    { key: 'fruits', icon: Apple, color: 'text-emerald-700 bg-emerald-50', label: t('shopping.categories.fruits') },
    { key: 'meat', icon: Beef, color: 'text-rose-700 bg-rose-50', label: t('shopping.categories.meat') },
    { key: 'dairy', icon: Milk, color: 'text-sky-700 bg-sky-50', label: t('shopping.categories.dairy') },
    { key: 'grains', icon: Wheat, color: 'text-amber-700 bg-amber-50', label: t('shopping.categories.grains') },
    { key: 'spices', icon: Salad, color: 'text-orange-700 bg-orange-50', label: t('shopping.categories.spices') },
    { key: 'drinks', icon: Coffee, color: 'text-violet-700 bg-violet-50', label: t('shopping.categories.drinks') },
    { key: 'other', icon: Package, color: 'text-stone-600 bg-stone-100', label: t('shopping.categories.other') }
  ];

  const getCategoryInfo = (key) => categories.find(c => c.key === key) || categories[6];

  // BULK ADD: Parse textarea and add multiple items
  const handleBulkAdd = () => {
    if (!bulkItems.trim()) return;
    
    // Split by newline, comma, or semicolon
    const items = bulkItems
      .split(/[\n,;]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    items.forEach(itemText => {
      // Check if there's a quantity in parentheses like "Äpfel (2kg)"
      const match = itemText.match(/^(.+?)\s*\((.+?)\)$/);
      if (match) {
        addShoppingItem({
          name: match[1].trim(),
          quantity: match[2].trim(),
          category: selectedCategory
        });
      } else {
        addShoppingItem({
          name: itemText,
          quantity: '',
          category: selectedCategory
        });
      }
    });
    
    setBulkItems('');
    setIsAddDialogOpen(false);
  };

  // Group items by category
  const groupedItems = categories.reduce((acc, cat) => {
    acc[cat.key] = shoppingItems.filter(item => item.category === cat.key);
    return acc;
  }, {});

  const completedCount = shoppingItems.filter(item => item.completed).length;
  const totalCount = shoppingItems.length;

  return (
    <motion.div
      className="space-y-4 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-testid="shopping-page"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-gray-900">
            {t('shopping.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalCount} {language === 'de' ? 'Artikel' : 'Urun'} • {completedCount} ✓
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="add-items-btn">
              <Plus className="w-4 h-4 mr-1" />
              {t('shopping.addItem')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" data-testid="bulk-add-dialog">
            <DialogHeader>
              <DialogTitle className="font-playfair">
                {language === 'de' ? 'Artikel hinzufügen' : 'Urunler ekle'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Category Selection */}
              <div>
                <Label className="text-sm text-gray-600">{t('shopping.category')}</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-1" data-testid="category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => {
                      const IconComponent = cat.icon;
                      return (
                        <SelectItem key={cat.key} value={cat.key}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Add Textarea */}
              <div>
                <Label className="text-sm text-gray-600">
                  {language === 'de' 
                    ? 'Artikel (ein Artikel pro Zeile)' 
                    : 'Urunler (her satira bir urun)'}
                </Label>
                <Textarea
                  value={bulkItems}
                  onChange={(e) => setBulkItems(e.target.value)}
                  placeholder={language === 'de' 
                    ? "Äpfel (2kg)\nTomaten\nGurken (3 Stück)\nZwiebeln" 
                    : "Elmalar (2kg)\nDomatesler\nSalatalik (3 adet)\nSogan"}
                  className="mt-1 h-40 resize-none"
                  data-testid="bulk-items-textarea"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {language === 'de' 
                    ? 'Tipp: Menge in Klammern angeben, z.B. "Äpfel (2kg)"' 
                    : 'Ipucu: Miktari parantez icinde yazin, orn. "Elma (2kg)"'}
                </p>
              </div>

              <Button 
                onClick={handleBulkAdd} 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={!bulkItems.trim()}
                data-testid="save-bulk-items-btn"
              >
                {language === 'de' ? 'Artikel hinzufügen' : 'Urunleri ekle'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clear Completed Button */}
      {completedCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCompletedItems}
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
            data-testid="clear-completed-btn"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('shopping.clearCompleted')} ({completedCount})
          </Button>
        </motion.div>
      )}

      {/* Shopping Items by Category */}
      {totalCount === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="py-12">
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('shopping.noItems')}</p>
              <p className="text-sm text-gray-400 mt-1">
                {language === 'de' 
                  ? 'Tippe auf "+", um mehrere Artikel hinzuzufügen' 
                  : 'Birden fazla urun eklemek icin "+" a tiklayin'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => {
            const items = groupedItems[category.key];
            if (items.length === 0) return null;

            const IconComponent = category.icon;
            const completedInCategory = items.filter(i => i.completed).length;

            return (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-gray-200 overflow-hidden" data-testid={`category-${category.key}`}>
                  <CardHeader className="py-3 px-4 bg-gray-50">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${category.color}`}>
                          <IconComponent className="w-4 h-4" />
                        </span>
                        <span className="font-medium text-gray-800">{category.label}</span>
                      </div>
                      <span className="text-sm font-normal text-gray-500">
                        {completedInCategory}/{items.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 ${
                            item.completed ? 'bg-gray-50' : 'bg-white'
                          }`}
                          data-testid={`shopping-item-${item.id}`}
                        >
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => toggleShoppingItem(item.id)}
                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            data-testid={`checkbox-${item.id}`}
                          />
                          <div className="flex-1 min-w-0">
                            <span className={`font-medium ${
                              item.completed ? 'line-through text-gray-400' : 'text-gray-800'
                            }`}>
                              {item.name}
                            </span>
                            {item.quantity && (
                              <span className={`text-sm ml-2 ${
                                item.completed ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                ({item.quantity})
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteShoppingItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            data-testid={`delete-item-${item.id}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ShoppingList;
