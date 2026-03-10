// Fix #1: supabase was never initialized in dashboard.js
const { createClient } = supabase;
const supabaseClient = createClient(
    'https://dowtaqgkcbppyjxknaqx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvd3RhcWdrY2JwcHlqeGtuYXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODcyMTMsImV4cCI6MjA4ODU2MzIxM30.1dlwW0ZoQEEKjweXpGUcVKyd_Rlap-gC2CcwkZXwEgk'
);

async function loadDashboard() {
    const current = JSON.parse(localStorage.getItem('latestAnalysis'));

    // Fix #6: range(0,1) was fetching 2 rows incorrectly for "previous"
    // Now fetching 2 rows and using index [1] for the previous entry
    const { data: previous } = await supabaseClient
        .from('journal_entries')
        .select('mistake_count')
        .order('created_at', { ascending: false })
        .range(0, 1);

    const ctx = document.getElementById('mistakeChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Previous', 'Current'],
            datasets: [{
                label: 'Mistakes',
                data: [previous[1]?.mistake_count || 0, current.mistakeCount],
                backgroundColor: ['#ccc', '#d9c5b2']
            }]
        }
    });

    // Display suggestions
    const vocabDiv = document.getElementById('vocab-suggestions');
    vocabDiv.innerHTML = `<h3>Suggestions:</h3><p>${current.vocabularySuggestions.join(', ')}</p>`;
}
loadDashboard();