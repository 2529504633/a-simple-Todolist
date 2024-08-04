#### 第一部分：项目设置

1. **环境准备**

   - 安装Node.js和npm（Node包管理器）。
   - 安装代码编辑器（例如Visual Studio Code）。

2. **项目初始化**

   - 创建项目文件夹。
   - 初始化npm项目（`npm init`）。

3. **安装依赖**

   - 安装Express框架、MySQL数据库驱动、body-parser和cors中间件。

   ```bash
   npm install express mysql body-parser cors
   ```

   如果进度条长时间没有反应，使用：

   ~~~bash
   cnpm install express mysql body-parser cors
   ~~~

   使用的是国内的镜像源。

4. **设置数据库**

   - 安装并运行MySQL服务。
   - 创建数据库`todo_db`和`todos`表。

   ```sql
   CREATE DATABASE todo_db;
   USE todo_db;
   CREATE TABLE todos (
     id INT AUTO_INCREMENT PRIMARY KEY,
     task VARCHAR(255) NOT NULL,
     completed BOOLEAN DEFAULT FALSE
   );
   ```

   ![image-20240803170855964](https://cy123-bucket.oss-cn-beijing.aliyuncs.com/img/image-20240803170855964.png)

#### 第二部分：前端开发

1. **创建前端结构**

   - 创建HTML文件（index.html）。

     ~~~html
     <!DOCTYPE html>
     <html lang="en">
     <head>
       <!-- 定义文档的字符编码和视口设置 -->
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Todo List</title>
       <!-- 引入样式表 -->
       <link rel="stylesheet" href="styles.css">
     </head>
     <body>
     
     <!-- 页面标题 -->
     <h1>Todo List</h1>
     
     <!-- 新Todo输入框和添加按钮 -->
     <input type="text" id="newTodoInput" placeholder="Add a new todo">
     <button id="addTodoButton">Add</button>
     
     <!-- 用于显示Todo列表的无序列表 -->
     <ul id="todosList" class="todo-list">
       <!-- Todo项目将在这里动态添加 -->
     </ul>
     
     <!-- 编辑模态框 -->
     <div id="editModal" class="modal">
       <div class="modal-content">
         <!-- 关闭模态框的按钮 -->
         <span class="close">&times;</span>
         <!-- 用于编辑Todo的输入框 -->
         <input type="text" id="editTodoInput" placeholder="Edit your todo">
         <div class="parent-container">
           <!-- 保存编辑的按钮 -->
           <button id="saveEditButton">Save</button>
           <!-- 取消编辑的按钮 -->
           <button id="cancelEditButton">Cancel</button>
         </div>
       </div>
     </div>
     
     <script>
     // 从服务器获取Todo列表
     function fetchTodos() {
       // 发起GET请求获取todos
       fetch('/api/todos')
         .then(response => response.json())
         .then(todos => {
           const list = document.getElementById('todosList');
           // 清空列表
           list.innerHTML = '';
           // 遍历todos，动态添加到列表中
           todos.forEach(todo => {
             // 创建新的列表项
             const item = document.createElement('li');
             item.className = 'todo-item';
             item.textContent = todo.task;
             // 如果todo已完成，则添加completed类
             todo.completed && item.classList.add('completed');
     
             // 创建按钮容器
             const buttonsContainer = document.createElement('div');
             buttonsContainer.className = 'todo-item-actions';
     
             // 创建完成/未完成按钮
             const completeButtonText = todo.completed ? 'Incomplete' : 'Complete';
             const completeButton = document.createElement('button');
             completeButton.textContent = completeButtonText;
             completeButton.onclick = () => completeTodo(todo.id);
             buttonsContainer.appendChild(completeButton);
     
             // 创建编辑按钮
             const editButton = document.createElement('button');
             editButton.textContent = 'Edit';
             editButton.onclick = () => editTodo(todo.id, todo.task);
             buttonsContainer.appendChild(editButton);
     
             // 创建删除按钮
             const deleteButton = document.createElement('button');
             deleteButton.textContent = 'Delete';
             deleteButton.onclick = () => deleteTodo(todo.id);
             buttonsContainer.appendChild(deleteButton);
     
             // 将按钮容器添加到列表项中
             item.appendChild(buttonsContainer);
             // 将列表项添加到列表中
             list.appendChild(item);
           });
         })
         .catch(error => console.error('Error fetching todos:', error));
     }
     
     // 标记Todo为完成状态
     function completeTodo(todoId) {
       // 发起PATCH请求更新todo的完成状态
       fetch(`/api/todos/${todoId}/completed`, { method: 'PATCH' })
         .then(response => {
           if (!response.ok) throw new Error('Network response was not ok');
           return response.json();
         })
         .then(() => fetchTodos())
         .catch(error => console.error('Error marking todo as complete:', error));
     }
     
     // 添加新的Todo
     function addTodo() {
       const input = document.getElementById('newTodoInput');
       const task = input.value.trim();
       if (task) {
         // 发起POST请求添加新的todo
         fetch('/api/todos', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ task })
         })
         .then(() => {
           // 清空输入框
           input.value = '';
           // 重新获取todos列表
           fetchTodos();
         })
         .catch(error => console.error('Error adding todo:', error));
       }
     }
     
     // 编辑Todo
     function editTodo(todoId, todoTask) {
       // 获取模态框元素
       const modal = document.getElementById('editModal');
       const input = document.getElementById('editTodoInput');
       const saveButton = document.getElementById('saveEditButton');
       const cancelButton = document.getElementById('cancelEditButton');
       const span = document.getElementsByClassName("close")[0];
     
       // 设置输入框的值为当前Todo任务
       input.value = todoTask;
       // 显示模态框
       modal.style.display = "block";
     
       // 保存编辑的逻辑
       saveButton.onclick = () => {
         const newTask = input.value.trim();
         if (newTask) {
           // 更新Todo
           updateTodo(todoId, newTask);
           // 隐藏模态框
           modal.style.display = "none";
         }
       };
     
       // 取消编辑的逻辑
       cancelButton.onclick = () => {
         modal.style.display = "none";
       };
     
       // 点击关闭按钮的逻辑
       span.onclick = () => {
         modal.style.display = "none";
       };
     
       // 按下Enter键时保存编辑
       document.getElementById('editTodoInput').addEventListener('keydown', event => {
         if (event.key === 'Enter') {
           event.preventDefault();
           saveButton.click();
         }
       });
     }
     
     // 更新Todo任务
     function updateTodo(todoId, newTask) {
       // 发起PUT请求更新todo任务
       fetch(`/api/todos/${todoId}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ task: newTask, completed: false })
       })
       .then(response => {
         if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
         return response.json();
       })
       .then(() => fetchTodos())
       .catch(error => console.error('Error updating todo:', error));
     }
     
     // 删除Todo
     function deleteTodo(todoId) {
       // 发起DELETE请求删除todo
       fetch(`/api/todos/${todoId}`, { method: 'DELETE' })
         .then(() => fetchTodos())
         .catch(error => console.error('Error deleting todo:', error));
     }
     
     // 为添加按钮添加点击事件
     document.getElementById('addTodoButton').addEventListener('click', addTodo);
     // 为输入框添加键盘事件，按Enter键添加Todo
     document.getElementById('newTodoInput').addEventListener('keydown', event => {
       if (event.key === 'Enter') {
         event.preventDefault();
         addTodo();
       }
     });
     
     // 页面加载时获取Todo列表
     fetchTodos();
     </script>
     
     </body>
     </html>
     ~~~

     

   - 链接CSS样式文件（styles.css）。

  ~~~css
   body {
     font-family: Arial, sans-serif; /* 设置默认字体为Arial，如果没有Arial字体，则使用无衬线字体 */
     background-color: #f4f4f4; /* 设置页面背景颜色 */
     background: linear-gradient(45deg, #fff5c2, #ffbe76, #ff7eb3); /* 设置页面背景渐变色 */
   }
   
   .container {
     max-width: 600px; /* 设置容器最大宽度 */
     margin: 0 auto; /* 容器水平居中 */
     padding: 20px; /* 容器内边距 */
   }
   
   h1 {
     text-align: center; /* 标题文本居中显示 */
   }
   
   .todo-list {
     list-style-type: none; /* 移除列表项的默认标记 */
     padding: 0; /* 列表项无内边距 */
   }
   
   .todo-item {
     background-color: #fff; /* 设置列表项背景颜色 */
     padding: 10px; /* 列表项内边距 */
     margin-bottom: 10px; /* 列表项底部外边距 */
     border-radius: 5px; /* 列表项边框圆角 */
     box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); /* 列表项阴影效果 */
     display: flex; /* 列表项使用弹性盒子布局 */
     align-items: center; /* 子元素垂直居中对齐 */
     justify-content: space-between; /* 子元素水平两端对齐 */
     position: relative; /* 设置相对定位，以便于绝对定位子元素 */
   }
   
   .todo-item:hover {
     background-color: #f9f9f9; /* 鼠标悬停时改变背景色 */
   }
   
   .todo-item-completed {
     text-decoration: line-through; /* 完成的列表项文本划线 */
     color: #b3b3b3; /* 完成的列表项文本颜色 */
   }
   
   .todo-item-actions {
     display: flex; /* 使用弹性盒子布局 */
     gap: 5px; /* 子元素之间的间隔 */
     position: absolute; /* 绝对定位 */
     right: 10px; /* 距离容器右侧10px */
     top: 50%; /* 垂直居中 */
     transform: translateY(-50%); /* 垂直方向上移动自身高度的50%来居中对齐 */
   }
   
   .todo-item-actions button {
     margin: 0; /* 按钮无外边距 */
   }
   
   input[type="text"] {
     width: 100%; /* 输入框宽度占满容器 */
     padding: 10px; /* 输入框内边距 */
     margin-bottom: 10px; /* 输入框底部外边距 */
     border: 1px solid #ccc; /* 输入框边框 */
     border-radius: 5px; /* 输入框边框圆角 */
   }
   
   button {
     padding: 10px 20px; /* 按钮内边距 */
     background-color: #007bff; /* 按钮背景颜色 */
     color: white; /* 按钮文本颜色 */
     border: none; /* 按钮无边框 */
     border-radius: 5px; /* 按钮边框圆角 */
     cursor: pointer; /* 鼠标悬停时显示指针手势 */
   }
   
   button:hover {
     background-color: #0056b3; /* 鼠标悬停时改变按钮背景色 */
   }
   
   #addTodoButton {
     display: block; /* 添加按钮块级显示 */
     margin: 0 auto; /* 按钮水平居中 */
   }
   
   .completed {
     text-decoration: line-through; /* 完成状态的文本划线 */
     color: grey; /* 完成状态的文本颜色 */
   }
   
   .edit-todo-input {
     width: 100%; /* 编辑输入框宽度占满容器 */
     padding: 5px; /* 编辑输入框内边距 */
     margin: 5px 0; /* 编辑输入框外边距 */
   }
   
   .modal {
     display: none; /* 默认不显示模态框 */
     position: fixed; /* 模态框固定定位 */
     z-index: 1; /* 模态框在页面最上层 */
     left: 0;
     top: 0;
     width: 100%; /* 模态框宽度占满屏幕 */
     height: 100%; /* 模态框高度占满屏幕 */
     overflow: auto; /* 模态框内容溢出时显示滚动条 */
     background-color: rgba(0, 0, 0, 0.4); /* 模态框背景色 */
   }
   
   .modal-content {
     background-color: #fefefe; /* 模态框内容背景色 */
     margin: 15% auto; /* 模态框内容垂直居中 */
     padding: 20px; /* 模态框内容内边距 */
     border: 1px solid #888; /* 模态框内容边框 */
     width: 80%; /* 模态框内容宽度 */
   }
   
   .close {
     color: #aaa; /* 关闭按钮文本颜色 */
     float: right; /* 关闭按钮浮动到右侧 */
     font-size: 28px; /* 关闭按钮字体大小 */
     font-weight: bold; /* 关闭按钮字体加粗 */
   }
   
   .close:hover,
   .close:focus {
     color: black; /* 鼠标悬停或聚焦时关闭按钮文本颜色 */
     text-decoration: none; /* 鼠标悬停或聚焦时关闭按钮无文本装饰 */
     cursor: pointer; /* 鼠标悬停或聚焦时显示指针手势 */
   }
   
   .parent-container {
     text-align: center; /* 父容器文本居中 */
   }
   
   #saveEditButton,
   #cancelEditButton {
     display: inline-block; /* 保存和取消按钮内联块级显示 */
     margin: 0 5px; /* 按钮之间有5px的间隔 */
   }
  ~~~

#### 第三部分：后端开发

1. **设置Express服务器**

   - 创建app.js文件。

   - 设置中间件和CORS。

     ~~~javascript
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
     
     
     ~~~

     ### 效果：

     ### ![image-20240803171020514](https://cy123-bucket.oss-cn-beijing.aliyuncs.com/img/image-20240803171020514.png)

     ![image-20240803171103758](https://cy123-bucket.oss-cn-beijing.aliyuncs.com/img/image-20240803171103758.png)

     1. 修改app.js后记得重启生效。
     2. 更新数据库字段时需要将不更新的字段也返回给后端，不能为null。

     

