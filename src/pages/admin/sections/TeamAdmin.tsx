import React, { useState, useCallback } from 'react';
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusCircle, Save, X, GripVertical, Edit, Trash2, Tag as TagIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { TeamMember } from '../../../types/team';
import Select from 'react-select';

interface SortableItemProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface SortableTagProps {
  tag: Tag;
  onColorChange: (tag: Tag, color: string) => void;
  onDelete: (id: string) => void;
}

const SortableTag: React.FC<SortableTagProps> = ({ tag, onColorChange, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: tag.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-move text-gray-400 hover:text-gray-600">
          <GripVertical className="w-5 h-5" />
        </div>
        <div 
          className="w-6 h-6 rounded"
          style={{ backgroundColor: tag.color }}
        />
        <span className="font-medium">{tag.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="color"
          value={tag.color}
          onChange={(e) => onColorChange(tag, e.target.value)}
          className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
        />
        <button
          onClick={() => onDelete(tag.id)}
          className="p-2 text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const SortableItem: React.FC<SortableItemProps> = ({ member, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-white p-4 rounded-lg shadow cursor-move"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600">
            <GripVertical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{member.name}</h3>
            <p className="text-gray-600">{member.title}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {member.tags?.map(tagRelation => (
                <span
                  key={tagRelation.tag.id}
                  className="inline-block px-2 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: tagRelation.tag.color }}
                >
                  {tagRelation.tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(member)}
            className="p-2 text-blue-500 hover:text-blue-600"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="p-2 text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const TeamAdmin: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState<Partial<TeamMember> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTag, setNewTag] = useState({ name: '', color: '#0085c2' });
  const [showTagsPanel, setShowTagsPanel] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchTeamMembers = useCallback(async () => {
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to fetch team members');
    }
  }, []);

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
      setError('Failed to fetch tags');
    }
  };

  React.useEffect(() => {
    fetchTeamMembers();
    fetchTags();
  }, [fetchTeamMembers]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = teamMembers.findIndex((member) => member.id === active.id);
      const newIndex = teamMembers.findIndex((member) => member.id === over.id);

      const newOrder = arrayMove(teamMembers, oldIndex, newIndex);
      setTeamMembers(newOrder);

      try {
        const updates = newOrder.map((member, index) => ({
          id: member.id,
          position: index
        }));

        const { error } = await supabase.rpc('update_team_positions', {
          updates // Remove JSON.stringify here since the RPC expects a JSON array
        });

        if (error) throw error;
      } catch (error) {
        console.error('Error updating positions:', error);
        await fetchTeamMembers();
      }
    }
  };

  const handleTagDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tags.findIndex((tag) => tag.id === active.id);
      const newIndex = tags.findIndex((tag) => tag.id === over.id);

      const newOrder = arrayMove(tags, oldIndex, newIndex);
      setTags(newOrder);

      try {
        const updates = newOrder.map((tag, index) => ({
          id: tag.id,
          position: index
        }));

        const { error } = await supabase.rpc('update_tag_positions', {
          updates // Remove JSON.stringify here as well for consistency
        });

        if (error) throw error;
      } catch (error) {
        console.error('Error updating tag positions:', error);
        await fetchTags();
      }
    }
  };

  const handleAdd = () => {
    setNewMember({
      name: '',
      title: '',
      image_url: '',
      bio: '',
      degrees: []
    });
    setSelectedTags([]);
    setEditingMember(null);
  };

  const handleSave = async (member: Partial<TeamMember>, isNew: boolean) => {
    try {
      if (!member.name || !member.title || !member.image_url || !member.bio) {
        throw new Error('Please fill in all required fields');
      }

      const memberData = {
        name: member.name.trim(),
        title: member.title.trim(),
        image_url: member.image_url.trim(),
        bio: member.bio.trim(),
        degrees: member.degrees || [],
        updated_at: new Date().toISOString()
      };

      const { data, error } = isNew
        ? await supabase
            .from('team_members')
            .insert([memberData])
            .select()
            .single()
        : await supabase
            .from('team_members')
            .update(memberData)
            .eq('id', member.id)
            .select()
            .single();

      if (error) throw error;

      if (data) {
        await supabase
          .from('team_members_tags')
          .delete()
          .eq('team_member_id', data.id);

        if (selectedTags.length > 0) {
          const tagLinks = selectedTags.map(tag => ({
            team_member_id: data.id,
            tag_id: tag.id
          }));

          const { error: tagError } = await supabase
            .from('team_members_tags')
            .insert(tagLinks);

          if (tagError) throw tagError;
        }
      }

      await fetchTeamMembers();
      setEditingMember(null);
      setNewMember(null);
      setSelectedTags([]);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  const handleSaveTag = async () => {
    try {
      if (!newTag.name.trim()) {
        throw new Error('Tag name is required');
      }

      const { error } = await supabase
        .from('team_member_tags')
        .insert([{
          name: newTag.name.trim(),
          color: newTag.color,
          position: tags.length
        }]);

      if (error) throw error;

      await fetchTags();
      setShowTagModal(false);
      setNewTag({ name: '', color: '#0085c2' });
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  const handleUpdateTag = async (tag: Tag, color: string) => {
    try {
      const { error } = await supabase
        .from('team_member_tags')
        .update({ color })
        .eq('id', tag.id);

      if (error) throw error;

      await fetchTags();
      setEditingTag(null);
      setError(null);
    } catch (error) {
      setError('Failed to update tag');
      console.error('Error:', error);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const { data: usedTags, error: checkError } = await supabase
        .from('team_members_tags')
        .select('team_member_id')
        .eq('tag_id', id);

      if (checkError) throw checkError;

      if (usedTags && usedTags.length > 0) {
        throw new Error('Cannot delete tag that is used by team members');
      }

      const { error } = await supabase
        .from('team_member_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTags();
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTeamMembers();
      setError(null);
    } catch (error) {
      setError('Failed to delete team member');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowTagsPanel(!showTagsPanel)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              showTagsPanel
                ? 'bg-gray-200 text-gray-700'
                : 'bg-[#0085c2] text-white hover:bg-[#FFB546]'
            }`}
          >
            <TagIcon className="w-5 h-5 mr-2" />
            Manage Tags
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Member
          </button>
        </div>
      </div>

      {showTagsPanel && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Team Member Tags</h3>
            <button
              onClick={() => setShowTagModal(true)}
              className="flex items-center px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
            >
              <TagIcon className="w-5 h-5 mr-2" />
              New Tag
            </button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleTagDragEnd}
          >
            <SortableContext
              items={tags.map(tag => tag.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {tags.map(tag => (
                  <SortableTag
                    key={tag.id}
                    tag={tag}
                    onColorChange={handleUpdateTag}
                    onDelete={handleDeleteTag}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">New Tag</h2>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                  className="w-full h-10 p-1 rounded-md cursor-pointer"
                />
              </div>
              <button
                onClick={handleSaveTag}
                className="w-full px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
              >
                Save Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {(newMember || editingMember) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h3 className="text-xl font-semibold">
              {editingMember ? 'Edit Team Member' : 'New Team Member'}
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editingMember?.name || newMember?.name || ''}
                onChange={(e) => {
                  if (editingMember) {
                    setEditingMember({ ...editingMember, name: e.target.value });
                  } else if (newMember) {
                    setNewMember({ ...newMember, name: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editingMember?.title || newMember?.title || ''}
                onChange={(e) => {
                  if (editingMember) {
                    setEditingMember({ ...editingMember, title: e.target.value });
                  } else if (newMember) {
                    setNewMember({ ...newMember, title: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <Select
                isMulti
                options={tags.map(tag => ({
                  value: tag.id,
                  label: tag.name,
                  color: tag.color
                }))}
                value={selectedTags.map(tag => ({
                  value: tag.id,
                  label: tag.name,
                  color: tag.color
                }))}
                onChange={(selected) => {
                  setSelectedTags(
                    selected.map(option => ({
                      id: option.value,
                      name: option.label,
                      color: option.color,
                      position: 0
                    }))
                  );
                }}
                className="w-full"
                styles={{
                  option: (styles, { data }) => ({
                    ...styles,
                    ':before': {
                      backgroundColor: data.color,
                      content: '""',
                      display: 'inline-block',
                      marginRight: 8,
                      width: 10,
                      height: 10,
                      borderRadius: '50%'
                    }
                  })
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={editingMember?.image_url || newMember?.image_url || ''}
                onChange={(e) => {
                  if (editingMember) {
                    setEditingMember({ ...editingMember, image_url: e.target.value });
                  } else if (newMember) {
                    setNewMember({ ...newMember, image_url: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={editingMember?.bio || newMember?.bio || ''}
                onChange={(e) => {
                  if (editingMember) {
                    setEditingMember({ ...editingMember, bio: e.target.value });
                  } else if (newMember) {
                    setNewMember({ ...newMember, bio: e.target.value });
                  }
                }}
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degrees
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(editingMember?.degrees || newMember?.degrees || []).map((degree, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100"
                  >
                    {degree}
                    <button
                      onClick={() => {
                        const newDegrees = [...(editingMember?.degrees || newMember?.degrees || [])];
                        newDegrees.splice(index, 1);
                        if (editingMember) {
                          setEditingMember({ ...editingMember, degrees: newDegrees });
                        } else if (newMember) {
                          setNewMember({ ...newMember, degrees: newDegrees });
                        }
                      }}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a degree..."
                  className="flex-grow px-3 py-2 border rounded-md"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      const value = input.value.trim();
                      if (value) {
                        const newDegrees = [...(editingMember?.degrees || newMember?.degrees || []), value];
                        if (editingMember) {
                          setEditingMember({ ...editingMember, degrees: newDegrees });
                        } else if (newMember) {
                          setNewMember({ ...newMember, degrees: newDegrees });
                        }
                        input.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setEditingMember(null);
                  setNewMember(null);
                  setSelectedTags([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(editingMember || newMember!, !editingMember)}
                className="flex items-center px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
              >
                <Save className="w-5 h-5 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={teamMembers.map(member => member.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-4">
            {teamMembers.map((member) => (
              <SortableItem
                key={member.id}
                member={member}
                onEdit={(member) => {
                  setEditingMember(member);
                  setSelectedTags(member.tags?.map(t => t.tag) || []);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default TeamAdmin;