/**
 * Script de configuration SMTP pour production
 * Usage: node scripts/setup-production-email.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '..', '.env');

// Providers SMTP prédéfinis
const providers = {
  '1': {
    name: 'SendGrid',
    config: {
      SMTP_HOST: 'smtp.sendgrid.net',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false'
    }
  },
  '2': {
    name: 'Gmail',
    config: {
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false'
    }
  },
  '3': {
    name: 'AWS SES',
    config: {
      SMTP_HOST: 'email-smtp.us-east-1.amazonaws.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false'
    }
  },
  '4': {
    name: 'Mailjet',
    config: {
      SMTP_HOST: 'in-v3.mailjet.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false'
    }
  },
  '5': {
    name: 'Custom',
    config: {}
  }
};

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function updateEnvFile(config) {
  let envContent = '';
  
  try {
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
  } catch (error) {
    console.log('📝 Creating new .env file...');
  }

  // Sauvegarder l'ancien fichier
  if (envContent) {
    const backupPath = `${envPath}.backup.${Date.now()}`;
    fs.writeFileSync(backupPath, envContent);
    console.log(`✅ Backup created: ${backupPath}`);
  }

  // Ajouter/mettre à jour les variables SMTP
  Object.entries(config).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${value}`;
    
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, newLine);
    } else {
      envContent += `\n${newLine}`;
    }
  });

  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log(`✅ Configuration saved to ${envPath}`);
}

async function testConfiguration(config) {
  console.log('\n🧪 Testing SMTP configuration...');
  
  try {
    // Importer le service mail pour tester
    process.env.NODE_ENV = 'production';
    Object.entries(config).forEach(([key, value]) => {
      process.env[key] = value;
    });

    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: config.SMTP_HOST,
      port: parseInt(config.SMTP_PORT),
      secure: config.SMTP_SECURE === 'true',
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS
      }
    });

    await transporter.verify();
    console.log('✅ SMTP configuration is valid!');
    
    const testEmail = await question('Send test email? (y/n): ');
    if (testEmail.toLowerCase() === 'y') {
      const testTo = await question('Test email address: ');
      
      const info = await transporter.sendMail({
        from: `"${config.SMTP_FROM_NAME}" <${config.SMTP_FROM_EMAIL}>`,
        to: testTo,
        subject: '🧪 Test Email - Exersio SMTP Configuration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00d4aa;">🧪 Test Email</h2>
            <p>Votre configuration SMTP fonctionne correctement !</p>
            <p><strong>Provider:</strong> ${providers[selectedProvider]?.name || 'Custom'}</p>
            <p><strong>Host:</strong> ${config.SMTP_HOST}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Email généré par le script de configuration Exersio
            </p>
          </div>
        `
      });
      
      console.log(`✅ Test email sent! Message ID: ${info.messageId}`);
    }
    
  } catch (error) {
    console.error('❌ SMTP configuration failed:', error.message);
    return false;
  }
  
  return true;
}

async function main() {
  console.log('🚀 Configuration SMTP pour Production\n');

  // Sélection du provider
  console.log('Providers SMTP disponibles:');
  Object.entries(providers).forEach(([key, provider]) => {
    console.log(`${key}. ${provider.name}`);
  });

  const selectedProvider = await question('\nChoisissez un provider (1-5): ');
  
  if (!providers[selectedProvider]) {
    console.log('❌ Provider invalide');
    process.exit(1);
  }

  const provider = providers[selectedProvider];
  console.log(`\n📝 Configuration ${provider.name}...\n`);

  const config = { ...provider.config };

  // Configuration spécifique selon le provider
  if (selectedProvider === '5') {
    // Custom configuration
    config.SMTP_HOST = await question('SMTP Host: ');
    config.SMTP_PORT = await question('SMTP Port (587): ') || '587';
    config.SMTP_SECURE = await question('SMTP Secure (false): ') || 'false';
  }

  // Credentials communes
  config.SMTP_USER = await question('SMTP User/Username: ');
  config.SMTP_PASS = await question('SMTP Password/API Key: ');
  config.SMTP_FROM_NAME = await question('From Name (Exersio): ') || 'Exersio';
  config.SMTP_FROM_EMAIL = await question('From Email: ');

  console.log('\n📋 Configuration Summary:');
  console.log(`Provider: ${provider.name}`);
  console.log(`Host: ${config.SMTP_HOST}`);
  console.log(`Port: ${config.SMTP_PORT}`);
  console.log(`User: ${config.SMTP_USER}`);
  console.log(`From: "${config.SMTP_FROM_NAME}" <${config.SMTP_FROM_EMAIL}>`);

  const confirm = await question('\nSave configuration? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Configuration cancelled');
    process.exit(0);
  }

  // Sauvegarder la configuration
  updateEnvFile(config);

  // Tester la configuration
  const testNow = await question('Test configuration now? (y/n): ');
  if (testNow.toLowerCase() === 'y') {
    const success = await testConfiguration(config);
    if (success) {
      console.log('\n🎉 Configuration completed successfully!');
      console.log('\n📚 Next steps:');
      console.log('1. Restart your application');
      console.log('2. Check logs: tail -f logs/email-$(date +%Y-%m-%d).log');
      console.log('3. Monitor email delivery');
      console.log('4. Configure DNS records (SPF/DKIM)');
    }
  } else {
    console.log('\n✅ Configuration saved!');
    console.log('Run tests with: node scripts/test-email.js');
  }

  rl.close();
}

// Gestionnaire d'erreur
process.on('uncaughtException', (error) => {
  console.error('❌ Error:', error.message);
  rl.close();
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n👋 Configuration interrupted');
  rl.close();
  process.exit(0);
});

if (require.main === module) {
  main();
}