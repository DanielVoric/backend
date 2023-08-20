const express = require('express');
const router = express.Router();
const Cocktail = require('../models/Cocktail'); 

router.get('/', async (req, res) => {
    try {
        const cocktails = await Cocktail.find({});
        res.json(cocktails);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch cocktails.", error });
    }
});

router.get('/search', async (req, res) => {
    const { alcohol, juice, other } = req.query;

    const selectedIngredients = [
        ...alcohol ? alcohol.split(",").map(alc => alc.toLowerCase().trim()) : [],
        ...juice ? juice.split(",").map(j => j.toLowerCase().trim()) : [],
        ...other ? other.split(",").map(oth => oth.toLowerCase().trim()) : []
    ];

    try {
        const allCocktails = await Cocktail.find({});
        const matchingCocktails = allCocktails.filter(cocktail => {
            const totalIngredients = [
                ...cocktail.ingredients.alcohol.map(ing => ing.toLowerCase().trim()),
                ...cocktail.ingredients.juice.map(ing => ing.toLowerCase().trim()),
                ...cocktail.ingredients.other.map(ing => ing.toLowerCase().trim())
            ];

            return totalIngredients.every(ing => selectedIngredients.includes(ing));
        });

        res.json(matchingCocktails);
    } catch (error) {
        res.status(500).json({ message: "Failed to search cocktails.", error });
    }
});

router.post('/', async (req, res) => {
    const cocktailData = req.body;
    const newCocktail = new Cocktail(cocktailData);

    try {
        await newCocktail.save();
        res.status(201).json({ message: "Cocktail added!", cocktail: newCocktail });
    } catch (error) {
        res.status(400).json({ message: "Failed to add cocktail.", error });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedCocktail = await Cocktail.findByIdAndRemove(req.params.id);
        if (!deletedCocktail) {
            return res.status(404).json({ message: "Cocktail not found!" });
        }

        res.status(200).json({ message: "Cocktail deleted successfully!", deletedCocktail });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete cocktail.", error });
    }
});

module.exports = router;
