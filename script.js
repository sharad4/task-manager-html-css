document.addEventListener("DOMContentLoaded", function() {
    let tasks = [];
    let taskIdCounter = 1;
    let currentFilter = 'all';
    let currentSearch = '';
    function addTask() {
        
        const title = document.getElementById('task-title').value.trim();
        const category = document.getElementById('task-category').value;
        const priority = document.getElementById('task-priority').value;
        const dueDate = document.getElementById('task-due-date').value;
        const description = document.getElementById('task-description').value.trim();

        if (!title) {
            alert('Please enter a task title!');
            return;
        }

        const task = {
            id: taskIdCounter++,
            title: title,
            description: description,
            category: category,
            priority: priority,
            dueDate: dueDate,
            completed: false,
            createdAt: new Date()
        }

        tasks.push(task);
        clearInputs();
        renderTasks();
        updateStats();
        console.log('Task: ', task);
        showNotification('Task added successfully!', 'success');
    }

    const submitBtn = document.querySelector('.add-btn');
    submitBtn.addEventListener('click', () => {
        addTask()
    })

    function getFilteredTasks() {
        let filteredTasks = tasks;

        //Apply category/status filter
        if (currentFilter !== 'all') {
            if (currentFilter === 'completed') {
                filteredTasks = filteredTasks.filter(t => t.completed);
            } else if (currentFilter === 'pending') {
                filteredTasks = filteredTasks.filter(t => !t.completed);
            } else {
                filteredTasks = filteredTasks.filter(t => t.category === currentFilter);
            }
        }

        //apply search filter
        if (currentSearch) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(currentSearch) ||
                task.description.toLowerCase().includes(currentSearch)
            );
        }

        return filteredTasks;
    }

    // Rendering function
    function renderTasks() {
        const container = document.getElementById('tasks-container');
        const emptySate = document.getElementById('empty-state');
        const filteredTasks = getFilteredTasks();

        if (filteredTasks.length === 0) {
            container.innerHTML = '';
            container.appendChild(emptySate);
            return;
        }
    }

    function clearInputs() {
        document.getElementById('task-title').value = '';
        document.getElementById('task-category').value = 'personal';
        document.getElementById('task-priority').value = 'low';
        document.getElementById('task-due-date').value = '';
        document.getElementById('task-description').value = '';
    }
    
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() =>
                notification.remove(), 300);
        }, 3000);
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const overdue = tasks.filter(task => 
            task.dueDate && new Date(task.dueDate) < new Date() && !task.completed 
        ).length;

        document.getElementById('total-tasks').textContent = total;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('pending-tasks').textContent = pending;
        document.getElementById('overdue-tasks').textContent = overdue;
    }
})