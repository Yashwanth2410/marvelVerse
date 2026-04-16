// app.js
import { 
    auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
    onAuthStateChanged, signOut, collection, addDoc, query, orderBy, 
    onSnapshot, serverTimestamp 
} from './firebase.js';

// --- AI Model Data ---
const characters = [
    {
        id: 'gpt4o',
        name: 'GPT-4o',
        tagline: 'The Omni-Model: Seamless Text, Audio, and Vision.',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
        powers: ['Native Multimodality', 'Human-Like Latency', 'Advanced Reasoning', 'Contextual Emotion'],
        description: 'OpenAI\'s flagship "Omni" model is designed for natural human-computer interaction. It processes text, audio, and images in real-time, bridging the gap between machine and emotional intelligence.',
        color: '#74aa9c',
        accent: 'rgba(116, 170, 156, 0.4)'
    },
    {
        id: 'claude35',
        name: 'Claude 3.5 Sonnet',
        tagline: 'The Reasoning Sentinel: Nuanced, Fast, and Human.',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4628c6757?auto=format&fit=crop&q=80&w=800',
        powers: ['Exceptional Coding', 'Nuanced Writing', 'Visual Analysis', 'Safety-First Architecture'],
        description: 'Anthropic\'s most advanced model to date. Claude 3.5 Sonnet sets new industry benchmarks for coding and logical reasoning while maintaining a sophisticated, human-like tone.',
        color: '#D97757',
        accent: 'rgba(217, 119, 87, 0.4)'
    },
    {
        id: 'gemini15',
        name: 'Gemini 1.5 Pro',
        tagline: 'The Long-Context Voyager: Analyzing Worlds of Data.',
        image: 'https://images.unsplash.com/photo-1633533412151-8576ddafbc9e?auto=format&fit=crop&q=80&w=800',
        powers: ['2M Token Context', 'Deep Data Extraction', 'Cross-Modal Analysis', 'Google Ecosystem Integration'],
        description: 'Google DeepMind\'s powerhouse. With a massive 2 million token context window, Gemini 1.5 Pro can digest entire codebases, hour-long videos, and massive research papers in seconds.',
        color: '#4285F4',
        accent: 'rgba(66, 133, 244, 0.4)'
    },
    {
        id: 'llama3',
        name: 'Llama 3',
        tagline: 'The Open-Source Titan: Powering the Community.',
        image: 'https://images.unsplash.com/photo-1676299081847-824916de030a?auto=format&fit=crop&q=80&w=800',
        powers: ['Open-Weights Freedom', 'Massive Performance Scale', 'Efficient Fine-Tuning', 'Broad Language Support'],
        description: 'Meta\'s state-of-the-art open model. Llama 3 brings frontier-level intelligence to the open-source community, enabling developers worldwide to build custom, private AI solutions.',
        color: '#0668E1',
        accent: 'rgba(6, 104, 225, 0.4)'
    },
    {
        id: 'midjourney',
        name: 'Midjourney v6',
        tagline: 'The Aesthetic Visionary: Pixel-Perfect Dreams.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        powers: ['Unrivaled Aesthetics', 'Style Consistency', 'Text-to-Masterpiece', 'Advanced Zoom & Pan'],
        description: 'The industry gold standard for generative art. Midjourney v6 creates photorealistic and artistic imagery that blurs the line between human creativity and machine generation.',
        color: '#FF00FF',
        accent: 'rgba(255, 0, 255, 0.4)'
    },
    {
        id: 'sora',
        name: 'Sora',
        tagline: 'The World Simulator: Breathing Life into Pixels.',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
        powers: ['Real-World Physics', 'Complex Scene Generation', '60-Second Continuity', 'Cinematic Motion'],
        description: 'Opening a new chapter in video generation. Sora transforms text into hyper-realistic video, simulating world physics and characters with unprecedented detail and temporal consistency.',
        color: '#00F2FF',
        accent: 'rgba(0, 242, 255, 0.4)'
    }
];

// --- State Management ---
let currentUser = null;
let selectedHero = null;

// --- DOM Elements ---
const grid = document.getElementById('characterGrid');
const modal = document.getElementById('characterModal');
const closeModal = document.getElementById('closeModal');
const authContainer = document.getElementById('authContainer');
const fanInputForm = document.getElementById('fanInputForm');
const interactionTitle = document.getElementById('interactionTitle');
const selectedHeroDisplay = document.getElementById('selectedHeroDisplay');
const feedContainer = document.getElementById('feedContainer');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authBtn = document.getElementById('authBtn');
const toggleAuth = document.getElementById('toggleAuth');
const reasonInput = document.getElementById('reason');
const charCount = document.getElementById('charCount');
const submitBtn = document.getElementById('submitBtn');
const logoutBtn = document.getElementById('logoutBtn');

// --- Initialization ---
function init() {
    renderCharacters();
    setupAuthListeners();
    setupIntersectionObserver();
    setupParallax();
    loadFeed();
}


// --- Character Grid Rendering ---
function renderCharacters() {
    grid.innerHTML = characters.map((char, index) => `
        <div class="character-card" data-id="${char.id}" style="--char-color: ${char.color}; --char-accent: ${char.accent}; --delay: ${index * 0.1}s">
            <div class="card-img-wrapper">
                <img src="${char.image}" alt="${char.name}" class="parallax-img">
                <div class="card-overlay"></div>
                <div class="shimmer"></div>
                <div class="glow-overlay"></div>
            </div>
            <div class="card-info">
                <div class="card-info-header">
                    <h3>${char.name}</h3>
                    <div class="info-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </div>
                </div>
                <p class="tagline">${char.tagline}</p>
            </div>
        </div>
    `).join('');

    // Click events
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            const char = characters.find(c => c.id === card.dataset.id);
            openCharacterModal(char);
        });
    });

    // Re-run parallax setup if needed
    setupParallax();
}


// --- Modal Logic ---
function openCharacterModal(char) {
    const modalImg = document.getElementById('modalImg');
    modalImg.src = char.image;
    document.getElementById('modalName').innerText = char.name;
    document.getElementById('modalName').style.color = char.color;
    document.getElementById('modalTagline').innerText = char.tagline;
    document.getElementById('modalPowers').innerHTML = char.powers.map(p => `<li>${p}</li>`).join('');
    // Change heading to Capabilities
    document.querySelector('.powers h4').innerText = 'Core Intelligence Specialties';
    document.querySelector('.description h4').innerText = 'Intelligence Overview';
    document.getElementById('modalDesc').innerText = char.description;
    
    // Set custom property for modal glow
    document.querySelector('.modal-content').style.setProperty('--modal-accent', char.accent);

    const selectBtn = document.getElementById('selectHeroBtn');
    selectBtn.style.background = char.color;
    selectBtn.onclick = () => {
        selectHero(char);
        modal.classList.remove('active');
        document.getElementById('interaction').scrollIntoView({ behavior: 'smooth' });
    };

    modal.classList.add('active');
}


closeModal.onclick = () => modal.classList.remove('active');
window.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };

// --- Hero Selection ---
function selectHero(char) {
    selectedHero = char;
    selectedHeroDisplay.innerText = char.name;
    selectedHeroDisplay.style.color = char.color;
    
    // Update preview image
    const previewImg = document.getElementById('selectedHeroImg');
    previewImg.src = char.image;
    previewImg.parentElement.style.borderColor = char.color;
    previewImg.parentElement.style.boxShadow = `0 0 15px ${char.accent}`;
    document.querySelector('.selected-hero-preview').classList.add('active');
    
    // Highlight selected card in grid
    document.querySelectorAll('.character-card').forEach(card => {
        card.style.borderColor = (card.dataset.id === char.id) ? 'var(--secondary-gold)' : 'var(--glass-border)';
        card.style.boxShadow = (card.dataset.id === char.id) ? (card.dataset.id === char.id ? `0 0 20px ${char.accent}` : 'none') : 'none';
        
        // Add a visual indicator to the card itself
        if (card.dataset.id === char.id) {
            card.classList.add('selected-hero-card');
        } else {
            card.classList.remove('selected-hero-card');
        }
    });

    // Animate the interaction title
    interactionTitle.style.color = char.color;
}


// --- Authentication Logic ---
let isLoginMode = true;

toggleAuth.onclick = () => {
    isLoginMode = !isLoginMode;
    authBtn.innerText = isLoginMode ? 'Login' : 'Sign Up';
    toggleAuth.innerText = isLoginMode ? 'Sign Up' : 'Login';
    document.querySelector('.auth-toggle').childNodes[0].textContent = isLoginMode ? "Don't have an account? " : "Already have an account? ";
};

authBtn.onclick = async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) return alert('Please fill in all fields');

    const originalText = authBtn.innerText;
    authBtn.innerText = 'Verifying...';
    authBtn.disabled = true;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
        // Success feedback is handled by setupAuthListeners
    } catch (error) {
        console.error("Auth Error:", error.code);
        
        if (error.code === 'auth/configuration-not-found') {
            alert('CRITICAL: Firebase Auth is not enabled. 🛡️\n\nPlease go to your Firebase Console and enable the "Email/Password" sign-in method.');
        } else if (error.code === 'auth/invalid-login-credentials' || error.code === 'auth/user-not-found') {
            // Automatically switch to Sign Up mode
            isLoginMode = false;
            authBtn.innerText = 'Sign Up';
            toggleAuth.innerText = 'Login';
            const authToggleText = document.querySelector('.auth-toggle');
            if (authToggleText) authToggleText.childNodes[0].textContent = "Already have an account? ";
            
            alert('Account not found. We have switched you to "Sign Up" mode—just click the button again to create your account! 🦸‍♂️');
        } else if (error.code === 'auth/wrong-password') {
            alert('Invalid password. Check your input.');
        } else {
            alert(error.message);
        }
        
        authBtn.innerText = originalText;
        authBtn.disabled = false;
    }
};

logoutBtn.onclick = () => signOut(auth);

function setupAuthListeners() {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (user) {
            authContainer.classList.remove('active-form');
            fanInputForm.classList.add('active-form');
            interactionTitle.innerText = `Welcome, Avenger`;
            interactionTitle.style.color = 'var(--secondary-gold)';
            
            // Helpful UX: Scroll to characters after login
            if (authBtn.innerText === 'Verifying...') {
                document.getElementById('showcase').scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            authContainer.classList.add('active-form');
            fanInputForm.classList.remove('active-form');
            interactionTitle.innerText = `Assemble`;
            interactionTitle.style.color = 'var(--text-primary)';
        }
        
        // Reset auth button state regardless of outcome
        authBtn.innerText = isLoginMode ? 'Login' : 'Sign Up';
        authBtn.disabled = false;
    });
}

// --- Fan Submission ---
reasonInput.oninput = () => {
    charCount.innerText = `${reasonInput.value.length} / 200`;
};

submitBtn.onclick = async () => {
    if (!selectedHero) return alert('Please select a hero first!');
    if (!reasonInput.value.trim()) return alert('Tell us why!');

    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Transmitting to Wakanda...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    try {
        await addDoc(collection(db, "favorites"), {
            user: currentUser.email,
            character: selectedHero.name,
            reason: reasonInput.value,
            createdAt: serverTimestamp()
        });
        
        // Success State
        submitBtn.innerText = 'Registry Updated';
        submitBtn.style.background = '#00ff88';
        submitBtn.style.color = '#000';
        
        setTimeout(() => {
            reasonInput.value = '';
            charCount.innerText = '0 / 200';
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.background = 'var(--primary-red)';
            submitBtn.style.color = '#fff';
        }, 2000);

    } catch (error) {
        console.error("Firestore Save Error Details:", error);
        alert('Transmission failed. Check your Firebase console to ensure Firestore is enabled and rules are in "Test Mode".\n\nError: ' + error.message);
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
};

// --- Feed Loading ---
function loadFeed() {
    const q = query(collection(db, "favorites"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        feedContainer.innerHTML = '';
        
        if (snapshot.empty) {
            feedContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); opacity: 0.5;">The registry is empty. Be the first to save a favorite.</p>';
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            const item = document.createElement('div');
            item.className = 'feed-item';
            
            // Find character color for the border
            const char = characters.find(c => c.name === data.character);
            const accentColor = char ? char.color : 'var(--primary-red)';

            item.style.borderLeftColor = accentColor;
            item.innerHTML = `
                <div class="user-meta">
                    <span style="font-weight: 600;">${data.user.split('@')[0]}</span>
                    <span style="color: ${accentColor}">${data.character} Specialist</span>
                </div>
                <p class="reason">"${data.reason}"</p>
            `;
            feedContainer.appendChild(item);
        });
    });
}


// --- Reveal Animations ---
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.character-card').forEach(card => {
        observer.observe(card);
    });
}

// --- Parallax & Interactive Effects ---
function setupParallax() {
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Set glow position
            card.style.setProperty('--px', `${x}px`);
            card.style.setProperty('--py', `${y}px`);

            // Calculate parallax shift (-5% to 5%)
            const mx = ((x / rect.width) - 0.5) * 10;
            const my = ((y / rect.height) - 0.5) * 10;
            
            card.style.setProperty('--mx', `${mx}%`);
            card.style.setProperty('--my', `${my}%`);

            // Subtle card tilt
            const rx = ((y / rect.height) - 0.5) * -10;
            const ry = ((x / rect.width) - 0.5) * 10;
            card.style.transform = `translateY(-15px) scale(1.03) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.setProperty('--mx', '0%');
            card.style.setProperty('--my', '0%');
        });
    });
}

// Run Init
init();
