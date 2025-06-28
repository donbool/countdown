import React, { useState } from 'react';
import { Folder } from '../context/CountdownContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; date: string; time?: string; folderId?: string }) => void;
  folders: Folder[];
}

const AddCountdownModal: React.FC<Props> = ({ open, onClose, onAdd, folders }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [folderId, setFolderId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required');
    if (!date) return setError('Date is required');
    onAdd({ name: name.trim(), date, time: time || undefined, folderId: folderId || undefined });
    setName(''); setDate(''); setTime(''); setFolderId(''); setError('');
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="terminal-card w-full max-w-md animate-fade-in" style={{ background: '#181a1b', borderColor: '#39ff14' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace' }}>add countdown</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium" style={{ color: '#39ff14' }}>name *</label>
            <input className="w-full" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1 font-medium" style={{ color: '#39ff14' }}>date *</label>
            <input type="date" className="w-full" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1 font-medium" style={{ color: '#39ff14' }}>time (optional)</label>
            <input type="time" className="w-full" value={time} onChange={e => setTime(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 font-medium" style={{ color: '#39ff14' }}>folder (optional)</label>
            <select className="w-full" value={folderId} onChange={e => setFolderId(e.target.value)}>
              <option value="">None</option>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="terminal-btn" onClick={onClose}>cancel</button>
            <button type="submit" className="terminal-btn">add</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCountdownModal; 