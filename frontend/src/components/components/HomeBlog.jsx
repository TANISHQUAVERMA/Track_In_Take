// src/pages/Home.jsx

import React from 'react';
import { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BlogsPage from './Blogs';
import ModalWrapper from './ModalWrapper';
import Register from '../../pages/Register';
import Login from '../../pages/Login';

const HomeBlog = () => {
     const links = [
    { label: "Home", to: "/" },
    { label: "About", to: "/" },
    { label: "Features", to: "/" },
    { label: "Blogs", to: "/blogs" },
    { label: "Contact", to: "/" },
  ];

   const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
  
    const openLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };
    const openRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
    const closeModals = () => { setShowLoginModal(false); setShowRegisterModal(false); };
  return (
    <>
       <Navbar
        links={links}
        align="right"
        rightContent={

          <>
          <button
            onClick={openRegister}
            className="ml-5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] text-sm font-semibold px-4 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary-glow"
          >
            Sign In
          </button>
         <button
    onClick={openLogin}
    // MODIFIED: Padding is now px-4 py-2 and font size is text-sm to match the other button.
    className="border border-[#FF6B3D] text-[#FF6B3D] hover:shadow-lg hover:scale-105 hover:bg-[#FFF1EB] px-4 py-2 text-sm rounded-full font-semibold transition duration-300"
  >
    Login
  </button>
        </>

        }
      />
      {/* Other homepage sections */}
      <BlogsPage from="public" />
       <ModalWrapper isOpen={showRegisterModal} onClose={closeModals}>
          <Register onClose={closeModals} onSwitchToLogin={openLogin} />
        </ModalWrapper>
        <ModalWrapper isOpen={showLoginModal} onClose={closeModals}>
          <Login onSwitchToRegister={openRegister} onClose={closeModals} />
        </ModalWrapper>
      <Footer />
    </>
  );
};

export default HomeBlog;
