const app = {
    currentSong: null,
    currentRole: null, // 'lead' or 'chords'
    scrollLocked: false,

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadPopularSongs();
    },

    cacheDOM() {
        this.views = {
            home: document.getElementById('home-view'),
            role: document.getElementById('role-view'),
            song: document.getElementById('song-display-view')
        };
        
        this.lists = {
            popular: document.getElementById('popular-songs-list'),
            search: document.getElementById('search-results-list')
        };

        this.elements = {
            searchInput: document.getElementById('search-input'),
            searchBtn: document.getElementById('search-btn'),
            randomBtn: document.getElementById('random-song-btn'),
            
            roleBackBtn: document.getElementById('role-back-btn'),
            roleSongTitle: document.getElementById('role-song-title'),
            roleSongArtist: document.getElementById('role-song-artist'),
            roleLeadBtn: document.getElementById('role-lead-btn'),
            roleChordsBtn: document.getElementById('role-chords-btn'),
            
            lyricsContainer: document.getElementById('lyrics-container'),
            toolbar: document.getElementById('toolbar'),
            toolbarTitle: document.getElementById('toolbar-title'),
            toolbarArtist: document.getElementById('toolbar-artist'),
            
            menuBtn: document.getElementById('menu-btn'),
            sideMenu: document.getElementById('side-menu'),
            sideMenuOverlay: document.getElementById('side-menu-overlay'),
            closeMenuBtn: document.getElementById('close-menu-btn'),
            bugModal: document.getElementById('bug-report-modal')
        };
    },

    bindEvents() {
        // Search
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Random song
        this.elements.randomBtn.addEventListener('click', () => this.loadRandomSong());
        
        // Role selection back button
        this.elements.roleBackBtn.addEventListener('click', () => this.showTitleView('home'));
        
        // Role selection buttons
        this.elements.roleLeadBtn.addEventListener('click', () => this.selectRole('lead'));
        this.elements.roleChordsBtn.addEventListener('click', () => this.selectRole('chords'));
        
        // Menu events
        this.elements.menuBtn.addEventListener('click', () => {
            this.elements.sideMenu.classList.remove('hidden');
            this.elements.sideMenuOverlay.classList.remove('hidden');
        });
        this.elements.closeMenuBtn.addEventListener('click', () => this.closeMenu());
        this.elements.sideMenuOverlay.addEventListener('click', () => this.closeMenu());
        
        document.getElementById('menu-song-select-btn').addEventListener('click', () => { this.closeMenu(); this.showTitleView('home'); });
        document.getElementById('menu-role-select-btn').addEventListener('click', () => { this.closeMenu(); this.showTitleView('role'); });
        document.getElementById('menu-toggle-scroll-btn').addEventListener('click', () => { this.toggleScrollLock(); });
        document.getElementById('menu-report-bug-btn').addEventListener('click', () => { this.closeMenu(); this.elements.bugModal.classList.remove('hidden'); });
        
        // Modal
        document.getElementById('close-bug-btn').addEventListener('click', () => this.elements.bugModal.classList.add('hidden'));
        document.getElementById('submit-bug-btn').addEventListener('click', () => {
            alert('Bug reported successfully! Thanks for your help.');
            this.elements.bugModal.classList.add('hidden');
            document.getElementById('bug-report-text').value = '';
        });
    },

    closeMenu() {
        this.elements.sideMenu.classList.add('hidden');
        this.elements.sideMenuOverlay.classList.add('hidden');
    },

    async loadPopularSongs() {
        try {
            const res = await fetch('/api/songs/popular');
            const songs = await res.json();
            this.renderSongList(songs, this.lists.popular);
        } catch (err) {
            console.error('Error loading popular songs:', err);
        }
    },

    async handleSearch() {
        const query = this.elements.searchInput.value.trim();
        const popularSection = document.getElementById('popular-section');
        const emptyState = document.getElementById('search-empty-state');
        
        if (!query) {
            this.lists.search.classList.add('hidden');
            emptyState.classList.add('hidden');
            popularSection.classList.remove('hidden');
            return;
        }

        try {
            const res = await fetch(`/api/songs?search=${encodeURIComponent(query)}`);
            const songs = await res.json();
            
            popularSection.classList.add('hidden');
            
            if (songs.length === 0) {
                this.lists.search.classList.add('hidden');
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
                this.lists.search.classList.remove('hidden');
                this.renderSongList(songs, this.lists.search);
            }
        } catch (err) {
            console.error('Error searching songs:', err);
        }
    },

    async loadRandomSong() {
        try {
            const res = await fetch('/api/songs/random');
            if (res.ok) {
                const song = await res.json();
                this.selectSong(song);
            }
        } catch (err) {
            console.error('Error loading random song:', err);
        }
    },

    renderSongList(songs, container) {
        container.innerHTML = '';
        songs.forEach(song => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.innerHTML = `
                <div class="song-card-left">
                    <div class="cd-icon"></div>
                    <div class="song-info">
                        <h3>${song.title}</h3>
                        <p>${song.artist}</p>
                    </div>
                </div>
                <div class="song-arrow"><i class="fas fa-arrow-right"></i></div>
            `;
            card.addEventListener('click', () => this.selectSong(song));
            container.appendChild(card);
        });
    },

    selectSong(song) {
        this.currentSong = song;
        this.elements.roleSongTitle.textContent = song.title;
        this.elements.roleSongArtist.textContent = song.artist;
        this.showTitleView('role');
    },

    selectRole(role) {
        this.currentRole = role;
        const roleLabel = role === 'lead' ? 'Lead' : 'Chords';
        this.elements.toolbarTitle.textContent = this.currentSong.title;
        if(this.elements.toolbarArtist) this.elements.toolbarArtist.textContent = this.currentSong.artist;
        
        // Render Lyrics / Chords
        this.elements.lyricsContainer.innerHTML = '';
        this.currentSong.sections.forEach(section => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'line-container';
            
            if (role === 'chords') {
                const chordSpan = document.createElement('span');
                chordSpan.className = 'chord-box';
                chordSpan.innerHTML = `<span class="chord">${(section.chord || '').replace(/ /g, '&nbsp;&nbsp;')}</span>`;
                lineDiv.appendChild(chordSpan);
            }
            
            const lyricSpan = document.createElement('span');
            lyricSpan.className = 'lyric-box';
            lyricSpan.innerHTML = `<span class="lyric">${section.lyric || ''}</span>`;
            lineDiv.appendChild(lyricSpan);
            
            this.elements.lyricsContainer.appendChild(lineDiv);
        });

        this.showTitleView('song');
        
        // Reset scroll position and lock
        this.views.song.scrollTop = 0;
        if (this.scrollLocked) this.toggleScrollLock();
    },

    showTitleView(viewName) {
        // Hide all views
        Object.values(this.views).forEach(v => v.classList.remove('active'));
        
        // Hide toolbar by default
        this.elements.toolbar.classList.add('hidden');

        if (viewName === 'home') {
            this.views.home.classList.add('active');
        } else if (viewName === 'role') {
            this.views.role.classList.add('active');
        } else if (viewName === 'song') {
            this.views.song.classList.add('active');
            this.elements.toolbar.classList.remove('hidden');
        }
    },

    toggleScrollLock() {
        this.scrollLocked = !this.scrollLocked;
        const icon = document.querySelector('#menu-toggle-scroll-btn i');
        
        if (this.scrollLocked) {
            this.views.song.classList.add('scroll-locked');
            icon.className = 'fas fa-lock';
        } else {
            this.views.song.classList.remove('scroll-locked');
            icon.className = 'fas fa-lock-open';
        }
        
        this.closeMenu();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});