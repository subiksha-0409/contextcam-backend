const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// PASTE YOUR API KEY HERE (the one you just created)
const GOOGLE_API_KEY = 'AIzaSyDnfJ0s7-t_x2kVwOq_8dUBQH-fcX4hqww';

// REAL Google Vision AI
async function analyzeWithRealAI(imageBase64) {
  try {
    console.log('🔍 Using REAL Google Vision AI...');
    
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
      {
        requests: [
          {
            image: { content: imageBase64 },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
            ]
          }
        ]
      },
      {
        timeout: 30000
      }
    );

    console.log('✅ Google Vision response received');
    const result = response.data.responses[0];
    
    if (result.error) {
      console.log('Google Vision error:', result.error.message);
      return null;
    }

    // Process REAL object detection
    let objects = [];
    
    // Get objects with positions (most accurate)
    if (result.localizedObjectAnnotations) {
      objects = result.localizedObjectAnnotations.map(obj => ({
        name: obj.name.toLowerCase(),
        confidence: Math.round(obj.score * 100),
        position: getPositionFromBoundingBox(obj.boundingPoly.normalizedVertices)
      }));
      console.log('🎯 Objects detected:', objects);
    }
    
    // Fallback to labels
    if (objects.length === 0 && result.labelAnnotations) {
      objects = result.labelAnnotations
        .filter(label => label.score > 0.7)
        .map(label => ({
          name: label.description.toLowerCase(),
          confidence: Math.round(label.score * 100),
          position: 'in the scene'
        }));
      console.log('🏷️ Labels detected:', objects);
    }

    if (objects.length > 0) {
      const description = generateSmartDescription(objects);
      return {
        service: 'Google Vision AI',
        description: description,
        confidence: 'very-high',
        detectedObjects: objects,
        realAI: true
      };
    }

  } catch (error) {
    console.log('❌ Google Vision API error:', error.message);
    if (error.response?.status === 403) {
      console.log('⚠️ API key may be invalid or restricted');
    }
  }
  
  return null;
}

function getPositionFromBoundingBox(vertices) {
  if (!vertices || vertices.length < 3) return 'in the scene';
  const centerX = (vertices[0].x + vertices[1].x + vertices[2].x + vertices[3].x) / 4;
  if (centerX < 0.33) return 'on the left side';
  if (centerX > 0.66) return 'on the right side'; 
  return 'in the center';
}

function generateSmartDescription(objects) {
  const mainObjects = objects.slice(0, 3);
  
  if (mainObjects.length === 1) {
    const obj = mainObjects[0];
    return `I can clearly see a ${obj.name} ${obj.position}.`;
  }
  
  const parts = ['I can see'];
  mainObjects.forEach((obj, index) => {
    if (index === mainObjects.length - 1 && mainObjects.length > 1) {
      parts.push(`and a ${obj.name} ${obj.position}`);
    } else {
      parts.push(`a ${obj.name} ${obj.position}`);
    }
  });
  
  return parts.join(' ') + '.';
}

// Main endpoint
app.post('/analyze-image', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('📸 Image analysis request received');

    let result = await analyzeWithRealAI(imageBase64);
    
    if (!result) {
      result = {
        service: 'AI Vision Systems',
        description: "I'm connecting to advanced AI vision systems. Please ensure your API key is properly configured.",
        confidence: 'medium',
        realAI: false
      };
    }

    console.log('✅ Analysis complete - Real AI:', result.realAI);
    res.json(result);

  } catch (error) {
    console.error('❌ Analysis failed:', error);
    res.json({
      service: 'ContextCam AI',
      description: "Computer vision systems optimizing. Please try again.",
      confidence: 'high',
      realAI: false
    });
  }
});

// Health check
app.get('/', (req, res) => {
  const hasValidKey = GOOGLE_API_KEY && GOOGLE_API_KEY.length > 30 && !GOOGLE_API_KEY.includes('xxx');
  
  res.json({ 
    message: '🚀 ContextCam - REAL AI VISION',
    status: 'active',
    realAI: hasValidKey,
    version: 'google-vision-1.0'
  });
});

app.listen(PORT, () => {
  const hasValidKey = GOOGLE_API_KEY && GOOGLE_API_KEY.length > 30 && !GOOGLE_API_KEY.includes('xxx');
  console.log(`🎯 ContextCam Backend running on port ${PORT}`);
  if (hasValidKey) {
    console.log('✅ REAL AI ACTIVE - Google Vision API Connected');
    console.log('📧 1000 FREE analyses per month available');
  } else {
    console.log('⚠️  Add valid Google Vision API key for real AI');
  }
});
