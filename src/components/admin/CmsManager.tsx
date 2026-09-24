import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Check, 
  Sparkles, 
  Globe, 
  ArrowLeft,
  Share2,
  Calendar,
  Layers,
  Wrench,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BlogPost, ContentBlock, BlockType } from '../../types';

export const CmsManager: React.FC = () => {
  const { 
    posts, 
    createPost, 
    updatePost, 
    deletePost, 
    tools, 
    setPublicRoute, 
    setViewMode 
  } = usePlatform();

  const [activeView, setActiveView] = useState<'list' | 'editor'>('list');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Status filter
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredPosts = posts.filter(p => {
    if (filterStatus === 'all') return p.status !== 'trash';
    return p.status === filterStatus;
  });

  const handleCreateNew = () => {
    const newPostId = `post_${Date.now()}`;
    const newPost: BlogPost = {
      id: newPostId,
      title: 'New Comprehensive Webmaster Guide',
      slug: `guide-${Date.now()}`,
      status: 'draft',
      author: { name: 'Editorial Staff' },
      category: 'Guides & Tutorials',
      tags: ['seo', 'tools'],
      featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
      excerpt: 'Draft article description and overview.',
      blocks: [
        { id: 'b1', type: 'paragraph', content: 'Begin writing your article here. Use the slash commands menu below to embed headings, quotes, code, or interactive tools.' }
      ],
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      views: 0,
      commentsCount: 0,
      seo: {
        targetKeyword: 'web tools guide',
        title: 'New Comprehensive Webmaster Guide | OmniTools OS',
        metaDescription: 'Complete technical breakdown and tutorial.',
        canonicalUrl: 'https://omnitools.io/blog/guide',
        index: true,
        score: 75,
      }
    };
    createPost(newPost);
    setEditingPost(newPost);
    setActiveView('editor');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#046a38] font-mono">
              Editorial CMS Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0c2340]">Blog & Content Management</h1>
          <p className="text-xs text-slate-500">
            Publish technical articles with live SEO auditing and interactive embedded tool blocks.
          </p>
        </div>

        {activeView === 'list' && (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#046a38] hover:bg-[#03592f] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write New Article</span>
          </button>
        )}
      </div>

      {/* VIEW 1: POSTS LIST */}
      {activeView === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Status Filters */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-2 text-xs">
            {['all', 'published', 'draft', 'scheduled', 'trash'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium cursor-pointer transition-colors ${
                  filterStatus === status ? 'bg-[#0c2340] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-400 font-medium border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Article Title</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">SEO Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="space-y-0.5">
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setActiveView('editor');
                          }}
                          className="font-bold text-slate-900 hover:text-emerald-700 text-left block text-sm"
                        >
                          {post.title}
                        </button>
                        <span className="text-[11px] font-mono text-slate-400">/blog/{post.slug}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{post.author.name}</td>

                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {post.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {post.seo.score}/100
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        post.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {post.publishedAt}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setActiveView('editor');
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Edit Post"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setPublicRoute({ page: 'blog_post', param: post.slug });
                            setViewMode('public');
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="View on Public Site"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deletePost(post.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Trash Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: MODERN BLOCK EDITOR + SEO ASSISTANT (Master Plan Sections 18, 19, 21) */}
      {activeView === 'editor' && editingPost && (
        <BlogBlockEditor
          post={editingPost}
          onSave={(updated) => {
            updatePost(updated);
            setEditingPost(updated);
          }}
          onBack={() => setActiveView('list')}
        />
      )}
    </div>
  );
};

// COMPONENT: Modern Block Visual Editor & SEO Assistant
const BlogBlockEditor: React.FC<{
  post: BlogPost;
  onSave: (p: BlogPost) => void;
  onBack: () => void;
}> = ({ post, onSave, onBack }) => {
  const { tools, setPublicRoute, setViewMode } = usePlatform();
  const [formData, setFormData] = useState<BlogPost>(post);
  const [saved, setSaved] = useState(false);

  // Add block
  const addBlock = (type: BlockType, toolId?: string) => {
    const newBlock: ContentBlock = {
      id: `blk_${Date.now()}`,
      type,
      content: type === 'heading' ? 'New Section Heading' : (type === 'quote' ? 'Inspiring editorial quote.' : ''),
      level: 2,
      toolId: toolId || (tools[0]?.id || ''),
    };
    setFormData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const updateBlockContent = (id: string, content: string) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === id ? { ...b, content } : b)
    }));
  };

  const removeBlock = (id: string) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== id)
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Editor Canvas (2 Cols) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <button
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Articles</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPublicRoute({ page: 'blog_post', param: formData.slug });
                  setViewMode('public');
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Preview
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#046a38] hover:bg-[#03592f] rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{saved ? 'Saved!' : 'Save & Publish'}</span>
              </button>
            </div>
          </div>

          {/* Title & Slug */}
          <div className="space-y-2">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Article Title..."
              className="w-full text-2xl font-extrabold text-[#0c2340] border-none focus:outline-hidden p-0"
            />
            <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
              <span>/blog/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="border-b border-slate-200 focus:border-slate-800 focus:outline-hidden text-slate-600 bg-transparent"
              />
            </div>
          </div>

          {/* Blocks Editor */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {formData.blocks.map((block, idx) => (
              <div key={block.id} className="group relative p-3 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                <button
                  onClick={() => removeBlock(block.id)}
                  className="absolute right-2 top-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove Block"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {block.type === 'paragraph' && (
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    rows={3}
                    placeholder="Write paragraph content..."
                    className="w-full text-sm text-slate-700 border-none focus:outline-hidden resize-y"
                  />
                )}

                {block.type === 'heading' && (
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    placeholder="Section Heading..."
                    className="w-full text-lg font-bold text-[#0c2340] border-none focus:outline-hidden"
                  />
                )}

                {block.type === 'quote' && (
                  <blockquote className="border-l-4 border-emerald-500 pl-3">
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => updateBlockContent(block.id, e.target.value)}
                      placeholder="Enter quote..."
                      className="w-full text-sm italic text-slate-600 border-none focus:outline-hidden"
                    />
                  </blockquote>
                )}

                {block.type === 'tool' && (
                  /* MASTER PLAN SECTION 19: TOOL INSIDE BLOG POST */
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Interactive Embedded Tool (/tool Block)</span>
                      </span>
                    </div>

                    <select
                      value={block.toolId}
                      onChange={(e) => {
                        const newBlocks = formData.blocks.map(b => b.id === block.id ? { ...b, toolId: e.target.value } : b);
                        setFormData({ ...formData, blocks: newBlocks });
                      }}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                    >
                      {tools.length === 0 ? (
                        <option value="">No tools installed in registry yet</option>
                      ) : (
                        tools.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Block Inserter Slash Command Menu */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold px-2">Insert Block:</span>
            <button
              onClick={() => addBlock('paragraph')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-medium text-slate-700 cursor-pointer"
            >
              /paragraph
            </button>
            <button
              onClick={() => addBlock('heading')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-medium text-slate-700 cursor-pointer"
            >
              /heading
            </button>
            <button
              onClick={() => addBlock('quote')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-medium text-slate-700 cursor-pointer"
            >
              /quote
            </button>
            <button
              onClick={() => addBlock('tool')}
              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded font-bold cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>/tool (Interactive)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time SEO Assistant Sidebar (Master Plan Section 21) */}
      <div className="space-y-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">SEO Live Assistant</h3>
            <span className="font-mono font-bold text-base text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {formData.seo.score}/100
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Focus Keyword</label>
            <input
              type="text"
              value={formData.seo.targetKeyword}
              onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, targetKeyword: e.target.value } })}
              placeholder="e.g. image compression guide"
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          {/* Checklist */}
          <div className="space-y-2 text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Keyword in H1 Title</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Word count &gt; 300 words</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>OpenGraph metadata configured</span>
            </div>
          </div>

          {/* Google SERP Preview */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Google SERP Preview</span>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-[#1a0dab] font-medium text-xs hover:underline truncate">
                {formData.seo.title || formData.title}
              </p>
              <p className="text-[#006621] text-[10px] truncate">
                https://omnitools.io/blog/{formData.slug}
              </p>
              <p className="text-slate-600 text-[11px] line-clamp-2">
                {formData.seo.metaDescription || formData.excerpt}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
