// Utility Calculator Template
export const html = `<!-- Calculator App -->
<div class="calculator-container">
  <div class="calculator">
    <div class="display">
      <div class="previous-operand" id="previousOperand"></div>
      <div class="current-operand" id="currentOperand">0</div>
    </div>
    <div class="buttons">
      <button class="btn btn-function" data-action="clear">AC</button>
      <button class="btn btn-function" data-action="delete">DEL</button>
      <button class="btn btn-function" data-action="percent">%</button>
      <button class="btn btn-operator" data-action="divide">÷</button>
      
      <button class="btn btn-number" data-number="7">7</button>
      <button class="btn btn-number" data-number="8">8</button>
      <button class="btn btn-number" data-number="9">9</button>
      <button class="btn btn-operator" data-action="multiply">×</button>
      
      <button class="btn btn-number" data-number="4">4</button>
      <button class="btn btn-number" data-number="5">5</button>
      <button class="btn btn-number" data-number="6">6</button>
      <button class="btn btn-operator" data-action="subtract">−</button>
      
      <button class="btn btn-number" data-number="1">1</button>
      <button class="btn btn-number" data-number="2">2</button>
      <button class="btn btn-number" data-number="3">3</button>
      <button class="btn btn-operator" data-action="add">+</button>
      
      <button class="btn btn-number" data-number="0">0</button>
      <button class="btn btn-number" data-number="00">00</button>
      <button class="btn btn-number" data-number=".">.</button>
      <button class="btn btn-equals" data-action="equals">=</button>
    </div>
  </div>
  
  <!-- History -->
  <div class="history-panel">
    <h3>History</h3>
    <div class="history-list" id="historyList">
      <p class="empty-history">No calculations yet</p>
    </div>
    <button class="btn-clear-history" id="clearHistory">Clear History</button>
  </div>
</div>`;

export const css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #8b5cf6;
  --dark: #1e293b;
  --light: #f8fafc;
  --gray: #64748b;
  --success: #22c55e;
  --danger: #ef4444;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.calculator-container {
  display: grid;
  grid-template-columns: auto 300px;
  gap: 2rem;
  max-width: 800px;
}

/* Calculator */
.calculator {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  overflow: hidden;
}

.display {
  background: var(--dark);
  color: white;
  padding: 2rem;
  text-align: right;
}

.previous-operand {
  font-size: 1rem;
  color: #94a3b8;
  min-height: 1.5rem;
  margin-bottom: 0.5rem;
}

.current-operand {
  font-size: 3rem;
  font-weight: bold;
  word-wrap: break-word;
  word-break: break-all;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #e2e8f0;
}

.btn {
  padding: 1.5rem;
  font-size: 1.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-number {
  background: white;
  color: var(--dark);
}

.btn-number:hover {
  background: #f1f5f9;
}

.btn-function {
  background: #f1f5f9;
  color: var(--gray);
}

.btn-function:hover {
  background: #e2e8f0;
}

.btn-operator {
  background: var(--primary);
  color: white;
}

.btn-operator:hover {
  background: var(--primary-dark);
}

.btn-equals {
  background: var(--success);
  color: white;
}

.btn-equals:hover {
  background: #16a34a;
}

.btn:active {
  transform: scale(0.95);
}

/* History Panel */
.history-panel {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
}

.history-panel h3 {
  margin-bottom: 1rem;
  color: var(--dark);
}

.history-list {
  flex: 1;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.history-item {
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: background 0.3s;
}

.history-item:hover {
  background: #e2e8f0;
}

.history-expression {
  font-size: 0.875rem;
  color: var(--gray);
  margin-bottom: 0.25rem;
}

.history-result {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--dark);
}

.empty-history {
  text-align: center;
  color: var(--gray);
  padding: 2rem 0;
}

.btn-clear-history {
  background: var(--danger);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-clear-history:hover {
  background: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .calculator-container {
    grid-template-columns: 1fr;
  }
  
  .history-panel {
    max-height: 300px;
  }
  
  .current-operand {
    font-size: 2rem;
  }
  
  .btn {
    padding: 1rem;
    font-size: 1.25rem;
  }
}`;

export const javascript = `class Calculator {
  constructor() {
    this.previousOperand = '';
    this.currentOperand = '0';
    this.operation = undefined;
    this.history = [];
    this.init();
  }

  init() {
    this.previousOperandElement = document.getElementById('previousOperand');
    this.currentOperandElement = document.getElementById('currentOperand');
    this.historyListElement = document.getElementById('historyList');
    this.clearHistoryButton = document.getElementById('clearHistory');

    this.attachEventListeners();
    this.loadHistory();
  }

  attachEventListeners() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleButtonClick(btn);
      });
    });

    this.clearHistoryButton.addEventListener('click', () => {
      this.clearHistory();
    });

    document.addEventListener('keydown', (e) => {
      this.handleKeyboardInput(e);
    });
  }

  handleButtonClick(btn) {
    if (btn.dataset.number) {
      this.appendNumber(btn.dataset.number);
    } else if (btn.dataset.action) {
      this.handleAction(btn.dataset.action);
    }
    this.updateDisplay();
  }

  handleKeyboardInput(e) {
    if (e.key >= '0' && e.key <= '9') this.appendNumber(e.key);
    if (e.key === '.') this.appendNumber('.');
    if (e.key === '=' || e.key === 'Enter') this.compute();
    if (e.key === 'Backspace') this.delete();
    if (e.key === 'Escape') this.clear();
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
      this.chooseOperation(e.key);
    }
  }

  handleAction(action) {
    switch(action) {
      case 'clear':
        this.clear();
        break;
      case 'delete':
        this.delete();
        break;
      case 'percent':
        this.percent();
        break;
      case 'add':
        this.chooseOperation('+');
        break;
      case 'subtract':
        this.chooseOperation('-');
        break;
      case 'multiply':
        this.chooseOperation('*');
        break;
      case 'divide':
        this.chooseOperation('/');
        break;
      case 'equals':
        this.compute();
        break;
    }
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
  }

  delete() {
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
    if (this.currentOperand === '' || this.currentOperand === '-') {
      this.currentOperand = '0';
    }
  }

  appendNumber(number) {
    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
    } else {
      this.currentOperand = this.currentOperand.toString() + number;
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

    switch(this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '*':
        computation = prev * current;
        break;
      case '/':
        computation = prev / current;
        break;
      default:
        return;
    }

    // Add to history
    this.addToHistory(this.previousOperand, this.operation, this.currentOperand, computation);

    this.currentOperand = computation;
    this.operation = undefined;
    this.previousOperand = '';
  }

  percent() {
    this.currentOperand = parseFloat(this.currentOperand) / 100;
  }

  updateDisplay() {
    this.currentOperandElement.textContent = this.currentOperand;
    if (this.operation != null) {
      this.previousOperandElement.textContent = 
        \`\${this.previousOperand} \${this.operation}\`;
    } else {
      this.previousOperandElement.textContent = '';
    }
  }

  addToHistory(prev, operation, current, result) {
    const expression = \`\${prev} \${operation} \${current}\`;
    this.history.unshift({ expression, result });
    
    // Keep only last 20 calculations
    if (this.history.length > 20) {
      this.history.pop();
    }
    
    this.saveHistory();
    this.renderHistory();
  }

  renderHistory() {
    if (this.history.length === 0) {
      this.historyListElement.innerHTML = '<p class="empty-history">No calculations yet</p>';
      return;
    }

    this.historyListElement.innerHTML = this.history.map((item, index) => \`
      <div class="history-item" data-index="\${index}">
        <div class="history-expression">\${item.expression} =</div>
        <div class="history-result">\${item.result}</div>
      </div>
    \`).join('');

    // Add click handlers to history items
    this.historyListElement.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = item.dataset.index;
        this.currentOperand = this.history[index].result;
        this.updateDisplay();
      });
    });
  }

  saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
  }

  loadHistory() {
    const saved = localStorage.getItem('calculatorHistory');
    if (saved) {
      this.history = JSON.parse(saved);
      this.renderHistory();
    }
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('calculatorHistory');
    this.renderHistory();
  }
}

// Initialize calculator
const calculator = new Calculator();

console.log('Utility Calculator Template loaded successfully!');
`;

export default { html, css, javascript };
