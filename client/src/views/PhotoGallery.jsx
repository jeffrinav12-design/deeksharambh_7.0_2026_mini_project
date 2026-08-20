import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Trash2, Camera, Download, AlertCircle, Plus } from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';

export default function PhotoGallery({ activeBatch, role }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Upload Form State
  const [imageSrc, setImageSrc] = useState('');
  const [caption, setCaption] = useState('');
  const [photoDate, setPhotoDate] = useState('');
  const [gpsOverlayText, setGpsOverlayText] = useState('Coimbatore, Tamil Nadu, Lat 11.0852° N, Long 76.9847° E');

  useEffect(() => {
    if (activeBatch) {
      fetchPhotos();
      setPhotoDate(activeBatch.startDate);
    }
  }, [activeBatch]);

  const fetchPhotos = async () => {
    try {
      const res = await axios.get(`/api/batches/${activeBatch._id}/photos`);
      setPhotos(res.data);
    } catch (err) {
      console.error('Error fetching photos list:', err);
    }
  };

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Convert uploaded image file to base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('File size exceeds 2MB limit. Please upload a smaller image.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setImageSrc(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (role === 'viewer') return;
    if (!imageSrc) {
      showToast('Please select an image file to upload.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        batchId: activeBatch._id,
        url: imageSrc,
        caption,
        photoDate,
        gpsOverlayText
      };
      await axios.post('/api/photos', payload);
      showToast('Photo uploaded and overlay added to album successfully!');
      setImageSrc('');
      setCaption('');
      fetchPhotos();
    } catch (err) {
      showToast('Failed to save photo record', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (role !== 'admin') {
      showToast('Only administrators are allowed to delete photos.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this photo from the album?')) {
      return;
    }
    try {
      await axios.delete(`/api/photos/${photoId}`);
      showToast('Photo deleted.');
      fetchPhotos();
    } catch (err) {
      showToast('Failed to delete photo', 'error');
    }
  };

  if (!activeBatch) {
    return <div className="text-gray-400 text-sm">Please select a batch from the Dashboard first.</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">Bridge Course Photo Gallery</h2>
          <p className="text-xs text-gray-400 mt-1">Upload fleeting course photos, apply styled camera watermarks, and compile photo pages.</p>
        </div>
        <button
          onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/photos`, `PhotoGallery_${activeBatch.batchYearRange}.docx`)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-all shadow cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-white" /> Export Album Document
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Upload Photo Form */}
        {role !== 'viewer' && (
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">Add Photo</h3>
              
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Custom File Selector */}
                <div className="flex flex-col items-center justify-center p-4 border border-dashed border-white/10 rounded-lg hover:border-gold/30 hover:bg-gold/5 transition-all relative overflow-hidden group min-h-[140px]">
                  {imageSrc ? (
                    <>
                      <img src={imageSrc} className="max-h-[120px] w-auto object-contain rounded" alt="Preview" />
                      <button
                        type="button"
                        onClick={() => setImageSrc('')}
                        className="absolute top-2 right-2 bg-red-500/20 text-red-400 p-1 rounded hover:bg-red-500/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center space-y-2">
                      <Camera className="w-8 h-8 text-gray-500 group-hover:text-gold" />
                      <span className="text-xs text-gray-400 group-hover:text-white">Choose photo file</span>
                      <span className="text-[9px] text-gray-500">Max size: 2MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Caption Details</label>
                  <input
                    type="text"
                    required
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg glass-input text-xs"
                    placeholder="e.g. Programming lab session"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Date Taken</label>
                    <input
                      type="date"
                      required
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">GPS Simulation</label>
                    <input
                      type="text"
                      required
                      value={gpsOverlayText}
                      onChange={(e) => setGpsOverlayText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-[11px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !imageSrc}
                  className="w-full py-2.5 rounded-lg bg-gold text-navy-dark font-bold text-xs hover:bg-gold-light transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" /> Save Photo & Overlay
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Right Side: Album Grid */}
        <div className={role !== 'viewer' ? 'lg:col-span-2 space-y-4' : 'lg:col-span-3 space-y-4'}>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fleeting Views of Bridge Courses</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2">
            {photos.map((p, idx) => (
              <div key={p._id || idx} className="p-4 rounded-xl bg-navy-dark/40 border border-white/5 space-y-3 relative group">
                {role === 'admin' && (
                  <button
                    onClick={() => handleDeletePhoto(p._id)}
                    className="absolute right-6 top-6 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500/10 rounded z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Styled Photo watermarked box */}
                <div className="aspect-video w-full rounded-lg bg-navy-deep/80 border border-white/5 overflow-hidden relative">
                  {p.url && (
                    <img src={p.url} className="w-full h-full object-cover" alt={p.caption} />
                  )}
                  {/* Watermark GPS Cam overlay emulation */}
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm p-2 rounded text-[7px] font-mono text-green-400 space-y-0.5 max-w-[80%] pointer-events-none border border-green-500/10">
                    <div>SCSC Autonomous, CSDA</div>
                    <div>Location: {p.gpsOverlayText || "Coimbatore, Tamil Nadu"}</div>
                    <div>Date: {p.photoDate}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white leading-normal truncate">{p.caption}</h4>
                  <p className="text-[10px] text-gray-500 mt-1">Uploaded Date: {p.photoDate}</p>
                </div>
              </div>
            ))}

            {photos.length === 0 && (
              <div className="col-span-full p-12 text-center text-gray-500 text-xs border border-dashed border-white/10 rounded-xl">
                No fleeting views photos uploaded for this batch yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
