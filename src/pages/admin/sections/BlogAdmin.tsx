import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { BlogPost, BlogAuthor, BlogTag } from '../../../types/blog';
import { PlusCircle, Edit, Trash2, Save, X, UserPlus, Tag as TagIcon, Users } from 'lucide-react';

const BlogAdmin: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingAuthor, setEditingAuthor] = useState<BlogAuthor | null>(null);
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showAuthorsPanel, setShowAuthorsPanel] = useState(false);
  const [showTagsPanel, setShowTagsPanel] = useState(false);
  const [newAuthor, setNewAuthor] = useState<Partial<BlogAuthor>>({});
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchAuthors();
    fetchTags();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_authors:author_id(*),
          blog_posts_tags!inner(
            blog_tags(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_authors')
        .select('*')
        .order('name');

      if (error) throw error;

      setAuthors(data || []);
    } catch (error) {
      console.error('Error fetching authors:', error);
      setError('Failed to fetch authors');
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');

      if (error) throw error;

      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Failed to fetch tags');
    }
  };

  const handleCreateAuthor = async () => {
    try {
      if (!newAuthor.name?.trim()) {
        throw new Error('Author name is required');
      }
      if (!newAuthor.role?.trim()) {
        throw new Error('Author role is required');
      }
      if (!newAuthor.avatar_url?.trim()) {
        throw new Error('Author avatar URL is required');
      }

      const { data, error } = await supabase
        .from('blog_authors')
        .insert([{
          name: newAuthor.name.trim(),
          role: newAuthor.role.trim(),
          avatar_url: newAuthor.avatar_url.trim()
        }])
        .select();

      if (error) throw error;

      await fetchAuthors();
      setShowAuthorModal(false);
      setNewAuthor({});
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  const handleUpdateAuthor = async () => {
    try {
      if (!editingAuthor) return;

      if (!editingAuthor.name?.trim()) {
        throw new Error('Author name is required');
      }
      if (!editingAuthor.role?.trim()) {
        throw new Error('Author role is required');
      }
      if (!editingAuthor.avatar_url?.trim()) {
        throw new Error('Author avatar URL is required');
      }

      const { error } = await supabase
        .from('blog_authors')
        .update({
          name: editingAuthor.name.trim(),
          role: editingAuthor.role.trim(),
          avatar_url: editingAuthor.avatar_url.trim()
        })
        .eq('id', editingAuthor.id);

      if (error) throw error;

      await fetchAuthors();
      setEditingAuthor(null);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  const handleDeleteAuthor = async (id: string) => {
    try {
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('author_id', id);

      if (postsError) throw postsError;

      if (posts && posts.length > 0) {
        throw new Error('Cannot delete author with existing posts');
      }

      const { error } = await supabase
        .from('blog_authors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchAuthors();
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  const handleCreateTag = async () => {
    try {
      if (!newTag.trim()) {
        throw new Error('Tag name is required');
      }

      const { data, error } = await supabase
        .from('blog_tags')
        .insert([{ name: newTag.trim() }])
        .select();

      if (error) throw error;

      await fetchTags();
      setShowTagModal(false);
      setNewTag('');
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  const handleUpdateTag = async () => {
    try {
      if (!editingTag) return;

      if (!editingTag.name?.trim()) {
        throw new Error('Tag name is required');
      }

      const { error } = await supabase
        .from('blog_tags')
        .update({ name: editingTag.name.trim() })
        .eq('id', editingTag.id);

      if (error) throw error;

      await fetchTags();
      setEditingTag(null);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const { data: postTags, error: postTagsError } = await supabase
        .from('blog_posts_tags')
        .select('post_id')
        .eq('tag_id', id);

      if (postTagsError) throw postTagsError;

      if (postTags && postTags.length > 0) {
        throw new Error('Cannot delete tag that is used in posts');
      }

      const { error } = await supabase
        .from('blog_tags')
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

  const handleCreatePost = () => {
    setEditingPost({
      id: '',
      title: '',
      content: '',
      preview: '',
      image_url: '',
      author_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setSelectedTags([]);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setSelectedTags(post.blog_posts_tags?.map(pt => pt.blog_tags.id) || []);
  };

  const handleSavePost = async () => {
    try {
      if (!editingPost) return;

      if (!editingPost.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!editingPost.content?.trim()) {
        throw new Error('Content is required');
      }
      if (!editingPost.preview?.trim()) {
        throw new Error('Preview is required');
      }
      if (!editingPost.image_url?.trim()) {
        throw new Error('Image URL is required');
      }
      if (!editingPost.author_id) {
        throw new Error('Author is required');
      }

      const postData = {
        title: editingPost.title.trim(),
        content: editingPost.content.trim(),
        preview: editingPost.preview.trim(),
        image_url: editingPost.image_url.trim(),
        author_id: editingPost.author_id,
        updated_at: new Date().toISOString()
      };

      const isNewPost = !editingPost.id;
      
      const { data: savedPost, error: postError } = isNewPost
        ? await supabase
            .from('blog_posts')
            .insert([postData])
            .select()
            .single()
        : await supabase
            .from('blog_posts')
            .update(postData)
            .eq('id', editingPost.id)
            .select()
            .single();

      if (postError) throw postError;

      if (savedPost) {
        // Handle tags
        if (!isNewPost) {
          const { error: deleteError } = await supabase
            .from('blog_posts_tags')
            .delete()
            .eq('post_id', savedPost.id);

          if (deleteError) throw deleteError;
        }

        if (selectedTags.length > 0) {
          const { error: tagError } = await supabase
            .from('blog_posts_tags')
            .insert(selectedTags.map(tagId => ({
              post_id: savedPost.id,
              tag_id: tagId
            })));

          if (tagError) throw tagError;
        }

        await fetchPosts();
        setEditingPost(null);
        setSelectedTags([]);
        setError(null);
      }
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPosts();
      setError(null);
    } catch (error) {
      setError('Failed to delete post');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold">Manage Blog Posts</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAuthorsPanel(!showAuthorsPanel)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              showAuthorsPanel
                ? 'bg-gray-200 text-gray-700'
                : 'bg-[#0085c2] text-white hover:bg-[#FFB546]'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Manage Authors
          </button>
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
            onClick={handleCreatePost}
            className="flex items-center px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            New Post
          </button>
        </div>
      </div>

      {/* Authors Panel */}
      {showAuthorsPanel && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Authors</h3>
            <button
              onClick={() => setShowAuthorModal(true)}
              className="flex items-center px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              New Author
            </button>
          </div>
          <div className="grid gap-4">
            {authors.map(author => (
              <div key={author.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    className="w-10 h-10 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-medium">{author.name}</h4>
                    <p className="text-sm text-gray-600">{author.role}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingAuthor(author)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAuthor(author.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags Panel */}
      {showTagsPanel && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Tags</h3>
            <button
              onClick={() => setShowTagModal(true)}
              className="flex items-center px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
            >
              <TagIcon className="w-5 h-5 mr-2" />
              New Tag
            </button>
          </div>
          <div className="grid gap-4">
            {tags.map(tag => (
              <div key={tag.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    <TagIcon className="w-4 h-4 mr-2" />
                    {tag.name}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingTag(tag)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Author Modal */}
      {(showAuthorModal || editingAuthor) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingAuthor ? 'Edit Author' : 'New Author'}
              </h2>
              <button
                onClick={() => {
                  setShowAuthorModal(false);
                  setEditingAuthor(null);
                  setNewAuthor({});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingAuthor ? editingAuthor.name : newAuthor.name || ''}
                  onChange={(e) => editingAuthor 
                    ? setEditingAuthor({ ...editingAuthor, name: e.target.value })
                    : setNewAuthor({ ...newAuthor, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={editingAuthor ? editingAuthor.role : newAuthor.role || ''}
                  onChange={(e) => editingAuthor
                    ? setEditingAuthor({ ...editingAuthor, role: e.target.value })
                    : setNewAuthor({ ...newAuthor, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <input
                  type="text"
                  value={editingAuthor ? editingAuthor.avatar_url : newAuthor.avatar_url || ''}
                  onChange={(e) => editingAuthor
                    ? setEditingAuthor({ ...editingAuthor, avatar_url: e.target.value })
                    : setNewAuthor({ ...newAuthor, avatar_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <button
                onClick={editingAuthor ? handleUpdateAuthor : handleCreateAuthor}
                className="w-full px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
              >
                {editingAuthor ? 'Update Author' : 'Create Author'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Modal */}
      {(showTagModal || editingTag) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingTag ? 'Edit Tag' : 'New Tag'}
              </h2>
              <button
                onClick={() => {
                  setShowTagModal(false);
                  setEditingTag(null);
                  setNewTag('');
                }}
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
                  value={editingTag ? editingTag.name : newTag}
                  onChange={(e) => editingTag
                    ? setEditingTag({ ...editingTag, name: e.target.value })
                    : setNewTag(e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <button
                onClick={editingTag ? handleUpdateTag : handleCreateTag}
                className="w-full px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
              >
                {editingTag ? 'Update Tag' : 'Create Tag'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Editor Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingPost.id ? 'Edit Post' : 'New Post'}
              </h2>
              <button
                onClick={() => setEditingPost(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview
                </label>
                <textarea
                  value={editingPost.preview}
                  onChange={(e) => setEditingPost({ ...editingPost, preview: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md font-mono"
                  rows={15}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={editingPost.image_url}
                  onChange={(e) => setEditingPost({ ...editingPost, image_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <select
                  value={editingPost.author_id}
                  onChange={(e) => setEditingPost({ ...editingPost, author_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select an author</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label key={tag.id} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag.id]);
                          } else {
                            setSelectedTags(selectedTags.filter(id => id !== tag.id));
                          }
                        }}
                        className="mr-2"
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSavePost}
                  className="flex items-center px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-600 mb-4">{post.preview}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-4">By: {post.blog_authors?.name}</span>
                  <span>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditPost(post)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogAdmin;