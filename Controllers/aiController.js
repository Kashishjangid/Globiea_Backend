const OpenAI = require('openai');

const KB = `
Product: MiniBlog MERN
Description: A blogging platform using MongoDB, Express, React, Node.
Features: User authentication, blog creation, editing, deleting, image uploads, view all blogs, view my blogs.
Tech Stack: MongoDB, Express.js, React, Node.js, JWT authentication, Multer for file uploads.
Support: For issues, check the documentation or contact support.
`;

// Local fallback responses
const FALLBACK_RESPONSES = {
  'features': 'MiniBlog MERN features include: User authentication, Create/Edit/Delete blogs, Image uploads, View all blogs, View my blogs, AI support agent.',
  'tech stack': 'MiniBlog is built with MERN stack: MongoDB, Express.js, React, Node.js. Additional technologies: JWT for authentication, Multer for file uploads.',
  'support': 'For support, please check the documentation or contact the development team.',
  'how to create blog': 'To create a blog: 1. Log in to your account 2. Click on the blog creation form 3. Add title and content 4. Optionally upload an image 5. Click publish',
  'how to edit blog': 'To edit your blog: 1. Go to "My Posts" view 2. Hover over your blog card 3. Click the edit button 4. Make your changes 5. Save the updates',
  'default': 'I can help you with information about MiniBlog MERN features, tech stack, and how to use the platform. What would you like to know?'
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Local fallback function when OpenAI is unavailable
 */
const getLocalResponse = (question) => {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('feature')) {
    return FALLBACK_RESPONSES.features;
  } else if (lowerQuestion.includes('tech') || lowerQuestion.includes('stack')) {
    return FALLBACK_RESPONSES['tech stack'];
  } else if (lowerQuestion.includes('support') || lowerQuestion.includes('help')) {
    return FALLBACK_RESPONSES.support;
  } else if (lowerQuestion.includes('create') || lowerQuestion.includes('make') || lowerQuestion.includes('write')) {
    return FALLBACK_RESPONSES['how to create blog'];
  } else if (lowerQuestion.includes('edit') || lowerQuestion.includes('update') || lowerQuestion.includes('modify')) {
    return FALLBACK_RESPONSES['how to edit blog'];
  } else {
    return FALLBACK_RESPONSES.default;
  }
};

/**
 * @desc Handles user queries to the AI support agent
 * @route POST /api/ai/query
 * @access Public
 */
const answerQuery = async (req, res) => {
  const { question } = req.body;
  
  console.log('AI Query Received:', question);
  
  if (!question) {
    return res.status(400).json({ msg: "Question is required." });
  }

  // Check if we should use OpenAI or fallback
  const useOpenAI = process.env.USE_OPENAI !== 'false' && process.env.OPENAI_API_KEY;
  
  if (!useOpenAI) {
    console.log('Using local fallback response');
    const localResponse = getLocalResponse(question);
    return res.json({ 
      answer: localResponse,
      note: 'Response from local knowledge base'
    });
  }

  try {
    console.log('Making OpenAI API call...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: `You are a support agent for MiniBlog MERN. Answer strictly using only the following context: ${KB}. If the question cannot be answered from this context, politely say you don't have that information. Do not invent facts. Keep responses under 150 words.` 
        },
        { role: "user", content: question }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    
    console.log('OpenAI Response:', completion.choices[0].message.content);
    
    res.json({ 
      answer: completion.choices[0].message.content,
      note: 'Response from AI'
    });
    
  } catch (err) {
    console.error("AI API Error:", err.message);
    
    // Use fallback when OpenAI fails
    console.log('OpenAI failed, using local fallback');
    const localResponse = getLocalResponse(question);
    
    res.json({ 
      answer: localResponse,
      note: 'Response from local knowledge base (AI service temporarily unavailable)',
      error: err.message
    });
  }
};

module.exports = {
  answerQuery
};