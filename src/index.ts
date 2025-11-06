import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { AppDataSource } from './config/database';
import { connectRedis } from './config/redis';
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';
import webhookRoutes from './routes/webhook.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Patisserie API',
      version: '1.0.0',
      description: 'API pour la gestion de commandes d\'une pâtisserie artisanale',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);
app.use('/products', productRoutes);
app.use('/webhooks', webhookRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  console.error('Error stack:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    try {
      await connectRedis();
    } catch (redisError) {
      console.warn('Redis connection failed, continuing without Redis:', redisError);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

