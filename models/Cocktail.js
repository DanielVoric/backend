const mongoose = require('mongoose');

const CocktailSchema = mongoose.Schema({
    name: String,
    ingredients: {
        alcohol: [String],
        juice: [String],
        other: [String]
    },
    isFavorite: { type: Boolean, default: false }
});


module.exports = mongoose.model('Cocktail', CocktailSchema);
