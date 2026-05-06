const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');

const app = express();
app.use(express.json());

// ─── Nutrition Database ───────────────────────────────────────────────────────
const NUTRITION = {
  // Burgers
  'big mac':                  { calories: 550, protein: 25, carbs: 45, fat: 30 },
  'double big mac':           { calories: 740, protein: 45, carbs: 46, fat: 42 },
  'mcchicken':                { calories: 400, protein: 14, carbs: 40, fat: 21 },
  'crispy chicken sandwich':  { calories: 470, protein: 27, carbs: 45, fat: 20 },
  'spicy mcchicken':          { calories: 400, protein: 14, carbs: 41, fat: 21 },
  'quarter pounder':          { calories: 530, protein: 30, carbs: 41, fat: 27 },
  'double quarter pounder':   { calories: 740, protein: 48, carbs: 42, fat: 42 },
  'cheeseburger':             { calories: 300, protein: 15, carbs: 32, fat: 13 },
  'double cheeseburger':      { calories: 450, protein: 25, carbs: 34, fat: 24 },
  'mcdouble':                 { calories: 400, protein: 22, carbs: 33, fat: 20 },
  'hamburger':                { calories: 250, protein: 12, carbs: 31, fat: 9  },
  'filet-o-fish':             { calories: 390, protein: 16, carbs: 38, fat: 19 },
  'mcrib':                    { calories: 480, protein: 22, carbs: 49, fat: 22 },

  // Nuggets
  'nuggets 6':                { calories: 250, protein: 15, carbs: 15, fat: 15 },
  'nuggets 9':                { calories: 380, protein: 23, carbs: 23, fat: 23 },
  'nuggets 10':               { calories: 420, protein: 25, carbs: 25, fat: 25 },
  'nuggets 20':               { calories: 830, protein: 49, carbs: 50, fat: 49 },

  // Fries
  'small fries':              { calories: 230, protein: 3,  carbs: 29, fat: 11 },
  'medium fries':             { calories: 320, protein: 4,  carbs: 40, fat: 15 },
  'large fries':              { calories: 490, protein: 6,  carbs: 60, fat: 23 },

  // Breakfast
  'egg mcmuffin':             { calories: 310, protein: 17, carbs: 30, fat: 13 },
  'sausage mcmuffin':         { calories: 400, protein: 14, carbs: 29, fat: 26 },
  'sausage mcmuffin with egg':{ calories: 480, protein: 21, carbs: 30, fat: 31 },
  'bacon egg mcmuffin':       { calories: 460, protein: 22, carbs: 31, fat: 28 },
  'mcgriddle':                { calories: 420, protein: 11, carbs: 44, fat: 22 },
  'big breakfast':            { calories: 760, protein: 28, carbs: 51, fat: 48 },
  'hash brown':               { calories: 150, protein: 1,  carbs: 15, fat: 9  },
  'hotcakes':                 { calories: 580, protein: 9,  carbs: 90, fat: 17 },
  'oatmeal':                  { calories: 290, protein: 5,  carbs: 57, fat: 4  },

  // Drinks
  'small coke':               { calories: 150, protein: 0,  carbs: 40, fat: 0  },
  'medium coke':              { calories: 200, protein: 0,  carbs: 55, fat: 0  },
  'large coke':               { calories: 280, protein: 0,  carbs: 76, fat: 0  },
  'orange juice':             { calories: 150, protein: 1,  carbs: 34, fat: 0  },
  'apple juice':              { calories: 100, protein: 0,  carbs: 25, fat: 0  },
  'small coffee':             { calories: 0,   protein: 0,  carbs: 0,  fat: 0  },
  'medium coffee':            { calories: 0,   protein: 0,  carbs: 0,  fat: 0  },
  'large coffee':             { calories: 0,   protein: 0,  carbs: 0,  fat: 0  },
  'vanilla latte':            { calories: 250, protein: 9,  carbs: 35, fat: 7  },
  'caramel latte':            { calories: 260, protein: 9,  carbs: 37, fat: 7  },
  'hot chocolate':            { calories: 370, protein: 13, carbs: 58, fat: 10 },

  // Desserts
  'small mcflurry':           { calories: 340, protein: 8,  carbs: 53, fat: 11 },
  'oreo mcflurry':            { calories: 510, protein: 12, carbs: 81, fat: 16 },
  'caramel mcflurry':         { calories: 520, protein: 11, carbs: 83, fat: 17 },
  'vanilla cone':             { calories: 200, protein: 5,  carbs: 30, fat: 5  },
  'sundae':                   { calories: 330, protein: 8,  carbs: 56, fat: 9  },
  'apple pie':                { calories: 250, protein: 2,  carbs: 33, fat: 13 },
  'chocolate chip cookie':    { calories: 170, protein: 2,  carbs: 22, fat: 8  },

  // Sides & Salads
  'side salad':               { calories: 20,  protein: 1,  carbs: 4,  fat: 0  },
  'caesar salad':             { calories: 180, protein: 18, carbs: 9,  fat: 8  },
  'apple slices':             { calories: 15,  protein: 0,  carbs: 4,  fat: 0  },
  'yogurt parfait':           { calories: 150, protein: 4,  carbs: 30, fat: 2  },
};

// ─── Session Log ─────────────────────────────────────────────────────────────
const sessionLogs = {};

// ─── Helper: check if item needs a size prefix ────────────────────────────────
function needsSizePrefix(item) {
  const sizeItems = ['fries', 'coke', 'coffee', 'mcflurry'];
  return sizeItems.some(s => item.toLowerCase().includes(s));
}

// ─── Helper: build nutrition key ─────────────────────────────────────────────
function buildKey(item, size, quantity) {
  // Handle nuggets with quantity
  if (item.toLowerCase().includes('nugget')) {
    return `nuggets ${quantity || 10}`;
  }
  // Handle items that need size prefix
  if (needsSizePrefix(item)) {
    const resolvedSize = size || 'medium';
    return `${resolvedSize} ${item}`.toLowerCase();
  }
  return item.toLowerCase();
}

// ─── Intent Handlers ─────────────────────────────────────────────────────────
function logFood(agent) {
  const sessionId  = agent.session;
  const items      = [].concat(agent.parameters['mcdonalds-item'] || []);
  const sizes      = [].concat(agent.parameters['size']           || []);
  const quantities = [].concat(agent.parameters['quantity']       || []);

  if (!sessionLogs[sessionId]) sessionLogs[sessionId] = [];

  if (items.length === 0) {
    agent.add("I didn't catch what you ate. Can you try again?");
    return;
  }

  // separate sizes into a queue only for items that need it
  const sizeQueue = [...sizes];
  let responseLines = [];
  let totalCals = 0;

  items.forEach((item, i) => {
    const quantity = quantities[i] || 1;

    // only consume a size from the queue if this item needs one
    let size = '';
    if (needsSizePrefix(item)) {
      size = sizeQueue.shift() || 'medium';
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

    sessionLogs[sessionId].push({ item: key, ...multiplied });
    totalCals += multiplied.calories;

    responseLines.push(
      `Logged ${quantity > 1 ? quantity + 'x ' : ''}${key}: ` +
      `${multiplied.calories} kcal | ` +
      `P: ${multiplied.protein}g | ` +
      `C: ${multiplied.carbs}g | ` +
      `F: ${multiplied.fat}g`
    );
  });

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

  const totals = log.reduce((acc, entry) => ({
    calories: acc.calories + entry.calories,
    protein:  acc.protein  + entry.protein,
    carbs:    acc.carbs    + entry.carbs,
    fat:      acc.fat      + entry.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const itemList = log.map(e => e.item).join(', ');

  agent.add(
    `TODAY'S SUMMARY\n` +
    `Items: ${itemList}\n\n` +
    `Total Calories: ${totals.calories} kcal\n` +
    `Protein:  ${totals.protein}g\n` +
    `Carbs:    ${totals.carbs}g\n` +
    `Fat:      ${totals.fat}g`
  );
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
