// Global variables
let currentPath = '';
let fileTree = {};
let searchResults = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadDirectoryStructure();
    setupEventListeners();
});

function initializeApp() {
    // Set last updated timestamp
    const now = new Date();
    document.getElementById('last-updated').textContent = now.toLocaleString();

    // Update current path display
    updatePathDisplay();
}

function setupEventListeners() {
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Navigation
    document.getElementById('backBtn').addEventListener('click', goBack);
}

async function loadDirectoryStructure() {
    const fileListElement = document.getElementById('fileList');
    fileListElement.innerHTML = '<div class="loading"><div class="loading-spinner"></div> Loading repository structure...</div>';

    try {
        // This would normally fetch from GitHub API, but for now we'll simulate with local data
        const structure = await getDirectoryStructure('');
        fileTree = structure;
        renderDirectoryContents(structure);
    } catch (error) {
        console.error('Error loading directory structure:', error);
        fileListElement.innerHTML = '<div class="error-message">Error loading directory structure. Please check your connection.</div>';
    }
}

async function getDirectoryStructure(path) {
    // Since we can't directly access GitHub API from frontend, we'll create a simulated structure
    // In a real implementation, you'd fetch from GitHub API or serve a generated JSON file

    const simulatedStructure = {
        'metamask-mobile-main': {
            type: 'directory',
            children: {
                'README.md': { type: 'file', size: '12KB' },
                'package.json': { type: 'file', size: '8KB' },
                'app': {
                    type: 'directory',
                    children: {
                        'config.js': { type: 'file', size: '5KB' },
                        'core': {
                            type: 'directory',
                            children: {
                                'Engine.ts': { type: 'file', size: '25KB' },
                                'Vault.ts': { type: 'file', size: '18KB' }
                            }
                        },
                        'components': {
                            type: 'directory',
                            children: {
                                'UI': {
                                    type: 'directory',
                                    children: {}
                                }
                            }
                        }
                    }
                },
                'android': { type: 'directory', children: {} },
                'ios': { type: 'directory', children: {} }
            }
        }
    };

    return simulatedStructure;
}

function renderDirectoryContents(structure) {
    const fileListElement = document.getElementById('fileList');
    fileListElement.innerHTML = '';

    if (!structure || Object.keys(structure).length === 0) {
        fileListElement.innerHTML = '<div class="file-item">No files or directories found</div>';
        return;
    }

    Object.keys(structure).sort((a, b) => {
        // Directories first, then files, both alphabetically
        const aIsDir = structure[a].type === 'directory';
        const bIsDir = structure[b].type === 'directory';

        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;

        return a.localeCompare(b);
    }).forEach(name => {
        const item = structure[name];
        const fileItem = document.createElement('div');
        fileItem.className = `file-item ${item.type}`;
        fileItem.onclick = () => handleFileClick(name, item);

        const icon = item.type === 'directory' ? '📁' : getFileIcon(name);
        const size = item.size || '';

        fileItem.innerHTML = `
            <span class="file-icon">${icon}</span>
            <span class="file-name">${name}</span>
            <span class="file-size">${size}</span>
        `;

        fileListElement.appendChild(fileItem);
    });
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();

    const iconMap = {
        'js': '🟨',
        'ts': '🔷',
        'tsx': '⚛️',
        'json': '📄',
        'md': '📝',
        'py': '🐍',
        'java': '☕',
        'xml': '📋',
        'gradle': '⚙️',
        'png': '🖼️',
        'jpg': '🖼️',
        'svg': '🎨',
        'txt': '📄',
        'html': '🌐',
        'css': '🎨'
    };

    return iconMap[ext] || '📄';
}

function handleFileClick(name, item) {
    if (item.type === 'directory') {
        navigateToDirectory(name);
    } else {
        loadFileContent(name);
    }
}

function navigateToDirectory(dirname) {
    currentPath = currentPath ? `${currentPath}/${dirname}` : dirname;
    updatePathDisplay();

    // Navigate deeper into the structure
    let currentStructure = fileTree;
    const pathParts = currentPath.split('/');

    for (const part of pathParts) {
        if (currentStructure[part] && currentStructure[part].children) {
            currentStructure = currentStructure[part].children;
        }
    }

    renderDirectoryContents(currentStructure);
    document.getElementById('fileContent').innerHTML = '<p>Select a file to view its contents</p>';
}

function goBack() {
    if (!currentPath) return;

    const pathParts = currentPath.split('/');
    pathParts.pop();
    currentPath = pathParts.join('/');

    updatePathDisplay();

    // Navigate back in the structure
    let currentStructure = fileTree;
    const newPathParts = currentPath.split('/').filter(p => p);

    for (const part of newPathParts) {
        if (currentStructure[part] && currentStructure[part].children) {
            currentStructure = currentStructure[part].children;
        }
    }

    renderDirectoryContents(currentStructure);
    document.getElementById('fileContent').innerHTML = '<p>Select a file to view its contents</p>';
}

function updatePathDisplay() {
    document.getElementById('currentPath').textContent = currentPath || '/';
    document.getElementById('backBtn').disabled = !currentPath;
}

async function loadFileContent(filename) {
    const fileContentElement = document.getElementById('fileContent');
    fileContentElement.innerHTML = '<div class="loading"><div class="loading-spinner"></div> Loading file content...</div>';

    try {
        // In a real implementation, you'd fetch the file content from GitHub API
        // For this demo, we'll show simulated content
        const content = await getFileContent(currentPath, filename);
        displayFileContent(filename, content);
    } catch (error) {
        console.error('Error loading file content:', error);
        fileContentElement.innerHTML = '<div class="error-message">Error loading file content. Please try again.</div>';
    }
}

async function getFileContent(path, filename) {
    // Simulated file content - in real implementation, fetch from GitHub API
    const filePath = path ? `${path}/${filename}` : filename;

    // Return simulated content based on file type
    if (filename.endsWith('.md')) {
        return `# ${filename}\n\nThis is the content of ${filename} from the MetaMask mobile repository.\n\n## Overview\n\nThis file contains documentation for the MetaMask mobile application.\n\n## Features\n\n- Feature 1\n- Feature 2\n- Feature 3`;
    } else if (filename.endsWith('.json')) {
        return `{\n  "name": "metamask-mobile",\n  "version": "7.0.0",\n  "description": "MetaMask Mobile App",\n  "main": "index.js",\n  "scripts": {\n    "start": "react-native start",\n    "test": "jest"\n  }\n}`;
    } else if (filename.endsWith('.js') || filename.endsWith('.ts')) {
        return `// ${filename}\n\nimport React from 'react';\n\n/**\n * Component description\n */\nconst ${filename.replace(/\.[^/.]+$/, "")} = () => {\n  return (\n    <div>\n      <h1>Hello from ${filename}</h1>\n    </div>\n  );\n};\n\nexport default ${filename.replace(/\.[^/.]+$/, "")};`;
    } else {
        return `// This is simulated content for ${filename}\n// In a real implementation, this would be the actual file content\nfrom the MetaMask mobile repository.\n\nFile: ${filePath}\nSize: ~${Math.floor(Math.random() * 100) + 1}KB`;
    }
}

function displayFileContent(filename, content) {
    const fileContentElement = document.getElementById('fileContent');
    const ext = filename.split('.').pop().toLowerCase();

    // Basic syntax highlighting for common file types
    let highlightedContent = content;

    if (['js', 'ts', 'tsx', 'json'].includes(ext)) {
        highlightedContent = highlightCode(content, ext);
    }

    fileContentElement.innerHTML = `
        <div class="file-header">
            <strong>${filename}</strong>
            <span class="file-language">${getLanguageName(ext)}</span>
        </div>
        <pre class="code-content">${highlightedContent}</pre>
    `;
}

function highlightCode(code, language) {
    // Very basic syntax highlighting - in a real app, you'd use a proper library like Prism.js
    let highlighted = code
        .replace(/\/\/(.*)/g, '<span class="comment">//$1</span>')
        .replace(/\/\*([\s\S]*?)\*\//g, '<span class="comment">/*$1*/</span>')
        .replace(/(["'`])(.*?)\1/g, '<span class="string">$1$2$1</span>')
        .replace(/\b(const|let|var|function|class|import|export|from|return|if|else|for|while)\b/g, '<span class="keyword">$1</span>')
        .replace(/\b(true|false|null|undefined)\b/g, '<span class="boolean">$1</span>');

    return highlighted;
}

function getLanguageName(ext) {
    const languages = {
        'js': 'JavaScript',
        'ts': 'TypeScript',
        'tsx': 'TypeScript React',
        'py': 'Python',
        'java': 'Java',
        'json': 'JSON',
        'md': 'Markdown',
        'xml': 'XML',
        'html': 'HTML',
        'css': 'CSS'
    };

    return languages[ext] || 'Text';
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();

    if (!query) {
        renderDirectoryContents(fileTree);
        return;
    }

    // Simple search implementation - in real app, you'd search recursively
    const results = [];

    function searchInStructure(structure, currentPath = '') {
        Object.keys(structure).forEach(name => {
            const item = structure[name];
            const fullPath = currentPath ? `${currentPath}/${name}` : name;

            if (name.toLowerCase().includes(query)) {
                results.push({
                    name,
                    path: fullPath,
                    type: item.type,
                    size: item.size
                });
            }

            if (item.children) {
                searchInStructure(item.children, fullPath);
            }
        });
    }

    searchInStructure(fileTree);
    searchResults = results;
    renderSearchResults(results);
}

function renderSearchResults(results) {
    const fileListElement = document.getElementById('fileList');
    fileListElement.innerHTML = '';

    if (results.length === 0) {
        fileListElement.innerHTML = '<div class="file-item">No search results found</div>';
        return;
    }

    results.forEach(result => {
        const fileItem = document.createElement('div');
        fileItem.className = `file-item ${result.type}`;

        const icon = result.type === 'directory' ? '📁' : getFileIcon(result.name);
        const size = result.size || '';

        fileItem.innerHTML = `
            <span class="file-icon">${icon}</span>
            <span class="file-name">${result.name}</span>
            <span class="file-size">${size}</span>
            <small style="color: #6c757d; margin-left: 10px;">${result.path}</small>
        `;

        fileItem.onclick = () => {
            // Navigate to the directory containing this item
            const pathParts = result.path.split('/');
            pathParts.pop(); // Remove the filename
            const dirPath = pathParts.join('/');

            // This is a simplified navigation - real implementation would be more complex
            document.getElementById('fileContent').innerHTML = `<p>Found: ${result.path}</p><p>Type: ${result.type}</p>`;
        };

        fileListElement.appendChild(fileItem);
    });
}

// Add some basic CSS for syntax highlighting
const style = document.createElement('style');
style.textContent = `
    .comment { color: #6a737d; }
    .string { color: #032f62; }
    .keyword { color: #d73a49; font-weight: bold; }
    .boolean { color: #005cc5; }

    .file-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #e1e8ed;
    }

    .file-language {
        background: #667eea;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
    }

    .code-content {
        background: #f6f8fa;
        padding: 16px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 0;
    }
`;
document.head.appendChild(style);