const notesData = [
    {   
        id: 1,
        title: "Midterm review",
        date: "jul 4, 2023",
        category: "Literature",
        content: "Important concepts for literature midterm exam. Focus on 19th century romantic poetry and modernist novels.",
        tags: ["exam", "review", "literature" ],
        isFavorite:true
        
    },
    {   
        id: 2,
        title: "Boards and Beyond Notes",
        date: "jul 3, 2023",
        category: "Literature",
        content: "Summary of key points from boards abd beyond literature section. Charactor analysis and thematic exploration.",
        tags: ["medical", "study", "literature" ],
        isFavorite: false
        
    },
    {   
        id: 3,
        title: "Unit 1 Ap Physics, Intro to Kinematics",
        date: "jul 4, 2023",
        category: "science",
        content: "Basic concepts of kinematics: displacement, velocity, acceleration. Equations of motion and graphical analysis.",
        tags: ["physics", "kinematics", "science" ],
        isFavorite:true
        
    },
    {   
        id: 4,
        title: "Calculus Derivatives Rules",
        date: "jul 28, 2023",
        category: "math",
        content: "Power rule, product rule, quotient rule, and chain with examples. Applications in optimization problems.",
        tags: ["calculus", "derivatives", "math" ],
        isFavorite:false
        
    },
    {   
        id: 5,
        title: "World War II Timeline",
        date: "jul 25, 2023",
        category: "history",
        content: "Key events from 1939 to 19945. Major battles, political developments, and turning points",
        tags: ["ww2", "timeline", "history" ],
        isFavorite:true
        
    },
    {   
        id: 6,
        title: "Quarterly Sales Report",
        date: "jul 20, 2023",
        category: "reports",
        content: "Analysis ofQ2 sales performance. Regional breakdown and projections for next quarter",
        tags: ["business", "sales", "reports" ],
        isFavorite:false
        
    },
    {   
        id: 7,
        title: "Personal Goals 2023",
        date: "jul 15, 2023",
        category: "personal",
        content: "Fitness, career, and personal development goals for the year. Quarterly milestones and progress tracking.",
        tags: ["goals", "personal", "planning" ],
        isFavorite: false
        
    },
    {   
        id: 8,
        title: "Photos from Summer Trip",
        date: "jul 10, 2023",
        category: "gallery",
        content: "Collection of photos from the coastal trip. Landscapes, people, and memorable moments.",
        tags: ["photos", "travel", "gallery" ],
        isFavorite:true
        
    }

]

// DOM elements

const notesContainer = document.getElementById('notes-container');
const searchInput = document.getElementById('searchInput');
const navItems = document.querySelectorAll('.nav-item');
const categoryItems = document.querySelectorAll('.category-item');
const notesCount = document.getElementById('notes-count');

// Current filter state

let currentFilter = 'all';
let currentCategory = 'all';
let searchQurey = '';

// Initialize the website

document.addEventListener('DOMContentLoaded', function() {
    renderNotes();
    setupEventListeners();
});

// setup event listeners

function setupEventListeners(){
    searchInput.addEventListener('input', function(){
        searchQurey = this.value.toLowerCase();
        renderNotes();
    });
    
    // Filter nav items

    navItems.forEach(item => {
        item.addEventListener('click', function(){
            navItems.forEach(i => i.classList.remove('active'));
            this.classLIst.add('active');
            currentFilter = this.dataset.filter;
            renderNotes();
        });
    });

    // Category items
    categoryItems.forEach(item => {
        item.addEventListener('click', function(){
            categoryItems.forEach(i => i.classList.remove('active'));
            currentCategory = this.dataset.category;
            renderNotes();
        });
    });
}

    