import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {BookOpen,Trophy,Users,Calculator,UserCircle,Home,ChevronRight,LogIn,LogOut,CheckCircle2} from "lucide-react";
import {supabase,supabaseConfigured} from "./lib/supabase";
import {getExams,getSubjects} from "./lib/cbt";
import "./styles.css";

const fallbackExams=["JAMB","WAEC","NECO","NABTEB","GCE","BECE","IJMB","Post-UTME"];
const fallbackSubjects=["Mathematics","English Language","Physics","Chemistry","Biology","Economics","Government","Accounting"];

function App(){
 const [tab,setTab]=useState("home"),[exam,setExam]=useState("JAMB"),[subject,setSubject]=useState("Mathematics");
 const [exams,setExams]=useState([]),[subjects,setSubjects]=useState([]),[session,setSession]=useState(null),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 useEffect(()=>{ if(!supabase)return; supabase.auth.getSession().then(({data})=>setSession(data.session)); const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>data.subscription.unsubscribe(); },[]);
 useEffect(()=>{ if(!supabaseConfigured)return; Promise.all([getExams(),getSubjects()]).then(([e,s])=>{setExams(e);setSubjects(s)}).catch(()=>{}); },[]);
 const signIn=async()=>{setBusy(true);setNotice("");const {error}=await supabase.auth.signInWithPassword({email,password});setNotice(error?error.message:"Signed in successfully.");setBusy(false)};
 const signUp=async()=>{setBusy(true);setNotice("");const {error}=await supabase.auth.signUp({email,password});setNotice(error?error.message:"Account created. Check your email if confirmation is enabled.");setBusy(false)};
 const signOut=async()=>{await supabase?.auth.signOut();setNotice("Signed out.");};
 const examNames=exams.length?exams.map(x=>x.name):fallbackExams, subjectNames=subjects.length?subjects.map(x=>x.name):fallbackSubjects;
 return <div className="app"><header><div className="brand"><span className="logo">E</span><div><b>EduToks</b><small>Learn • Create • Compete</small></div></div><button className="profile" onClick={()=>setTab("profile")}><UserCircle/></button></header>
 <main>
 {tab==="home"&&<><section className="hero"><div><span className="pill">🇳🇬 Built for Nigerian students</span><h1>Learn smarter.<br/><em>Compete better.</em></h1><p>CBT practice, competitions, learning tools and a student community in one place.</p><button className="primary" onClick={()=>setTab("cbt")}>Start CBT <ChevronRight size={18}/></button></div><div className="hero-card"><Trophy/><b>Daily Challenge</b><span>Test your knowledge and climb the leaderboard.</span></div></section><h2>Explore EduToks</h2><div className="cards"><Card icon={<BookOpen/>} title="CBT Practice" text="JAMB, WAEC, NECO & more" onClick={()=>setTab("cbt")}/><Card icon={<Trophy/>} title="Competitions" text="Earn points and rank up" onClick={()=>setTab("competition")}/><Card icon={<Calculator/>} title="Study Tools" text="Calculators & learning helpers" onClick={()=>setTab("tools")}/><Card icon={<Users/>} title="Community" text="Connect with students & teachers" onClick={()=>setTab("community")}/></div></>}
 {tab==="cbt"&&<section className="panel"><h1>CBT Practice</h1><p>Choose your exam and subject to begin.</p><label>Exam</label><div className="chips">{examNames.map(x=><button className={exam===x?"chip active":"chip"} onClick={()=>setExam(x)} key={x}>{x}</button>)}</div><label>Subject</label><select value={subject} onChange={e=>setSubject(e.target.value)}>{subjectNames.map(x=><option key={x}>{x}</option>)}</select><div className="practice"><b>{exam} • {subject}</b><span>Next layer is connected to Supabase CBT data.</span><button className="primary" onClick={()=>setNotice(session?"CBT session ready — question engine is the next build layer.":"Please sign in before starting a saved CBT.")}>Start Practice</button></div></section>}
 {tab==="competition"&&<section className="panel"><h1>Competitions</h1><p>Compete at school, community, LGA, state and national levels.</p><div className="stat"><Trophy/><div><b>Points Leader</b><span>Correct answers earn 1 point.</span></div></div></section>}
 {tab==="tools"&&<section className="panel"><h1>Study Tools</h1><div className="tool-grid">{subjectNames.slice(0,6).map(x=><div className="tool" key={x}><Calculator/><b>{x} Calculator</b><span>Equation-ready study helper</span></div>)}</div></section>}
 {tab==="community"&&<section className="panel"><h1>Community</h1><p>Social feed, creators, teachers, stories, chat and live learning will live here.</p><div className="empty">The community layer will use persistent Supabase data.</div></section>}
 {tab==="profile"&&<section className="panel"><h1>{session?"Your Profile":"Sign in to EduToks"}</h1>{session?<><div className="stat"><CheckCircle2/><div><b>Authenticated</b><span>{session.user.email}</span></div></div><button className="secondary" onClick={signOut}><LogOut/> Sign out</button></>:<><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><div className="auth-actions"><button className="primary" disabled={!supabaseConfigured||busy} onClick={signIn}><LogIn/> Sign in</button><button className="secondary" disabled={!supabaseConfigured||busy} onClick={signUp}>Create account</button></div>{!supabaseConfigured&&<small>Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to the Appwrite site environment.</small>}</>}</section>}
 {notice&&<div className="notice">{notice}</div>}
 </main>
 <nav>{[["home",<Home/>,"Home"],["cbt",<BookOpen/>,"CBT"],["competition",<Trophy/>,"Compete"],["community",<Users/>,"Community"],["tools",<Calculator/>,"Tools"]].map(([id,icon,label])=><button className={tab===id?"nav active":"nav"} onClick={()=>setTab(id)} key={id}>{icon}<span>{label}</span></button>)}</nav></div>
}
function Card({icon,title,text,onClick}){return <button className="card" onClick={onClick}>{icon}<b>{title}</b><span>{text}</span><ChevronRight/></button>}
createRoot(document.getElementById("root")).render(<App/>);