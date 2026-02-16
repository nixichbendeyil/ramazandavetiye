import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Heart, Clock, ChefHat, Trash2, X } from 'lucide-react';

const Recipes = () => {
  const { t } = useTranslation();
  const { language, recipes, addRecipe, deleteRecipe, toggleFavorite } = useApp();
  const [filter, setFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    nameDE: '',
    nameTR: '',
    category: 'main',
    prepTime: 30,
    image: '',
    ingredients: [],
    instructions: '',
    isFavorite: false
  });
  const [newIngredient, setNewIngredient] = useState('');

  const categories = [
    { key: 'soup', label: t('recipes.categories.soup') },
    { key: 'main', label: t('recipes.categories.main') },
    { key: 'dessert', label: t('recipes.categories.dessert') },
    { key: 'salad', label: t('recipes.categories.salad') },
    { key: 'drink', label: t('recipes.categories.drink') }
  ];

  const filteredRecipes = filter === 'all' 
    ? recipes 
    : filter === 'favorites'
      ? recipes.filter(r => r.isFavorite)
      : recipes.filter(r => r.category === filter);

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return;
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient.trim()]
    }));
    setNewIngredient('');
  };

  const handleRemoveIngredient = (index) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleAddRecipe = () => {
    if (!newRecipe.name.trim()) return;
    addRecipe({
      ...newRecipe,
      nameDE: newRecipe.nameDE || newRecipe.name,
      nameTR: newRecipe.nameTR || newRecipe.name
    });
    setNewRecipe({
      name: '',
      nameDE: '',
      nameTR: '',
      category: 'main',
      prepTime: 30,
      image: '',
      ingredients: [],
      instructions: '',
      isFavorite: false
    });
    setIsAddDialogOpen(false);
  };

  const getRecipeName = (recipe) => {
    return language === 'de' ? recipe.nameDE : recipe.nameTR;
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
      data-testid="recipes-page"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-stone-800">
          {t('recipes.title')}
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="add-recipe-btn">
              <Plus className="w-4 h-4 mr-1" />
              {t('recipes.addRecipe')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="add-recipe-dialog">
            <DialogHeader>
              <DialogTitle className="font-playfair">{t('recipes.addRecipe')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name (DE)</Label>
                  <Input
                    value={newRecipe.nameDE}
                    onChange={(e) => setNewRecipe({ ...newRecipe, nameDE: e.target.value, name: e.target.value })}
                    placeholder="Linsensuppe"
                    data-testid="recipe-name-de-input"
                  />
                </div>
                <div>
                  <Label>Name (TR)</Label>
                  <Input
                    value={newRecipe.nameTR}
                    onChange={(e) => setNewRecipe({ ...newRecipe, nameTR: e.target.value })}
                    placeholder="Mercimek Corbasi"
                    data-testid="recipe-name-tr-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('shopping.category')}</Label>
                  <Select
                    value={newRecipe.category}
                    onValueChange={(value) => setNewRecipe({ ...newRecipe, category: value })}
                  >
                    <SelectTrigger data-testid="recipe-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.key} value={cat.key}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('recipes.prepTime')} (min)</Label>
                  <Input
                    type="number"
                    value={newRecipe.prepTime}
                    onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: parseInt(e.target.value) || 0 })}
                    data-testid="recipe-time-input"
                  />
                </div>
              </div>
              <div>
                <Label>Bild URL</Label>
                <Input
                  value={newRecipe.image}
                  onChange={(e) => setNewRecipe({ ...newRecipe, image: e.target.value })}
                  placeholder="https://..."
                  data-testid="recipe-image-input"
                />
              </div>
              <div>
                <Label>{t('recipes.ingredients')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                    placeholder={language === 'de' ? 'Zutat eingeben' : 'Malzeme girin'}
                    data-testid="ingredient-input"
                  />
                  <Button type="button" onClick={handleAddIngredient} variant="outline" data-testid="add-ingredient-btn">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {newRecipe.ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newRecipe.ingredients.map((ing, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                        {ing}
                        <button onClick={() => handleRemoveIngredient(idx)} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label>{t('recipes.instructions')}</Label>
                <Textarea
                  value={newRecipe.instructions}
                  onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                  rows={4}
                  data-testid="recipe-instructions-input"
                />
              </div>
              <Button
                onClick={handleAddRecipe}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                data-testid="save-recipe-btn"
              >
                {t('calendar.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="bg-stone-100 w-full overflow-x-auto flex justify-start">
            <TabsTrigger value="all" data-testid="filter-all">{t('recipes.all')}</TabsTrigger>
            <TabsTrigger value="favorites" data-testid="filter-favorites">
              <Heart className="w-4 h-4 mr-1" />
              {t('recipes.favorites')}
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.key} value={cat.key} data-testid={`filter-${cat.key}`}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Recipe Grid */}
      {filteredRecipes.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-stone-200">
            <CardContent className="py-12">
              <div className="text-center">
                <ChefHat className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">{t('recipes.noRecipes')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="border-stone-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRecipe(recipe)}
              data-testid={`recipe-card-${recipe.id}`}
            >
              <div className="relative h-40">
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={getRecipeName(recipe)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-amber-100 flex items-center justify-center">
                    <ChefHat className="w-12 h-12 text-emerald-400" />
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(recipe.id);
                  }}
                  className={`absolute top-3 right-3 p-2 rounded-full ${
                    recipe.isFavorite 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/80 text-stone-600 hover:bg-white'
                  }`}
                  data-testid={`favorite-${recipe.id}`}
                >
                  <Heart className={`w-4 h-4 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-800">{getRecipeName(recipe)}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {t(`recipes.categories.${recipe.category}`)}
                    </Badge>
                  </div>
                  <div className="flex items-center text-stone-500 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {recipe.prepTime} {t('recipes.minutes')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="recipe-detail-dialog">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="font-playfair text-xl">
                  {getRecipeName(selectedRecipe)}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {selectedRecipe.image && (
                  <img
                    src={selectedRecipe.image}
                    alt={getRecipeName(selectedRecipe)}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                )}
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-100 text-emerald-800">
                    {t(`recipes.categories.${selectedRecipe.category}`)}
                  </Badge>
                  <div className="flex items-center text-stone-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {selectedRecipe.prepTime} {t('recipes.minutes')}
                  </div>
                </div>
                {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-stone-800 mb-2">{t('recipes.ingredients')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-stone-600">
                      {selectedRecipe.ingredients.map((ing, idx) => (
                        <li key={idx}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedRecipe.instructions && (
                  <div>
                    <h4 className="font-semibold text-stone-800 mb-2">{t('recipes.instructions')}</h4>
                    <p className="text-stone-600 whitespace-pre-wrap">{selectedRecipe.instructions}</p>
                  </div>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteRecipe(selectedRecipe.id);
                    setSelectedRecipe(null);
                  }}
                  className="w-full"
                  data-testid="delete-recipe-btn"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {t('calendar.delete')}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Recipes;
