require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const Item = require('./models/Item');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lost_and_found';

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage setup for Multer (if uploading files via multipart/form-data)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve uploaded static files
app.use('/uploads', express.static(uploadsDir));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Lost and Found API is running smoothly' });
});

// GET all items (newest first)
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to retrieve items' });
  }
});

// POST new item (supports both JSON body with image data and Multer multipart file upload)
app.post('/api/items', upload.single('imageFile'), async (req, res) => {
  try {
    const { title, description, location, contact } = req.body;
    let image = req.body.image;

    // If a file was uploaded through Multer
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    if (!title || !description || !image) {
      return res.status(400).json({
        error: 'Title, description, and image are required.',
      });
    }

    const newItem = new Item({
      title,
      description,
      image,
      location: location || 'Not specified',
      contact: contact || 'Not specified',
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to save item' });
  }
});

// DELETE item when marked as "Found"
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(400).json({ error: 'Item not found' });
    }

    // If item had a local file in /uploads, clean it up
    if (deletedItem.image && deletedItem.image.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, deletedItem.image);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting local image file:', err);
        });
      }
    }

    res.json({ message: 'Item marked as found and removed successfully', id });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Connect to MongoDB and start the server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
