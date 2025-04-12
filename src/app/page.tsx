'use client';

import { html } from '@codemirror/lang-html';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { xcodeLight } from '@uiw/codemirror-theme-xcode';
import CodeMirror from '@uiw/react-codemirror';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { useEffect, useState } from 'react';

import DebugPreview from '@/components/debug-preview';

const DEFAULT_HTML = `<div class="p-4 m-2 border bg-blue-100 dark:bg-blue-900 dark:text-white rounded">
  <h1 class="text-xl mb-2">CSS Debugger</h1>
  <p class="w-[150px] text-ellipsis overflow-hidden whitespace-nowrap">This text is too long and will create an overflow situation to demonstrate the debugging capability.</p>
  <div class="flex gap-2 mt-4">
    <button class="px-3 py-1 bg-blue-500 text-white rounded">Button 1</button>
    <button class="px-3 py-1 bg-gray-500 text-white rounded">Button 2</button>
  </div>
</div>`;

export default function CssDebugger() {
  const [code, setCode] = useState(DEFAULT_HTML);
  const [showBoxModel, setShowBoxModel] = useState(true);
  const [showOverflows, setShowOverflows] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration and detect system theme
  useEffect(() => {
    setIsMounted(true);
    const darkModeMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    if (darkModeMediaQuery.matches) {
      document.documentElement.classList.add('dark');
    }

    const handleChange = (e: any) => {
      setIsDarkMode(e.matches);
      document.documentElement.classList.toggle('dark', e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        Loading debugger...
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen w-screen flex-col ${isDarkMode ? 'dark' : ''}`}
    >
      <header className="bg-gray-100 p-4 text-gray-800 dark:bg-gray-800 dark:text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">CSS Visual Debugger</h1>
          <button
            className="rounded-full bg-gray-200 p-2 dark:bg-gray-700"
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              document.documentElement.classList.toggle('dark');
            }}
          >
            {isDarkMode ? '🔆' : '🌙'}
          </button>
        </div>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showBoxModel}
              onChange={() => setShowBoxModel(!showBoxModel)}
              className="mr-2"
            />
            Show Box Model
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showOverflows}
              onChange={() => setShowOverflows(!showOverflows)}
              className="mr-2"
            />
            Highlight Overflows
          </label>
        </div>
      </header>
      <div className="w-full flex-1">
        <PanelGroup direction="horizontal" className="h-full w-full">
          <Panel defaultSize={50} minSize={20} className="h-full w-full">
            <div className="h-full w-full overflow-hidden">
              <CodeMirror
                value={code}
                height="100%"
                width="100%"
                extensions={[html()]}
                onChange={(value) => setCode(value)}
                theme={isDarkMode ? vscodeDark : xcodeLight}
                style={{
                  fontSize: '14px',
                  height: '100%',
                  width: '100%',
                }}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                }}
              />
            </div>
          </Panel>
          <PanelResizeHandle className="w-2 cursor-col-resize bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600" />
          <Panel defaultSize={50} minSize={20} className="h-full w-full">
            <DebugPreview
              html={code}
              showBoxModel={showBoxModel}
              showOverflows={showOverflows}
              darkMode={isDarkMode}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
