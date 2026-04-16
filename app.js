// app.js
import { 
    auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
    onAuthStateChanged, signOut, collection, addDoc, query, orderBy, 
    onSnapshot, serverTimestamp 
} from './firebase.js';

// --- Character Data ---
const characters = [
    {
        id: 'ironman',
        name: 'Iron Man',
        tagline: 'Genius, Billionaire, Playboy, Philanthropist.',
        image: 'assets/ironman.jpg',
        powers: ['Powered Armor Suit', 'Genius Intelligence', 'Flight & Repulsors', 'Advanced AI (J.A.R.V.I.S)'],
        description: 'Tony Stark is a visionary who used his genius to protect the world. His journey from a selfish weapons dealer to a selfless hero is the heart of the Marvel Cinematic Universe.',
        color: '#ED1D24',
        accent: 'rgba(237, 29, 36, 0.4)'
    },
    {
        id: 'spiderman',
        name: 'Spider-Man',
        tagline: 'With Great Power, Comes Great Responsibility.',
        image: 'assets/spider.jpg',
        powers: ['Spider-Sense', 'Superhuman Strength & Agility', 'Wall-Crawling', 'Web-Shooters'],
        description: 'Peter Parker is the relatable hero who balances life as a teenager with the heavy burden of being a friendly neighborhood Spider-Man. He represents hope and perseverance.',
        color: '#E62429',
        accent: 'rgba(230, 36, 41, 0.4)'
    },
    {
        id: 'cap',
        name: 'Captain America',
        tagline: 'I can do this all day.',
        image: 'assets/captain.png',
        powers: ['Super Soldier Serum', 'Indestructible Shield', 'Expert Tactician', 'Enhanced Strength & Reflexes'],
        description: 'Steve Rogers is the moral compass of the Avengers. A man out of time, he stands for freedom, justice, and the unwavering belief in doing what is right.',
        color: '#0054A6',
        accent: 'rgba(0, 84, 166, 0.4)'
    },
    {
        id: 'thor',
        name: 'Thor',
        tagline: 'The God of Thunder.',
        image: 'assets/thor.jpg',
        powers: ['Mjolnir/Stormbreaker', 'Weather Manipulation', 'Interdimensional Travel', 'Superhuman Longevity'],
        description: 'The Prince of Asgard, Thor Odinson has evolved from an arrogant warrior to a cosmic defender of the Nine Realms, mastering the true power of thunder and lightning.',
        color: '#FFD700',
        accent: 'rgba(255, 215, 0, 0.4)'
    },
    {
        id: 'hulk',
        name: 'Hulk',
        tagline: "That's my secret, Cap: I'm always angry.",
        image: 'assets/hulk.jpg',
        powers: ['Incredible Strength', 'Rapid Healing', 'Near-Invulnerability', 'Gamma Radiation Absorption'],
        description: 'Dr. Bruce Banner and the Hulk represent the duality of man. While one is a brilliant scientist, the other is an unstoppable force of nature that levels mountains.',
        color: '#2A7E19',
        accent: 'rgba(42, 126, 25, 0.4)'
    },
    {
        id: 'blackpanther',
        name: 'Black Panther',
        tagline: 'Wakanda Forever!',
        image: 'assets/panther.jpg',
        powers: ['Vibranium Suit', 'Enhanced Strength & Senses', 'Advanced Wakandan Tech', 'Kinetic Energy Absorption'],
        description: "T'Challa, King of Wakanda, is a warrior king who leads with wisdom and protects his people's secrets while using their advanced technology to aid the world.",
        color: '#9E7BFF',
        accent: 'rgba(158, 123, 255, 0.4)'
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
                    <span style="color: ${accentColor}">${data.character} Enthusiast</span>
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
