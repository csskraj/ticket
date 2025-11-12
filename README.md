# Ticketing Tool - Mobile Application

A responsive, mobile-first ticketing application built with Bootstrap 5 and vanilla JavaScript. This Progressive Web App (PWA) provides a complete solution for managing support tickets with local storage persistence.

## Features

### 🎯 Core Functionality
- **Dashboard** - Overview with statistics and recent tickets
- **Create Tickets** - Submit new support requests with categories and priorities
- **View & Manage Tickets** - List, search, filter, and update tickets
- **Ticket Details** - Comprehensive view with comments and status updates
- **User Profile** - Manage user information and preferences

### 📱 Mobile-First Design
- Responsive layout optimized for mobile devices
- Touch-friendly interface with large tap targets
- Bottom navigation for easy mobile access
- Bootstrap 5 components for consistent UI
- Progressive Web App (PWA) capabilities

### 🔧 Technical Features
- **Local Storage** - All data persists locally
- **Offline Support** - Works without internet connection
- **Real-time Search** - Filter tickets by title, description, or ID
- **Status Management** - Track tickets through lifecycle
- **Priority Levels** - Low, Medium, High, Critical
- **Categories** - Technical, Billing, General, Feature Request
- **Comments System** - Add updates and track communication
- **Export Functionality** - Download ticket data as JSON

### 🎨 User Experience
- Clean, modern interface
- Intuitive navigation
- Toast notifications for user feedback
- Modal dialogs for detailed views
- Color-coded priority and status indicators
- Empty states with helpful guidance

## Project Structure

```
Ticketing/
├── index.html          # Main application file
├── css/
│   └── style.css       # Custom styles and mobile optimizations
├── js/
│   └── app.js          # Application logic and functionality
├── manifest.json       # PWA manifest file
├── sw.js              # Service worker for offline support
└── README.md          # This file
```

## Installation & Setup

1. **Clone or Download** the project files to your local machine
2. **Open** `index.html` in a web browser
3. **For PWA features**, serve from a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (with http-server)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
4. **Access** the application at `http://localhost:8000`

## Usage Guide

### Creating Tickets
1. Navigate to the "Create" page
2. Fill in the required fields:
   - **Title**: Brief description of the issue
   - **Category**: Select appropriate category
   - **Priority**: Set urgency level
   - **Description**: Detailed explanation
3. Optionally attach files
4. Submit the ticket

### Managing Tickets
- **View All**: Navigate to "Tickets" page
- **Search**: Use the search bar to find specific tickets
- **Filter**: Use status and priority filters
- **Update Status**: Use the dropdown menu in ticket actions
- **Add Comments**: Click on a ticket to view details and add comments
- **Delete**: Remove tickets using the action menu

### Dashboard Overview
- View ticket statistics at a glance
- See recent tickets
- Quick access to create new tickets

### Profile Management
- Update user information
- Export all ticket data
- Clear all data (with confirmation)

## Technical Implementation

### Data Storage
- Uses browser's localStorage for data persistence
- Automatic data serialization/deserialization
- Sample data included for demonstration

### PWA Features
- Service worker for offline caching
- Manifest file for app installation
- Responsive design for all screen sizes

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## Customization

### Adding New Categories
Edit the category options in `index.html`:
```html
<option value="your-category">Your Category</option>
```

### Modifying Status Types
Update status options throughout the application:
- Form selects in HTML
- Status handling in JavaScript
- CSS classes for styling

### Styling Changes
Modify `css/style.css` to:
- Change color scheme
- Adjust mobile breakpoints
- Update component styling

### Feature Extensions
The modular JavaScript structure allows easy addition of:
- Email notifications
- File upload handling
- API integration
- Advanced search
- Reporting features

## Development

### File Structure
- **HTML**: Semantic structure with Bootstrap components
- **CSS**: Custom styles with mobile-first approach
- **JavaScript**: Modular class-based architecture
- **PWA**: Manifest and service worker for app-like experience

### Key Classes and Methods
- `TicketingApp`: Main application class
- `showPage()`: Navigation management
- `createTicket()`: Ticket creation logic
- `renderTicketsList()`: Dynamic UI rendering
- `filterTickets()`: Search and filter functionality

## Browser Features Used
- **LocalStorage**: Data persistence
- **Service Workers**: Offline support
- **Web App Manifest**: PWA installation
- **Responsive Design**: Mobile optimization
- **Modern JavaScript**: ES6+ features

## Future Enhancements
- Server-side integration
- Real-time notifications 
- Advanced reporting
- Multi-user support
- File upload to cloud storage
- Email notifications
- Integration with external systems

## License
This project is open source and available under the MIT License.

## Support
For issues or questions, please create a ticket using the application itself! 😊