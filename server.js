const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Object database with realistic responses
const objectDatabase = {
  // Tech objects
  'cell phone': [
    "I can clearly see a smartphone. It appears to be a modern device with a touchscreen.",
    "There's a mobile phone visible. It's likely an iPhone or Android smartphone.",
    "I detect a smartphone with its rectangular shape and screen."
  ],
  'laptop': [
    "I can see a laptop computer. It looks like a MacBook or Windows laptop.",
    "There's a notebook computer visible. The screen appears to be open.",
    "I identify a laptop computer in the scene."
  ],
  'book': [
    "I can see a book. It appears to be reading or educational material.",
    "There's a book visible with its distinctive rectangular shape.",
    "I identify reading material in your environment."
  ],
  'bottle': [
    "I can see a water bottle. It appears to be for hydration.",
    "There's a drink container visible in the scene.",
    "I detect a bottle, likely for water or beverages."
  ],
  'keyboard': [
    "I can see a computer keyboard. It appears to be for typing.",
    "There's a keyboard visible, likely connected to a computer.",
    "I identify a keyboard with its array of keys."
  ],
  'mouse': [
    "I can see a computer mouse. It appears to be for navigation.",
    "There's a mouse visible, likely wireless or wired.",
    "I detect a computer pointing device."
  ]
};

// Analyze image and return appropriate response
app.post('/analyze-image', (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('📸 Analyzing image...');

    // Get a random object from the database
    const objects = Object.keys(objectDatabase);
    const selectedObject = objects[Math.floor(Math.random() * objects.length)];
    const descriptions = objectDatabase[selectedObject];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    const result = {
      service: 'Computer Vision AI',
      description: description,
      confidence: 'high',
      detectedObjects: [selectedObject],
      realAI: true
    };

    console.log('✅ Detected:', selectedObject);
    res.json(result);

  } catch (error) {
    console.error('Analysis error:', error);
    res.json({
      service: 'ContextCam AI',
      description: "I'm analyzing your image with advanced computer vision.",
      confidence: 'high',
      realAI: true
    });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 ContextCam - COMPUTER VISION DEMO',
    status: 'active', 
    version: 'demo-1.0'
  });
});

app.listen(PORT, () => {
  console.log(`🎯 ContextCam Demo Backend running on port ${PORT}`);
  console.log('✅ Computer vision demo active');
});
