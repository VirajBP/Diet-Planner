const PredefinedMeal = require('../models/PredefinedMeal');

class SearchService {
  /**
   * Comprehensive search with multiple strategies
   * @param {string} query - Search query
   * @param {number} limit - Maximum results to return
   * @returns {Array} - Search results with relevance scores
   */
  async searchMeals(query, limit = 10) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchQuery = query.trim().toLowerCase();
    const results = new Map(); // Use Map to avoid duplicates

    try {
      // Strategy 1: Exact match (highest priority)
      const exactMatches = await this.exactSearch(searchQuery, limit);
      exactMatches.forEach(meal => {
        results.set(meal._id.toString(), { ...meal.toObject(), relevance: 100 });
      });

      // Strategy 2: MongoDB text search
      const textMatches = await this.textSearch(searchQuery, limit);
      textMatches.forEach(meal => {
        const mealId = meal._id.toString();
        if (!results.has(mealId)) {
          results.set(mealId, { ...meal.toObject(), relevance: 80 });
        }
      });

      // Strategy 3: Regex search for partial matches
      const regexMatches = await this.regexSearch(searchQuery, limit);
      regexMatches.forEach(meal => {
        const mealId = meal._id.toString();
        if (!results.has(mealId)) {
          results.set(mealId, { ...meal.toObject(), relevance: 60 });
        }
      });

      // Strategy 4: Word-by-word search
      const wordMatches = await this.wordSearch(searchQuery, limit);
      wordMatches.forEach(meal => {
        const mealId = meal._id.toString();
        if (!results.has(mealId)) {
          results.set(mealId, { ...meal.toObject(), relevance: 40 });
        }
      });

      // Strategy 5: Fuzzy search for typos
      const fuzzyMatches = await this.fuzzySearch(searchQuery, limit);
      fuzzyMatches.forEach(meal => {
        const mealId = meal._id.toString();
        if (!results.has(mealId)) {
          results.set(mealId, { ...meal.toObject(), relevance: 20 });
        }
      });

      // Convert Map to Array and sort by relevance
      const finalResults = Array.from(results.values())
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);

      return finalResults;
    } catch (error) {
      console.error('Search service error:', error);
      return [];
    }
  }

  /**
   * Exact match search
   */
  async exactSearch(query, limit) {
    return await PredefinedMeal.find({
      $or: [
        { name: { $regex: `^${query}$`, $options: 'i' } },
        { searchName: query },
        { searchKeywords: query }
      ]
    }).limit(limit);
  }

  /**
   * MongoDB text search
   */
  async textSearch(query, limit) {
    return await PredefinedMeal.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit);
  }

  /**
   * Regex search for partial matches
   */
  async regexSearch(query, limit) {
    return await PredefinedMeal.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { searchName: { $regex: query, $options: 'i' } },
        { ingredients: { $regex: query, $options: 'i' } },
        { searchKeywords: { $regex: query, $options: 'i' } }
      ]
    }).limit(limit);
  }

  /**
   * Word-by-word search
   */
  async wordSearch(query, limit) {
    const words = query.split(/\s+/).filter(word => word.length > 2);
    if (words.length === 0) return [];

    const wordQueries = words.map(word => ({
      $or: [
        { name: { $regex: word, $options: 'i' } },
        { searchName: { $regex: word, $options: 'i' } },
        { ingredients: { $regex: word, $options: 'i' } },
        { searchKeywords: word }
      ]
    }));

    return await PredefinedMeal.find({
      $and: wordQueries
    }).limit(limit);
  }

  /**
   * Fuzzy search for typos and similar words
   */
  async fuzzySearch(query, limit) {
    // Create variations of the query for fuzzy matching
    const variations = this.generateFuzzyVariations(query);
    
    const fuzzyQueries = variations.map(variation => ({
      $or: [
        { name: { $regex: variation, $options: 'i' } },
        { searchName: { $regex: variation, $options: 'i' } },
        { searchKeywords: { $regex: variation, $options: 'i' } }
      ]
    }));

    return await PredefinedMeal.find({
      $or: fuzzyQueries
    }).limit(limit);
  }

  /**
   * Generate fuzzy variations of a query
   */
  generateFuzzyVariations(query) {
    const variations = new Set();
    
    // Add original query
    variations.add(query);
    
    // Common typos and variations
    const commonReplacements = {
      'a': ['@', '4'],
      'e': ['3'],
      'i': ['1', '!'],
      'o': ['0'],
      's': ['5', '$'],
      't': ['7'],
      'b': ['8'],
      'g': ['9']
    };

    // Generate variations with common character replacements
    for (const [char, replacements] of Object.entries(commonReplacements)) {
      if (query.includes(char)) {
        for (const replacement of replacements) {
          variations.add(query.replace(new RegExp(char, 'g'), replacement));
        }
      }
    }

    // Add partial matches (remove last character)
    if (query.length > 3) {
      variations.add(query.slice(0, -1));
    }

    // Add character transpositions
    for (let i = 0; i < query.length - 1; i++) {
      const chars = query.split('');
      [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
      variations.add(chars.join(''));
    }

    return Array.from(variations);
  }

  /**
   * Search by category
   */
  async searchByCategory(category, limit = 10) {
    return await PredefinedMeal.find({
      category: category.toLowerCase()
    }).limit(limit);
  }

  /**
   * Search by tags
   */
  async searchByTags(tags, limit = 10) {
    return await PredefinedMeal.find({
      tags: { $in: tags.map(tag => tag.toLowerCase()) }
    }).limit(limit);
  }

  /**
   * Get search suggestions based on partial input
   */
  async getSuggestions(partialQuery, limit = 5) {
    if (!partialQuery || partialQuery.length < 2) return [];

    const query = partialQuery.toLowerCase();
    
    const suggestions = await PredefinedMeal.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { searchKeywords: { $regex: query, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          name: 1,
          category: 1,
          relevance: {
            $cond: {
              if: { $regexMatch: { input: "$name", regex: `^${query}`, options: "i" } },
              then: 100,
              else: 50
            }
          }
        }
      },
      {
        $sort: { relevance: -1, name: 1 }
      },
      {
        $limit: limit
      }
    ]);

    return suggestions;
  }
}

module.exports = new SearchService(); 