// Ticketing Application JavaScript
class TicketingApp {
    constructor() {
        this.tickets = this.loadTickets();
        this.currentTicketId = this.tickets.length;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupMobileFeatures();
        this.updateDashboard();
        this.renderRecentTickets();
        this.showPage('dashboard');
    }

    setupMobileFeatures() {
        // Prevent zoom on input focus for iOS
        this.preventZoomOnFocus();
        
        // Add touch feedback to interactive elements
        this.addTouchFeedback();
        
        // Setup pull-to-refresh
        this.setupPullToRefresh();
        
        // Add haptic feedback for supported devices
        this.setupHapticFeedback();
    }

    preventZoomOnFocus() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                const viewport = document.querySelector('meta[name="viewport"]');
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            });
            
            input.addEventListener('blur', () => {
                const viewport = document.querySelector('meta[name="viewport"]');
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0');
            });
        });
    }

    addTouchFeedback() {
        const interactiveElements = document.querySelectorAll('.btn, .ticket-item, .nav-link, .card');
        interactiveElements.forEach(element => {
            element.classList.add('touch-feedback');
        });
    }

    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (isPulling) {
                currentY = e.touches[0].clientY;
                const pullDistance = currentY - startY;
                
                if (pullDistance > 100) {
                    this.showPullToRefreshIndicator();
                }
            }
        });

        document.addEventListener('touchend', () => {
            if (isPulling && currentY - startY > 100) {
                this.refreshData();
            }
            isPulling = false;
            this.hidePullToRefreshIndicator();
        });
    }

    setupHapticFeedback() {
        // Add haptic feedback for button interactions on supported devices
        if ('vibrate' in navigator) {
            document.addEventListener('click', (e) => {
                if (e.target.closest('.btn-primary, .btn-success')) {
                    navigator.vibrate(10); // Short vibration for primary actions
                } else if (e.target.closest('.btn-danger')) {
                    navigator.vibrate([10, 50, 10]); // Pattern for destructive actions
                }
            });
        }
    }

    showPullToRefreshIndicator() {
        let indicator = document.querySelector('.ptr-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'ptr-indicator';
            indicator.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Release to refresh';
            document.body.appendChild(indicator);
        }
        indicator.classList.add('show');
    }

    hidePullToRefreshIndicator() {
        const indicator = document.querySelector('.ptr-indicator');
        if (indicator) {
            indicator.classList.remove('show');
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 200);
        }
    }

    refreshData() {
        this.updateDashboard();
        this.renderRecentTickets();
        this.renderTicketsList();
        this.showToast('Data refreshed!', 'success');
    }

    bindEvents() {
        // Page navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('[onclick*="showPage"]')) {
                e.preventDefault();
            }
        });

        // Create ticket form
        document.getElementById('create-ticket-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTicket();
        });

        // Profile form
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });

        // Search and filter
        document.getElementById('search-input').addEventListener('input', () => {
            this.filterTickets();
        });

        document.getElementById('status-filter').addEventListener('change', () => {
            this.filterTickets();
        });

        document.getElementById('priority-filter').addEventListener('change', () => {
            this.filterTickets();
        });

        // Bootstrap modal events
        const ticketModal = document.getElementById('ticketDetailModal');
        ticketModal.addEventListener('hidden.bs.modal', () => {
            document.getElementById('ticket-detail-content').innerHTML = '';
        });
    }

    // Page Management
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        document.getElementById(pageId + '-page').classList.add('active');

        // Update navigation
        this.updateNavigation(pageId);

        // Load page specific content
        switch (pageId) {
            case 'dashboard':
                this.updateDashboard();
                this.renderRecentTickets();
                break;
            case 'tickets':
                this.renderTicketsList();
                break;
            case 'create':
                this.resetCreateForm();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    }

    updateNavigation(activePageId) {
        // Update navbar
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Update bottom navigation
        document.querySelectorAll('.fixed-bottom .nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page
        const activeNavLinks = document.querySelectorAll(`[onclick*="${activePageId}"]`);
        activeNavLinks.forEach(link => {
            if (link.classList.contains('nav-link')) {
                link.classList.add('active');
            }
        });

        // Close mobile navbar menu if open
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                toggle: false
            });
            bsCollapse.hide();
        }

        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Ticket Management
    createTicket() {
        const form = document.getElementById('create-ticket-form');
        const formData = new FormData(form);

        const ticket = {
            id: ++this.currentTicketId,
            title: document.getElementById('ticket-title').value,
            category: document.getElementById('ticket-category').value,
            priority: document.getElementById('ticket-priority').value,
            description: document.getElementById('ticket-description').value,
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: [],
            attachments: []
        };

        // Handle file attachment
        const attachmentFile = document.getElementById('ticket-attachment').files[0];
        if (attachmentFile) {
            ticket.attachments.push({
                name: attachmentFile.name,
                size: attachmentFile.size,
                type: attachmentFile.type
            });
        }

        this.tickets.push(ticket);
        this.saveTickets();

        // Show success message
        this.showToast('Ticket created successfully!', 'success');

        // Reset form and redirect
        form.reset();
        this.showPage('dashboard');
    }

    updateTicketStatus(ticketId, newStatus) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.status = newStatus;
            ticket.updatedAt = new Date().toISOString();
            
            // Add status change comment
            ticket.comments.push({
                id: Date.now(),
                content: `Status changed to ${newStatus}`,
                author: 'System',
                createdAt: new Date().toISOString(),
                type: 'status-change'
            });

            this.saveTickets();
            this.updateDashboard();
            this.renderTicketsList();
        }
    }

    addComment(ticketId, content) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (ticket) {
            const comment = {
                id: Date.now(),
                content: content,
                author: 'John Doe', // Get from user profile
                createdAt: new Date().toISOString(),
                type: 'comment'
            };

            ticket.comments.push(comment);
            ticket.updatedAt = new Date().toISOString();
            this.saveTickets();
            
            return comment;
        }
        return null;
    }

    deleteTicket(ticketId) {
        if (confirm('Are you sure you want to delete this ticket?')) {
            this.tickets = this.tickets.filter(t => t.id !== ticketId);
            this.saveTickets();
            this.updateDashboard();
            this.renderTicketsList();
            this.showToast('Ticket deleted successfully!', 'success');
        }
    }

    // UI Rendering
    updateDashboard() {
        const stats = this.getTicketStats();
        
        document.getElementById('total-tickets').textContent = stats.total;
        document.getElementById('open-tickets').textContent = stats.open;
        document.getElementById('progress-tickets').textContent = stats.inProgress;
        document.getElementById('resolved-tickets').textContent = stats.resolved;
    }

    renderRecentTickets() {
        const recentTickets = this.tickets
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const container = document.getElementById('recent-tickets-list');

        if (recentTickets.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-inbox fs-1"></i>
                    <p>No tickets found. Create your first ticket!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentTickets
            .map(ticket => this.renderTicketItem(ticket))
            .join('');
    }

    renderTicketsList(filteredTickets = null) {
        const tickets = filteredTickets || this.tickets;
        const container = document.getElementById('tickets-list');

        if (tickets.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-body text-center text-muted py-4">
                        <i class="bi bi-inbox fs-1"></i>
                        <p>No tickets found.</p>
                    </div>
                </div>
            `;
            return;
        }

        const sortedTickets = tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        container.innerHTML = sortedTickets
            .map(ticket => this.renderTicketItem(ticket, true))
            .join('');
    }

    renderTicketItem(ticket, showActions = false) {
        const createdDate = new Date(ticket.createdAt).toLocaleDateString();
        const priorityClass = `priority-${ticket.priority}`;
        const statusClass = `status-${ticket.status}`;

        return `
            <div class="ticket-item ${priorityClass}" onclick="showTicketDetail(${ticket.id})">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="ticket-id">#${ticket.id}</div>
                    <div class="d-flex gap-1">
                        <span class="status-badge ${statusClass}">${ticket.status.replace('-', ' ')}</span>
                        <span class="priority-badge priority-${ticket.priority}">${ticket.priority}</span>
                    </div>
                </div>
                
                <h6 class="ticket-title text-truncate-2">${ticket.title}</h6>
                
                <div class="ticket-meta d-flex justify-content-between">
                    <small>
                        <i class="bi bi-folder"></i> ${ticket.category}
                    </small>
                    <small>
                        <i class="bi bi-calendar"></i> ${createdDate}
                    </small>
                </div>
                
                ${showActions ? `
                    <div class="mt-2 d-flex gap-1" onclick="event.stopPropagation()">
                        <button class="btn btn-sm btn-outline-primary" onclick="showTicketDetail(${ticket.id})">
                            <i class="bi bi-eye"></i>
                        </button>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                <i class="bi bi-gear"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="updateTicketStatus(${ticket.id}, 'in-progress')">Mark In Progress</a></li>
                                <li><a class="dropdown-item" href="#" onclick="updateTicketStatus(${ticket.id}, 'resolved')">Mark Resolved</a></li>
                                <li><a class="dropdown-item" href="#" onclick="updateTicketStatus(${ticket.id}, 'closed')">Close Ticket</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deleteTicket(${ticket.id})">Delete</a></li>
                            </ul>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    showTicketDetail(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const createdDate = new Date(ticket.createdAt).toLocaleString();
        const updatedDate = new Date(ticket.updatedAt).toLocaleString();

        const content = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5>${ticket.title}</h5>
                            <div class="d-flex gap-2 mb-2">
                                <span class="status-badge status-${ticket.status}">${ticket.status.replace('-', ' ')}</span>
                                <span class="priority-badge priority-${ticket.priority}">${ticket.priority}</span>
                                <span class="badge bg-secondary">${ticket.category}</span>
                            </div>
                        </div>
                        <div class="text-muted small">
                            #${ticket.id}
                        </div>
                    </div>

                    <div class="card mb-3">
                        <div class="card-body">
                            <h6>Description</h6>
                            <p>${ticket.description}</p>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-6">
                            <small class="text-muted">Created</small>
                            <div>${createdDate}</div>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Last Updated</small>
                            <div>${updatedDate}</div>
                        </div>
                    </div>

                    ${ticket.attachments.length > 0 ? `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h6>Attachments</h6>
                                ${ticket.attachments.map(att => `
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="bi bi-paperclip"></i>
                                        <span>${att.name}</span>
                                        <small class="text-muted">(${this.formatFileSize(att.size)})</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0">Comments & Updates</h6>
                        </div>
                        <div class="card-body">
                            <div id="comments-list">
                                ${ticket.comments.length > 0 ? 
                                    ticket.comments.map(comment => this.renderComment(comment)).join('') :
                                    '<p class="text-muted">No comments yet.</p>'
                                }
                            </div>
                            
                            <form id="add-comment-form" onsubmit="addCommentToTicket(event, ${ticket.id})">
                                <div class="input-group">
                                    <input type="text" class="form-control" placeholder="Add a comment..." required>
                                    <button class="btn btn-primary" type="submit">
                                        <i class="bi bi-send"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-outline-primary" onclick="updateTicketStatus(${ticket.id}, 'in-progress')">
                            Mark In Progress
                        </button>
                        <button class="btn btn-outline-success" onclick="updateTicketStatus(${ticket.id}, 'resolved')">
                            Mark Resolved
                        </button>
                        <button class="btn btn-outline-secondary" onclick="updateTicketStatus(${ticket.id}, 'closed')">
                            Close Ticket
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteTicket(${ticket.id})">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('ticket-detail-content').innerHTML = content;
        document.getElementById('ticketDetailTitle').textContent = `Ticket #${ticket.id}`;
        
        const modal = new bootstrap.Modal(document.getElementById('ticketDetailModal'));
        modal.show();
    }

    renderComment(comment) {
        const createdDate = new Date(comment.createdAt).toLocaleString();
        const isSystemComment = comment.type === 'status-change';

        return `
            <div class="comment-item ${isSystemComment ? 'bg-light' : ''}">
                <div class="comment-meta d-flex justify-content-between">
                    <strong>${comment.author}</strong>
                    <small>${createdDate}</small>
                </div>
                <div class="comment-content">
                    ${isSystemComment ? `<em><i class="bi bi-info-circle"></i> ${comment.content}</em>` : comment.content}
                </div>
            </div>
        `;
    }

    addCommentToTicket(event, ticketId) {
        event.preventDefault();
        const form = event.target;
        const input = form.querySelector('input');
        const content = input.value.trim();

        if (content) {
            const comment = this.addComment(ticketId, content);
            if (comment) {
                // Update the comments list
                const commentsList = document.getElementById('comments-list');
                if (commentsList.innerHTML.includes('No comments yet')) {
                    commentsList.innerHTML = '';
                }
                commentsList.insertAdjacentHTML('beforeend', this.renderComment(comment));
                
                // Clear the input
                input.value = '';
                
                this.showToast('Comment added successfully!', 'success');
            }
        }
    }

    // Filtering and Search
    filterTickets() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        const priorityFilter = document.getElementById('priority-filter').value;

        let filteredTickets = this.tickets;

        // Apply search filter
        if (searchTerm) {
            filteredTickets = filteredTickets.filter(ticket =>
                ticket.title.toLowerCase().includes(searchTerm) ||
                ticket.description.toLowerCase().includes(searchTerm) ||
                ticket.id.toString().includes(searchTerm)
            );
        }

        // Apply status filter
        if (statusFilter) {
            filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter);
        }

        // Apply priority filter
        if (priorityFilter) {
            filteredTickets = filteredTickets.filter(ticket => ticket.priority === priorityFilter);
        }

        this.renderTicketsList(filteredTickets);
    }

    // Profile Management
    loadProfile() {
        const profile = this.getProfile();
        document.getElementById('user-name').value = profile.name;
        document.getElementById('user-email').value = profile.email;
        document.getElementById('user-phone').value = profile.phone;
        document.getElementById('user-department').value = profile.department;
    }

    updateProfile() {
        const profile = {
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            department: document.getElementById('user-department').value
        };

        localStorage.setItem('ticketing_profile', JSON.stringify(profile));
        this.showToast('Profile updated successfully!', 'success');
    }

    getProfile() {
        const defaultProfile = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 234 567 8900',
            department: 'it'
        };

        const saved = localStorage.getItem('ticketing_profile');
        return saved ? JSON.parse(saved) : defaultProfile;
    }

    // Data Management
    loadTickets() {
        const saved = localStorage.getItem('ticketing_tickets');
        return saved ? JSON.parse(saved) : this.generateSampleData();
    }

    saveTickets() {
        localStorage.setItem('ticketing_tickets', JSON.stringify(this.tickets));
    }

    generateSampleData() {
        return [
            {
                id: 1,
                title: 'Login issues with company portal',
                category: 'technical',
                priority: 'high',
                description: 'Unable to login to the company portal. Getting error message "Invalid credentials" even with correct password.',
                status: 'open',
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                comments: [
                    {
                        id: 1,
                        content: 'I have tried resetting my password but the issue persists.',
                        author: 'John Doe',
                        createdAt: new Date(Date.now() - 80000000).toISOString(),
                        type: 'comment'
                    }
                ],
                attachments: []
            },
            {
                id: 2,
                title: 'Request for new software license',
                category: 'general',
                priority: 'medium',
                description: 'Need to request a new license for Adobe Creative Suite for the marketing team.',
                status: 'in-progress',
                createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                comments: [
                    {
                        id: 2,
                        content: 'Status changed to in-progress',
                        author: 'System',
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        type: 'status-change'
                    }
                ],
                attachments: []
            },
            {
                id: 3,
                title: 'Billing discrepancy in last invoice',
                category: 'billing',
                priority: 'low',
                description: 'There seems to be a discrepancy in the last billing invoice. The amount charged is different from what was agreed.',
                status: 'resolved',
                createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                updatedAt: new Date(Date.now() - 172800000).toISOString(),
                comments: [],
                attachments: []
            }
        ];
    }

    getTicketStats() {
        return {
            total: this.tickets.length,
            open: this.tickets.filter(t => t.status === 'open').length,
            inProgress: this.tickets.filter(t => t.status === 'in-progress').length,
            resolved: this.tickets.filter(t => t.status === 'resolved').length,
            closed: this.tickets.filter(t => t.status === 'closed').length
        };
    }

    // Utility Functions
    resetCreateForm() {
        document.getElementById('create-ticket-form').reset();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    // Export and Import Functions
    exportTickets() {
        const data = {
            tickets: this.tickets,
            profile: this.getProfile(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Data exported successfully!', 'success');
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            if (confirm('This will delete all tickets and reset your profile. Are you absolutely sure?')) {
                localStorage.removeItem('ticketing_tickets');
                localStorage.removeItem('ticketing_profile');
                
                this.tickets = this.generateSampleData();
                this.currentTicketId = this.tickets.length;
                
                this.updateDashboard();
                this.renderRecentTickets();
                this.showPage('dashboard');
                
                this.showToast('All data cleared successfully!', 'success');
            }
        }
    }
}

// Global Functions (for onclick handlers)
let app;

function showPage(pageId) {
    app.showPage(pageId);
}

function showTicketDetail(ticketId) {
    app.showTicketDetail(ticketId);
}

function updateTicketStatus(ticketId, status) {
    app.updateTicketStatus(ticketId, status);
}

function deleteTicket(ticketId) {
    app.deleteTicket(ticketId);
}

function addCommentToTicket(event, ticketId) {
    app.addCommentToTicket(event, ticketId);
}

function exportTickets() {
    app.exportTickets();
}

function clearAllData() {
    app.clearAllData();
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    app = new TicketingApp();
});

// Service Worker Registration (for PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}