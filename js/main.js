
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
let currentCategiiry = 'all';
let searchQuery = '';
let currentNotedId = null;
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
    currentNotedId = null;
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

    try {
        // Show loading message
        const button = document.querySelector(`.action-btn-pdf[data-id="${noteId}"]`);
        const originalText = button.innerHTML;
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
        const button = document.querySelector(`.action-btn-pdf[data-id="${noteId}"]`);
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

