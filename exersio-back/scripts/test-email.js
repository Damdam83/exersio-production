/**
 * Script de test email production
 * Usage: node scripts/test-email.js [email@example.com]
 */

const { createTransporter } = require('../dist/modules/mail/mail.service');
const path = require('path');

// Charger variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testEmail(recipient) {
  console.log('🧪 Testing Production Email Configuration\n');
  
  // Vérifier configuration
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_EMAIL'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('\nRun: node scripts/setup-production-email.js');
    process.exit(1);
  }
  
  console.log('📋 Current Configuration:');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   From: "${process.env.SMTP_FROM_NAME || 'Exersio'}" <${process.env.SMTP_FROM_EMAIL}>`);
  console.log(`   To: ${recipient}`);
  
  try {
    console.log('\n🔧 Creating transporter...');
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    console.log('✅ Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    console.log('\n📧 Sending test emails...\n');
    
    // Test 1: Email de bienvenue
    console.log('1. Testing welcome email...');
    const welcomeResult = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Exersio'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: recipient,
      subject: '🎯 Test - Email de bienvenue Exersio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00d4aa; margin: 0;">🎯 Bienvenue sur Exersio</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #00d4aa, #00b894); padding: 20px; border-radius: 12px; color: white; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0;">Test Email de Bienvenue</h2>
            <p style="margin: 0; opacity: 0.9;">Configuration SMTP production testée avec succès</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin: 0 0 10px 0;">📊 Détails du test</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Provider:</strong> ${process.env.SMTP_HOST}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> Email de bienvenue</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://exersio.com" style="background: #00d4aa; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Découvrir Exersio</a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Email de test généré automatiquement<br>
              © 2024 Exersio - Plateforme d'entraînement sportif
            </p>
          </div>
        </div>
      `
    });
    console.log(`   ✅ Sent! Message ID: ${welcomeResult.messageId}`);
    
    // Test 2: Email de récupération de mot de passe  
    console.log('\n2. Testing password reset email...');
    const resetResult = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Exersio'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: recipient,
      subject: '🔐 Test - Réinitialisation mot de passe Exersio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00d4aa; margin: 0;">🔐 Réinitialisation de mot de passe</h1>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="color: #856404; margin: 0 0 10px 0;">Test de réinitialisation</h2>
            <p style="color: #856404; margin: 0;">Ceci est un email de test pour la fonctionnalité de réinitialisation de mot de passe.</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #333;">Une demande de réinitialisation de mot de passe a été effectuée pour ce compte de test.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#test-link" style="background: #dc3545; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Réinitialiser (Test)</a>
          </div>
          
          <div style="background: #e9ecef; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; color: #6c757d; font-size: 12px;">
              <strong>Sécurité:</strong> Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Email de test - Configuration SMTP production<br>
              © 2024 Exersio - Plateforme d'entraînement sportif
            </p>
          </div>
        </div>
      `
    });
    console.log(`   ✅ Sent! Message ID: ${resetResult.messageId}`);
    
    console.log('\n🎉 All test emails sent successfully!');
    console.log('\n📊 Results Summary:');
    console.log(`   ✅ Welcome email: ${welcomeResult.messageId}`);
    console.log(`   ✅ Password reset: ${resetResult.messageId}`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. Check the recipient mailbox');
    console.log('2. Verify emails are not in spam folder');  
    console.log('3. Test reply-to functionality');
    console.log('4. Monitor delivery rates');
    console.log('5. Configure DNS records (SPF/DKIM) if needed');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔧 Authentication Error Solutions:');
      console.error('   - Check SMTP_USER and SMTP_PASS');
      console.error('   - For Gmail: use App Password, not regular password');
      console.error('   - For SendGrid: use "apikey" as username');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🔧 Connection Error Solutions:');
      console.error('   - Check SMTP_HOST spelling');
      console.error('   - Verify network connectivity');
      console.error('   - Check firewall settings');
    }
    
    process.exit(1);
  }
}

// Usage
const recipient = process.argv[2];

if (!recipient) {
  console.error('Usage: node scripts/test-email.js <recipient@example.com>');
  process.exit(1);
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
  console.error('❌ Invalid email address format');
  process.exit(1);
}

testEmail(recipient);