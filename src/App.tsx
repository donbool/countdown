import React, { useState } from 'react';
import { CountdownProvider, useCountdowns, Folder } from './context/CountdownContext';
import AddCountdownModal from './components/AddCountdownModal';
import { v4 as uuidv4 } from 'uuid';
import CountdownTimer from './components/CountdownTimer';
import AddFolderModal from './components/AddFolderModal';
import { FolderIcon, PlusIcon, ArrowLeftIcon, HomeIcon, XMarkIcon } from '@heroicons/react/24/outline';

type Page = 'dashboard' | 'add-countdown' | 'add-folder';

const TitleBar: React.FC = () => (
  <div className="h-10 flex items-center px-4 bg-white border-b border-gray-200 select-none">
    <span className="font-semibold text-gray-700 tracking-wide text-lg">Countdown Manager</span>
  </div>
);

const Sidebar: React.FC<{ folders: Folder[]; onSelect: (id: string | null) => void; selected: string | null; onAddFolder: () => void; openDeleteModal: (type: 'countdown' | 'folder', id: string) => void; isModalOpen: boolean }> = ({ folders, onSelect, selected, onAddFolder, openDeleteModal, isModalOpen }) => (
  <aside className="sidebar hidden md:flex flex-col w-64 h-full rounded-r-3xl overflow-hidden flex-shrink-0 min-w-0">
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <span className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'Fira Mono, monospace', color: '#39ff14' }}><FolderIcon className="w-5 h-5" />folders</span>
      <button onClick={onAddFolder} className="terminal-btn px-2 py-1 text-xs">+</button>
    </div>
    <nav className="flex-1 overflow-y-auto">
      <ul>
        <li>
          <button className={`w-full text-left px-6 py-3 ${selected === null ? 'bg-[#23272e] font-semibold' : ''} rounded-none transition-colors`} onClick={() => onSelect(null)} style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace' }}>
            countdowns
          </button>
        </li>
        {folders.map(folder => (
          <li key={folder.id} className="flex items-center group">
            <button className={`flex-1 w-full text-left px-6 py-3 flex items-center gap-2 ${selected === folder.id ? 'bg-[#23272e] font-semibold' : ''} rounded-none transition-colors`} onClick={() => onSelect(folder.id)} style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace' }}>
              <FolderIcon className="w-5 h-5" /> {folder.name}
            </button>
            <button
              className="mr-0 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Delete folder"
              onClick={e => { e.stopPropagation(); openDeleteModal('folder', folder.id); }}
              tabIndex={isModalOpen ? -1 : 0}
              style={{ pointerEvents: isModalOpen ? 'none' : undefined, background: '#23272e', border: 'none', boxShadow: 'none' }}
            >
              <span style={{ color: '#ff3b3b', fontSize: 20, fontWeight: 900, lineHeight: 1 }}>×</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

const Navbar: React.FC<{ onAddCountdown: () => void; onAddFolder: () => void }> = ({ onAddCountdown, onAddFolder }) => (
  <nav className="terminal-navbar">
    <span>benji@countdown:~$ <span className="blink">█</span></span>
    <div className="ml-auto flex items-center">
      <button onClick={onAddFolder} className="terminal-btn">new folder</button>
      <button onClick={onAddCountdown} className="terminal-btn">add countdown</button>
    </div>
  </nav>
);

const Dashboard: React.FC<{
  onAddClick: () => void;
  selectedFolder: string | null;
  openDeleteModal: (type: 'countdown' | 'folder', id: string) => void;
  isModalOpen: boolean;
  expandCard: (id: string, note: string) => void;
  collapseCard: () => void;
  handleSaveNoteInline: (id: string) => void;
  expandedCountdownId: string | null;
  noteDraft: string;
  setNoteDraft: React.Dispatch<React.SetStateAction<string>>;
}> = ({ onAddClick, selectedFolder, openDeleteModal, isModalOpen, expandCard, collapseCard, handleSaveNoteInline, expandedCountdownId, noteDraft, setNoteDraft }) => {
  const { folders, countdowns } = useCountdowns();
  const [selected, setSelected] = React.useState<string | null>(selectedFolder);

  React.useEffect(() => { setSelected(selectedFolder); }, [selectedFolder]);

  if (!selected) {
    // Home: show folders as cards, then ungrouped countdowns
    const [now, setNow] = React.useState(() => new Date());
    React.useEffect(() => {
      const interval = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(interval);
    }, []);
    const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const dateStr = estTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = estTime.toLocaleTimeString('en-US', { hour12: false });
    return (
      <div className="w-full max-w-2xl mx-auto mx-8" style={{ fontFamily: 'Fira Mono, monospace' }}>
        <div className="flex items-center justify-between mb-6" style={{ color: '#39ff14' }}>
          <span className="text-lg font-bold" style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace', letterSpacing: '0.01em', textTransform: 'lowercase', paddingLeft: '0.5rem', paddingTop: '0.5rem' }}>
            today: {dateStr} {timeStr} <span style={{ fontSize: '0.9em', opacity: 0.7 }}>est</span>
          </span>
        </div>
        <div className="flex items-center mb-4" style={{ color: '#39ff14' }}>
          <h2 className="text-2xl font-bold pl-2" style={{ color: '#39ff14', padding: '0.5rem' }}>folders</h2>
        </div>
        <div className="mb-8 flex flex-wrap">
          {folders.map(folder => (
            <div
              key={folder.id}
              className="folder-card w-48 mr-6 mb-4 p-2 cursor-pointer hover:border-cyan-400 hover:shadow-lg flex justify-between group"
              onClick={() => window.dispatchEvent(new CustomEvent('select-folder', { detail: folder.id }))}
              style={{ position: 'relative' }}
            >
              <span className="font-bold text-base countdown-name" style={{ color: '#00fff7', minWidth: 0, fontFamily: 'Fira Mono, monospace', marginLeft: '-1rem', marginRight: '0.3rem' }}>{folder.name}</span>
              <button
                className="mr-0 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Delete folder"
                onClick={e => { e.stopPropagation(); openDeleteModal('folder', folder.id); }}
                tabIndex={isModalOpen ? -1 : 0}
                style={{ pointerEvents: isModalOpen ? 'none' : undefined, background: '#23272e', border: 'none', boxShadow: 'none', position: 'absolute', right: '0.5rem' }}
              >
                <span style={{ color: '#ff3b3b', fontSize: 20, fontWeight: 900, lineHeight: 1 }}>×</span>
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center mb-4" style={{ color: '#39ff14' }}>
          <h2 className="text-2xl font-bold pl-2" style={{ color: '#39ff14', padding: '0.5rem' }}>countdowns</h2>
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-2${isModalOpen ? ' blur-sm pointer-events-none select-none' : ''}`}>
          {countdowns.filter(c => !c.folderId).map(c => {
            const isExpanded = expandedCountdownId === c.id;
            return (
              <div
                key={c.id}
                className={`terminal-card animate-fade-in group cursor-pointer transition-all duration-200 ${isExpanded ? 'py-4 min-h-[120px]' : ''}`}
                onClick={e => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  if (!isExpanded) {
                    expandCard(c.id, c.note || '');
                  }
                  // Do nothing if already expanded
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-base countdown-name" style={{ color: '#00fff7', minWidth: 0 }}>{c.name}</span>
                  <span className="font-mono text-sm" style={{ color: '#39ff14' }}><CountdownTimer date={c.date} time={c.time} /></span>
                  <button
                    className="ml-2 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete countdown"
                    onClick={e => { e.stopPropagation(); openDeleteModal('countdown', c.id); }}
                    tabIndex={isModalOpen ? -1 : 0}
                    style={{
                      pointerEvents: isModalOpen ? 'none' : undefined,
                      background: '#23272e',
                      border: 'none',
                      boxShadow: 'none',
                    }}
                  >
                    <span style={{ color: '#ff3b3b', fontSize: 24, fontWeight: 900, lineHeight: 1 }}>×</span>
                  </button>
                </div>
                {isExpanded && (
                  <div style={{ marginTop: '1rem' }}>
                    <textarea
                      className="w-full mb-1 px-0 py-1 font-mono text-indigo-100 resize-none focus:outline-none focus:ring-0 bg-transparent border-none shadow-none"
                      style={{ fontSize: '1em', lineHeight: '1.5', boxShadow: 'none', marginLeft: 0, marginRight: 'auto', display: 'block', overflow: 'hidden' }}
                      rows={1}
                      value={noteDraft}
                      onChange={e => { e.stopPropagation(); setNoteDraft(e.target.value); }}
                      onInput={e => {
                        const ta = e.currentTarget;
                        ta.style.height = 'auto';
                        ta.style.height = ta.scrollHeight + 'px';
                      }}
                      placeholder="Write a note..."
                      autoFocus
                    />
                    <div className="flex gap-1 mt-1 justify-end">
                      <button
                        className="terminal-btn !text-[8px] !px-0 !py-0 !font-normal"
                        onClick={e => { e.stopPropagation(); handleSaveNoteInline(c.id); }}
                      >Save</button>
                      <button
                        className="terminal-btn !text-[8px] !px-0 !py-0 !font-normal"
                        onClick={e => { e.stopPropagation(); collapseCard(); }}
                      >Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Folder selected: show only that folder's countdowns
  const folder = folders.find(f => f.id === selected);
  const showEmpty = countdowns.filter(c => c.folderId === selected).length === 0;
  return (
    <div className="w-full max-w-2xl mx-auto mx-8" style={{ fontFamily: 'Fira Mono, monospace' }}>
      <div className="flex items-center justify-between mb-6" style={{ color: '#39ff14' }}>
        <h2 className="text-2xl font-bold pl-2" style={{ color: '#39ff14', padding: '0.5rem' }}>{folder ? folder.name : ''}</h2>
        <button
          className="terminal-btn flex items-center gap-2 px-3 py-1 text-base font-bold"
          style={{ marginLeft: '0.75rem', boxShadow: 'none' }}
          onClick={() => window.dispatchEvent(new CustomEvent('back-to-all'))}
          aria-label="Back"
        >
          <span style={{ fontSize: '1.5rem', lineHeight: 1, color: '#39ff14', display: 'inline-block', fontFamily: 'Fira Mono, monospace' }}>←</span>
        </button>
      </div>
      {showEmpty && (
        <div className="text-center" style={{ color: '#39ff14', opacity: 0.7 }}>no countdowns yet in this folder.</div>
      )}
      <div className={`grid grid-cols-1 sm:grid-cols-2${isModalOpen ? ' blur-sm pointer-events-none select-none' : ''}`}>
        {countdowns.filter(c => c.folderId === selected).map(c => {
          const isExpanded = expandedCountdownId === c.id;
          return (
            <div
              key={c.id}
              className={`terminal-card animate-fade-in group cursor-pointer transition-all duration-200 ${isExpanded ? 'py-4 min-h-[120px]' : ''}`}
              onClick={e => {
                if ((e.target as HTMLElement).closest('.delete-btn')) return;
                if (!isExpanded) {
                  expandCard(c.id, c.note || '');
                }
                // Do nothing if already expanded
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-base countdown-name" style={{ color: '#00fff7', minWidth: 0 }}>{c.name}</span>
                <span className="font-mono text-sm" style={{ color: '#39ff14' }}><CountdownTimer date={c.date} time={c.time} /></span>
                <button
                  className="ml-2 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete countdown"
                  onClick={e => { e.stopPropagation(); openDeleteModal('countdown', c.id); }}
                  tabIndex={isModalOpen ? -1 : 0}
                  style={{
                    pointerEvents: isModalOpen ? 'none' : undefined,
                    background: '#23272e',
                    border: 'none',
                    boxShadow: 'none',
                  }}
                >
                  <span style={{ color: '#ff3b3b', fontSize: 24, fontWeight: 900, lineHeight: 1 }}>×</span>
                </button>
              </div>
              {isExpanded && (
                <div style={{ marginTop: '1rem' }}>
                  <textarea
                    className="w-full mb-1 px-0 py-1 font-mono text-indigo-100 resize-none focus:outline-none focus:ring-0 bg-transparent border-none shadow-none"
                    style={{ fontSize: '1em', lineHeight: '1.5', boxShadow: 'none', marginLeft: 0, marginRight: 'auto', display: 'block', overflow: 'hidden' }}
                    rows={1}
                    value={noteDraft}
                    onChange={e => { e.stopPropagation(); setNoteDraft(e.target.value); }}
                    onInput={e => {
                      const ta = e.currentTarget;
                      ta.style.height = 'auto';
                      ta.style.height = ta.scrollHeight + 'px';
                    }}
                    placeholder="Write a note..."
                    autoFocus
                  />
                  <div className="flex gap-1 mt-1 justify-end">
                    <button
                      className="terminal-btn !text-[8px] !px-0 !py-0 !font-normal"
                      onClick={e => { e.stopPropagation(); handleSaveNoteInline(c.id); }}
                    >Save</button>
                    <button
                      className="terminal-btn !text-[8px] !px-0 !py-0 !font-normal"
                      onClick={e => { e.stopPropagation(); collapseCard(); }}
                    >Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AddCountdownPage: React.FC<{ onBack: () => void; onAdd: (data: { name: string; date: string; time?: string }) => void }> = ({ onBack, onAdd }) => {
  const [name, setName] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required');
    if (!date) return setError('Date is required');
    onAdd({ name: name.trim(), date, time: time || undefined });
    setName(''); setDate(''); setTime(''); setError('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full" style={{ background: '#232347' }}>
      <div className="terminal-card w-full max-w-md animate-fade-in" style={{ background: '#181a1b', borderColor: '#39ff14', fontFamily: 'Fira Mono, monospace' }}>
        <button className="mb-4 flex items-center gap-2 terminal-btn" style={{ color: '#39ff14', background: 'none', border: 'none', boxShadow: 'none', fontSize: '1rem', padding: 0 }} onClick={onBack}><ArrowLeftIcon className="w-5 h-5" />back</button>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace', textTransform: 'lowercase' }}>add countdown</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-bold" style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace', textTransform: 'lowercase', paddingTop: '0rem', paddingBottom: '0.5rem' }}>name *</label>
            <input className="w-full" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1 font-bold" style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace', textTransform: 'lowercase', paddingTop: '1rem', paddingBottom: '0.5rem' }}>date *</label>
            <input type="date" className="w-full" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div style={{ paddingBottom: '1rem'}}>
            <label className="block mb-1 font-bold" style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace', textTransform: 'lowercase', paddingTop: '1rem', paddingBottom: '0.5rem' }}>time (optional)</label>
            <input type="time" className="w-full" value={time} onChange={e => setTime(e.target.value)}/>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="terminal-btn">add countdown</button>
        </form>
      </div>
    </div>
  );
};

const AddFolderPage: React.FC<{ onBack: () => void; onAdd: (name: string) => void }> = ({ onBack, onAdd }) => {
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Folder name is required');
    onAdd(name.trim());
    setName(''); setError('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full" style={{ background: '#232347' }}>
      <div className="terminal-card w-full max-w-md animate-fade-in" style={{ background: '#181a1b', borderColor: '#39ff14', fontFamily: 'Fira Mono, monospace' }}>
        <button className="mb-4 flex items-center gap-2 terminal-btn" style={{ color: '#39ff14', background: 'none', border: 'none', boxShadow: 'none', fontSize: '1rem', padding: 0 }} onClick={onBack}><ArrowLeftIcon className="w-5 h-5" />back</button>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace', textTransform: 'lowercase' }}>add folder</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div style={{ paddingBottom: '1rem'}}>
            <label className="block mb-1 font-bold" style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace', textTransform: 'lowercase' }}>folder name *</label>
            <input className="w-full" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="terminal-btn">add folder</button>
        </form>
      </div>
    </div>
  );
};

const DashboardWithPages: React.FC = () => {
  const { folders, countdowns, setData } = useCountdowns();
  const [page, setPage] = React.useState<Page>('dashboard');
  const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ type: 'countdown' | 'folder'; id: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [expandedCountdownId, setExpandedCountdownId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'countdown') {
      setData({
        folders,
        countdowns: countdowns.filter(c => c.id !== deleteTarget.id),
      });
    } else if (deleteTarget.type === 'folder') {
      setData({
        folders: folders.filter(f => f.id !== deleteTarget.id),
        countdowns: countdowns.filter(c => c.folderId !== deleteTarget.id),
      });
      // If the deleted folder was selected, go back to all
      if (selectedFolder === deleteTarget.id) setSelectedFolder(null);
    }
    setDeleteTarget(null);
    setIsModalOpen(false);
  };

  const openDeleteModal = (type: 'countdown' | 'folder', id: string) => {
    setDeleteTarget({ type, id });
    setIsModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setIsModalOpen(false);
  };

  const renderDeleteModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" style={{ zIndex: 1 }} />
      <div className="terminal-card p-8 animate-fade-in flex flex-col items-center z-10" style={{ background: '#181a1b', borderColor: '#39ff14', zIndex: 2, width: '350px', margin: '0 auto', paddingLeft: '100rem', paddingRight: '1.5rem' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace' }}>Are you sure?</h2>
        <p className="mb-6 text-center" style={{ color: '#e5e5e5' }}>
          {deleteTarget?.type === 'countdown'
            ? 'This will permanently delete the countdown.'
            : 'This will permanently delete the folder and all its countdowns.'}
        </p>
        <div className="flex gap-4">
          <button className="terminal-btn" onClick={closeDeleteModal}>Cancel</button>
          <button className="terminal-btn" style={{ borderColor: '#ff3b3b', color: '#ff3b3b' }} onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );

  React.useEffect(() => {
    const handler = () => setSelectedFolder(null);
    window.addEventListener('back-to-all', handler as any);
    return () => window.removeEventListener('back-to-all', handler as any);
  }, []);

  const handleAddCountdown = (data: { name: string; date: string; time?: string }) => {
    setData({
      folders,
      countdowns: [
        ...countdowns,
        { ...data, id: uuidv4(), notified: false, folderId: selectedFolder || undefined },
      ],
    });
    setPage('dashboard');
  };
  const handleAddFolder = (name: string) => {
    setData({
      folders: [...folders, { id: uuidv4(), name }],
      countdowns,
    });
    setPage('dashboard');
  };

  // Listen for folder selection from dashboard card
  React.useEffect(() => {
    const handler = (e: any) => setSelectedFolder(e.detail);
    window.addEventListener('select-folder', handler);
    return () => window.removeEventListener('select-folder', handler);
  }, []);

  const expandCard = (id: string, note: string) => {
    setExpandedCountdownId(id);
    setNoteDraft(note);
  };
  const collapseCard = () => setExpandedCountdownId(null);
  const handleSaveNote = (id: string, note: string) => {
    setData({
      folders,
      countdowns: countdowns.map(c => c.id === id ? { ...c, note } : c),
    });
  };
  const handleSaveNoteInline = (id: string) => {
    handleSaveNote(id, noteDraft);
    setExpandedCountdownId(null);
  };

  return (
    <div className="h-screen w-screen bg-[#232347] font-sans relative overflow-hidden">
      {/* Blur wrapper for all app content */}
      <div className={isModalOpen ? 'fixed inset-0 w-full h-full z-40 flex flex-col blur-sm pointer-events-none select-none' : 'relative z-0 flex flex-col h-full'}>
        <div className="mac-titlebar" />
        <Navbar
          onAddCountdown={() => setPage('add-countdown')}
          onAddFolder={() => setPage('add-folder')}
        />
        <div className="flex flex-1 min-h-0">
          <Sidebar folders={folders} onSelect={setSelectedFolder} selected={selectedFolder} onAddFolder={() => setPage('add-folder')} openDeleteModal={openDeleteModal} isModalOpen={isModalOpen} />
          <main className="flex-1 min-h-0 max-h-screen overflow-y-auto p-0 animate-fade-in">
            {page === 'dashboard' && (
              <Dashboard
                onAddClick={() => setPage('add-countdown')}
                selectedFolder={selectedFolder}
                openDeleteModal={openDeleteModal}
                isModalOpen={isModalOpen}
                expandCard={expandCard}
                collapseCard={collapseCard}
                handleSaveNoteInline={handleSaveNoteInline}
                expandedCountdownId={expandedCountdownId}
                noteDraft={noteDraft}
                setNoteDraft={setNoteDraft}
              />
            )}
            {page === 'add-countdown' && <AddCountdownPage onBack={() => setPage('dashboard')} onAdd={handleAddCountdown} />}
            {page === 'add-folder' && <AddFolderPage onBack={() => setPage('dashboard')} onAdd={handleAddFolder} />}
          </main>
        </div>
      </div>
      {/* Modal absolutely/fixed centered over everything */}
      {isModalOpen && (
        <div className="fixed inset-0 min-h-screen z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
          <div className="terminal-card p-8 animate-fade-in flex flex-col items-center z-10" style={{ background: '#181a1b', borderColor: '#39ff14', zIndex: 2, width: '350px', margin: '0 auto' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace' }}>Are you sure?</h2>
            <p className="mb-6 text-center" style={{ color: '#e5e5e5' }}>This will permanently delete the countdown.</p>
            <div className="flex gap-4">
              <button className="terminal-btn" onClick={closeDeleteModal}>Cancel</button>
              <button className="terminal-btn" style={{ borderColor: '#ff3b3b', color: '#ff3b3b' }} onClick={() => handleDelete()}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <CountdownProvider>
      <DashboardWithPages />
    </CountdownProvider>
  );
};

export default App; 