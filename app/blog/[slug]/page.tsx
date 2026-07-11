import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

// Simple markdown to HTML parser for basic formatting
const parseMarkdown = (text: string) => {
  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-heading font-medium text-gray-900 mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-heading font-medium text-gray-900 mt-10 mb-5">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-heading font-medium text-gray-900 mt-12 mb-6">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' class='w-full rounded-2xl my-8' />")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' class='text-gold-600 hover:underline'>$1</a>")
    .replace(/\n\n/g, '</p><p class="mb-6 leading-relaxed text-gray-600">');
    
  return `<p class="mb-6 leading-relaxed text-gray-600">${html}</p>`;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const unwrappedParams = await params;
  const { data: post } = await supabaseAdmin!
    .from('blog_posts')
    .select('*')
    .eq('slug', unwrappedParams.slug)
    .single();

  if (!post) {
    return { title: 'Post Not Found - Her Highness' };
  }

  return {
    title: `${post.title} | The Royal Journal | Her Highness`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
      type: 'article',
      publishedTime: post.published_at,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = await params;
  
  const { data: post } = await supabaseAdmin!
    .from('blog_posts')
    .select('*')
    .eq('slug', unwrappedParams.slug)
    .single();

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7]">
        <h1 className="font-heading text-3xl mb-4">Post not found</h1>
        <Link href="/blog" className="text-gold-600 hover:underline uppercase tracking-widest text-sm font-bold">Return to Journal</Link>
      </div>
    );
  }

  const htmlContent = parseMarkdown(post.content || '');

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar cartCount={0} />
      
      <main className="flex-grow pt-24 md:pt-32 pb-20">
        <article className="max-w-3xl mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-gold-600 mb-10 uppercase tracking-widest font-bold transition-colors">
            ← Back to Journal
          </Link>
          
          <header className="mb-12 text-center">
            <div className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-6">
              {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-[1.1] mb-8">
              {post.title}
            </h1>
            {post.author_id && (
              <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">By Admin</p>
            )}
          </header>

          {post.cover_image && (
            <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden mb-16 shadow-lg">
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div 
            className="prose prose-lg prose-gold max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          
          <div className="mt-20 pt-10 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-6">Share this article</p>
            <div className="flex justify-center gap-4">
              <a href={`https://twitter.com/intent/tweet?url=https://herhighness.com/blog/${post.slug}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gold-500 hover:text-gold-600 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=https://herhighness.com/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gold-500 hover:text-gold-600 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
