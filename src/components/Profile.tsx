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
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-stone-800 hover:border-amber-500 transition-colors flex-shrink-0"
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
          <div className="w-full h-full bg-amber-600 flex items-center justify-center">
            <UserIcon size={16} className="text-stone-950" />
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-800 rounded-xl shadow-xl overflow-hidden z-20">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
                <UserIcon size={16} className="text-stone-950" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-serif text-amber-50 truncate">
                {user.displayName || "No name set"}
              </p>
              <p className="text-xs font-mono text-amber-500/50 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logOut()}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-mono text-amber-200 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}