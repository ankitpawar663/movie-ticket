import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
/* ---- local "database": localStorage with in-memory fallback ---- */
const mem={};
const db={
  get(k,d){try{const v=localStorage.getItem(k);if(v!==null)return JSON.parse(v)}catch(e){}return k in mem?mem[k]:d},
  set(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
const uid=()=>Math.random().toString(36).slice(2,9).toUpperCase();
const mkShows=(t,th)=>t.split(',').map(x=>x.trim()).filter(Boolean).map(x=>({id:uid(),theater:th,time:x}));
const seedMovies=[
 ['Midnight Monsoon','Thriller','Hindi',138,'U/A',250,265,'A detective in a flooded city has one night to find a missing witness.'],
 ['The Last Lighthouse','Drama','English',121,'U',220,200,'A keeper and a stranded sailor argue, bond and keep one more flame alive.'],
 ['Chai & Chaos','Comedy','Hindi',116,'U',180,25,'Three roommates open a tea stall and accidentally run a neighbourhood.'],
 ['Orbit Zero','Sci-Fi','English',149,'U/A',320,175,'A repair crew on a dying station discovers the signal is answering back.'],
 ['Kaveri','Drama','Tamil',132,'U',200,340,'A river, a family farm and the dam that could wash both away.'],
 ['Paper Tigers','Action','English',127,'A',280,10,'Retired stunt doubles take one last job that goes spectacularly wrong.'],
 ['Rangoli Nights','Romance','Hindi',124,'U',210,320,'Two festival decorators fall for each other across rival lanes.'],
 ['Hollow Manor','Horror','English',104,'A',230,285,'A family inherits a house that remembers everyone who ever lived in it.']
].map((a,i)=>({id:'m'+i,title:a[0],genre:a[1],lang:a[2],dur:a[3],cert:a[4],price:a[5],hue:a[6],desc:a[7],
 shows:[...mkShows('10:30,14:00,18:15,21:45','Galaxy Cinemas, MP Nagar'),...mkShows('11:15,15:30,19:45','Aurora Multiplex, DB Mall')]}));
const demoAdmin={id:'u0',name:'Admin',email:'admin@reelbook.com',pass:'admin123',role:'admin'};
const demoUser={id:'u1',name:'Demo User',email:'user@reelbook.com',pass:'user123',role:'user'};
const seedUsers=[demoAdmin,demoUser];
const iso=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*6e4);return z.toISOString().slice(0,10)};
const days=Array.from({length:6},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return d});
const fmtD=d=>new Date(d+'T00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
const ROWS='ABCDEFGH'.split(''),COLS=10;

function Poster({m,big}){return <div className={'poster'+(big?' big':'')} style={{background:`linear-gradient(160deg,hsl(${m.hue} 70% 48%),hsl(${(m.hue+50)%360} 60% 22%))`}}>
 <span className="rate">{m.cert}</span><small>{m.genre}</small><h3>{m.title}</h3></div>}

function App(){
 const [movies,setMovies]=useState(()=>db.get('rb_movies',seedMovies));
 const [users,setUsers]=useState(()=>{const saved=db.get('rb_users',seedUsers);return [...seedUsers,...saved.filter(u=>!seedUsers.some(seed=>seed.email===u.email))]});
 const [bookings,setBookings]=useState(()=>db.get('rb_bookings',[]));
 const [me,setMe]=useState(()=>db.get('rb_session',null));
 const [view,setView]=useState({n:'home'});
 const [toast,setToast]=useState('');
 useEffect(()=>db.set('rb_movies',movies),[movies]);
 useEffect(()=>db.set('rb_users',users),[users]);
 useEffect(()=>db.set('rb_bookings',bookings),[bookings]);
 useEffect(()=>db.set('rb_session',me),[me]);
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),2400);return()=>clearTimeout(t)}},[toast]);
 const go=(n,x={})=>{setView({n,...x});window.scrollTo(0,0)};
 const ctx={movies,setMovies,users,setUsers,bookings,setBookings,me,setMe,go,say:setToast};
 const v=view.n;
 return <>
  <header><div className="wrap nav">
   <button className="logo" onClick={()=>go('home')}>reel<b>book</b></button>
   {me&&me.role==='admin'&&<button className="btn" onClick={()=>go('admin')}>Admin panel</button>}
   {me&&me.role!=='admin'&&<button className="btn" onClick={()=>go('mine')}>My tickets</button>}
   {me?<><span className="mut">Hi, {me.name.split(' ')[0]}</span><button className="btn" onClick={()=>{setMe(null);go('home');setToast('Signed out')}}>Sign out</button></>
      :<button className="btn p" onClick={()=>go('auth')}>Sign in</button>}
  </div></header>
  <main className="wrap">
   {v==='home'&&<Home {...ctx}/>}
   {v==='movie'&&<Movie {...ctx} id={view.id}/>}
   {v==='seats'&&<Seats {...ctx} id={view.id} sid={view.sid} date={view.date}/>}
   {(v==='mine'||v==='ticket')&&<Mine {...ctx} just={view.bid}/>}
   {v==='auth'&&<Auth {...ctx} next={view.next}/>}
   {v==='admin'&&(me&&me.role==='admin'?<Admin {...ctx}/>:<p className="panel" style={{marginTop:24}}>Admin access only. Sign in with an admin account.</p>)}
  </main>
  {toast&&<div className="toast" role="status">{toast}</div>}
 </>}

function Home({movies,go}){
 const [q,setQ]=useState(''),[g,setG]=useState('All');
 const genres=['All',...new Set(movies.map(m=>m.genre))];
 const list=movies.filter(m=>(g==='All'||m.genre===g)&&(m.title+m.lang).toLowerCase().includes(q.toLowerCase()));
 return <>
  <section className="hero"><h1>Pick a film. Pick your seat.</h1><p>Now showing in Bhopal. Choose a date, a show and the exact seats you want.</p></section>
  <div className="bar"><input aria-label="Search movies" placeholder="Search by title or language" value={q} onChange={e=>setQ(e.target.value)}/>
   {genres.map(x=><button key={x} className={'chip'+(g===x?' on':'')} onClick={()=>setG(x)}>{x}</button>)}</div>
  {list.length?<div className="grid">{list.map(m=><button key={m.id} className="card" onClick={()=>go('movie',{id:m.id})}>
    <Poster m={m}/><div className="t">{m.title}</div><div className="m">{m.lang} · {m.dur} min</div></button>)}</div>
   :<p className="panel">No movies match that search. Clear the filters to see everything now showing.</p>}
 </>}

function Movie({movies,id,go}){
 const m=movies.find(x=>x.id===id);const [d,setD]=useState(iso(days[0]));
 if(!m)return <p>Movie not found.</p>;
 const th=[...new Set(m.shows.map(s=>s.theater))];
 return <div className="det"><Poster m={m} big/><div>
  <h2 style={{fontSize:38}}>{m.title}</h2>
  <p className="mut">{m.genre} · {m.lang} · {Math.floor(m.dur/60)}h {m.dur%60}m · {m.cert}</p>
  <p style={{maxWidth:'60ch'}}>{m.desc}</p>
  <h3 style={{marginTop:24}}>Choose a date</h3>
  <div className="dates">{days.map(x=>{const k=iso(x);return <button key={k} className={'chip'+(d===k?' on':'')} onClick={()=>setD(k)}>
    {x.toLocaleDateString('en-IN',{weekday:'short'})}<br/><b>{x.getDate()}</b> {x.toLocaleDateString('en-IN',{month:'short'})}</button>})}</div>
  {th.length?th.map(t=><div className="show" key={t}><b>{t}</b>{m.shows.filter(s=>s.theater===t).map(s=>
    <button key={s.id} className="time" onClick={()=>go('seats',{id:m.id,sid:s.id,date:d})}>{s.time}</button>)}<span className="mut">₹{m.price} per seat</span></div>)
   :<p className="panel">No shows are scheduled for this movie yet.</p>}
 </div></div>}

function Seats({movies,bookings,setBookings,me,go,say,id,sid,date}){
 const m=movies.find(x=>x.id===id),s=m&&m.shows.find(x=>x.id===sid);
 const [sel,setSel]=useState([]);
 if(!m||!s)return <p>This show is no longer available.</p>;
 const taken=bookings.filter(b=>b.movieId===id&&b.showId===sid&&b.date===date&&b.status==='confirmed').flatMap(b=>b.seats);
 const toggle=k=>setSel(a=>a.includes(k)?a.filter(x=>x!==k):a.length>=8?(say('You can book up to 8 seats'),a):[...a,k]);
 const book=()=>{
  if(!me){say('Sign in to book your seats');return go('auth',{next:{n:'seats',id,sid,date}})}
  if(me.role==='admin'){say('Use a customer account to book tickets');return}
  const b={id:'BK'+uid(),userId:me.id,userName:me.name,movieId:id,movieTitle:m.title,showId:sid,theater:s.theater,time:s.time,date,seats:[...sel].sort(),total:sel.length*m.price,status:'confirmed',at:Date.now()};
  setBookings(x=>[b,...x]);say('Booking confirmed');go('ticket',{bid:b.id});
 };
 return <div style={{padding:'24px 0'}}>
  <button className="btn" onClick={()=>go('movie',{id})}>Back</button>
  <h2 style={{margin:'16px 0 4px'}}>{m.title}</h2><p className="mut">{s.theater} · {fmtD(date)} · {s.time}</p>
  <div className="screen" aria-label="Screen is this way"/>
  <div className="seats">{ROWS.map(r=><div className="row" key={r}><span>{r}</span>{Array.from({length:COLS},(_,i)=>{const k=r+(i+1),sold=taken.includes(k);
    return <button key={k} disabled={sold} aria-label={`Seat ${k}${sold?', sold':''}`} aria-pressed={sel.includes(k)} className={'seat'+(sold?' sold':'')+(sel.includes(k)?' sel':'')} onClick={()=>toggle(k)} style={i===4?{marginRight:16}:null}>{i+1}</button>})}</div>)}</div>
  <div className="legend"><span>◻ Available</span><span style={{color:'var(--gold)'}}>◼ Selected</span><span>◼ Sold</span></div>
  <div className="sum"><div><b>{sel.length?[...sel].sort().join(', '):'No seats selected'}</b><div className="mut">₹{m.price} per seat</div></div>
   <button className="btn p" disabled={!sel.length} onClick={book}>Pay ₹{sel.length*m.price}</button></div>
 </div>}

function Mine({bookings,setBookings,me,go,say,just}){
 if(!me)return <div className="form panel"><p>Sign in to see your tickets.</p><button className="btn p" onClick={()=>go('auth')}>Sign in</button></div>;
 const mine=bookings.filter(b=>b.userId===me.id);
 const cancel=id=>{setBookings(a=>a.map(b=>b.id===id?{...b,status:'cancelled'}:b));say('Booking cancelled')};
 return <div style={{padding:'24px 0'}}>
  <button className="btn" onClick={()=>go(just?'mine':'home')}>Back</button>
  <h2>{just?'Your tickets are ready':'My tickets'}</h2>
  {!mine.length&&<p className="panel" style={{marginTop:16}}>No bookings yet. Pick a movie from Home to book your first show.</p>}
  {mine.map(b=><div className="ticket" key={b.id} style={b.id===just?{borderColor:'var(--ac)'}:null}>
   <div className="l"><h3>{b.movieTitle}</h3><div className="mut">{b.theater}</div><div>{fmtD(b.date)} · {b.time}</div>
    <div>Seats: <b>{b.seats.join(', ')}</b></div><div style={{marginTop:8}}><span className={'tag '+(b.status==='confirmed'?'ok':'x')}>{b.status}</span></div></div>
   <div className="r"><b>₹{b.total}</b><small className="mut">{b.id}</small>
    {b.status==='confirmed'&&<button className="btn s d" onClick={()=>cancel(b.id)}>Cancel</button>}</div></div>)}
 </div>}

function Auth({users,setUsers,setMe,go,say,next}){
 const [reg,setReg]=useState(false),[f,setF]=useState({name:'',email:'',pass:''}),[err,setErr]=useState('');
 const set=k=>e=>setF({...f,[k]:e.target.value});
 const done=u=>{setMe(u);say('Welcome, '+u.name.split(' ')[0]);u.role==='admin'?go('admin'):next?go(next.n,next):go('home')};
 const submit=e=>{
  e.preventDefault();const em=f.email.trim().toLowerCase();
  if(reg){
   if(!f.name.trim()||!em||f.pass.length<4)return setErr('Enter your name, email and a password of 4 or more characters.');
   if(users.some(u=>u.email===em))return setErr('That email is already registered. Sign in instead.');
   const u={id:'u'+uid(),name:f.name.trim(),email:em,pass:f.pass,role:'user'};setUsers([...users,u]);done(u);
  }else{const u=users.find(u=>u.email===em&&u.pass===f.pass);u?done(u):setErr('Email or password is incorrect.')}
 };
 return <form className="form panel" onSubmit={submit}>
  <h2>{reg?'Create account':'Sign in'}</h2>
  {reg&&<label>Full name<input value={f.name} onChange={set('name')}/></label>}
  <label>Email<input type="email" value={f.email} onChange={set('email')}/></label>
  <label>Password<input type="password" value={f.pass} onChange={set('pass')}/></label>
  {err&&<div className="err" role="alert">{err}</div>}
  <button className="btn p" type="submit">{reg?'Create account':'Sign in'}</button>
  <button type="button" className="btn" onClick={()=>{setReg(!reg);setErr('')}}>{reg?'I already have an account':'New here? Create an account'}</button>
  {!reg&&<>
   <small className="mut">Demo user: user@reelbook.com / user123</small>
   <button type="button" className="btn" onClick={()=>done(demoUser)}>Continue as demo user</button>
   <small className="mut">Admin: admin@reelbook.com / admin123</small>
   <button type="button" className="btn" onClick={()=>done(demoAdmin)}>Continue as admin</button>
  </>}
 </form>}

function Admin({movies,setMovies,users,bookings,setBookings,say}){
 const [tab,setTab]=useState('Dashboard');
 const live=bookings.filter(b=>b.status==='confirmed');
 const rev=live.reduce((a,b)=>a+b.total,0);
 return <div style={{padding:'10px 0 40px'}}>
  <h2 style={{marginTop:20}}>Admin panel</h2>
  <div className="tabs">{['Dashboard','Movies','Bookings','Users'].map(t=><button key={t} className={'chip'+(tab===t?' on':'')} onClick={()=>setTab(t)}>{t}</button>)}</div>
  {tab==='Dashboard'&&<><div className="stats">
    {[['Revenue','₹'+rev],['Tickets sold',live.reduce((a,b)=>a+b.seats.length,0)],['Bookings',bookings.length],['Movies',movies.length],['Users',users.filter(u=>u.role==='user').length]]
     .map(([a,b])=><div className="panel stat" key={a}><span className="mut">{a}</span><b>{b}</b></div>)}</div>
   <div className="panel"><h3>Top movies by revenue</h3><div className="tw"><table><tbody>{movies.map(m=>({m,r:live.filter(b=>b.movieId===m.id).reduce((a,b)=>a+b.total,0)})).sort((a,b)=>b.r-a.r).slice(0,5)
     .map(({m,r})=><tr key={m.id}><td>{m.title}</td><td>₹{r}</td></tr>)}</tbody></table></div></div></>}
  {tab==='Movies'&&<MovieAdmin movies={movies} setMovies={setMovies} say={say}/>}
  {tab==='Bookings'&&<div className="panel tw"><table><thead><tr><th>ID</th><th>User</th><th>Movie</th><th>Show</th><th>Seats</th><th>Total</th><th>Status</th><th/></tr></thead><tbody>
   {bookings.map(b=><tr key={b.id}><td>{b.id}</td><td>{b.userName}</td><td>{b.movieTitle}</td><td>{fmtD(b.date)}, {b.time}</td><td>{b.seats.join(', ')}</td><td>₹{b.total}</td>
    <td><span className={'tag '+(b.status==='confirmed'?'ok':'x')}>{b.status}</span></td>
    <td>{b.status==='confirmed'&&<button className="btn s d" onClick={()=>{setBookings(a=>a.map(x=>x.id===b.id?{...x,status:'cancelled'}:x));say('Booking cancelled')}}>Cancel</button>}</td></tr>)}
   {!bookings.length&&<tr><td colSpan="8" className="mut">No bookings yet.</td></tr>}</tbody></table></div>}
  {tab==='Users'&&<div className="panel tw"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Bookings</th></tr></thead><tbody>
   {users.map(u=><tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{bookings.filter(b=>b.userId===u.id).length}</td></tr>)}</tbody></table></div>}
 </div>}

function MovieAdmin({movies,setMovies,say}){
 const blank={title:'',genre:'Drama',lang:'English',dur:120,cert:'U/A',price:200,hue:200,desc:'',theater:'Galaxy Cinemas, MP Nagar',times:'10:30, 14:00, 18:15'};
 const [f,setF]=useState(blank);const [err,setErr]=useState('');
 const set=k=>e=>setF({...f,[k]:e.target.value});
 const add=e=>{e.preventDefault();
  if(!f.title.trim()||!f.times.trim())return setErr('Add a title and at least one show time, for example 18:30.');
  const {theater,times,...rest}=f;
  setMovies([{...rest,title:f.title.trim(),id:'m'+uid(),dur:+f.dur,price:+f.price,hue:+f.hue,shows:mkShows(times,theater)},...movies]);
  setF(blank);setErr('');say('Movie added')};
 return <>
  <form className="panel" onSubmit={add} style={{marginBottom:20}}><h3 style={{marginBottom:12}}>Add a movie</h3>
   <div className="f2">
    <label>Title<input value={f.title} onChange={set('title')}/></label>
    <label>Genre<select value={f.genre} onChange={set('genre')}>{['Action','Comedy','Drama','Horror','Romance','Sci-Fi','Thriller'].map(g=><option key={g}>{g}</option>)}</select></label>
    <label>Language<input value={f.lang} onChange={set('lang')}/></label>
    <label>Duration (min)<input type="number" min="30" value={f.dur} onChange={set('dur')}/></label>
    <label>Certificate<select value={f.cert} onChange={set('cert')}>{['U','U/A','A'].map(g=><option key={g}>{g}</option>)}</select></label>
    <label>Price per seat (₹)<input type="number" min="50" value={f.price} onChange={set('price')}/></label>
    <label>Poster colour<input type="range" min="0" max="360" value={f.hue} onChange={set('hue')}/></label>
    <label>Theatre<input value={f.theater} onChange={set('theater')}/></label>
    <label>Show times (comma separated)<input value={f.times} onChange={set('times')}/></label></div>
   <label style={{marginTop:12}}>Description<textarea rows="2" value={f.desc} onChange={set('desc')}/></label>
   {err&&<div className="err" role="alert">{err}</div>}
   <button className="btn p" style={{marginTop:12}} type="submit">Add movie</button></form>
  <div className="panel tw"><table><thead><tr><th>Title</th><th>Genre</th><th>Language</th><th>Price</th><th>Shows</th><th/></tr></thead><tbody>
   {movies.map(m=><tr key={m.id}><td>{m.title}</td><td>{m.genre}</td><td>{m.lang}</td><td>₹{m.price}</td><td>{m.shows.length}</td>
    <td><button className="btn s d" onClick={()=>{setMovies(movies.filter(x=>x.id!==m.id));say('Movie deleted')}}>Delete</button></td></tr>)}</tbody></table></div></>}

createRoot(document.getElementById('root')).render(<App/>);
