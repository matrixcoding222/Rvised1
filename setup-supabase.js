const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Supabase Setup for Rvised\n');
console.log('This script will help you configure Supabase for your project.\n');
console.log('You need to get these values from your Supabase dashboard:');
console.log('1. Go to https://supabase.com and create a project');
console.log('2. Go to Settings → API\n');

const questions = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    prompt: 'Enter your Supabase Project URL (https://xxx.supabase.co): ',
    validate: (value) => value.startsWith('https://') && value.includes('supabase.co')
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    prompt: 'Enter your Supabase anon/public key (eyJ...): ',
    validate: (value) => value.startsWith('eyJ')
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    prompt: 'Enter your Supabase service_role key (eyJ...): ',
    validate: (value) => value.startsWith('eyJ')
  }
];

let config = {};
let currentQuestion = 0;

function askQuestion() {
  if (currentQuestion >= questions.length) {
    saveConfig();
    return;
  }

  const q = questions[currentQuestion];
  rl.question(q.prompt, (answer) => {
    if (q.validate && !q.validate(answer)) {
      console.log('❌ Invalid format. Please try again.\n');
      askQuestion();
      return;
    }
    
    config[q.name] = answer;
    currentQuestion++;
    askQuestion();
  });
}

function saveConfig() {
  // Read existing .env.local
  const envPath = path.join(__dirname, 'rvised', '.env.local');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('Creating new .env.local file...');
  }
  
  // Add or update Supabase configuration
  const supabaseConfig = `
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${config.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${config.SUPABASE_SERVICE_ROLE_KEY}
`;

  // Remove old Supabase config if exists
  envContent = envContent.replace(/# Supabase Configuration[\s\S]*?(?=\n#|$)/g, '');
  
  // Add new config
  envContent += supabaseConfig;
  
  // Write back to file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Supabase configuration saved to .env.local\n');
  console.log('Next steps:');
  console.log('1. Go to your Supabase dashboard SQL Editor');
  console.log('2. Copy the contents of supabase-schema.sql');
  console.log('3. Run the SQL to create all tables');
  console.log('4. Your app will now use Supabase for persistence!\n');
  
  // Create a helper file to switch to Supabase routes
  const switchScript = `
// Run this to switch from in-memory to Supabase storage
const fs = require('fs');
const path = require('path');

// Backup original files
const files = [
  'rvised/src/app/api/projects/route.ts',
  'rvised/src/app/api/usage/route.ts',
  'rvised/src/app/api/webhooks/stripe/route.ts'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const backupPath = fullPath.replace('.ts', '-backup.ts');
  const supabasePath = fullPath.replace('.ts', '-supabase.ts');
  
  // Backup original
  if (fs.existsSync(fullPath) && !fs.existsSync(backupPath)) {
    fs.copyFileSync(fullPath, backupPath);
    console.log('Backed up:', file);
  }
  
  // Switch to Supabase version
  if (fs.existsSync(supabasePath)) {
    fs.copyFileSync(supabasePath, fullPath);
    console.log('Switched to Supabase:', file);
  }
});

console.log('\\n✅ Switched to Supabase storage!');
console.log('Restart your Next.js server to apply changes.');
`;

  fs.writeFileSync('switch-to-supabase.js', switchScript);
  console.log('Run "node switch-to-supabase.js" to activate Supabase storage.');
  
  rl.close();
}

// Start the questionnaire
askQuestion();