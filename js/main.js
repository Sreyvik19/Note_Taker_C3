// Notes data
const notesData = [
    {
        id: 1,
        title: "Midterm review",
        date: "Jul 4, 2023",
        category: "literature",
        content: "Important concepts for literature midterm exam. Focus on 19th century romantic poetry and modernist novels.",
        tags: ["exam", "review", "literature"],
        isFavorite: true
    },
    {
        id: 2,
        title: "Boards and Beyond Notes",
        date: "Jul 3, 2023",
        category: "literature",
        content: "Summary of key points from Boards and Beyond literature section. Character analysis and thematic exploration.",
        tags: ["medical", "study", "literature"],
        isFavorite: false
    },
    {
        id: 3,
        title: "Unit 1 AP Physics, Intro to Kinematics",
        date: "Jul 4, 2023",
        category: "science",
        content: "Basic concepts of kinematics: displacement, velocity, acceleration. Equations of motion and graphical analysis.",
        tags: ["physics", "kinematics", "science"],
        isFavorite: true
    },
    {
        id: 4,
        title: "Calculus Derivative Rules",
        date: "Jun 28, 2023",
        category: "math",
        content: "Power rule, product rule, quotient rule, and chain rule with examples. Applications in optimization problems.",
        tags: ["calculus", "derivatives", "math"],
        isFavorite: false
    },
    {
        id: 5,
        title: "World War II Timeline",
        date: "Jun 25, 2023",
        category: "history",
        content: "Key events from 1939 to 1945. Major battles, political developments, and turning points.",
        tags: ["ww2", "timeline", "history"],
        isFavorite: true
    },
    {
        id: 6,
        title: "Quarterly Sales Report",
        date: "Jun 20, 2023",
        category: "reports",
        content: "Analysis of Q2 sales performance. Regional breakdown and projections for next quarter.",
        tags: ["business", "sales", "reports"],
        isFavorite: false
    },
    {
        id: 7,
        title: "Personal Goals 2023",
        date: "Jun 15, 2023",
        category: "personal",
        content: "Fitness, career, and personal development goals for the year. Quarterly milestones and progress tracking.",
        tags: ["goals", "personal", "planning"],
        isFavorite: false
    },
    {
        id: 8,
        title: "Photos from Summer Trip",
        date: "Jun 10, 2023",
        category: "gallery",
        content: "Collection of photos from the coastal trip. Landscapes, people, and memorable moments.",
        tags: ["photos", "travel", "gallery"],
        isFavorite: true
    }
];

// DOM elements
const notesContainer = document.getElementById('notes-container');
const searchInput = document.getElementById('searchInput');
const navItems = document.querySelectorAll('.nav-item');
const categoryItems = document.querySelectorAll('.category-item');
const notesCount = document.getElementById('notes-count');

// Current filter state
let currentFilter = 'all';
let currentCategory = 'all';
let searchQuery = '';

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    renderNotes();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', function () {
        searchQuery = this.value.toLowerCase();
        renderNotes();
    });

    // Filter nav items
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            // Update active state
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            // Update filter
            currentFilter = this.dataset.filter;
            renderNotes();
        });
    });

    // Category items
    categoryItems.forEach(item => {
        item.addEventListener('click', function () {
            // Update active state
            categoryItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            // Update category
            currentCategory = this.dataset.category;
            renderNotes();
        });
    });
}

// Render notes based on current filters
function renderNotes() {
    // Clear container
    notesContainer.innerHTML = '';

    // Filter notes
    let filteredNotes = notesData.filter(note => {
        // Apply search filter
        if (searchQuery) {
            const searchContent = note.title.toLowerCase() + ' ' +
                note.content.toLowerCase() + ' ' +
                note.tags.join(' ').toLow
            if (!searchContent.includes(searchQuery)) {
                return false;
            }
        }

        // Apply favorites filter
        if (currentFilter === 'favorites' && !note.isFavorite) {
            return false;
        }

        // Apply category filter
        if (currentCategory !== 'all' && note.category !== currentCategory) {
            return false;
        }

        return true;
    });

    // Update notes count
    notesCount.textContent = `Showing ${filteredNotes.length} note${filteredNotes.length !== 1 ? 's' : ''}`;

    // Show empty state if no notes
    if (filteredNotes.length === 0) {
        notesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-sticky-note"></i>
                        <h3>No notes found</h3>
                        <p>Try adjusting your search or filter to find what you're looking for.</p>
                    </div>
                `;
        return;
    }

    // Sort by date (newest first)
    filteredNotes.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Render each note
    filteredNotes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        noteElement.dataset.id = note.id;

        // Highlight search terms in title and content
        let displayTitle = note.title;
        let displayContent = note.content;

        if (searchQuery) {
            displayTitle = highlightText(displayTitle, searchQuery);
            displayContent = highlightText(displayContent, searchQuery);
        }

        noteElement.innerHTML = `
                    <div class="note-header">
                        <div>
                            <div class="note-title">${displayTitle}</div>
                            <div class="note-date">${note.date}</div>
                        </div>
                        <button class="favorite-btn ${note.isFavorite ? 'favorited' : ''}" data-id="${note.id}">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                    <div class="note-category">${capitalizeFirstLetter(note.category)}</div>
                    <div class="note-content">${displayContent}</div>
                    <div class="note-actions">
                        <div class="note-tags">
                            ${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                `;

        notesContainer.appendChild(noteElement);
    });

    // Add event listeners to favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const noteId = parseInt(this.dataset.id);
            toggleFavorite(noteId);
        });
    });
}

// Toggle favorite status
function toggleFavorite(noteId) {
    const noteIndex = notesData.findIndex(note => note.id === noteId);
    if (noteIndex !== -1) {
        notesData[noteIndex].isFavorite = !notesData[noteIndex].isFavorite;
        renderNotes();
    }
}

// Highlight search terms in text
function highlightText(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
