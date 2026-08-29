import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, Calendar, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';

export default function ScheduleManager({ activeBatch, role }) {
  const [slots, setSlots] = useState([]);
  const [abbreviations, setAbbreviations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (activeBatch) {
      fetchSchedule();
    }
  }, [activeBatch]);

  const getBatchSampleSchedule = (batch) => {
    const bId = (batch?.deeksharambhVersion || batch?.batchYearRange || '').toString();
    let yearPrefix = '2026';
    if (bId.includes('5.0') || bId.includes('2024')) yearPrefix = '2024';
    if (bId.includes('6.0') || bId.includes('2025')) yearPrefix = '2025';

    return [
      { dayOrder: 'I', date: `${yearPrefix}-08-01`, periods: { I: 'TAMIL', II: 'ENG', III: 'MATHEMATICS', IV: 'BCA', V: 'BCA', VI: 'LIBRARY' } },
      { dayOrder: 'II', date: `${yearPrefix}-08-02`, periods: { I: 'ENG', II: 'TAMIL', III: 'BCA', IV: 'MATHEMATICS', V: 'SPORTS', VI: 'BCA' } },
      { dayOrder: 'III', date: `${yearPrefix}-08-03`, periods: { I: 'MATHEMATICS', II: 'BCA', III: 'TAMIL', IV: 'ENG', V: 'BCA', VI: 'SEMINAR' } },
      { dayOrder: 'IV', date: `${yearPrefix}-08-04`, periods: { I: 'BCA', II: 'MATHEMATICS', III: 'ENG', IV: 'TAMIL', V: 'LIBRARY', VI: 'BCA' } },
      { dayOrder: 'V', date: `${yearPrefix}-08-05`, periods: { I: 'TAMIL', II: 'ENG', III: 'BCA', IV: 'MATHEMATICS', V: 'BCA', VI: 'SPORTS' } },
      { dayOrder: 'VI', date: `${yearPrefix}-08-06`, periods: { I: 'ENG', II: 'TAMIL', III: 'MATHEMATICS', IV: 'BCA', V: 'ASSESSMENT', VI: 'FEEDBACK' } }
    ];
  };

  const fetchSchedule = async () => {
    const fallbackSlots = getBatchSampleSchedule(activeBatch);
    const fallbackAbbr = [
      { sNo: 1, abbreviation: 'TAMIL', particulars: 'Foundation Tamil Course', facultyName: 'Tamil Faculty', noOfHours: 6 },
      { sNo: 2, abbreviation: 'ENG', particulars: 'English Communication for Non-Major', facultyName: 'English Faculty', noOfHours: 6 },
      { sNo: 3, abbreviation: 'MATHEMATICS', particulars: 'Basic Math Techniques', facultyName: 'Maths Faculty', noOfHours: 6 },
      { sNo: 4, abbreviation: 'BCA', particulars: 'Core CSDA Programming Fundamentals', facultyName: 'CSDA Faculty', noOfHours: 18 }
    ];

    try {
      const res = await axios.get(`/api/batches/${activeBatch._id}/schedule`);
      if (res.data.slots && res.data.slots.length > 0) {
        setSlots(res.data.slots);
      } else {
        setSlots(fallbackSlots);
      }
      
      if (res.data.abbreviations && res.data.abbreviations.length > 0) {
        setAbbreviations(res.data.abbreviations);
      } else {
        setAbbreviations(fallbackAbbr);
      }
    } catch (err) {
      setSlots(fallbackSlots);
      setAbbreviations(fallbackAbbr);
    }
  };

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const clearDaySlot = (dayIndex) => {
    if (role === 'viewer') return;
    const updated = [...slots];
    updated[dayIndex].periods = { I: '', II: '', III: '', IV: '', V: '', VI: '' };
    setSlots(updated);
    showToast(`Cleared periods for Day Order ${updated[dayIndex].dayOrder}`);
  };

  const handlePeriodChange = (dayIndex, periodKey, value) => {
    const updated = [...slots];
    updated[dayIndex].periods[periodKey] = value;
    setSlots(updated);
  };

  const handleDateChange = (dayIndex, value) => {
    const updated = [...slots];
    updated[dayIndex].date = value;
    setSlots(updated);
  };

  const handleAbbreviationChange = (index, field, value) => {
    const updated = [...abbreviations];
    if (field === 'noOfHours') {
      updated[index][field] = Number(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setAbbreviations(updated);
  };

  const addAbbreviation = () => {
    const count = abbreviations.length;
    setAbbreviations([
      ...abbreviations,
      { sNo: count + 1, abbreviation: '', particulars: '', facultyName: '', noOfHours: 0 }
    ]);
  };

  const removeAbbreviation = (index) => {
    setAbbreviations(abbreviations.filter((_, i) => i !== index));
  };

  // Calculate sum of hours
  const totalHours = abbreviations.reduce((sum, item) => sum + (Number(item.noOfHours) || 0), 0);

  const handleSave = async (e) => {
    e.preventDefault();
    if (role === 'viewer') {
      showToast('Viewers cannot edit the timetable.', 'error');
      return;
    }

    if (totalHours !== 36) {
      showToast(`Validation Failed: Total legend hours must be exactly 36 hours. Current total is ${totalHours} hours.`, 'error');
      return;
    }

    // Validate slots have date
    const missingDate = slots.some(s => !s.date);
    if (missingDate) {
      showToast('Validation Failed: Please fill in dates for all Day Orders.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        slots,
        abbreviations
      };
      await axios.post(`/api/batches/${activeBatch._id}/schedule`, payload);
      showToast('Schedule and Abbreviation Legend saved successfully!');
      fetchSchedule();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save schedule settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!activeBatch) {
    return <div className="text-gray-400 text-sm">Please select a batch from the Dashboard first.</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">Schedule & Abbreviation Legend</h2>
          <p className="text-xs text-gray-400 mt-1">Design the 6-day timetables, map periods I-VI, and map assigned faculty contacts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/schedule`, `Schedule_${activeBatch.batchYearRange}.docx`)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Word (.docx)
          </button>
          <button
            type="button"
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/schedule/csv`, `Schedule_${activeBatch.batchYearRange}.csv`)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> CSV (.csv)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Calendar className="w-4 h-4" /> Printable Grid
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
        }`}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Validation Indicator */}
      <div className={`p-4 rounded-xl flex items-center justify-between border ${
        totalHours === 36 
          ? 'bg-green-500/10 border-green-500/30 text-green-400' 
          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      }`}>
        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-4.5 h-4.5" />
          <span>Timetable Total Target Hours: <strong>36 Hours</strong></span>
        </div>
        <div className="text-xs font-bold">
          Current Total: <span className={totalHours === 36 ? 'underline decoration-2' : ''}>{totalHours} Hours</span>
          {totalHours !== 36 && ` (Need ${36 - totalHours} more)`}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Schedule Grid Table */}
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold" /> Timetable Grid Settings
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full styled-table text-xs text-left">
              <thead>
                <tr>
                  <th className="p-3">Day Order</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Period I (9:45-10:35)</th>
                  <th className="p-3">Period II (10:35-11:25)</th>
                  <th className="p-3">Period III (11:40-12:30)</th>
                  <th className="p-3">Period IV (1:15-1:55)</th>
                  <th className="p-3">Period V (1:55-2:50)</th>
                  <th className="p-3">Period VI (2:50-3:45)</th>
                  {role !== 'viewer' && <th className="p-3 w-16 text-center">Clear</th>}
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, sIdx) => (
                  <tr key={sIdx} className="hover:bg-white/5 border-b border-white/5">
                    <td className="p-3 font-semibold text-blue-600">{slot.dayOrder}</td>
                    <td className="p-3">
                      <input
                        type="date"
                        required
                        disabled={role === 'viewer'}
                        value={slot.date}
                        onChange={(e) => handleDateChange(sIdx, e.target.value)}
                        className="px-2 py-1.5 rounded glass-input text-xs w-[120px]"
                      />
                    </td>
                    {['I', 'II', 'III', 'IV', 'V', 'VI'].map(pKey => (
                      <td key={pKey} className="p-2">
                        <input
                          type="text"
                          disabled={role === 'viewer'}
                          value={slot.periods[pKey] || ''}
                          onChange={(e) => handlePeriodChange(sIdx, pKey, e.target.value)}
                          className="px-2 py-1.5 rounded glass-input text-xs w-[110px]"
                          placeholder="e.g. BCA"
                        />
                      </td>
                    ))}
                    {role !== 'viewer' && (
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => clearDaySlot(sIdx)}
                          className="p-1 rounded.lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Clear Day Order periods"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend Table Editor */}
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider">Abbreviation Legend & Faculty</h3>
            {role !== 'viewer' && (
              <button
                type="button"
                onClick={addAbbreviation}
                className="text-gold font-bold text-[10px] uppercase hover:underline"
              >
                + Add Legend Entry
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full styled-table text-xs text-left">
              <thead>
                <tr>
                  <th className="p-3 w-16">S.No</th>
                  <th className="p-3 w-32">Abbreviation</th>
                  <th className="p-3">Particulars / Topic Details</th>
                  <th className="p-3 w-48">Faculty Name Assigned</th>
                  <th className="p-3 w-24">Hours</th>
                  {role !== 'viewer' && <th className="p-3 w-16 text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {abbreviations.map((ab, idx) => (
                  <tr key={idx} className="hover:bg-white/5 border-b border-white/5">
                    <td className="p-3">
                      <input
                        type="number"
                        disabled={role === 'viewer'}
                        value={ab.sNo || idx+1}
                        onChange={(e) => handleAbbreviationChange(idx, 'sNo', e.target.value)}
                        className="w-12 px-2 py-1 rounded glass-input text-xs text-center"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        disabled={role === 'viewer'}
                        value={ab.abbreviation}
                        onChange={(e) => handleAbbreviationChange(idx, 'abbreviation', e.target.value)}
                        className="w-full px-2 py-1 rounded glass-input text-xs text-gold font-bold uppercase"
                        placeholder="BCA"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        disabled={role === 'viewer'}
                        value={ab.particulars}
                        onChange={(e) => handleAbbreviationChange(idx, 'particulars', e.target.value)}
                        className="w-full px-2 py-1 rounded glass-input text-xs"
                        placeholder="Core Programming basics"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        disabled={role === 'viewer'}
                        value={ab.facultyName}
                        onChange={(e) => handleAbbreviationChange(idx, 'facultyName', e.target.value)}
                        className="w-full px-2 py-1 rounded glass-input text-xs"
                        placeholder="Prof. Name"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        disabled={role === 'viewer'}
                        value={ab.noOfHours}
                        onChange={(e) => handleAbbreviationChange(idx, 'noOfHours', e.target.value)}
                        className="w-16 px-2 py-1 rounded glass-input text-xs text-center font-bold"
                        min="0"
                      />
                    </td>
                    {role !== 'viewer' && (
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeAbbreviation(idx)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4 animate-hover" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {role !== 'viewer' && (
          <button
            type="submit"
            disabled={loading || totalHours !== 36}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-gold to-yellow-400 text-navy-dark font-bold text-sm hover:from-yellow-400 hover:to-gold transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Schedule Configuration</span>
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
}
