const express = require('express');
const router = express.Router();
const cocktail = require('../models/Cocktail');

router.get('/', async (req, res) => {
    const cocktails = await cocktail.find({});
    res.json(cocktails);
});

// sranje
router.get('/search', async (req, res) => {
    const { alcohol, juice, other } = req.query;

    const selectedIngredients = [
        ...alcohol ? alcohol.split(",").map(alc => alc.toLowerCase().trim()) : [],
        ...juice ? juice.split(",").map(j => j.toLowerCase().trim()) : [],
        ...other ? other.split(",").map(oth => oth.toLowerCase().trim()) : []
    ];

    // Dohvati sve
    const allCocktails = await cocktail.find({});

    const matchingCocktails = allCocktails.filter(cocktail => {
        const totalIngredients = [
            ...cocktail.ingredients.alcohol.map(ing => ing.toLowerCase().trim()),
            ...cocktail.ingredients.juice.map(ing => ing.toLowerCase().trim()),
            ...cocktail.ingredients.other.map(ing => ing.toLowerCase().trim())
        ];

        // Filtriraj
        return totalIngredients.every(ing => selectedIngredients.includes(ing));
    });

    res.json(matchingCocktails);
});

router.post('/', async (req, res) => {
    const cocktailData = req.body;
    const newCocktail = new cocktail(cocktailData);

    try {
        await newCocktail.save();
        res.status(201).json({ message: "Cocktail added!", cocktail: newCocktail });
    } catch (error) {
        res.status(400).json({ message: "Failed to add cocktail.", error });
    }
});

module.exports = router;
