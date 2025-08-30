import OpenAI from 'openai';

export interface ParsedTask {
  original: string;
  tasks: {
    type: string;
    category: string;
    description: string;
  }[];
}

export class AIService {


  static async parseTask(taskInput: string): Promise<ParsedTask> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY||'';


      const client = new OpenAI({ baseURL: "https://openrouter.ai/api/v1", apiKey, dangerouslyAllowBrowser: true });


      const prompt = `You are an errand planning assistant. Parse the following user input and extract individual tasks, categorizing each one.

User input: "${taskInput}"

For each task, determine:
1. type: A short descriptive name for the task
2. category: One of these categories: grocery, pharmacy, restaurant, cafe, bank, gas_station, shopping
3. description: A brief description of what needs to be done

Respond with a JSON object in this format:
{
  "tasks": [
    {
      "type": "grocery shopping",
      "category": "grocery",
      "description": "Buy groceries and food items"
    }
  ]
}

Categories mapping:
- grocery: supermarkets, grocery stores, food shopping
- pharmacy: pharmacies, medicine, prescriptions, drugstores
- restaurant: restaurants, dining, meals, lunch, dinner
- cafe: coffee shops, cafes, tea, beverages
- bank: banks, ATMs, financial services
- gas_station: gas stations, fuel, petrol
- shopping: retail stores, shopping malls, general shopping
- gym: gyms, fitness centers, workout, exercise, fitness

If the input is unclear or doesn't match any category, default to "shopping".`;

      const completion = await client.chat.completions.create({
        model: 'openai/gpt-oss-20b:free',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON API. Only output valid JSON. Do not include any text, explanation, or formatting outside the JSON object. If you cannot answer, return {"tasks":[]}.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      });

      var response = completion.choices[0].message.content;

      if (!response) {
        throw new Error('No response from OpenRouter');
      }

      const jsonMatch = response.match(/{\"tasks\":.*}$/s); // s flag allows . to match newline


      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr); // parse into object
      console.log(parsed);

      
      console.log("parsed response openrouter:- ", parsed);

      return {
        original: taskInput,
        tasks: parsed.tasks || []
      };
    } catch (error) {
      console.error('Error parsing task with AI:', error);

      // Fallback to simple keyword matching if AI fails
      return this.fallbackParse(taskInput);
    }
  }

  private static fallbackParse(taskInput: string): ParsedTask {
    const taskMap: { [key: string]: { type: string; category: string } } = {
      'grocery': { type: 'grocery shopping', category: 'grocery' },
      'groceries': { type: 'grocery shopping', category: 'grocery' },
      'food': { type: 'grocery shopping', category: 'grocery' },
      'medicine': { type: 'pharmacy visit', category: 'pharmacy' },
      'prescription': { type: 'pharmacy visit', category: 'pharmacy' },
      'pharmacy': { type: 'pharmacy visit', category: 'pharmacy' },
      'meds': { type: 'pharmacy visit', category: 'pharmacy' },
      'coffee': { type: 'coffee break', category: 'cafe' },
      'tea': { type: 'tea break', category: 'cafe' },
      'cafe': { type: 'cafe visit', category: 'cafe' },
      'lunch': { type: 'lunch', category: 'restaurant' },
      'dinner': { type: 'dinner', category: 'restaurant' },
      'restaurant': { type: 'dining', category: 'restaurant' },
      'eat': { type: 'dining', category: 'restaurant' },
      'bank': { type: 'banking', category: 'bank' },
      'atm': { type: 'banking', category: 'bank' },
      'gas': { type: 'fuel up', category: 'gas_station' },
      'fuel': { type: 'fuel up', category: 'gas_station' },
      'shop': { type: 'shopping', category: 'shopping' },
      'shopping': { type: 'shopping', category: 'shopping' },
      'store': { type: 'shopping', category: 'shopping' },
      'gym': { type: 'workout', category: 'gym' }, // Added gym
      'workout': { type: 'workout', category: 'gym' }, // Also map workout to gym
      'fitness': { type: 'workout', category: 'gym' } // Also map fitness to gym
    };

    const lowerInput = taskInput.toLowerCase();
    const foundTasks: { type: string; category: string; description: string }[] = [];

    Object.keys(taskMap).forEach(keyword => {
      if (lowerInput.includes(keyword)) {
        const task = taskMap[keyword];
        if (!foundTasks.find(t => t.type === task.type)) {
          foundTasks.push({
            ...task,
            description: `Find ${task.type} location`
          });
        }
      }
    });

    // If no specific tasks found, default to shopping
    if (foundTasks.length === 0) {
      foundTasks.push({
        type: 'general shopping',
        category: 'shopping',
        description: 'Find shopping location'
      });
    }

    return {
      original: taskInput,
      tasks: foundTasks
    };
  }
}
