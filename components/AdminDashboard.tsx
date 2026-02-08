import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Save, Music, AlertCircle, CheckCircle2, Trash2, RefreshCw, Database, Lock, LogIn, LogOut, FileAudio, FileImage, FileArchive, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Track, ContactMessage } from '../types';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [beats, setBeats] = useState<Track[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'inbox' | 'soundkits'>('upload');

  // Auth State - uses Supabase Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Upload States
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check for existing Supabase session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setAuthLoading(false);
    };
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      setAuthLoading(false);
    } else {
      setIsAuthenticated(true);
      setAuthLoading(false);
      setError(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  // Updated Form Data to match New Schema
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    bpm: 140,
    key: 'Cm',
    genre: 'Trap',
    cover_path: '',
    preview_path: '',
    mp3_path: '',
    wav_path: '',
    stems_path: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchBeats();
      fetchMessages();
      fetchSoundKits();
    }
  }, [isAuthenticated, activeTab]);



  const fetchMessages = async () => {
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setMessages(data);
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    const { error } = await supabase.from('contact_messages').delete().match({ id });
    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  // --- SOUND KITS LOGIC ---
  const [soundKits, setSoundKits] = useState<any[]>([]);
  const [kitFormData, setKitFormData] = useState({
    title: '',
    type: 'Drum Kit',
    price: 29.99,
    description: 'High quality sounds.',
    cover_path: '',
    file_path: '',
    stripe_price_id: ''
  });

  // Fetch Kit Types on Mount
  const [kitTypes, setKitTypes] = useState<Record<string, { id: string, price: number }>>({}); // name -> { id, price }

  useEffect(() => {
    const fetchKitTypes = async () => {
      const { data } = await supabase.from('kit_types').select('*');
      if (data) {
        // console.log("Fetched Kit Types RAW:", data);
        const mapping: Record<string, { id: string, price: number }> = {};
        data.forEach((kt: any) => {
          mapping[kt.name] = {
            id: kt.stripe_price_id,
            price: kt.default_price ? parseFloat(kt.default_price) : 29.99
          };
        });
        setKitTypes(mapping);

        // Auto-set default type price if new form and mapping exists
        if (!kitFormData.stripe_price_id && mapping['Drum Kit']) {
          setKitFormData(prev => ({
            ...prev,
            stripe_price_id: mapping['Drum Kit'].id,
            price: mapping['Drum Kit'].price
          }));
        }
      }
    };
    fetchKitTypes();
  }, []); // Run once on mount

  const fetchSoundKits = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('sound_kits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching kits:', error);
    else if (data) {
      setSoundKits(data.map(k => ({
        ...k,
        coverUrl: k.cover_path,
        stripe_price_id: k.stripe_price_id
      })));
    }
    setFetching(false);
  };

  const handleKitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setKitFormData(prev => {
      const newData = { ...prev, [name]: name === 'price' ? parseFloat(value) : value };

      // Auto-fill Stripe ID and Price if type changes
      if (name === 'type') {
        const typeData = kitTypes[value];
        if (typeData) {
          newData.stripe_price_id = typeData.id;
          newData.price = typeData.price;
        }
      }

      return newData;
    });
  };

  const validateKitForm = (): string | null => {
    if (!kitFormData.title.trim()) return 'Kit title is required.';
    if (kitFormData.title.trim().length < 2) return 'Kit title must be at least 2 characters.';
    if (kitFormData.price <= 0) return 'Price must be greater than $0.';
    if (kitFormData.price > 9999) return 'Price seems too high. Please check.';
    if (!kitFormData.cover_path) return 'Cover image is required. Please upload one.';
    if (!kitFormData.file_path) return 'Kit file (ZIP) is required.';
    return null;
  };

  const handleKitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const validationError = validateKitForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const { error: dbError } = await supabase
        .from('sound_kits')
        .insert([{
          title: kitFormData.title.trim(),
          type: kitFormData.type,
          price: kitFormData.price,
          description: kitFormData.description,
          cover_path: kitFormData.cover_path,
          file_path: kitFormData.file_path,
          stripe_price_id: kitFormData.stripe_price_id
        }]);

      if (dbError) throw dbError;

      setSuccess(true);
      fetchSoundKits();

      // Reset form but keep default price ID if possible
      const defaultType = 'Drum Kit';
      const defaultData = kitTypes[defaultType];

      setKitFormData({
        title: '',
        type: defaultType,
        price: defaultData?.price || 29.99,
        description: 'High quality sounds.',
        cover_path: '',
        file_path: '',
        stripe_price_id: defaultData?.id || ''
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error inserting kit:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSoundKit = async (id: string) => {
    if (!window.confirm('Delete this sound kit?')) return;
    const { error } = await supabase.from('sound_kits').delete().eq('id', id);
    if (!error) {
      setSoundKits(prev => prev.filter(k => k.id !== id));
    }
  };

  useEffect(() => {
    if (activeTab === 'soundkits') {
      fetchSoundKits();
    }
  }, [activeTab]);

  const fetchBeats = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('beats')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching beats:', error);
    } else if (data) {
      const mappedBeats = data.map((b: any) => ({
        ...b,
        title: b.name,
        artist: 'Lejja',
        coverUrl: b.cover_path,
        audioUrl: b.preview_path,
        // Map DB snake_case to TS camelCase
        mp3Path: b.mp3_path,
        wavPath: b.wav_path,
        stemsPath: b.stems_path,
        genre: b.genre || 'Trap',
        price: 29.99
      }));
      setBeats(mappedBeats as Track[]);
    }
    setFetching(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bpm' ? parseFloat(value) : value
    }));
  };

  const uploadFile = async (file: File, bucket: string, fieldName: string) => {
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Update appropriate state based on active tab
      if (activeTab === 'soundkits') {
        setKitFormData(prev => ({
          ...prev,
          [fieldName]: publicUrl
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [fieldName]: publicUrl
        }));
      }

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Upload failed for ${fieldName}: ${err.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, bucket: string, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0], bucket, fieldName);
    }
  };

  const validateBeatForm = (): string | null => {
    if (!formData.name.trim()) return 'Beat name is required.';
    if (formData.name.trim().length < 2) return 'Beat name must be at least 2 characters.';
    if (formData.bpm < 40 || formData.bpm > 300) return 'BPM must be between 40 and 300.';
    if (!formData.key.trim()) return 'Musical key is required.';
    if (!formData.cover_path) return 'Cover image is required. Please upload one.';
    if (!formData.preview_path) return 'Preview MP3 is required. Please upload one.';
    if (!formData.mp3_path) return 'Full MP3 file is required for sale.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const validationError = validateBeatForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const { error: dbError } = await supabase
        .from('beats')
        .insert([{
          name: formData.name.trim(),
          slug: formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
          bpm: formData.bpm,
          key: formData.key,
          genre: formData.genre,
          cover_path: formData.cover_path,
          preview_path: formData.preview_path,
          mp3_path: formData.mp3_path,
          wav_path: formData.wav_path,
          stems_path: formData.stems_path
        }]);

      if (dbError) throw dbError;

      setSuccess(true);
      fetchBeats();

      setFormData(prev => ({
        ...prev,
        name: '',
        slug: '',
        genre: 'Trap',
        cover_path: '',
        preview_path: '',
        mp3_path: '',
        wav_path: '',
        stems_path: ''
      }));

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error inserting beat:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this beat?')) return;
    try {
      const { error } = await supabase.from('beats').delete().eq('id', id);
      if (error) throw error;
      setBeats(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      alert('Error deleting beat: ' + err.message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-dark-card border border-white/5 p-8 rounded-3xl shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary">
              <Lock size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-black uppercase text-center text-white mb-2 tracking-tighter italic">Admin Access</h2>
          <p className="text-gray-500 text-center text-xs mb-8 uppercase tracking-widest">Secure Restricted Area</p>

          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-soft border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
                placeholder="Enter admin email"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-soft border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-4 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary/80 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              <LogIn size={18} /> Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const isUploading = Object.values(uploading).some(v => v);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="bg-dark/50 border border-white/5 rounded-3xl p-8 max-w-6xl mx-auto backdrop-blur-3xl relative overflow-hidden h-[800px]">

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 items-center">
          <button
            onClick={handleLogout}
            className="ml-auto px-4 py-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all font-bold uppercase tracking-widest text-[10px] flex items-center gap-2"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            <span className="flex items-center gap-2"><Upload size={18} /> Upload Beats</span>
          </button>
          <button
            onClick={() => setActiveTab('soundkits')}
            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest transition-all ${activeTab === 'soundkits' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            <span className="flex items-center gap-2"><FileArchive size={18} /> Upload Kits</span>
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest transition-all ${activeTab === 'inbox' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            <span className="flex items-center gap-2"><Mail size={18} /> Inbox ({messages.length})</span>
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-[calc(100%-80px)]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-dark-card border border-white/5 rounded-3xl shadow-2xl relative flex flex-col h-full overflow-hidden"
            >
              <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-primary">
                    <Upload size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Upload New Beat</h1>
                    <p className="text-gray-500 text-xs">Bulk Upload & Auto-fill</p>
                  </div>
                </div>

                {success && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500"><CheckCircle2 size={20} /><span className="font-bold text-sm">Beat uploaded successfully!</span></div>}
                {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500"><AlertCircle size={20} /><span className="font-bold text-sm">{error}</span></div>}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-dark-soft border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Slug</label>
                        <input name="slug" value={formData.slug} onChange={handleChange} placeholder="auto-generated" className="w-full bg-dark-soft border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500">BPM</label>
                        <input type="number" name="bpm" value={formData.bpm} onChange={handleChange} className="w-full bg-dark-soft border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Key</label>
                        <input name="key" value={formData.key} onChange={handleChange} className="w-full bg-dark-soft border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Genre</label>
                        <select name="genre" value={formData.genre} onChange={handleChange} className="w-full bg-dark-soft border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none appearance-none">
                          <option value="Trap">Trap</option>
                          <option value="Drill">Drill</option>
                          <option value="R&B">R&B</option>
                          <option value="Boom Bap">Boom Bap</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ASSETS SECTION */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Media Assets</p>

                    {/* 1. COVER */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-[10px] uppercase font-bold text-pink-500">
                        <span>Cover Image {uploading['cover_path'] && <RefreshCw size={10} className="inline animate-spin ml-2" />}</span>
                        {formData.cover_path && <span className="text-green-500">✓ Uploaded</span>}
                      </label>
                      <div className="flex gap-2">
                        <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, 'covers', 'cover_path')} className="hidden" id="cover-upload" />
                        <label htmlFor="cover-upload" className="flex-1 bg-dark-soft border border-dashed border-white/20 hover:border-pink-500 rounded-lg px-3 py-3 text-gray-400 text-xs flex items-center gap-2 cursor-pointer transition-colors">
                          <FileImage size={14} /> {formData.cover_path ? 'Change Cover' : 'Select Cover Image'}
                        </label>
                      </div>
                      {formData.cover_path && <input name="cover_path" value={formData.cover_path} readOnly className="w-full bg-dark-soft/50 text-[10px] text-gray-500 p-2 rounded-lg border-none" />}
                    </div>

                    {/* 2. PREVIEW MP3 */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-[10px] uppercase font-bold text-yellow-500">
                        <span>Preview MP3 (Tagged) {uploading['preview_path'] && <RefreshCw size={10} className="inline animate-spin ml-2" />}</span>
                        {formData.preview_path && <span className="text-green-500">✓ Uploaded</span>}
                      </label>
                      <div className="flex gap-2">
                        <input type="file" accept="audio/mpeg" onChange={(e) => handleFileSelect(e, 'previews', 'preview_path')} className="hidden" id="preview-upload" />
                        <label htmlFor="preview-upload" className="flex-1 bg-dark-soft border border-dashed border-white/20 hover:border-yellow-500 rounded-lg px-3 py-3 text-gray-400 text-xs flex items-center gap-2 cursor-pointer transition-colors">
                          <FileAudio size={14} /> {formData.preview_path ? 'Change Preview' : 'Select Preview MP3'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* DOWNLOADS SECTION */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] uppercase font-bold text-primary mb-2">Downloadable Files (For Sale)</p>

                    {/* MP3 */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-[10px] uppercase font-bold text-green-500">
                        <span>Full MP3 {uploading['mp3_path'] && <RefreshCw size={10} className="inline animate-spin ml-2" />}</span>
                        {formData.mp3_path && <span className="text-green-500">✓ Ready</span>}
                      </label>
                      <div className="flex gap-2">
                        <input type="file" accept="audio/mpeg" onChange={(e) => handleFileSelect(e, 'beats', 'mp3_path')} className="hidden" id="mp3-upload" />
                        <label htmlFor="mp3-upload" className="flex-1 bg-dark-soft border border-dashed border-white/20 hover:border-green-500 rounded-lg px-3 py-3 text-gray-400 text-xs flex items-center gap-2 cursor-pointer transition-colors">
                          <Music size={14} /> {formData.mp3_path ? 'Change MP3' : 'Select Full MP3'}
                        </label>
                      </div>
                    </div>

                    {/* WAV */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-[10px] uppercase font-bold text-blue-500">
                        <span>Full WAV {uploading['wav_path'] && <RefreshCw size={10} className="inline animate-spin ml-2" />}</span>
                        {formData.wav_path && <span className="text-green-500">✓ Ready</span>}
                      </label>
                      <div className="flex flex-col gap-2">
                        {/* File Upload Option */}
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept=".wav,audio/wav,audio/x-wav,audio/wave,application/octet-stream"
                            onChange={(e) => handleFileSelect(e, 'beats', 'wav_path')}
                            className="hidden"
                            id="wav-upload"
                          />
                          <label htmlFor="wav-upload" className="flex-1 bg-dark-soft border border-dashed border-white/20 hover:border-blue-500 rounded-lg px-3 py-3 text-gray-400 text-xs flex items-center gap-2 cursor-pointer transition-colors">
                            <FileAudio size={14} /> {formData.wav_path ? 'Change WAV File' : 'Select Full WAV (<50MB)'}
                          </label>
                        </div>

                        {/* OR Divider */}
                        <div className="relative flex items-center py-1">
                          <div className="flex-grow border-t border-white/5"></div>
                          <span className="flex-shrink-0 mx-2 text-[8px] uppercase text-gray-600 font-bold">OR External Link</span>
                          <div className="flex-grow border-t border-white/5"></div>
                        </div>

                        {/* External Link Option */}
                        <input
                          name="wav_path"
                          value={formData.wav_path}
                          onChange={handleChange}
                          placeholder="Paste Dropbox/Google Drive link for large files..."
                          className="w-full bg-dark-soft border border-blue-500/20 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* STEMS */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-[10px] uppercase font-bold text-purple-500">
                        <span>Track Stems (ZIP) {uploading['stems_path'] && <RefreshCw size={10} className="inline animate-spin ml-2" />}</span>
                        {formData.stems_path && <span className="text-green-500">✓ Ready</span>}
                      </label>
                      <div className="flex flex-col gap-2">
                        {/* File Upload Option */}
                        <div className="flex gap-2">
                          <input type="file" accept=".zip,.rar" onChange={(e) => handleFileSelect(e, 'stems', 'stems_path')} className="hidden" id="stems-upload" />
                          <label htmlFor="stems-upload" className="flex-1 bg-dark-soft border border-dashed border-white/20 hover:border-purple-500 rounded-lg px-3 py-3 text-gray-400 text-xs flex items-center gap-2 cursor-pointer transition-colors">
                            <FileArchive size={14} /> {formData.stems_path ? 'Change Stems File' : 'Select Stems ZIP (<50MB)'}
                          </label>
                        </div>

                        {/* OR Divider */}
                        <div className="relative flex items-center py-1">
                          <div className="flex-grow border-t border-white/5"></div>
                          <span className="flex-shrink-0 mx-2 text-[8px] uppercase text-gray-600 font-bold">OR External Link</span>
                          <div className="flex-grow border-t border-white/5"></div>
                        </div>

                        {/* External Link Option */}
                        <input
                          name="stems_path"
                          value={formData.stems_path}
                          onChange={handleChange}
                          placeholder="Paste external download link..."
                          className="w-full bg-dark-soft border border-purple-500/20 rounded-lg px-3 py-2 text-white text-xs focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>

                  </div>

                  <button type="submit" disabled={loading || isUploading} className="w-full py-4 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary/80 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
                    {loading || isUploading ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> {(loading || isUploading) ? "UPLOADING..." : "PUBLISH BEAT"}</>}
                  </button>
                </form>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-secondary"><Database size={20} /></div>
                  <div><h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Inventory</h2><p className="text-gray-500 text-xs">{beats.length} tracks online</p></div>
                </div>
                <button onClick={fetchBeats} className="p-2 hover:bg-white/5 rounded-full transition-colors"><RefreshCw size={16} className={fetching ? "animate-spin text-primary" : "text-gray-500"} /></button>
              </div>
              <div className="flex-grow bg-dark-soft/30 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                <div className="overflow-y-auto max-h-[800px] custom-scrollbar">
                  {beats.map((beat) => (
                    <div key={beat.id} className="flex gap-4 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-card border border-white/10">
                        {beat.coverUrl ? <img src={beat.coverUrl} className="w-full h-full object-cover" /> : <Music className="w-full h-full p-2 text-gray-700" />}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h4 className="font-bold text-white text-sm truncate">{beat.title}</h4>
                        <div className="flex gap-2 mt-1">
                          {beat.mp3Path && <span className="text-[9px] bg-green-500/20 text-green-500 px-1 rounded">MP3</span>}
                          {beat.wavPath && <span className="text-[9px] bg-blue-500/20 text-blue-500 px-1 rounded">WAV</span>}
                          {beat.stemsPath && <span className="text-[9px] bg-purple-500/20 text-purple-500 px-1 rounded">STEMS</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <button onClick={() => handleDelete(beat.id)} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        ) : activeTab === 'soundkits' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-[calc(100%-80px)]">
            {/* Upload Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-dark-card border border-white/5 rounded-3xl shadow-2xl relative flex flex-col h-full overflow-hidden"
            >
              <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-primary">
                    <FileArchive size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Upload Sound Kit</h1>
                    <p className="text-gray-500 text-xs">Sample Packs & Drum Kits</p>
                  </div>
                </div>

                {success && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500"><CheckCircle2 size={20} /><span className="font-bold text-sm">Kit uploaded successfully!</span></div>}
                {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500"><AlertCircle size={20} /><span className="font-bold text-sm">{error}</span></div>}

                <form onSubmit={handleKitSubmit} className="space-y-6 relative z-10">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Title</label>
                        <input name="title" value={kitFormData.title} onChange={handleKitChange} required className="w-full bg-dark-soft border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Price ($)</label>
                        <input type="number" step="0.01" name="price" value={kitFormData.price} onChange={handleKitChange} className="w-full bg-dark-soft border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Stripe Price ID (e.g. price_1Hh...)</label>
                        <input name="stripe_price_id" value={(kitFormData as any).stripe_price_id || ''} onChange={handleKitChange} placeholder="Optional (Required for Checkout)" className="w-full bg-dark-soft border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Type</label>
                      <select name="type" value={kitFormData.type} onChange={handleKitChange} className="w-full bg-dark-soft border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none appearance-none">
                        <option value="Drum Kit">Drum Kit</option>
                        <option value="Loop Kit">Loop Kit</option>
                        <option value="Melody Pack">Melody Pack</option>
                        <option value="One Shot Kit">One Shot Kit</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Description</label>
                      <textarea name="description" value={kitFormData.description} onChange={handleKitChange} rows={3} className="w-full bg-dark-soft border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none resize-none" />
                    </div>
                  </div>

                  {/* ASSETS SECTION */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Kit Assets</p>

                    {/* COVER */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-[10px] uppercase font-bold text-pink-500">
                        <span>Cover Image {uploading['kit_cover'] && <RefreshCw size={10} className="inline animate-spin ml-2" />}</span>
                        {kitFormData.cover_path && <span className="text-green-500">✓ Uploaded</span>}
                      </label>
                      <div className="flex gap-2">
                        <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, 'covers', 'cover_path')} className="hidden" id="kit-cover-upload" />
                        <label htmlFor="kit-cover-upload" className="flex-1 bg-dark-soft border border-dashed border-white/20 hover:border-pink-500 rounded-lg px-3 py-3 text-gray-400 text-xs flex items-center gap-2 cursor-pointer transition-colors">
                          <FileImage size={14} /> {kitFormData.cover_path ? 'Change Cover' : 'Select Cover Image'}
                        </label>
                      </div>
                      {/* Using the handleFileSelect from existing logic, but we need to ensure it updates kitFormData if activeTab is soundkits. 
                          Currently handleFileSelect updates 'formData' not 'kitFormData'. 
                          I will modify handleFileSelect to be smarter or make a wrapper. 
                          For now, let's assume I'll fix handleFileSelect separately or just inline the logic.
                          Actually, re-using existing handleFileSelect will update the wrong state. 
                          I need a specific handler. */}
                    </div>

                    {/* ZIP FILE */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-[10px] uppercase font-bold text-purple-500">
                        <span>Kit File (ZIP) {uploading['kit_file'] && <RefreshCw size={10} className="inline animate-spin ml-2" />}</span>
                        {kitFormData.file_path && <span className="text-green-500">✓ Uploaded</span>}
                      </label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input type="file" accept=".zip,.rar" onChange={(e) => {
                            // Inline custom handler for kits
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              // Re-use upload logic but update kitFormData 
                              // I'll reimplement a small uploader here or refactor above.
                              // Refactoring above is cleaner. I'll do that in a subsequent step.
                              // For now, I'll assume I update handleFileSelect.
                              handleFileSelect(e, 'stems', 'file_path');
                            }
                          }} className="hidden" id="kit-file-upload" />
                          <label htmlFor="kit-file-upload" className="flex-1 bg-dark-soft border border-dashed border-white/20 hover:border-purple-500 rounded-lg px-3 py-3 text-gray-400 text-xs flex items-center gap-2 cursor-pointer transition-colors">
                            <FileArchive size={14} /> {kitFormData.file_path ? 'Change ZIP' : 'Select ZIP (<50MB)'}
                          </label>
                        </div>
                        <input
                          name="file_path"
                          value={kitFormData.file_path}
                          onChange={handleKitChange}
                          placeholder="Or paste external download link..."
                          className="w-full bg-dark-soft border border-purple-500/20 rounded-lg px-3 py-2 text-white text-xs focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary/80 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> PUBLISH KIT</>}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Inventory List */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-secondary"><Database size={20} /></div>
                  <div><h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Kit Inventory</h2><p className="text-gray-500 text-xs">{soundKits.length} kits online</p></div>
                </div>
                <button onClick={fetchSoundKits} className="p-2 hover:bg-white/5 rounded-full transition-colors"><RefreshCw size={16} className={fetching ? "animate-spin text-primary" : "text-gray-500"} /></button>
              </div>
              <div className="flex-grow bg-dark-soft/30 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                <div className="overflow-y-auto max-h-[800px] custom-scrollbar">
                  {soundKits.map((kit) => (
                    <div key={kit.id} className="flex gap-4 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-card border border-white/10">
                        {kit.coverUrl ? <img src={kit.coverUrl} className="w-full h-full object-cover" /> : <FileArchive className="w-full h-full p-2 text-gray-700" />}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h4 className="font-bold text-white text-sm truncate">{kit.title}</h4>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[9px] bg-white/10 text-gray-300 px-1 rounded">{kit.type}</span>
                          <span className="text-[9px] bg-primary/20 text-primary px-1 rounded">${kit.price}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <button onClick={() => deleteSoundKit(kit.id)} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase italic text-white">Message Inbox</h2>
              <button onClick={fetchMessages} className="p-2 hover:bg-white/5 rounded-lg"><RefreshCw size={20} /></button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-2 pb-20">
              {messages.length === 0 && <div className="text-gray-500 text-center py-20 uppercase font-bold">No messages found.</div>}
              {messages.map(msg => (
                <div key={msg.id} className="bg-dark-soft/40 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">{msg.subject || 'No Subject'}</h4>
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mt-1">
                        <span><MessageSquare size={12} className="inline mr-1" /> {msg.full_name}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400">{msg.email}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteMessage(msg.id)} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm bg-black/20 p-4 rounded-xl border border-white/5">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div >
  );
};

export default AdminDashboard;