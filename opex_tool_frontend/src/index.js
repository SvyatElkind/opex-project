import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NavigationProvider } from './Navigation/context/NavigationContext';
import { ConstantsProvider } from './context/ConstantsContext';
import Workspace from './Workspace/Workspace';

// ========================================
// FONT IMPORTS - Libertinus Serif Display
// ========================================
// Add this link tag to your public/index.html <head> section:
// <link href="https://fonts.googleapis.com/css2?family=Libertinus+Serif+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">

// ========================================
// CSS IMPORTS - CRITICAL ORDER
// ========================================
// THEME MUST BE IMPORTED FIRST - Contains all your custom colors and variables
import './styles/theme.css';

// Global workspace styles - Contains popup overrides and base styles
import './Workspace/Workspace.css';

// Project styles - Active Project, Project Popup, Upload Report Popup
import './Project/Project.css';
import './Project/ActiveProject.css';
import './Project/ProjectPopup.css';
import './Project/UploadPopup.css';
import './Project/EmptyProjectState.css';
import './Project/MissingReportState.css'; 

// Navigation styles - Breadcrumbs, action buttons, navigation components
import './Navigation/components/Navigation.css';

// Alert styles removed - using ErrorDisplay components instead

//FOND styles
import './Fond/Fond.css';

//Institution styles - Signers popup
import './Institution/Institution.css';

//Inventories styles
import './Inventory/Inventories.css';
import './Inventory/InventoryItem.css';
import './Inventory/InventoryCreate.css';
import './Inventory/InventoryDelete.css';

// Itmes 
import './Item/Items.css';
import './Item/Item.css';
import './Item/CreateItemNavigable.css';
import './Item/EditItemNavigable.css';
import './Item/ItemsTable.css';

//Record
import './Record/Record.css';
import './Record/CreateRecord.css';
import './Record/RecordsList.css';
import './Record/RecordForm.css';
import './Record/RecordMetadata.css';
import './Record/RecordFiles.css';


//import './Item/ItemNavigableZIndexFix.css';

// Error display styles
import './components/ErrorDisplay.css';

// Component-specific styles

// FontAwesome icons - Keep this last for icon overrides
import '@fortawesome/fontawesome-free/css/all.min.css';

/*
QueryClient Configuration:
- Manages server queries and state control
- Handles caching, persistence, local storage, and restoration on load
- Development features: Memory monitoring and cleanup on destruction

Your Custom Theme Features:
- Colors: #596D69 (action buttons), #744245 (error), #F1EDE1 (background), #E1B781 (warning)
- Typography: Libertinus Serif Display throughout
- Consistent spacing, shadows, and animations
- Responsive design with mobile breakpoints
- Accessibility features and focus states
*/

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes after last usage
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,
      // Enable background updates
      refetchOnMount: 'always'
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConstantsProvider>
        <NavigationProvider>
          <Workspace />
        </NavigationProvider>
      </ConstantsProvider>
      {/* React Query Devtools - Only shows in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  </React.StrictMode>
);