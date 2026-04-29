  // src/pages/BlogsPage.jsx

  import React, { useState, useEffect } from 'react';
  import { Link } from 'react-router-dom';
  import { motion } from 'framer-motion';
  import { FaArrowRight } from 'react-icons/fa';
  import { getblogs } from '../../api/blog.js';
  import Navbar from '../components/Navbar.jsx';
  import Footer from '../components/Footer.jsx';

  const BlogsPage = ({ from = "dashboard" }) => {
    const [blogs, setBlogs] = useState([]);
    const [page, setPage] = useState(() => 1); // ✅ ensures initial value is defined immediately

    const perPage = 6;
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    

   

  useEffect(() => {
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await getblogs(page, perPage); // ✅ use dynamic page number
      if (response && Array.isArray(response.results)) {
        const transformedBlogs = response.results.map(apiBlog => ({
          id: apiBlog._id || apiBlog.id,
          title: apiBlog.title,
          summary: apiBlog.summary,
          image: apiBlog.image,
          slug: apiBlog.slug,
          date: apiBlog.createdAt || apiBlog.date,
          category: apiBlog.category,
        }));
        setBlogs(transformedBlogs);
        setTotal(response.count || 0);
      } else {
        setBlogs([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setBlogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  if (page) fetchBlogs(); // ✅ fetch only when page is defined
}, [page]); // ✅ triggered every time page changes
 // 👈 empty dependency to run only on first render


    const totalPages = Math.ceil(total / perPage);
    
    const itemFadeUp = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
    };

    return (
      <div className="bg-[var(--color-bg-app)] min-h-screen flex flex-col">
        {/* You can include a Navbar if this page is outside the main app layout */}
        
        
        <main className="flex-grow">
          <section id="blogs" className="py-20 lg:py-24 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Page Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
              >
                <h1 className="text-4xl md:text-6xl  text-[var(--color-text-strong)] font-[var(--font-primary)]">
                  The <span className="text-6xl tracking-wide font-[var(--font-primary)]">
            <span className="text-[var(--color-primary)] font-semibold">Track</span>
            <span className="text-[var(--color-text-strong)] font-semibold">Intake</span>
          </span> <span className="text-[var(--color-primary)]">Journal</span>
                </h1>
                <p className="mt-4 text-lg text-[var(--color-text-muted)] max-w-3xl mx-auto">
                  Your source for nutrition tips, healthy recipes, and wellness inspiration. Explore our latest articles below.
                </p>
              </motion.div>

              {/* Content Area */}
              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="w-16 h-16 border-4 border-t-[var(--color-primary)] border-[var(--color-border-default)] rounded-full animate-spin"></div>
                </div>
              ) : blogs.length > 0 ? (
                <>
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    initial="hidden"
                    animate="visible"
                  >
                    {blogs.map((item) => (
                      <motion.div
                        key={item.id}
                        variants={itemFadeUp}
                        className="group flex flex-col bg-[var(--color-bg-surface)] rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-[var(--color-border-default)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[var(--color-primary)]/20"
                      >
                        <Link
  to={`/blog/${item.id}`}
  state={{ from }}
  className="text-blue-600 hover:underline"
>

                          <div className="overflow-hidden relative">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-4">
                              <span className="bg-[var(--color-primary)] text-[var(--color-text-on-primary)] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">{ item.category || 'Nutrition' }</span>
                            </div>
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-[var(--font-primary)] text-[var(--color-text-strong)] transition-colors duration-200 group-hover:text-[var(--color-primary)] mb-3">
                              {item.title}
                            </h3>
                            <p className="text-[var(--color-text-muted)] mb-5 flex-grow line-clamp-3">{item.summary || 'Click to read more about this topic.'}</p>
                            <div className="mt-auto pt-4 border-t border-[var(--color-border-default)]">
                              <div className="flex justify-between items-center text-sm text-[var(--color-text-subtle)]">
                                <span className="font-medium">{item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}</span>
                                <div className="relative font-semibold text-[var(--color-primary)] flex items-center gap-2 group-hover:underline">
                                  Read More
                                  <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-16">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-5 py-2 text-sm font-semibold bg-[var(--color-bg-surface)] text-[var(--color-text-default)] rounded-full border border-[var(--color-border-default)] hover:bg-[var(--color-bg-interactive-subtle)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-strong)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>
                      <span className="text-sm font-semibold text-[var(--color-text-muted)]">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-5 py-2 text-sm font-semibold bg-[var(--color-bg-surface)] text-[var(--color-text-default)] rounded-full border border-[var(--color-border-default)] hover:bg-[var(--color-bg-interactive-subtle)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-strong)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-24 bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-default)]">
                  <h3 className="text-2xl text-[var(--color-text-strong)] font-[var(--font-primary)]">No Articles Found</h3>
                  <p className="mt-2 text-[var(--color-text-muted)]">It seems we haven't published any articles yet. Please check back soon!</p>
                </div>
              )}
            </div>
          </section>
        </main>

        
      </div>
    );
  };

  export default BlogsPage;