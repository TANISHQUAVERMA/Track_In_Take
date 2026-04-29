# 🚀 TrackEats

**Django Backend + React Frontend**

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.2-green?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![GitHub Repo](https://img.shields.io/badge/GitHub-TrackEats-black?logo=github)](https://github.com/healthalmanet/TrackEats)

---

## 🛠 Step 1 — Clone Repository
Clone the entire repository:

```bash
git clone https://github.com/healthalmanet/TrackEats.git
cd TrackEats

    ✅ Full repository with all branches and history will be cloned.

🐍 Step 2 — Backend: Create & Activate Virtual Environment

Navigate to the backend folder:

bash
Copy code
cd backend

Linux / macOS / WSL:

bash
Copy code
python3 -m venv venv
source venv/bin/activate

Windows PowerShell:

powershell
Copy code
python -m venv venv
venv\Scripts\Activate.ps1

Windows CMD:

cmd
Copy code
venv\Scripts\activate.bat

📦 Step 3 — Backend: Install Dependencies

Upgrade pip and install requirements:

bash
Copy code
pip install --upgrade pip
pip install -r requirements.txt

🔑 Step 4 — Backend: Environment Variables

Create a .env file inside backend/ and add the following:
Variable	Description
DATABASE_URL	PostgreSQL database URL
GEMINI_API_KEY	Gemini AI API key
ACCOUNT_SID	Twilio Account SID
AUTH_TOKEN	Twilio Auth Token
MOBILE_NUMBER	Twilio verified number
EMAIL_HOST_USER	Email sender
EMAIL_HOST_PASSWORD	Email password
GOOGLE_CLIENT_ID	Google OAuth client ID
GOOGLE_SECRET	Google OAuth secret
FACEBOOK_CLIENT_ID	Facebook OAuth client ID
FACEBOOK_SECRET	Facebook OAuth secret
REDIS_URL	Redis connection URL
CLOUDINARY_CLOUD_NAME	Cloudinary cloud name
CLOUDINARY_API_KEY	Cloudinary API key
CLOUDINARY_API_SECRET	Cloudinary API secret

    💡 Tip: Keep your .env file private. Do not commit it to GitHub.

🗄 Step 5 — Backend: Database Migrations & Superuser

bash
Copy code
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

▶️ Step 6 — Backend: Run Server

bash
Copy code
python manage.py runserver

Backend URL: http://127.0.0.1:8000
⚛️ Step 7 — Frontend: Install Dependencies

Navigate to the frontend folder:

bash
Copy code
cd ../frontend

Install dependencies:

bash
Copy code
npm install   # or yarn

🖥 Step 8 — Frontend: Run Development Server

bash
Copy code
npm run dev   # or yarn dev

Frontend URL:

    Vite: http://localhost:5173

    CRA: http://localhost:3000

✅ Step 9 — Verify Setup

    Backend: http://127.0.0.1:8000

    Frontend: URL shown in terminal

⚠️ Troubleshooting

    If python3 is not found, use python or py -3.

    If pip install fails:

bash
Copy code
pip install --upgrade pip setuptools wheel

