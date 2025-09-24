const topicInput = document.getElementById('topic');
const generateBtn = document.getElementById('generateBtn');
const speakBtn = document.getElementById('speakBtn');

// 🎤 Speech recognition
speakBtn.addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition not supported in this browser');
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new SpeechRecognition();
  recog.lang = 'en-US';
  recog.interimResults = false;
  recog.maxAlternatives = 1;
  recog.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    topicInput.value = (topicInput.value + ' ' + transcript).trim();
  };
  recog.onerror = (e) => console.warn('Speech error:', e);
  recog.start();
});

// 📤 Generate PPT
generateBtn.addEventListener('click', async () => {
  const topic = topicInput.value.trim();
  if (!topic) {
    alert('Enter a topic first');
    return;
  }
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';

  try {
    const resp = await fetch('http://localhost:8000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, num_slides: 6, style: 'concise' })
    });

    if (!resp.ok) {
      const err = await resp.json();
      alert('Error: ' + (err.error || JSON.stringify(err)));
      return;
    }

    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presentation_${Date.now()}.pptx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    alert('Request failed: ' + e);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate PPTX';
  }
});
