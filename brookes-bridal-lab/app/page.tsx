"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle2, LogIn, LogOut, Palette, Sparkles, Upload, MessageCircle, Images, Shield, Loader2 } from "lucide-react";

// === Simple shadcn/ui proxies (fallbacks for preview) ===
// If your environment already has shadcn/ui installed, you can remove these minimal styles
// and import from "@/components/ui/*" instead.
const Button = ({ className = "", asChild = false, ...props }: any) => (
  <button
    className={
      "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium shadow-sm hover:shadow md:text-base " +
      "bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed " +
      className
    }
    {...props}
  />
);
const Card = ({ className = "", ...props }: any) => (
  <div className={"rounded-2xl border border-black/10 bg-white shadow-sm " + className} {...props} />
);
const CardHeader = ({ className = "", ...props }: any) => (
  <div className={"p-4 md:p-6 border-b border-black/5 " + className} {...props} />
);
const CardTitle = ({ className = "", ...props }: any) => (
  <h3 className={"text-lg md:text-xl font-semibold tracking-tight " + className} {...props} />
);
const CardContent = ({ className = "", ...props }: any) => (
  <div className={"p-4 md:p-6 " + className} {...props} />
);
const Input = ({ className = "", ...props }: any) => (
  <input
    className={
      "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm md:text-base outline-none focus:ring-2 focus:ring-black/20 " +
      className
    }
    {...props}
  />
);
const Label = ({ className = "", ...props }: any) => (
  <label className={"block text-xs md:text-sm font-medium text-black/70 mb-1 " + className} {...props} />
);
const Textarea = ({ className = "", ...props }: any) => (
  <textarea
    className={
      "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm md:text-base outline-none focus:ring-2 focus:ring-black/20 min-h-[120px] " +
      className
    }
    {...props}
  />
);

// === Constants ===
const ACCESS_CODE = (process.env.NEXT_PUBLIC_ACCESS_CODE as string) || "BRIDELAB2026"; // set NEXT_PUBLIC_ACCESS_CODE in env for production
const PALETTE = [
  { name: "Moss Olive", hex: "#6A7758" },
  { name: "Sage Olive", hex: "#666844" },
  { name: "Forest Olive", hex: "#444F24" },
  { name: "Pistachio Olive", hex: "#7E8C54" },
];
const DELTA_E = 20; // tolerance

// === Helpers ===
const cls = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");
const emailKey = (email: string) => `bbl-user:${email.toLowerCase()}`;

type ChatMsg = { role: "user" | "assistant"; text: string; ts: number };

interface UserProfile {
  email: string;
  selfieDataUrl?: string; // stored base64 locally for demo
  mockups: string[]; // base64 images
  topPicks: { title: string; url?: string; note?: string; price?: string }[];
  chat: ChatMsg[];
}

const defaultProfile = (email: string): UserProfile => ({
  email,
  selfieDataUrl: undefined,
  mockups: [],
  topPicks: [],
  chat: [
    {
      role: "assistant",
      text:
        "hey gorgeous! i’m your bridesmaid-bestie stylist 💐 drop your size, budget (or say ‘use default’), and style prefs (length, sleeves, neckline, silhouette). tell me your event date + state so I can filter shipping. i’ll only show perfect olive matches!",
      ts: Date.now(),
    },
  ],
});

function useLocalProfile(email: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!email) return;
    const raw = localStorage.getItem(emailKey(email));
    if (raw) setProfile(JSON.parse(raw));
    else setProfile(defaultProfile(email));
  }, [email]);

  useEffect(() => {
    if (profile) localStorage.setItem(emailKey(profile.email), JSON.stringify(profile));
  }, [profile]);

  return { profile, setProfile } as const;
}

// === Image to base64 ===
async function fileToDataURL(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// === Components ===
function LoginView({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Autofill from URL params if provided
    const u = new URL(window.location.href);
    const e = u.searchParams.get("email");
    const c = u.searchParams.get("code");
    if (e) setEmail(e);
    if (c) setCode(c);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    if (code.trim() !== ACCESS_CODE) {
      setError("Invalid access code. Check your invite email and try again.");
      setLoading(false);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    onLogin(email.trim().toLowerCase());
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-emerald-50 to-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <img
  src="/B.B.L (1).png"
  alt="Brooke's Bridal Lab Logo"
  className="h-10 w-auto rounded-xl object-contain"
/>
            <div>
              <CardTitle>Brooke's Bridal Lab ♡</CardTitle>
              <p className="text-sm text-black/60">Private bridesmaid portal</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Access code</Label>
              <Input
                type="password"
                placeholder="Enter the code from your invite"
                value={code}
                onChange={(e: any) => setCode(e.target.value)}
              />
              <p className="mt-1 text-xs text-black/50">Need help? Reply to Brooke’s invite email 💌</p>
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-xl">{error}</div>
            )}
            <Button type="submit" className="w-full justify-center">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Log in
            </Button>
            <p className="text-xs text-center text-black/50 mt-2 flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" /> Your photos stay private to your account on this device.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function HeaderBar({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-black/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 grid place-items-center rounded-2xl bg-emerald-100">
            <Sparkles className="h-4 w-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-sm font-semibold">Brooke's Bridal Lab ♡</div>
            <div className="text-xs text-black/60">Signed in as {email}</div>
          </div>
        </div>
        <Button className="bg-black/90" onClick={onLogout}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}

function SelfieCard({ profile, setProfile }: { profile: UserProfile; setProfile: (p: UserProfile) => void }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const onPick = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const dataUrl = await fileToDataURL(file);
    setProfile({ ...profile, selfieDataUrl: dataUrl });
    setUploading(false);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 grid place-items-center rounded-2xl bg-emerald-100">
            <Camera className="h-4 w-4 text-emerald-700" />
          </div>
          <CardTitle>Upload selfie</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-[200px,1fr] gap-4 items-start">
          <div className="aspect-[3/4] bg-black/5 rounded-xl overflow-hidden grid place-items-center">
            {profile.selfieDataUrl ? (
              <img src={profile.selfieDataUrl} alt="Selfie" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6 text-sm text-black/60">
                front-facing, good lighting, torso visible, neutral background ✨
              </div>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-sm text-black/70">
              This photo powers tasteful mockups of dresses on you — only used inside your portal.
            </p>
            <div className="flex gap-2">
              <Button onClick={onPick}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload photo
              </Button>
              {profile.selfieDataUrl && (
                <Button className="bg-white text-black border border-black/10" onClick={() => setProfile({ ...profile, selfieDataUrl: undefined })}>
                  Remove
                </Button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaletteCard() {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <div className="h-9 w-9 grid place-items-center rounded-2xl bg-emerald-100">
          <Palette className="h-4 w-4 text-emerald-700" />
        </div>
        <CardTitle>Approved dress palette</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PALETTE.map((c) => (
            <div key={c.hex} className="rounded-2xl overflow-hidden border border-black/10">
              <div className="h-24" style={{ backgroundColor: c.hex }} />
              <div className="p-3 text-sm">
                <div className="font-medium">{c.name}</div>
                <div className="text-black/60">{c.hex}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-black/60">
          Matching tolerance: ΔE ≤ {DELTA_E} (strict). Near-match window: ΔE ≤ {DELTA_E + 2} (marked as “near”).
        </div>
      </CardContent>
    </Card>
  );
}

function PicksCard({ profile, setProfile }: { profile: UserProfile; setProfile: (p: UserProfile) => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");

  const addPick = () => {
    if (!title) return;
    const next = { title, url, note, price };
    setProfile({ ...profile, topPicks: [next, ...profile.topPicks].slice(0, 6) });
    setTitle("");
    setUrl("");
    setPrice("");
    setNote("");
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <div className="h-9 w-9 grid place-items-center rounded-2xl bg-emerald-100">
          <Sparkles className="h-4 w-4 text-emerald-700" />
        </div>
        <CardTitle>My top dress picks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-[1fr,1fr] gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e: any) => setTitle(e.target.value)} placeholder="Designer, style name" />
            <Label>Link</Label>
            <Input value={url} onChange={(e: any) => setUrl(e.target.value)} placeholder="https://…" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price</Label>
                <Input value={price} onChange={(e: any) => setPrice(e.target.value)} placeholder="$—" />
              </div>
              <div>
                <Label>Note</Label>
                <Input value={note} onChange={(e: any) => setNote(e.target.value)} placeholder="Why I like it" />
              </div>
            </div>
            <Button onClick={addPick} className="mt-2">
              <CheckCircle2 className="h-4 w-4" /> Save pick
            </Button>
          </div>
          <div className="grid gap-3">
            {profile.topPicks.length === 0 && (
              <div className="text-sm text-black/60">No picks yet. Add a few you love and I’ll score color + fit in chat 💬</div>
            )}
            {profile.topPicks.map((p, i) => (
              <div key={i} className="rounded-xl border border-black/10 p-3">
                <div className="font-medium">{p.title}</div>
                {p.price && <div className="text-sm">{p.price}</div>}
                {p.url && (
                  <a className="text-sm text-emerald-700 underline" href={p.url} target="_blank" rel="noreferrer">
                    View product
                  </a>
                )}
                {p.note && <div className="text-xs text-black/60 mt-1">{p.note}</div>}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatCard({ profile, setProfile }: { profile: UserProfile; setProfile: (p: UserProfile) => void }) {
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [profile.chat.length]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMsg = { role: "user", text: input.trim(), ts: Date.now() };
    setProfile({ ...profile, chat: [...profile.chat, userMsg] });
    setInput("");
    // Placeholder assistant echo; replace with your chat backend.
    const reply: ChatMsg = {
      role: "assistant",
      text:
        "got it! I’ll use only the approved olive palette and your budget/size. want a mockup? say ‘mockup in forest olive, strapless, floor-length’ ✨",
      ts: Date.now() + 200,
    };
    setTimeout(() => setProfile({ ...profile, chat: [...profile.chat, reply] }), 400);
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <div className="h-9 w-9 grid place-items-center rounded-2xl bg-emerald-100">
          <MessageCircle className="h-4 w-4 text-emerald-700" />
        </div>
        <CardTitle>Chat with Bridal Lab ♡</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={listRef} className="h-64 overflow-y-auto space-y-3 pr-1">
          {profile.chat.map((m, i) => (
            <div key={i} className={cls("flex", m.role === "user" ? "justify-end" : "justify-start")}> 
              <div
                className={cls(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user" ? "bg-black text-white" : "bg-black/5 text-black"
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input value={input} onChange={(e: any) => setInput(e.target.value)} placeholder="ask for picks, mockups, or sizing help…" />
          <Button onClick={send}>Send</Button>
        </div>
        <p className="text-xs text-black/50 mt-2">Note: This demo chat is local-only. In production, connect to the Bridal Lab GPT with your API route.</p>
      </CardContent>
    </Card>
  );
}

function MockupsCard({ profile, setProfile }: { profile: UserProfile; setProfile: (p: UserProfile) => void }) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const addMockup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataURL(file);
    setProfile({ ...profile, mockups: [dataUrl, ...profile.mockups] });
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <div className="h-9 w-9 grid place-items-center rounded-2xl bg-emerald-100">
          <Images className="h-4 w-4 text-emerald-700" />
        </div>
        <CardTitle>My mockups</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Button onClick={() => fileRef.current?.click()} className="bg-white text-black border border-black/10">
            <Upload className="h-4 w-4" /> Add mockup
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addMockup} />
        </div>
        {profile.mockups.length === 0 ? (
          <div className="text-sm text-black/60">No mockups yet. Ask in chat for a “try-on” and they’ll appear here 💫</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {profile.mockups.map((m, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-black/5">
                <img src={m} alt={`Mockup ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const { profile, setProfile } = useLocalProfile(email);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40">
      <HeaderBar email={email} onLogout={onLogout} />

      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6">
        {/* Hero */}
        <section className="grid md:grid-cols-[1.2fr,1fr] gap-6 items-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-2xl md:text-3xl font-semibold">
              welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-lime-600">Brooke's Bridal Lab ♡</span>
            </h1>
            <p className="text-black/70 mt-1">
              Your private suite for olive-perfect bridesmaid styling: upload a selfie, explore the palette, save your picks, chat with your stylist, and collect your mockups.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <div className="rounded-2xl border border-black/10 bg-white p-4 grid grid-cols-2 gap-3">
              {PALETTE.map((c) => (
                <div key={c.hex} className="rounded-xl overflow-hidden border border-black/10">
                  <div className="h-16" style={{ backgroundColor: c.hex }} />
                  <div className="p-2 text-xs">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-black/60">{c.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Grid sections */}
        <section className="grid gap-6 md:grid-cols-2">
          <SelfieCard profile={profile} setProfile={setProfile as any} />
          <PaletteCard />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <PicksCard profile={profile} setProfile={setProfile as any} />
          <ChatCard profile={profile} setProfile={setProfile as any} />
        </section>

        <section>
          <MockupsCard profile={profile} setProfile={setProfile as any} />
        </section>
      </main>
    </div>
  );
}

export default function BridalLabPortal() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("bbl-session-email");
    if (stored) setEmail(stored);
  }, []);

  const handleLogin = (e: string) => {
    setEmail(e);
    sessionStorage.setItem("bbl-session-email", e);
  };
  const handleLogout = () => {
    sessionStorage.removeItem("bbl-session-email");
    setEmail(null);
  };

  return email ? <Dashboard email={email} onLogout={handleLogout} /> : <LoginView onLogin={handleLogin} />;
}
