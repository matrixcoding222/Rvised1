
// Rollback to in-memory storage (if needed)
const fs = require('fs');
const path = require('path');

const files = [
  {
    "original": "rvised/src/app/api/projects/route.ts",
    "supabase": "rvised/src/app/api/projects/route-supabase.ts",
    "backup": "rvised/src/app/api/projects/route-backup.ts"
  },
  {
    "original": "rvised/src/app/api/usage/route.ts",
    "supabase": "rvised/src/app/api/usage/route-supabase.ts",
    "backup": "rvised/src/app/api/usage/route-backup.ts"
  },
  {
    "original": "rvised/src/app/api/webhooks/stripe/route.ts",
    "supabase": "rvised/src/app/api/webhooks/stripe/route-supabase.ts",
    "backup": "rvised/src/app/api/webhooks/stripe/route-backup.ts"
  }
];

files.forEach(file => {
  const originalPath = path.join(__dirname, file.original);
  const backupPath = path.join(__dirname, file.backup);
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, originalPath);
    console.log('Rolled back:', file.original);
  }
});

console.log('\n✅ Rolled back to in-memory storage');
