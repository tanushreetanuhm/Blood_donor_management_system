import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/bloodDonorSystem');
        console.log('✓ MongoDB Connected Successfully!');
        console.log('✓ Database: bloodDonorSystem');
        console.log('✓ You can view data in MongoDB Compass');
    } catch (error) {
        console.error('✗ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

// Donor Schema
const donorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    bloodType: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    contactType: {
        type: String,
        required: true,
        enum: ['phone', 'email']
    },
    contact: {
        type: String,
        required: true,
        trim: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Donor = mongoose.model('Donor', donorSchema);

// Routes

// Get all donors
app.get('/api/donors', async (req, res) => {
    try {
        const donors = await Donor.find().sort({ createdAt: -1 });
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get donors by blood type
app.get('/api/donors/bloodtype/:type', async (req, res) => {
    try {
        const donors = await Donor.find({ bloodType: req.params.type });
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new donor
app.post('/api/donors', async (req, res) => {
    try {
        const donor = new Donor(req.body);
        const savedDonor = await donor.save();
        res.status(201).json(savedDonor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update donor
app.put('/api/donors/:id', async (req, res) => {
    try {
        const updatedDonor = await Donor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedDonor) {
            return res.status(404).json({ message: 'Donor not found' });
        }
        
        res.json(updatedDonor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete donor
app.delete('/api/donors/:id', async (req, res) => {
    try {
        const deletedDonor = await Donor.findByIdAndDelete(req.params.id);
        if (!deletedDonor) {
            return res.status(404).json({ message: 'Donor not found' });
        }
        
        res.json({ message: 'Donor deleted successfully', donor: deletedDonor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const total = await Donor.countDocuments();
        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const stats = {};
        
        for (const type of bloodTypes) {
            stats[type] = await Donor.countDocuments({ bloodType: type });
        }
        
        res.json({ total, bloodTypes: stats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 API Endpoints:`);
        console.log(`   GET    /api/donors - Get all donors`);
        console.log(`   POST   /api/donors - Add new donor`);
        console.log(`   PUT    /api/donors/:id - Update donor`);
        console.log(`   DELETE /api/donors/:id - Delete donor`);
        console.log(`   GET    /api/stats - Get statistics\n`);
    });
});
