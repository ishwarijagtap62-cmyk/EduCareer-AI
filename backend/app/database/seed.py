"""
Database seeder — creates demo data for development/presentation.
Run: python -m app.database.seed
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from datetime import datetime, timezone, date, timedelta
from app.database.base import SessionLocal, engine, Base
from app.models.user import User, StudentProfile, UserRole, ExperienceLevel
from app.models.skills import StudentSkill, CareerGoal, Project
from app.models.jobs import Job
from app.models.memory import UserMemory
from app.core.security import hash_password


def seed():
    print("Starting database seed...")

    # Create all tables
    import app.models  # noqa
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # ---- Demo Student Account ----
        if not db.query(User).filter(User.email == "demo@educareer.ai").first():
            demo_user = User(
                name="Demo Student",
                email="demo@educareer.ai",
                hashed_password=hash_password("Demo1234"),
                role=UserRole.STUDENT,
                is_active=True,
                onboarding_completed=True,
            )
            db.add(demo_user)
            db.flush()

            profile = StudentProfile(
                user_id=demo_user.id,
                college="Example Institute of Technology",
                degree="B.Tech",
                branch="Computer Engineering",
                year=3,
                cgpa=8.2,
                target_career="AI/ML Engineer",
                target_job_role="AI/ML Engineer",
                experience_level=ExperienceLevel.INTERMEDIATE,
                interests=["AI/ML", "Web Development", "Data Science"],
                resume_score=82.0,
                technical_score=76.0,
                dsa_score=68.0,
                projects_score=90.0,
                interview_score=74.0,
                communication_score=80.0,
                placement_readiness_score=78.0,
                score_sources={
                    "resume_score": "ai-estimated",
                    "technical_score": "ai-estimated",
                    "dsa_score": "ai-estimated",
                    "projects_score": "ai-estimated",
                    "interview_score": "ai-estimated",
                    "communication_score": "ai-estimated",
                    "placement_readiness_score": "ai-estimated",
                },
            )
            db.add(profile)
            db.flush()

            # Skills
            demo_skills = [
                ("Python", "Programming", "intermediate", 78),
                ("SQL", "Database", "intermediate", 72),
                ("JavaScript", "Programming", "beginner", 55),
                ("Machine Learning", "AI/ML", "intermediate", 65),
                ("Git", "DevOps", "intermediate", 70),
                ("React", "Framework", "beginner", 45),
                ("DSA", "Computer Science", "intermediate", 60),
                ("Docker", "DevOps", "beginner", 30),
                ("AWS", "Cloud", "beginner", 20),
            ]
            for name, cat, level, prof in demo_skills:
                status = "strong" if prof >= 70 else "moderate" if prof >= 50 else "weak"
                db.add(StudentSkill(
                    profile_id=profile.id,
                    name=name, category=cat, level=level,
                    proficiency=prof, status=status,
                ))

            # Career goal
            db.add(CareerGoal(
                profile_id=profile.id,
                role="AI/ML Engineer",
                is_primary=True,
                timeline_months=12,
            ))

            # Projects
            demo_projects = [
                ("Sentiment Analysis API", "Flask REST API for sentiment analysis using BERT", "Python, Flask, Transformers, PostgreSQL"),
                ("Student Result Management System", "Full-stack web app for managing student results", "React, Node.js, MySQL"),
                ("DSA Visualizer", "Interactive tool to visualize sorting algorithms", "JavaScript, HTML, CSS"),
            ]
            for title, desc, tech in demo_projects:
                db.add(Project(
                    profile_id=profile.id,
                    title=title,
                    description=desc,
                    technologies=tech,
                    resume_value="high",
                ))

            # Memory
            db.add(UserMemory(
                user_id=demo_user.id,
                target_career="AI/ML Engineer",
                target_role="AI/ML Engineer",
                current_subjects=["DBMS", "Machine Learning"],
                weak_subjects=["Computer Networks", "DSA"],
                strong_subjects=["Python", "DBMS"],
                coding_weak_topics=["Dynamic Programming", "Graphs"],
                preferred_explanation_style="detailed",
            ))

            print("✓ Demo student account created: demo@educareer.ai / Demo1234")

        # ---- Admin Account ----
        if not db.query(User).filter(User.email == "admin@educareer.ai").first():
            admin = User(
                name="Admin",
                email="admin@educareer.ai",
                hashed_password=hash_password("Admin1234"),
                role=UserRole.ADMIN,
                is_active=True,
                onboarding_completed=True,
            )
            db.add(admin)
            print("✓ Admin account created: admin@educareer.ai / Admin1234")

        # ---- Demo Jobs ----
        if db.query(Job).count() == 0:
            demo_jobs = [
                {
                    "title": "Software Engineer Intern",
                    "company": "Tech Startup (Demo)",
                    "location": "Bangalore, India",
                    "job_type": "internship",
                    "description": "Join our team to build scalable web applications using modern technologies.",
                    "required_skills": ["Python", "JavaScript", "SQL", "Git", "React"],
                    "nice_to_have_skills": ["Docker", "AWS", "TypeScript"],
                    "experience_required": "0-1 years",
                    "salary_range": "₹20,000 - ₹35,000/month",
                },
                {
                    "title": "AI/ML Engineer Intern",
                    "company": "AI Research Lab (Demo)",
                    "location": "Remote",
                    "job_type": "internship",
                    "description": "Work on cutting-edge ML models and NLP projects.",
                    "required_skills": ["Python", "Machine Learning", "SQL", "TensorFlow", "Docker"],
                    "nice_to_have_skills": ["AWS", "Kubernetes", "MLOps"],
                    "experience_required": "0-1 years",
                    "salary_range": "₹25,000 - ₹40,000/month",
                },
                {
                    "title": "Full Stack Developer",
                    "company": "Product Company (Demo)",
                    "location": "Mumbai, India",
                    "job_type": "full-time",
                    "description": "Build and maintain our customer-facing web application.",
                    "required_skills": ["React", "Node.js", "JavaScript", "SQL", "Git"],
                    "nice_to_have_skills": ["TypeScript", "AWS", "Docker"],
                    "experience_required": "0-2 years",
                    "salary_range": "₹4L - ₹8L per annum",
                },
                {
                    "title": "Data Analyst",
                    "company": "Analytics Firm (Demo)",
                    "location": "Pune, India",
                    "job_type": "full-time",
                    "description": "Analyze business data and create dashboards and reports.",
                    "required_skills": ["SQL", "Python", "Excel", "Data Visualization"],
                    "nice_to_have_skills": ["Power BI", "Tableau", "Machine Learning"],
                    "experience_required": "0-1 years",
                    "salary_range": "₹3.5L - ₹6L per annum",
                },
                {
                    "title": "DevOps Engineer Trainee",
                    "company": "Cloud Solutions Co. (Demo)",
                    "location": "Hyderabad, India",
                    "job_type": "full-time",
                    "description": "Maintain CI/CD pipelines and cloud infrastructure.",
                    "required_skills": ["Linux", "Docker", "Git", "Python", "AWS"],
                    "nice_to_have_skills": ["Kubernetes", "Terraform", "Jenkins"],
                    "experience_required": "0-2 years",
                    "salary_range": "₹4L - ₹7L per annum",
                },
            ]

            for job_data in demo_jobs:
                db.add(Job(
                    title=job_data["title"],
                    company=job_data["company"],
                    location=job_data["location"],
                    job_type=job_data["job_type"],
                    description=job_data["description"],
                    required_skills=job_data["required_skills"],
                    nice_to_have_skills=job_data["nice_to_have_skills"],
                    experience_required=job_data["experience_required"],
                    salary_range=job_data["salary_range"],
                    is_demo=True,
                    is_active=True,
                    posted_at=datetime.now(timezone.utc),
                ))
            print(f"✓ {len(demo_jobs)} demo jobs created")

        db.commit()
        print("\nSeed completed successfully!")
        print("\nDemo Accounts:")
        print("  Student: demo@educareer.ai / Demo1234")
        print("  Admin:   admin@educareer.ai / Admin1234")

    except Exception as e:
        print(f"Seed error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
