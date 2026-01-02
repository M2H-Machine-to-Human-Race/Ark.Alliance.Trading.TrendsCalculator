# PowerShell script to remove unused React imports

$files = @(
    "src/App.tsx",
    "src/components/Charts/TrendPriceChart/TrendPriceChart.tsx",
    "src/components/ErrorBoundary/ErrorBoundary.tsx",
    "src/components/layout/AppLayout/AppLayout.tsx",
    "src/components/layout/Header/Header.tsx",
    "src/components/layout/Sidebar/Sidebar.tsx",
    "src/contexts/ThemeContext.tsx",
    "src/contexts/ToastContext.tsx",
    "src/contexts/TrendsContext.tsx",
    "src/contexts/WebSocketContext.tsx",
    "src/pages/ConfigurationPage/ConfigurationPage.tsx",
    "src/pages/OverviewPage/OverviewPage.tsx",
    "src/pages/SymbolsPage/SymbolsPage.tsx",
    "src/pages/TrainingPage/TrainingPage.tsx",
    "src/pages/VisualizationPage/VisualizationPage.tsx"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    $content = $content -replace "import React from 'react';`r?`n", ""
    $content = $content -replace "import React, \{", "import {"
    Set-Content $file -Value $content -NoNewline
    Write-Host "Fixed: $file"
}

Write-Host "Completed removing React imports from $($files.Count) files"
