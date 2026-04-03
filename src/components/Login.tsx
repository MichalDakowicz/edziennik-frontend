import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getCurrentUser } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (getCurrentUser()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Nie udało się zalogować";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col relative min-h-screen bg-surface-container-lowest text-on-background font-body">
      {/* Language Switcher (Top Right) */}
      <div className="absolute top-8 right-8 z-20">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant text-sm font-medium">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>language</span>
          <span>Polski</span>
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>expand_more</span>
        </button>
      </div>
      
      {/* Centered Authentication Section */}
      <div className="flex-grow flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          {/* Brand Anchor */}
          <div className="mb-12 text-center">
            <h2 className="font-headline text-5xl font-black text-primary tracking-tighter">Modéa</h2>
            <p className="text-on-surface-variant font-medium mt-3">Zaloguj się do panelu</p>
          </div>
          
          {/* Login Form */}
          <form className="space-y-6" onSubmit={onSubmit}>
            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="username">
                Nazwa użytkownika
              </label>
              <div className="relative group">
                <input 
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-0 focus:border-outline-variant/50 transition-all text-on-surface placeholder-outline/50 font-medium outline-none" 
                  id="username" 
                  name="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Jan_Kowalski" 
                  type="text"
                  required
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-primary transition-all duration-300 group-focus-within:w-[calc(100%-2.5rem)] rounded-t-full"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="password">Hasło</label>
                <a className="text-xs font-bold text-primary hover:text-primary-container transition-colors uppercase tracking-wider" href="#">Zapomniałeś hasła?</a>
              </div>
              <div className="relative group overflow-hidden rounded-xl">
                <input 
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-0 focus:border-outline-variant/50 transition-all text-on-surface placeholder-outline/50 font-medium outline-none" 
                  id="password" 
                  name="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  required
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors flex items-center justify-center h-full" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-1">
              <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low" id="remember" type="checkbox" />
              <label className="text-sm font-medium text-on-surface-variant cursor-pointer" htmlFor="remember">Nie wylogowuj mnie</label>
            </div>
            
            <button 
              className="w-full py-4 px-6 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/10 hover:bg-primary-container transition-all duration-200 font-headline text-lg disabled:opacity-70 disabled:cursor-not-allowed" 
              type="submit"
              disabled={loading}
            >
              {loading ? "Logowanie..." : "Zaloguj"}
            </button>
          </form>
          
        </div>
      </div>
      
    </main>
  );
}
