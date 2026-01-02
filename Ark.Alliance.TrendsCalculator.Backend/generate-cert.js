/**
 * SSL Certificate Generator (Node.js)
 * 
 * Generates self-signed certificates for development.
 * Uses the selfsigned npm package for proper X.509 certificates.
 * 
 * Usage: node generate-cert.js
 *    or: npm run generate-cert-node
 */

const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, 'certs');
const keyPath = path.join(certDir, 'server.key');
const certPath = path.join(certDir, 'server.crt');

console.log('🔐 Generating self-signed SSL certificate...');

// Create certs directory
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
    console.log('   Created certs directory');
}

// Generate certificate with common attributes
const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'organizationName', value: 'Ark Alliance' },
    { name: 'countryName', value: 'US' }
];

const opts = {
    keySize: 2048,
    days: 730, // 2 years
    algorithm: 'sha256',
    extensions: [
        {
            name: 'basicConstraints',
            cA: false
        },
        {
            name: 'keyUsage',
            keyCertSign: false,
            digitalSignature: true,
            nonRepudiation: false,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: 'extKeyUsage',
            serverAuth: true,
            clientAuth: true
        },
        {
            name: 'subjectAltName',
            altNames: [
                { type: 2, value: 'localhost' },
                { type: 7, ip: '127.0.0.1' },
                { type: 7, ip: '::1' }
            ]
        }
    ]
};

console.log('   Generating RSA key pair (2048-bit)...');

// Use async/await since selfsigned.generate is async
(async () => {
    try {
        const pems = await selfsigned.generate(attrs, opts);

        // Save private key
        fs.writeFileSync(keyPath, pems.private);
        console.log('   ✅ Private key saved');

        // Save certificate
        fs.writeFileSync(certPath, pems.cert);
        console.log('   ✅ Certificate saved');

        // Verify files
        const keySize = fs.statSync(keyPath).size;
        const certSize = fs.statSync(certPath).size;

        console.log('');
        console.log('✅ SSL Certificate generated successfully!');
        console.log('');
        console.log('Certificate files:');
        console.log(`   🔑 Key:  ${keyPath} (${keySize} bytes)`);
        console.log(`   📜 Cert: ${certPath} (${certSize} bytes)`);
        console.log('');
        console.log('Certificate details:');
        console.log('   Subject:    CN=localhost, O=Ark Alliance, C=US');
        console.log('   Valid for:  2 years');
        console.log('   Key size:   2048 bits');
        console.log('   Algorithm:  SHA-256');
        console.log('   Alt names:  localhost, 127.0.0.1, ::1');
        console.log('');
        console.log('⚠️  Self-signed certificate for DEVELOPMENT ONLY');
        console.log('   Browsers will show security warnings!');
        console.log('');
        console.log('🚀 HTTPS Server will run at: https://localhost:3075');

        process.exit(0);

    } catch (error) {
        console.error('❌ Failed to generate certificate:', error.message);
        console.log('');
        console.log('Troubleshooting:');
        console.log('   npm install selfsigned --save-dev');
        console.log('   npm run generate-cert-node');
        process.exit(1);
    }
})();
