import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import slugify from 'slugify';

// JSDOM 설정 (서버 환경에서 DOMPurify 사용을 위해)
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

export interface MarkdownOptions {
  enableCodeHighlighting?: boolean;
  enableMath?: boolean;
  enableMermaid?: boolean;
  sanitize?: boolean;
  generateTOC?: boolean;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  anchor: string;
}

export interface MarkdownResult {
  html: string;
  toc?: TableOfContentsItem[];
  readingTime: number;
  codeBlocks: string[];
  languages: string[];
}

export class MarkdownService {
  private static instance: MarkdownService;
  private renderer: any;
  private tocItems: TableOfContentsItem[] = [];
  private codeBlocks: string[] = [];
  private languages: Set<string> = new Set();

  private constructor() {
    this.renderer = new marked.Renderer();
    this.setupRenderer();
    this.setupMarked();
  }

  static getInstance(): MarkdownService {
    if (!MarkdownService.instance) {
      MarkdownService.instance = new MarkdownService();
    }
    return MarkdownService.instance;
  }

  private setupRenderer(): void {
    // 헤딩 렌더러 - TOC 생성을 위해
    this.renderer.heading = (text: string, level: number) => {
      const anchor = slugify(text, { lower: true, strict: true });
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

    // 코드 블록 렌더러 - 문법 하이라이팅
    this.renderer.code = (code: string, language?: string) => {
      this.codeBlocks.push(code);
      
      if (language) {
        this.languages.add(language);
        
        // 코드 하이라이팅 적용
        let highlightedCode = code;
        try {
          if (hljs.getLanguage(language)) {
            highlightedCode = hljs.highlight(code, { language }).value;
          }
        } catch (error) {
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

    // 인라인 코드 렌더러
    this.renderer.codespan = (code: string) => {
      return `<code class="inline-code">${this.escapeHtml(code)}</code>`;
    };

    // 링크 렌더러 - 보안 및 접근성 향상
    this.renderer.link = (href: string, title: string | null | undefined, text: string) => {
      const isExternal = href.startsWith('http') && !href.includes(process.env.DOMAIN || 'localhost');
      const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : '';
      const externalAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      
      return `<a href="${this.escapeHtml(href)}"${titleAttr}${externalAttrs}>${text}</a>`;
    };

    // 이미지 렌더러 - 지연 로딩 및 접근성
    this.renderer.image = (href: string, title: string | null | undefined, text: string) => {
      const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : '';
      const altAttr = ` alt="${this.escapeHtml(text)}"`;
      
      return `<figure class="image-figure">
        <img src="${this.escapeHtml(href)}"${altAttr}${titleAttr} loading="lazy" class="responsive-image">
        ${text ? `<figcaption>${text}</figcaption>` : ''}
      </figure>`;
    };

    // 테이블 렌더러 - 반응형 테이블
    this.renderer.table = (header: string, body: string) => {
      return `<div class="table-container">
        <table class="responsive-table">
          <thead>${header}</thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;
    };

    // 블록쿼트 렌더러
    this.renderer.blockquote = (quote: string) => {
      return `<blockquote class="custom-blockquote">${quote}</blockquote>`;
    };
  }

  private setupMarked(): void {
    marked.setOptions({
      renderer: this.renderer,
      pedantic: false,
      gfm: true,
      breaks: false
    });
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  private calculateReadingTime(markdown: string): number {
    const wordsPerMinute = 200;
    const words = markdown.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  private resetState(): void {
    this.tocItems = [];
    this.codeBlocks = [];
    this.languages.clear();
  }

  render(markdown: string, options: MarkdownOptions = {}): MarkdownResult {
    const {
      sanitize = true,
      generateTOC = true
    } = options;

    this.resetState();

    try {
      // 마크다운을 HTML로 변환
      let html = marked.parse(markdown) as string;

      // HTML 살균처리
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
            'svg', 'path', 'rect', // 아이콘용
            'button' // 복사 버튼용
          ],
          ALLOWED_ATTR: [
            'href', 'title', 'alt', 'src', 'loading',
            'target', 'rel',
            'id', 'class',
            'data-code', // 복사 기능용
            'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width', // SVG용
            'd' // SVG path용
          ],
          ALLOW_DATA_ATTR: true
        });
      }

      // Mermaid 다이어그램 처리 (향후 확장)
      if (options.enableMermaid) {
        html = this.processMermaidDiagrams(html);
      }

      // 수식 처리 (향후 확장)
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

    } catch (error) {
      console.error('Failed to render markdown:', error);
      throw new Error('Markdown rendering failed');
    }
  }

  private processMermaidDiagrams(html: string): string {
    // Mermaid 다이어그램 코드 블록을 처리
    // 예: ```mermaid ... ``` -> <div class="mermaid">...</div>
    return html.replace(
      /<pre class="hljs"><code class="language-mermaid">(.*?)<\/code><\/pre>/gs,
      '<div class="mermaid">$1</div>'
    );
  }

  private processMathExpressions(html: string): string {
    // KaTeX 수식 처리
    // 인라인 수식: $...$
    // 블록 수식: $$...$$
    html = html.replace(/\$\$(.*?)\$\$/gs, '<div class="math-block">$1</div>');
    html = html.replace(/\$(.*?)\$/g, '<span class="math-inline">$1</span>');
    return html;
  }

  // 마크다운에서 코드 블록 추출 (편집기용)
  extractCodeBlocks(markdown: string): Array<{ language: string; code: string; line: number }> {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: Array<{ language: string; code: string; line: number }> = [];
    let match;
    
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      const language = match[1] || 'text';
      const code = match[2];
      const line = markdown.substring(0, match.index).split('\n').length;
      
      blocks.push({ language, code, line });
    }
    
    return blocks;
  }

  // 마크다운에서 이미지 추출
  extractImages(markdown: string): Array<{ alt: string; src: string; title?: string }> {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g;
    const images: Array<{ alt: string; src: string; title?: string }> = [];
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

  // 마크다운 유효성 검사
  validateMarkdown(markdown: string): Array<{ type: string; message: string; line?: number }> {
    const issues: Array<{ type: string; message: string; line?: number }> = [];
    
    // 헤딩 구조 검사
    const headings = markdown.match(/^#+\s+.+$/gm) || [];
    let prevLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = heading.match(/^#+/)?.[0].length || 0;
      if (level > prevLevel + 1) {
        issues.push({
          type: 'warning',
          message: `Heading level skip detected (h${prevLevel} to h${level})`,
          line: index + 1
        });
      }
      prevLevel = level;
    });
    
    // 깨진 링크 검사 (기본적인)
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