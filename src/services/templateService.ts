export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: "basic" | "ui" | "interactive" | "fullstack" | "framework";
  icon: string;
  html: string;
  css: string;
  javascript: string;
  tags: string[];
}

class TemplateService {
  private templates: ProjectTemplate[] = [
    {
      id: "blank",
      name: "Blank Project",
      description: "Empty template to start from scratch",
      category: "basic",
      icon: "📄",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
</head>
<body>
  
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}`,
      javascript: `// Your JavaScript code here
console.log('Hello, World!');`,
      tags: ["empty", "starter", "blank"],
    },
    {
      id: "hello-world",
      name: "Hello World",
      description: "Simple hello world example",
      category: "basic",
      icon: "👋",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World</title>
</head>
<body>
  <div class="container">
    <h1>Hello, World!</h1>
    <p>Welcome to your first web project.</p>
  </div>
</body>
</html>`,
      css: `.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.25rem;
  opacity: 0.9;
}`,
      javascript: `// Hello World - Interactive greeting
const name = prompt('What is your name?') || 'World';
document.querySelector('h1').textContent = \`Hello, \${name}!\`;
console.log(\`Hello, \${name}!\`);`,
      tags: ["hello", "world", "starter", "beginner"],
    },
    {
      id: "landing-page",
      name: "Responsive Landing Page",
      description:
        "A complete landing page with header, hero, features, footer",
      category: "ui",
      icon: "🏠",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
</head>
<body>
  <nav class="navbar">
    <div class="logo">BrandLogo</div>
    <ul class="nav-links">
      <li><a href="#features">Features</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>

  <header class="hero">
    <div class="hero-content">
      <h1>Build Something Amazing</h1>
      <p>Create stunning websites with our powerful tools and templates.</p>
      <button class="cta-button">Get Started</button>
    </div>
  </header>

  <section id="features" class="features">
    <h2>Features</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">🚀</div>
        <h3>Fast Performance</h3>
        <p>Lightning fast load times for the best user experience.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎨</div>
        <h3>Modern Design</h3>
        <p>Beautiful, modern UI that looks great on any device.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <h3>Secure</h3>
        <p>Enterprise-grade security to protect your data.</p>
      </div>
    </div>
  </section>

  <footer class="footer">
    <p>&copy; 2024 BrandName. All rights reserved.</p>
  </footer>
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5%;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #667eea;
}

.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 6rem 2rem 2rem;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.features {
  padding: 5rem 5%;
  background: #f9fafb;
  text-align: center;
}

.features h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #1f2937;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.footer {
  padding: 2rem;
  text-align: center;
  background: #1f2937;
  color: white;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .nav-links {
    display: none;
  }
}`,
      javascript: `// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
  } else {
    navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  }
});

// CTA button click
document.querySelector('.cta-button').addEventListener('click', () => {
  alert('Thank you for your interest! This is a demo landing page.');
});`,
      tags: [
        "landing",
        "responsive",
        "hero",
        "features",
        "footer",
        "navigation",
      ],
    },
    {
      id: "todo-app",
      name: "Todo App",
      description: "A fully functional todo list with add, complete, delete",
      category: "interactive",
      icon: "✅",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
</head>
<body>
  <div class="todo-container">
    <div class="todo-header">
      <h1>Todo List</h1>
      <p id="task-count">0 tasks remaining</p>
    </div>
    
    <div class="todo-input-container">
      <input type="text" id="todo-input" placeholder="Add a new task...">
      <button id="add-btn">Add</button>
    </div>
    
    <ul id="todo-list" class="todo-list"></ul>
    
    <div class="todo-filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="active">Active</button>
      <button class="filter-btn" data-filter="completed">Completed</button>
      <button id="clear-completed">Clear Completed</button>
    </div>
  </div>
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.todo-container {
  max-width: 500px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  padding: 2rem;
}

.todo-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.todo-header h1 {
  color: #1f2937;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

#task-count {
  color: #6b7280;
  font-size: 0.9rem;
}

.todo-input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

#todo-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

#todo-input:focus {
  outline: none;
  border-color: #667eea;
}

#add-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s, transform 0.1s;
}

#add-btn:hover {
  background: #5568d3;
}

#add-btn:active {
  transform: scale(0.95);
}

.todo-list {
  list-style: none;
  margin-bottom: 1.5rem;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #9ca3af;
}

.todo-checkbox {
  width: 22px;
  height: 22px;
  cursor: pointer;
  accent-color: #667eea;
}

.todo-text {
  flex: 1;
  font-size: 1rem;
  color: #1f2937;
  word-break: break-word;
}

.delete-btn {
  padding: 0.4rem 0.8rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.3s;
}

.delete-btn:hover {
  background: #dc2626;
}

.todo-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn, #clear-completed {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.filter-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.filter-btn.active, .filter-btn:hover {
  background: #667eea;
  color: white;
}

#clear-completed {
  background: #fee2e2;
  color: #dc2626;
  margin-left: auto;
}

#clear-completed:hover {
  background: #fecaca;
}`,
      javascript: `// Todo App Functionality
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
  todoList.innerHTML = '';
  
  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });
  
  filteredTodos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.className = \`todo-item \${todo.completed ? 'completed' : ''}\`;
    li.innerHTML = \`
      <input type="checkbox" class="todo-checkbox" \${todo.completed ? 'checked' : ''}>
      <span class="todo-text">\${todo.text}</span>
      <button class="delete-btn">Delete</button>
    \`;
    
    li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(todo.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTodo(todo.id));
    
    todoList.appendChild(li);
  });
  
  updateTaskCount();
}

function updateTaskCount() {
  const remaining = todos.filter(t => !t.completed).length;
  taskCount.textContent = \`\${remaining} task\${remaining !== 1 ? 's' : ''} remaining\`;
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;
  
  todos.push({
    id: Date.now(),
    text,
    completed: false
  });
  
  todoInput.value = '';
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  renderTodos();
}

addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTodo();
});
clearCompletedBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

renderTodos();`,
      tags: ["todo", "tasks", "list", "crud", "localstorage", "interactive"],
    },
    {
      id: "calculator",
      name: "Calculator",
      description: "Basic calculator with operations",
      category: "interactive",
      icon: "🔢",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculator</title>
</head>
<body>
  <div class="calculator">
    <div class="display">
      <div id="previous-operand"></div>
      <div id="current-operand">0</div>
    </div>
    <div class="buttons">
      <button class="operator" data-action="clear">C</button>
      <button class="operator" data-action="delete">⌫</button>
      <button class="operator" data-action="percentage">%</button>
      <button class="operator" data-action="divide">÷</button>
      
      <button data-number="7">7</button>
      <button data-number="8">8</button>
      <button data-number="9">9</button>
      <button class="operator" data-action="multiply">×</button>
      
      <button data-number="4">4</button>
      <button data-number="5">5</button>
      <button data-number="6">6</button>
      <button class="operator" data-action="subtract">−</button>
      
      <button data-number="1">1</button>
      <button data-number="2">2</button>
      <button data-number="3">3</button>
      <button class="operator" data-action="add">+</button>
      
      <button class="zero" data-number="0">0</button>
      <button data-number=".">.</button>
      <button class="equals" data-action="equals">=</button>
    </div>
  </div>
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
}

.calculator {
  background: #1e1e2e;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 25px 80px rgba(0,0,0,0.5);
  width: 320px;
}

.display {
  background: #2a2a3e;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  text-align: right;
  min-height: 80px;
}

#previous-operand {
  color: #6b7280;
  font-size: 1rem;
  min-height: 1.5rem;
  margin-bottom: 0.25rem;
}

#current-operand {
  color: white;
  font-size: 2.5rem;
  font-weight: 500;
  word-break: break-all;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

button {
  padding: 1rem;
  font-size: 1.25rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;
}

button:active {
  transform: scale(0.95);
}

button[data-number] {
  background: #3a3a4e;
  color: white;
}

button[data-number]:hover {
  background: #4a4a5e;
}

.operator {
  background: #667eea !important;
  color: white !important;
}

.operator:hover {
  background: #7a8ff5 !important;
}

.equals {
  background: #10b981 !important;
  color: white !important;
}

.equals:hover {
  background: #34d399 !important;
}

.zero {
  grid-column: span 2;
}`,
      javascript: `// Calculator Functionality
class Calculator {
  constructor(previousOperandElement, currentOperandElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.clear();
  }
  
  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
  }
  
  delete() {
    if (this.currentOperand === '0') return;
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
    if (this.currentOperand === '') this.currentOperand = '0';
  }
  
  appendNumber(number) {
    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
    } else {
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
  }
  
  chooseOperation(operation) {
    if (this.currentOperand === '') return;
    if (this.previousOperand !== '') {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
  }
  
  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    if (isNaN(prev) || isNaN(current)) return;
    
    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '−':
        computation = prev - current;
        break;
      case '×':
        computation = prev * current;
        break;
      case '÷':
        if (current === 0) {
          alert('Cannot divide by zero!');
          return;
        }
        computation = prev / current;
        break;
      case '%':
        computation = prev % current;
        break;
      default:
        return;
    }
    
    this.currentOperand = computation;
    this.operation = undefined;
    this.previousOperand = '';
  }
  
  getDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];
    let integerDisplay;
    
    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
    }
    
    if (decimalDigits != null) {
      return \`\${integerDisplay}.\${decimalDigits}\`;
    } else {
      return integerDisplay;
    }
  }
  
  updateDisplay() {
    this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
    if (this.operation != null) {
      this.previousOperandElement.innerText = 
        \`\${this.getDisplayNumber(this.previousOperand)} \${this.operation}\`;
    } else {
      this.previousOperandElement.innerText = '';
    }
  }
}

const calculator = new Calculator(
  document.getElementById('previous-operand'),
  document.getElementById('current-operand')
);

document.querySelectorAll('[data-number]').forEach(button => {
  button.addEventListener('click', () => {
    calculator.appendNumber(button.innerText);
    calculator.updateDisplay();
  });
});

document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    
    switch (action) {
      case 'clear':
        calculator.clear();
        break;
      case 'delete':
        calculator.delete();
        break;
      case 'equals':
        calculator.compute();
        break;
      case 'percentage':
        calculator.currentOperand = (parseFloat(calculator.currentOperand) / 100).toString();
        break;
      default:
        calculator.chooseOperation(button.innerText);
    }
    
    calculator.updateDisplay();
  });
});

document.addEventListener('keydown', (e) => {
  if ((e.key >= 0 && e.key <= 9) || e.key === '.') {
    calculator.appendNumber(e.key);
  } else if (e.key === '+') {
    calculator.chooseOperation('+');
  } else if (e.key === '-') {
    calculator.chooseOperation('−');
  } else if (e.key === '*') {
    calculator.chooseOperation('×');
  } else if (e.key === '/') {
    e.preventDefault();
    calculator.chooseOperation('÷');
  } else if (e.key === 'Enter' || e.key === '=') {
    calculator.compute();
  } else if (e.key === 'Backspace') {
    calculator.delete();
  } else if (e.key === 'Escape') {
    calculator.clear();
  }
  calculator.updateDisplay();
});`,
      tags: ["calculator", "math", "operations", "interactive"],
    },
    {
      id: "weather-card",
      name: "Weather Card",
      description: "Weather display card with temperature, conditions",
      category: "ui",
      icon: "🌤️",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weather Card</title>
</head>
<body>
  <div class="weather-card">
    <div class="weather-header">
      <div class="location">
        <span class="city">New York</span>
        <span class="country">USA</span>
      </div>
      <div class="date">Monday, March 6</div>
    </div>
    
    <div class="weather-main">
      <div class="weather-icon">☀️</div>
      <div class="temperature">
        <span class="temp-value">72</span>
        <span class="temp-unit">°F</span>
      </div>
      <div class="condition">Sunny</div>
    </div>
    
    <div class="weather-details">
      <div class="detail">
        <span class="detail-icon">💧</span>
        <span class="detail-value">45%</span>
        <span class="detail-label">Humidity</span>
      </div>
      <div class="detail">
        <span class="detail-icon">💨</span>
        <span class="detail-value">12 mph</span>
        <span class="detail-label">Wind</span>
      </div>
      <div class="detail">
        <span class="detail-icon">🌡️</span>
        <span class="detail-value">75°</span>
        <span class="detail-label">Feels Like</span>
      </div>
    </div>
    
    <div class="forecast">
      <div class="forecast-day">
        <span>Tue</span>
        <span>⛅</span>
        <span>68°</span>
      </div>
      <div class="forecast-day">
        <span>Wed</span>
        <span>🌧️</span>
        <span>62°</span>
      </div>
      <div class="forecast-day">
        <span>Thu</span>
        <span>☀️</span>
        <span>70°</span>
      </div>
    </div>
  </div>
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  padding: 1rem;
}

.weather-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 2rem;
  width: 350px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.location {
  display: flex;
  flex-direction: column;
}

.city {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3436;
}

.country {
  font-size: 0.9rem;
  color: #636e72;
}

.date {
  color: #636e72;
  font-size: 0.9rem;
}

.weather-main {
  text-align: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #dfe6e9;
}

.weather-icon {
  font-size: 5rem;
  margin-bottom: 0.5rem;
}

.temperature {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.temp-value {
  font-size: 4rem;
  font-weight: bold;
  color: #2d3436;
  line-height: 1;
}

.temp-unit {
  font-size: 1.5rem;
  color: #636e72;
  margin-top: 0.5rem;
}

.condition {
  font-size: 1.25rem;
  color: #636e72;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #dfe6e9;
}

.detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.detail-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: bold;
  color: #2d3436;
}

.detail-label {
  font-size: 0.8rem;
  color: #636e72;
}

.forecast {
  display: flex;
  justify-content: space-between;
  padding-top: 1.5rem;
}

.forecast-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #636e72;
}

.forecast-day span:first-child {
  font-weight: 600;
}`,
      javascript: `// Weather Card - Update with real API data
const weatherData = {
  location: {
    city: 'New York',
    country: 'USA'
  },
  current: {
    temp: 72,
    feelsLike: 75,
    condition: 'Sunny',
    icon: '☀️',
    humidity: 45,
    wind: 12
  },
  forecast: [
    { day: 'Tue', icon: '⛅', temp: 68 },
    { day: 'Wed', icon: '🌧️', temp: 62 },
    { day: 'Thu', icon: '☀️', temp: 70 }
  ]
};

function updateWeather(data) {
  document.querySelector('.city').textContent = data.location.city;
  document.querySelector('.country').textContent = data.location.country;
  document.querySelector('.temp-value').textContent = data.current.temp;
  document.querySelector('.condition').textContent = data.current.condition;
  document.querySelector('.weather-icon').textContent = data.current.icon;
  document.querySelector('.detail-value:nth-child(2)').textContent = data.current.humidity + '%';
  document.querySelector('.detail-value:nth-child(5)').textContent = data.current.wind + ' mph';
  document.querySelector('.detail-value:nth-child(8)').textContent = data.current.feelsLike + '°';
  
  const forecastDays = document.querySelectorAll('.forecast-day');
  data.forecast.forEach((day, index) => {
    forecastDays[index].querySelector('span:first-child').textContent = day.day;
    forecastDays[index].querySelector('span:nth-child(2)').textContent = day.icon;
    forecastDays[index].querySelector('span:last-child').textContent = day.temp + '°';
  });
}

function updateDate() {
  const date = new Date();
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  document.querySelector('.date').textContent = date.toLocaleDateString('en-US', options);
}

updateDate();
updateWeather(weatherData);

// Example: Toggle temperature unit
document.querySelector('.temperature').addEventListener('click', () => {
  const tempValue = document.querySelector('.temp-value');
  const tempUnit = document.querySelector('.temp-unit');
  
  if (tempUnit.textContent === '°F') {
    const celsius = Math.round((72 - 32) * 5 / 9);
    tempValue.textContent = celsius;
    tempUnit.textContent = '°C';
  } else {
    tempValue.textContent = 72;
    tempUnit.textContent = '°F';
  }
});`,
      tags: ["weather", "card", "forecast", "ui", "responsive"],
    },
    {
      id: "login-form",
      name: "Login Form",
      description: "Beautiful login/signup form with validation",
      category: "ui",
      icon: "🔐",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Form</title>
</head>
<body>
  <div class="form-container">
    <div class="form-toggle">
      <button class="toggle-btn active" data-form="login">Login</button>
      <button class="toggle-btn" data-form="signup">Sign Up</button>
    </div>
    
    <form id="login-form" class="auth-form active">
      <h2>Welcome Back</h2>
      <p class="subtitle">Sign in to continue</p>
      
      <div class="form-group">
        <label for="login-email">Email</label>
        <input type="email" id="login-email" placeholder="Enter your email" required>
        <span class="error-message"></span>
      </div>
      
      <div class="form-group">
        <label for="login-password">Password</label>
        <input type="password" id="login-password" placeholder="Enter your password" required>
        <span class="error-message"></span>
      </div>
      
      <div class="form-options">
        <label>
          <input type="checkbox"> Remember me
        </label>
        <a href="#" class="forgot-password">Forgot password?</a>
      </div>
      
      <button type="submit" class="submit-btn">Login</button>
      
      <p class="social-text">Or continue with</p>
      <div class="social-buttons">
        <button type="button" class="social-btn google">Google</button>
        <button type="button" class="social-btn github">GitHub</button>
      </div>
    </form>
    
    <form id="signup-form" class="auth-form">
      <h2>Create Account</h2>
      <p class="subtitle">Join us today</p>
      
      <div class="form-group">
        <label for="signup-name">Full Name</label>
        <input type="text" id="signup-name" placeholder="Enter your name" required>
        <span class="error-message"></span>
      </div>
      
      <div class="form-group">
        <label for="signup-email">Email</label>
        <input type="email" id="signup-email" placeholder="Enter your email" required>
        <span class="error-message"></span>
      </div>
      
      <div class="form-group">
        <label for="signup-password">Password</label>
        <input type="password" id="signup-password" placeholder="Create a password" required>
        <span class="error-message"></span>
        <div class="password-strength"></div>
      </div>
      
      <div class="form-group">
        <label for="signup-confirm">Confirm Password</label>
        <input type="password" id="signup-confirm" placeholder="Confirm your password" required>
        <span class="error-message"></span>
      </div>
      
      <button type="submit" class="submit-btn">Sign Up</button>
    </form>
  </div>
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.form-container {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.form-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 2rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.3s;
}

.toggle-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.auth-form {
  display: none;
}

.auth-form.active {
  display: block;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.auth-form h2 {
  color: #1f2937;
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  min-height: 1rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.form-options a {
  color: #667eea;
  text-decoration: none;
}

.form-options a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.social-text {
  text-align: center;
  color: #6b7280;
  margin: 1.5rem 0 1rem;
  font-size: 0.9rem;
}

.social-buttons {
  display: flex;
  gap: 1rem;
}

.social-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.social-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.password-strength {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.password-strength::after {
  content: '';
  display: block;
  height: 100%;
  width: var(--strength, 0%);
  background: var(--color, #ef4444);
  transition: all 0.3s;
}`,
      javascript: `// Login/Signup Form Functionality
const toggleBtns = document.querySelectorAll('.toggle-btn');
const authForms = document.querySelectorAll('.auth-form');

toggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    toggleBtns.forEach(b => b.classList.remove('active'));
    authForms.forEach(f => f.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(\`\${btn.dataset.form}-form\`).classList.add('active');
  });
});

// Form validation
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

function showError(input, message) {
  input.classList.add('error');
  input.nextElementSibling.textContent = message;
}

function clearError(input) {
  input.classList.remove('error');
  input.nextElementSibling.textContent = '';
}

// Login form
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  
  clearError(email);
  clearError(password);
  
  let valid = true;
  
  if (!validateEmail(email.value)) {
    showError(email, 'Please enter a valid email');
    valid = false;
  }
  
  if (password.value.length < 1) {
    showError(password, 'Password is required');
    valid = false;
  }
  
  if (valid) {
    console.log('Login:', { email: email.value });
    alert('Login successful! (Demo)');
  }
});

// Signup form
document.getElementById('signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('signup-name');
  const email = document.getElementById('signup-email');
  const password = document.getElementById('signup-password');
  const confirm = document.getElementById('signup-confirm');
  
  [name, email, password, confirm].forEach(clearError);
  
  let valid = true;
  
  if (name.value.trim().length < 2) {
    showError(name, 'Name must be at least 2 characters');
    valid = false;
  }
  
  if (!validateEmail(email.value)) {
    showError(email, 'Please enter a valid email');
    valid = false;
  }
  
  if (!validatePassword(password.value)) {
    showError(password, 'Password must be at least 8 characters');
    valid = false;
  }
  
  if (password.value !== confirm.value) {
    showError(confirm, 'Passwords do not match');
    valid = false;
  }
  
  if (valid) {
    console.log('Signup:', { name: name.value, email: email.value });
    alert('Account created successfully! (Demo)');
  }
});

// Password strength indicator
document.getElementById('signup-password').addEventListener('input', (e) => {
  const password = e.target.value;
  const strength = document.querySelector('.password-strength');
  
  let percent = 0;
  let color = '#ef4444';
  
  if (password.length >= 8) percent += 25;
  if (/[a-z]/.test(password)) percent += 25;
  if (/[A-Z]/.test(password)) percent += 25;
  if (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)) percent += 25;
  
  if (percent >= 75) color = '#10b981';
  else if (percent >= 50) color = '#f59e0b';
  
  strength.style.setProperty('--strength', percent + '%');
  strength.style.setProperty('--color', color);
});

// Social login buttons
document.querySelectorAll('.social-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    alert(\`\${btn.textContent} login - Demo only\`);
  });
});`,
      tags: ["login", "signup", "form", "validation", "ui", "auth"],
    },
    {
      id: "image-gallery",
      name: "Image Gallery",
      description: "Grid-based image gallery with lightbox",
      category: "interactive",
      icon: "🖼️",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Gallery</title>
</head>
<body>
  <div class="gallery-container">
    <header class="gallery-header">
      <h1>Image Gallery</h1>
      <div class="gallery-filters">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="nature">Nature</button>
        <button class="filter-btn" data-filter="architecture">Architecture</button>
        <button class="filter-btn" data-filter="people">People</button>
      </div>
    </header>
    
    <div class="gallery-grid">
      <div class="gallery-item" data-category="nature">
        <img src="https://picsum.photos/400/300?random=1" alt="Nature 1">
        <div class="overlay">
          <span class="view-btn">View</span>
        </div>
      </div>
      <div class="gallery-item" data-category="architecture">
        <img src="https://picsum.photos/400/300?random=2" alt="Architecture 1">
        <div class="overlay">
          <span class="view-btn">View</span>
        </div>
      </div>
      <div class="gallery-item" data-category="people">
        <img src="https://picsum.photos/400/300?random=3" alt="People 1">
        <div class="overlay">
          <span class="view-btn">View</span>
        </div>
      </div>
      <div class="gallery-item" data-category="nature">
        <img src="https://picsum.photos/400/300?random=4" alt="Nature 2">
        <div class="overlay">
          <span class="view-btn">View</span>
        </div>
      </div>
      <div class="gallery-item" data-category="architecture">
        <img src="https://picsum.photos/400/300?random=5" alt="Architecture 2">
        <div class="overlay">
          <span class="view-btn">View</span>
        </div>
      </div>
      <div class="gallery-item" data-category="people">
        <img src="https://picsum.photos/400/300?random=6" alt="People 2">
        <div class="overlay">
          <span class="view-btn">View</span>
        </div>
      </div>
      <div class="gallery-item" data-category="nature">
        <img src="https://picsum.photos/400/300?random=7" alt="Nature 3">
        <div class="overlay">
          <span class="view-btn">View</span>
        </div>
      </div>
      <div class="gallery-item" data-category="architecture">
        <img src="https://picsum.photos/400/300?random=8" alt="Architecture 3">
        <div class="overlay">
          <span class="view-btn">View</span>
        </div>
      </div>
    </div>
  </div>
  
  <div class="lightbox" id="lightbox">
    <span class="lightbox-close">&times;</span>
    <img class="lightbox-img" src="" alt="">
    <button class="lightbox-prev">&#10094;</button>
    <button class="lightbox-next">&#10095;</button>
  </div>
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f0f0f;
  color: white;
  min-height: 100vh;
}

.gallery-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.gallery-header {
  text-align: center;
  margin-bottom: 2rem;
}

.gallery-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gallery-filters {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1.5rem;
  border: 2px solid #333;
  background: transparent;
  color: #888;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.filter-btn:hover, .filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.gallery-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 4/3;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.gallery-item:hover .overlay {
  opacity: 1;
}

.view-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #1f2937;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  transform: translateY(20px);
  transition: transform 0.3s;
}

.gallery-item:hover .view-btn {
  transform: translateY(0);
}

.gallery-item.hidden {
  display: none;
}

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.lightbox.active {
  display: flex;
}

.lightbox-img {
  max-width: 90%;
  max-height: 85vh;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 30px;
  font-size: 3rem;
  color: white;
  cursor: pointer;
  transition: color 0.3s;
}

.lightbox-close:hover {
  color: #667eea;
}

.lightbox-prev, .lightbox-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 2rem;
  padding: 1rem;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.3s;
}

.lightbox-prev {
  left: 20px;
}

.lightbox-next {
  right: 20px;
}

.lightbox-prev:hover, .lightbox-next:hover {
  background: rgba(255, 255, 255, 0.3);
}`,
      javascript: `// Image Gallery with Lightbox
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');

let currentIndex = 0;
let visibleItems = [];

// Filter functionality
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filter = btn.dataset.filter;
    
    galleryItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
    
    updateVisibleItems();
  });
});

function updateVisibleItems() {
  visibleItems = Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
}

// Lightbox functionality
galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => {
    updateVisibleItems();
    const img = item.querySelector('img');
    currentIndex = visibleItems.indexOf(item);
    openLightbox(img.src);
  });
});

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function showPrev() {
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  const img = visibleItems[currentIndex].querySelector('img');
  lightboxImg.src = img.src;
}

function showNext() {
  currentIndex = (currentIndex + 1) % visibleItems.length;
  const img = visibleItems[currentIndex].querySelector('img');
  lightboxImg.src = img.src;
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrev);
lightboxNext.addEventListener('click', showNext);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'ArrowRight') showNext();
});

updateVisibleItems();`,
      tags: ["gallery", "images", "lightbox", "grid", "interactive", "filter"],
    },
    {
      id: "quiz-app",
      name: "Quiz App",
      description: "Interactive quiz with multiple choice questions",
      category: "interactive",
      icon: "❓",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quiz App</title>
</head>
<body>
  <div class="quiz-container">
    <div class="quiz-header">
      <div class="quiz-info">
        <span class="question-number">Question 1/5</span>
        <span class="quiz-score">Score: 0</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    </div>
    
    <div class="quiz-content">
      <h2 class="question-text">Loading question...</h2>
      
      <div class="options">
        <button class="option">
          <span class="option-letter">A</span>
          <span class="option-text"></span>
        </button>
        <button class="option">
          <span class="option-letter">B</span>
          <span class="option-text"></span>
        </button>
        <button class="option">
          <span class="option-letter">C</span>
          <span class="option-text"></span>
        </button>
        <button class="option">
          <span class="option-letter">D</span>
          <span class="option-text"></span>
        </button>
      </div>
    </div>
    
    <div class="quiz-footer">
      <button class="next-btn" disabled>Next Question</button>
    </div>
  </div>
  
  <div class="results" style="display: none;">
    <div class="results-content">
      <h2>Quiz Complete!</h2>
      <div class="score-circle">
        <span class="final-score">0</span>
        <span class="score-total">/5</span>
      </div>
      <p class="score-message">Great job!</p>
      <button class="restart-btn">Play Again</button>
    </div>
  </div>
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.quiz-container, .results {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.quiz-header {
  margin-bottom: 2rem;
}

.quiz-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #6b7280;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: 20%;
  transition: width 0.3s ease;
}

.question-text {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 2rem;
  line-height: 1.4;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.option:hover:not(:disabled) {
  border-color: #667eea;
  background: #f0f4ff;
}

.option.selected {
  border-color: #667eea;
  background: #eef2ff;
}

.option.correct {
  border-color: #10b981;
  background: #d1fae5;
}

.option.wrong {
  border-color: #ef4444;
  background: #fee2e2;
}

.option-letter {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  color: #6b7280;
  flex-shrink: 0;
}

.option.selected .option-letter {
  background: #667eea;
  color: white;
}

.option.correct .option-letter {
  background: #10b981;
  color: white;
}

.option.wrong .option-letter {
  background: #ef4444;
  color: white;
}

.option-text {
  flex: 1;
  font-size: 1rem;
  color: #1f2937;
}

.quiz-footer {
  margin-top: 2rem;
}

.next-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.next-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.results {
  text-align: center;
}

.results h2 {
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 2rem;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  flex-direction: column;
}

.final-score {
  font-size: 3rem;
  font-weight: bold;
  color: white;
}

.score-total {
  font-size: 1.25rem;
  color: rgba(255,255,255,0.8);
}

.score-message {
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.restart-btn {
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.restart-btn:hover {
  transform: translateY(-2px);
}`,
      javascript: `// Quiz App Functionality
const questions = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language"
    ],
    correct: 0
  },
  {
    question: "Which CSS property is used to change text color?",
    options: [
      "text-color",
      "font-color",
      "color",
      "text-style"
    ],
    correct: 2
  },
  {
    question: "What does CSS stand for?",
    options: [
      "Creative Style Sheets",
      "Cascading Style Sheets",
      "Computer Style Sheets",
      "Colorful Style Sheets"
    ],
    correct: 1
  },
  {
    question: "Which JavaScript method is used to select an element by ID?",
    options: [
      "document.getElement()",
      "document.querySelector()",
      "document.getElementById()",
      "document.select()"
    ],
    correct: 2
  },
  {
    question: "What is the correct way to declare a variable in JavaScript?",
    options: [
      "variable x = 5",
      "var x = 5",
      "x = 5",
      "int x = 5"
    ],
    correct: 1
  }
];

let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;

const questionNumber = document.querySelector('.question-number');
const quizScore = document.querySelector('.quiz-score');
const progressFill = document.querySelector('.progress-fill');
const questionText = document.querySelector('.question-text');
const options = document.querySelectorAll('.option');
const nextBtn = document.querySelector('.next-btn');
const quizContainer = document.querySelector('.quiz-container');
const results = document.querySelector('.results');
const finalScore = document.querySelector('.final-score');
const scoreMessage = document.querySelector('.score-message');
const restartBtn = document.querySelector('.restart-btn');

const letters = ['A', 'B', 'C', 'D'];

function loadQuestion() {
  const q = questions[currentQuestion];
  
  questionNumber.textContent = \`Question \${currentQuestion + 1}/\${questions.length}\`;
  quizScore.textContent = \`Score: \${score}\`;
  progressFill.style.width = \`\${((currentQuestion + 1) / questions.length) * 100}%\`;
  
  questionText.textContent = q.question;
  
  options.forEach((option, index) => {
    const optionText = option.querySelector('.option-text');
    const optionLetter = option.querySelector('.option-letter');
    
    optionLetter.textContent = letters[index];
    optionText.textContent = q.options[index] || '';
    
    option.classList.remove('selected', 'correct', 'wrong');
    option.disabled = false;
  });
  
  selectedAnswer = null;
  nextBtn.disabled = true;
}

function selectOption(index) {
  if (selectedAnswer !== null) return;
  
  selectedAnswer = index;
  
  options.forEach((option, i) => {
    option.classList.add('selected');
    if (i === index) {
      option.classList.add('correct');
    }
    option.disabled = true;
  });
  
  if (index === questions[currentQuestion].correct) {
    score++;
    quizScore.textContent = \`Score: \${score}\`;
  } else {
    options[index].classList.remove('correct');
    options[index].classList.add('wrong');
    options[questions[currentQuestion].correct].classList.add('correct');
  }
  
  nextBtn.disabled = false;
}

function nextQuestion() {
  currentQuestion++;
  
  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  quizContainer.style.display = 'none';
  results.style.display = 'block';
  finalScore.textContent = score;
  
  const percentage = (score / questions.length) * 100;
  
  if (percentage >= 80) {
    scoreMessage.textContent = "Excellent! You're a star!";
  } else if (percentage >= 60) {
    scoreMessage.textContent = "Good job! Keep learning!";
  } else if (percentage >= 40) {
    scoreMessage.textContent = "Not bad! Try again!";
  } else {
    scoreMessage.textContent = "Keep practicing! You'll get better!";
  }
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  selectedAnswer = null;
  
  results.style.display = 'none';
  quizContainer.style.display = 'block';
  
  loadQuestion();
}

options.forEach((option, index) => {
  option.addEventListener('click', () => selectOption(index));
});

nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartQuiz);

loadQuestion();`,
      tags: ["quiz", "questions", "interactive", "game", "multiple choice"],
    },
    {
      id: "animated-counter",
      name: "Animated Counter",
      description: "Number counter with animations",
      category: "interactive",
      icon: "🔢",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animated Counter</title>
</head>
<body>
  <div class="counter-container">
    <h1>Our Statistics</h1>
    <p class="subtitle">Numbers that matter</p>
    
    <div class="counters">
      <div class="counter-item">
        <div class="counter-icon">👥</div>
        <div class="counter" data-target="10000">0</div>
        <div class="counter-label">Happy Users</div>
      </div>
      
      <div class="counter-item">
        <div class="counter-icon">🚀</div>
        <div class="counter" data-target="2500">0</div>
        <div class="counter-label">Projects Completed</div>
      </div>
      
      <div class="counter-item">
        <div class="counter-icon">🏆</div>
        <div class="counter" data-target="150">0</div>
        <div class="counter-label">Awards Won</div>
      </div>
      
      <div class="counter-item">
        <div class="counter-icon">⭐</div>
        <div class="counter" data-target="5000">0</div>
        <div class="counter-label">5-Star Reviews</div>
      </div>
    </div>
    
    <button class="restart-btn">Restart Animation</button>
  </div>
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
  padding: 2rem;
}

.counter-container {
  text-align: center;
}

.counter-container h1 {
  color: white;
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1.25rem;
  margin-bottom: 3rem;
}

.counters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.counter-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.counter-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.counter-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.counter {
  font-size: 3.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.counter-label {
  color: #9ca3af;
  font-size: 1rem;
}

.restart-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.restart-btn:active {
  transform: translateY(0);
}`,
      javascript: `// Animated Counter Functionality
const counters = document.querySelectorAll('.counter');
let animationStarted = false;

function animateCounters() {
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
      current += increment;
      
      if (current < target) {
        counter.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString();
      }
    };
    
    counter.textContent = '0';
    updateCounter();
  });
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function handleScroll() {
  if (!animationStarted && isInViewport(document.querySelector('.counters'))) {
    animationStarted = true;
    animateCounters();
  }
}

window.addEventListener('scroll', handleScroll);
handleScroll();

document.querySelector('.restart-btn').addEventListener('click', () => {
  counters.forEach(counter => {
    counter.textContent = '0';
  });
  animationStarted = false;
  setTimeout(() => {
    animateCounters();
    animationStarted = true;
  }, 100);
});`,
      tags: ["counter", "animation", "numbers", "statistics", "interactive"],
    },
    {
      id: "modal-dialog",
      name: "Modal Dialog",
      description: "Reusable modal component examples",
      category: "ui",
      icon: "📦",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modal Dialog</title>
</head>
<body>
  <div class="container">
    <h1>Modal Components</h1>
    <p class="subtitle">Click any button to open different modal styles</p>
    
    <div class="button-grid">
      <button class="modal-trigger" data-modal="basic">Basic Modal</button>
      <button class="modal-trigger" data-modal="confirm">Confirm Dialog</button>
      <button class="modal-trigger" data-modal="form">Form Modal</button>
      <button class="modal-trigger" data-modal="image">Image Modal</button>
    </div>
  </div>
  
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal" id="modal">
      <button class="modal-close" id="modal-close">&times;</button>
      <div class="modal-content" id="modal-content"></div>
    </div>
  </div>
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.container {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.container h1 {
  color: white;
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.modal-trigger {
  padding: 1.25rem 2rem;
  background: white;
  color: #1f2937;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.modal-trigger:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.modal-overlay.active {
  display: flex;
  opacity: 1;
}

.modal {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  position: relative;
  transform: scale(0.8);
  transition: transform 0.3s;
}

.modal-overlay.active .modal {
  transform: scale(1);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f3f4f6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: background 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
}

.modal-content h2 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.modal-content p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.modal-btn:active {
  transform: scale(0.95);
}

.modal-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-btn.secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.modal-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: border-color 0.3s;
}

.modal-input:focus {
  outline: none;
  border-color: #667eea;
}

.modal-image {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 1rem;
}`,
      javascript: `// Modal Dialog Functionality
const modalOverlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalContent = document.getElementById('modal-content');

const modalTemplates = {
  basic: {
    title: 'Welcome!',
    content: '<p>This is a basic modal dialog. It can be used for notifications, messages, or general information display.</p>',
    actions: '<button class="modal-btn primary" onclick="closeModal()">Got it!</button>'
  },
  confirm: {
    title: 'Are you sure?',
    content: '<p>This action cannot be undone. Please confirm if you want to proceed.</p>',
    actions: \`
      <button class="modal-btn secondary" onclick="closeModal()">Cancel</button>
      <button class="modal-btn primary" onclick="confirmAction()">Confirm</button>
    \`
  },
  form: {
    title: 'Contact Us',
    content: \`
      <input type="text" class="modal-input" placeholder="Your Name">
      <input type="email" class="modal-input" placeholder="Your Email">
      <textarea class="modal-input" placeholder="Your Message" rows="3"></textarea>
    \`,
    actions: \`
      <button class="modal-btn secondary" onclick="closeModal()">Cancel</button>
      <button class="modal-btn primary" onclick="submitForm()">Send</button>
    \`
  },
  image: {
    title: 'Beautiful Sunset',
    content: '<img src="https://picsum.photos/600/400?random=10" class="modal-image" alt="Sunset"><p>A beautiful sunset over the mountains.</p>',
    actions: '<button class="modal-btn primary" onclick="closeModal()">Close</button>'
  }
};

function openModal(type) {
  const template = modalTemplates[type];
  modalContent.innerHTML = \`
    <h2>\${template.title}</h2>
    \${template.content}
    <div class="modal-actions">
      \${template.actions}
    </div>
  \`;
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

function confirmAction() {
  alert('Action confirmed!');
  closeModal();
}

function submitForm() {
  alert('Form submitted! (Demo)');
  closeModal();
}

document.querySelectorAll('.modal-trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    openModal(btn.dataset.modal);
  });
});

modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});`,
      tags: ["modal", "dialog", "popup", "ui", "component"],
    },
    {
      id: "sticky-navigation",
      name: "Sticky Navigation",
      description: "Navbar that sticks on scroll",
      category: "ui",
      icon: "📍",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sticky Navigation</title>
</head>
<body>
  <nav class="navbar" id="navbar">
    <div class="nav-container">
      <a href="#" class="logo">BrandLogo</a>
      
      <ul class="nav-menu">
        <li><a href="#home" class="nav-link active">Home</a></li>
        <li><a href="#about" class="nav-link">About</a></li>
        <li><a href="#services" class="nav-link">Services</a></li>
        <li><a href="#portfolio" class="nav-link">Portfolio</a></li>
        <li><a href="#contact" class="nav-link">Contact</a></li>
      </ul>
      
      <div class="nav-toggle" id="nav-toggle">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </nav>
  
  <section id="home" class="hero-section">
    <div class="hero-content">
      <h1>Welcome to Our Website</h1>
      <p>Scroll down to see the sticky navigation in action</p>
      <div class="scroll-indicator">
        <span>↓</span>
      </div>
    </div>
  </section>
  
  <section id="about" class="content-section">
    <h2>About Us</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
  </section>
  
  <section id="services" class="content-section">
    <h2>Our Services</h2>
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </section>
  
  <section id="portfolio" class="content-section">
    <h2>Portfolio</h2>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
  </section>
  
  <section id="contact" class="content-section">
    <h2>Contact Us</h2>
    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  </section>
  
  <footer class="footer">
    <p>&copy; 2024 BrandLogo. All rights reserved.</p>
  </footer>
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: all 0.3s ease;
  background: transparent;
}

.navbar.scrolled {
  background: white;
  box-shadow: 0 2px 20px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.75rem;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s;
}

.navbar.scrolled .logo {
  color: #667eea;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: white;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
}

.navbar.scrolled .nav-link {
  color: #1f2937;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: #667eea;
  transition: width 0.3s;
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
}

.nav-toggle span {
  width: 25px;
  height: 3px;
  background: white;
  transition: all 0.3s;
}

.navbar.scrolled .nav-toggle span {
  background: #1f2937;
}

.hero-section {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.hero-content h1 {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.25rem;
  opacity: 0.9;
}

.scroll-indicator {
  margin-top: 3rem;
  animation: bounce 2s infinite;
}

.scroll-indicator span {
  font-size: 2rem;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.content-section {
  padding: 6rem 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.content-section h2 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

.content-section p {
  color: #6b7280;
  font-size: 1.1rem;
}

.footer {
  background: #1f2937;
  color: white;
  text-align: center;
  padding: 2rem;
}

@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
  }
  
  .nav-menu {
    position: fixed;
    top: 70px;
    left: 0;
    width: 100%;
    background: white;
    flex-direction: column;
    padding: 2rem;
    gap: 1.5rem;
    transform: translateY(-150%);
    transition: transform 0.3s;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  
  .nav-menu.active {
    transform: translateY(0);
  }
  
  .nav-link {
    color: #1f2937 !important;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
}`,
      javascript: `// Sticky Navigation Functionality
const navbar = document.getElementById('navbar');
const navMenu = document.querySelector('.nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
  });
});

const sections = document.querySelectorAll('section[id]');

function highlightNav() {
  const scrollY = window.pageYOffset;
  
  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');
    
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === \`#\${sectionId}\`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNav);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});`,
      tags: ["navigation", "sticky", "navbar", "scroll", "ui"],
    },
  ];

  getAllTemplates(): ProjectTemplate[] {
    return this.templates;
  }

  getTemplateById(id: string): ProjectTemplate | undefined {
    return this.templates.find((template) => template.id === id);
  }

  getTemplatesByCategory(category: string): ProjectTemplate[] {
    return this.templates.filter((template) => template.category === category);
  }

  searchTemplates(query: string): ProjectTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return this.templates.filter(
      (template) =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
    );
  }
}

export const templateService = new TemplateService();
