# HTTPS Certificate Configuration

This directory contains SSL/TLS certificates for HTTPS support in development.

## Quick Start

```bash
# Generate self-signed certificates
npm run generate-cert

# Certificates will be created:
# - server.crt (certificate)
# - server.key (private key)
```

## What's Included

- `server.crt` - SSL certificate (public key)
- `server.key` - Private key

## Security Note

⚠️ **DEVELOPMENT ONLY**

These are self-signed certificates for **development purposes only**.

- Browsers will show security warnings
- Do NOT use in production
- For production, use certificates from a trusted CA (Let's Encrypt, etc.)

## Browser Warnings

When accessing `https://localhost:3075`, you'll see warnings like:

- **Chrome**: "Your connection is not private" 
  - Click "Advanced" → "Proceed to localhost (unsafe)"

- **Firefox**: "Warning: Potential Security Risk Ahead"
  - Click "Advanced" → "Accept the Risk and Continue"

- **Edge**: "Your connection isn't private"
  - Click "Advanced" → "Continue to localhost (unsafe)"

This is **expected behavior** for self-signed certificates.

##  Regenerating Certificates

If you need to regenerate (expired, corrupted, etc.):

```bash
# Delete old certificates  
rm certs/*

# Generate new ones
npm run generate-cert
```

## Production Setup

For production, obtain certificates from:

1. **Let's Encrypt** (Free, automated)
   ```bash
   certbot certonly --standalone -d yourdomain.com
   ```

2. **Commercial CA** (Paid, extended validation)
   - DigiCert
   - GlobalSign
   - Sectigo

Then update `src/index.ts` to load production certificates:

```typescript
const certPath = '/etc/letsencrypt/live/yourdomain.com';
const options = {
    key: fs.readFileSync(path.join(certPath, 'privkey.pem')),
    cert: fs.readFileSync(path.join(certPath, 'fullchain.pem'))
};
```

## Certificate Details

**Generated certificates include**:
- **Common Name (CN)**: localhost
- **Validity**: 2 years
- **Key Size**: 2048-bit RSA
- **Hash Algorithm**: SHA-256

## Troubleshooting

### "Certificate not found" error

Run: `npm run generate-cert`

### "OpenSSL not found" on Windows

The script will automatically use PowerShell's `New-SelfSignedCertificate` instead.

### Server falls back to HTTP

Check that both files exist:
- `certs/server.crt`
- `certs/server.key`

### Permissiondenied

Run PowerShell as Administrator or adjust execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Git Ignore

The `.gitignore` should include:
```
certs/*.crt
certs/*.key
certs/*.pem
```

**Never commit private keys to version control!**
