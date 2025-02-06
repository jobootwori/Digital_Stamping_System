# Digital Stamping System

## 📌 Project Overview
The **Digital Stamping System** is a web application that enables users to create, manage, and apply digital stamps securely. The system ensures user authentication through **email verification and OTP authentication** before granting access to stamping functionalities.

The project consists of **two main components:**
1. **Backend (Django & DRF)** - Manages user authentication, OTP verification, and stamp data storage.
2. **Frontend (Next.js & React)** - Provides an interactive UI for users to register, verify OTPs, and create digital stamps.

---

## 🏗 Tech Stack

### **Backend**
- **Django** (Python 3.12)
- **Django REST Framework (DRF)**
- **Django SimpleJWT** (For authentication)
- **PostgreSQL / SQLite** (Database)
- **Celery & Redis** (For async tasks, if implemented later)

### **Frontend**
- **Next.js** (React Framework)
- **Material-UI** (UI Components)
- **Axios** (API Calls)
- **Zod & React Hook Form** (Form validation)
- **react-konva** (For digital stamping functionality)

---

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with **email & password**
- **Email verification via OTP before accessing stamping features**
- **Access tokens & refresh tokens for secure API calls**

### 🖍 Digital Stamping
- **Users can create custom digital stamps** with text, colors, and shapes
- **Stamps are saved and can be reused**
- **OTP verification is required before stamping** (like a bot challenge)

### 📨 Email & OTP Verification
- **Users receive an OTP via email after registration**
- **Users must enter the OTP to verify their account**
- **Verified users can access the stamping features**

---

## 🛠 Setup & Installation

### **1️⃣ Backend Setup** (Django + DRF)

#### **Step 1: Clone the Repository**
```bash
git clone https://github.com/your-repo/digital-stamping.git
cd digital-stamping/digital_stamping_backend
```

#### **Step 2: Create & Activate Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate    # On Windows
```

#### **Step 3: Install Dependencies**
```bash
pip install -r requirements.txt
```

#### **Step 4: Apply Migrations & Create Superuser**
```bash
python manage.py migrate
python manage.py createsuperuser
```

#### **Step 5: Run the Backend Server**
```bash
python manage.py runserver
```


---

### **2️⃣ Frontend Setup** (Next.js + React)

#### **Step 1: Navigate to the Frontend Directory**
```bash
cd ../digital_stamping_frontend
```

#### **Step 2: Install Dependencies**
```bash
npm install
```

#### **Step 3: Create a `.env.local` File**
```bash
echo "NEXT_PUBLIC_SERVER_URL=http://127.0.0.1:8000" > .env.local
```

#### **Step 4: Start the Frontend**
```bash
npm run dev
```

The frontend should be running at: **`http://localhost:3033`**

---

## 🔑 Authentication Flow
1. **User registers** → Receives an **OTP via email**.
2. **User enters OTP** → Account is verified.
3. **User logs in** → Receives **JWT tokens** (access & refresh).
4. **User creates a stamp** → Requires **verified email & OTP verification**.

---

## 🔄 API Endpoints

### **Authentication**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/register/` | Register a new user |
| `POST` | `/login/` | Login with email & password |
| `POST` | `/request-otp/` | Request OTP for verification |
| `POST` | `/verify-otp/` | Verify OTP to activate account |
| `POST` | `/logout/` | Logout user (invalidate tokens) |

### **Stamping System**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/stamps/` | Retrieve all user stamps |
| `POST` | `/stamps/create/` | Create a new stamp (requires OTP verification) |

---

## 🛡 Security Measures
✅ **JWT Authentication** → Secure login & session management
✅ **Email OTP Verification** → Prevents fake signups
✅ **Authorization Checks** → Only verified users can create stamps

---

## 📌 Future Enhancements
🚀 **Allow multiple stamp templates**
🚀 **Mobile app integration**

---

## 🤝 Contributing
We welcome contributions! Feel free to submit a **pull request** or open an **issue**.

---

## 📧 Contact
For any inquiries, reach out at: **jobootwori@gmail.com**

