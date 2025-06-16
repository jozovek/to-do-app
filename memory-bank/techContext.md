# Todo App Technical Context

## Technologies Used

### Core Technologies
1. **Vue.js (v3)**: Frontend framework using the Composition API
   - Used for building the user interface and managing component state
   - Leverages reactivity system for efficient updates

2. **Vite**: Build tool and development server
   - Provides fast hot module replacement during development
   - Optimizes the build for production deployment

3. **JavaScript (ES6+)**: Programming language
   - Arrow functions, destructuring, template literals, and other modern features
   - Async/await for handling asynchronous operations

4. **HTML5**: Markup language
   - Semantic elements for better accessibility and SEO
   - Forms and input elements for user interaction

5. **CSS3**: Styling language
   - Flexbox for layout
   - CSS variables for consistent theming
   - Transitions for subtle animations

### Storage
- **localStorage**: Browser-based storage API
  - Used for persisting todo items between sessions
  - JSON serialization/deserialization for storing complex data

### Export Functionality
- **iCalendar (.ics)**: Calendar file format
  - Used for exporting todo items to calendar applications
  - Generated dynamically using JavaScript

## Development Setup

### Prerequisites
- Node.js (v14+)
- npm (v6+) or yarn

### Development Environment
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure
- **src/**: Source code directory
  - **components/**: Vue components
  - **composables/**: Composition API functions
  - **utils/**: Utility functions
  - **assets/**: Static assets (images, fonts)
  - **App.vue**: Root component
  - **main.js**: Application entry point
  - **style.css**: Global styles

- **public/**: Static files served as-is
- **dist/**: Production build output (generated)
- **memory-bank/**: Project documentation

## Technical Constraints

### Browser Compatibility
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- No support required for IE11 or older browsers

### Performance Targets
- Initial load time: < 2 seconds on broadband
- Time to interactive: < 3 seconds
- Smooth animations (60fps)

### Storage Limitations
- localStorage limited to ~5MB per domain
- All data stored client-side (no server persistence)

### Offline Capabilities
- Basic functionality works without internet connection
- Changes are persisted locally

## Dependencies

### Production Dependencies
- **vue**: Core Vue.js library
- No additional production dependencies required

### Development Dependencies
- **vite**: Build tool and dev server
- **@vitejs/plugin-vue**: Vue plugin for Vite

## Tool Usage Patterns

### Vite Commands
- `npm run dev`: Start development server with hot module replacement
- `npm run build`: Create optimized production build
- `npm run preview`: Preview production build locally

### Vue Patterns
- Single-file components (.vue files)
- Composition API with `<script setup>` syntax
- Props for parent-to-child communication
- Events for child-to-parent communication
- Refs for reactive state

### Code Organization
- One component per file
- Composables for reusable logic
- Utility functions for common operations

### Styling Approach
- Component-scoped CSS using `<style scoped>` in Vue components
- Global styles for typography, colors, and shared elements
- CSS variables for theming

## Deployment Process
1. Run `npm run build` to generate production files
2. Upload the contents of the `dist` directory to Netlify
3. Configure Netlify for SPA routing (if needed)
4. Verify the deployment works correctly
