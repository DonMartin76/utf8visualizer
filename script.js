// Get DOM elements
const textInput = document.getElementById('textInput');
const tableBody = document.getElementById('tableBody');
const charCount = document.getElementById('charCount');

// HTML entities map (character -> entity name)
let htmlEntitiesMap = {};

// Fetch and process HTML entities with caching
async function loadHtmlEntities() {
    const CACHE_KEY = 'htmlEntities';
    const CACHE_TIMESTAMP_KEY = 'htmlEntitiesTimestamp';
    const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    
    try {
        // Check if we have cached data
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        const now = Date.now();
        
        // Use cache if it exists and is less than a week old
        if (cachedData && cachedTimestamp && (now - parseInt(cachedTimestamp)) < CACHE_DURATION) {
            const data = JSON.parse(cachedData);
            buildEntitiesMap(data);
            return;
        }
        
        // Fetch fresh data
        const response = await fetch('https://html.spec.whatwg.org/entities.json');
        const data = await response.json();
        
        // Cache the data
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
        
        buildEntitiesMap(data);
    } catch (err) {
        console.warn('Could not load HTML entities:', err);
    }
}

// Build the reverse map from entities data
function buildEntitiesMap(data) {
    htmlEntitiesMap = {};
    for (const [entity, info] of Object.entries(data)) {
        // Skip entities without trailing semicolon
        if (!entity.endsWith(';')) {
            continue;
        }
        
        const char = info.characters;
        const existing = htmlEntitiesMap[char];
        
        // Prefer lowercase entities, then shorter names
        if (!existing) {
            htmlEntitiesMap[char] = entity;
        } else {
            const entityLower = entity.toLowerCase();
            const existingLower = existing.toLowerCase();
            
            // If one is lowercase and the other isn't, prefer lowercase
            if (entity === entityLower && existing !== existingLower) {
                htmlEntitiesMap[char] = entity;
            } else if (entity !== entityLower && existing === existingLower) {
                // Keep existing lowercase
            } else {
                // Both same case, prefer shorter
                if (entity.length < existing.length) {
                    htmlEntitiesMap[char] = entity;
                }
            }
        }
    }
}

// Load entities on page load
loadHtmlEntities();

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
    
    // Use Array.from or spread operator to properly handle multi-byte characters like emojis
    const characters = Array.from(text);
    const length = characters.length;
    
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
    
    // Create named HTML entity row
    const namedEntityRow = document.createElement('tr');
    namedEntityRow.className = 'named-entity-row';
    
    // Process each character
    for (let i = 0; i < length; i++) {
        const char = characters[i];
        const codePoint = char.codePointAt(0);
        
        // Check if this is an invisible modifier/control character
        const isInvisibleModifier = (
            (codePoint >= 0xFE00 && codePoint <= 0xFE0F) || // Variation selectors
            (codePoint >= 0xE0100 && codePoint <= 0xE01EF) || // Variation selectors supplement
            codePoint === 0x200D || // Zero-width joiner
            codePoint === 0x200C || // Zero-width non-joiner
            (codePoint >= 0x1F3FB && codePoint <= 0x1F3FF) // Skin tone modifiers
        );
        
        // Character cell
        const charCell = document.createElement('td');
        charCell.textContent = isInvisibleModifier ? '*' : char;
        charRow.appendChild(charCell);
        
        // UTF-8 code cell
        const utfCell = document.createElement('td');
        utfCell.textContent = getUtf8Codes(char);
        utfRow.appendChild(utfCell);
        
        // HTML entity cell
        const entityCell = document.createElement('td');
        entityCell.textContent = `&#${codePoint};`;
        entityRow.appendChild(entityCell);
        
        // Named HTML entity cell
        const namedEntityCell = document.createElement('td');
        const namedEntity = htmlEntitiesMap[char];
        namedEntityCell.textContent = namedEntity || '';
        namedEntityRow.appendChild(namedEntityCell);
    }
    
    // Append rows to table
    tableBody.appendChild(charRow);
    tableBody.appendChild(utfRow);
    tableBody.appendChild(entityRow);
    tableBody.appendChild(namedEntityRow);
}

// Add event listener for input changes
textInput.addEventListener('input', updateDisplay);

// Initialize display
updateDisplay();
