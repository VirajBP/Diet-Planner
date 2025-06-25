import React, { createContext, useCallback, useContext, useState } from 'react';
import { mongodbService } from '../services/mongodb.service';

const MealsContext = createContext();

export const useMeals = () => {
  const context = useContext(MealsContext);
  if (!context) {
    throw new Error('useMeals must be used within a MealsProvider');
  }
  return context;
};

export const MealsProvider = ({ children }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMeals = useCallback(async () => {
    try {
      setLoading(true);
      const mealsData = await mongodbService.getMeals();
      
      // Flatten grouped meals array if needed
      let flatMeals = [];
      if (Array.isArray(mealsData) && mealsData.length > 0 && mealsData[0].meals) {
        // Backend returns grouped data
        mealsData.forEach(group => {
          if (Array.isArray(group.meals)) {
            group.meals.forEach(meal => {
              flatMeals.push({
                ...meal,
                date: new Date(group.date).toISOString().split('T')[0] // Always store as YYYY-MM-DD
              });
            });
          }
        });
      } else {
        // Backend returns flat array
        flatMeals = (mealsData || []).map(meal => ({
          ...meal,
          date: meal.date ? new Date(meal.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));
      }
      
      // Ensure proper data structure and default values
      const processedMeals = (flatMeals || []).map(meal => ({
        _id: meal.id || meal._id,
        name: meal.name || 'Unnamed Meal',
        type: meal.type || 'other',
        calories: typeof meal.calories === 'number' ? meal.calories : 0,
        ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
        date: meal.date
      }));
      
      setMeals(processedMeals);
    } catch (error) {
      console.error('Error loading meals:', error);
      setMeals([]); // Set empty array on error
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addMeal = useCallback(async (mealData) => {
    try {
      setLoading(true);
      const newMeal = await mongodbService.createMeal(mealData);
      
      // Always store date as YYYY-MM-DD string
      let mealDate = newMeal.date ? new Date(newMeal.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      
      const mealToAdd = {
        _id: newMeal.id || newMeal._id,
        name: newMeal.name || 'Unnamed Meal',
        type: newMeal.type || 'other',
        calories: typeof newMeal.calories === 'number' ? newMeal.calories : 0,
        ingredients: Array.isArray(newMeal.ingredients) ? newMeal.ingredients : [],
        date: mealDate
      };
      
      setMeals(prevMeals => [...(prevMeals || []), mealToAdd]);
      
      return newMeal;
    } catch (error) {
      console.error('Error adding meal:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMeal = useCallback(async (mealId) => {
    try {
      setLoading(true);
      await mongodbService.deleteMeal(mealId);
      setMeals(prevMeals => (prevMeals || []).filter(meal => meal._id !== mealId));
    } catch (error) {
      console.error('Error deleting meal:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <MealsContext.Provider value={{ meals, loading, loadMeals, addMeal, deleteMeal }}>
      {children}
    </MealsContext.Provider>
  );
}; 