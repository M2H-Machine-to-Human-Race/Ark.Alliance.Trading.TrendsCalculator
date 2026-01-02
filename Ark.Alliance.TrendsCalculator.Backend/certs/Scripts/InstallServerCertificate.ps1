Clear-Host
Write-Host "=== Existing Certificate Installer (Interactive + OpenSSL Auto-Check) ===" -ForegroundColor Cyan

# ------------------------------------------------------------
# 1. Detect current directory
# ------------------------------------------------------------

$CurrentDir = Get-Location
Write-Host "`nCurrent directory detected: $CurrentDir" -ForegroundColor Yellow

# ------------------------------------------------------------
# 2. Check OpenSSL presence and version
# ------------------------------------------------------------

function Get-OpenSSLVersion {
    try {
        $output = & openssl version 2>$null
        if ($output) { return $output }
    } catch {
        return $null
    }
}

Write-Host "`nChecking OpenSSL installation..." -ForegroundColor Yellow
$opensslVersion = Get-OpenSSLVersion

if (-not $opensslVersion) {
    Write-Host "OpenSSL is not installed on this system." -ForegroundColor Red
    $install = Read-Host "Do you want to install OpenSSL automatically? (o/n)"

    if ($install -eq "o") {
        Write-Host "Downloading OpenSSL installer..." -ForegroundColor Yellow
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $installerUrl = "https://slproweb.com/download/Win64OpenSSL-3_6_0.exe"
        $installerPath = Join-Path $CurrentDir "openssl-installer.exe"

        try {
            Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing
            Write-Host "OpenSSL installer downloaded." -ForegroundColor Green
        } catch {
            Write-Host "Failed to download OpenSSL installer." -ForegroundColor Red
            exit
        }

        Write-Host "Running OpenSSL installer..." -ForegroundColor Yellow
        Start-Process -FilePath $installerPath -ArgumentList "/silent" -Wait

        Write-Host "OpenSSL installation completed." -ForegroundColor Green

        $opensslVersion = Get-OpenSSLVersion
        if (-not $opensslVersion) {
            Write-Host "OpenSSL installation failed. Aborting." -ForegroundColor Red
            exit
        }
    } else {
        Write-Host "OpenSSL is required. Aborting." -ForegroundColor Red
        exit
    }
}

Write-Host "OpenSSL detected: $opensslVersion" -ForegroundColor Green

# ------------------------------------------------------------
# 3. Ask for PFX filename and password
# ------------------------------------------------------------

$pfxFile = Read-Host "Enter PFX file name (default: certificate.pfx)"
if ([string]::IsNullOrWhiteSpace($pfxFile)) { $pfxFile = "certificate.pfx" }

$pfxPath = Join-Path $CurrentDir $pfxFile

if (-not (Test-Path $pfxPath)) {
    Write-Host "PFX file not found: $pfxPath" -ForegroundColor Red
    exit
}

$pfxPass = Read-Host "Enter PFX password (default: P@ssw0rd!)"
if ([string]::IsNullOrWhiteSpace($pfxPass)) { $pfxPass = "P@ssw0rd!" }

# ------------------------------------------------------------
# 4. Import PFX into Windows certificate store
# ------------------------------------------------------------

Write-Host "`nImporting certificate into LocalMachine\My..." -ForegroundColor Yellow

$securePass = ConvertTo-SecureString -String $pfxPass -AsPlainText -Force

try {
    Import-PfxCertificate -FilePath $pfxPath -CertStoreLocation Cert:\LocalMachine\My -Password $securePass | Out-Null
    Write-Host "Certificate imported successfully." -ForegroundColor Green
} catch {
    Write-Host "Failed to import certificate." -ForegroundColor Red
    exit
}

# ------------------------------------------------------------
# 5. Ask if user wants IIS binding
# ------------------------------------------------------------

$bind = Read-Host "`nDo you want to bind this certificate to IIS on port 443? (o/n)"

if ($bind -eq "o") {

    try {
        Import-Module WebAdministration -ErrorAction Stop
    } catch {
        Write-Host "IIS WebAdministration module not found. Cannot bind certificate." -ForegroundColor Red
        exit
    }

    $cert = Get-ChildItem Cert:\LocalMachine\My | Sort-Object NotAfter -Descending | Select-Object -First 1

    Write-Host "Binding certificate to IIS..." -ForegroundColor Yellow

    if (-not (Get-WebBinding -Protocol https -ErrorAction SilentlyContinue)) {
        New-WebBinding -Name "Default Web Site" -Protocol https -Port 443 -IPAddress "*" -HostHeader ""
    }

    $hash = $cert.GetCertHash()
    $bindingPath = "IIS:\SslBindings\0.0.0.0!443"

    if (-not (Test-Path $bindingPath)) {
        New-Item $bindingPath -Value $hash -Force | Out-Null
    } else {
        Set-ItemProperty $bindingPath -Name sslcert -Value $hash
    }

    Write-Host "IIS binding updated." -ForegroundColor Green
}

# ------------------------------------------------------------
# 6. Final status
# ------------------------------------------------------------

Write-Host "`n=== Installation Summary ===" -ForegroundColor Cyan
Write-Host "PFX file: $pfxPath"
Write-Host "Certificate installed in: Cert:\LocalMachine\My"
Write-Host "OpenSSL version: $opensslVersion"

if ($bind -eq "o") {
    Write-Host "IIS binding: Enabled on port 443"
} else {
    Write-Host "IIS binding: Skipped"
}

Write-Host "`nInstallation completed succ