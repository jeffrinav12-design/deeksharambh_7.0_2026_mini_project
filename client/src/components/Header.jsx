import React, { useState, useRef, useEffect } from 'react';
import { User, Shield, ChevronDown, Check, Plus, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ userName, role, activeBatch, batches = [], onSelectBatch }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-20 border-b border-blue-100 glass-card fixed top-0 right-0 left-64 z-30 px-8 flex items-center justify-between shadow-sm">
      {/* College Title and Logo */}
      <div className="flex items-center gap-4">
        {/* Sankara College Logo Outline SVG */}
        <svg className="w-10 h-10 text-blue-600 animate-pulse" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M50 25 L80 40 L50 55 L20 40 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3"/>
          <path d="M50 55 L50 95" stroke="currentColor" strokeWidth="4"/>
          <circle cx="50" cy="5" r="3" fill="currentColor"/>
        </svg>
        <div>
          <h2 className="text-sm font-black text-blue-950 tracking-wide uppercase">Sankara College of Science and Commerce (Autonomous)</h2>
          <p className="text-xs text-blue-600 font-bold">Department of Computer Science with Data Analytics (CSDA)</p>
        </div>
      </div>

      {/* User information & Batch Selector */}
      <div className="flex items-center gap-6">
        {/* Interactive Batch Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-blue-700 shadow-sm transition-all cursor-pointer group"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <span>
              Active Batch: {activeBatch ? `${activeBatch.batchYearRange} (v${activeBatch.deeksharambhVersion})` : 'Select Batch'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-blue-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-blue-100 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Select Active Batch</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">{batches.length} Available</span>
              </div>

              <div className="max-h-60 overflow-y-auto py-1">
                {batches.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-gray-500 text-center">No batches found</div>
                ) : (
                  batches.map((b) => {
                    const isSelected = activeBatch && activeBatch._id === b._id;
                    return (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => {
                          if (onSelectBatch) onSelectBatch(b);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-blue-50/80 text-blue-900 font-bold' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              <span>{b.batchYearRange}</span>
                              <span className="px-1.5 py-0.2 text-[9px] bg-blue-100 text-blue-800 rounded font-semibold">
                                v{b.deeksharambhVersion}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium">AY: {b.academicYear} • {b.totalStudents || 0} Students</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    );
                  })
                )}
              </div>

              {(role === 'admin' || role === 'faculty') && (
                <div className="p-2 border-t border-gray-100 bg-slate-50 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/setup');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create & Setup New Batch</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-blue-100">
          <div className="text-right">
            <h4 className="text-xs font-bold text-blue-950">{userName || "Guest"}</h4>
            <span className="text-[10px] text-blue-600 font-medium capitalize flex items-center gap-1 justify-end">
              <Shield className="w-3 h-3 text-blue-600" />
              {role}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
            <User className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </div>
    </header>
  );
}

