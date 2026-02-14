# 🚀 BridgeUP AI  
Dual-Portal AI-Powered Career Platform for Students & Recruiters  

BridgeUP AI is a full-stack career ecosystem where students build verified skill-based profiles and recruiters discover top candidates using AI and credit-based ranking.

---

## 🌐 Live Experience  
Glassmorphic Dual-Login → Student Portal → Recruiter Portal  

Built for universities, bootcamps, and modern hiring teams.

---

## 🧠 Core Philosophy  
“Stop hiring based on resumes. Start hiring based on proof.”

---

## 🏗 System Architecture  

### Frontend  
- Next.js 14 (App Router)  
- TailwindCSS + Glassmorphism UI  
- Drag & Drop (Kanban, Gallery)  
- Bento Grid Layouts  

### Backend  
- Supabase (Postgres, Auth, Storage)  
- Edge Functions (AI Scheduler)  
- Role-based Access Control  

### AI Layer  
- 7-Day Interview Prep Generator  
- Resume → Skill → Schedule Engine  
- Fallback logic for API safety  

---

## 🔐 Authentication  
Dual-portal glassmorphic login with:  
- Student / Recruiter toggle  
- Email or Phone login  
- Google OAuth  
- GitHub OAuth  

Role-based access is controlled using `users.role`.

---

## 🎓 Student Portal  

### Features  
- Internship Tracker (Kanban board)  
- Skill Library (15 university-aligned courses)  
- Unified Calendar  
- Proof Gallery  
- Certificate Vault  
- Mentor Connect  
- Profile Editor with real-time recruiter preview  

### Internship Tracker  
Kanban columns:  
Applied → Interview → Offer → Rejected  

### Skill Library  
Tracks enrolled courses using `student_courses`.

### Proof Gallery  
Students upload project images and contribution summaries.

### Certificate Vault  
Upload certificates with full-screen preview.

### Mentor Connect  
Students must enter a minimum 200-character agenda when booking.

### Profile Editor  
Includes avatar upload (5MB limit), bio (500 chars), and social links (GitHub, LinkedIn, LeetCode, GFG) with live recruiter preview.

---

## 🧑‍💼 Recruiter Portal  

Recruiters use credits to unlock and rank candidates.

### Candidate Discovery  
Filter by skills, projects, and certificates.

### Bento Grid Profiles  
Each profile includes:
- Skills  
- GitHub, LinkedIn, LeetCode  
- Certificates  
- Projects  
- Tags: Paid, Unpaid, Collaborative  

Locked profiles require credits.

---

## 🧠 AI Interview Prep  
An edge function generates a 7-day interview preparation plan based on the student’s skills and target role with fallback logic.

---

## 🗃 Database Schema  

Tables:
- users  
- courses  
- student_courses  
- applications  
- projects  
- project_images  
- certificates  
- calendar_events  
- mentors  
- mentor_bookings  

---

## 🧪 Seed Data  
Preloaded:
- 15 courses  
- 6 mentors  
- 8 students with projects and certificates  

---

## 🧰 Setup  

```bash
git clone https://github.com/Shivam-droid-afk/BridgeUP-AI.git
cd BridgeUP-AI
npm install
