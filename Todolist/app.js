const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

// 创建express应用
const app = express();

// 中间件设置
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 数据库连接配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'todo_db'
};

// 创建数据库连接
const connection = mysql.createConnection(dbConfig);

// 连接数据库
connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    process.exit(1);
  }
  console.log('Connected to database with thread ID', connection.threadId);
});

// 路由配置
const apiRouter = express.Router();

apiRouter.get('/todos', (req, res) => {
  connection.query('SELECT * FROM todos', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    res.json(results);
  });
});

apiRouter.post('/todos', (req, res) => {
  const newTodo = { task: req.body.task, completed: false };
  connection.query('INSERT INTO todos SET ?', newTodo, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    res.status(201).json({ message: 'Todo created', todoId: result.insertId });
  });
});

apiRouter.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const updateData = { task: req.body.task, completed: req.body.completed };
  connection.query('UPDATE todos SET ? WHERE id = ?', [updateData, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not Found', details: 'Todo item with the specified ID does not exist.' });
    res.json({ message: 'Todo updated successfully' });
  });
});

apiRouter.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM todos WHERE id = ?', id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not Found', details: 'Todo item with the specified ID does not exist.' });
    res.json({ message: 'Todo deleted successfully' });
  });
});

apiRouter.patch('/todos/:id/completed', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM todos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Not Found', details: 'Todo item with the specified ID does not exist.' });

    connection.query('UPDATE todos SET completed = NOT completed WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error', details: err.message });
      res.json({ message: 'Todo completed status toggled successfully' });
    });
  });
});

// 使用路由
app.use('/api', apiRouter);

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

