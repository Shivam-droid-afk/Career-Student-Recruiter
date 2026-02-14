import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://nkeeejorkwtsdfhkddbp.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijk4ZTkwNjA5LThiMGQtNDdiYS04MmY3LTRhYzljYTc0MDAzOSJ9.eyJwcm9qZWN0SWQiOiJua2VlZWpvcmt3dHNkZmhrZGRicCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY5NjMxMDYwLCJleHAiOjIwODQ5OTEwNjAsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.zssuKfJoco0iAE3Ul4QEA0aGnZmEyhlj0jmtnteh5ig';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };