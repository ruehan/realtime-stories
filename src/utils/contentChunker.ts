export interface ContentChunk {
  id: string;
  type: 'text' | 'image' | 'code' | 'interactive';
  content: any;
  priority: 'high' | 'medium' | 'low';
  loaded: boolean;
  loading: boolean;
  visible: boolean;
}

export function parseContentIntoChunks(htmlContent: string): ContentChunk[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const chunks: ContentChunk[] = [];
  let chunkIndex = 0;

  const processNode = (node: Element) => {
    // Handle headings
    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.tagName)) {
      chunks.push({
        id: `chunk-${chunkIndex++}`,
        type: 'text',
        content: {
          html: node.outerHTML,
          text: node.textContent || '',
          tag: node.tagName.toLowerCase()
        },
        priority: 'high',
        loaded: false,
        loading: false,
        visible: false
      });
    }
    // Handle code blocks
    else if (node.tagName === 'PRE' || node.classList.contains('code-block')) {
      chunks.push({
        id: `chunk-${chunkIndex++}`,
        type: 'code',
        content: {
          html: node.outerHTML,
          code: node.textContent || '',
          language: node.getAttribute('data-language') || 'javascript'
        },
        priority: 'medium',
        loaded: false,
        loading: false,
        visible: false
      });
    }
    // Handle images
    else if (node.tagName === 'IMG') {
      chunks.push({
        id: `chunk-${chunkIndex++}`,
        type: 'image',
        content: {
          src: node.getAttribute('src') || '',
          alt: node.getAttribute('alt') || '',
          width: node.getAttribute('width'),
          height: node.getAttribute('height')
        },
        priority: 'low',
        loaded: false,
        loading: false,
        visible: false
      });
    }
    // Handle paragraphs and other text content
    else if (node.tagName === 'P' || node.tagName === 'UL' || node.tagName === 'OL') {
      const images = node.querySelectorAll('img');
      
      if (images.length > 0) {
        // Split content with images into separate chunks
        let lastIndex = 0;
        const htmlString = node.innerHTML;
        
        images.forEach((img) => {
          const imgOuterHTML = img.outerHTML;
          const imgIndex = htmlString.indexOf(imgOuterHTML, lastIndex);
          
          if (imgIndex > lastIndex) {
            // Add text before image
            const textBefore = htmlString.substring(lastIndex, imgIndex);
            if (textBefore.trim()) {
              chunks.push({
                id: `chunk-${chunkIndex++}`,
                type: 'text',
                content: {
                  html: textBefore,
                  text: textBefore.replace(/<[^>]*>/g, ''),
                  tag: node.tagName.toLowerCase()
                },
                priority: 'medium',
                loaded: false,
                loading: false,
                visible: false
              });
            }
          }
          
          // Add image chunk
          chunks.push({
            id: `chunk-${chunkIndex++}`,
            type: 'image',
            content: {
              src: img.getAttribute('src') || '',
              alt: img.getAttribute('alt') || '',
              width: img.getAttribute('width'),
              height: img.getAttribute('height')
            },
            priority: 'low',
            loaded: false,
            loading: false,
            visible: false
          });
          
          lastIndex = imgIndex + imgOuterHTML.length;
        });
        
        // Add remaining text after last image
        if (lastIndex < htmlString.length) {
          const textAfter = htmlString.substring(lastIndex);
          if (textAfter.trim()) {
            chunks.push({
              id: `chunk-${chunkIndex++}`,
              type: 'text',
              content: {
                html: textAfter,
                text: textAfter.replace(/<[^>]*>/g, ''),
                tag: node.tagName.toLowerCase()
              },
              priority: 'medium',
              loaded: false,
              loading: false,
              visible: false
            });
          }
        }
      } else {
        // No images, add as single text chunk
        chunks.push({
          id: `chunk-${chunkIndex++}`,
          type: 'text',
          content: {
            html: node.outerHTML,
            text: node.textContent || '',
            tag: node.tagName.toLowerCase()
          },
          priority: 'medium',
          loaded: false,
          loading: false,
          visible: false
        });
      }
    }
    // Handle interactive elements
    else if (node.classList.contains('interactive') || node.getAttribute('data-interactive')) {
      chunks.push({
        id: `chunk-${chunkIndex++}`,
        type: 'interactive',
        content: {
          html: node.outerHTML,
          componentType: node.getAttribute('data-component-type') || 'default'
        },
        priority: 'low',
        loaded: false,
        loading: false,
        visible: false
      });
    }
    // Recursively process child nodes
    else {
      Array.from(node.children).forEach(child => processNode(child));
    }
  };

  // Process all top-level elements
  Array.from(doc.body.children).forEach(child => processNode(child));

  return chunks;
}

export function renderChunk(chunk: ContentChunk): string {
  if (!chunk.loaded) {
    // Return skeleton based on chunk type
    switch (chunk.type) {
      case 'image':
        return `<div class="chunk-skeleton chunk-skeleton-image" data-chunk-id="${chunk.id}">
          <div class="animate-pulse bg-gray-300 rounded-lg" style="height: 300px;"></div>
        </div>`;
      case 'code':
        return `<div class="chunk-skeleton chunk-skeleton-code" data-chunk-id="${chunk.id}">
          <div class="animate-pulse bg-gray-200 rounded-lg p-4" style="height: 150px;">
            <div class="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
            <div class="bg-gray-300 h-4 rounded w-1/2 mb-2"></div>
            <div class="bg-gray-300 h-4 rounded w-5/6"></div>
          </div>
        </div>`;
      case 'text':
        const lines = Math.ceil(Math.random() * 3) + 2;
        return `<div class="chunk-skeleton chunk-skeleton-text" data-chunk-id="${chunk.id}">
          <div class="animate-pulse">
            ${Array.from({ length: lines }, (_, i) => 
              `<div class="bg-gray-200 h-4 rounded mb-2 ${i === lines - 1 ? 'w-2/3' : 'w-full'}"></div>`
            ).join('')}
          </div>
        </div>`;
      case 'interactive':
        return `<div class="chunk-skeleton chunk-skeleton-interactive" data-chunk-id="${chunk.id}">
          <div class="animate-pulse bg-gray-200 rounded-lg p-8 text-center">
            <div class="bg-gray-300 h-8 rounded w-1/2 mx-auto"></div>
          </div>
        </div>`;
      default:
        return '';
    }
  }

  // Return rendered content
  switch (chunk.type) {
    case 'image':
      const imgSrc = chunk.content.optimizedSrc || chunk.content.src;
      return `<div class="chunk-loaded chunk-image" data-chunk-id="${chunk.id}">
        <img src="${imgSrc}" alt="${chunk.content.alt}" 
             ${chunk.content.width ? `width="${chunk.content.width}"` : ''} 
             ${chunk.content.height ? `height="${chunk.content.height}"` : ''}
             class="rounded-lg shadow-lg transition-opacity duration-500" />
      </div>`;
    case 'code':
      return `<div class="chunk-loaded chunk-code" data-chunk-id="${chunk.id}">
        ${chunk.content.html}
      </div>`;
    case 'text':
      return `<div class="chunk-loaded chunk-text" data-chunk-id="${chunk.id}">
        ${chunk.content.html}
      </div>`;
    case 'interactive':
      return `<div class="chunk-loaded chunk-interactive" data-chunk-id="${chunk.id}">
        ${chunk.content.html}
      </div>`;
    default:
      return '';
  }
}