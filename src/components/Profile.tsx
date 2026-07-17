import { useState, useRef, useEffect } from "react";
import { User as UserIcon, LogOut } from "lucide-react";
import type { User } from "firebase/auth";
import { logOut } from "../firebase/auth";

export default function Profile({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-sky-500/30 hover:border-pink-400 transition-colors flex-shrink-0"
        aria-label="Profile menu"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sky-400 to-pink-500 flex items-center justify-center">
            <UserIcon size={16} className="text-black" />
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-black border border-sky-500/20 rounded-xl shadow-xl overflow-hidden z-20">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-sky-500/10">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                <UserIcon size={16} className="text-black" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-serif text-white truncate">
                {user.displayName || "No name set"}
              </p>
              <p className="text-xs font-mono text-sky-400/60 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logOut()}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-mono text-sky-300 hover:bg-pink-500/10 hover:text-pink-400 transition-colors"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}