📋 Job Application Tracker
A full-stack web application to help you manage your job search — track applications, schedule interviews, and monitor your progress with a dashboard.

🚀 Features

✅ Track Job Applications — Add, update, and manage all your job applications in one place
🗓️ Track Interviews — Schedule and manage interviews with details like date, type, and interviewer info
📊 Dashboard & Analytics — Get a visual overview of your application statuses and progress
🔍 Application Status Tracking — Monitor where each application stands (Applied, Interview, Offer, Rejected, etc.)


🛠️ Tech Stack
LayerTechnologyFrontendReactBackendFastAPI (Python)DatabaseSQLiteORMSQLAlchemyValidationPydantic

📸 Screenshots

Coming soon — add your screenshots here

<!-- To add screenshots:
1. Create a /screenshots folder in your repo
2. Add images there
3. Replace the lines below with:
![Dashboard](screenshots/dashboard.png)
![Applications](screenshots/applications.png)
-->

⚙️ Installation & Setup
Prerequisites

Python 3.10+
Node.js 18+
Git


1. Clone the Repository
bashgit clone https://github.com/Yashtodankar/Job-Application-Tracker.git
cd Job-Application-Tracker

2. Backend Setup
bashcd Backend

# Create and activate virtual environment
python -m venv myenv
myenv\Scripts\activate       # Windows
# source myenv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create a .env file
cp .env.example .env         # then fill in your values

# Run the backend server
uvicorn main:app --reload
Backend will run at: http://localhost:8000
API Docs available at: http://localhost:8000/docs

3. Frontend Setup
bashcd Frontend

# Install dependencies
npm install

# Start the development server
npm run dev
Frontend will run at: http://localhost:5173

📁 Project Structure
Job-Application-Tracker/
├── Backend/
│   ├── main.py          # FastAPI app entry point
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── crud.py          # Database operations
│   ├── database.py      # DB connection setup
│   └── requirements.txt
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
└── README.md

🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

📄 License
This project is open source and available under the MIT License.
