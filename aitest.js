// import { OpenAI } from 'openai/client.js';
// const apiKey =
//   ' ""';

// const client = new OpenAI({
//   baseURL: 'https://openrouter.ai/api/v1',
//   apiKey,
//   dangerouslyAllowBrowser: true,
// });
// const taskInput = 'Go for shopping then dinner then groceries';
// const prompt = `You are an errand planning assistant. Parse the following user input and extract individual tasks:

// User input: "${taskInput}"

// For each task, determine:
// 1. type: short descriptive name
// 2. category: one of these: grocery, pharmacy, restaurant, cafe, bank, gas_station, shopping
// 3. description: brief description of what needs to be done

// Respond strictly in this JSON format:
// {
//   "tasks": [
//     {
//       "type": "grocery shopping",
//       "category": "grocery",
//       "description": "Buy groceries and food items"
//     }
//   ]
// }

// Category mapping:
// - grocery: supermarkets, grocery stores, food shopping
// - pharmacy: pharmacies, medicine, prescriptions, drugstores
// - restaurant: restaurants, dining, meals, lunch, dinner
// - cafe: coffee shops, cafes, tea, beverages
// - bank: banks, ATMs, financial services
// - gas_station: gas stations, fuel, petrol
// - shopping: retail stores, shopping malls, general shopping

// If the input does not match any category, default to "shopping".
// Do NOT include any text outside the JSON object. Only output valid JSON.
// `;

// const completion = await client.chat.completions.create({
//   model: 'openai/gpt-oss-20b:free',
//   messages: [
//     {
//       role: 'system',
//       content:
//         'You are a strict JSON API. Output ONLY valid JSON. Do NOT add explanations, comments, notes, or any text outside the JSON object. Always respond with exactly one JSON object. If you cannot parse the input, return {"tasks":[]}.',
//     },
//     {
//       role: 'user',
//       content: prompt,
//     },
//   ],
//   temperature: 0.3,
// });
// let rawResponse = completion.choices[0].message.content || '';
// console.log('Raw response:', rawResponse);

// const jsonMatch = rawResponse.match(/{\"tasks\":.*}$/s); // s flag allows . to match newline

// if (jsonMatch) {
//   const jsonStr = jsonMatch[0];
//   const data = JSON.parse(jsonStr); // parse into object
//   console.log(data);
// } else {
//   console.log('JSON not found');
// }
import {categories} from "94b009d907d7c023"
// const API_KEY = ' ""';

// const response = await fetch(
//   'https://places-api.foursquare.com/v3/places/categories',
//   {
//     headers: {
//       Authorization: 'Bearer' + API_KEY,
//       'X-Places-Api-Version': '2025-06-17',
//       Accept: 'application/json',
//     },
//   }
// );

console.log('Categories response:', categories);
