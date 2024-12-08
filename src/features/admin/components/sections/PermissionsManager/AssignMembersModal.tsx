import React, { useState, useEffect } from 'react';
import { X, Search, Shield, RefreshCw } from 'lucide-react';
import { useTeamStore } from '@/stores/teamStore';
import { type KitchenRole } from '@/config/kitchen-roles';
import toast from 'react-hot-toast';

interface AssignMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: KitchenRole;
}

export const AssignMembersModal: React.FC<AssignMembersModalProps> = ({
  isOpen,
  onClose,
  role
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { members, isLoading, error, fetchTeamMembers, updateMember } = useTeamStore();
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch team members when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers().catch(error => {
        console.error('Error fetching team members:', error);
        toast.error('Failed to load team members');
      });
    }
  }, [isOpen, fetchTeamMembers]);

  // Filter members based on search and current role
  const filteredMembers = members.filter(member => {
    const matchesSearch = (
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Don't show members already assigned to this role
    const hasRole = member.kitchenRole === role;
    return matchesSearch && !hasRole;
  });

  const handleAssign = async (memberId: string) => {
    setIsAssigning(true);
    try {
      await updateMember(memberId, { kitchenRole: role });
      // Refresh team members to update UI
      await fetchTeamMembers();
      toast.success('Role assigned successfully');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Assign Team Members</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          {/* Members List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-400">Loading team members...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-400 py-8">
                <p>{error}</p>
                <button
                  onClick={() => fetchTeamMembers()}
                  className="btn-ghost mt-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              </div>
            ) : filteredMembers.length === 0 ? (
              <p className="text-center text-gray-400 py-4">
                {searchTerm ? 'No matching team members found' : 'No team members available to assign'}
              </p>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-10 h-10 rounded-lg"
                    />
                    <div>
                      <p className="text-white font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssign(member.id)}
                    disabled={isAssigning}
                    className="btn-ghost text-primary-400 hover:text-primary-300"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Assign Role
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};