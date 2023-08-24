const mongoose = require('mongoose');

const CocktailSchema = mongoose.Schema({
    name: String,
    ingredients: {
        alcohol: [String],
        juice: [String],
        other: [String]
    },
    isDeletable: { type: Boolean, default: true }
});


module.exports = mongoose.model('Cocktail', CocktailSchema);
