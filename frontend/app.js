// Use relative URL for both local development and Docker deployment
const API_BASE_URL = 'http://localhost:3001/api';

class TodoApp {
    constructor() {
        this.todos = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTodos();
    }

    bindEvents() {
        const addBtn = document.getElementById('addBtn');
        const todoInput = document.getElementById('todoInput');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
    }

    async loadTodos() {
        try {
            this.showLoading();
            const response = await fetch(`${API_BASE_URL}/todos`);
            
            if (!response.ok) {
                throw new Error('Failed to load todos');
            }
            
            this.todos = await response.json();
            this.renderTodos();
            this.updateStats();
        } catch (error) {
            console.error('Error loading todos:', error);
            this.showError('Failed to load todos. Make sure the backend server is running.');
        }
    }

    async addTodo() {
        const todoInput = document.getElementById('todoInput');
        const text = todoInput.value.trim();

        if (!text) {
            alert('Please enter a todo text');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('Failed to add todo');
            }

            const newTodo = await response.json();
            this.todos.push(newTodo);
            this.renderTodos();
            this.updateStats();
            todoInput.value = '';
        } catch (error) {
            console.error('Error adding todo:', error);
            alert('Failed to add todo. Please try again.');
        }
    }

    async toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        try {
            const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: !todo.completed }),
            });

            if (!response.ok) {
                throw new Error('Failed to update todo');
            }

            const updatedTodo = await response.json();
            const index = this.todos.findIndex(t => t.id === id);
            this.todos[index] = updatedTodo;
            this.renderTodos();
            this.updateStats();
        } catch (error) {
            console.error('Error updating todo:', error);
            alert('Failed to update todo. Please try again.');
        }
    }

    async deleteTodo(id) {
        if (!confirm('Are you sure you want to delete this todo?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete todo');
            }

            this.todos = this.todos.filter(t => t.id !== id);
            this.renderTodos();
            this.updateStats();
        } catch (error) {
            console.error('Error deleting todo:', error);
            alert('Failed to delete todo. Please try again.');
        }
    }

    async editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt('Edit todo:', todo.text);
        if (newText === null || newText.trim() === '') {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newText.trim() }),
            });

            if (!response.ok) {
                throw new Error('Failed to update todo');
            }

            const updatedTodo = await response.json();
            const index = this.todos.findIndex(t => t.id === id);
            this.todos[index] = updatedTodo;
            this.renderTodos();
        } catch (error) {
            console.error('Error updating todo:', error);
            alert('Failed to update todo. Please try again.');
        }
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        
        if (this.todos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <h3>No todos yet!</h3>
                    <p>Add your first todo above to get started.</p>
                </div>
            `;
            return;
        }

        todoList.innerHTML = this.todos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="app.toggleTodo(${todo.id})"
                />
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="edit-btn" onclick="app.editTodo(${todo.id})">Edit</button>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">Delete</button>
                </div>
            </li>
        `).join('');
    }

    updateStats() {
        const totalCount = this.todos.length;
        const completedCount = this.todos.filter(t => t.completed).length;
        const pendingCount = totalCount - completedCount;

        document.getElementById('totalCount').textContent = totalCount;
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('pendingCount').textContent = pendingCount;
    }

    showLoading() {
        const todoList = document.getElementById('todoList');
        todoList.innerHTML = '<div class="loading">Loading todos...</div>';
    }

    showError(message) {
        const todoList = document.getElementById('todoList');
        todoList.innerHTML = `
            <div class="empty-state">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const app = new TodoApp();
