import React from 'react';
import { TeamMember } from '../types/team';

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  return (
    <div className="h-[500px] [perspective:1500px] group">
      <div className="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-[45%]">
            <img 
              src={member.image_url} 
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 h-[55%] flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
            <p className="text-[#0085c2] font-medium mb-2 text-sm">{member.title}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {member.tags?.map(tagRelation => (
                <span
                  key={tagRelation.tag.id}
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: tagRelation.tag.color }}
                >
                  {tagRelation.tag.name}
                </span>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="flex flex-wrap gap-1">
                {member.degrees.map((degree, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium text-gray-700"
                  >
                    {degree}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-lg shadow-md p-6">
          <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
            <p className="text-[#0085c2] font-medium mb-3 text-sm">{member.title}</p>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
              <p className="text-gray-600 text-sm">{member.bio}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {member.tags?.map(tagRelation => (
                  <span
                    key={tagRelation.tag.id}
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: tagRelation.tag.color }}
                  >
                    {tagRelation.tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;