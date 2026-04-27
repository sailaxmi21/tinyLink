🔗 TinyLink - URL Shortener System

A full-stack URL shortener application built using **React.js, Spring Boot, and MySQL**.  
It allows users to convert long URLs into short, shareable links and redirect them to original URLs.

---

## 🎯 Project Objective

To design a simple yet scalable URL shortening service that demonstrates backend API design, database mapping, and frontend-backend integration.

---

## 🚀 Features

### 🔗 URL Shortening
- Convert long URLs into short unique links
- Generate unique short codes for each URL

### 🔄 URL Redirection
- Redirect short URLs to original long URLs
- Fast lookup using backend APIs

### 💾 Data Storage
- Stores URL mappings in MySQL database
- Ensures persistence of shortened links

### 🌐 Full Stack Integration
- React frontend for user interaction
- Spring Boot backend for API handling

---

## 🛠️ Tech Stack

- Frontend: React.js (Vite)
- Backend: Spring Boot (Java)
- Database: MySQL
- API Style: REST APIs
- Tools: Postman, Git, GitHub

---

## 🧩 System Architecture


User → React Frontend → Spring Boot API → MySQL Database


---

## 🧠 How It Works

1. User enters a long URL in frontend  
2. Backend generates a unique short code  
3. Mapping (shortCode → longURL) is stored in database  
4. When user opens short link:  
   → backend fetches original URL  
   → redirects user to original page  

---

## 📡 API Endpoints

### 🔹 Create Short URL
```http id="a8k2lm"
POST /api/url/shorten
🔹 Redirect URL
GET /{shortUrl}
🗄️ Database Schema
URL Mapping Table
Field	Type	Description
id	Long	Primary key
long_url	String	Original URL
short_code	String	Generated short URL code
▶️ How to Run
Backend
cd backend
mvn spring-boot:run
Frontend
cd frontend
npm install
npm run dev
📌 Future Improvements
Custom alias for URLs
Click analytics (views tracking)
Expiry time for links
User authentication system
Docker deployment
👩‍💻 Author

Sailaxmi Sirangi
Java Backend Developer
GitHub: https://github.com/sailaxmi21
