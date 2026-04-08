const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Load mock data
const songsDataPath = path.join(__dirname, 'data', 'songs.json');
let songsData = [];

try {
    if (fs.existsSync(songsDataPath)) {
        songsData = JSON.parse(fs.readFileSync(songsDataPath, 'utf-8'));
    }
} catch (error) {
    console.error('Failed to load mock data', error);
}

app.get('/api/songs', (req, res) => {
    const { search } = req.query;
    if (search) {
        const query = search.toLowerCase();
        const results = songsData.filter(song => 
            song.title.toLowerCase().includes(query) || 
            song.artist.toLowerCase().includes(query)
        );
        return res.json(results);
    }
    res.json(songsData);
});

app.get('/api/songs/popular', (req, res) => {
    const popularSongs = songsData.filter(song => song.popular);
    res.json(popularSongs);
});

app.get('/api/songs/random', (req, res) => {
    if (songsData.length === 0) return res.status(404).json({ message: 'No songs available' });
    const randomSong = songsData[Math.floor(Math.random() * songsData.length)];
    res.json(randomSong);
});

app.get('/api/songs/:id', (req, res) => {
    const song = songsData.find(s => s.id === req.params.id);
    if (song) {
        res.json(song);
    } else {
        res.status(404).json({ message: 'Song not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
