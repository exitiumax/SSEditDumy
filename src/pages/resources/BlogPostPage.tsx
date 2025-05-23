import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Tag, Clock, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BlogPost } from '../../types/blog';

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
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
        .eq('id', postId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Post not found');

      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.slice(4)}</h3>;
      }

      // Lists
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4">{line.slice(2)}</li>;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={index} className="ml-4">{line.slice(line.indexOf(' ') + 1)}</li>;
      }

      // Bold and Italic
      let text = line;
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

      // Links
      text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#0085c2] hover:text-[#FFB546]">$1</a>');

      return line ? (
        <p 
          key={index} 
          className="text-gray-600 mb-4"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ) : null;
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0085c2]"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Link to="/resources/blog" className="text-[#0085c2] hover:text-[#FFB546]">
            Return to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/resources/blog" 
          className="inline-flex items-center text-[#0085c2] hover:text-[#FFB546] mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all posts
        </Link>

        <article>
          <img 
            src={post.image_url} 
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-xl mb-8"
          />

          <div className="flex flex-wrap gap-2 mb-6">
            {post.blog_posts_tags.map(pt => (
              <span 
                key={pt.blog_tags.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                <Tag className="w-4 h-4 mr-1" />
                {pt.blog_tags.name}
              </span>
            ))}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>

          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center">
              <img 
                src={post.blog_authors.avatar_url}
                alt={post.blog_authors.name}
                className="w-12 h-12 rounded-full mr-4 object-cover"
              />
              <div>
                <p className="font-medium text-gray-900">{post.blog_authors.name}</p>
                <p className="text-sm text-gray-500">{post.blog_authors.role}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="prose max-w-none">
            {post.content && renderMarkdown(post.content)}
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPostPage;