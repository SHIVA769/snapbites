const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateContent = async (req, res) => {
    try {
        const { dishName, restaurantName, atmosphere } = req.body;

        if (!process.env.GOOGLE_API_KEY) {
            return res.status(500).json({ message: 'AI Service configuration missing' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            You are a social media expert for SnapBite, a food discovery app.
            Generate creative content for a reel about:
            Dish: ${dishName || 'a delicious meal'}
            Restaurant: ${restaurantName || 'a great place'}
            Atmosphere: ${atmosphere || 'vibrant'}

            Please provide the response in valid JSON format with exactly these keys:
            "captions": [Array of 3 creative, short captions],
            "hashtags": [Array of 8-10 trending food hashtags beginning with #],
            "description": "One appetizing, detailed 2-sentence description of the food"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from potential markdown blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI returned invalid format');
        }

        const content = JSON.parse(jsonMatch[0]);
        res.json(content);
    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ message: 'Failed to generate AI content' });
    }
};

const getCreatorInsights = async (req, res) => {
    try {
        const { stats } = req.body;

        if (!stats) {
            return res.status(400).json({ message: 'Stats data is required' });
        }

        if (!process.env.GOOGLE_API_KEY) {
            console.error('AI Insights Error: GOOGLE_API_KEY missing');
            return res.status(500).json({ message: 'AI Service configuration missing' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            You are a Creator Growth AI for SnapBite, a food discovery social app. 
            Analyze this creator's performance and provide 3-5 high-impact, actionable insights.
            
            Current Stats:
            - Total Reels Created: ${stats.reelCount || 0}
            - Total Views: ${stats.totalViews || 0}
            - Total Likes: ${stats.totalLikes || 0}
            - Total Orders Driven: ${stats.totalOrders || 0}
            - Conversion Rate (Views to Orders): ${stats.conversionRate || 0}%

            Instructions:
            1. Provide the response as a JSON object.
            2. The JSON must have one key "insights" which is an array of objects.
            3. Each object must have:
               - "type": One of "Engagement", "Conversion", or "Content"
               - "text": A specific, helpful sentence (e.g., "Your Italian reels are converting 20% better than others")
               - "impact": Either "High" or "Medium"
            
            Context for AI: If orders are low relative to views, suggest improving call-to-actions or menu tagging. If likes are low, suggest more engaging captions.
        `;

        console.log('Generating AI Insights with prompt stats:', stats);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('AI Response Text:', text);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('AI returned invalid format. Raw text:', text);
            throw new Error('AI returned non-JSON format');
        }

        const content = JSON.parse(jsonMatch[0]);
        res.json(content);
    } catch (error) {
        console.error('Detailed AI Insights Error:', error);
        res.status(500).json({
            message: 'Failed to generate AI insights',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { generateContent, getCreatorInsights };
