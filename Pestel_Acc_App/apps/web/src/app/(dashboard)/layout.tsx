"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

const SIDEBAR_MIN_WIDTH = 240;
const SIDEBAR_MAX_WIDTH = 420;
const SIDEBAR_DEFAULT_WIDTH = 288;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const storedWidth = window.localStorage.getItem('sidebarWidth');
        const storedCollapsed = window.localStorage.getItem('sidebarCollapsed');

        if (storedWidth) {
            const parsedWidth = Number(storedWidth);
            if (!Number.isNaN(parsedWidth)) {
                setSidebarWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, parsedWidth)));
            }
        }

        if (storedCollapsed) {
            setDesktopCollapsed(storedCollapsed === '1');
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem('sidebarWidth', String(sidebarWidth));
    }, [sidebarWidth]);

    useEffect(() => {
        window.localStorage.setItem('sidebarCollapsed', desktopCollapsed ? '1' : '0');
    }, [desktopCollapsed]);

    function toggleDesktopSidebar() {
        setDesktopCollapsed((prev) => !prev);
    }

    function startResize(e: React.PointerEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsResizing(true);

        const onMove = (event: PointerEvent) => {
            const nextWidth = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, event.clientX));
            setSidebarWidth(nextWidth);
        };

        const onUp = () => {
            setIsResizing(false);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };

        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }

    return (
        <div className="flex h-dvh overflow-hidden bg-slate-100">
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-80 transform border-r border-slate-800 bg-slate-950 text-slate-200 transition-transform duration-200 lg:hidden ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <Sidebar onNavigate={() => setMobileOpen(false)} />
            </aside>

            <div
                className={`relative z-30 hidden h-full shrink-0 border-r border-slate-800 bg-slate-950 text-slate-200 transition-[width] duration-200 lg:block ${
                    isResizing ? 'duration-0' : ''
                }`}
                style={{ width: desktopCollapsed ? 0 : sidebarWidth }}
            >
                {!desktopCollapsed && <Sidebar />}
                {!desktopCollapsed && (
                    <div
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="Resize sidebar"
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-cyan-400/30"
                        onPointerDown={startResize}
                    />
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header
                    onOpenMobileMenu={() => setMobileOpen(true)}
                    onToggleDesktopSidebar={toggleDesktopSidebar}
                    isDesktopSidebarCollapsed={desktopCollapsed}
                />
                <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto w-full max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
