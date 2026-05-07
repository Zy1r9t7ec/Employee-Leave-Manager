require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Routes
const leaveRoutes = require('./routes/leaveRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api', leaveRoutes);
app.use('/api', balanceRoutes);
app.use('/api', adminRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Employee Leave Management API - Server Running' });
});

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'up', 
    timestamp: new Date(), 
    uptime: process.uptime() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Start cron scheduler
require('./utils/scheduler');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
