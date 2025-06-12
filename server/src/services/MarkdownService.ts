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
    // 커스텀 렌더러 사용하지 않음 - 기본 marked.js만 사용
  }

  private setupMarked(): void {
    marked.setOptions({
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
      // 마크다운을 HTML로 변환 (기본 marked.js만 사용)
      let html = marked.parse(markdown) as string;

      // 기본 TOC 생성 (후처리로)
      if (generateTOC) {
        this.generateTOCFromHTML(html);
      }

      // 코드 블록 추출 (후처리로)
      this.extractCodeBlocksFromMarkdown(markdown);

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

    } catch (error) {
      console.error('Failed to render markdown:', error);
      throw new Error('Markdown rendering failed');
    }
  }

  private generateTOCFromHTML(html: string): void {
    // 간단한 정규식으로 헤딩 추출
    const headingRegex = /<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/g;
    let match;
    
    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[1]);
      const title = match[3].replace(/<[^>]*>/g, ''); // HTML 태그 제거
      const anchor = slugify(title, { lower: true, strict: true });
      
      this.tocItems.push({
        id: `heading-${anchor}`,
        title,
        level,
        anchor
      });
    }
  }

  private extractCodeBlocksFromMarkdown(markdown: string): void {
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