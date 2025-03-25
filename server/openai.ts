import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "demo-key" });

// Lead scoring with AI
export async function scoreLeadWithAI(leadData: {
  firstName: string;
  lastName: string;
  company: string;
  industry: string;
  position: string;
  market: string;
  interactions?: { type: string; date: string }[];
}): Promise<{
  score: number;
  reasoning: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI lead scoring assistant for a CRM system focused on the IT and marketing industry. Score leads from 0-100 based on their potential value, with reasoning. Return a JSON object with score and reasoning properties."
        },
        {
          role: "user",
          content: `Please score this lead:
          Name: ${leadData.firstName} ${leadData.lastName}
          Company: ${leadData.company}
          Industry: ${leadData.industry}
          Position: ${leadData.position}
          Market: ${leadData.market}
          Interactions: ${JSON.stringify(leadData.interactions || [])}
          `
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      score: Math.max(0, Math.min(100, Math.round(result.score))),
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error("AI Lead Scoring Error:", error);
    return {
      score: 50,
      reasoning: "Error processing AI score, defaulting to neutral score."
    };
  }
}

// Generate company insights
export async function generateCompanyInsights(companyData: {
  name: string;
  industry: string;
  market: string;
  engagementScore: number;
}): Promise<{
  insights: string;
  recommendations: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI business intelligence assistant for a CRM system. Analyze company data and provide insights and actionable recommendations. Return a JSON object with insights (string) and recommendations (array of strings)."
        },
        {
          role: "user",
          content: `Please analyze this company:
          Name: ${companyData.name}
          Industry: ${companyData.industry}
          Market: ${companyData.market}
          Engagement Score: ${companyData.engagementScore}/100
          `
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("AI Company Insights Error:", error);
    return {
      insights: "Could not generate insights at this time.",
      recommendations: ["Try again later when the AI service is available."]
    };
  }
}

// Generate marketing suggestions
export async function generateMarketingSuggestions(data: {
  leads: { market: string; industry: string }[];
  companies: { market: string; industry: string }[];
}): Promise<{
  marketTrends: { market: string; trend: string }[];
  contentSuggestions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI marketing assistant for a CRM system. Analyze lead and company data to identify market trends and suggest content ideas. Return a JSON object with marketTrends (array of objects with market and trend properties) and contentSuggestions (array of strings)."
        },
        {
          role: "user",
          content: `Please analyze these leads and companies:
          Leads: ${JSON.stringify(data.leads)}
          Companies: ${JSON.stringify(data.companies)}
          `
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("AI Marketing Suggestions Error:", error);
    return {
      marketTrends: [{ market: "Global", trend: "Could not analyze market trends at this time." }],
      contentSuggestions: ["Try again later when the AI service is available."]
    };
  }
}

// Generate AI insights
export async function generateAiInsights(data: {
  recentLeads: number;
  leadsByMarket: Record<string, number>;
  leadsByStatus: Record<string, number>;
  activeProjects: number;
  tasksDueToday: number;
}): Promise<{
  insights: {
    type: string;
    title: string;
    description: string;
    actionText: string;
  }[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI insights generator for a CRM dashboard. Create 3-4 actionable insights based on the data provided. Return a JSON object with an insights array containing objects with type, title, description, and actionText properties."
        },
        {
          role: "user",
          content: `Please generate insights based on this data:
          Recent Leads: ${data.recentLeads}
          Leads by Market: ${JSON.stringify(data.leadsByMarket)}
          Leads by Status: ${JSON.stringify(data.leadsByStatus)}
          Active Projects: ${data.activeProjects}
          Tasks Due Today: ${data.tasksDueToday}
          `
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("AI Insights Generation Error:", error);
    return {
      insights: [
        {
          type: "error",
          title: "AI Service Unavailable",
          description: "The AI insights service is currently unavailable. Please try again later.",
          actionText: "Refresh"
        }
      ]
    };
  }
}
