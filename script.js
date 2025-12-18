// Get DOM elements
const textInput = document.getElementById('textInput');
const tableBody = document.getElementById('tableBody');
const charCount = document.getElementById('charCount');

// Function to convert a character to UTF-8 hex codes
function getUtf8Codes(char) {
    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode(char);
    return Array.from(utf8Bytes)
        .map(byte => '0x' + byte.toString(16).toUpperCase().padStart(2, '0'))
        .join(' ');
}

// Function to update the table display
function updateDisplay() {
    const text = textInput.value;
    const length = text.length;
    
    // Update character count
    charCount.textContent = `${length} / 30 characters`;
    
    // Clear table body
    tableBody.innerHTML = '';
    
    // If empty, show message
    if (length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 100;
        emptyCell.className = 'empty-message';
        emptyCell.textContent = 'Enter text above to see UTF-8 codes';
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Create character row
    const charRow = document.createElement('tr');
    charRow.className = 'char-row';
    
    // Create UTF-8 code row
    const utfRow = document.createElement('tr');
    utfRow.className = 'utf-row';
    
    // Create HTML entity row
    const entityRow = document.createElement('tr');
    entityRow.className = 'entity-row';
    
    // Process each character
    for (let i = 0; i < length; i++) {
        const char = text[i];
        
        // Character cell
        const charCell = document.createElement('td');
        charCell.textContent = char;
        charRow.appendChild(charCell);
        
        // UTF-8 code cell
        const utfCell = document.createElement('td');
        utfCell.textContent = getUtf8Codes(char);
        utfRow.appendChild(utfCell);
        
        // HTML entity cell
        const entityCell = document.createElement('td');
        const codePoint = char.codePointAt(0);
        entityCell.textContent = `&#${codePoint};`;
        entityRow.appendChild(entityCell);
    }
    
    // Append rows to table
    tableBody.appendChild(charRow);
    tableBody.appendChild(utfRow);
    tableBody.appendChild(entityRow);
}

// Add event listener for input changes
textInput.addEventListener('input', updateDisplay);

// Initialize display
updateDisplay();
