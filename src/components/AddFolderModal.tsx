import React, { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

const AddFolderModal: React.FC<Props> = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Folder name is required');
    onAdd(name.trim());
    setName('');
    setError('');
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="terminal-card w-full max-w-md animate-fade-in" style={{ background: '#181a1b', borderColor: '#39ff14' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: '#39ff14', fontFamily: 'Fira Mono, monospace' }}>add folder</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium" style={{ color: '#39ff14' }}>folder name *</label>
            <input className="w-full" value={name} onChange={e => setName(e.target.value)} required />
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

export default AddFolderModal; 