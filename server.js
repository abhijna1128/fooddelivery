const express = require('express');
const bodyParser = require('body-parser');
const cron = require("node-cron");
const app = express();
const PORT = 8000;

app.use(bodyParser.json());

let menu = [];


app.post('/menu', (req, res) => {
  const { name, price, category } = req.body;

  
  if (!name || price <= 0 || !['Starter', 'Main Course', 'Dessert', 'Beverage'].includes(category)) {
    return res.status(400).send({ message: 'Invalid data. Ensure all fields are correct.' });
  }

  
  const newItem = { id: menu.length + 1, name, price, category };
  menu.push(newItem);


  res.status(201).send({ message: 'Menu item added', item: newItem });
});

app.get('/menu', (req, res) => {
    if (menu.length === 0) {
      return res.status(404).send({ message: 'No menu items found' });
    }
    res.status(200).send({ items: menu });
  });


  let orders = []; 

  
  app.post('/orders', (req, res) => {
    const { items } = req.body;
  
    if (!items || items.length === 0) {
      return res.status(400).send({ message: 'No menu items selected' });
    }
  
    const invalidItems = items.filter(itemId => !menu.find(item => item.id === itemId));
  
    if (invalidItems.length > 0) {
      return res.status(400).send({ message: `Invalid menu items: ${invalidItems.join(', ')}` });
    }
  
    const newOrder = {
      id: orders.length + 1,
      items: items.map(itemId => menu.find(item => item.id === itemId)),
      status: 'Preparing'
    };
  
    orders.push(newOrder);
    orderQueue.push(newOrder);
  
    console.log("Order added to queue:", newOrder); 
  
    res.status(201).send({ message: 'Order placed successfully', order: newOrder });
  });
  

  app.get('/orders/:id', (req, res) => {
    const orderId = parseInt(req.params.id); 
    const order = orders.find(o => o.id === orderId);  
  
    if (!order) {
      return res.status(404).send({ message: 'Order not found' });
    }
  
    res.status(200).send({ order });
  });

  let orderQueue = [];

  cron.schedule("*/2 * * * *", () => {
    console.log("Running status update cron job...");
    console.log("Current orderQueue:", JSON.stringify(orderQueue, null, 2)); 
  
    orderQueue.forEach(order => {
      if (order.status === "Preparing") {
        order.status = "Out for Delivery";
        console.log(`Order ${order.id} updated to Out for Delivery.`);
      } else if (order.status === "Out for Delivery") {
        order.status = "Delivered";
        console.log(`Order ${order.id} updated to Delivered.`);
      }
    });
  
    
    orderQueue = orderQueue.filter(order => order.status !== "Delivered");
  });
  
  
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
