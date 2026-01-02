# Generate Self-Signed SSL Certificate for Development
# Works on Windows with PowerShell 5.1+

Write-Host "Generating self-signed SSL certificate..." -ForegroundColor Cyan

$certPath = ".\certs"
$certFile = "$certPath\server.crt"
$keyFile = "$certPath\server.key"

# Create certs directory
if (-not (Test-Path $certPath)) {
    New-Item -ItemType Directory -Force -Path $certPath | Out-Null
    Write-Host "Created certs directory" -ForegroundColor Gray
}

# Generate certificate using OpenSSL (if available) or PowerShell
try {
    # Try OpenSSL first (more compatible)
    $opensslPath = Get-Command openssl -ErrorAction SilentlyContinue
    
    if ($opensslPath) {
        Write-Host "Using OpenSSL..." -ForegroundColor Yellow
        
        & openssl req -x509 -newkey rsa:2048 -nodes `
            -keyout $keyFile `
            -out $certFile `
            -days 730 `
            -subj "/C=US/ST=Development/L=Local/O=ArkAlliance/CN=localhost" 2>&1
            
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Certificate generated with OpenSSL!" -ForegroundColor Green
        }
        else {
            throw "OpenSSL command failed"
        }
    }
    else {
        # Fallback to PowerShell method (Windows only)
        Write-Host "OpenSSL not found, using PowerShell New-SelfSignedCertificate..." -ForegroundColor Yellow
        
        # Create self-signed certificate
        $cert = New-SelfSignedCertificate `
            -Subject "CN=localhost" `
            -DnsName "localhost", "127.0.0.1" `
            -KeyAlgorithm RSA `
            -KeyLength 2048 `
            -NotBefore (Get-Date) `
            -NotAfter (Get-Date).AddYears(2) `
            -CertStoreLocation "Cert:\CurrentUser\My" `
            -FriendlyName "TrendsCalculator Dev Certificate" `
            -HashAlgorithm SHA256 `
            -KeyUsage DigitalSignature, KeyEncipherment, DataEncipherment `
            -KeyExportPolicy Exportable `
            -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1")
        
        if ($null -eq $cert) {
            throw "Failed to create certificate"
        }
        
        Write-Host "Certificate created with thumbprint: $($cert.Thumbprint)" -ForegroundColor Gray
        
        # Get the certificate from the store
        $certObj = Get-ChildItem "Cert:\CurrentUser\My\$($cert.Thumbprint)"
        
        if ($null -eq $certObj) {
            throw "Failed to retrieve certificate from store"
        }
        
        # Export certificate to PEM format
        $certBytes = $certObj.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
        $certBase64 = [Convert]::ToBase64String($certBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
        $certPem = "-----BEGIN CERTIFICATE-----`r`n$certBase64`r`n-----END CERTIFICATE-----`r`n"
        [System.IO.File]::WriteAllText((Resolve-Path $certPath | Join-Path -ChildPath "server.crt"), $certPem)
        
        Write-Host "Certificate exported to $certFile" -ForegroundColor Gray
        
        # Export private key to PEM format
        # Use PKCS12 export with password, then convert
        $pfxPath = "$certPath\temp.pfx"
        $password = ConvertTo-SecureString -String "temppass" -Force -AsPlainText
        
        Export-PfxCertificate -Cert $certObj -FilePath $pfxPath -Password $password | Out-Null
        
        # Check if we can use certutil to extract the key
        $certutilPath = Get-Command certutil -ErrorAction SilentlyContinue
        
        if ($certutilPath) {
            # Create a temporary directory for extraction
            $tempDir = "$certPath\temp_extract"
            if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
            New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
            
            # Try using certutil
            Push-Location $tempDir
            try {
                & certutil -p "temppass" -exportPEM "$pfxPath" 2>&1 | Out-Null
                
                # Look for the private key file
                $pemFiles = Get-ChildItem -Filter "*.pem" -ErrorAction SilentlyContinue
                if ($pemFiles) {
                    $keyContent = Get-Content ($pemFiles | Where-Object { $_.Name -like "*key*" } | Select-Object -First 1).FullName -Raw
                    if ($null -eq $keyContent) {
                        # Try the first PEM file
                        $keyContent = Get-Content $pemFiles[0].FullName -Raw
                    }
                    [System.IO.File]::WriteAllText((Resolve-Path "..\server.key"), $keyContent)
                }
            }
            finally {
                Pop-Location
                Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
        
        # If key wasn't exported, create a placeholder warning
        if (-not (Test-Path $keyFile) -or (Get-Item $keyFile).Length -eq 0) {
            # Last resort: export using .NET if available
            try {
                $rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($certObj)
                if ($null -ne $rsa) {
                    # Try to export PKCS8
                    $keyBytes = $rsa.ExportPkcs8PrivateKey()
                    $keyBase64 = [Convert]::ToBase64String($keyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
                    $keyPem = "-----BEGIN PRIVATE KEY-----`r`n$keyBase64`r`n-----END PRIVATE KEY-----`r`n"
                    [System.IO.File]::WriteAllText((Resolve-Path $certPath | Join-Path -ChildPath "server.key"), $keyPem)
                    Write-Host "Private key exported using .NET" -ForegroundColor Gray
                }
            }
            catch {
                Write-Host "Warning: Could not export private key with .NET: $_" -ForegroundColor Yellow
                
                # Create a message file instead
                "Private key export requires OpenSSL or .NET 5+. To use HTTPS:" | Out-File $keyFile
                "1. Install OpenSSL: winget install OpenSSL.Light" | Add-Content $keyFile
                "2. Re-run: npm run generate-cert" | Add-Content $keyFile
                
                Write-Host "[WARNING] Private key export failed. Install OpenSSL for full HTTPS support." -ForegroundColor Yellow
            }
        }
        
        # Cleanup PFX
        Remove-Item $pfxPath -Force -ErrorAction SilentlyContinue
        
        # Remove certificate from store
        Remove-Item "Cert:\CurrentUser\My\$($cert.Thumbprint)" -Force -ErrorAction SilentlyContinue
        
        Write-Host "[OK] Certificate generated with PowerShell!" -ForegroundColor Green
    }

    # Verify files were created
    if ((Test-Path $certFile) -and (Test-Path $keyFile)) {
        $certSize = (Get-Item $certFile).Length
        $keySize = (Get-Item $keyFile).Length
        
        if ($certSize -gt 100 -and $keySize -gt 100) {
            Write-Host ""
            Write-Host "Certificate files:" -ForegroundColor Cyan
            Write-Host "  - CRT: $certFile ($certSize bytes)" -ForegroundColor White
            Write-Host "  - KEY: $keyFile ($keySize bytes)" -ForegroundColor White
            Write-Host ""
            Write-Host "IMPORTANT: Self-signed certificate for DEVELOPMENT ONLY" -ForegroundColor Yellow
            Write-Host "Browsers will show security warnings!" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "HTTPS Server: https://localhost:3075" -ForegroundColor Green
            exit 0
        }
    }
    
    throw "Certificate files were not created properly"
}
catch {
    Write-Host "[ERROR] Certificate generation failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Install OpenSSL" -ForegroundColor Yellow
    Write-Host "  winget install OpenSSL.Light" -ForegroundColor White
    Write-Host "  npm run generate-cert" -ForegroundColor White
    exit 1
}
