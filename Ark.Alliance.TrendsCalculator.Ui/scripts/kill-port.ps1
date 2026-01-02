# Kill process using port 5173 (Frontend - Vite default)
# This script runs before starting the dev server

$port = 5173
Write-Host "Checking for processes using port $port..." -ForegroundColor Cyan

try {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    
    if ($connections) {
        $processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        
        foreach ($processId in $processes) {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "  Killing process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Yellow
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "  Process killed successfully" -ForegroundColor Green
            }
        }
    }
    else {
        Write-Host "  Port $port is free" -ForegroundColor Green
    }
}
catch {
    Write-Host "  Error checking port: $_" -ForegroundColor Red
}
