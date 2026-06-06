// ============================================
//  POWERSHELL EBOOK - JAVASCRIPT v3.1 FINAL
//  Fixed: URL hash navigation and initial load
// ============================================

// Global Variables
let currentChapter = 1;
let completedChapters = [];
let bookmarks = [];
let currentFontSize = 16;
let isDarkMode = false;

// ============================================
//  INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 PowerShell eBook JavaScript Loaded - Version 3.1');
    initializeEbook();
});

function initializeEbook() {
    console.log('🚀 PowerShell eBook v3.1');
    
    // Load saved preferences
    loadProgress();
    loadTheme();
    loadFontSize();
    loadBookmarks();
    
    // Initialize chapter based on URL hash or default to intro
    const urlHash = window.location.hash.substring(1); // Remove the '#'
    const targetChapter = urlHash || 'intro'; // Default to 'intro' if no hash
    
    const chapterElement = document.getElementById(targetChapter);
    if (chapterElement) {
        showChapter(targetChapter);
    } else {
        // If target chapter doesn't exist, fall back to intro
        console.log(`⏳ Chapter "${targetChapter}" not found, loading intro...`);
        const introChapter = document.getElementById('intro');
        if (introChapter) {
            showChapter('intro');
            // Update URL to reflect actual chapter shown
            window.location.hash = '#intro';
        }
    }
    
    // Listen for hash changes (browser back/forward buttons)
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            showChapter(hash);
        }
    });
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Setup scroll to top button
    setupScrollToTop();
    
    console.log('✅ All functions loaded successfully!');
    console.log('Keyboard Shortcuts:');
    console.log('  Ctrl+K: Search');
    console.log('  Ctrl+D: Dark Mode');
    console.log('  Ctrl++: Increase Font');
    console.log('  Ctrl+-: Decrease Font');
    console.log('  Arrow Keys: Navigate Chapters');
}

// ============================================
//  PROGRESS MANAGEMENT
// ============================================

function loadProgress() {
    try {
        const saved = localStorage.getItem('completedChapters');
        if (saved) {
            completedChapters = JSON.parse(saved);
            if (!Array.isArray(completedChapters)) {
                completedChapters = [];
            }
        } else {
            completedChapters = [];
        }
        
        const lastChapter = localStorage.getItem('currentChapter');
        if (lastChapter) {
            currentChapter = parseInt(lastChapter) || 1;
        }
        
        updateProgress();
    } catch (error) {
        console.error('Error loading progress:', error);
        completedChapters = [];
        currentChapter = 1;
    }
}

function saveProgress() {
    try {
        localStorage.setItem('completedChapters', JSON.stringify(completedChapters));
        localStorage.setItem('currentChapter', currentChapter.toString());
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

function updateProgress() {
    const totalChapters = 18;
    const completed = completedChapters.length;
    const percentage = Math.round((completed / totalChapters) * 100);
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    
    if (progressText) {
        progressText.textContent = `Progress: ${completed}/${totalChapters} chapters (${percentage}%)`;
    }
    
    // Update sidebar
    updateSidebarProgress();
}

function updateSidebarProgress() {
    const sidebarLinks = document.querySelectorAll('.toc-chapters a');
    
    if (!sidebarLinks || sidebarLinks.length === 0) {
        return; // Silently return if no links found
    }
    
    sidebarLinks.forEach((link, index) => {
        if (!link) return;
        
        const chapterNum = index + 1;
        
        if (completedChapters.includes(chapterNum)) {
            link.classList.add('completed');
            
            if (!link.querySelector('.checkmark')) {
                const checkmark = document.createElement('span');
                checkmark.className = 'checkmark';
                checkmark.textContent = ' ✓';
                checkmark.style.color = '#10b981';
                checkmark.style.fontWeight = 'bold';
                link.appendChild(checkmark);
            }
        }
    });
}

function markChapterAsRead(chapterNum) {
    if (!completedChapters.includes(chapterNum)) {
        completedChapters.push(chapterNum);
        saveProgress();
        updateProgress();
        showNotification(`Chapter ${chapterNum} completed! 🎉`, 'success');
    }
}

// ============================================
//  CHAPTER NAVIGATION - FIXED WITH URL HASH
// ============================================

function showChapter(chapterId) {
    console.log('Showing chapter:', chapterId);
    
    // Hide all chapters
    const allChapters = document.querySelectorAll('.chapter');
    allChapters.forEach(chapter => {
        chapter.classList.remove('active');
        chapter.style.display = 'none';
    });
    
    // Remove active from all sidebar links
    const allLinks = document.querySelectorAll('.toc-chapters a');
    allLinks.forEach(link => {
        if (link) link.classList.remove('active');
    });
    
    // Show target chapter
    const targetChapter = document.getElementById(chapterId);
    
    if (targetChapter) {
        targetChapter.classList.add('active');
        targetChapter.style.display = 'block';
        
        // Extract chapter number
        const chapterNum = parseInt(chapterId.split('-')[1]);
        if (!isNaN(chapterNum)) {
            currentChapter = chapterNum;
            saveProgress();
            
            // Mark as read after 3 seconds
            setTimeout(() => {
                markChapterAsRead(chapterNum);
            }, 3000);
        }
        
        // Update sidebar active state
        const activeLink = document.querySelector(`a[href="#${chapterId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Scroll to top
        const contentArea = document.querySelector('.content');
        if (contentArea) {
            contentArea.scrollTop = 0;
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Update URL hash without triggering hashchange event
        if (window.location.hash !== '#' + chapterId) {
            history.pushState(null, null, '#' + chapterId);
        }
    } else {
        // Don't show error notification on initial load
        if (chapterId !== 'chapter-1' && chapterId !== 'intro') {
            console.error('Chapter not found:', chapterId);
            showNotification('Chapter not found!', 'error');
        }
    }
}

function nextChapter() {
    if (currentChapter < 18) {
        showChapter('chapter-' + (currentChapter + 1));
    } else {
        showNotification('You are on the last chapter!', 'info');
    }
}

function previousChapter() {
    if (currentChapter > 1) {
        showChapter('chapter-' + (currentChapter - 1));
    } else {
        showNotification('You are on the first chapter!', 'info');
    }
}

// ============================================
//  THEME MANAGEMENT
// ============================================

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    const emoji = isDarkMode ? '☀️' : '🌙';
    const mode = isDarkMode ? 'Dark' : 'Light';
    showNotification(`${emoji} ${mode} mode enabled`, 'info');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        document.body.classList.add('dark-mode');
        isDarkMode = true;
    }
}

// ============================================
//  FONT SIZE MANAGEMENT
// ============================================

function adjustFontSize(action) {
    currentFontSize = parseInt(localStorage.getItem('fontSize')) || 16;
    
    if (action === 'increase' && currentFontSize < 24) {
        currentFontSize += 2;
    } else if (action === 'decrease' && currentFontSize > 12) {
        currentFontSize -= 2;
    } else {
        return;
    }
    
    document.documentElement.style.fontSize = currentFontSize + 'px';
    localStorage.setItem('fontSize', currentFontSize);
    showNotification(`Font size: ${currentFontSize}px`, 'info');
}

function loadFontSize() {
    const savedSize = localStorage.getItem('fontSize');
    if (savedSize) {
        currentFontSize = parseInt(savedSize);
        document.documentElement.style.fontSize = currentFontSize + 'px';
    }
}

// ============================================
//  SIDEBAR TOGGLE
// ============================================

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    
    if (sidebar && content) {
        sidebar.classList.toggle('collapsed');
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            sidebar.style.transform = 'translateX(-100%)';
            content.style.marginLeft = '0';
        } else {
            sidebar.style.transform = 'translateX(0)';
            content.style.marginLeft = '300px';
        }
        
        showNotification(isCollapsed ? 'Sidebar hidden' : 'Sidebar shown', 'info');
    }
}

// ============================================
//  CODE COPY FUNCTIONALITY
// ============================================

function copyCode(button) {
    try {
        // Find the code element
        const codeBlock = button.closest('.code-block');
        const codeElement = codeBlock ? codeBlock.querySelector('code') : null;
        
        if (!codeElement) {
            showNotification('Code not found!', 'error');
            return;
        }
        
        const code = codeElement.textContent;
        
        // Copy to clipboard
        navigator.clipboard.writeText(code).then(() => {
            // Visual feedback
            const originalText = button.textContent;
            button.textContent = '✓ Copied!';
            button.classList.add('copied');
            
            showNotification('Code copied to clipboard!', 'success');
            
            // Reset button after 2 seconds
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            showNotification('Failed to copy code', 'error');
        });
    } catch (error) {
        console.error('Error in copyCode:', error);
        showNotification('Error copying code', 'error');
    }
}

// ============================================
//  SHOW/HIDE ANSWER
// ============================================
// ============================================
//  SHOW/HIDE ANSWER - UNIVERSAL (v3.1)
// ============================================

function toggleAnswer(param) {
    let answerElement, button;
    
    // Check if param is a string (ID) or an element (button)
    if (typeof param === 'string') {
        // Pattern 1: ID-based like toggleAnswer('ch2-q7')
        answerElement = document.getElementById(param);
        button = document.querySelector(`[onclick*="toggleAnswer('${param}')"]`);
    } else {
        // Pattern 2: Element-based like toggleAnswer(this)
        button = param;
        
        // Find the next sibling with class 'quiz-answer' or 'answer'
        let nextElement = button.nextElementSibling;
        while (nextElement) {
            if (nextElement.classList.contains('quiz-answer') || 
                nextElement.classList.contains('answer')) {
                answerElement = nextElement;
                break;
            }
            nextElement = nextElement.nextElementSibling;
        }
        
        // Fallback: search within parent
        if (!answerElement) {
            answerElement = button.parentElement.querySelector('.quiz-answer, .answer');
        }
    }
    
    if (!answerElement) {
        console.error('Answer element not found for:', param);
        return;
    }
    
    // Toggle visibility
    const isHidden = answerElement.style.display === 'none' || !answerElement.style.display;
    
    if (isHidden) {
        answerElement.style.display = 'block';
        if (button) {
            button.textContent = '👁️ Hide Answer';
            button.classList.add('active');
        }
    } else {
        answerElement.style.display = 'none';
        if (button) {
            button.textContent = '👁️ Show Answer';
            button.classList.remove('active');
        }
    }
}

// ============================================
//  NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ============================================
//  KEYBOARD SHORTCUTS
// ============================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+K: Search
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) searchInput.focus();
        }
        
        // Ctrl+D: Dark Mode
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Ctrl++: Increase Font
        if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            adjustFontSize('increase');
        }
        
        // Ctrl+-: Decrease Font
        if (e.ctrlKey && e.key === '-') {
            e.preventDefault();
            adjustFontSize('decrease');
        }
        
        // Arrow Right: Next Chapter
        if (e.key === 'ArrowRight' && !e.ctrlKey && !e.shiftKey) {
            const activeElement = document.activeElement;
            if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                nextChapter();
            }
        }
        
        // Arrow Left: Previous Chapter
        if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.shiftKey) {
            const activeElement = document.activeElement;
            if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                previousChapter();
            }
        }
    });
}

// ============================================
//  SCROLL TO TOP
// ============================================

function setupScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.onclick = () => {
        const contentArea = document.querySelector('.content');
        if (contentArea) {
            contentArea.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    document.body.appendChild(scrollBtn);
    
    // Show/hide based on scroll
    const contentArea = document.querySelector('.content') || window;
    const scrollElement = contentArea === window ? window : contentArea;
    
    scrollElement.addEventListener('scroll', function() {
        const scrollTop = contentArea === window ? window.pageYOffset : contentArea.scrollTop;
        if (scrollTop > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
}

// ============================================
//  BOOKMARKS
// ============================================

function loadBookmarks() {
    try {
        const saved = localStorage.getItem('bookmarks');
        if (saved) {
            bookmarks = JSON.parse(saved);
            if (!Array.isArray(bookmarks)) {
                bookmarks = [];
            }
        }
    } catch (error) {
        console.error('Error loading bookmarks:', error);
        bookmarks = [];
    }
}

function toggleBookmark(chapterNum) {
    const index = bookmarks.indexOf(chapterNum);
    
    if (index > -1) {
        bookmarks.splice(index, 1);
        showNotification('Bookmark removed', 'info');
    } else {
        bookmarks.push(chapterNum);
        showNotification('Chapter bookmarked!', 'success');
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

// ============================================
//  PROGRESS EXPORT/IMPORT
// ============================================

function exportProgress() {
    const data = {
        completedChapters: completedChapters,
        currentChapter: currentChapter,
        bookmarks: bookmarks,
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'powershell-ebook-progress.json';
    a.click();
    
    showNotification('Progress exported!', 'success');
}

function importProgress() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.completedChapters) completedChapters = data.completedChapters;
                if (data.currentChapter) currentChapter = data.currentChapter;
                if (data.bookmarks) bookmarks = data.bookmarks;
                
                saveProgress();
                updateProgress();
                
                showNotification('Progress imported successfully!', 'success');
            } catch (error) {
                showNotification('Invalid progress file!', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        completedChapters = [];
        currentChapter = 1;
        bookmarks = [];
        
        localStorage.removeItem('completedChapters');
        localStorage.removeItem('currentChapter');
        localStorage.removeItem('bookmarks');
        
        updateProgress();
        showChapter('intro');
        
        showNotification('Progress reset successfully!', 'success');
    }
}

// ============================================
//  SEARCH FUNCTIONALITY
// ============================================

function performSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length < 3) {
        showNotification('Please enter at least 3 characters', 'warning');
        return;
    }
    
    const chapters = document.querySelectorAll('.chapter');
    let found = false;
    
    chapters.forEach(chapter => {
        const text = chapter.textContent.toLowerCase();
        if (text.includes(query)) {
            const chapterId = chapter.id;
            showChapter(chapterId);
            found = true;
            showNotification(`Found in ${chapterId}`, 'success');
            return;
        }
    });
    
    if (!found) {
        showNotification('No results found', 'warning');
    }
}

// ============================================
//  PRINT FUNCTIONALITY
// ============================================

function printChapter() {
    window.print();
}

// ============================================
//  MOBILE MENU - FIXED
// ============================================

// Toggle mobile menu
function toggleMenu() {
    const nav = document.getElementById('headerNav');
    if (nav) {
        nav.classList.toggle('active');
    }
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const nav = document.getElementById('headerNav');
    if (nav && !event.target.closest('header') && nav.classList.contains('active')) {
        nav.classList.remove('active');
    }
});

// Console welcome message
console.log('%c📚 PowerShell eBook v3.1', 'color: #0078D4; font-size: 20px; font-weight: bold;');
console.log('%c✨ All systems ready! URL hash navigation enabled.', 'color: #10b981; font-size: 14px;');
