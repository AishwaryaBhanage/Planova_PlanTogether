const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const dashboardRoutes = require('./routes/dashboard');
const taskRoutes = require('./routes/tasks');
const inviteRoutes = require('./routes/invite');
const itineraryRoutes = require('./routes/itinerary');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5174', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/plans', itineraryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    await sequelize.sync({ alter: true });
    console.log('Database tables synced');

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
