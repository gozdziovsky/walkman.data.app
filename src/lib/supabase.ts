import { createClient } from '@supabase/supabase-js';

// Wklej tutaj swoje dane z zakładki Settings -> API w Supabase
const supabaseUrl = 'https://fhdswrktfskajmnewlyj.supabase.co';
const supabaseKey = 'sb_publishable_X7CP3izXMzuuhIT32AT53Q_dbRovN_d';

export const supabase = createClient(supabaseUrl, supabaseKey);