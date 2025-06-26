    let tasks = [];
    let taskIdCounter = 1;
    let currentFilter = 'all';
    let currentSearch = '';
    let editingTaskId = null;

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

    function toggleTaskComplete(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            renderTasks();
            updateStats();

            const message = task.completed ? "Task completed 🎉" : "Task marked as pending";
            showNotification(message, 'info');
        }
    }

    function deleteTask(taskId) {
        if(confirm("Are you sure you want to delete this task?")) {
            tasks = tasks.filter(t => t.id !== taskId);
            renderTasks();
            updateStats();
            showNotification('Task deleted successfully!', 'warning');
        }
    }

    function editTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('edit-task-title').value = task.title;
            document.getElementById('edit-task-category').value = task.category;
            document.getElementById('edit-task-priority').value = task.priority;
            document.getElementById('edit-task-due-date').value = task.dueDate;
            document.getElementById('edit-task-description').value = task.description;
            document.getElementById('edit-modal').style.display = 'block';
        }
    }

    function saveEditedTask() {
        if (!editingTaskId) return;

        const task = tasks.find(t => t.id === editingTaskId);
        if (task) {
            const title = document.getElementById('edit-task-title').value.trim();

            if (!title) {
                alert('Please enter a task title!');
                return;
            }

            task.title = title;
            task.category = document.getElementById('edit-task-category').value;
            task.priority = document.getElementById('edit-task-priority').value;
            task.dueDate = document.getElementById('edit-task-due-date').value;
            task.description = document.getElementById('edit-task-description').value.trim();

            closeEditModal();
            renderTasks();
            updateStats();
            showNotification('Task updated successfully!', 'success');
        }
    }

    function closeEditModal() {
        document.getElementById('edit-modal').style.display = 'none';
        editingTaskId = null;
    }

    // Filtering and searching
    function filterTasks(filter, event) { 
        currentFilter = filter;

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (event && event.target) {
            event.target.classList.add('active');
        }

        renderTasks(); 
    }

    function searchTasks(query) {
        currentSearch = query.toLowerCase().trim();
        renderTasks();
    }

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

        //sort tasks by priority and due date
        filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed - b.completed;
            }

            const priorityOrder = { high: 3, medium: 2, low: 1};
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }

            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }

            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        container.innerHTML = filteredTasks.map(task => createTaskHTML(task)).join('');
    }

    function createTaskHTML(task) {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        const dueDateDisplay = task.dueDate ? formatData(task.dueDate) : '';

        return `
            <div class="task-item ${task.completed ? 'completed' : ''} fade-in"
            draggable="true"
            ondragstart="dragStart(event, ${task.id})"
            ondragover="dragOver(event)"
            ondrop="dragDrop(event, ${task.id})">
            <div class="task-header">
                <div>
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                </div>
                <div class="task-actions">
                    <button class="task-btn complete-btn" onclick="toggleTaskComplete(${task.id})">
                        ${task.completed ? '↶ Undo' : '✔ Complete'}
                    </button>
                    <button class="task-btn edit-btn" onclick="editTask(${task.id})">🖊 Edit</button>
                    <button class="task-btn delete-btn" onclick="deleteTask(${task.id})"> 🗑 Delete</button>
                </div>
            </div>
            <div class="task-meta"> 
                <span class="task-category ${task.category}">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                ${task.dueDate ? `<span class="task-due-date ${isOverdue ? 'overdue' : ''}">📅 ${dueDateDisplay}</span>` : ''}
             </div>
            </div>
            
        `
    }

    function clearInputs() {
        document.getElementById('task-title').value = '';
        document.getElementById('task-category').value = 'personal';
        document.getElementById('task-priority').value = 'low';
        document.getElementById('task-due-date').value = '';
        document.getElementById('task-description').value = '';
    }

    function formatData(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

    //Drag and drop functionality
    let draggedTaskId = null;

    function dragStart(event, taskId){
        draggedTaskId = taskId;
        event.dataTransfer.effectAllowed = 'move';
    }

    function dragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    function dragDrop(event, targetTaskId) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');

        if (draggedTaskId && draggedTaskId !== targetTaskId ) {
            //Reorder tasks
            const draggedIndex = tasks.findIndex(task => task.id === draggedTaskId);
            const targetIndex = tasks.findIndex(task => task.id === targetIndex);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                const draggedTask = tasks.splice(draggedIndex, 1)[0];
                tasks.splice(targetIndex, 0, draggedIndex);
                renderTasks();
                showNotification('Task reordered!', 'info');
            }
        }
        draggedTaskId = null;
    }

    // keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && event.target.closest('.task-input-section')) {
            addTask();
        }

        //Escape key to close modal
        if (event.key === 'Escape') {
            closeEditModal();
        }
    });

    // Click outside modal to close
    window.onclick = function(event) {
        const modal = document.getElementById('edit-modal');
        if (event.target === modal) {
            closeEditModal();
        }
    }

    // Remove drag-over class on leaving
    document.addEventListener('dragleave', function(event) {
        if (event.target.classList.contains('drag-over')) {
            event.target.classList.remove('drag-over');
        }
    });

    // Set todays date as default for due date 
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('task-due-date').min = new Date().toISOString().split('T')[0];
    });

    // Add some sample tasks for demonstration
    function addSampleTasks() {
        const sampleTasks = [
            {
                id: taskIdCounter++,
                title: 'Complete project presentation',
                description: 'Prepare slides and notes for quaterly review meeting',
                category: 'work',
                priority: 'high',
                dueDate: '2025-06-29',
                completed: false,
                createdAt: new Date()
            },

            {
                id: taskIdCounter++,
                title: 'Complete React and PHP projects',
                description: 'Use react and php to create two projects',
                category: 'work',
                priority: 'high',
                dueDate: '2025-06-28',
                completed: false,
                createdAt: new Date()
            },
            {
                id: taskIdCounter++,
                title: 'Buy groceries',
                description: 'Milk, break, vegietables, fruits and eggs',
                category: 'shopping',
                priority: 'medium',
                dueDate: '2025-06-26',
                completed: false,
                createdAt: new Date()
            },
            {
                id: taskIdCounter++,
                title: 'Morning workout',
                description: '45-minutes cardio session',
                category: 'personal',
                priority: 'low',
                dueDate: '',
                completed: true,
                createdAt: new Date()
            },
        ];

        tasks = [...tasks, ...sampleTasks];
        renderTasks();
        updateStats();
    }

    // advance features 
    function exportTasks() {
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tasks-export.json';
        link.click();
        URL.revokeObjectURL(url);
        showNotification('Tasks exported successfully!', 'success');
    }

    function importTasks(event) {
        const file = event.target.files[0];
        if (!file) return;

        const render = new FileReader();
        render.onload = function(e) {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (Array.isArray(importedTasks)) {
                    tasks = [...tasks, ...importTasks];
                    renderTasks();
                    updateStats();
                    showNotification('Tasks imported successfully!', 'success');
                } else {
                    throw new Error('Invalid file format.');
                }

            } catch (error) {
                console.error('Error importing tasks:', error);
                alert('Error importing tasks! Please check the file format.');
            }
        };
        render.readAsText(file);
    }

    function clearAllTasks() {
        if (confirm('Are you sure you want to delete All tasks? This cannot be undone.')) {
            tasks = [];
            renderTasks();
            updateStats();
            showNotification('All tasks deleted successfully!', 'warning');
        }
    }

    function clearCompletedTasks() {
        const completedCount = tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear.');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedCount} Completed task(s)?`)) {
            tasks = tasks.filter(task => !task.completed);
            renderTasks();
            updateStats();
            showNotification(`${completedCount} Completed tasks deleted successfully!`, 'warning');
        }
    }

    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Add additional controls to the interface
    function addAdvanceControls() {
        const controlHTML = `
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 15px; text-align: center;">
                <h3 style="margin-bottm: 15px; color: #333;">Advanced Options</h3>
                <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                    <button class="task-btn" style="background: #17a2b8; color: white; padding: 10px 20px;" onclick="addSampleTasks()">
                        📝 Add Sample Tasks
                    </button>
                    <button class="task-btn" style="background: #28a745; color: white; padding: 10px 20px;" onclick="exportTasks()">
                        📤 Exports Tasks
                    </button>
                    <label class="task-btn" style="background: #007bff; color: white; padding: 10px 20px; cursor: pointer;">
                        📥 Import Tasks
                        <input type="file" accept=".json" style="display: none;" onchange="importTasks(event)" />
                    </label>
                    <button class="task-btn" style="background: #ffc107; color: #212529; padding: 10px 20px;" onclick="clearCompletedTasks()">
                        🧹 Clear Completed
                    </button>
                    <button class="task-btn" style="background: #dc3545; color: white; padding: 10px 20px;" onclick="clearAllTasks()">
                        🗑 Clear All Tasks
                    </button>
                </div>
                <div style="margin-top: 15px; font-size: 0.9em; color: #6c757d;">
                    <p><strong>Tips:</strong> Drag tasks to reorder • Use Enter to quickly add tasks • Click stats to see insights</p>
                </div>
            </div>
        `;

        document.querySelector('.container').insertAdjacentHTML('beforeend', controlHTML);
    }

    // Progress tracking
    function getProductivityStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const todayTasks = tasks.filter(t => {
            const taskDate = new Date(t.createdAt);
            return taskDate >= today;
        });

        const weekTasks = tasks.filter(t => {
            const taskDate = new Date(t.createdAt);
            return taskDate >= thisWeek;
        });

        const monthTasks = tasks.filter(t => {
            const taskDate = new Date(t.createdAt);
            return taskDate >= thisMonth;
        });

        return {
            today: { 
                total:todayTasks.length,
                completed: todayTasks.filter(t => t.completed).length,
            },
            week: { 
                total: weekTasks.length,
                completed: weekTasks.filter(t => t.completed).length,
            },
            month: { 
                total: monthTasks.length,
                completed: monthTasks.filter(t => t.completed).length,
            },
        };
    }

    // Make stats clickable for detailed view 
    function showDetailedStats() {
        const stats = getProductivityStats();
        const completionRate = tasks.length > 0 ? ((tasks.filter(t => t.completed).length / tasks.length) * 100).toFixed(1) : 0;
        alert(`📊 Detailed Statistics:
            Overall Completion Rate: ${completionRate}%

            Today: ${stats.today.completed} / ${stats.today.total} tasks completed
            This Week: ${stats.week.completed} / ${stats.week.total} tasks completed
            This Month: ${stats.month.completed} / ${stats.month.total} tasks completed
            
            Keep up the good work! 🎊
            `);
    }

    // Add click handlers to stats
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.stat-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', showDetailedStats);
        });
    });

    // Initialize the app
    function initializeApp() {
        renderTasks();
        updateStats();
        addAdvanceControls();

        // Focus on task input for better UX
        document.getElementById('task-title').focus();

        console.log('✨ Task Manager Pro initialized!');
        console.log('Features: Add, Edit, Delete, Filter, Search, Drag & Drop, Export/Import');
    }

    // Run initializeation when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

    // Auto-save reminder (visual feedback)
    let taskChangeTimeout;
    const originalRenderTasks = renderTasks;
    renderTasks = () => {
        originalRenderTasks();

        clearTimeout(taskChangeTimeout);
        // Show saving indicator
        const indicator = document.createElement('div');
        indicator.id = 'save-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 8px 15px;
            background: #28a745;
            color: white;
            border-radius: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-size: 0.8em;
            opacity: 0.8;
            animation: slideIn 0.3s ease;
        `;
        indicator.textContent = '💾 Changes saved';

        const existing = document.getElementById('save-indicator');
        if (existing) existing.remove();

        document.body.appendChild(indicator);

        // Hide after 2 seconds
        taskChangeTimeout = setTimeout(() => {
            // indicator.style.animation = 'slideOut 0.3s ease';
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 2000);
    };