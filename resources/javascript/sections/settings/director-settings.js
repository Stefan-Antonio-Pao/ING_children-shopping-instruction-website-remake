// Director Settings - Character Selection and Video Playback
document.addEventListener('DOMContentLoaded', () => {
    const characters = ['bear', 'cat', 'dog', 'rabbit'];
    const characterGrid = document.querySelector('.character-grid');
    const videoContainer = document.querySelector('.video-container');
    const videoPlaceholder = document.querySelector('.video-placeholder');

    let selectedCharacter = null;
    let currentVideo = null;

    // Initialize character selection
    function initCharacterSelection() {
        // Load saved character selection
        selectedCharacter = localStorage.getItem('selectedDirector') || 'dog';

        // Create character avatars
        characters.forEach(character => {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = `character-avatar ${character === selectedCharacter ? 'selected' : ''}`;
            avatarDiv.dataset.character = character;

            avatarDiv.innerHTML = `
                <img src="../../assets/images/directors/${character}.png" alt="${character}">
                <!-- <div class="character-name">${getCharacterName(character)}</div> -->
            `;

            avatarDiv.addEventListener('click', () => selectCharacter(character));
            characterGrid.appendChild(avatarDiv);
        });

        // Load initial video
        loadCharacterVideo(selectedCharacter);
    }

    // Get character display name
    function getCharacterName(character) {
        const names = {
            'bear': '熊叔叔',
            'cat': '猫姐姐',
            'dog': '狗哥哥',
            'rabbit': '兔妹妹'
        };
        return names[character] || character;
    }

    // Select character
    function selectCharacter(character) {
        if (selectedCharacter === character) return;

        // Update selection UI
        document.querySelectorAll('.character-avatar').forEach(avatar => {
            avatar.classList.remove('selected');
            if (avatar.dataset.character === character) {
                avatar.classList.add('selected');
            }
        });

        // Update selection
        selectedCharacter = character;

        // Save to localStorage
        localStorage.setItem('selectedDirector', character);

        // Load new video
        loadCharacterVideo(character);
    }

    // Load character video
    function loadCharacterVideo(character) {
        // Remove existing video
        if (currentVideo) {
            currentVideo.pause();
            currentVideo.src = '';
            currentVideo.remove();
            currentVideo = null;
        }

        // Hide placeholder
        if (videoPlaceholder) {
            videoPlaceholder.style.display = 'none';
        }

        // Create new video element
        const video = document.createElement('video');
        video.controls = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        video.style.background = '#000';

        // Set source immediately
        video.src = `../../assets/vedios/directors/${character}.mp4`;

        // Add to DOM
        videoContainer.appendChild(video);

        currentVideo = video;

        // Auto-play when ready
        video.addEventListener('canplay', () => {
            video.play().catch(e => {
                console.log('Auto-play failed, user interaction required:', e);
            });
        }, { once: true });
    }

    // Show video error - removed error display to improve teaching experience
    function showVideoError() {
        // Silently handle errors without affecting user experience
        console.error('Video loading error');
    }

    // Get current selected director (for external use)
    window.getSelectedDirector = () => {
        return localStorage.getItem('selectedDirector') || 'dog';
    };

    // Set selected director (for external use)
    window.setSelectedDirector = (character) => {
        if (characters.includes(character)) {
            selectCharacter(character);
        }
    };

    // Initialize
    initCharacterSelection();
});
