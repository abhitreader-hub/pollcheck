import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, User, MapPin, Calendar, CheckCircle2, Circle, Loader2, AlertTriangle, X } from 'lucide-react';
import { searchVoters, listVoters, toggleVote, VoterFromAPI, VotersSearchResponse } from '../services/voters';

type VoteFilter = 'all' | 'voted' | 'not_voted';

interface VoterListProps {
  searchQuery: string;
  voteFilter?: VoteFilter;
  onVoteChange?: () => void;
}

// Confirmation Modal Component
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  voterName: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, voterName, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-amber-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Confirm Unvote
          </h3>
          <p className="text-gray-600">
            Are you sure you want to mark <span className="font-semibold text-gray-900">"{voterName}"</span> as not voted?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This action will remove their voted status.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-200 transition-all"
          >
            Yes, Unvote
          </button>
        </div>
      </div>
    </div>
  );
};

export const VoterList: React.FC<VoterListProps> = ({ searchQuery, voteFilter = 'all', onVoteChange }) => {
  const [voters, setVoters] = useState<VoterFromAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 20 });
  const [togglingVote, setTogglingVote] = useState<string | null>(null);
  const [confirmUnvote, setConfirmUnvote] = useState<VoterFromAPI | null>(null);

  const fetchVoters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response: VotersSearchResponse;
      if (searchQuery.trim().length >= 2) {
        response = await searchVoters(searchQuery, page, 20, voteFilter);
      } else {
        response = await listVoters(page, 20, { voteFilter });
      }
      setVoters(response.voters);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch voters');
      setVoters([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page, voteFilter]);

  const handleToggleVote = async (voter: VoterFromAPI) => {
    // If voter has already voted, show confirmation modal before unvoting
    if (voter.hasVoted) {
      setConfirmUnvote(voter);
      return;
    }

    await performToggleVote(voter);
  };

  const performToggleVote = async (voter: VoterFromAPI) => {
    setTogglingVote(voter._id);
    try {
      const result = await toggleVote(voter._id);
      // Update the voter in the list
      setVoters(prev => prev.map(v => 
        v._id === voter._id 
          ? { ...v, hasVoted: result.hasVoted, votedAt: result.votedAt }
          : v
      ));
      // Notify parent to refresh stats
      onVoteChange?.();
    } catch (err) {
      console.error('Failed to toggle vote:', err);
    } finally {
      setTogglingVote(null);
    }
  };

  const handleConfirmUnvote = async () => {
    if (confirmUnvote) {
      await performToggleVote(confirmUnvote);
      setConfirmUnvote(null);
    }
  };

  const handleCancelUnvote = () => {
    setConfirmUnvote(null);
  };

  useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  // Reset to page 1 when search query or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, voteFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500">Loading voters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-red-100 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <Search className="text-red-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-red-900 mb-1">Error loading voters</h3>
        <p className="text-red-600 max-w-sm">{error}</p>
        <button
          onClick={fetchVoters}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (voters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <Search className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No voters found</h3>
        <p className="text-gray-500 max-w-sm">
          {searchQuery ? 'Try a different search term.' : 'No voter data available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Results count */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{voters.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{pagination.total.toLocaleString()}</span> voters
        </span>
        {searchQuery && (
          <span className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
            🔍 "<span className="font-medium">{searchQuery}</span>"
          </span>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold tracking-wider">Voter Details</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold tracking-wider">Voter ID</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold tracking-wider">Relation</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold tracking-wider">House No</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold tracking-wider">Age</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold tracking-wider">Gender</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-bold tracking-wider text-center">Vote Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {voters.map((voter, index) => (
              <tr 
                key={voter._id} 
                className={`transition-all duration-200 hover:bg-indigo-50/40 ${voter.hasVoted ? 'bg-gradient-to-r from-green-50/50 to-emerald-50/30' : ''}`}
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center text-white font-semibold shadow-md ${
                      voter.hasVoted 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                        : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                    }`}>
                      {voter.hasVoted ? <CheckCircle2 size={20} /> : (voter.nameEnglish?.charAt(0) || voter.nameMarathi?.charAt(0) || '?')}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{voter.nameEnglish}</div>
                      <div className="text-sm text-gray-500">{voter.nameMarathi}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {voter.voterId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{voter.relationEnglish}</div>
                  <div className="text-xs text-gray-400">{voter.relationMarathi}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    <MapPin size={12} className="mr-1" />
                    {voter.houseNo || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center text-sm text-gray-700 font-medium">
                    {voter.age || 'N/A'}
                    <span className="text-xs text-gray-400 ml-1">yrs</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                    voter.gender === 'Male' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 ring-1 ring-blue-200' :
                    voter.gender === 'Female' ? 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 ring-1 ring-pink-200' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {voter.gender}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleVote(voter)}
                    disabled={togglingVote === voter._id}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm ${
                      voter.hasVoted
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-green-200'
                        : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200 hover:ring-gray-300'
                    } ${togglingVote === voter._id ? 'opacity-60 cursor-wait scale-95' : 'cursor-pointer'}`}
                  >
                    {togglingVote === voter._id ? (
                      <Loader2 size={16} className="mr-2 animate-spin" />
                    ) : voter.hasVoted ? (
                      <CheckCircle2 size={16} className="mr-2" />
                    ) : (
                      <Circle size={16} className="mr-2" />
                    )}
                    {voter.hasVoted ? 'Voted' : 'Mark Voted'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col divide-y divide-gray-100">
        {voters.map((voter) => (
          <div key={voter._id} className={`p-4 ${voter.hasVoted ? 'bg-green-50/30' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                  voter.hasVoted 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                    : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                }`}>
                  {voter.hasVoted ? <CheckCircle2 size={24} /> : (voter.nameEnglish?.charAt(0) || '?')}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{voter.nameEnglish}</h4>
                  <p className="text-sm text-gray-500">{voter.nameMarathi}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{voter.voterId}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                voter.gender === 'Male' ? 'bg-blue-100 text-blue-800' :
                voter.gender === 'Female' ? 'bg-pink-100 text-pink-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {voter.gender}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mt-2 pt-2 border-t border-gray-50">
              <span>Age: {voter.age || 'N/A'}</span>
              <span>House: {voter.houseNo || 'N/A'}</span>
              <button
                onClick={() => handleToggleVote(voter)}
                disabled={togglingVote === voter._id}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  voter.hasVoted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                } ${togglingVote === voter._id ? 'opacity-50' : ''}`}
              >
                {togglingVote === voter._id ? (
                  <Loader2 size={12} className="mr-1 animate-spin" />
                ) : voter.hasVoted ? (
                  <CheckCircle2 size={12} className="mr-1" />
                ) : (
                  <Circle size={12} className="mr-1" />
                )}
                {voter.hasVoted ? 'Voted' : 'Mark Voted'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow'
            }`}
          >
            <ChevronLeft size={18} className="mr-1" />
            Previous
          </button>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
              Page <span className="font-bold text-indigo-600">{page}</span> of{' '}
              <span className="font-bold text-gray-700">{pagination.pages}</span>
            </span>
          </div>

          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page >= pagination.pages}
            className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              page >= pagination.pages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow'
            }`}
          >
            Next
            <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmUnvote !== null}
        voterName={confirmUnvote?.nameEnglish || ''}
        onConfirm={handleConfirmUnvote}
        onCancel={handleCancelUnvote}
      />
    </div>
  );
};
