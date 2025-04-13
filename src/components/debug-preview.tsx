'use client';

import { useEffect, useRef, useState } from 'react';

interface DebugPreviewProps {
  html: string;
  showBoxModel: boolean;
  showOverflows: boolean;
}

export default function DebugPreview({
  html,
  showBoxModel,
  showOverflows,
}: DebugPreviewProps) {
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    // Generate HTML with debug logic already included when needed
    const debugStyles =
      showBoxModel || showOverflows
        ? `
      <style>
        * {
          outline: 1px solid rgba(0,0,0,0.2) !important;
        }

        *:hover {
          outline: 1px solid #ff0000 !important;
        }

        .overflow-detected {
          box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.3) !important;
          position: relative;
        }

        ${
          showBoxModel
            ? `
        .debug-box {
          position: absolute;
          pointer-events: none;
          z-index: 9999;
        }
        .debug-margin { background: rgba(255, 0, 0, 0.1); }
        .debug-border { background: rgba(0, 0, 255, 0.1); }
        .debug-padding { background: rgba(0, 255, 0, 0.1); }
        .debug-content { background: rgba(128, 128, 128, 0.1); }
        .debug-label {
          position: absolute;
          font-size: 10px;
          background: #333;
          color: white;
          padding: 2px 4px;
          border-radius: 2px;
          white-space: nowrap;
          z-index: 10000;
        }
        `
            : ''
        }
      </style>`
        : '';

    // Generate debug scripts
    const debugScripts =
      showBoxModel || showOverflows
        ? `
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          ${
            showBoxModel
              ? `
          document.querySelectorAll('#content *').forEach(el => {
            el.addEventListener('mouseover', (e) => {
              e.stopPropagation();
              visualizeBoxModel(e.target);
            });

            el.addEventListener('mouseout', () => {
              // Only remove box model visualizations, preserve overflow indicators
              document.querySelectorAll('.debug-box, .debug-label:not(.overflow-indicator):not(.overflow-details)').forEach(el => el.remove());
            });
          });

          function visualizeBoxModel(element) {
            // Remove only box model visualizations, keep overflow indicators
            document.querySelectorAll('.debug-box, .debug-label:not(.overflow-indicator):not(.overflow-details)').forEach(el => el.remove());

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
          `
              : ''
          }

          ${
            showOverflows
              ? `
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
                  label.style.backgroundColor = 'rgba(255,0,0,0.7)';
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
                  overflowInfo.style.backgroundColor = 'rgba(0,0,0,0.7)';
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
          `
              : ''
          }
        });
      </script>
    `
        : '';

    // Direct write to iframe document
    setSrcDoc(`
      <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" crossorigin="anonymous">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js" integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq" crossorigin="anonymous"></script>
            <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
            ${debugStyles}
          </head>
          <body>
            <div id="content">${html}</div>
            ${debugScripts}
          </body>
        </html>
    `);

    return () => {
      // No need for cleanup, as we're not adding event listeners to the parent window
    };
  }, [html, showBoxModel, showOverflows]);

  return (
    <div className="relative flex h-full w-full">
      <iframe
        srcDoc={srcDoc}
        sandbox="allow-same-origin allow-scripts allow-forms allow-modals"
        className="absolute inset-0 h-full w-full border-none"
        title="CSS Preview"
        style={{
          width: '100%',
          height: '100%',
          background: '#ffffff',
        }}
      />
    </div>
  );
}
