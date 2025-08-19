// Switch from in-memory to Supabase storage
const fs = require('fs');
const path = require('path');

console.log('🔄 Switching to Supabase storage...\n');

// Files to switch
const files = [
  {
    original: 'rvised/src/app/api/projects/route.ts',
    supabase: 'rvised/src/app/api/projects/route-supabase.ts',
    backup: 'rvised/src/app/api/projects/route-backup.ts'
  },
  {
    original: 'rvised/src/app/api/usage/route.ts',
    supabase: 'rvised/src/app/api/usage/route-supabase.ts',
    backup: 'rvised/src/app/api/usage/route-backup.ts'
  },
  {
    original: 'rvised/src/app/api/webhooks/stripe/route.ts',
    supabase: 'rvised/src/app/api/webhooks/stripe/route-supabase.ts',
    backup: 'rvised/src/app/api/webhooks/stripe/route-backup.ts'
  }
];

let success = true;

files.forEach(file => {
  const originalPath = path.join(__dirname, file.original);
  const supabasePath = path.join(__dirname, file.supabase);
  const backupPath = path.join(__dirname, file.backup);
  
  try {
    // Backup original file if not already backed up
    if (fs.existsSync(originalPath) && !fs.existsSync(backupPath)) {
      fs.copyFileSync(originalPath, backupPath);
      console.log(`✅ Backed up: ${file.original}`);
    }
    
    // Switch to Supabase version
    if (fs.existsSync(supabasePath)) {
      fs.copyFileSync(supabasePath, originalPath);
      console.log(`✅ Switched to Supabase: ${file.original}`);
    } else {
      console.log(`⚠️ Supabase version not found: ${file.supabase}`);
      success = false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file.original}:`, error.message);
    success = false;
  }
});

if (success) {
  console.log('\n🎉 Successfully switched to Supabase storage!');
  console.log('\n📋 Next steps:');
  console.log('1. Restart your Next.js server (Ctrl+C, then npm run dev)');
  console.log('2. Test by creating a project in the extension');
  console.log('3. Check your Supabase dashboard to see the data');
  console.log('\n✨ Your app now has persistent storage!');
} else {
  console.log('\n⚠️ Some files could not be switched. Please check the errors above.');
}

// Create a rollback script
const rollbackScript = `
// Rollback to in-memory storage (if needed)
const fs = require('fs');
const path = require('path');

const files = ${JSON.stringify(files, null, 2)};

files.forEach(file => {
  const originalPath = path.join(__dirname, file.original);
  const backupPath = path.join(__dirname, file.backup);
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, originalPath);
    console.log('Rolled back:', file.original);
  }
});

console.log('\\n✅ Rolled back to in-memory storage');
`;

fs.writeFileSync('rollback-from-supabase.js', rollbackScript);
console.log('\nℹ️ Created rollback-from-supabase.js (in case you need to revert)');