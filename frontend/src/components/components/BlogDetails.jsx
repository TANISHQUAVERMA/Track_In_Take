// src/pages/BlogDetail.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';


const BlogDetail = () => {


  // The blogId is now correctly interpreted as the slug from the URL
  const { blogId: slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const from = location.state?.from;

// If user came from public blogs page, go back to "/blogs"
// Otherwise, go back to the dashboard's blog section

const backLink = from === "public" ? "/blogs" : "/dashboard/blogs-section";




  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        // The fetch URL now correctly uses the slug to find the blog post
        const res = await fetch(`https://trackeats.onrender.com/api/blogs/${slug}/`);
        if (!res.ok) throw new Error("Blog not found");
        const data = await res.json();
        setBlog(data);
      } catch (error) {
        console.error("Error loading blog:", error);
        setBlog(null); // Ensure blog is null on error
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  // === ENHANCED LOADING STATE ===
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--color-bg-app)]">
        <div className="w-16 h-16 border-4 border-t-[var(--color-primary)] border-[var(--color-border-default)] rounded-full animate-spin"></div>
      </div>
    );
  }

  // === ENHANCED ERROR STATE ===
  if (!blog) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[var(--color-bg-app)] p-4">
        <div className="text-center bg-[var(--color-danger-bg-subtle)] text-[var(--color-danger-text)] p-8 rounded-xl border border-red-200 max-w-lg">
          <h2 className="text-2xl font-bold font-[var(--font-primary)] mb-2">Post Not Found</h2>
          <p className="text-red-800">We couldn't find the blog post you were looking for. It might have been moved or deleted.</p>
          <Link 
           to="/"
            className="mt-6 inline-block bg-[var(--color-primary)] text-[var(--color-text-on-primary)] font-semibold px-6 py-2 rounded-full hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  

  // === ENHANCED BLOG DETAIL LAYOUT ===
  return (
    <div className="bg-[var(--color-bg-app)] text-[var(--color-text-default)] font-[var(--font-secondary)] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to={backLink} className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold transition-colors group">
            <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Back to All Articles
          </Link>
        </div>

        <article className="bg-[var(--color-bg-surface)] p-6 sm:p-8 lg:p-12 rounded-2xl shadow-xl border border-[var(--color-border-default)]">
          <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold font-[var(--font-primary)] text-[var(--color-text-strong)] !leading-tight mb-4">
              {blog.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
              <span>By <span className="font-semibold text-[var(--color-text-default)]">{blog.author_name || 'TrackEats Team'}</span></span>
              <span className="h-1 w-1 bg-[var(--color-border-default)] rounded-full"></span>
              <span>{new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </header>

          <hr className="border-[var(--color-border-default)] mb-8" />

          {blog.image && (
            <figure className="mb-8">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </figure>
          )}

          {/* This `prose` div enhances readability for the article content */}
          <div
            className="prose prose-lg max-w-none 
                       prose-headings:font-[var(--font-primary)] prose-headings:text-[var(--color-text-strong)]
                       prose-p:text-[var(--color-text-default)]
                       prose-a:text-[var(--color-primary)] hover:prose-a:text-[var(--color-primary-hover)] prose-a:transition-colors
                       prose-strong:text-[var(--color-text-strong)]
                       prose-blockquote:border-l-[var(--color-primary)] prose-blockquote:text-[var(--color-text-muted)]
                       prose-li:marker:text-[var(--color-primary)]"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;