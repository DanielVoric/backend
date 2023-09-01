const express = require('express');
const router = express.Router();
const Cocktail = require('../models/Cocktail'); 
const User = require('../models/User');
const { verifyToken } = require('./Auth');

router.get('/', async (req, res) => {
    try {
        const Cocktails = await Cocktail.find({});
        res.json(Cocktails);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch cocktails.", error });
    }
});

router.get('/ingredients', async (req, res) => {
    try {
        const Cocktails = await Cocktail.find({});
        const allIngredients = {
            alcohol: [],
            juice: [],
            other: []
        };

        Cocktails.forEach(cocktail => {
            allIngredients.alcohol.push(...cocktail.ingredients.alcohol);
            allIngredients.juice.push(...cocktail.ingredients.juice);
            allIngredients.other.push(...cocktail.ingredients.other);
        });

        const uniqueIngredients = {
            alcohol: [...new Set(allIngredients.alcohol)],
            juice: [...new Set(allIngredients.juice)],
            other: [...new Set(allIngredients.other)]
        };

        res.json(uniqueIngredients);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch ingredients.", error });
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
    //da ne salje prazan string
    cocktailData.ingredients.alcohol = cocktailData.ingredients.alcohol.filter(Boolean);
    cocktailData.ingredients.juice = cocktailData.ingredients.juice.filter(Boolean);
    cocktailData.ingredients.other = cocktailData.ingredients.other.filter(Boolean);

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
        const cocktail = await Cocktail.findById(req.params.id);
        
        if (!cocktail) {
            return res.status(404).json({ message: "Cocktail not found!" });
        }

        if (!cocktail.isDeletable) {
            return res.status(403).json({ message: "Cocktail cannot be deleted!" });
        }

        await Cocktail.findByIdAndRemove(req.params.id);
        res.status(200).json({ message: "Cocktail deleted successfully!", cocktail });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete cocktail.", error });
    }
});


router.get('/favorites', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user) {
            res.json(user.favorites);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user favorites.", error });
    }
});

router.put('/:id/favorite', verifyToken, async (req, res) => {
    const cocktailId = req.params.id;
    const userId = req.userId;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // provjeri ima li favorita
        const index = user.favorites.indexOf(cocktailId);
        
        if (index === -1) {
            // ako nije favorit, dodaj u favorite
            user.favorites.push(cocktailId);
        } else {
            // ako je favorit, makni favorit
            user.favorites.splice(index, 1);
        }

        await user.save();

        res.status(200).json({ message: "Updated favorites" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update favorite status.", error });
    }
});

module.exports = router;
