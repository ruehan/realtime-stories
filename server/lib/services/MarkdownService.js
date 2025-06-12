"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownService = void 0;
const marked_1 = require("marked");
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
    }
    setupMarked() {
        marked_1.marked.setOptions({
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
            if (generateTOC) {
                this.generateTOCFromHTML(html);
            }
            this.extractCodeBlocksFromMarkdown(markdown);
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
                        'div', 'span'
                    ],
                    ALLOWED_ATTR: [
                        'href', 'title', 'alt', 'src', 'loading',
                        'target', 'rel',
                        'id', 'class'
                    ]
                });
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
    generateTOCFromHTML(html) {
        const headingRegex = /<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/g;
        let match;
        while ((match = headingRegex.exec(html)) !== null) {
            const level = parseInt(match[1]);
            const title = match[3].replace(/<[^>]*>/g, '');
            const anchor = (0, slugify_1.default)(title, { lower: true, strict: true });
            this.tocItems.push({
                id: `heading-${anchor}`,
                title,
                level,
                anchor
            });
        }
    }
    extractCodeBlocksFromMarkdown(markdown) {
        const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
        let match;
        while ((match = codeBlockRegex.exec(markdown)) !== null) {
            const language = match[1] || 'text';
            const code = match[2];
            this.codeBlocks.push(code);
            if (language) {
                this.languages.add(language);
            }
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