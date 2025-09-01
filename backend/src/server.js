const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const errorHandler = require('./middleware/error.middleware');
require('dotenv').config();

const connectDB = require('./config/db');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const upload = require('./middleware/upload.middleware'); // Import upload middleware for avatars
const uploadPostMedia = require('./middleware/uploadPostMedia.middleware'); // Import upload middleware for post media
const authController = require('./controllers/auth/auth'); // Import authController
const postService = require('./services/post/post'); // Import postService
const { verifyToken } = require('./services/auth/auth'); // Import verifyToken

async function startServer() {
  const app = express();
  
  await connectDB();
  // Security middleware
  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  
  // Connect to MongoDB
  

app.post('/register-with-avatar', (req, res, next) => {
  upload.single('avatar')(req, res, function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message || 'File upload error' });
    }

    // No error, continue to your logic
    const { username, email, password, name } = req.body;
    const avatar = req.file ? req.file.path : null;

    authController.register(username, email, password, name, avatar)
      .then(result => res.status(201).json(result))
      .catch(error => {
        console.error("Registration error:", error);
        res.status(400).json({ message: error.message });
      });
  });
});


  app.post('/create-post-with-media', uploadPostMedia, async (req, res) => {
    try {
      const { content } = req.body;
      const media = req.files ? req.files.map(file => file.path) : []; // Array of Cloudinary URLs

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
      }

      const token = authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
      }

      let decodedToken;
      try {
        decodedToken = verifyToken(token); // Pass only the token
      } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
      }
      const userId = decodedToken.id; // Extract user ID from decoded token

      const result = await postService.createPost(content, media, userId);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating post with media:", error);
      res.status(400).json({ message: error.message });
    }
  });
  
  // Create schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  
  // Create Apollo Server
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req }) => ({ req }),
  });
  
  // Start Apollo Server
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });
  
  // Use WebSocket server for GraphQL subscriptions
  useServer(
    {
      schema,
      context: (ctx) => ctx,
    },
    wsServer
  );
  
  const PORT = process.env.PORT || 4000;
  
  // Start server
  httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}/graphql`);
    console.log(`New registration endpoint: http://localhost:${PORT}/register-with-avatar`);
    console.log(`New post creation endpoint: http://localhost:${PORT}/create-post-with-media`);
  });
}

startServer().catch(console.error);