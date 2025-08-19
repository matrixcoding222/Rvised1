// Test Supabase connection and functionality
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pouzqjduusuolceqaxjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdXpxamR1dXN1b2xjZXFheGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQyMTI2NiwiZXhwIjoyMDcwOTk3MjY2fQ.7O34obbHModpviFiAMHB6t6bbaD4OWwJs9YguKebtlw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🧪 Testing Supabase connection...\n');

  try {
    // Test 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const testEmail = `test-${Date.now()}@rvised.app`;
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        full_name: 'Test User',
        tier: 'free'
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Failed to create user:', userError.message);
      return;
    }
    
    console.log('✅ User created:', user.id);

    // Test 2: Create a project
    console.log('\n2️⃣ Creating test project...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: 'Test Project',
        description: 'Testing Supabase integration',
        emoji: '🧪'
      })
      .select()
      .single();

    if (projectError) {
      console.error('❌ Failed to create project:', projectError.message);
      return;
    }
    
    console.log('✅ Project created:', project.id);

    // Test 3: Track usage
    console.log('\n3️⃣ Testing usage tracking...');
    const today = new Date().toISOString().split('T')[0];
    
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        date: today,
        summaries_count: 1
      })
      .select()
      .single();

    if (usageError) {
      console.error('❌ Failed to track usage:', usageError.message);
      return;
    }
    
    console.log('✅ Usage tracked:', usage.summaries_count, 'summaries today');

    // Test 4: Save a summary
    console.log('\n4️⃣ Saving test summary...');
    const { data: summary, error: summaryError } = await supabase
      .from('summaries')
      .insert({
        user_id: user.id,
        project_id: project.id,
        video_url: 'https://youtube.com/watch?v=test',
        video_title: 'Test Video',
        channel_name: 'Test Channel',
        video_length: 600,
        summary_data: {
          mainTakeaway: 'Test summary',
          keyInsights: ['Insight 1', 'Insight 2'],
          quiz: []
        },
        learning_mode: 'student',
        summary_depth: 'standard'
      })
      .select()
      .single();

    if (summaryError) {
      console.error('❌ Failed to save summary:', summaryError.message);
      return;
    }
    
    console.log('✅ Summary saved:', summary.id);

    // Test 5: Query data
    console.log('\n5️⃣ Querying data...');
    const { data: projects, error: queryError } = await supabase
      .from('projects')
      .select('*, summaries(count)')
      .eq('user_id', user.id);

    if (queryError) {
      console.error('❌ Failed to query projects:', queryError.message);
      return;
    }
    
    console.log('✅ Found', projects.length, 'project(s)');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('summaries').delete().eq('user_id', user.id);
    await supabase.from('projects').delete().eq('user_id', user.id);
    await supabase.from('usage_tracking').delete().eq('user_id', user.id);
    await supabase.from('users').delete().eq('id', user.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Supabase is working correctly!');
    console.log('\n📊 Check your Supabase dashboard to see the tables:');
    console.log('https://supabase.com/dashboard/project/pouzqjduusuolceqaxjo/editor');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();