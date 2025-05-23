import React, { useState, useEffect } from 'react';
import TeamMemberCard from '../../components/TeamMemberCard';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import type { TeamMember } from '../../types/team';

const TeamPage: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamMembers();
    fetchTags();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          tags:team_members_tags(
            tag:team_member_tags(*)
          )
        `)
        .order('position');

      if (error) throw error;

      setTeamMembers(data || []);
    } catch (error) {
      setError('Failed to fetch team members');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('team_member_tags')
        .select('*')
        .order('position');

      if (error) throw error;

      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const filteredMembers = selectedTag
    ? teamMembers.filter(member => 
        member.tags?.some(t => t.tag.id === selectedTag)
      )
    : teamMembers;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0085c2]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Meet the dedicated professionals who make Galin Education a leader in educational excellence.
          </p>
        </div>

        {/* Tag Filter */}
        <div className="flex justify-center mb-12 flex-wrap gap-4">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              !selectedTag
                ? 'bg-[#0085c2] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                selectedTag === tag.id
                  ? `bg-[${tag.color}] text-white`
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>

        {/* Team Grid */}
        {filteredMembers.length === 0 ? (
          <div className="text-center text-gray-600">
            No team members found in this category.
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            layout
          >
            {filteredMembers.map(member => (
              <TeamMemberCard
                key={member.id}
                member={member}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;