// components/DebugPreview.tsx
'use client';

import { useEffect, useRef } from 'react';

// components/DebugPreview.tsx

// components/DebugPreview.tsx

interface DebugPreviewProps {
  html: string;
  showBoxModel: boolean;
  showOverflows: boolean;
  darkMode: boolean;
}

export default function DebugPreview({
  html,
  showBoxModel,
  showOverflows,
  darkMode,
}: DebugPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    // Reset the document
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html class="${darkMode ? 'dark' : ''}">
        <head>
          <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
          <script>
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {},
              }
            }
          </script>
          <style>
            body { 
              margin: 0; 
              padding: 16px; 
              background-color: ${darkMode ? '#1a1a1a' : '#ffffff'};
              color: ${darkMode ? '#ffffff' : '#000000'};
              width: 100%;
              min-height: 100%;
              box-sizing: border-box;
            }
            html, body {
              height: 100%;
              width: 100%;
            }
            /* Debug styles */
            ${showBoxModel ? getCssDebugStyles(darkMode) : ''}
            ${showOverflows ? getOverflowStyles(darkMode) : ''}
          </style>
        </head>
        <body class="${darkMode ? 'dark' : ''}">
          <div id="content">${html}</div>
          <script>
            // Signal when DOM is ready
            document.addEventListener('DOMContentLoaded', () => {
              window.parent.postMessage('iframe-loaded', '*');
            });
            
            // Also signal if we're already loaded
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
              window.parent.postMessage('iframe-loaded', '*');
            }
          </script>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Handle the message when iframe is loaded
    const handleIframeLoaded = (event: any) => {
      if (event.data === 'iframe-loaded' && (showBoxModel || showOverflows)) {
        // Now it's safe to inject debug logic
        injectDebugLogic(iframeDoc, showBoxModel, showOverflows, darkMode);
      }
    };

    window.addEventListener('message', handleIframeLoaded);

    // Fallback method with timeout
    const timeoutId = setTimeout(() => {
      if (iframeDoc.body) {
        injectDebugLogic(iframeDoc, showBoxModel, showOverflows, darkMode);
      }
    }, 100);

    return () => {
      window.removeEventListener('message', handleIframeLoaded);
      clearTimeout(timeoutId);
    };
  }, [html, showBoxModel, showOverflows, darkMode]);

  return (
    <div className="flex h-full w-full">
      <iframe
        ref={iframeRef}
        className="h-full w-full border-none"
        title="CSS Preview"
        style={{
          width: '100%',
          height: '100%',
          background: darkMode ? '#1a1a1a' : '#ffffff',
        }}
      />
    </div>
  );
}

function getCssDebugStyles(darkMode: boolean) {
  return `
    * {
      outline: 1px solid ${darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'} !important;
    }
    
    *:hover {
      outline: 1px solid ${darkMode ? '#ff6b6b' : '#ff0000'} !important;
    }
  `;
}

function getOverflowStyles(darkMode: boolean) {
  return `
    .overflow-detected {
      box-shadow: 0 0 0 2px ${darkMode ? 'rgba(255, 100, 100, 0.5)' : 'rgba(255, 0, 0, 0.3)'} !important;
      position: relative;
    }
  `;
}

function injectDebugLogic(
  doc: Document,
  showBoxModel: boolean,
  showOverflows: boolean,
  darkMode: boolean
) {
  // Safety check to make sure body exists
  if (!doc || !doc.body) {
    console.error('Document body is not available yet');
    return;
  }

  // Add box model visualization
  if (showBoxModel) {
    const style = doc.createElement('style');
    style.textContent = `
      .debug-box {
        position: absolute;
        pointer-events: none;
        z-index: 9999;
      }
      .debug-margin { background: ${darkMode ? 'rgba(255, 100, 100, 0.15)' : 'rgba(255, 0, 0, 0.1)'}; }
      .debug-border { background: ${darkMode ? 'rgba(100, 100, 255, 0.15)' : 'rgba(0, 0, 255, 0.1)'}; }
      .debug-padding { background: ${darkMode ? 'rgba(100, 255, 100, 0.15)' : 'rgba(0, 255, 0, 0.1)'}; }
      .debug-content { background: ${darkMode ? 'rgba(180, 180, 180, 0.1)' : 'rgba(128, 128, 128, 0.1)'}; }
      .debug-label {
        position: absolute;
        font-size: 10px;
        background: ${darkMode ? '#444' : '#333'};
        color: white;
        padding: 2px 4px;
        border-radius: 2px;
        white-space: nowrap;
        z-index: 10000;
      }
    `;
    doc.head.appendChild(style);

    // Add script to visualize box model
    const script = doc.createElement('script');
    script.textContent = `
      document.querySelectorAll('#content *').forEach(el => {
        el.addEventListener('mouseover', (e) => {
          e.stopPropagation();
          visualizeBoxModel(e.target);
        });
        
        el.addEventListener('mouseout', () => {
          document.querySelectorAll('.debug-box, .debug-label').forEach(el => el.remove());
        });
      });

      function visualizeBoxModel(element) {
        // Remove any existing visualizations
        document.querySelectorAll('.debug-box, .debug-label').forEach(el => el.remove());
        
        const rect = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);
        
        // Get computed values
        const marginTop = parseInt(styles.marginTop);
        const marginRight = parseInt(styles.marginRight);
        const marginBottom = parseInt(styles.marginBottom);
        const marginLeft = parseInt(styles.marginLeft);
        
        const borderTop = parseInt(styles.borderTopWidth);
        const borderRight = parseInt(styles.borderRightWidth);
        const borderBottom = parseInt(styles.borderBottomWidth);
        const borderLeft = parseInt(styles.borderLeftWidth);
        
        const paddingTop = parseInt(styles.paddingTop);
        const paddingRight = parseInt(styles.paddingRight);
        const paddingBottom = parseInt(styles.paddingBottom);
        const paddingLeft = parseInt(styles.paddingLeft);
        
        // Create margin visualization
        createBox('margin', rect.x - marginLeft, rect.y - marginTop, 
          rect.width + marginLeft + marginRight, 
          rect.height + marginTop + marginBottom);
          
        // Create border visualization
        createBox('border', rect.x, rect.y, rect.width, rect.height);
        
        // Create padding visualization
        createBox('padding', 
          rect.x + borderLeft, 
          rect.y + borderTop, 
          rect.width - borderLeft - borderRight, 
          rect.height - borderTop - borderBottom);
          
        // Create content visualization
        createBox('content',
          rect.x + borderLeft + paddingLeft,
          rect.y + borderTop + paddingTop,
          rect.width - borderLeft - borderRight - paddingLeft - paddingRight,
          rect.height - borderTop - borderBottom - paddingTop - paddingBottom);
          
        // Add box model labels
        addLabel(\`margin: \${marginTop}px \${marginRight}px \${marginBottom}px \${marginLeft}px\`, 
          rect.x + rect.width / 2, rect.y - marginTop - 20);
          
        addLabel(\`border: \${borderTop}px \${borderRight}px \${borderBottom}px \${borderLeft}px\`, 
          rect.x + rect.width / 2, rect.y - 5);
          
        addLabel(\`padding: \${paddingTop}px \${paddingRight}px \${paddingBottom}px \${paddingLeft}px\`, 
          rect.x + rect.width / 2, rect.y + rect.height + 10);
          
        // Add element tag name and classes
        const classNames = Array.from(element.classList).join('.');
        const tagInfo = element.tagName.toLowerCase() + (classNames ? '.' + classNames : '');
        addLabel(tagInfo, rect.x, rect.y - 25);
      }
      
      function createBox(type, x, y, width, height) {
        const box = document.createElement('div');
        box.className = \`debug-box debug-\${type}\`;
        box.style.left = \`\${x}px\`;
        box.style.top = \`\${y}px\`;
        box.style.width = \`\${width}px\`;
        box.style.height = \`\${height}px\`;
        document.body.appendChild(box);
      }
      
      function addLabel(text, x, y) {
        const label = document.createElement('div');
        label.className = 'debug-label';
        label.textContent = text;
        label.style.left = \`\${x - 50}px\`;
        label.style.top = \`\${y}px\`;
        document.body.appendChild(label);
      }
    `;
    doc.body.appendChild(script);
  }

  // Detect and highlight overflows
  if (showOverflows) {
    const overflowScript = doc.createElement('script');
    overflowScript.textContent = `
      function detectOverflows() {
        document.querySelectorAll('#content *').forEach(el => {
          if (
            el.scrollWidth > el.clientWidth ||
            el.scrollHeight > el.clientHeight
          ) {
            el.classList.add('overflow-detected');
            
            // Add overflow indicator label if it doesn't exist
            if (!el.querySelector('.overflow-indicator')) {
              const label = document.createElement('div');
              label.className = 'debug-label overflow-indicator';
              label.textContent = 'OVERFLOW';
              label.style.position = 'absolute';
              label.style.right = '0';
              label.style.top = '0';
              label.style.backgroundColor = '${darkMode ? 'rgba(255,100,100,0.8)' : 'rgba(255,0,0,0.7)'}';
              label.style.color = 'white';
              label.style.fontSize = '10px';
              label.style.padding = '2px 4px';
              label.style.zIndex = '9999';
              
              // Position the label relative to the element if needed
              if (window.getComputedStyle(el).position === 'static') {
                el.style.position = 'relative';
              }
              
              el.appendChild(label);
              
              // Add additional information about the overflow
              const overflowInfo = document.createElement('div');
              overflowInfo.className = 'debug-label overflow-details';
              overflowInfo.textContent = \`content: \${el.scrollWidth}×\${el.scrollHeight}, container: \${el.clientWidth}×\${el.clientHeight}\`;
              overflowInfo.style.position = 'absolute';
              overflowInfo.style.right = '0';
              overflowInfo.style.top = '18px';
              overflowInfo.style.backgroundColor = '${darkMode ? 'rgba(60,60,60,0.9)' : 'rgba(0,0,0,0.7)'}';
              overflowInfo.style.color = 'white';
              overflowInfo.style.fontSize = '10px';
              overflowInfo.style.padding = '2px 4px';
              overflowInfo.style.zIndex = '9999';
              el.appendChild(overflowInfo);
            }
          }
        });
      }
      
      // Run on load and on resize
      detectOverflows();
      window.addEventListener('resize', detectOverflows);
    `;
    doc.body.appendChild(overflowScript);
  }
}
