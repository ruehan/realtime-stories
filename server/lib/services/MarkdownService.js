"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownService = void 0;
const marked_1 = require("marked");
const highlight_js_1 = __importDefault(require("highlight.js"));
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
const slugify_1 = __importDefault(require("slugify"));
const window = new jsdom_1.JSDOM('').window;
const purify = (0, dompurify_1.default)(window);
class MarkdownService {
    constructor() {
        this.tocItems = [];
        this.codeBlocks = [];
        this.languages = new Set();
        this.renderer = new marked_1.marked.Renderer();
        this.setupRenderer();
        this.setupMarked();
    }
    static getInstance() {
        if (!MarkdownService.instance) {
            MarkdownService.instance = new MarkdownService();
        }
        return MarkdownService.instance;
    }
    setupRenderer() {
        this.renderer.heading = (text, level) => {
            const anchor = (0, slugify_1.default)(text, { lower: true, strict: true });
            const id = `heading-${anchor}`;
            this.tocItems.push({
                id,
                title: text,
                level,
                anchor
            });
            return `<h${level} id="${id}" class="heading-${level}">
        <a href="#${anchor}" class="anchor-link" aria-hidden="true">#</a>
        ${text}
      </h${level}>`;
        };
        this.renderer.code = (code, language) => {
            this.codeBlocks.push(code);
            if (language) {
                this.languages.add(language);
                let highlightedCode = code;
                try {
                    if (highlight_js_1.default.getLanguage(language)) {
                        highlightedCode = highlight_js_1.default.highlight(code, { language }).value;
                    }
                }
                catch (error) {
                    console.warn(`Failed to highlight code for language: ${language}`, error);
                }
                return `<div class="code-block-container">
          <div class="code-block-header">
            <span class="code-language">${language}</span>
            <button class="copy-button" data-code="${this.escapeHtml(code)}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
          </div>
          <pre class="hljs"><code class="language-${language}">${highlightedCode}</code></pre>
        </div>`;
            }
            return `<div class="code-block-container">
        <div class="code-block-header">
          <button class="copy-button" data-code="${this.escapeHtml(code)}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          </button>
        </div>
        <pre class="hljs"><code>${this.escapeHtml(code)}</code></pre>
      </div>`;
        };
        this.renderer.codespan = (code) => {
            return `<code class="inline-code">${this.escapeHtml(code)}</code>`;
        };
        this.renderer.link = (href, title, text) => {
            const isExternal = href.startsWith('http') && !href.includes(process.env.DOMAIN || 'localhost');
            const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : '';
            const externalAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
            return `<a href="${this.escapeHtml(href)}"${titleAttr}${externalAttrs}>${text}</a>`;
        };
        this.renderer.image = (href, title, text) => {
            const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : '';
            const altAttr = ` alt="${this.escapeHtml(text)}"`;
            return `<figure class="image-figure">
        <img src="${this.escapeHtml(href)}"${altAttr}${titleAttr} loading="lazy" class="responsive-image">
        ${text ? `<figcaption>${text}</figcaption>` : ''}
      </figure>`;
        };
        this.renderer.table = (header, body) => {
            return `<div class="table-container">
        <table class="responsive-table">
          <thead>${header}</thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;
        };
        this.renderer.blockquote = (quote) => {
            return `<blockquote class="custom-blockquote">${quote}</blockquote>`;
        };
    }
    setupMarked() {
        marked_1.marked.setOptions({
            renderer: this.renderer,
            pedantic: false,
            gfm: true,
            breaks: false
        });
    }
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
    calculateReadingTime(markdown) {
        const wordsPerMinute = 200;
        const words = markdown.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }
    resetState() {
        this.tocItems = [];
        this.codeBlocks = [];
        this.languages.clear();
    }
    render(markdown, options = {}) {
        const { sanitize = true, generateTOC = true } = options;
        this.resetState();
        try {
            let html = marked_1.marked.parse(markdown);
            if (sanitize) {
                html = purify.sanitize(html, {
                    ALLOWED_TAGS: [
                        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                        'p', 'br', 'hr',
                        'strong', 'em', 'u', 's', 'sup', 'sub',
                        'ul', 'ol', 'li',
                        'blockquote',
                        'pre', 'code',
                        'a',
                        'img', 'figure', 'figcaption',
                        'table', 'thead', 'tbody', 'tr', 'th', 'td',
                        'div', 'span',
                        'svg', 'path', 'rect',
                        'button'
                    ],
                    ALLOWED_ATTR: [
                        'href', 'title', 'alt', 'src', 'loading',
                        'target', 'rel',
                        'id', 'class',
                        'data-code',
                        'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width',
                        'd'
                    ],
                    ALLOW_DATA_ATTR: true
                });
            }
            if (options.enableMermaid) {
                html = this.processMermaidDiagrams(html);
            }
            if (options.enableMath) {
                html = this.processMathExpressions(html);
            }
            return {
                html,
                toc: generateTOC ? this.tocItems : undefined,
                readingTime: this.calculateReadingTime(markdown),
                codeBlocks: this.codeBlocks,
                languages: Array.from(this.languages)
            };
        }
        catch (error) {
            console.error('Failed to render markdown:', error);
            throw new Error('Markdown rendering failed');
        }
    }
    processMermaidDiagrams(html) {
        return html.replace(/<pre class="hljs"><code class="language-mermaid">(.*?)<\/code><\/pre>/gs, '<div class="mermaid">$1</div>');
    }
    processMathExpressions(html) {
        html = html.replace(/\$\$(.*?)\$\$/gs, '<div class="math-block">$1</div>');
        html = html.replace(/\$(.*?)\$/g, '<span class="math-inline">$1</span>');
        return html;
    }
    extractCodeBlocks(markdown) {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const blocks = [];
        let match;
        while ((match = codeBlockRegex.exec(markdown)) !== null) {
            const language = match[1] || 'text';
            const code = match[2];
            const line = markdown.substring(0, match.index).split('\n').length;
            blocks.push({ language, code, line });
        }
        return blocks;
    }
    extractImages(markdown) {
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g;
        const images = [];
        let match;
        while ((match = imageRegex.exec(markdown)) !== null) {
            images.push({
                alt: match[1],
                src: match[2],
                title: match[3]
            });
        }
        return images;
    }
    validateMarkdown(markdown) {
        const issues = [];
        const headings = markdown.match(/^#+\s+.+$/gm) || [];
        let prevLevel = 0;
        headings.forEach((heading, index) => {
            var _a;
            const level = ((_a = heading.match(/^#+/)) === null || _a === void 0 ? void 0 : _a[0].length) || 0;
            if (level > prevLevel + 1) {
                issues.push({
                    type: 'warning',
                    message: `Heading level skip detected (h${prevLevel} to h${level})`,
                    line: index + 1
                });
            }
            prevLevel = level;
        });
        const brokenLinks = markdown.match(/\]\(\s*\)/g);
        if (brokenLinks) {
            issues.push({
                type: 'error',
                message: `Found ${brokenLinks.length} empty link(s)`
            });
        }
        return issues;
    }
}
exports.MarkdownService = MarkdownService;
//# sourceMappingURL=MarkdownService.js.map