/**
 * AppLayout ViewModel
 * 
 * @fileoverview Logic for main application layout
 * 
 * CODE ONLY
 */

import { useState } from 'react';

export function useAppLayoutViewModel() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => !prev);
    };

    return {
        sidebarCollapsed,
        toggleSidebar,
    };
}
