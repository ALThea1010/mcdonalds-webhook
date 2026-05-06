const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');

const app = express();
app.use(express.json());

// ─── Nutrition Database ───────────────────────────────────────────────────────
const NUTRITION = {
  // Burgers
  'big mac':                    { calories: 550, protein: 25, carbs: 45, fat: 30 },
  'double big mac':             { calories: 740, protein: 45, carbs: 46, fat: 42 },
  'mcchicken':                  { calories: 400, protein: 14, carbs: 40, fat: 21 },
  'crispy chicken sandwich':    { calories: 470, protein: 27, carbs: 45, fat: 20 },
  'spicy mcchicken':            { calories: 400, protein: 14, carbs: 41, fat: 21 },
  'quarter pounder':            { calories: 530, protein: 30, carbs: 41, fat: 27 },
  'double quarter pounder':     { calories: 740, protein: 48, carbs: 42, fat: 42 },
  'cheeseburger':               { calories: 300, protein: 15, carbs: 32, fat: 13 },
  'double cheeseburger':        { calories: 450, protein: 25, carbs: 34, fat: 24 },
  'mcdouble':                   { calories: 400, protein: 22, carbs: 33, fat: 20 },
  'hamburger':                  { calories: 250, protein: 12, carbs: 31, fat: 9  },
  'filet-o-fish':               { calories: 390, protein: 16, carbs: 38, fat: 19 },
  'mcrib':                      { calories: 480, protein: 22, carbs: 49, fat: 22 },

  // Nuggets
  'nuggets':                    { calories: 420, protein: 25, carbs: 25, fat: 25 },
  'nuggets 6':                  { calories: 250, protein: 15, carbs: 15, fat: 15 },
  'nuggets 9':                  { calories: 380, protein: 23, carbs: 23, fat: 23 },
  'nuggets 10':                 { calories: 420, protein: 25, carbs: 25, fat: 25 },
  'nuggets 20':                 { calories: 830, protein: 49, carbs: 50, fat: 49 },

  // Fries
  'fries':                      { calories: 320, protein: 4,  carbs: 40, fat: 15 },
  'small fries':                { calories: 230, protein: 3,  carbs: 29, fat: 11 },
  'medium fries':               { calories: 320, protein: 4,  carbs: 40, fat: 15 },
  'large fries':                { calories: 490, protein: 6,  carbs: 60, fat: 23 },

  // Coke
  'coke':                       { calories: 200, protein: 0,  carbs: 55, fat: 0  },
  'small coke':                 { calories: 150, protein: 0,  carbs: 40, fat: 0  },
  'medium coke':                { calories: 200, protein: 0,  carbs: 55, fat: 0  },
  'large coke':                 { calories: 280, protein: 0,  carbs: 76, fat: 0  },

  // Coffee
  'mccafe coffee':              { calories: 0,   protein: 0,  carbs: 0,  fat: 0  },
  'small mccafe coffee':        { calories: 0,   protein: 0,  carbs: 0,  fat: 0  },
  'medium mccafe coffee':       { calories: 0,   protein: 0,  carbs: 0,  fat: 0  },
  'large mccafe coffee':        { calories: 0,   protein: 0,  carbs: 0,  fat: 0  },

  // McFlurry
  'mcflurry':                   { calories: 510, protein: 12, carbs: 81, fat: 16 },
  'small mcflurry':             { calories: 340, protein: 8,  carbs: 53, fat: 11 },
  'medium mcflurry':            { calories: 510, protein: 12, carbs: 81, fat: 16 },
  'large mcflurry':             { calories: 690, protein: 16, carbs: 108, fat: 21 },
  'oreo mcflurry':              { calories: 510, protein: 12, carbs: 81, fat: 16 },
  'caramel mcflurry':           { calories: 520, protein: 11, carbs: 83, fat: 17 },

  // Breakfast
  'egg mcmuffin':               { calories: 310, protein: 17, carbs: 30, fat: 13 },
  'sausage mcmuffin':           { calories: 400, protein: 14, carbs: 29, fat: 26 },
  'sausage mcmuffin with egg':  { calories: 480, protein: 21, carbs: 30, fat: 31 },
  'bacon egg mcmuffin':         { calories: 460, protein: 22, carbs: 31, fat: 28 },
  'mcgriddle':                  { calories: 420, protein: 11, carbs: 44, fat: 22 },
  'big breakfast':              { calories: 760, protein: 28, carbs: 51, fat: 48 },
  'hash brown':                 { calories: 150, protein: 1,  carbs: 15, fat: 9  },
  'hotcakes':                   { calories: 580, protein: 9,  carbs: 90, fat: 17 },

  // Drinks
  'orange juice':               { calories: 150, protein: 1,  carbs: 34, fat: 0  },
  'apple juice':                { calories: 100, protein: 0,  carbs: 25, fat: 0  },
  'vanilla latte':              { calories: 250, protein: 9,  carbs: 35, fat: 7  },
  'caramel latte':              { calories: 260, protein: 9,  carbs: 37, fat: 7  },
  'hot chocolate':              { calories: 370, protein: 13, carbs: 58, fat: 10 },

  // Desserts
  'vanilla cone':               { calories: 200, protein: 5,  carbs: 30, fat: 5  },
  'sundae':                     { calories: 330, protein: 8,  carbs: 56, fat: 9  },
  'apple pie':                  { calories: 250, protein: 2,  carbs: 33, fat: 13 },
  'chocolate chip cookie':      { calories: 170, protein: 2,  carbs: 22, fat: 8  },

  // Sides & Salads
  'caesar salad':               { calories: 180, protein: 18, carbs: 9,  fat: 8  },
};

// ─── Session Log ─────────────────────────────────────────────────────────────
const sessionLogs = {};

// ─── Flavored items that don't need size prefix ───────────────────────────────
const FLAVORED_ITEMS = [
  'oreo mcflurry',
  'caramel mcflurry',
  'vanilla latte',
  'caramel latte',
  'hot chocolate',
];

// ─── Items that need size prefix ─────────────────────────────────────────────
const SIZE_ITEMS = ['fries', 'coke', 'mccafe coffee', 'mcflurry'];

function needsSizePrefix(item) {
  return SIZE_ITEMS.some(s => item.toLowerCase().includes(s));
}

function isFlavoredItem(item) {
  return FLAVORED_ITEMS.some(f => item.toLowerCase() === f);
}

// ─── Helper: build nutrition key ─────────────────────────────────────────────
function buildKey(item, size, quantity) {
  const itemLower = item.toLowerCase();

  // handle nuggets with quantity
  if (itemLower.includes('nugget')) {
    return quantity ? `nuggets ${quantity}` : 'nuggets';
  }

  // flavored items — return as is, no size prefix
  if (isFlavoredItem(itemLower)) {
    return itemLower;
  }

  // items that need size prefix
  if (needsSizePrefix(itemLower)) {
    const resolvedSize = size || 'medium';
    return `${resolvedSize} ${itemLower}`;
  }

  return itemLower;
}

// ─── Intent Handlers ─────────────────────────────────────────────────────────
function logFood(agent) {
  const sessionId  = agent.session;
  const items      = [].concat(agent.parameters['mcdonalds-item'] || []);
  const sizes      = [].concat(agent.parameters['size']           || []);
  const quantities = [].concat(agent.parameters['quantity']       || []);
  const mealType   = (agent.parameters['meal-type'] || 'unspecified').toLowerCase();

  if (!sessionLogs[sessionId]) sessionLogs[sessionId] = [];

  if (items.length === 0) {
    agent.add("I didn't catch what you ate. Can you try again?");
    return;
  }

  const sizeQueue = [...sizes];
  let responseLines = [];
  let totalCals = 0;

  items.forEach((item, i) => {
    const quantity = quantities[i] || 1;

    // only consume a size from the queue if this item needs one
    let size = '';
    if (needsSizePrefix(item) && !isFlavoredItem(item.toLowerCase())) {
      size = sizeQueue.shift() || '';
    }

    const key       = buildKey(item, size, quantity);
    const nutrition = NUTRITION[key];

    if (!nutrition) {
      responseLines.push(`Sorry, I don't have data for "${key}" yet.`);
      return;
    }

    const multiplied = {
      calories: nutrition.calories * quantity,
      protein:  nutrition.protein  * quantity,
      carbs:    nutrition.carbs    * quantity,
      fat:      nutrition.fat      * quantity,
    };

    sessionLogs[sessionId].push({
      item:     key,
      mealType: mealType,
      ...multiplied,
    });

    totalCals += multiplied.calories;

    responseLines.push(
      `Logged ${quantity > 1 ? quantity + 'x ' : ''}${key}: ` +
      `${multiplied.calories} kcal | ` +
      `P: ${multiplied.protein}g | ` +
      `C: ${multiplied.carbs}g | ` +
      `F: ${multiplied.fat}g`
    );
  });

  if (mealType !== 'unspecified') {
    responseLines.unshift(`Meal: ${mealType.toUpperCase()}`);
  }

  if (items.length > 1) {
    responseLines.push(`\nAdded ${totalCals} kcal total to your log.`);
  }

  agent.add(responseLines.join('\n'));
}

function foodInfo(agent) {
  const item      = (agent.parameters['mcdonalds-item'] || '').toLowerCase();
  const size      = agent.parameters['size'] || '';
  const quantity  = agent.parameters['quantity'] || 1;
  const key       = buildKey(item, size, quantity);
  const nutrition = NUTRITION[key];

  if (!nutrition) {
    agent.add(`Sorry, I don't have nutritional data for "${key}" yet.`);
    return;
  }

  agent.add(
    `${key.toUpperCase()}\n` +
    `Calories: ${nutrition.calories} kcal\n` +
    `Protein:  ${nutrition.protein}g\n` +
    `Carbs:    ${nutrition.carbs}g\n` +
    `Fat:      ${nutrition.fat}g`
  );
}

function getDailySummary(agent) {
  const sessionId = agent.session;
  const log       = sessionLogs[sessionId] || [];

  if (log.length === 0) {
    agent.add("You haven't logged anything yet today! Try saying 'I had a Big Mac'.");
    return;
  }

  // group items by meal type
  const meals = {};
  log.forEach(entry => {
    const meal = entry.mealType || 'unspecified';
    if (!meals[meal]) meals[meal] = [];
    meals[meal].push(entry);
  });

  // build response grouped by meal
  let response = 'TODAY\'S SUMMARY\n\n';

  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'unspecified'];

  mealOrder.forEach(meal => {
    if (!meals[meal]) return;

    const mealItems = meals[meal];
    const mealTotals = mealItems.reduce((acc, e) => ({
      calories: acc.calories + e.calories,
      protein:  acc.protein  + e.protein,
      carbs:    acc.carbs    + e.carbs,
      fat:      acc.fat      + e.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    response += `${meal.toUpperCase()}\n`;
    mealItems.forEach(e => {
      response += `- ${e.item}: ${e.calories} kcal\n`;
    });
    response += `Subtotal: ${mealTotals.calories} kcal | P: ${mealTotals.protein}g | C: ${mealTotals.carbs}g | F: ${mealTotals.fat}g\n\n`;
  });

  // grand totals
  const totals = log.reduce((acc, entry) => ({
    calories: acc.calories + entry.calories,
    protein:  acc.protein  + entry.protein,
    carbs:    acc.carbs    + entry.carbs,
    fat:      acc.fat      + entry.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  response += `GRAND TOTAL\n`;
  response += `Calories: ${totals.calories} kcal\n`;
  response += `Protein:  ${totals.protein}g\n`;
  response += `Carbs:    ${totals.carbs}g\n`;
  response += `Fat:      ${totals.fat}g`;

  agent.add(response);
}

function resetLog(agent) {
  const sessionId = agent.session;
  sessionLogs[sessionId] = [];
  agent.add("Done! Your food log has been cleared. Start fresh!");
}

// ─── Webhook route ────────────────────────────────────────────────────────────
app.post('/webhook', (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  const intentMap = new Map([
    ['log.food',          logFood],
    ['food.info',         foodInfo],
    ['get.daily.summary', getDailySummary],
    ['reset.log',         resetLog],
  ]);

  agent.handleRequest(intentMap);
});

// ─── Health check route ───────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('MacNutrition webhook is running!');
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MacNutrition webhook running on port ${PORT}`);
});
