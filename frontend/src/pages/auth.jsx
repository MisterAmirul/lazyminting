import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client directly inside this file
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();

  const signInWithEmail = async (e) => {
    e.preventDefault();

    //try logging in
    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
      return;
    } 

    setMessage("Login successful!");

    //wait for session to be fully available
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      setMessage("Login succeeded, but no session found, try refreshing");
      console.warn("No session after login:", sessionError);
      return;
    }

    console.log("Logged in as:", session.user.email);

    //navigate after session is ready
    navigate("/mint");

  };

  const signUpWithEmail = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : "Signup successful! Check your email for confirmation.");
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    setMessage(error ? error.message : "");
  };

  return (
    <div className="container">
      <div className="login-box">
        <form className="form" onSubmit={showSignup ? signUpWithEmail : signInWithEmail}>
          <div className="logo"></div>
          <span className="header">{showSignup ? "Sign Up" : "Welcome Back!"}</span>
          <input
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="button sign-in">
            {showSignup ? "Sign Up" : "Sign In"}
          </button>
          <button
            type="button"
            className="button google-sign-in"
            onClick={signInWithGoogle}
          >
            <span className="span two">Sign in with Google</span>
          </button>
          {message && <div style={{ color: "red", marginTop: "10px" }}>{message}</div>}
          <p className="footer">
            {showSignup ? (
              <>
                Already have an account?{" "}
                <a
                  href="#"
                  className="link"
                  onClick={e => {
                    e.preventDefault();
                    setShowSignup(false);
                    setMessage("");
                  }}
                >
                  Sign in
                </a>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <a
                  href="#"
                  className="link"
                  onClick={e => {
                    e.preventDefault();
                    setShowSignup(true);
                    setMessage("");
                  }}
                >
                  Sign up, it's free!
                </a>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
