import React, { useState, useRef, useEffect } from 'react';
import { User, Shield, ChevronDown, Check, Plus, Calendar, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ userName, role, activeBatch, batches = [], onSelectBatch, onToggleMobileSidebar }) {
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
    <header className="h-20 border-b border-[#3AAFA9]/20 glass-card fixed top-0 right-0 left-0 lg:left-64 z-30 px-3 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm bg-white">
      {/* Left side: Hamburger for mobile + College Title and Logo */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-[#1b625f] hover:bg-[#e6f7f6] border border-[#3AAFA9]/30 transition-all cursor-pointer shadow-xs"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5 text-[#3AAFA9]" />
        </button>

        {/* Official Sankara Deeksharambh Emblem Logo */}
        <img 
          src="/logo.jpg" 
          alt="Sankara Deeksharambh College Emblem" 
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 border-[#3AAFA9]/40 shadow-sm object-cover shrink-0 animate-pulse-glow"
        />

        <div>
          <h2 className="text-xs sm:text-sm font-black text-[#1b625f] tracking-wide uppercase line-clamp-1">
            SANKARA COLLEGE OF SCIENCE AND COMMERCE (AUTONOMOUS)
          </h2>
          <p className="text-[10px] sm:text-xs text-[#2b8a85] font-bold line-clamp-1">
            Department of CSDA
          </p>
        </div>
      </div>

      {/* Right side: User information & Batch Selector */}
      <div className="flex items-center gap-2 sm:gap-6">
        {/* Interactive Batch Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#f0faf9] hover:bg-[#e6f7f6] border border-[#3AAFA9]/30 text-[10px] sm:text-xs font-bold text-[#1b625f] shadow-sm transition-all cursor-pointer group"
          >
            <span className="w-2 h-2 rounded-full bg-[#3AAFA9] animate-ping shrink-0"></span>
            <span className="truncate max-w-[100px] sm:max-w-none">
              {activeBatch ? `Batch ${activeBatch.deeksharambhVersion || activeBatch.batchYearRange}` : 'Select Batch'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#3AAFA9] shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#3AAFA9]/20 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Select Active Batch</span>
                <span className="text-[10px] text-[#1b625f] font-bold bg-[#e6f7f6] px-2 py-0.5 rounded-full">{batches.length} Available</span>
              </div>

              <div className="max-h-60 overflow-y-auto py-1">
                {batches.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500 text-center">No batches found</div>
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
                          isSelected ? 'bg-[#e6f7f6] text-[#1b625f] font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className={`w-4 h-4 ${isSelected ? 'text-[#3AAFA9]' : 'text-slate-400'}`} />
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              <span>{b.batchYearRange}</span>
                              <span className="px-1.5 py-0.2 text-[9px] bg-[#c2c19f]/30 text-[#5c5a3d] rounded font-semibold">
                                v{b.deeksharambhVersion}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">AY: {b.academicYear} • {b.totalStudents || 0} Students</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#3AAFA9]" />}
                      </button>
                    );
                  })
                )}
              </div>

              {(role === 'admin' || role === 'faculty') && (
                <div className="p-2 border-t border-slate-100 bg-[#f0faf9] rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/setup');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#3AAFA9] hover:bg-[#2b8a85] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create & Setup New Batch</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        {(() => {
          const userEmail = localStorage.getItem('userEmail') || 'jeffrinavcsda2024@sankara.ac.in';
          const registerNo = localStorage.getItem('registerNo') || '24101';
          const department = localStorage.getItem('department') || 'CSDA';
          return (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-6 border-l border-[#3AAFA9]/20">
              <div className="text-right hidden sm:block">
                <h4 className="text-xs font-bold text-[#1b625f] flex items-center gap-1.5 justify-end">
                  <span>{userName || "JEFFRINA V"}</span>
                  <span className="text-[9px] bg-[#e6f7f6] text-[#1b625f] px-1.5 py-0.5 rounded font-mono font-semibold">Reg: {registerNo}</span>
                </h4>
                <p className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">{userEmail}</p>
                <span className="text-[10px] text-[#2b8a85] font-semibold capitalize flex items-center gap-1 justify-end mt-0.5">
                  <Shield className="w-3 h-3 text-[#3AAFA9]" />
                  {role} • {department}
                </span>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f0faf9] border border-[#3AAFA9]/30 flex items-center justify-center text-[#3AAFA9] shadow-sm shrink-0">
                <User className="w-4 h-4 text-[#3AAFA9]" />
              </div>
            </div>
          );
        })()}
      </div>
    </header>
  );
}

