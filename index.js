const express = require('express');
const app = express();
app.use(express.json());

const menu = {
  'big mac': { name: '🍔 Big Mac', cal: 550, protein: '25g', carbs: '45g', fat: '29g', fiber: '3g' },
  'mcchicken': { name: '🍗 McChicken', cal: 400, protein: '14g', carbs: '41g', fat: '20g', fiber: '2g' },
  'quarter pounder': { name: '🍔 Quarter Pounder', cal: 740, protein: '42g', carbs: '42g', fat: '45g', fiber: '3g' },
  'filet-o-fish': { name: '🐟 Filet-O-Fish', cal: 390, protein: '16g', carbs: '39g', fat: '19g', fiber: '1g' },
  'fries': { name: '🍟 Fries', cal: 320, protein: '4g', carbs: '43g', fat: '15g', fiber: '3g' },
  'nuggets': { name: '🍗 Chicken Nuggets (6pc)', cal: 270, protein: '15g', carbs: '16g', fat: '16g', fiber: '1g' },
  'cheeseburger': { name: '🧀 Cheeseburger', cal: 300, protein: '15g', carbs: '33g', fat: '12g', fiber: '1g' },
  'double cheeseburger': { name: '🧀 Double Cheeseburger', cal: 450, protein: '25g', carbs: '34g', fat: '24g', fiber: '1g' },
  'hamburger': { name: '🍔 Hamburger', cal: 250, protein: '12g', carbs: '31g', fat: '9g', fiber: '1g' },
  'mcdouble': { name: '🍔 McDouble', cal: 400, protein: '22g', carbs: '33g', fat: '20g', fiber: '1g' },
  'double big mac': { name: '🍔 Double Big Mac', cal: 740, protein: '44g', carbs: '44g', fat: '43g', fiber: '3g' },
  'crispy chicken': { name: '🍗 Crispy Chicken Sandwich', cal: 470, protein: '26g', carbs: '46g', fat: '20g', fiber: '2g' },
  'spicy mcchicken': { name: '🌶️ Spicy McChicken', cal: 400, protein: '14g', carbs: '41g', fat: '20g', fiber: '2g' },
  'double quarter pounder': { name: '🍔 Double Quarter Pounder', cal: 900, protein: '58g', carbs: '43g', fat: '54g', fiber: '3g' },
  'mcrib': { name: '🥩 McRib', cal: 480, protein: '22g', carbs: '52g', fat: '21g', fiber: '3g' },
  'egg mcmuffin': { name: '🥚 Egg McMuffin', cal: 310, protein: '17g', carbs: '30g', fat: '13g', fiber: '2g' },
  'sausage mcmuffin': { name: '🌭 Sausage McMuffin', cal: 400, protein: '14g', carbs: '29g', fat: '25g', fiber: '1g' },
  'sausage mcmuffin with egg': { name: '🌭 Sausage McMuffin with Egg', cal: 480, protein: '21g', carbs: '30g', fat: '28g', fiber: '1g' },
  'bacon egg mcmuffin': { name: '🥓 Bacon Egg McMuffin', cal: 300, protein: '16g', carbs: '30g', fat: '13g', fiber: '2g' },
  'mcgriddle': { name: '🥞 McGriddle', cal: 420, protein: '15g', carbs: '44g', fat: '21g', fiber: '1g' },
  'big breakfast': { name: '🍳 Big Breakfast', cal: 760, protein: '28g', carbs: '51g', fat: '48g', fiber: '3g' },
  'hash brown': { name: '🥔 Hash Brown', cal: 150, protein: '1g', carbs: '15g', fat: '9g', fiber: '1g' },
  'hotcakes': { name: '🥞 Hotcakes', cal: 350, protein: '8g', carbs: '61g', fat: '9g', fiber: '2g' },
  'apple pie': { name: '🍎 Apple Pie', cal: 240, protein: '3g', carbs: '36g', fat: '11g', fiber: '4g' },
  'cookie': { name: '🍪 Chocolate Chip Cookie', cal: 170, protein: '2g', carbs: '22g', fat: '8g', fiber: '1g' },
  'caesar salad': { name: '🥗 Caesar Salad', cal: 220, protein: '30g', carbs: '10g', fat: '8g', fiber: '3g' },
  'mcflurry': { name: '🍦 McFlurry', cal: 510, protein: '13g', carbs: '79g', fat: '17g', fiber: '1g' },
  'oreo mcflurry': { name: '🍦 Oreo McFlurry', cal: 510, protein: '13g', carbs: '79g', fat: '17g', fiber: '1g' },
  'caramel mcflurry': { name: '🍮 Caramel McFlurry', cal: 490, protein: '12g', carbs: '76g', fat: '16g', fiber: '0g' },
  'vanilla cone': { name: '🍦 Vanilla Cone', cal: 200, protein: '5g', carbs: '30g', fat: '5g', fiber: '0g' },
  'sundae': { name: '🍨 Sundae', cal: 330, protein: '8g', carbs: '53g', fat: '9g', fiber: '1g' },
  'coke': { name: '🥤 Coke (Medium)', cal: 200, protein: '0g', carbs: '55g', fat: '0g', fiber: '0g' },
  'orange juice': { name: '🍊 Orange Juice', cal: 150, protein: '2g', carbs: '35g', fat: '0g', fiber: '0g' },
  'apple juice': { name: '🍎 Apple Juice', cal: 100, protein: '0g', carbs: '25g', fat: '0g', fiber: '0g' },
  'vanilla latte': { name: '☕ Vanilla Latte', cal: 250, protein: '10g', carbs: '34g', fat: '7g', fiber: '0g' },
  'caramel latte': { name: '☕ Caramel Latte', cal: 260, protein: '10g', carbs: '37g', fat: '7g', fiber: '0g' },
  'hot chocolate': { name: '🍫 Hot Chocolate', cal: 370, protein: '13g', carbs: '59g', fat: '10g', fiber: '2g' },
  'mccafe coffee': { name: '☕ McCafe Coffee', cal: 5, protein: '0g', carbs: '1g', fat: '0g', fiber: '0g' },
};

app.post('/webhook', (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const params = req.body.queryResult.parameters;
  const foodItem = (params['mcdonalds-item'] || '').toLowerCase();
  const quantity = params['quantity'] || 1;

  if (intent === 'food.info') {
    const item = menu[foodItem];
    if (item) {
      const qty = parseInt(quantity) || 1;
      const totalCal = item.cal * qty;
      let response = `${item.name}\n`;
      if (qty > 1) {
        response += `🔢 Quantity: ${qty}\n`;
        response += `🔥 Total Calories: ${totalCal}\n`;
      } else {
        response += `🔥 Calories: ${item.cal}\n`;
      }
      response += `🥩 Protein: ${item.protein}\n`;
      response += `🍞 Carbs: ${item.carbs}\n`;
      response += `🧈 Fat: ${item.fat}\n`;
      response += `🌾 Fiber: ${item.fiber}`;
      res.json({ fulfillmentText: response });
    } else {
      res.json({ fulfillmentText: "Sorry, I couldn't find that item. Try asking about Big Mac, Fries, Nuggets, etc.!" });
    }
  } else {
    res.json({ fulfillmentText: "I'm here to help with McDonald's nutrition info!" });
  }
});

app.listen(process.env.PORT || 10000, () => console.log('Webhook running!'));
