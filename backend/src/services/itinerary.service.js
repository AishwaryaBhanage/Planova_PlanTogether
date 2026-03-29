const Anthropic = require('@anthropic-ai/sdk');
const env = require('../config/env');

const client = new Anthropic({ apiKey: env.anthropicApiKey });

async function generateItinerary({ planName, type, description, startDate, endDate, memberCount }) {
  const numDays = calculateDays(startDate, endDate);

  const prompt = `You are a travel and event planning expert. Generate a detailed day-by-day itinerary for the following plan:

Plan: ${planName}
Type: ${type}
Description: ${description || 'No description provided'}
Start Date: ${startDate}
End Date: ${endDate || startDate}
Number of Days: ${numDays}
Group Size: ${memberCount} people

Generate a JSON response with this exact structure (no markdown, just raw JSON):
{
  "days": [
    {
      "dayNumber": 1,
      "date": "${startDate}",
      "title": "Day 1 - Arrival & Exploration",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Activity name",
          "description": "Brief description of the activity",
          "location": "Specific location or venue",
          "type": "travel|food|sightseeing|activity|rest|meeting|shopping|entertainment",
          "estimatedCost": 0
        }
      ],
      "notes": "Any tips or notes for this day"
    }
  ]
}

Rules:
- Each day should have 4-6 activities spread throughout the day
- Include realistic times, locations, and cost estimates in USD
- Consider the group size for recommendations
- For trip type: include travel, sightseeing, food, and rest activities
- For birthday type: include party setup, games, cake, and celebration activities
- For event/conference type: include sessions, networking, and breaks
- Make it practical and enjoyable
- Return ONLY valid JSON, no other text`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].text;
  const parsed = JSON.parse(responseText);
  return parsed.days;
}

function calculateDays(startDate, endDate) {
  if (!endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diff);
}

module.exports = { generateItinerary };
