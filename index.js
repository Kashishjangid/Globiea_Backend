require('dotenv').config();
const express = require('express'); 
const connectDB = require('./config/db');
const cors = require('cors');
const app = express();

const authRoutes = require('./Routes/authRoutes');
const blogRoutes = require('./Routes/blogRoutes');
const aiRoutes = require('./Routes/aiRoutes');

connectDB();

const corsOptions = {
    // Frontend is now on port 5173
    origin: '*', 
    credentials: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization,x-auth-token', 
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});



app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});