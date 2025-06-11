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
export declare class MarkdownService {
    private static instance;
    private renderer;
    private tocItems;
    private codeBlocks;
    private languages;
    private constructor();
    static getInstance(): MarkdownService;
    private setupRenderer;
    private setupMarked;
    private escapeHtml;
    private calculateReadingTime;
    private resetState;
    render(markdown: string, options?: MarkdownOptions): MarkdownResult;
    private processMermaidDiagrams;
    private processMathExpressions;
    extractCodeBlocks(markdown: string): Array<{
        language: string;
        code: string;
        line: number;
    }>;
    extractImages(markdown: string): Array<{
        alt: string;
        src: string;
        title?: string;
    }>;
    validateMarkdown(markdown: string): Array<{
        type: string;
        message: string;
        line?: number;
    }>;
}
