import { useState, useRef } from "react";
const ACCENT = "#00E5FF";
const BG = "#080C14";
const CARD2 = "#141D30";
const BORDER = "#1E2D45";
const TEXT = "#E2EAF6";
const MUTED = "#5A7290";
const SUCCESS = "#00FFA3";
const WARN = "#FFD166";
const DANGER = "#FF6B6B";
const glass = {
  background:"rgba(14,21,37,0.85)",
  backdropFilter:"blur(18px)",
  border:`1px solid ${BORDER}`,
  borderRadius:16,
};
/* ─── parse helpers ─── */
function parseSection(text, key) {
  const m = text.match(new RegExp(`\\[${key}\\]([\\s\\S]*?)(?=\\[|$)`,"i"));
  return m ? m[1].trim() : "";
}
function parsePipeList(text, key) {
  return parseSection(text, key)
    .split("\n")
    .map(l => l.replace(/^\d+[|.\)]\s*/,"").trim())
    .filter(Boolean);
}
function parseJSON(text, key) {
  const raw = parseSection(text, key);
  try { return JSON.parse(raw); } catch { return null; }
}
/* ─── small components ─── */
function Spinner() {
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",padding:48,flexDirection:"column",gap:20}}>
      <div style={{width:56,height:56,borderRadius:"50%",border:`3px solid ${BORDER}`,borderTop:`3px solid ${ACCENT}`,animation:"spin .8s linear infinite"}}/>
      <span style={{color:MUTED,fontFamily:"'Space Mono',monospace",fontSize:13,letterSpacing:2}}>ANALYSING...</span>
    </div>
  );
}
function SectionTitle({ icon, title, color=ACCENT }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
      <span style={{fontSize:20}}>{icon}</span>
      <span style={{color,fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:13,letterSpacing:3,textTransform:"uppercase"}}>{title}</span>
    </div>
  );
}
function Card({ children, style={} }) {
  return <div style={{...glass,padding:"24px 28px",marginBottom:20,...style}}>{children}</div>;
}
function Chip({ children, color=ACCENT }) {
  return (
    <span style={{display:"inline-block",padding:"3px 10px",borderRadius:99,fontSize:11,fontFamily:"'Space Mono',monospace",fontWeight:700,letterSpacing:1,background:`${color}15`,color,border:`1px solid ${color}33`}}>
      {children}
    </span>
  );
}
function InfoBanner({ color, icon, label, children }) {
  return (
    <div style={{...glass,padding:"13px 18px",marginBottom:20,background:`${color}08`,borderColor:`${color}33`}}>
      <span style={{color,fontFamily:"'Space Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:2}}>{icon} {label}</span>
      <p style={{color:TEXT,fontSize:13,marginTop:5,lineHeight:1.6}}>{children}</p>
    </div>
  );
}
function QuestionCard({ q, index, prefix="Q", why, accentColor=ACCENT }) {
  const [copied, setCopied] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  return (
    <div style={{background:CARD2,border:`1px solid ${showWhy?accentColor+"55":BORDER}`,borderRadius:12,padding:"16px 20px",marginBottom:10,borderLeft:`3px solid ${accentColor}`,transition:"all .2s"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
        <span style={{color:accentColor,fontFamily:"'Space Mono',monospace",fontSize:11,fontWeight:700,minWidth:28,paddingTop:2,flexShrink:0}}>{prefix}{index+1}</span>
        <span style={{color:TEXT,fontSize:14.5,lineHeight:1.65,flex:1}}>{q}</span>
        <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:8}}>
          {why && (
            <button onClick={()=>setShowWhy(v=>!v)}
              style={{background:showWhy?`${accentColor}22`:"none",border:`1px solid ${showWhy?accentColor:BORDER}`,borderRadius:6,color:showWhy?accentColor:MUTED,cursor:"pointer",fontSize:10,padding:"4px 8px",fontFamily:"'Space Mono',monospace",transition:"all .2s",whiteSpace:"nowrap"}}>
              {showWhy?"▲ WHY":"▼ WHY"}
            </button>
          )}
          <button onClick={()=>{navigator.clipboard?.writeText(q);setCopied(true);setTimeout(()=>setCopied(false),1500);}}
            style={{background:"none",border:`1px solid ${BORDER}`,borderRadius:6,color:copied?SUCCESS:MUTED,cursor:"pointer",fontSize:10,padding:"4px 8px",fontFamily:"'Space Mono',monospace",transition:"all .2s",whiteSpace:"nowrap"}}>
            {copied?"✓":"Copy"}
          </button>
        </div>
      </div>
      {showWhy && why && (
        <div style={{marginTop:12,marginLeft:42,padding:"10px 14px",background:`${accentColor}0D`,borderRadius:8,borderLeft:`2px solid ${accentColor}55`}}>
          <span style={{color:accentColor,fontFamily:"'Space Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:1.5,display:"block",marginBottom:5}}>✦ WHY THIS IMPRESSES</span>
          <span style={{color:TEXT,fontSize:13,lineHeight:1.6}}>{why}</span>
        </div>
      )}
    </div>
  );
}
function RedFlagItem({ item, isLast }) {
  const [open, setOpen] = useState(false);
  const flagText = typeof item === "string" ? item : item.flag;
  const probe = typeof item === "object" ? item.probe : "";
  const counter = typeof item === "object" ? item.counter : "";
  const canExpand = !!(probe || counter);
  return (
    <div style={{borderBottom:!isLast?`1px solid ${BORDER}`:"none",padding:"16px 0"}}>
      <div style={{display:"flex",gap:14,alignItems:"flex-start",cursor:canExpand?"pointer":"default"}} onClick={()=>canExpand&&setOpen(v=>!v)}>
        <span style={{background:`${DANGER}22`,border:`1px solid ${DANGER}44`,borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>⚠</span>
        <span style={{color:TEXT,fontSize:14.5,lineHeight:1.65,flex:1}}>{flagText}</span>
        {canExpand && <span style={{color:MUTED,fontSize:11,fontFamily:"'Space Mono',monospace",flexShrink:0,paddingTop:3}}>{open?"▲":"▼"}</span>}
      </div>
      {open && canExpand && (
        <div style={{marginLeft:40,marginTop:12,display:"flex",flexDirection:"column",gap:10}}>
          {probe && (
            <div style={{padding:"10px 14px",background:`${WARN}0A`,borderRadius:8,borderLeft:`2px solid ${WARN}55`}}>
              <div style={{color:WARN,fontFamily:"'Space Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:5}}>🔍 HOW TO PROBE IN INTERVIEW</div>
              <div style={{color:TEXT,fontSize:13,lineHeight:1.6}}>{probe}</div>
            </div>
          )}
          {counter && (
            <div style={{padding:"10px 14px",background:`${SUCCESS}0A`,borderRadius:8,borderLeft:`2px solid ${SUCCESS}55`}}>
              <div style={{color:SUCCESS,fontFamily:"'Space Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:5}}>🛡 COUNTER-STRATEGY</div>
              <div style={{color:TEXT,fontSize:13,lineHeight:1.6}}>{counter}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
/* ─── main ─── */
export default function App() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const resultRef = useRef(null);
  const tabs = [
    {id:"overview", label:"Company Intel", icon:"🏢"},
    {id:"projects", label:"Recent Activity", icon:"📡"},
    {id:"questions", label:"Ask Interviewer", icon:"💡"},
    {id:"strategy", label:"Win Strategy", icon:"🎯"},
    {id:"techstack", label:"Tech Stack", icon:"⚙️"},
    {id:"redflags", label:"Red Flags", icon:"🚨"},
  ];
  async function analyse() {
    if (!company.trim() || !role.trim()) { setError("Please enter both company name and role."); return; }
    setError(""); setResult(null); setLoading(true);
    const prompt = `You are a world-class career strategist, ex-FAANG hiring manager, and data intelligence expert. A candidate is preparing for a high-stakes data-role interview.
Company: ${company}
Role: ${role}
Technical Requirements: ${requirements || "Not specified"}
Produce an elite, deeply specific interview intelligence brief. Zero generic filler. Use EXACTLY these section tags in order:
[OVERVIEW]
4-6 sentences: what the company does, business model, industry position, scale, mission, key differentiators.
[INDUSTRY]
One-line industry/sector (e.g. "Fintech · Payments Infrastructure").
[FOUNDED]
Year founded and HQ city/country.
[SIZE]
Employee count and stage (e.g. "~5,000 employees · Series D unicorn").
[RECENT_PROJECTS]
6-8 items about recent news, AI/data launches, engineering initiatives, funding, acquisitions.
Format exactly: "1| item text", "2| item text" etc.
[DATA_RELEVANCE]
4-5 sentences on why data roles are MISSION-CRITICAL at this company specifically.
[TECH_STACK]
A JSON array of exactly 12 objects. No markdown fences, raw JSON only.
Each object must have all 5 fields: name, category (one of: Languages/Query | Orchestration | ML/AI | Storage | Visualization | Cloud | Streaming | DevOps | Governance), proficiency (one of: Essential | Important | Good-to-have), reason (1 sentence why this company uses it for this role), prep_tip (1 sentence what to brush up on).
Example: [{"name":"Python","category":"Languages/Query","proficiency":"Essential","reason":"...","prep_tip":"..."}]
[QUESTIONS_TECHNICAL]
Exactly 8 questions the CANDIDATE asks the INTERVIEWER. Format: "1| question", "2| question" etc.
Must be deeply company-specific, referencing real challenges at this company. NOT generic. Focus on data pipelines, AI integration, real-time analytics, fraud detection, personalization.
[QUESTIONS_STRATEGIC]
Exactly 6 questions the CANDIDATE asks the INTERVIEWER. Format: "1| question" etc.
Show business-owner thinking, reference this company's market position, growth strategies, competitive landscape.
[QUESTIONS_CULTURE]
Exactly 5 questions the CANDIDATE asks the INTERVIEWER. Format: "1| question" etc.
Feel natural and genuine. Reveal team health, work-life balance, growth opportunities, collaboration.
[QUESTION_WHY_IMPRESSIVE]
A JSON array of exactly 19 objects. No markdown fences, raw JSON only.
Format: [{"q_ref":"T1","why":"reason"},{"q_ref":"T2","why":"reason"},...]
Use q_ref codes T1-T8 for technical, S1-S6 for strategic, C1-C5 for culture. Provide detailed reasons why each question impresses, showing domain knowledge or strategic insight.
[WIN_STRATEGY]
Exactly 8 items. Format: "1| ACTION LABEL: detailed explanation specific to ${company} and ${role}".
Concrete tactics: what to research, what to say, how to frame experience, stories to prepare, how to close. Emphasize demonstrating impact on business metrics like order value, delivery time, fraud reduction.
[TALKING_POINTS]
6 angles to weave into answers. Format: "1| ANGLE NAME — how to use it, tied to ${company} priorities".
[SCORE_TECHNICAL]
Single integer 1-10 only. No other text.
[SCORE_GROWTH]
Single integer 1-10 only. No other text.
[SCORE_DATACULTURE]
Single integer 1-10 only. No other text.
[RED_FLAGS]
Exactly 5 items. Format: "1| FLAG: concern || HOW TO PROBE: question to ask || COUNTER: how to protect yourself".
Balance with realistic concerns from employee reviews, like work-life balance, job security, toxic elements, but provide probes and counters.
[SALARY_CONTEXT]
2 sentences: typical range for this role at this company type/stage, plus one negotiation insight.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key": "YOUR_ANTHROPIC_API_KEY_HERE", // Repair: Add API key placeholder
          "anthropic-version": "2023-06-01" // Repair: Add required header
        },
        body:JSON.stringify({
          model:"claude-3-5-sonnet-20240620", // Repair: Updated to valid model name
          max_tokens:2000, // Increased for better responses
          messages:[{role:"user",content:prompt}],
        }),
      });
      const data = await res.json();
      const text = (data.content||[]).map(b=>b.text||"").join("\n");
      if (!text) throw new Error("empty");
      function parseRedFlags(t) {
        return parsePipeList(t,"RED_FLAGS").map(item=>{
          const m = item.match(/^(.*?)\s*\|\|\s*HOW TO PROBE:\s*(.*?)\s*\|\|\s*COUNTER:\s*(.*)$/i);
          return m
            ? {flag:m[1].replace(/^FLAG:\s*/i,"").trim(), probe:m[2].trim(), counter:m[3].trim()}
            : {flag:item.replace(/^FLAG:\s*/i,"").trim(), probe:"", counter:""};
        });
      }
      function parseWinStrategy(t) {
        return parsePipeList(t,"WIN_STRATEGY").map(item=>{
          const m = item.match(/^([^:]+):\s*(.+)$/);
          return m ? {action:m[1].trim(),detail:m[2].trim()} : {action:"",detail:item};
        });
      }
      function parseTalkingPoints(t) {
        return parsePipeList(t,"TALKING_POINTS").map(item=>{
          const m = item.match(/^([^—–-]+)[—–-]\s*(.+)$/);
          return m ? {angle:m[1].trim(),usage:m[2].trim()} : {angle:"",usage:item};
        });
      }
      const whyRaw = parseJSON(text,"QUESTION_WHY_IMPRESSIVE")||[];
      const whyMap = {};
      whyRaw.forEach(w=>{ if(w.q_ref) whyMap[w.q_ref]=w.why; });
      setResult({
        overview: parseSection(text,"OVERVIEW"),
        industry: parseSection(text,"INDUSTRY"),
        founded: parseSection(text,"FOUNDED"),
        size: parseSection(text,"SIZE"),
        recentProjects: parsePipeList(text,"RECENT_PROJECTS"),
        dataRelevance: parseSection(text,"DATA_RELEVANCE"),
        techStack: parseJSON(text,"TECH_STACK")||[],
        questionsTechnical: parsePipeList(text,"QUESTIONS_TECHNICAL"),
        questionsStrategic: parsePipeList(text,"QUESTIONS_STRATEGIC"),
        questionsCulture: parsePipeList(text,"QUESTIONS_CULTURE"),
        whyMap,
        winStrategy: parseWinStrategy(text),
        talkingPoints: parseTalkingPoints(text),
        scoreTechnical: parseInt(parseSection(text,"SCORE_TECHNICAL")) ||7,
        scoreGrowth: parseInt(parseSection(text,"SCORE_GROWTH")) ||7,
        scoreDataCulture: parseInt(parseSection(text,"SCORE_DATACULTURE"))||7,
        redFlags: parseRedFlags(text),
        salaryContext: parseSection(text,"SALARY_CONTEXT"),
      });
      setActiveTab("overview");
      setTimeout(()=>resultRef.current?.scrollIntoView({behavior:"smooth"}),100);
    } catch(e) {
      setError("Analysis failed. Please try again or check API key.");
    } finally {
      setLoading(false);
    }
  }
  const inputSt = {
    width:"100%",background:CARD2,border:`1.5px solid ${BORDER}`,borderRadius:10,
    color:TEXT,fontSize:15,padding:"12px 16px",fontFamily:"'DM Sans',sans-serif",
    outline:"none",boxSizing:"border-box",transition:"border-color .2s",
  };
  const labelSt = {
    color:MUTED,fontSize:12,fontWeight:700,letterSpacing:2,textTransform:"uppercase",
    fontFamily:"'Space Mono',monospace",marginBottom:6,display:"block",
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${BG};color:${TEXT};font-family:'DM Sans',sans-serif;min-height:100vh}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
        .fade-in{animation:fadeIn .35s ease forwards}
        .inf:focus{border-color:${ACCENT}!important}
        .tab{background:none;border:none;cursor:pointer;padding:10px 16px;border-radius:8px;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;letter-spacing:1.5px;transition:all .2s;display:flex;align-items:center;gap:6px;white-space:nowrap}
        .tab:hover{background:${CARD2}}
        .tab-on{background:${CARD2}!important;color:${ACCENT}!important;border:1px solid ${ACCENT}44!important}
        .tab-off{color:${MUTED}}
        .abtn{background:linear-gradient(135deg,${ACCENT} 0%,#0099cc 100%);color:#000;border:none;border-radius:10px;padding:14px 38px;font-size:16px;font-weight:800;font-family:'Space Mono',monospace;cursor:pointer;letter-spacing:1px;transition:all .2s;box-shadow:0 0 24px ${ACCENT}44}
        .abtn:hover{transform:translateY(-2px);box-shadow:0 0 42px ${ACCENT}66}
        .abtn:active{transform:translateY(0)}
        .abtn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:${BG}}::-webkit-scrollbar-thumb{background:${BORDER};border-radius:99px}
      `}</style>
      <div style={{position:"fixed",inset:0,backgroundImage:`linear-gradient(${BORDER}22 1px,transparent 1px),linear-gradient(90deg,${BORDER}22 1px,transparent 1px)`,backgroundSize:"40px 40px",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",inset:0,background:`radial-gradient(ellipse at 20% 10%,#0a2545 0%,transparent 50%),radial-gradient(ellipse at 80% 90%,#001a30 0%,transparent 50%)`,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"relative",zIndex:1,maxWidth:860,margin:"0 auto",padding:"40px 20px 80px"}}>
        {/* header */}
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${ACCENT}11`,border:`1px solid ${ACCENT}33`,borderRadius:99,padding:"6px 16px",marginBottom:20}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:ACCENT,display:"inline-block",animation:"pulse 2s infinite"}}/>
            <span style={{color:ACCENT,fontFamily:"'Space Mono',monospace",fontSize:11,letterSpacing:2,fontWeight:700}}>INTERVIEW INTELLIGENCE</span>
          </div>
          <h1 style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(28px,5vw,44px)",fontWeight:700,color:TEXT,lineHeight:1.15,marginBottom:12}}>
            Walk In.<br/><span style={{color:ACCENT}}>Walk Out Hired.</span>
          </h1>
          <p style={{color:MUTED,fontSize:15,maxWidth:480,margin:"0 auto",lineHeight:1.7}}>
            AI-powered interview prep for data roles. Company intel, elite questions to ask, and a battle-tested strategy to get the offer.
          </p>
        </div>
        {/* form */}
        <Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
            <div>
              <label style={labelSt}>Company Name *</label>
              <input className="inf" style={inputSt} placeholder="e.g. Stripe, Zomato, JP Morgan…" value={company} onChange={e=>setCompany(e.target.value)} onKeyDown={e=>e.key==="Enter"&&analyse()}/>
            </div>
            <div>
              <label style={labelSt}>Role *</label>
              <input className="inf" style={inputSt} placeholder="e.g. Senior Data Scientist…" value={role} onChange={e=>setRole(e.target.value)} onKeyDown={e=>e.key==="Enter"&&analyse()}/>
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <label style={labelSt}>Technical Requirements <span style={{color:BORDER,fontWeight:400}}>(optional)</span></label>
            <textarea className="inf" style={{...inputSt,height:80,resize:"vertical"}} placeholder="e.g. Python, SQL, Spark, ML pipelines, dbt, Tableau, AWS…" value={requirements} onChange={e=>setRequirements(e.target.value)}/>
          </div>
          {error && (
            <div style={{color:DANGER,fontFamily:"'Space Mono',monospace",fontSize:12,marginBottom:16,padding:"10px 14px",background:`${DANGER}11`,borderRadius:8,border:`1px solid ${DANGER}33`}}>
              ⚠ {error}
            </div>
          )}
          <div style={{display:"flex",justifyContent:"center"}}>
            <button className="abtn" onClick={analyse} disabled={loading}>
              {loading?"Analysing…":"⚡ Analyse & Prepare"}
            </button>
          </div>
        </Card>
        {loading && <Card><Spinner/></Card>}
        {result && (
          <div className="fade-in" ref={resultRef}>
            {/* score strip */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:20}}>
              {[
                {label:"Technical Demand", val:result.scoreTechnical, color:ACCENT},
                {label:"Growth Trajectory", val:result.scoreGrowth, color:SUCCESS},
                {label:"Data Culture", val:result.scoreDataCulture, color:WARN},
              ].map(s=>(
                <div key={s.label} style={{...glass,padding:"18px 20px",textAlign:"center"}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:32,fontWeight:700,color:s.color}}>{s.val}<span style={{fontSize:14,color:MUTED}}>/10</span></div>
                  <div style={{color:MUTED,fontSize:11,letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* tabs */}
            <div style={{display:"flex",gap:6,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
              {tabs.map(t=>(
                <button key={t.id} className={`tab ${activeTab===t.id?"tab-on":"tab-off"}`} onClick={()=>setActiveTab(t.id)}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            {/* OVERVIEW */}
            {activeTab==="overview" && (
              <div className="fade-in">
                <Card>
                  <SectionTitle icon="🏢" title="Company Overview"/>
                  <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
                    {result.industry && <Chip>{result.industry}</Chip>}
                    {result.founded && <Chip color={SUCCESS}>📅 {result.founded}</Chip>}
                    {result.size && <Chip color={WARN}>👥 {result.size}</Chip>}
                  </div>
                  <p style={{color:TEXT,lineHeight:1.8,fontSize:15}}>{result.overview}</p>
                </Card>
                <Card>
                  <SectionTitle icon="📊" title="Why Data Roles Matter Here" color={SUCCESS}/>
                  <p style={{color:TEXT,lineHeight:1.8,fontSize:15}}>{result.dataRelevance}</p>
                </Card>
                {result.salaryContext && (
                  <Card>
                    <SectionTitle icon="💰" title="Compensation Context" color={WARN}/>
                    <p style={{color:TEXT,lineHeight:1.8,fontSize:15}}>{result.salaryContext}</p>
                  </Card>
                )}
              </div>
            )}
            {/* RECENT ACTIVITY */}
            {activeTab==="projects" && (
              <div className="fade-in">
                <Card>
                  <SectionTitle icon="📡" title="Recent News & Initiatives"/>
                  {result.recentProjects.map((item,i)=>(
                    <div key={i} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:i<result.recentProjects.length-1?`1px solid ${BORDER}`:"none"}}>
                      <span style={{color:ACCENT,fontFamily:"'Space Mono',monospace",fontSize:11,minWidth:28,paddingTop:3}}>#{String(i+1).padStart(2,"0")}</span>
                      <span style={{color:TEXT,fontSize:14.5,lineHeight:1.6}}>{item}</span>
                    </div>
                  ))}
                </Card>
              </div>
            )}
            {/* ASK INTERVIEWER */}
            {activeTab==="questions" && (
              <div className="fade-in">
                <InfoBanner color={ACCENT} icon="💡" label="PRO TIP">
                  Hit <strong style={{color:ACCENT}}>▼ WHY</strong> on any question to see exactly why it impresses an interviewer at this company. Pick 2–3 per section that feel most natural.
                </InfoBanner>
                <Card>
                  <SectionTitle icon="⚡" title="Technical Questions to Ask" color={ACCENT}/>
                  <p style={{color:MUTED,fontSize:11,marginBottom:18,fontFamily:"'Space Mono',monospace",letterSpacing:1.5}}>DEMONSTRATE DEEP DOMAIN EXPERTISE · SHOW YOU'VE DONE YOUR HOMEWORK</p>
                  {result.questionsTechnical.map((q,i)=>(
                    <QuestionCard key={i} q={q} index={i} prefix="T" why={result.whyMap[`T${i+1}`]} accentColor={ACCENT}/>
                  ))}
                </Card>
                <Card>
                  <SectionTitle icon="🗺️" title="Strategic Questions to Ask" color={SUCCESS}/>
                  <p style={{color:MUTED,fontSize:11,marginBottom:18,fontFamily:"'Space Mono',monospace",letterSpacing:1.5}}>SHOW BUSINESS-OWNER THINKING · PROVE YOU SEE THE BIG PICTURE</p>
                  {result.questionsStrategic.map((q,i)=>(
                    <QuestionCard key={i} q={q} index={i} prefix="S" why={result.whyMap[`S${i+1}`]} accentColor={SUCCESS}/>
                  ))}
                </Card>
                <Card>
                  <SectionTitle icon="🤝" title="Culture & Growth Questions" color={WARN}/>
                  <p style={{color:MUTED,fontSize:11,marginBottom:18,fontFamily:"'Space Mono',monospace",letterSpacing:1.5}}>SIGNAL EQ + LONG-TERM COMMITMENT · SHOW YOU CARE ABOUT THE TEAM</p>
                  {result.questionsCulture.map((q,i)=>(
                    <QuestionCard key={i} q={q} index={i} prefix="C" why={result.whyMap[`C${i+1}`]} accentColor={WARN}/>
                  ))}
                </Card>
              </div>
            )}
            {/* WIN STRATEGY */}
            {activeTab==="strategy" && (
              <div className="fade-in">
                <Card>
                  <SectionTitle icon="🎯" title="Your Battle-Tested Win Strategy"/>
                  <p style={{color:MUTED,fontSize:11,marginBottom:20,fontFamily:"'Space Mono',monospace",letterSpacing:1.5}}>CONCRETE ACTIONS · SPECIFIC TO THIS COMPANY & ROLE</p>
                  {result.winStrategy.map((item,i)=>(
                    <div key={i} style={{display:"flex",gap:16,padding:"16px 0",borderBottom:i<result.winStrategy.length-1?`1px solid ${BORDER}`:"none",alignItems:"flex-start"}}>
                      <div style={{background:`linear-gradient(135deg,${ACCENT},#0099cc)`,color:"#000",borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,fontFamily:"'Space Mono',monospace",flexShrink:0,marginTop:2}}>{i+1}</div>
                      <div style={{flex:1}}>
                        {item.action && <div style={{color:ACCENT,fontFamily:"'Space Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:1.5,marginBottom:6,textTransform:"uppercase"}}>{item.action}</div>}
                        <div style={{color:TEXT,fontSize:14,lineHeight:1.7}}>{item.detail||item}</div>
                      </div>
                    </div>
                  ))}
                </Card>
                <Card>
                  <SectionTitle icon="💬" title="Key Talking Points to Weave In" color={WARN}/>
                  <p style={{color:MUTED,fontSize:11,marginBottom:18,fontFamily:"'Space Mono',monospace",letterSpacing:1.5}}>NATURAL ANGLES TIED TO THIS COMPANY'S PRIORITIES</p>
                  {result.talkingPoints.map((item,i)=>(
                    <div key={i} style={{padding:"14px 0",borderBottom:i<result.talkingPoints.length-1?`1px solid ${BORDER}`:"none"}}>
                      {item.angle
                        ? <>
                            <div style={{color:WARN,fontFamily:"'Space Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:1.5,marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
                              <span>◆</span>{item.angle.toUpperCase()}
                            </div>
                            <div style={{color:TEXT,fontSize:14,lineHeight:1.65,paddingLeft:20}}>{item.usage}</div>
                          </>
                        : <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                            <span style={{color:WARN}}>◆</span>
                            <span style={{color:TEXT,fontSize:14,lineHeight:1.65}}>{item.usage||item}</span>
                          </div>
                      }
                    </div>
                  ))}
                </Card>
              </div>
            )}
            {/* TECH STACK */}
            {activeTab==="techstack" && (
              <div className="fade-in">
                <InfoBanner color={ACCENT} icon="⚙️" label="HOW TO USE THIS">
                  <span style={{color:SUCCESS,fontWeight:700}}>Essential</span> = know confidently. &nbsp;
                  <span style={{color:WARN,fontWeight:700}}>Important</span> = brush up before interview. &nbsp;
                  <span style={{color:MUTED,fontWeight:700}}>Good-to-have</span> = mention if you know it.
                </InfoBanner>
                <Card>
                  <SectionTitle icon="⚙️" title="Likely Tech Stack & Prep Tips"/>
                  {result.techStack.length > 0 ? (
                    <div style={{display:"flex",flexDirection:"column",gap:12}}>
                      {result.techStack.map((t,i)=>{
                        const pc = t.proficiency==="Essential" ? SUCCESS : t.proficiency==="Important" ? WARN : MUTED;
                        return (
                          <div key={i} style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:12,padding:"16px 18px",borderLeft:`3px solid ${pc}`}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:8}}>
                              <span style={{color:TEXT,fontWeight:700,fontSize:15,fontFamily:"'Space Mono',monospace"}}>{t.name||String(t)}</span>
                              <div style={{display:"flex",gap:8}}>
                                {t.category && <Chip>{t.category}</Chip>}
                                {t.proficiency && <Chip color={pc}>{t.proficiency}</Chip>}
                              </div>
                            </div>
                            {t.reason && <p style={{color:TEXT,fontSize:13,lineHeight:1.55,marginBottom:8,opacity:.85}}>{t.reason}</p>}
                            {t.prep_tip && (
                              <div style={{display:"flex",gap:8,alignItems:"flex-start",padding:"8px 12px",background:`${WARN}0A`,borderRadius:8,borderLeft:`2px solid ${WARN}44`}}>
                                <span style={{color:WARN,fontSize:12,flexShrink:0}}>📌</span>
                                <span style={{color:WARN,fontSize:12,lineHeight:1.5}}><strong>Prep tip:</strong> {t.prep_tip}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{color:MUTED,fontSize:14}}>Tech stack data not available — research their engineering blog and job postings for clues.</p>
                  )}
                </Card>
              </div>
            )}
            {/* RED FLAGS */}
            {activeTab==="redflags" && (
              <div className="fade-in">
                <InfoBanner color={DANGER} icon="🚨" label="HOW TO USE THIS">
                  Each flag includes <strong style={{color:WARN}}>how to probe it</strong> in the interview and a <strong style={{color:SUCCESS}}>counter-strategy</strong>. Click any flag to expand. Knowledge is leverage.
                </InfoBanner>
                <Card>
                  <SectionTitle icon="🚨" title="Red Flags & Counter-Strategies" color={DANGER}/>
                  {result.redFlags.map((item,i)=>(
                    <RedFlagItem key={i} item={item} isLast={i===result.redFlags.length-1}/>
                  ))}
                </Card>
              </div>
            )}
          </div>
        )}
        <div style={{textAlign:"center",marginTop:48,color:MUTED,fontSize:12,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>
          POWERED BY AI INTELLIGENCE · FOR EDUCATIONAL USE
        </div>
      </div>
    </>
  );
}
