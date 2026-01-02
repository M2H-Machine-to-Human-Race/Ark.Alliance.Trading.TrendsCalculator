# Fix Import Paths Script for Clean Architecture Migration
# This script updates all import paths to match the new Clean Architecture structure

Write-Host "Starting import path migration..." -ForegroundColor Cyan

$srcPath = "src"
$files = Get-ChildItem -Path $srcPath -Recurse -Include *.ts -File

$replacements = @(
    # Fix case sensitivity (Entities -> entities)
    @{Pattern = "from\s+'\.\.\/Entities\/"; Replacement = "from '../entities/"},
    @{Pattern = 'from\s+"\.\.\/Entities\/'; Replacement = 'from "../entities/'},
    
    # Fix DatabaseService path
    @{Pattern = "from\s+'\.\.\/DatabaseService'"; Replacement = "from '../DatabaseService'"},
    @{Pattern = "from\s+'\.\.\/\.\.\/Data\/DatabaseService'"; Replacement = "from '@infrastructure/persistence/DatabaseService'"},
    
    # Fix moved application services
    @{Pattern = "from\s+'\.\.\/\.\.\/services\/TrendCalculatorService'"; Replacement = "from '@application/services/TrendCalculatorService'"},
    @{Pattern = "from\s+'\.\.\/\.\.\/services\/SymbolTrackingService'"; Replacement = "from '@application/services/SymbolTrackingService'"},
    @{Pattern = "from\s+'\.\.\/\.\.\/services\/MarketDataService'"; Replacement = "from '@application/services/MarketDataService'"},
    @{Pattern = "from\s+'\.\.\/\.\.\/services\/StreamingAnalysisService'"; Replacement = "from '@application/services/StreamingAnalysisService'"},
    
    # Fix moved logging
    @{Pattern = "from\s+'\.\.\/\.\.\/core\/logging\/SystemLogger'"; Replacement = "from '@infrastructure/SystemLogger'"},
    @{Pattern = "from\s+'\.\.\/core\/logging\/SystemLogger'"; Replacement = "from '@infrastructure/SystemLogger'"},
    
    # Fix moved domain services (helpers)
    @{Pattern = "from\s+'\.\.\/\.\.\/helpers\/"; Replacement = "from '@domain/services/"},
    @{Pattern = "from\s+'\.\./helpers\/"; Replacement = "from '@domain/services/"},
    @{Pattern = "from\s+'\.\.\/\.\.\/\.\.\/Backend\/src\/helpers\/"; Replacement = "from '@domain/services/"},
    
    # Fix moved infrastructure
    @{Pattern = "from\s+'\.\.\/\.\.\/infrastructure\/clients\/"; Replacement = "from '@infrastructure/external/"},
    @{Pattern = "from\s+'\.\.\/clients\/"; Replacement = "from '@infrastructure/external/"},
    
    # Fix old Data references
    @{Pattern = "from\s+'\.\.\/\.\.\/Data\/"; Replacement = "from '@infrastructure/persistence/"},
    @{Pattern = "from\s+'\.\./Data\/"; Replacement = "from '@infrastructure/persistence/"}
)

$totalChanges = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $originalContent = $content
    $fileChanges = 0
    
    foreach ($replacement in $replacements) {
        $matches = [regex]::Matches($content, $replacement.Pattern)
        if ($matches.Count -gt 0) {
            $content = $content -replace $replacement.Pattern, $replacement.Replacement
            $fileChanges += $matches.Count
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $relPath = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\')
        Write-Host "  ✓ $relPath ($fileChanges changes)" -ForegroundColor Green
        $totalChanges += $fileChanges
    }
}

Write-Host "`nCompleted! Total changes: $totalChanges" -ForegroundColor Cyan
Write-Host "Running build to verify..." -ForegroundColor Yellow
