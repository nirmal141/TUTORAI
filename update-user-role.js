// update-user-role.js
// Run this script in your browser console while logged in to update your role

async function updateUserRole() {
  // Get current user ID
  const { data: { session } } = await window.supabase.auth.getSession();
  
  if (!session) {
    console.error('No active session found. Please login first.');
    return;
  }
  
  const userId = session.user.id;
  console.log('Current user ID:', userId);
  
  // Display current profile
  const { data: currentProfile, error: profileError } = await window.supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return;
  }
  
  console.log('Current profile:', currentProfile);
  
  // Update role to institution_admin
  const { data: updatedProfile, error: updateError } = await window.supabase
    .from('profiles')
    .update({ role: 'institution_admin' })
    .eq('id', userId)
    .select();
    
  if (updateError) {
    console.error('Error updating profile:', updateError);
    return;
  }
  
  console.log('Profile updated successfully:', updatedProfile);
  console.log('Please refresh the page to see the changes.');
}

// Run the function
updateUserRole().catch(console.error); 