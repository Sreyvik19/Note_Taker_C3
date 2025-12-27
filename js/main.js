
// Initialize jsPDF
const { jsPDF } = window.jspdf;

// Load notes from localStorage or start with empty array
let notesData = JSON.parse(localStorage.getItem('recentNotes')) || [];

// Download history data
let downloadHistory = JSON.parse(localStorage.getItem('downloadHistory')) || [
    {
        id: 1,
        fileName: "All_Notes (3).pdf",
        size: "5.6 KB",
        timeAgo: "19 minutes ago"
    },
    {
        id: 2,
        fileName: "All_Notes (2).pdf",
        size: "5.6 KB",
        timeAgo: "47 minutes ago"
    },
    {
        id: 3,
        fileName: "All_Notes (1).pdf",
        size: "5.6 KB",
        timeAgo: "1 hour ago"
    },
    {
        id: 4,
        fileName: "All_Notes.pdf",
        size: "5.6 KB",
        timeAgo: "1 hour ago"
    }
];

// DOM elements
const notesContainer = document.getElementById('notes-container');
const searchInput = document.getElementById('searchInput');
const navItems = document.querySelectorAll('.nav-item');
const categoryItems = document.querySelectorAll('.category-item');
const notesCount = document.getElementById('notes-count');
const addNoteBtn = document.getElementById('addNoteBtn');
const noteModal = document.getElementById('noteModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const saveAsPdfBtn = document.getElementById('saveAsPdfBtn');
const modalTitle = document.getElementById('modalTitle');
const noteForm = document.getElementById('noteForm');
const noteTitle = document.getElementById('noteTitle');
const noteCategory = document.getElementById('noteCategory');
const noteContent = document.getElementById('noteContent');
const noteFavorite = document.getElementById('noteFavorite');
const tagsContainer = document.getElementById('tagsContainer');
const tagInput = document.getElementById('tagInput');
const formatButtons = document.querySelectorAll('.format-btn');
const khmerFontButtons = document.querySelectorAll('.khmer-font-btn');
const downloadHistoryList = document.getElementById('downloadHistoryList');
const clearDownloadsBtn = document.getElementById('clearDownloadsBtn');

// State variables
let currentFilter = 'all';
let currentCategory = 'all';
let searchQuery = '';
let currentNoteId = null;
let tags = [];
let isEditing = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    renderNotes();
    renderDownloadHistory();
    setupEventListeners();

    // Save initial download history to localStorage
    localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
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
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderNotes();
        });
    });
    // Category items
    categoryItems.forEach(item => {
        item.addEventListener('click', function () {
            categoryItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            renderNotes();
        });
    });

    // Add note button
    addNoteBtn.addEventListener('click', openAddNoteModal);

    // Modal buttons
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Save note button
    saveNoteBtn.addEventListener('click', saveNote);

    // Save as PDF button
    saveAsPdfBtn.addEventListener('click', saveNoteAsPDF);

    // Formatting buttons
    formatButtons.forEach(button => {
        button.addEventListener('click', function () {
            const command = this.dataset.command;
            document.execCommand(command, false, null);
            this.classList.toggle('active');
            noteContent.focus();
        });
    });

    // Khmer font buttons
    khmerFontButtons.forEach(button => {
        button.addEventListener('click', function () {
            const font = this.dataset.font;
            applyKhmerFont(font);
        });
    });

    // Tag input
    tagInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(this.value.trim());
            this.value = '';
        }
    });

    // Clear downloads button
    clearDownloadsBtn.addEventListener('click', clearDownloadHistory);

    // Close modal on outside click
    window.addEventListener('click', function (e) {
        if (e.target === noteModal) {
            closeModal();
        }
    });
}

// Open the add note modal
function openAddNoteModal() {
    resetForm();
    modalTitle.textContent = 'Add New Note';
    noteModal.style.display = 'flex';
    noteTitle.focus();
    isEditing = false;
}

// Close the modal
function closeModal() {
    noteModal.style.display = 'none';
}

// Reset the form
function resetForm() {
    noteForm.reset();
    noteContent.innerHTML = '';
    tags = [];
    renderTags();
    currentNoteId = null;
    noteFavorite.checked = false;
}

// Add a tag
function addTag(tagText) {
    if (tagText && !tags.includes(tagText)) {
        tags.push(tagText);
        renderTags();
    }
}

// Remove a tag
function removeTag(index) {
    tags.splice(index, 1);
    renderTags();
}
// Render tags in the tags container
function renderTags() {
    // Clear existing tags except the input
    const tagElements = tagsContainer.querySelectorAll('.tag-item');
    tagElements.forEach(tag => tag.remove());

    // Add tags
    tags.forEach((tag, index) => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
                    ${tag}
                    <span class="tag-remove" data-index="${index}">&times;</span>
                `;
        tagsContainer.insertBefore(tagElement, tagInput);
    });
    // Add event listeners to remove buttons
    const removeButtons = tagsContainer.querySelectorAll('.tag-remove');
    removeButtons.forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.dataset.index);
            removeTag(index);
        });
    });
}

// Apply Khmer font styling
function applyKhmerFont(fontType) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        if (fontType === 'dok') {
            span.className = 'Khmer-font-dok';
        }
        else
            if (fontType === 'trey') {
                span.className = 'Khmer-font-trey';
            }
        span.textContent = range.toString();
        range.deleteContents();
        range.insertNode(span);

        // Move cursor to after the inserted span
        const newRange = document.createRange();
        newRange.setStartAfter(span);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

    }
    noteContent.focus();
}

// Save a new note
function saveNote() {
    // Validate form
    if (!noteTitle.value.trim()) {
        alert('Please enter a title for your note.');
        noteTitle.focus();
        return;
    }

    if (!noteContent.textContent.trim()) {
        alert('Please enter content for your note.');
        noteContent.focus();
        return;
    }

    // Create note object
    const newNote = {
        id: isEditing ? currentNoteId : notesData.length > 0 ? Math.max(...notesData.map(n => n.id)) + 1 : 1,
        title: noteTitle.value,
        date: getCurrentDate(),
        category: noteCategory.value,
        content: noteContent.innerHTML,
        tags: [...tags],
        isFavorite: noteFavorite.checked
    };

    if (isEditing) {
        // Update existing note
        const index = notesData.findIndex(note => note.id === currentNoteId);
        if (index !== -1) {
            notesData[index] = newNote;
        }
    } else {
        // Add new note to the beginning of the array
        notesData.unshift(newNote);
    }

    // Save to localStorage
    localStorage.setItem('recentNotes', JSON.stringify(notesData));

    // Close modal and refresh notes
    closeModal();
    renderNotes();

    // Show success message
    alert(`Note "${newNote.title}" has been saved successfully!`);

}

// Save note as PDF
async function saveNoteAsPDF() {
    // Validate form
    if (!noteTitle.value.trim()) {
        alert('Please enter a title for your note before saving as PDF.');
        noteTitle.focus();
        return;
    }

    if (!noteContent.textContent.trim()) {
        alert('Please enter content for your note before saving as PDF.');
        noteContent.focus();
        return;
    }

    try {
        // Show loading message
        const originalText = saveAsPdfBtn.textContent;
        saveAsPdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        saveAsPdfBtn.disabled = true;

        // Create a temporary div to hold the note content for PDF generation
        const tempDiv = document.createElement('div');
        tempDiv.style.width = '210mm'; // A4 width
        tempDiv.style.padding = '20px';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.backgroundColor = 'white';

        // Add content to the temp div
        tempDiv.innerHTML = `
            <h1 style="color: #2c3e50; border-bottom: 2px solid #1a73e8; padding-bottom: 10px; margin-bottom: 20px;">
                ${noteTitle.value}
            </h1>
            <div style="margin-bottom: 15px; color: #7f8c8d;">
                <strong>Date:</strong> ${getCurrentDate()} | 
                <strong>Category:</strong> ${capitalizeFirstLetter(noteCategory.value)}
            </div>
            <div style="margin-bottom: 20px;">
                <strong>Tags:</strong> ${tags.map(tag => `<span style="background-color: #e3f2fd; color: #1a73e8; padding: 3px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px;">${tag}</span>`).join('')}
            </div>
            <div style="border-top: 1px solid #eaeaea; padding-top: 20px;">
                ${noteContent.innerHTML}
            </div>
            <div style="margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 10px; font-size: 12px; color: #7f8c8d; text-align: center;">
                Generated from Recent Notes App on ${new Date().toLocaleDateString()}
            </div>
        `;

        // Append to body (temporarily)
        document.body.appendChild(tempDiv);

        // Generate PDF using html2canvas and jsPDF
        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        // Remove temp div
        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Generate filename
        const fileName = generatePDFFileName(noteTitle.value);

        // Save the PDF
        pdf.save(fileName);

        // Create a new download history item
        const newDownload = {
            id: downloadHistory.length > 0 ? Math.max(...downloadHistory.map(d => d.id)) + 1 : 1,
            fileName: fileName,
            size: `${(pdf.output('blob').size / 1024).toFixed(1)} KB`,
            timeAgo: "Just now"
        };

        // Add to download history
        downloadHistory.unshift(newDownload);

        // Save download history to localStorage
        localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));

        // Update download history display
        renderDownloadHistory();

        // Show success message
        alert(`PDF "${fileName}" has been saved successfully!`);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('There was an error generating the PDF. Please try again.');
    } finally {
        // Reset button state
        saveAsPdfBtn.innerHTML = originalText;
        saveAsPdfBtn.disabled = false;
    }
}

// Generate PDF file name
function generatePDFFileName(title) {
    // Clean the title for filename
    const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    let fileName = `${cleanTitle}.pdf`;
    let counter = 1;

    // Check if filename already exists in download history
    while (downloadHistory.some(d => d.fileName === fileName)) {
        fileName = `${cleanTitle} (${counter}).pdf`;
        counter++;
    }

    return fileName;
}

// Save note to PDF directly from note card
async function saveNoteToPDF(noteId) {
    const note = notesData.find(note => note.id === noteId);
    if (!note) return;

    let originalText = '';
    let button;

    try {
        // Show loading message
        button = document.querySelector(`.action-btn-pdf[data-id="${noteId}"]`);
        originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        button.disabled = true;

        // Create a temporary div to hold the note content for PDF generation
        const tempDiv = document.createElement('div');
        tempDiv.style.width = '210mm'; // A4 width
        tempDiv.style.padding = '20px';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.backgroundColor = 'white';

        // Add content to the temp div
        tempDiv.innerHTML = `
            <h1 style="color: #2c3e50; border-bottom: 2px solid #1a73e8; padding-bottom: 10px; margin-bottom: 20px;">
                ${note.title}
            </h1>
            <div style="margin-bottom: 15px; color: #7f8c8d;">
                <strong>Date:</strong> ${note.date} | 
                <strong>Category:</strong> ${capitalizeFirstLetter(note.category)}
            </div>
            <div style="margin-bottom: 20px;">
                <strong>Tags:</strong> ${note.tags.map(tag => `<span style="background-color: #e3f2fd; color: #1a73e8; padding: 3px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px;">${tag}</span>`).join('')}
            </div>
            <div style="border-top: 1px solid #eaeaea; padding-top: 20px;">
                ${note.content}
            </div>
            <div style="margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 10px; font-size: 12px; color: #7f8c8d; text-align: center;">
            Generated from Recent Notes App on ${new Date().toLocaleDateString()}
            </div>
       `;

        // Append to body (temporarily)
        document.body.appendChild(tempDiv);

        // Generate PDF using html2canvas and jsPDF
        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        // Remove temp div
        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Generate filename
        const fileName = generatePDFFileName(note.title);

        // Save the PDF
        pdf.save(fileName);

        // Create a new download history item
        const newDownload = {
            id: downloadHistory.length > 0 ? Math.max(...downloadHistory.map(d => d.id)) + 1 : 1,
            fileName: fileName,
            size: `${(pdf.output('blob').size / 1024).toFixed(1)} KB`,
            timeAgo: "Just now"
        };

        // Add to download history
        downloadHistory.unshift(newDownload);

        // Save download history to localStorage
        localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));

        // Update download history display
        renderDownloadHistory();

        // Show success message
        alert(`PDF "${fileName}" has been saved successfully!`);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('There was an error generating the PDF. Please try again.');
    } finally {
        // Reset button state
        if (button) {
        button.innerHTML = originalText;
        button.disabled = false;
        }
    }
}

// Get current date in formatted string
function getCurrentDate() {
    const now = new Date();
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return now.toLocaleDateString('en-US', options);
}

// Render download history
function renderDownloadHistory() {
    // Clear container
    downloadHistoryList.innerHTML = '';

    // Show empty state if no downloads
    if (downloadHistory.length === 0){
        downloadHistoryList.innerHTML = `
            <div class="empty-state" style="padding: 20px;">
                <i class="fas fa-download"></i>
                <p>No downloads yet</p>
            </div>
        `; 
        return;
    }
    // Render each download item
    downloadHistory.forEach(download =>{
        const downloadItem = document.createElement('div');
        downloadItem.className = 'download-item';
        downloadItem.dataset.id = download.id;

        downloadItem.innerHTML = `
            <div class="download-item-info">
                <div class="download-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div class="download-details">
                    <h4>${download.fileName}</h4>
                    <p>${download.size}</p>
                </div>
            </div>
            <div class="download-time">${download.timeAgo}</div>
        `; 
        downloadHistoryList.appendChild(downloadItem);
    });

}
// Clear download history
function clearDownloadHistory(){
    if (downloadHistory.length === 0){
        alert('Download history is already empty.');
        return;
    }
    if (confirm('Are you sure you want to clear all download history?')){
        downloadHistory = [];
        localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
        renderDownloadHistory();
        alert('Download history cleared successfully.');
    }
}
// Render note based on curremt fillers
function renderNotes(){
    //Clear container
    notesContainer.innerHTML = '';

    // Filter notes
    let filteredNotes = notesData.filter(note => {
        // Apply search filter
        if (searchQuery) {
            const searchContent = note.title.toLowerCase() + ' ' + 
                                 note.content.toLowerCase() + ' ' + 
                                 note.tags.join(' ').toLowerCase();
            if (!searchContent.includes(searchQuery)) {
                return false;
            }
        }
        // Apply favorites filter
        if (currentFilter === 'favorites' && ! note.isFavorite){
            return false;
        }

        // Apply category filter
        if (currentCategory !== 'all' && note.category !== currentCategory ){
            return false;
        }
        return true;
    });
    // Update notes count
    notesCount.textContent = `Showing ${filteredNotes.length} note${filteredNotes.length !== 1 ? 's' : ''}`;

    // Show empty state if no notes
    if (filteredNotes.length === 0){
        notesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <h3>No notes found</h3>
                <p>${searchQuery || currentFilter !== 'all' || currentCategory !== 'all' ? 'Try adjusting your search or filter to find what you\'re looking for.' : 'Create your first note by clicking the "Add Note" button above!'}</p>
                ${!searchQuery && currentFilter === 'all' && currentCategory === 'all' ? 
                    '<button class="btn-empty-state" id="addNoteFromEmpty"><i class="fas fa-plus"></i> Create Your First Note</button>' : ''}
            </div>
        `;
        // Add event listener to the empty state button
        const addNoteFromEmpty = document.getElementById('addNoteFromEmpty');
        if (addNoteFromEmpty){
            addNoteFromEmpty.addEventListener('click', openAddNoteModal);
        }
        return;
    }
    // Sort by date (newest first)
    filteredNotes.sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));


    // Render each note
    filteredNotes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        noteElement.dataset.id = note.id;

        //Highlight search terms in title and content
        let displayTitle = note.title;
        let displayContent = note.content;

        if (searchQuery){
            displayTitle = highlightText(displayTitle, searchQuery);
            displayContent = highlightText(displayContent,searchQuery);
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
                <div class="note-tags">${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}</div>
                <div class="note-card-actions">
                    <button class="action-btn action-btn-edit" data-id="${note.id}" data-action="edit">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn action-btn-pdf" data-id="${note.id}" data-action="pdf">
                        <i class="fas fa-file-pdf"></i> Save to PDF
                    </button>
                    <button class="action-btn action-btn-delete" data-id="${note.id}" data-action="delete">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        notesContainer.appendChild(noteElement);
    });

    // Add event listeners to favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(){
            const noteId = parseInt(this.dataset.id);
            toggleFavorite(noteId);
        });
    });
    //Add event listeners to edit buttons
    document.querySelectorAll('.action-btn-edit').forEach(btn => {
        btn.addEventListener('click', function(){
            const noteId = parseInt(this.dataset.id);
            editNote(noteId);
        });
    });
    // Add event listeners to PDF buttons
    document.querySelectorAll('.action-btn-pdf').forEach(btn =>{
        btn.addEventListener('click', function(){
            const noteId = parseInt(this.dataset.id);
            saveNoteToPDF(noteId);
        });
    });
    //Add event listeners to delete buttons 
    document.querySelectorAll('.action-btn-delete').forEach(btn =>{
        btn.addEventListener('click', function(){
            const noteId = parseInt(this.dataset.id);
            deleteNote(noteId);
        });
    });

}
// Toggle favorite status
function toggleFavorite(noteId){
    const noteIndex = notesData.findIndex(note => note.id === noteId);
    if (noteIndex !== -1) {
        notesData[noteIndex].isFavorite = !notesData[noteIndex].isFavorite;
        
        // Save to localStorage
        localStorage.setItem('recentNotes', JSON.stringify(notesData));
        
        renderNotes();
    }
}
// Edit an existing note
function editNote(noteId){
    const note = notesData.find(note => note.id === noteId);
    if (!note) return;

    noteTitle.value = note.title;
    noteCategory.value = note.category;
    noteContent.innerHTML = note.content;
    noteFavorite.checked = note.isFavorite;
    tags = [...note.tags];

    renderTags();
    modalTitle.textContent = 'Edit Note';
    noteModal.style.display = 'flex';

    currentNoteId = noteId; 
    isEditing = true;
}

// Delete a note
function deleteNote(noteId){
    const note = notesData.find(note => note.id === noteId);
    if (!note) return;
    if (confirm(`Are you sure you want to delete "${note.title}"? This action cannot be undone.`)) {
        // Remove note from data
        notesData = notesData.filter(note => note.id !== noteId);
        
        // Save to localStorage
        localStorage.setItem('recentNotes', JSON.stringify(notesData));
        
        // Re-render notes
        renderNotes();
        
        // Show success message
        alert(`Note "${note.title}" has been deleted successfully.`);
    }
}
// Highlight search terms in text
function highlightText(text, query){
    if (!query) return text;
    // Create a regex that matches the query, ignoring HTML tags
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    // Only highlight text outside HTML tags
        return text.replace(/(<[^>]*>)|([^<]+)/g, function(match, tag, text) {
            if (tag) return tag;
            if (text) return text.replace(regex, '<span class="highlight">$1</span>');
            return match;
        });
}
// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

