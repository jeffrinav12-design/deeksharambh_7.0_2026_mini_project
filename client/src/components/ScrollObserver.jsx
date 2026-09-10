import React, { useEffect, useState } from 'react';
import { ChevronUp, Sparkles, Layers, Sliders } from 'lucide-react';

export default function ScrollObserver({ activeBatch, batches, onSelectBatch }) {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);

  useEffect(() => {
    // Scroll progress & floating toolbar logic
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollPercent(scrolled);
      setShowFloatingToolbar(winScroll > 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Intersection Observer for scroll reveal animations
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.08
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    const observeElements = () => {
      const selectors = [
        '.scroll-reveal',
        '.scroll-reveal-left',
        '.scroll-reveal-right',
        '.scroll-reveal-scale',
        '.scroll-reveal-pop',
        '.glass-card',
        '.styled-table',
        'main section',
        'main form'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, index) => {
          if (!el.classList.contains('scroll-observed')) {
            el.classList.add('scroll-observed');
            if (!el.classList.contains('scroll-reveal-left') &&
                !el.classList.contains('scroll-reveal-right') &&
                !el.classList.contains('scroll-reveal-scale') &&
                !el.classList.contains('scroll-reveal-pop')) {
              el.classList.add('scroll-reveal');
            }
            // Auto stagger delay for sibling cards/rows
            if (!el.style.transitionDelay && (index % 5 !== 0)) {
              const delay = (index % 5) * 0.08;
              el.style.transitionDelay = `${delay}s`;
            }
            observer.observe(el);
          }
        });
      });
    };

    // Initial pass + MutationObserver for dynamically loaded views
    observeElements();
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Scroll Reading Progress Bar */}
      <div 
        className="scroll-progress-bar" 
        style={{ width: `${scrollPercent}%` }}
        title={`Page Scroll: ${Math.round(scrollPercent)}%`}
      />

      {/* Floating Scroll Options Toolbar */}
      <div className={`floating-scroll-toolbar ${showFloatingToolbar ? 'show-toolbar' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-black text-[#1b625f] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e6f7f6] border border-[#3AAFA9]/30">
            <Sparkles className="w-3 h-3 text-[#3AAFA9] animate-spin-slow" />
            {activeBatch ? `v${activeBatch.deeksharambhVersion}` : 'Deeksharambh 7.0'}
          </span>

          {/* Dynamic Batch Quick Selector Button */}
          {batches && batches.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0faf9] hover:bg-[#3AAFA9] hover:text-white text-[#1b625f] font-extrabold text-xs transition-all border border-[#3AAFA9]/40 cursor-pointer shadow-xs"
                title="Switch Batch Options"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Options</span>
              </button>

              {/* Floating Batch Options Popup */}
              {optionsMenuOpen && (
                <div className="absolute bottom-10 right-0 w-64 p-3 rounded-2xl bg-white border-2 border-[#3AAFA9]/40 shadow-2xl space-y-2 z-50 text-left animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between border-b border-[#3AAFA9]/20 pb-2">
                    <span className="text-xs font-black text-[#1b625f] uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-[#3AAFA9]" /> Batch Options
                    </span>
                    <button
                      type="button"
                      onClick={() => setOptionsMenuOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-1">
                    {batches.map(b => (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => {
                          onSelectBatch(b);
                          setOptionsMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          activeBatch && activeBatch._id === b._id
                            ? 'bg-[#1b625f] text-white shadow-sm'
                            : 'hover:bg-[#e6f7f6] text-[#1b625f]'
                        }`}
                      >
                        <span>{b.batchYearRange}</span>
                        <span className="opacity-80 text-[10px]">v{b.deeksharambhVersion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scroll Back To Top Button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="p-2 rounded-full bg-[#1b625f] hover:bg-[#2b8a85] text-white transition-all shadow-md cursor-pointer hover:scale-110 active:scale-95"
            title="Scroll to top of page"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
