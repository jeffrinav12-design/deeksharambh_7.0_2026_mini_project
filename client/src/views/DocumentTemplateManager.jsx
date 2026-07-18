import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Upload, Copy, Edit, Trash2, Download, Printer, Eye, Plus, Search, Filter, 
  CheckCircle2, AlertCircle, RefreshCw, Calendar, Users, Shield, History
} from 'lucide-react';

const renderFieldInput = (field, value, onChange) => {
  const lowercaseField = field.toLowerCase();
  
  if (lowercaseField.includes('fontfamily')) {
    return (
      <select
        value={value}
        onChange={onChange}
        required
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none bg-white"
      >
        <option value="">Select Font Family</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Arial">Arial</option>
        <option value="Calibri">Calibri</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
      </select>
    );
  }
  
  if (lowercaseField.includes('fontsize')) {
    return (
      <select
        value={value}
        onChange={onChange}
        required
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none bg-white"
      >
        <option value="">Select Font Size</option>
        <option value="10">10pt</option>
        <option value="11">11pt</option>
        <option value="12">12pt (Standard)</option>
        <option value="14">14pt (Sub-heading)</option>
        <option value="16">16pt (Heading)</option>
        <option value="18">18pt</option>
        <option value="20">20pt</option>
      </select>
    );
  }
  
  if (lowercaseField.includes('alignment') || lowercaseField.includes('align')) {
    return (
      <select
        value={value}
        onChange={onChange}
        required
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none bg-white"
      >
        <option value="">Select Alignment</option>
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
        <option value="justify">Justify</option>
      </select>
    );
  }
  
  if (lowercaseField.includes('content') || lowercaseField.includes('body') || lowercaseField.includes('text') || lowercaseField.includes('description')) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        required
        rows={4}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none"
        placeholder="Enter document text content here..."
      />
    );
  }
  
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      required
      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none"
    />
  );
};

const isFullWidthField = (field) => {
  const lowercaseField = field.toLowerCase();
  return lowercaseField.includes('content') || lowercaseField.includes('body') || lowercaseField.includes('text') || lowercaseField.includes('description');
};

export default function DocumentTemplateManager({ activeBatch }) {
  const [batches, setBatches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [activeTab, setActiveTab] = useState('batches'); // 'batches', 'templates', 'documents', 'logs'
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal / Form States
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEditDocModal, setShowEditDocModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Template Upload form
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    fileName: '',
    fileData: '',
    fieldsText: 'department, course, academicYear, content, fontFamily, fontSize, alignment, hodName, principalName'
  });
  
  // Document Generation form
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generationForm, setGenerationForm] = useState({
    name: '',
    fieldValues: {}
  });

  // Document Edit form
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editFormValues, setEditFormValues] = useState({});

  // Batch Editor form
  const [editingBatch, setEditingBatch] = useState(null);

  // Drag and drop state
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchBatches();
    fetchTemplates();
    fetchDocuments();
    fetchLogs();
  }, [activeBatch]);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/api/batches');
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('/api/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('/api/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/activity-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Drag & Drop / File Validation Helpers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const validateAndProcessFile = (file) => {
    if (file.type !== 'application/pdf') {
      showToast('Only PDF template documents are allowed!', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showToast('File size exceeds the 10MB limit!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewTemplate(prev => ({
        ...prev,
        fileName: file.name,
        fileData: reader.result.split(',')[1] // Get base64 payload only
      }));
      showToast('File loaded successfully. Please enter a template name.');
    };
    reader.readAsDataURL(file);
  };

  // Template Actions
  const handleTemplateUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newTemplate.fileData) {
      showToast('Please select or drop a PDF file first!', 'error');
      return;
    }
    if (!newTemplate.name.trim()) {
      showToast('Please specify a template name!', 'error');
      return;
    }

    setLoading(true);
    try {
      const fields = newTemplate.fieldsText
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      await axios.post('/api/templates', {
        batchId: activeBatch?._id,
        name: newTemplate.name.trim(),
        fileName: newTemplate.fileName,
        fileData: newTemplate.fileData,
        fields
      });

      showToast('Template uploaded successfully!');
      setShowUploadModal(false);
      setNewTemplate({ name: '', fileName: '', fileData: '', fieldsText: 'department, course, academicYear, batchYearRange, hodName, principalName' });
      fetchTemplates();
      fetchLogs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload template', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await axios.delete(`/api/templates/${id}`);
      showToast('Template deleted successfully!');
      fetchTemplates();
      fetchLogs();
    } catch (err) {
      showToast('Failed to delete template', 'error');
    }
  };

  const handleCloneTemplate = async (templateId, targetBatchId) => {
    if (!targetBatchId) return;
    try {
      await axios.post(`/api/templates/${templateId}/clone`, { targetBatchId });
      showToast('Template cloned successfully!');
      fetchTemplates();
      fetchLogs();
    } catch (err) {
      showToast('Failed to clone template', 'error');
    }
  };

  const handleDownloadTemplate = (tpl) => {
    window.open(`/api/templates/${tpl._id}/download`, '_blank');
    setTimeout(fetchLogs, 1000); // refresh logs
  };

  // Document Generation Actions
  const handleOpenGenerate = (tpl) => {
    setSelectedTemplate(tpl);
    const prefilledValues = {};
    // Pre-fill fields with active batch data if available
    tpl.fields.forEach(field => {
      if (field === 'department') prefilledValues[field] = 'Computer Science with Data Analytics';
      else if (field === 'course') prefilledValues[field] = activeBatch?.className || 'I B.Sc. CSDA';
      else if (field === 'academicYear') prefilledValues[field] = activeBatch?.academicYear || '';
      else if (field === 'batchYearRange') prefilledValues[field] = activeBatch?.batchYearRange || '';
      else if (field === 'hodName') prefilledValues[field] = activeBatch?.hodName || '';
      else if (field === 'principalName') prefilledValues[field] = activeBatch?.principalName || '';
      else prefilledValues[field] = '';
    });

    setGenerationForm({
      name: `${tpl.name} - Batch ${activeBatch?.batchYearRange || 'New'}`,
      fieldValues: prefilledValues
    });
    setShowGenerateModal(true);
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/documents', {
        templateId: selectedTemplate._id,
        batchId: activeBatch?._id,
        name: generationForm.name.trim(),
        fieldValues: generationForm.fieldValues
      });
      showToast('Document generated successfully!');
      setShowGenerateModal(false);
      fetchDocuments();
      fetchLogs();
      setActiveTab('documents');
    } catch (err) {
      showToast('Failed to generate document', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Edit Document
  const handleOpenEditDoc = (doc) => {
    setSelectedDoc(doc);
    setEditFormValues({ ...doc.fieldValues });
    setShowEditDocModal(true);
  };

  const handleEditDocSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/api/documents/${selectedDoc._id}`, {
        fieldValues: editFormValues
      });
      showToast(`Document version updated to v${selectedDoc.version + 1}!`);
      setShowEditDocModal(false);
      fetchDocuments();
      fetchLogs();
    } catch (err) {
      showToast('Failed to edit document', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this generated document?')) return;
    try {
      await axios.delete(`/api/documents/${id}`);
      showToast('Document deleted successfully!');
      fetchDocuments();
      fetchLogs();
    } catch (err) {
      showToast('Failed to delete document', 'error');
    }
  };

  // Batch Editor Actions
  const handleOpenEditBatch = (batch) => {
    setEditingBatch({ ...batch });
    setShowBatchModal(true);
  };

  const handleEditBatchSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/batches/${editingBatch._id}`, editingBatch);
      showToast('Batch updated successfully!');
      setShowBatchModal(false);
      fetchBatches();
    } catch (err) {
      showToast('Failed to update batch details', 'error');
    }
  };

  // Document Downloads
  const handleDownload = (docId, format) => {
    window.open(`/api/documents/${docId}/download/${format}`, '_blank');
    setTimeout(fetchLogs, 1000); // refresh logs
  };

  const handlePreview = (doc) => {
    setSelectedDoc(doc);
    setShowPreviewModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Searching and Filtering Logic
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (doc.templateId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = selectedBatchId ? doc.batchId === selectedBatchId : true;
    return matchesSearch && matchesBatch;
  }).sort((a, b) => {
    return sortOrder === 'asc' 
      ? new Date(a.updatedAt) - new Date(b.updatedAt)
      : new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border fixed top-6 right-6 z-50 shadow-xl ${
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-5 border-green-200 text-green-700'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Main Branding Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-navy tracking-wide uppercase">Document & Template Portal</h2>
          <p className="text-xs text-gray-500 mt-1">Manage PDF templates, clone batch structures, generate customized reports, and track activity logs.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'templates' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-navy text-white rounded-lg font-semibold text-xs flex items-center gap-2 hover:bg-navy-light transition-all"
            >
              <Upload className="w-4 h-4" /> Upload PDF Template
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation buttons */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('batches')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'batches' ? 'border-navy text-navy font-bold' : 'border-transparent text-gray-400 hover:text-navy'
          }`}
        >
          Academic Batches
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'templates' ? 'border-navy text-navy font-bold' : 'border-transparent text-gray-400 hover:text-navy'
          }`}
        >
          Template Library
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'documents' ? 'border-navy text-navy font-bold' : 'border-transparent text-gray-400 hover:text-navy'
          }`}
        >
          Document Hub
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'logs' ? 'border-navy text-navy font-bold' : 'border-transparent text-gray-400 hover:text-navy'
          }`}
        >
          Activity Logs
        </button>
      </div>

      {/* 1. ACADEMIC BATCHES TAB */}
      {activeTab === 'batches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map(b => (
            <div key={b._id} className="glass-card p-6 rounded-xl space-y-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-navy text-lg">Batch {b.batchYearRange}</h3>
                  <span className="text-[10px] text-gray-400 font-medium">AY: {b.academicYear}</span>
                </div>
                <div className="bg-navy/10 text-navy px-2 py-0.5 rounded text-[10px] font-bold">
                  v{b.deeksharambhVersion}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 py-1">
                <div>
                  <span className="block text-[10px] text-gray-400">Class Name</span>
                  <span className="font-medium text-gray-700">{b.className}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400">Students Count</span>
                  <span className="font-medium text-gray-700">{b.totalStudents} Students</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400">HOD Name</span>
                  <span className="font-medium text-gray-700">{b.hodName}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400">Principal Name</span>
                  <span className="font-medium text-gray-700">{b.principalName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-[10px] text-gray-400">
                <span>Start: {b.startDate}</span>
                <span>End: {b.endDate}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleOpenEditBatch(b)}
                  className="flex-1 py-2 text-center border border-gray-200 hover:border-navy hover:bg-navy/5 text-[11px] font-bold text-navy rounded-lg transition-all"
                >
                  Edit Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. TEMPLATE LIBRARY TAB */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {templates.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl space-y-3">
              <FileText className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-600 text-sm">No Templates Found</h3>
              <p className="text-xs text-gray-400">Upload a PDF template to start generating batch documents.</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-navy text-white rounded-lg text-xs font-semibold hover:bg-navy-light"
              >
                Upload First Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(tpl => (
                <div key={tpl._id} className="glass-card p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="font-bold text-navy text-sm uppercase">{tpl.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono truncate block max-w-[180px]">{tpl.fileName}</span>
                      </div>
                      <FileText className="w-5 h-5 text-navy" />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-gray-400 block font-semibold">Placeholders Found:</span>
                      <div className="flex flex-wrap gap-1">
                        {tpl.fields.map((f, idx) => (
                          <span key={idx} className="bg-navy/5 text-navy px-1.5 py-0.5 rounded text-[9px] font-mono">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 pt-4 mt-4">
                    <button
                      onClick={() => handleOpenGenerate(tpl)}
                      className="w-full py-2 bg-navy text-white rounded-lg text-xs font-bold hover:bg-navy-light transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Generate Document
                    </button>
                    
                    <div className="flex gap-2">
                      <select
                        onChange={(e) => handleCloneTemplate(tpl._id, e.target.value)}
                        defaultValue=""
                        className="flex-1 px-2.5 py-1.5 text-[10px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-md focus:outline-none"
                      >
                        <option value="" disabled>Clone To Batch...</option>
                        {batches.map(b => (
                          <option key={b._id} value={b._id}>Batch {b.batchYearRange}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDownloadTemplate(tpl)}
                        className="p-1.5 border border-navy/10 text-navy hover:bg-navy/5 rounded transition-all"
                        title="Download Original PDF Template"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteTemplate(tpl._id)}
                        className="p-1.5 border border-red-100 text-red-500 rounded hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. DOCUMENT HUB TAB */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Search, Filter, Sort bar */}
          <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search generated documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-navy"
              />
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="flex-1 md:flex-none px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-navy"
              >
                <option value="">All Academic Batches</option>
                {batches.map(b => (
                  <option key={b._id} value={b._id}>Batch {b.batchYearRange}</option>
                ))}
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="flex-1 md:flex-none px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-navy"
              >
                <option value="desc">Sort: Newest First</option>
                <option value="asc">Sort: Oldest First</option>
              </select>
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl space-y-3">
              <FileText className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-600 text-sm">No Generated Documents Found</h3>
              <p className="text-xs text-gray-400">Generate a document using the Template Library tab.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 font-bold text-navy">
                    <th className="p-4">Document Name</th>
                    <th className="p-4">Base Template</th>
                    <th className="p-4">Version</th>
                    <th className="p-4">Last Updated</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredDocuments.map(doc => (
                    <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-semibold text-navy-dark">{doc.name}</td>
                      <td className="p-4 text-gray-500">{doc.templateId?.name || 'Cloned Template'}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          v{doc.version}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">{new Date(doc.updatedAt).toLocaleString()}</td>
                      <td className="p-4 text-right flex gap-1.5 justify-end">
                        <button
                          onClick={() => handlePreview(doc)}
                          className="p-1.5 text-gray-500 hover:text-navy rounded border border-gray-100 hover:bg-slate-100"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditDoc(doc)}
                          className="p-1.5 text-gray-500 hover:text-navy rounded border border-gray-100 hover:bg-slate-100"
                          title="Edit details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc._id, 'pdf')}
                          className="p-1.5 text-navy hover:bg-navy/5 rounded border border-navy/10"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc._id, 'docx')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded border border-green-100"
                          title="Download Word (.docx)"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="p-1.5 text-red-500 hover:text-red-600 rounded border border-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. ACTIVITY LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="glass-card p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-bold text-navy text-sm uppercase flex items-center gap-2">
              <History className="w-4 h-4" /> System Audit Trail
            </h3>
            <button
              onClick={fetchLogs}
              className="p-1 hover:bg-slate-100 rounded text-gray-500"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2.5">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No activity logs recorded yet.</p>
            ) : (
              logs.map(log => (
                <div key={log._id} className="flex justify-between items-start p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-navy">{log.action}</span>
                    <p className="text-gray-600">{log.details}</p>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> User: {log.userName || 'System'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------- MODALS / DRAWER FORMS ---------------- */}

      {/* Upload PDF Template Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg border border-gray-100 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-navy border-b border-gray-100 pb-2">Upload New PDF Template</h3>
            
            <form onSubmit={handleTemplateUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official Course Circular"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none"
                />
              </div>

              {/* Drag & Drop File Container */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById('file-upload-input').click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-navy bg-navy/5' : 'border-gray-300 hover:border-navy'
                }`}
              >
                <input 
                  type="file" 
                  id="file-upload-input" 
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden" 
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-600">Drag & Drop PDF template file here</p>
                <p className="text-[10px] text-gray-400 mt-1">or click to browse from files (Max 10MB)</p>
                {newTemplate.fileName && (
                  <div className="mt-3 bg-navy/10 text-navy px-3 py-1.5 rounded text-[10px] font-bold">
                    File selected: {newTemplate.fileName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Template Dynamic Placeholders (comma-separated)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. department, course, academicYear"
                  value={newTemplate.fieldsText}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, fieldsText: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold border border-gray-200 hover:bg-slate-50 text-gray-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold bg-navy text-white rounded-lg hover:bg-navy-light"
                >
                  {loading ? 'Uploading...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Document Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl border border-gray-100 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-bold text-navy border-b border-gray-100 pb-2">
              Generate Document: {selectedTemplate?.name}
            </h3>
            
            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Document Output Title</label>
                <input
                  type="text"
                  required
                  value={generationForm.name}
                  onChange={(e) => setGenerationForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-navy uppercase tracking-wider">Dynamic Parameters Form:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {selectedTemplate?.fields.map(field => (
                    <div key={field} className={isFullWidthField(field) ? "col-span-1 sm:col-span-2" : ""}>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 capitalize">
                        {field.replace(/([A-Z])/g, ' $1')}
                      </label>
                      {renderFieldInput(
                        field,
                        generationForm.fieldValues[field] || '',
                        (e) => {
                          const val = e.target.value;
                          setGenerationForm(prev => ({
                            ...prev,
                            fieldValues: {
                              ...prev.fieldValues,
                              [field]: val
                            }
                          }));
                        }
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs font-semibold border border-gray-200 hover:bg-slate-50 text-gray-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold bg-navy text-white rounded-lg hover:bg-navy-light"
                >
                  {loading ? 'Compiling Documents...' : 'Generate & Export'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Document Fields Modal */}
      {showEditDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl border border-gray-100 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-bold text-navy border-b border-gray-100 pb-2">
              Edit Document Fields (v{selectedDoc?.version})
            </h3>
            
            <form onSubmit={handleEditDocSubmit} className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-navy uppercase tracking-wider">Parameters Values:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {Object.keys(selectedDoc?.fieldValues || {}).map(field => (
                    <div key={field} className={isFullWidthField(field) ? "col-span-1 sm:col-span-2" : ""}>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 capitalize">
                        {field.replace(/([A-Z])/g, ' $1')}
                      </label>
                      {renderFieldInput(
                        field,
                        editFormValues[field] || '',
                        (e) => {
                          const val = e.target.value;
                          setEditFormValues(prev => ({
                            ...prev,
                            [field]: val
                          }));
                        }
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditDocModal(false)}
                  className="px-4 py-2 text-xs font-semibold border border-gray-200 hover:bg-slate-50 text-gray-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold bg-navy text-white rounded-lg hover:bg-navy-light"
                >
                  {loading ? 'Recompiling...' : 'Save & Compile (Increment Version)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Academic Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg border border-gray-100 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-navy border-b border-gray-100 pb-2">Edit Batch Settings</h3>
            
            <form onSubmit={handleEditBatchSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">HOD Name</label>
                  <input
                    type="text"
                    required
                    value={editingBatch?.hodName || ''}
                    onChange={(e) => setEditingBatch(prev => ({ ...prev, hodName: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Principal Name</label>
                  <input
                    type="text"
                    required
                    value={editingBatch?.principalName || ''}
                    onChange={(e) => setEditingBatch(prev => ({ ...prev, principalName: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={editingBatch?.startDate || ''}
                    onChange={(e) => setEditingBatch(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={editingBatch?.endDate || ''}
                    onChange={(e) => setEditingBatch(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 text-xs font-semibold border border-gray-200 hover:bg-slate-50 text-gray-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-navy text-white rounded-lg hover:bg-navy-light"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Document Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl border border-gray-100 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 print:p-0 print:border-none print:shadow-none">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2 print:hidden">
              <h3 className="text-lg font-bold text-navy">Document Preview: {selectedDoc?.name} (v{selectedDoc?.version})</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 text-gray-500 hover:text-navy rounded border border-gray-200 flex items-center gap-1 text-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold border border-gray-200 hover:bg-slate-50 text-gray-500 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Simulated document layout representation */}
            <div className="bg-slate-50 p-8 border border-gray-200 rounded-lg min-h-[400px] text-xs font-serif text-slate-800 space-y-6 print:bg-white print:border-none print:p-0">
              {/* College Banner Header */}
              <div className="text-center space-y-1 border-b-2 border-navy pb-4">
                <h2 className="text-base font-bold text-navy uppercase">SANKARA COLLEGE OF SCIENCE AND COMMERCE</h2>
                <p className="text-[9px] text-gray-500 italic">Affiliated to Bharathiar University | Re-Accredited by NAAC with A+ Grade</p>
                <p className="text-[8px] text-gray-400">Saravanampatty, Coimbatore, Tamilnadu - 641035</p>
              </div>

              {/* Title */}
              <h3 className="text-center text-sm font-bold uppercase underline tracking-wide">
                {selectedDoc?.name}
              </h3>

              {/* Dynamic populated table values */}
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 text-left font-bold border-b border-gray-300">
                    <th className="p-2.5 border-r border-gray-300">Parameter Field</th>
                    <th className="p-2.5">Populated Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedDoc?.fieldValues || {}).map(([key, val]) => (
                    <tr key={key} className="border-b border-gray-300">
                      <td className="p-2.5 border-r border-gray-300 font-bold capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </td>
                      <td className="p-2.5">{val || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between pt-12 text-[10px] font-bold text-slate-700">
                <span>Staff In-charge Signature</span>
                <span>HOD / Principal Signature</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
