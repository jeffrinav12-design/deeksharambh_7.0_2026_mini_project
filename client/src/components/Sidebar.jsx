import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Archive, PlusCircle, BookOpen, Calendar, 
  Users, CheckSquare, FileQuestion, BarChart3, FileText, 
  Image as ImageIcon, LogOut, Sparkles, Mail, X 
} from 'lucide-react';

export default function Sidebar({ role, onLogout, isOpen, onClose }) {
  const allLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['admin', 'faculty', 'viewer'] },
    { to: "/gmail", label: "Google Gmail App", icon: Mail, roles: ['admin', 'faculty', 'student', 'viewer'] },
    { to: "/ai-studio", label: "Google AI Studio", icon: Sparkles, roles: ['admin', 'faculty', 'viewer'] },
    { to: "/archive", label: "Batch Archive Viewer", icon: Archive, roles: ['admin', 'faculty', 'viewer'] },
    { to: "/setup", label: "New Batch Setup", icon: PlusCircle, roles: ['admin', 'faculty'] },
    { to: "/templates", label: "Document & Templates", icon: FileText, roles: ['admin', 'faculty', 'viewer'] },
    { to: "/syllabus", label: "Syllabus Manager", icon: BookOpen, roles: ['admin', 'faculty', 'viewer'] },
    { to: "/schedule", label: "Schedule Manager", icon: Calendar, roles: ['admin', 'faculty', 'viewer'] },
    { to: "/students", label: "Student Master", icon: Users, roles: ['admin', 'faculty', 'viewer'] },
    { to: "/attendance", label: "Attendance Module", icon: CheckSquare, roles: ['admin', 'faculty'] },
    { to: "/assessment", label: "Assessment & Exam Portal", icon: FileQuestion, roles: ['admin', 'faculty', 'student', 'viewer'] },
    { to: "/results", label: "Result Analysis", icon: BarChart3, roles: ['admin', 'faculty', 'viewer'] },
    { to: "/sip-report", label: "SIP Report Generator", icon: FileText, roles: ['admin', 'faculty', 'viewer'] },
    { to: "/photos", label: "Photo Gallery", icon: ImageIcon, roles: ['admin', 'faculty'] }
  ];

  const visibleLinks = allLinks.filter(link => link.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`w-64 glass-card border-r border-[#3AAFA9]/20 flex flex-col justify-between h-screen fixed left-0 top-0 z-50 overflow-y-auto transition-transform duration-300 ease-in-out bg-white ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 py-5 flex flex-col">
          {/* Branding header */}
          <div className="px-5 pb-5 border-b border-[#3AAFA9]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.jpg" 
                alt="Sankara Deeksharambh Logo" 
                className="w-10 h-10 rounded-xl border-2 border-[#3AAFA9]/40 shadow-sm object-cover shrink-0" 
              />
              <div>
                <h1 className="text-sm font-black text-[#1b625f] tracking-wider uppercase">Deeksharambh</h1>
                <p className="text-[10px] text-[#2b8a85] font-bold">CSDA Portal v7.0</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-[#1b625f] hover:bg-[#e6f7f6] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation list */}
          <nav className="mt-4 px-3 space-y-1 overflow-y-auto flex-1">
            {visibleLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#e6f7f6] text-[#1b625f] border border-[#3AAFA9]/40 shadow-sm font-extrabold' 
                      : 'text-slate-600 hover:bg-[#f0faf9] hover:text-[#2b8a85] font-medium'
                  }`
                }
              >
                <link.icon className="w-4 h-4 text-[#3AAFA9] shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-[#3AAFA9]/20 bg-white">
          <button 
            onClick={() => {
              if (onClose) onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all duration-200 cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

