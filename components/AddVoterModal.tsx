import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Gender, Voter } from '../types';

interface AddVoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (voter: Omit<Voter, 'id' | 'hasVoted' | 'avatarUrl'>) => void;
}

export const AddVoterModal: React.FC<AddVoterModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [voterId, setVoterId] = useState('');
  const [pollBoothNumber, setPollBoothNumber] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.Male);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !voterId || !pollBoothNumber) return;

    onAdd({
      name,
      voterId,
      pollBoothNumber,
      gender,
    });

    // Reset form
    setName('');
    setVoterId('');
    setPollBoothNumber('');
    setGender(Gender.Male);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-2">
            <UserPlus className="text-indigo-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Register New Voter</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. Rahul Kumar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID</label>
              <input
                type="text"
                required
                value={voterId}
                onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all uppercase"
                placeholder="ABC1234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poll Booth No.</label>
              <input
                type="text"
                required
                value={pollBoothNumber}
                onChange={(e) => setPollBoothNumber(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="PB-01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <div className="flex space-x-4">
              {[Gender.Male, Gender.Female, Gender.Other].map((g) => (
                <label key={g} className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 rounded-full border border-gray-300 peer-checked:border-indigo-600 peer-checked:border-4 transition-all"></div>
                  </div>
                  <span className={`text-sm ${gender === g ? 'text-indigo-900 font-medium' : 'text-gray-600'}`}>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-200"
          >
            Add Voter
          </button>
        </form>
      </div>
    </div>
  );
};
