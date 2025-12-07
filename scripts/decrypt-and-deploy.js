#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const readline = require('readline');

const KEYSTORE_PATH = path.join(process.env.HOME, '.foundry', 'keystores', 'my-account');

async function askPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter keystore password: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║      🛡️  FlareShield Keystore Decryption & Deployment 🛡️     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log();

  // Check if keystore exists
  if (!fs.existsSync(KEYSTORE_PATH)) {
    console.error('❌ Keystore not found at:', KEYSTORE_PATH);
    process.exit(1);
  }

  try {
    // Read keystore file
    const keystoreJson = fs.readFileSync(KEYSTORE_PATH, 'utf8');
    console.log('✅ Keystore file loaded');
    console.log();

    // Get password from command line arg or ask interactively
    let password = process.argv[2];

    if (!password) {
      password = await askPassword();
    }

    console.log('🔓 Decrypting keystore...');

    // Decrypt using ethers.js
    const wallet = await ethers.Wallet.fromEncryptedJson(keystoreJson, password);

    console.log('✅ Keystore decrypted successfully!');
    console.log('👤 Address:', wallet.address);
    console.log();

    // Check balance on Coston2
    console.log('💰 Checking balance on Coston2...');
    const provider = new ethers.JsonRpcProvider('https://coston2-api.flare.network/ext/C/rpc');
    const balance = await provider.getBalance(wallet.address);
    const balanceInEther = ethers.formatEther(balance);
    console.log('Balance:', balanceInEther, 'C2FLR');
    console.log();

    if (balance === 0n) {
      console.log('⚠️  WARNING: Your balance is 0!');
      console.log('Get testnet tokens from: https://faucet.flare.network/');
      console.log();
    }

    // Export private key to env and run deployment
    console.log('🚀 Starting deployment...');
    console.log();

    const { spawn } = require('child_process');

    const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'coston2'], {
      env: { ...process.env, PRIVATE_KEY: wallet.privateKey },
      stdio: 'inherit'
    });

    deployProcess.on('close', (code) => {
      if (code === 0) {
        console.log();
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║            ✅ Deployment Successful! ✅                       ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log();

        // Read and display deployment info
        try {
          const deploymentPath = path.join(__dirname, '..', 'deployments', 'coston2.json');
          if (fs.existsSync(deploymentPath)) {
            const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
            console.log('📋 Deployed Contracts:');
            console.log('   FlareShield:', deployment.contracts.FlareShield);
            console.log();
            console.log('🔍 View on Explorer:');
            console.log('   https://coston2-explorer.flare.network/address/' + deployment.contracts.FlareShield);
            console.log();
          }
        } catch (e) {
          console.log('📁 Deployment info saved to deployments/coston2.json');
        }

        console.log('✅ Frontend config updated at: frontend/src/config/contracts.json');
        console.log('🌐 Frontend running at: http://localhost:3000');
      } else {
        console.error('❌ Deployment failed with code:', code);
        process.exit(code);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
