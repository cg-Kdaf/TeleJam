const app = {
  currentSong: null,
  currentRole: null,  // 'lead' or 'chords'
  scrollLocked: false,
  isPlaying: false,
  autoScrollAnimation: null,
  currentBeat: 1,
  lastFrameTime: 0,

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
      toolbarPlayVinyl: document.getElementById('toolbar-vinyl'),
      vinylDisc: document.getElementById('vinyl-disc'),
      toolbarVinylImg: document.getElementById('toolbar-vinyl-img'),
      togglePlayBtn: document.getElementById('toggle-play-btn'),

      menuBtn: document.getElementById('menu-btn'),
      sideMenu: document.getElementById('side-menu'),
      sideMenuOverlay: document.getElementById('side-menu-overlay'),
      closeMenuBtn: document.getElementById('close-menu-btn'),
      bugModal: document.getElementById('bug-report-modal'),

      // Session Modal Elements
      openSessionModalBtn: document.getElementById('open-session-modal-btn'),
      sessionModal: document.getElementById('session-modal'),
      sessionHostView: document.getElementById('session-host-view'),
      sessionJoinView: document.getElementById('session-join-view'),
      sessionActions: document.getElementById('session-actions'),
      hostSessionBtn: document.getElementById('host-session-btn'),
      joinSessionBtn: document.getElementById('join-session-btn'),
      closeSessionBtn: document.getElementById('close-session-btn'),
      sessionHostStartBtn: document.getElementById('session-host-start-btn'),
      sessionJoinStatus: document.getElementById('session-join-status'),

      // BPM Elements
      openBpmBtn: document.getElementById('open-bpm-btn'),
      bpmModal: document.getElementById('bpm-modal'),
      bpmDisplayValue: document.getElementById('bpm-display-value'),
      bpmDecreaseBtn: document.getElementById('bpm-decrease-btn'),
      bpmIncreaseBtn: document.getElementById('bpm-increase-btn'),
      closeBpmBtn: document.getElementById('close-bpm-btn')
    };
  },

  bindEvents() {
    // Search
    this.elements.searchBtn.addEventListener(
        'click', () => this.handleSearch());
    this.elements.searchInput.addEventListener('input', (e) => {
      this.handleSearch();
    });

    // Random song
    this.elements.randomBtn.addEventListener(
        'click', () => this.loadRandomSong());

    // Role selection back button
    this.elements.roleBackBtn.addEventListener(
        'click', () => this.showTitleView('home'));

    // Role selection buttons
    this.elements.roleLeadBtn.addEventListener(
        'click', () => this.selectRole('lead'));
    this.elements.roleChordsBtn.addEventListener(
        'click', () => this.selectRole('chords'));

    // Menu events
    this.elements.menuBtn.addEventListener('click', () => {
      this.elements.sideMenu.classList.remove('hidden');
      this.elements.sideMenuOverlay.classList.remove('hidden');
    });
    this.elements.closeMenuBtn.addEventListener(
        'click', () => this.closeMenu());
    this.elements.sideMenuOverlay.addEventListener(
        'click', () => this.closeMenu());

    document.getElementById('menu-song-select-btn')
        .addEventListener('click', () => {
          this.closeMenu();
          this.showTitleView('home');
        });
    document.getElementById('menu-role-select-btn')
        .addEventListener('click', () => {
          this.closeMenu();
          this.showTitleView('role');
        });
    document.getElementById('menu-toggle-scroll-btn')
        .addEventListener('click', () => {
          this.toggleScrollLock();
        });
    document.getElementById('menu-report-bug-btn')
        .addEventListener('click', () => {
          this.closeMenu();
          this.elements.bugModal.classList.remove('hidden');
        });

    // Modal
    document.getElementById('close-bug-btn')
        .addEventListener(
            'click', () => this.elements.bugModal.classList.add('hidden'));
    document.getElementById('submit-bug-btn').addEventListener('click', () => {
      alert('Bug reported successfully! Thanks for your help.');
      this.elements.bugModal.classList.add('hidden');
      document.getElementById('bug-report-text').value = '';
    });

    // Session Modal Events
    this.elements.openSessionModalBtn.addEventListener('click', () => {
      this.elements.sessionModal.classList.remove('hidden');
      this.resetSessionModal();
    });

    this.elements.closeSessionBtn.addEventListener('click', () => {
      this.elements.sessionModal.classList.add('hidden');
    });

    this.elements.hostSessionBtn.addEventListener('click', () => {
      this.elements.sessionActions.style.display = 'none';
      this.elements.sessionHostView.classList.remove('hidden');
    });

    this.elements.joinSessionBtn.addEventListener('click', () => {
      this.elements.sessionActions.style.display = 'none';
      this.elements.sessionJoinView.classList.remove('hidden');
      this.elements.sessionJoinStatus.textContent = 'Scanning QR Code...';

      // Fake scanning delay
      setTimeout(() => {
        this.elements.sessionJoinStatus.textContent =
            'Session found! Joining...';
        setTimeout(() => {
          this.elements.sessionModal.classList.add('hidden');
          // Start the shared session automatically with a random song!
          alert('Successfully joined the shared session!');
        }, 1500);
      }, 3000);
    });

    this.elements.sessionHostStartBtn.addEventListener('click', () => {
      this.elements.sessionModal.classList.add('hidden');
      alert('Shared session started! Others can join via the QR code.');
    });

    // Auto-scroll toggle
    this.elements.togglePlayBtn.addEventListener('click', () => {
      this.toggleAutoScroll();
    });

    // BPM Modal Events
    this.elements.openBpmBtn.addEventListener('click', () => {
      this.elements.bpmModal.classList.remove('hidden');
      if (!this.currentSong.customBpm) {
        this.currentSong.customBpm = this.currentSong.bpm || 120;
      }
      this.elements.bpmDisplayValue.textContent = this.currentSong.customBpm;
    });

    this.elements.closeBpmBtn.addEventListener('click', () => {
      this.elements.bpmModal.classList.add('hidden');
    });

    this.elements.bpmIncreaseBtn.addEventListener('click', () => {
      this.currentSong.customBpm = (this.currentSong.customBpm || 120) + 5;
      this.elements.bpmDisplayValue.textContent = this.currentSong.customBpm;
    });

    this.elements.bpmDecreaseBtn.addEventListener('click', () => {
      this.currentSong.customBpm =
          Math.max(30, (this.currentSong.customBpm || 120) - 5);
      this.elements.bpmDisplayValue.textContent = this.currentSong.customBpm;
    });

    this.views.song.addEventListener('scroll', () => {
      this.highlightCurrentLine();
    });
  },

  resetSessionModal() {
    this.elements.sessionActions.style.display = 'flex';
    this.elements.sessionHostView.classList.add('hidden');
    this.elements.sessionJoinView.classList.add('hidden');
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
      let coverHTML;
      if (song.cover != undefined)
        coverHTML = `<div class="cover"><img  src="${song.cover}"/></div>`;
      else
        coverHTML = `<div class="cd-icon cover"></div>`;
      card.innerHTML = `
                <div class="song-card-left">
                    ${coverHTML}
                    <div class="song-info">
                        <h3>${song.title}</h3>
                        <p>${song.artist}</p>
                    </div>
                </div>
                <i class="fas fa-arrow-right primary-btn-small"></i>
            `;
      card.addEventListener('click', () => this.selectSong(song));
      container.appendChild(card);
    });
  },

  selectSong(song) {
    this.currentSong = song;
    console.log(song);
    this.elements.roleSongTitle.textContent = song.title;
    this.elements.roleSongArtist.textContent = song.artist;
    if (this.elements.toolbarVinylImg) {
      this.elements.toolbarVinylImg.src = song.cover || '';
      this.elements.toolbarVinylImg.alt = `${song.title} cover`;
    }
    this.showTitleView('role');
  },

  selectRole(role) {
    this.currentRole = role;
    const roleLabel = role === 'lead' ? 'Lead' : 'Chords';
    this.elements.toolbarTitle.textContent = this.currentSong.title;
    if (this.elements.toolbarArtist) {
      this.elements.toolbarArtist.textContent = this.currentSong.artist;
    }

    // Render Lyrics / Chords
    this.elements.lyricsContainer.innerHTML = '';

    // On itère désormais sur 'content' et non plus sur 'sections'
    this.currentSong.content.forEach(item => {
      const chunkDiv = document.createElement('div');
      chunkDiv.className = 'chunk-container';

      // Stockage du temps (beat) dans le DOM pour la synchronisation future
      chunkDiv.dataset.beat = item.beat;

      // Affichage des accords uniquement si le rôle est 'chords' ET qu'un
      // accord existe
      if (role === 'chords' && item.chord) {
        const chordSpan = document.createElement('span');
        chordSpan.className = 'chord-box';
        chordSpan.innerHTML = `<span class="chord">${
            item.chord.replace(/ /g, '&nbsp;&nbsp;')}</span>`;
        chunkDiv.appendChild(chordSpan);
      }

      // Affichage des paroles s'il y en a
      if (item.lyric) {
        const lyricSpan = document.createElement('span');
        lyricSpan.className = 'lyric-box';
        const formattedLyric = item.lyric.replace(/\n/g, '<br/>');
        lyricSpan.innerHTML = `<span class="lyric">${formattedLyric}</span>`;
        chunkDiv.appendChild(lyricSpan);
      }

      this.elements.lyricsContainer.appendChild(chunkDiv);
    });

    this.showTitleView('song');

    // Reset scroll position and lock, using setTimeout to ensure the layout has
    // updated
    setTimeout(() => {
      this.views.song.scrollTop = 0;
      if (this.scrollLocked) this.toggleScrollLock();
    }, 0);
  },

  showTitleView(viewName) {
    // Stop scrolling if leaving song view
    if (viewName !== 'song') {
      this.isPlaying = false;
      this.stopAutoScroll();
      if (this.elements.vinylDisc) {
        this.elements.vinylDisc.classList.remove('vinyl-spinning');
      }
      if (this.elements.togglePlayBtn) {
        this.elements.togglePlayBtn.querySelector('i').className =
            'fas fa-play';
      }
    }

    // Hide all views
    Object.values(this.views).forEach(v => v.classList.remove('active'));

    // Hide toolbar by default
    this.elements.toolbar.classList.add('hidden');
    this.elements.openBpmBtn.classList.add('hidden');

    if (viewName === 'home') {
      this.views.home.classList.add('active');
    } else if (viewName === 'role') {
      this.views.role.classList.add('active');
    } else if (viewName === 'song') {
      this.views.song.classList.add('active');
      this.elements.toolbar.classList.remove('hidden');
      this.elements.openBpmBtn.classList.remove('hidden');
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
  },

  toggleAutoScroll() {
    this.isPlaying = !this.isPlaying;
    const icon = this.elements.togglePlayBtn.querySelector('i');

    if (this.isPlaying) {
      this.lastFrameTime = performance.now();
      this.startAutoScroll();
      icon.className = 'fas fa-pause';
      if (this.elements.vinylDisc) {
        this.elements.vinylDisc.classList.add('vinyl-spinning');
      }
      this.startAutoScroll();
    } else {
      icon.className = 'fas fa-play';
      if (this.elements.vinylDisc) {
        this.elements.vinylDisc.classList.remove('vinyl-spinning');
      }
      this.stopAutoScroll();
    }
  },

  startAutoScroll() {
    this.lastFrameTime = performance.now();

    const lines = Array.from(this.elements.lyricsContainer.children);
    const readingZoneOffset = this.views.song.clientHeight * 0.4;

    const timeline = lines.map(line => {
      return {
        beat: parseFloat(line.dataset.beat || 1),
        element: line,
        targetScroll: line.offsetTop - readingZoneOffset
      };
    });

    const step = (currentTime) => {
      if (!this.isPlaying) return;

      const deltaMs = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;

      const bpm = this.currentSong.customBpm || this.currentSong.bpm || 120;

      const beatsPerMs = bpm / 60000;
      this.currentBeat += deltaMs * beatsPerMs;

      let activeLineIndex = 0;
      for (let i = 0; i < timeline.length; i++) {
        if (this.currentBeat >= timeline[i].beat) {
          activeLineIndex = i;
        } else {
          break;
        }
      }

      lines.forEach((line, index) => {
        if (index === activeLineIndex) {
          line.classList.add('active-line');
        } else {
          line.classList.remove('active-line');
        }
      });

      if (activeLineIndex < timeline.length) {
        const currentPoint = timeline[activeLineIndex];
        const nextPoint = timeline[activeLineIndex + 1];

        let targetY = currentPoint.targetScroll;

        if (nextPoint && (nextPoint.beat - currentPoint.beat) > 0) {
          const progress = (this.currentBeat - currentPoint.beat) /
              (nextPoint.beat - currentPoint.beat);
          const clampedProgress = Math.max(0, Math.min(1, progress));

          targetY = currentPoint.targetScroll +
              ((nextPoint.targetScroll - currentPoint.targetScroll) *
               clampedProgress);
        }

        this.views.song.scrollTop = Math.max(0, targetY);
      }

      this.autoScrollAnimation = requestAnimationFrame(step);
    };

    this.autoScrollAnimation = requestAnimationFrame(step);
  },

  highlightCurrentLine() {
    const container = this.views.song;
    const lines = this.elements.lyricsContainer.children;
    if (!lines || lines.length === 0) return;

    const readingZone = container.scrollTop + (container.clientHeight * 0.4);

    Array.from(lines).forEach((line) => {
      const lineTop = line.offsetTop;
      const lineBottom = lineTop + line.offsetHeight;

      // Si le texte traverse notre "zone de lecture" virtuelle
      if (readingZone >= lineTop && readingZone <= lineBottom) {
        line.classList.add('active-line');
      } else {
        line.classList.remove('active-line');
      }
    });
  },

  stopAutoScroll() {
    if (this.autoScrollAnimation) {
      cancelAnimationFrame(this.autoScrollAnimation);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});