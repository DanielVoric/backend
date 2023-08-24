const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cocktailRoutes = require('./Routes/cocktails'); 
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleman
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb+srv://koktelomat:UM3zTvaqcpDZZTaO@cluster0.jevhmyd.mongodb.net/?retryWrites=true&w=majority", { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

// Koristenje importane rute
app.use('/cocktails', cocktailRoutes); 
app.use('/auth', authRoutes);

// Starting the server
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
