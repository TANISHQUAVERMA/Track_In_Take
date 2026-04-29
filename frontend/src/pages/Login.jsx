
// // src/components/auth/Login.jsx
// import React, { useEffect, useState } from "react";
// import { loginUser } from "../api/auth";
// import { useAuth } from "../components/context/AuthContext";
// import { Mail, Lock, Loader, User } from "lucide-react";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import {jwtDecode} from "jwt-decode";
// import { googleAuth } from "../api/auth"; // Add googleAuth API
// import { GoogleLogin } from "@react-oauth/google";
// import { loginWithFacebook } from "../api/socialAuth";
// import { loginWithGoogle } from "../api/socialAuth";
// import { useGoogleLogin } from "@react-oauth/google";
// // import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
// const Login = ({ onClose, onSwitchToRegister }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

 
//  const handleLogin = async (e) => {
//     e.preventDefault();
//     // console.log("Selected Role:", role);
//     setLoading(true);
//     try {
//       const res = await loginUser({ email, password });
      
//       const { access: accessToken, refresh: refreshToken, role, email: userEmail, full_name } = res.data;

//       // Decode token to get user_id
//       const decoded = jwtDecode(accessToken);
//       const id = decoded.user_id;
//       const userInfo = { id, role, email: userEmail, full_name };

//       login(accessToken, refreshToken, userInfo);
//       localStorage.setItem("userRole", role.toLowerCase());

//       toast.success(`Welcome, ${full_name || 'User'}!`);

//       const roleLower = role.toLowerCase();
//       const path = {
//         "nutritionist": "/nutritionist",
//         "operator": "/operator",
//         "owner": "/owner",
//       }[roleLower] || "/dashboard";
      
//       navigate(path);
//       onClose?.();
//     }catch (error) {
//   const backendMessage = error.response?.data?.detail;

//   // ⛔ Case 1: Nutritionist exists but not verified
//   if (
//     backendMessage === "Please wait until the admin verifies your account."
//   ) {
//     toast.info("Please wait until the admin verifies your account.");
//   }
//   // ❌ Case 2: Wrong email or password
//   else if (backendMessage) {
//     toast.error(backendMessage);
//   }
//   // ❌ Fallback
//   else {
//     toast.error("Invalid email or password");
//   }

//   console.error("Login error:", error);
// }
//  finally {
//       setLoading(false);
//     }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, x: -10 },
//     visible: { opacity: 1, x: 0 },
//   };

//   const handleGoogleSuccess = async (tokenResponse) => {
//     setLoading(true);
//     try {
//       // The hook gives us the access_token directly
//       const googleToken = tokenResponse.access_token;
//       const res = await loginWithGoogle(googleToken);

//       const { access, refresh, role, email: userEmail, full_name } = res.data;
//       const id = jwtDecode(access).user_id;
//       const userInfo = { id, role, email: userEmail, full_name };

//       login(access, refresh, userInfo);
//       localStorage.setItem("userRole", role.toLowerCase());
//       toast.success(`Welcome, ${full_name || "User"}!`);

//       const redirectPath = {
//         nutritionist: "/nutritionist",
//         operator: "/operator",
//         owner: "/owner",
//       }[role.toLowerCase()] || "/dashboard";

//       navigate(redirectPath);
//       onClose?.();
//     } catch (error) {
//       console.error("Google Login Failed:", error);
//       toast.error("Google login failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const googleLogin = useGoogleLogin({
//     onSuccess: handleGoogleSuccess,
//     onError: () => toast.error("Google login failed."),
//   });
  
//   const handleFacebookResponse = async (response) => {
//     if (response.accessToken) {
//       try {
//         setLoading(true);
//         const fbToken = response.accessToken;
//         const res = await loginWithFacebook(fbToken);

//         const { access, refresh, role, email: userEmail, full_name } = res.data;
//         const id = jwtDecode(access).user_id;
//         const userInfo = { id, role, email: userEmail, full_name };

//         login(access, refresh, userInfo);
//         localStorage.setItem("userRole", role.toLowerCase());
//         toast.success(`Welcome, ${full_name || "User"}!`);

//         const redirectPath = {
//           nutritionist: "/nutritionist",
//           operator: "/operator",
//           owner: "/owner",
//         }[role.toLowerCase()] || "/dashboard";

//         navigate(redirectPath);
//         onClose?.();
//       } catch (error) {
//         console.error("Facebook Login Failed:", error);
//         toast.error("Facebook login failed. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       toast.error("Facebook login was cancelled or failed.");
//     }
//   };

//   return (
//     <div className="text-left w-full max-w-sm mx-auto p-4 font-[var(--font-secondary)]">
//       <motion.h2 
//         initial={{ opacity: 0, y: -10 }} 
//         animate={{ opacity: 1, y: 0 }}
//         className="text-3xl font-[var(--font-primary)] text-center mb-6 text-[var(--color-text-strong)]"
//       >
//         Login
//       </motion.h2>

//       <motion.form 
//         initial="hidden"
//         animate="visible"
//         variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
//         onSubmit={handleLogin} 
//         className="space-y-6"
//       >
//         <motion.div variants={itemVariants}>
//           <label htmlFor="login-email" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">Email Address</label>
//           <div className="relative">
//             <input
//               id="login-email" type="email"
//               className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]"
//               placeholder="Enter your email"
//               value={email} onChange={(e) => setEmail(e.target.value)} required
//             />
//             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
//           </div>
//         </motion.div>

//         <motion.div variants={itemVariants}>
//           <label htmlFor="login-password" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">Password</label>
//           <div className="relative">
//             <input
//               id="login-password" type="password"
//               className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]"
//               placeholder="Enter your password"
//               value={password} onChange={(e) => setPassword(e.target.value)} required
//             />
//             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
//           </div>
//         </motion.div>

//         <motion.div variants={itemVariants} className="text-right">
//           <a href="/forgot-password" className="text-sm text-[var(--color-primary)] hover:underline font-medium">
//             Forgot Password?
//           </a>
//         </motion.div>

//         <motion.button
//           variants={itemVariants}
//           type="submit"
//           disabled={loading}
//           className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] px-5 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:transform-none disabled:shadow-md"
//         >
//           {loading ? (
//             <span className="flex items-center justify-center gap-2">
//               <Loader className="animate-spin" /> Logging in...
//             </span>
//           ) : (
//             'Login'
//           )}
//         </motion.button>

//       </motion.form>

//      <motion.div 
//   initial={{ opacity: 0, y: 10 }} 
//   animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }} 
//   className="mt-6 text-center"
// >
 
//           {/* Divider */}
//       <div className="my-6 flex items-center">
//         <div className="flex-grow border-t border-[var(--color-border-default)]"></div>
//         <span className="mx-4 flex-shrink text-sm text-[var(--color-text-muted)]">OR</span>
//         <div className="flex-grow border-t border-[var(--color-border-default)]"></div>
//       </div>

//       {/* Google Sign-in Button */}
//       <motion.button
//         type="button"
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         onClick={() => googleLogin()}
//         className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-60"
//         disabled={loading}
//       >
//         <svg className="h-5 w-5" viewBox="0 0 48 48">
//           <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
//           <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
//           <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
//           <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
//         </svg>
//         Sign in with Google
//       </motion.button>
// </motion.div>
// {/* 
//       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }} className="mt-6 text-center">
//         <p className="text-[var(--color-text-default)] text-sm mb-2">or continue with</p>
//         <div className="flex justify-center gap-4">

         

//           <motion.img whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} 
        
//           src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"
//            className="w-6 h-6 cursor-pointer" /> 


//           <motion.img whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} 
//           src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook"
//            className="w-6 h-6 cursor-pointer" />
        
        
// =======
//           <motion.img
//   whileHover={{ scale: 1.1 }}
//   whileTap={{ scale: 0.95 }}
//    onClick={() => googleLogin()}
//   src="https://www.svgrepo.com/show/475656/google-color.svg"
//   alt="Google"
//   className="w-6 h-6 cursor-pointer"
// />

    

// {/* <FacebookLogin
//   appId="673397652389082"
//   autoLoad={false}
//   // 👇 THIS IS THE CRITICAL LINE
//   fields="name,email,picture" 
//   callback={handleFacebookResponse}
//   render={renderProps => (
//     <motion.img
//       whileHover={{ scale: 1.1 }}
//       whileTap={{ scale: 0.95 }}
//       onClick={renderProps.onClick}
//       disabled={renderProps.disabled}
//       src="https://www.svgrepo.com/show/448224/facebook.svg"
//       alt="Facebook"
//       className="w-6 h-6 cursor-pointer"
//     />
//   )}
// /> */}


//         {/* </div>
//       </motion.div>  */}

//       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }} className="mt-6 text-center text-sm">
//         <span className="text-[var(--color-text-default)] font-medium">New here? </span>
//         <button onClick={onSwitchToRegister} className="text-[var(--color-primary)] font-semibold underline hover:text-[var(--color-primary-hover)] transition-colors">
//           Register here
//         </button>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;

// src/components/auth/Login.jsx
import React, { useEffect, useState } from "react";
import { loginUser } from "../api/auth";
import { useAuth } from "../components/context/AuthContext";
import { Mail, Lock, Loader, User } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {jwtDecode} from "jwt-decode";
import { googleAuth } from "../api/auth";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithFacebook } from "../api/socialAuth";
import { loginWithGoogle } from "../api/socialAuth";
import { useGoogleLogin } from "@react-oauth/google";

const Login = ({ onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      
      const { access: accessToken, refresh: refreshToken, role, email: userEmail, full_name } = res.data;

      const decoded = jwtDecode(accessToken);
      const id = decoded.user_id;
      const userInfo = { id, role, email: userEmail, full_name };

      login(accessToken, refreshToken, userInfo);
      localStorage.setItem("userRole", role.toLowerCase());

      toast.success(`Welcome, ${full_name || 'User'}!`);

      const roleLower = role.toLowerCase();
      const path = {
        "nutritionist": "/nutritionist",
        "operator": "/operator",
        "owner": "/owner",
      }[roleLower] || "/dashboard";
      
      navigate(path);
      onClose?.();

    } catch (error) {
      const data = error.response?.data;

      // ValidationError (e.g. unverified nutritionist) → comes as non_field_errors[]
      const nonFieldError = data?.non_field_errors?.[0];
      // Standard DRF auth error (wrong password) → comes as detail string
      const detailError = data?.detail;

      const message = nonFieldError || detailError;

      if (message?.toLowerCase().includes("pending") || message?.toLowerCase().includes("verif")) {
        // Show a calm info toast for unverified accounts
        toast.info("⏳ Please wait till admin verifies your account.", {
          autoClose: 6000,
        });
      } else if (message) {
        toast.error(message);
      } else {
        toast.error("Invalid email or password.");
      }

      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const googleToken = tokenResponse.access_token;
      const res = await loginWithGoogle(googleToken);

      const { access, refresh, role, email: userEmail, full_name } = res.data;
      const id = jwtDecode(access).user_id;
      const userInfo = { id, role, email: userEmail, full_name };

      login(access, refresh, userInfo);
      localStorage.setItem("userRole", role.toLowerCase());
      toast.success(`Welcome, ${full_name || "User"}!`);

      const redirectPath = {
        nutritionist: "/nutritionist",
        operator: "/operator",
        owner: "/owner",
      }[role.toLowerCase()] || "/dashboard";

      navigate(redirectPath);
      onClose?.();
    } catch (error) {
      console.error("Google Login Failed:", error);
      toast.error("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error("Google login failed."),
  });

  return (
    <div className="text-left w-full max-w-sm mx-auto p-4 font-[var(--font-secondary)]">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-[var(--font-primary)] text-center mb-6 text-[var(--color-text-strong)]"
      >
        Login
      </motion.h2>

      <motion.form 
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        onSubmit={handleLogin} 
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <label htmlFor="login-email" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">Email Address</label>
          <div className="relative">
            <input
              id="login-email" type="email"
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]"
              placeholder="Enter your email"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label htmlFor="login-password" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">Password</label>
          <div className="relative">
            <input
              id="login-password" type="password"
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]"
              placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-right">
          <a href="/forgot-password" className="text-sm text-[var(--color-primary)] hover:underline font-medium">
            Forgot Password?
          </a>
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] px-5 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:transform-none disabled:shadow-md"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="animate-spin" /> Logging in...
            </span>
          ) : (
            'Login'
          )}
        </motion.button>
      </motion.form>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }} 
        className="mt-6 text-center"
      >
        {/* <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-[var(--color-border-default)]"></div>
          <span className="mx-4 flex-shrink text-sm text-[var(--color-text-muted)]">OR</span>
          <div className="flex-grow border-t border-[var(--color-border-default)]"></div>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => googleLogin()}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-60"
          disabled={loading}
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          Sign in with Google
        </motion.button> */}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }} 
        className="mt-6 text-center text-sm"
      >
        <span className="text-[var(--color-text-default)] font-medium">New here? </span>
        <button 
          onClick={onSwitchToRegister} 
          className="text-[var(--color-primary)] font-semibold underline hover:text-[var(--color-primary-hover)] transition-colors"
        >
          Register here
        </button>
      </motion.div>
    </div>
  );
};

export default Login;