const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
};

const display = document.querySelector('#display');
const keys = document.querySelector('.calculator-keys');

function updateDisplay() {
    display.textContent = calculator.displayValue;
}

// UPDATE: inputDigit now checks the waiting flag
function inputDigit(digit) {
    if (calculator.waitingForSecondOperand === true) {
        // We just pressed an operator, so start a brand new number
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        // Normal digit entry
        if (calculator.displayValue.length >= 10) return;
        calculator.displayValue = calculator.displayValue === '0' ? digit : calculator.displayValue + digit;
    }
}

function inputDecimal(dot) {
    // Prevent decimal if we are waiting for a new second operand
    if (calculator.waitingForSecondOperand === true) {
        calculator.displayValue = '0.';
        calculator.waitingForSecondOperand = false;
        return;
    }

    if (!calculator.displayValue.includes(dot)) {
        calculator.displayValue += dot;
    }
}

// NEW: The core math engine
function calculate(firstOperand, secondOperand, operator) {
    if (operator === 'add') return firstOperand + secondOperand;
    if (operator === 'subtract') return firstOperand - secondOperand;
    if (operator === 'multiply') return firstOperand * secondOperand;
    if (operator === 'divide') return firstOperand / secondOperand;
    return secondOperand;
}

// NEW: Operator logic routing
function handleOperator(nextOperator) {
    // Convert the string on screen into a real JS number
    const inputValue = parseFloat(calculator.displayValue);

    // EDGE CASE: If they pressed an operator, but changed their mind and pressed another one
    if (calculator.operator && calculator.waitingForSecondOperand) {
        calculator.operator = nextOperator;
        return;
    }

    // If firstOperand is null, this is the first time an operator was pressed
    if (calculator.firstOperand === null && !isNaN(inputValue)) {
        calculator.firstOperand = inputValue;
    } 
    // If we already have an operator, it means we are chaining (e.g. 5 + 5 +)
    else if (calculator.operator) {
        const result = calculate(calculator.firstOperand, inputValue, calculator.operator);
        
        // Fix floating point errors (0.1 + 0.2), then convert back to string
        calculator.displayValue = String(parseFloat(result.toFixed(7)));
        calculator.firstOperand = result;
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
}

function resetCalculator() {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
}

keys.addEventListener('click', (event) => {
    const target = event.target;
    if (!target.matches('button')) return;

    const action = target.dataset.action;
    const keyContent = target.textContent;

    if (!action) {
        inputDigit(keyContent);
        updateDisplay();
        return;
    }

    if (action === 'decimal') {
        inputDecimal(keyContent);
        updateDisplay();
        return;
    }
    
    if (action === 'clear') {
        resetCalculator();
        updateDisplay();
        return;
    }
    
    // Equals is just an operator that tells the system to resolve the math, 
    // but doesn't set a new math operation. We pass 'calculate' to trigger the chain, 
    // then wipe the active operator.
    if (action === 'calculate') {
        handleOperator(action);
        // Wipe the operator so subsequent number presses start fresh
        calculator.operator = null; 
        updateDisplay();
        return;
    }
    
    if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
        handleOperator(action);
        updateDisplay();
        return;
    }
});

// 6. KEYBOARD SUPPORT (Bypassing the UI, talking directly to logic)
document.addEventListener('keydown', (event) => {
    // Extract the key pressed
    const key = event.key;

    // 1. Handle Numbers (Regex to check if it's 0-9)
    if (/\d/.test(key)) {
        event.preventDefault(); // Stop default browser scrolling or finding
        inputDigit(key);
        updateDisplay();
        return;
    }

    // 2. Handle Decimal
    if (key === '.') {
        event.preventDefault();
        inputDecimal(key);
        updateDisplay();
        return;
    }

    // 3. Handle Equals (Enter or =)
    if (key === '=' || key === 'Enter') {
        event.preventDefault();
        handleOperator('calculate');
        calculator.operator = null;
        updateDisplay();
        return;
    }

    // 4. Handle Clear (Escape or Backspace for now)
    if (key === 'Escape' || key === 'Backspace') {
        event.preventDefault();
        resetCalculator();
        updateDisplay();
        return;
    }

    // 5. Handle Operators
    const operatorMap = {
        '+': 'add',
        '-': 'subtract',
        '*': 'multiply',
        '/': 'divide'
    };

    if (operatorMap[key]) {
        event.preventDefault();
        handleOperator(operatorMap[key]);
        updateDisplay();
        return;
    }
});

// 7. SERVICE WORKER REGISTRATION
// Check if the browser actually supports service workers
if ('serviceWorker' in navigator) {
    // Wait for the page to fully load before registering
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('Service Worker Registered!', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker Registration Failed!', error);
            });
    });
}