'use client';

import { html } from '@codemirror/lang-html';
import { xcodeLight } from '@uiw/codemirror-theme-xcode';
import CodeMirror from '@uiw/react-codemirror';
import { Github } from 'lucide-react';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import DebugPreview from '@/components/debug-preview';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

const DEFAULT_HTML = `<div class="container">
    <h1 class="text-center">Employee CRUD Operations</h1>
    <form id="employeeForm">
        <div class="mb-3">
            <label for="employeeName" class="form-label">Employee Name</label>
            <input type="text" class="form-control" id="employeeName" required>
        </div>
        <div class="mb-3">
            <label for="employeePosition" class="form-label">Position</label>
            <input type="text" class="form-control" id="employeePosition" required>
        </div>
        <button type="submit" class="btn btn-primary">Add Employee</button>
    </form>

    <h2 class="mt-5">Employee List</h2>
    <table class="table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="employeeTableBody">
        </tbody>
    </table>
</div>
<style>
    body {
        padding: 20px;
    }
</style>`;

export default function CssDebugger() {
  const [code, setCode] = useState(DEFAULT_HTML);
  const [showBoxModel, setShowBoxModel] = useState(true);
  const [showOverflows, setShowOverflows] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration and detect system theme
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        Loading debugger...
      </div>
    );
  }

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden">
      <header className="bg-secondary-background flex items-center justify-between border-b p-4">
        <div className="flex items-end justify-between space-x-1">
          <h1 className="text-2xl font-bold">VisualCSS</h1>
          <p className="text-xs italic">(HTML, Bootstrap, jQuery)</p>
        </div>
        <div className="flex space-x-4">
          <Card className="flex flex-row items-center justify-center px-2 py-1">
            <div className="flex items-center">
              <Checkbox
                checked={showBoxModel}
                onCheckedChange={() => setShowBoxModel(!showBoxModel)}
                className="mr-2"
              />
              Show Box Model
            </div>
            <div className="flex items-center">
              <Checkbox
                checked={showOverflows}
                onCheckedChange={() => setShowOverflows(!showOverflows)}
                className="mr-2"
              />
              Highlight Overflows
            </div>
          </Card>
          <Button asChild size="icon">
            <Link
              href="https://github.com/abhigyantrips/VisualCSS"
              target="_blank"
            >
              <Github />
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="relative h-full w-full overflow-auto bg-[#ffffff]">
              <CodeMirror
                value={code}
                extensions={[html()]}
                onChange={(value) => setCode(value)}
                theme={xcodeLight}
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
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
            <DebugPreview
              html={code}
              showBoxModel={showBoxModel}
              showOverflows={showOverflows}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}
