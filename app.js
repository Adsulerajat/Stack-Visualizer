// Stack Implementation
class Stack {
    constructor(capacity = 5) {
        this.items = [];
        this._capacity = capacity;
    }

    get capacity() {
        return this._capacity;
    }

    push(val) {
        if (this.items.length >= this._capacity) {
            return { success: false, message: "Stack Overflow! Cannot push to full stack." };
        }
        this.items.push(val);
        return { success: true, message: `Pushed "${val}" to stack` };
    }

    pop() {
        if (this.items.length === 0) {
            return { success: false, message: "Stack Underflow! Cannot pop from empty stack." };
        }
        const val = this.items.pop();
        return { success: true, message: `Popped "${val}" from stack`, value: val };
    }

    peek() {
        if (this.items.length === 0) {
            return { success: false, message: "Stack is empty! Nothing to peek." };
        }
        const val = this.items[this.items.length - 1];
        return { success: true, message: `Top value is "${val}"`, value: val };
    }

    clear() {
        this.items = [];
        return { success: true, message: "Stack cleared successfully" };
    }

    resize(newCapacity) {
        if (newCapacity < 1) {
            return { success: false, message: "Capacity must be at least 1" };
        }
        
        const oldCapacity = this._capacity;
        this._capacity = newCapacity;
        
        if (this.items.length > newCapacity) {
            const removed = this.items.splice(newCapacity);
            return { success: true, message: `Resized from ${oldCapacity} to ${newCapacity}. Removed ${removed.length} items.` };
        }
        
        return { success: true, message: `Resized from ${oldCapacity} to ${newCapacity}` };
    }

    size() {
        return this.items.length;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    isFull() {
        return this.items.length === this._capacity;
    }

    getTopIndex() {
        return this.items.length - 1;
    }

    getItems() {
        return [...this.items];
    }
}

// Global variables
let stack = new Stack(5);
let isAnimating = false;
let isDarkMode = false;

// DOM elements
const elements = {
    stackBlocks: document.getElementById('stackBlocks'),
    indexLabels: document.getElementById('indexLabels'),
    pointer: document.getElementById('pointer'),
    valueInput: document.getElementById('valueInput'),
    capacityInput: document.getElementById('capacityInput'),
    capacityDisplay: document.getElementById('capacityDisplay'),
    arraySize: document.getElementById('arraySize'),
    arrayContent: document.getElementById('arrayContent'),
    topIndex: document.getElementById('topIndex'),
    stackSize: document.getElementById('stackSize'),
    stackCapacity: document.getElementById('stackCapacity'),
    lastOperation: document.getElementById('lastOperation'),
    themeToggle: document.getElementById('themeToggle'),
    toastContainer: document.getElementById('toastContainer')
};

// Initialize the application
function init() {
    render();
    setupEventListeners();
    updateLastOperation("Application initialized");
}

// Event listeners
function setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
    
    // Input enter key handlers
    elements.valueInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            pushValue();
        }
    });
    
    elements.capacityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            resizeStack();
        }
    });
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
}

// Keyboard shortcut handler
function handleKeyDown(e) {
    const target = e.target;
    
    // Don't trigger shortcuts when typing in inputs
    if (target.tagName === 'INPUT') {
        return;
    }
    
    switch (e.key.toLowerCase()) {
        case 'p':
            e.preventDefault();
            popValue();
            break;
        case 'k':
            e.preventDefault();
            peekValue();
            break;
        case 'c':
            e.preventDefault();
            clearStack();
            break;
    }
}

// Theme management
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark', isDarkMode);
    elements.themeToggle.innerHTML = `<span class="theme-icon">${isDarkMode ? '☀️' : '🌙'}</span>`;
    localStorage.setItem('stack-visualizer-theme', isDarkMode ? 'dark' : 'light');
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('stack-visualizer-theme');
    if (savedTheme === 'dark') {
        isDarkMode = true;
        document.body.classList.add('dark');
        elements.themeToggle.innerHTML = '<span class="theme-icon">☀️</span>';
    }
}

// Toast notifications
function showToast(title, message, type = 'default') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-description">${message}</div>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Update last operation
function updateLastOperation(message) {
    elements.lastOperation.textContent = message;
}

// Calculate pointer position
function getPointerPosition() {
    const blockHeight = 52; // 48px + 4px margin
    
    if (stack.isEmpty()) {
        // Point below the bottom block
        return stack.capacity * blockHeight;
    } else {
        // Point to the top item (items are rendered bottom-to-top)
        const topIndex = stack.getTopIndex();
        return (stack.capacity - 1 - topIndex) * blockHeight + 24; // Center of block
    }
}

// Render the stack visualization
function render() {
    renderStackBlocks();
    renderIndexLabels();
    updatePointer();
    updateStatus();
    updateArrayRepresentation();
}

// Render stack blocks
function renderStackBlocks() {
    elements.stackBlocks.innerHTML = '';
    
    for (let i = 0; i < stack.capacity; i++) {
        const block = document.createElement('div');
        block.className = 'stack-block';
        block.setAttribute('data-testid', `block-${i}`);
        
        const isFilledBlock = i < stack.size();
        const value = isFilledBlock ? stack.getItems()[i] : '—';
        
        if (isFilledBlock) {
            block.classList.add('filled');
        } else {
            block.classList.add('empty');
        }
        
        block.textContent = value;
        elements.stackBlocks.appendChild(block);
    }
}

// Render index labels
function renderIndexLabels() {
    elements.indexLabels.innerHTML = '';
    
    for (let i = 0; i < stack.capacity; i++) {
        const label = document.createElement('div');
        label.className = 'index-label';
        label.setAttribute('data-testid', `index-${i}`);
        label.textContent = i;
        elements.indexLabels.appendChild(label);
    }
}

// Update pointer position
function updatePointer() {
    const position = getPointerPosition();
    elements.pointer.style.transform = `translateY(${position}px)`;
}

// Update status displays
function updateStatus() {
    elements.capacityDisplay.textContent = stack.capacity;
    elements.topIndex.textContent = stack.getTopIndex();
    elements.stackSize.textContent = stack.size();
    elements.stackCapacity.textContent = stack.capacity;
    elements.arraySize.textContent = `Size: ${stack.size()}`;
}

// Update array representation
function updateArrayRepresentation() {
    const items = stack.getItems();
    if (items.length > 0) {
        elements.arrayContent.textContent = `"${items.join('", "')}"`;
    } else {
        elements.arrayContent.textContent = '';
    }
}

// Stack operations
function pushValue() {
    if (isAnimating) return;
    
    const value = elements.valueInput.value.trim();
    if (!value) {
        showToast('Invalid Input', 'Please enter a value to push', 'warning');
        return;
    }
    
    const result = stack.push(value);
    updateLastOperation(result.message);
    
    if (result.success) {
        elements.valueInput.value = '';
        showToast('Success', result.message, 'success');
        render();
    } else {
        showToast('Error', result.message, 'error');
        // Trigger shake animation
        elements.stackBlocks.classList.add('animate-shake');
        setTimeout(() => {
            elements.stackBlocks.classList.remove('animate-shake');
        }, 500);
    }
}

function popValue() {
    if (isAnimating) return;
    
    const result = stack.pop();
    updateLastOperation(result.message);
    
    if (result.success) {
        showToast('Success', result.message, 'success');
        render();
    } else {
        showToast('Error', result.message, 'error');
        // Trigger shake animation
        elements.stackBlocks.classList.add('animate-shake');
        setTimeout(() => {
            elements.stackBlocks.classList.remove('animate-shake');
        }, 500);
    }
}

function peekValue() {
    const result = stack.peek();
    updateLastOperation(result.message);
    
    if (result.success) {
        showToast('Peek', result.message, 'default');
        // Trigger glow animation on top block
        if (stack.size() > 0) {
            const blocks = elements.stackBlocks.querySelectorAll('.stack-block');
            const topBlock = blocks[stack.getTopIndex()];
            if (topBlock) {
                topBlock.classList.add('animate-glow');
                setTimeout(() => {
                    topBlock.classList.remove('animate-glow');
                }, 500);
            }
        }
    } else {
        showToast('Error', result.message, 'error');
    }
}

function clearStack() {
    if (isAnimating) return;
    
    const result = stack.clear();
    updateLastOperation(result.message);
    showToast('Success', result.message, 'success');
    render();
}

function resizeStack() {
    if (isAnimating) return;
    
    const newCapacity = parseInt(elements.capacityInput.value);
    if (!newCapacity || newCapacity < 1 || newCapacity > 20) {
        showToast('Invalid Input', 'Capacity must be between 1 and 20', 'warning');
        return;
    }
    
    const result = stack.resize(newCapacity);
    updateLastOperation(result.message);
    elements.capacityInput.value = '';
    showToast('Success', result.message, 'success');
    render();
}

function randomizeStack() {
    if (isAnimating) return;
    
    stack.clear();
    const values = ['A', 'B', 'C', 'X', 'Y', 'Z', '1', '2', '3', '★', '♦', '♠'];
    const pushCount = Math.floor(Math.random() * stack.capacity) + 1;
    
    for (let i = 0; i < pushCount; i++) {
        const randomValue = values[Math.floor(Math.random() * values.length)];
        stack.push(randomValue);
    }
    
    updateLastOperation(`Randomized stack with ${pushCount} items`);
    showToast('Randomized', `Added ${pushCount} random items to stack`, 'default');
    render();
}

function displayAll() {
    const items = stack.getItems();
    if (items.length === 0) {
        showToast('Empty Stack', 'Stack is empty - nothing to display', 'warning');
        updateLastOperation('Display all: Stack is empty');
        return;
    }
    
    const itemsList = items.map((item, index) => `[${index}]: "${item}"`).join(', ');
    updateLastOperation(`Display all: ${itemsList}`);
    showToast('Stack Contents', `All items: ${itemsList}`, 'default');
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    init();
});