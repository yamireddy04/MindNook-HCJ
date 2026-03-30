const { createClient } = supabase;
const supabaseClient = createClient(
    'https://dowtaqgkcbppyjxknaqx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvd3RhcWdrY2JwcHlqeGtuYXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODcyMTMsImV4cCI6MjA4ODU2MzIxM30.1dlwW0ZoQEEKjweXpGUcVKyd_Rlap-gC2CcwkZXwEgk'
);

const templates = [
    { id: 'floral',    name: 'Floral Petals',    icon: '🌸' },
    { id: 'ruled',     name: 'Classic Ruled',     icon: '📜' },
    { id: 'midnight',  name: 'Midnight Blue',     icon: '🌑' },
    { id: 'parchment', name: 'Old Parchment',     icon: '📜' },
    { id: 'lavender',  name: 'Lavender Mist',     icon: '🌿' },
    { id: 'minimal',   name: 'Pure Minimalist',   icon: '⚪' },
    { id: 'matcha',    name: 'Matcha Tea',         icon: '🍵' },
    { id: 'sunset',    name: 'Warm Sunset',        icon: '🌇' },
    { id: 'noir',      name: 'Noir Luxury',        icon: '🎩' },
    { id: 'ocean',     name: 'Deep Ocean',         icon: '🌊' }
];

let selectedTemplate = null;
const grid = document.getElementById('canvas-grid');
const startBtn = document.getElementById('start-writing');

templates.forEach(t => {
    const div = document.createElement('div');
    div.className = 'canvas-square';
    div.innerHTML = `<div class="canvas-square-icon">${t.icon}</div><p>${t.name}</p>`;
    div.onclick = () => {
        document.querySelectorAll('.canvas-square').forEach(el => el.classList.remove('active'));
        div.classList.add('active');
        selectedTemplate = t;
        startBtn.disabled = false;
        startBtn.classList.remove('disabled');
    };
    grid.appendChild(div);
});

const Font = Quill.import('formats/font');
Font.whitelist = [
    'times', 'times-new-roman', 'bookman', 'apple-chancery', 'big-caslon',
    'bradley-hand', 'chalkduster', 'copperplate', 'impact', 'market-felt',
    'luminari', 'noteworthy', 'palatino', 'rockhand', 'snell-roundhand', 'papyrus'
];
Quill.register(Font, true);

const Size = Quill.import('formats/size');
Size.whitelist = ['10px','11px','12px','13px','14px','15px','16px','17px','18px','19px','20px',
                  '21px','22px','23px','24px','25px','26px','27px','28px','29px','30px'];
Quill.register(Size, true);

const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'font': Font.whitelist }],
            [{ 'size': Size.whitelist }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
        ]
    }
});

const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.style.opacity = '0.4';
    saveBtn.style.cursor = 'not-allowed';
}

quill.on('text-change', () => {
    const text = quill.getText().trim();
    if (saveBtn) {
        if (text.length > 10) {
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
            saveBtn.style.cursor = 'pointer';
        } else {
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.4';
            saveBtn.style.cursor = 'not-allowed';
        }
    }
});
document.getElementById('start-writing').onclick = () => {
    document.getElementById('picker-view').style.display = 'none';
    const editorView = document.getElementById('editor-view');
    editorView.style.display = 'block';
    editorView.className = `editor-view theme-${selectedTemplate.id}`;
    document.getElementById('badge').innerText = `${selectedTemplate.icon} ${selectedTemplate.name}`;
};

document.getElementById('back-btn').onclick = () => {
    document.getElementById('editor-view').style.display = 'none';
    document.getElementById('picker-view').style.display = 'flex';
};
function closeModal() {
    document.getElementById('analysis-modal').style.display = 'none';
}
document.getElementById('save-btn').onclick = async () => {
    const saveBtn = document.getElementById('save-btn');
    saveBtn.innerText = "Analyzing...";
    saveBtn.disabled = true;

    try {
        const textContent = quill.getText();
        const htmlContent = quill.root.innerHTML;
        const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvd3RhcWdrY2JwcHlqeGtuYXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODcyMTMsImV4cCI6MjA4ODU2MzIxM30.1dlwW0ZoQEEKjweXpGUcVKyd_Rlap-gC2CcwkZXwEgk';

        const response = await fetch('https://dowtaqgkcbppyjxknaqx.supabase.co/functions/v1/analyze-journal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON_KEY}`
            },
            body: JSON.stringify({ text: textContent })
        });

        if (!response.ok) throw new Error('AI Analysis failed');

        const analysis = await response.json();
        const { error } = await supabaseClient.from('journal_entries').insert([{
            content:              htmlContent,
            sentiment:            analysis.sentiment,
            mood_lifter_content:  analysis.moodLifter,
            word_count:           analysis.wordCount,
            sentence_count:       analysis.sentenceCount,
            mistake_count:        analysis.mistakeCount,
            lexical_feedback:     analysis.vocabularySuggestions,
            unique_words:         analysis.uniqueWords,
            readability:          analysis.readability,
            writing_style:        analysis.writingStyle,
            grammar_trend:        analysis.grammarTrend,
            vocabulary_trend:     analysis.vocabularyTrend,
            progress_summary:     analysis.progressSummary,
            emotion_words:        analysis.emotionWords,
            repeated_words:       analysis.repeatedWords,
            positive_word_count:  analysis.positiveWordCount,
            negative_word_count:  analysis.negativeWordCount,
            neutral_word_count:   analysis.neutralWordCount,
            lexical_diversity:    analysis.lexicalDiversity,
        }]);

        if (error) throw error;
        localStorage.setItem('latestAnalysis', JSON.stringify(analysis));
        localStorage.setItem('latestJournalText', textContent);
        window.location.href = 'sentiment.html';

    } catch (err) {
        console.error('Fetch Error Details:', err);
        alert('Failed to connect to AI. Check console for details.');
    } finally {
        saveBtn.innerText = "Save & Analyze ✔";
        saveBtn.disabled = false;
    }
};