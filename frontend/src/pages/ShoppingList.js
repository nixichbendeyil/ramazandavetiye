import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, ShoppingCart, Trash2, Apple, Beef, Milk, Wheat, Salad, Coffee, Package } from 'lucide-react';

const ShoppingList = () => {
  const { t } = useTranslation();
  const { language, shoppingItems, addShoppingItem, deleteShoppingItem, toggleShoppingItem, clearCompletedItems } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: 'fruits'
  });

  const categories = [
    { key: 'fruits', icon: <Apple className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
    { key: 'meat', icon: <Beef className="w-5 h-5" />, color: 'text-red-600 bg-red-50' },
    { key: 'dairy', icon: <Milk className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
    { key: 'grains', icon: <Wheat className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
    { key: 'spices', icon: <Salad className="w-5 h-5" />, color: 'text-orange-600 bg-orange-50' },
    { key: 'drinks', icon: <Coffee className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
    { key: 'other', icon: <Package className="w-5 h-5" />, color: 'text-stone-600 bg-stone-50' }
  ];

  const getCategoryInfo = (key) => categories.find(c => c.key === key) || categories[6];

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    addShoppingItem(newItem);
    setNewItem({ name: '', quantity: '', category: 'fruits' });
    setIsAddDialogOpen(false);
  };

  // Group items by category
  const groupedItems = categories.reduce((acc, cat) => {
    acc[cat.key] = shoppingItems.filter(item => item.category === cat.key);
    return acc;
  }, {});

  const completedCount = shoppingItems.filter(item => item.completed).length;

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
      data-testid="shopping-page"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-stone-800">
            {t('shopping.title')}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {shoppingItems.length} {language === 'de' ? 'Artikel' : 'Urun'} • {completedCount} {language === 'de' ? 'erledigt' : 'tamamlandi'}
          </p>
        </div>
        <div className="flex gap-2">
          {completedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompletedItems}
              className="text-red-600 border-red-200 hover:bg-red-50"
              data-testid="clear-completed-btn"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {t('shopping.clearCompleted')}
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="add-item-btn">
                <Plus className="w-4 h-4 mr-1" />
                {t('shopping.addItem')}
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="add-item-dialog">
              <DialogHeader>
                <DialogTitle className="font-playfair">{t('shopping.addItem')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>{t('shopping.itemName')}</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="z.B. Tomaten"
                    data-testid="item-name-input"
                  />
                </div>
                <div>
                  <Label>{t('shopping.quantity')}</Label>
                  <Input
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    placeholder="z.B. 1kg"
                    data-testid="item-quantity-input"
                  />
                </div>
                <div>
                  <Label>{t('shopping.category')}</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger data-testid="item-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.key} value={cat.key}>
                          <div className="flex items-center gap-2">
                            {cat.icon}
                            {t(`shopping.categories.${cat.key}`)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddItem}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  data-testid="save-item-btn"
                >
                  {t('calendar.save')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Shopping Items by Category */}
      {shoppingItems.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-stone-200">
            <CardContent className="py-12">
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">{t('shopping.noItems')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        categories.map((category) => {
          const items = groupedItems[category.key];
          if (items.length === 0) return null;

          return (
            <motion.div key={category.key} variants={itemVariants}>
              <Card className="border-stone-200" data-testid={`category-${category.key}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className={`p-2 rounded-lg ${category.color}`}>
                      {category.icon}
                    </span>
                    {t(`shopping.categories.${category.key}`)}
                    <span className="text-sm font-normal text-stone-400 ml-auto">
                      {items.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                            item.completed ? 'bg-stone-50' : 'bg-white border border-stone-100'
                          }`}
                          data-testid={`shopping-item-${item.id}`}
                        >
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => toggleShoppingItem(item.id)}
                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            data-testid={`checkbox-${item.id}`}
                          />
                          <div className="flex-1">
                            <span className={`font-medium ${item.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                              {item.name}
                            </span>
                            {item.quantity && (
                              <span className="text-sm text-stone-500 ml-2">
                                ({item.quantity})
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteShoppingItem(item.id)}
                            className="h-8 w-8 text-stone-400 hover:text-red-500"
                            data-testid={`delete-item-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
};

export default ShoppingList;
