# 🛒 CloudCart – Dockerized MERN E-Commerce Application

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

A full-featured, responsive e-commerce web application built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js), fully containerized with **Docker**, and ready for **AWS deployment**.

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Seed Data](#-seed-data)
- [Docker Configuration](#-docker-configuration)
- [AWS Deployment Guide](#-aws-deployment-guide)
- [Testing](#-testing)
- [MongoDB Atlas (Production Alternative)](#-mongodb-atlas-production-alternative)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Customer Features
- 🏠 **Home Page** – Hero banners, featured products, category browsing
- 🛍️ **Product Catalog** – Search, filter by category/price, sort by price/rating
- 📄 **Product Details** – Image gallery, descriptions, stock status, quantity selection
- 🛒 **Shopping Cart** – Add/remove items, update quantities, persistent cart
- 💳 **Checkout** – Shipping info, order summary, simulated payment
- 📦 **Order Tracking** – View order history with status tracking
- 👤 **User Profile** – Manage personal info and shipping addresses
- 🔐 **Authentication** – Register, login, JWT-based sessions

### Admin Features
- 📊 **Dashboard** – Sales stats, order count, revenue, user metrics
- 📦 **Product Management** – Full CRUD for products
- 📋 **Order Management** – View all orders, update status
- 👥 **User Management** – View users, manage roles

### Technical Features
- 🐳 **Fully Dockerized** – Single `docker compose up --build` to run everything
- 🔒 **Security** – bcrypt password hashing, JWT auth, input validation
- 📱 **Responsive Design** – Mobile-first, works on all screen sizes
- 🏗️ **Clean Architecture** – MVC pattern, modular code structure

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Frontend      │────▶│   Backend       │────▶│   MongoDB       │
│   (React/Nginx) │     │   (Express.js)  │     │                 │
│   Port 80       │     │   Port 5000     │     │   Port 27017    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
    Container 1             Container 2             Container 3
                    Docker Network: cloudcart-network
```

**Request Flow:**
1. Browser → Nginx (port 80) serves React SPA
2. React app → Nginx proxies `/api/*` → Express backend (port 5000)
3. Express → Mongoose → MongoDB (port 27017)

---

## 🛠️ Tech Stack

| Layer          | Technology                                   |
| -------------- | -------------------------------------------- |
| Frontend       | React 18, Vite, React Router v6, Axios       |
| Backend        | Node.js 20, Express.js, JWT, bcryptjs        |
| Database       | MongoDB 7, Mongoose ODM                      |
| Containerization | Docker, Docker Compose                     |
| Web Server     | Nginx (production frontend)                  |
| Cloud          | AWS EC2, ECR, Security Groups, CloudWatch    |

---

## 📁 Project Structure

```
CloudCart/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context providers
│   │   ├── services/         # API service layer
│   │   └── main.jsx          # App entry point
│   ├── Dockerfile            # Multi-stage build
│   ├── nginx.conf            # Nginx configuration
│   ├── vite.config.js        # Vite configuration
│   └── package.json
├── backend/
│   ├── config/               # Database configuration
│   ├── controllers/          # Request handlers
│   ├── middleware/            # Auth, validation, error handling
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API route definitions
│   ├── seed/                 # Database seed script
│   ├── utils/                # Utility functions
│   ├── Dockerfile            # Node.js container
│   ├── server.js             # Express entry point
│   └── package.json
├── docker-compose.yml        # Multi-service orchestration
├── .env.example              # Environment variable template
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/) installed

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CloudCart.git
cd CloudCart
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local development):

```env
MONGO_USERNAME=admin
MONGO_PASSWORD=password123
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=production
```

### 3. Start the Application

```bash
docker compose up --build
```

This single command will:
- Build the React frontend and serve it via Nginx
- Build and start the Express.js backend
- Start MongoDB with persistent storage
- Set up networking between all services
- Wait for MongoDB to be healthy before starting the backend

### 4. Seed the Database

In a new terminal, run:

```bash
docker exec cloudcart-backend node seed/seedData.js
```

This creates sample users and products.

### 5. Access the Application

| Service   | URL                          |
| --------- | ---------------------------- |
| Frontend  | http://localhost              |
| Backend   | http://localhost:5000/api     |
| MongoDB   | mongodb://localhost:27017     |

### 6. Stop the Application

```bash
docker compose down
```

To stop and remove volumes (deletes database data):

```bash
docker compose down -v
```

---

## 🔑 Environment Variables

| Variable         | Description                  | Default                |
| ---------------- | ---------------------------- | ---------------------- |
| `MONGO_USERNAME`  | MongoDB root username        | `admin`                |
| `MONGO_PASSWORD`  | MongoDB root password        | `password123`          |
| `JWT_SECRET`      | JWT signing secret           | (set your own)         |
| `NODE_ENV`        | Node environment             | `production`           |

---

## 📡 API Documentation

### Authentication

| Method | Endpoint             | Description          | Auth  |
| ------ | -------------------- | -------------------- | ----- |
| POST   | `/api/auth/register` | Register new user    | No    |
| POST   | `/api/auth/login`    | Login user           | No    |
| GET    | `/api/auth/profile`  | Get user profile     | Yes   |
| PUT    | `/api/auth/profile`  | Update user profile  | Yes   |

### Products

| Method | Endpoint                | Description          | Auth     |
| ------ | ----------------------- | -------------------- | -------- |
| GET    | `/api/products`         | List products        | No       |
| GET    | `/api/products/featured`| Featured products    | No       |
| GET    | `/api/products/categories` | Get categories    | No       |
| GET    | `/api/products/:id`     | Product details      | No       |
| POST   | `/api/products`         | Create product       | Admin    |
| PUT    | `/api/products/:id`     | Update product       | Admin    |
| DELETE | `/api/products/:id`     | Delete product       | Admin    |

### Cart

| Method | Endpoint            | Description          | Auth  |
| ------ | ------------------- | -------------------- | ----- |
| GET    | `/api/cart`         | Get user's cart      | Yes   |
| POST   | `/api/cart`         | Add item to cart     | Yes   |
| PUT    | `/api/cart/:itemId` | Update item quantity | Yes   |
| DELETE | `/api/cart/:itemId` | Remove item          | Yes   |
| DELETE | `/api/cart`         | Clear cart           | Yes   |

### Orders

| Method | Endpoint                  | Description          | Auth     |
| ------ | ------------------------- | -------------------- | -------- |
| POST   | `/api/orders`             | Create order         | Yes      |
| GET    | `/api/orders/my-orders`   | User's orders        | Yes      |
| GET    | `/api/orders/:id`         | Order details        | Yes      |
| GET    | `/api/orders`             | All orders           | Admin    |
| GET    | `/api/orders/stats`       | Order statistics     | Admin    |
| PUT    | `/api/orders/:id/status`  | Update order status  | Admin    |

### Users

| Method | Endpoint          | Description          | Auth     |
| ------ | ----------------- | -------------------- | -------- |
| GET    | `/api/users`      | List all users       | Admin    |
| GET    | `/api/users/stats`| User statistics      | Admin    |
| PUT    | `/api/users/:id`  | Update user role     | Admin    |

---

## 🌱 Seed Data

After running the seed script, the following test accounts are available:

| Role  | Email                  | Password   |
| ----- | ---------------------- | ---------- |
| Admin | admin@cloudcart.com    | admin123   |
| User  | user@cloudcart.com     | user123    |

The seed script also creates 24+ products across 8 categories.

---

## 🐳 Docker Configuration

### Services

| Service   | Image          | Port  | Description                      |
| --------- | -------------- | ----- | -------------------------------- |
| frontend  | Custom (Nginx) | 80    | React SPA served by Nginx        |
| backend   | Custom (Node)  | 5000  | Express.js REST API              |
| mongodb   | mongo:7        | 27017 | MongoDB database                 |

### Volumes

- `mongo-data` – Persistent MongoDB data storage

### Networks

- `cloudcart-network` – Bridge network connecting all services

### Health Checks

- MongoDB: `mongosh --eval "db.adminCommand('ping')"` every 10 seconds
- Backend waits for MongoDB to be healthy before starting

### Useful Docker Commands

```bash
# Build and start all services
docker compose up --build

# Start in detached mode
docker compose up --build -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend

# Stop all services
docker compose down

# Rebuild a specific service
docker compose build backend

# Access MongoDB shell
docker exec -it cloudcart-mongodb mongosh -u admin -p password123

# Access backend container shell
docker exec -it cloudcart-backend sh

# Check container status
docker compose ps
```

---

## ☁️ AWS Deployment Guide

### Prerequisites
- AWS Account
- AWS CLI installed and configured
- SSH key pair for EC2

### Step 1: Launch EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. Choose **Ubuntu Server 22.04 LTS (HVM)** AMI
3. Select **t2.medium** instance type (or t2.micro for free tier)
4. Configure Security Group:

   | Type  | Protocol | Port Range | Source    | Description       |
   | ----- | -------- | ---------- | --------- | ----------------- |
   | SSH   | TCP      | 22         | Your IP   | SSH access        |
   | HTTP  | TCP      | 80         | 0.0.0.0/0 | Frontend          |
   | HTTPS | TCP      | 443        | 0.0.0.0/0 | HTTPS (optional)  |
   | Custom| TCP      | 5000       | 0.0.0.0/0 | Backend API       |

5. Create or select a key pair
6. Set storage to at least **20 GB**
7. Launch the instance
8. Allocate and associate an **Elastic IP** for a stable public address

### Step 2: Connect to EC2

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 3: Install Docker on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker ubuntu

# Apply group changes
newgrp docker

# Verify installation
docker --version
docker compose version
```

### Step 4: Set Up AWS ECR (Optional but Recommended)

```bash
# Install AWS CLI
sudo apt install -y awscli

# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID, Secret Access Key, region, and output format

# Create ECR repositories
aws ecr create-repository --repository-name cloudcart-frontend
aws ecr create-repository --repository-name cloudcart-backend

# Login to ECR
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com

# On your LOCAL machine, build and push images
docker compose build

# Tag images
docker tag cloudcart-frontend:latest your-account-id.dkr.ecr.your-region.amazonaws.com/cloudcart-frontend:latest
docker tag cloudcart-backend:latest your-account-id.dkr.ecr.your-region.amazonaws.com/cloudcart-backend:latest

# Push images
docker push your-account-id.dkr.ecr.your-region.amazonaws.com/cloudcart-frontend:latest
docker push your-account-id.dkr.ecr.your-region.amazonaws.com/cloudcart-backend:latest
```

### Step 5: Deploy on EC2

**Option A: Clone and Build on EC2**

```bash
# Clone repository
git clone https://github.com/yourusername/CloudCart.git
cd CloudCart

# Create .env file
cp .env.example .env
nano .env
# Update with strong passwords and secrets

# Build and start
docker compose up --build -d

# Seed the database
docker exec cloudcart-backend node seed/seedData.js
```

**Option B: Pull from ECR**

Update `docker-compose.yml` to use ECR images instead of build contexts, then:

```bash
docker compose up -d
```

### Step 6: Configure CloudWatch Logging

```bash
# Install CloudWatch agent
sudo apt install -y amazon-cloudwatch-agent

# Configure Docker to use CloudWatch log driver
# Add to each service in docker-compose.yml:
#   logging:
#     driver: awslogs
#     options:
#       awslogs-group: /cloudcart
#       awslogs-region: your-region
#       awslogs-stream-prefix: service-name
```

### Step 7: Set Up IAM

Create an IAM role for the EC2 instance with these policies:
- `AmazonEC2ContainerRegistryReadOnly` – Pull images from ECR
- `CloudWatchAgentServerPolicy` – Send logs to CloudWatch

Attach the role to the EC2 instance.

### Step 8: Access the Application

Open `http://your-elastic-ip` in a browser.

### Maintenance Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Update application
git pull
docker compose up --build -d

# Backup MongoDB
docker exec cloudcart-mongodb mongodump --username admin --password password123 --authenticationDatabase admin --out /data/backup
docker cp cloudcart-mongodb:/data/backup ./backup
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User Registration – Create a new account
- [ ] User Login – Login with valid credentials
- [ ] JWT Authentication – Access protected routes
- [ ] Product Listing – View all products with filters
- [ ] Product Search – Search by keyword
- [ ] Product Details – View individual product
- [ ] Add to Cart – Add products to shopping cart
- [ ] Update Cart – Change quantities
- [ ] Remove from Cart – Remove items
- [ ] Checkout – Place an order with shipping info
- [ ] Order History – View past orders
- [ ] Profile Update – Edit personal information
- [ ] Admin Login – Access admin dashboard
- [ ] Admin Products – Create, edit, delete products
- [ ] Admin Orders – View and update order statuses
- [ ] Admin Users – View users, toggle roles
- [ ] Docker Health – All containers running and healthy
- [ ] Data Persistence – Data survives `docker compose down` + `up`
- [ ] Responsive Design – Test on mobile, tablet, desktop

### Docker Health Check

```bash
# Check all services are running
docker compose ps

# Check MongoDB health
docker exec cloudcart-mongodb mongosh --eval "db.adminCommand('ping')" -u admin -p password123

# Check backend health
curl http://localhost:5000/api/products

# Check frontend
curl http://localhost
```

---

## 🌐 MongoDB Atlas (Production Alternative)

For production deployments, consider using **MongoDB Atlas** instead of a Docker container:

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster (M0 free tier available)
3. Create a database user
4. Whitelist your EC2 IP address (or allow all: `0.0.0.0/0`)
5. Get the connection string
6. Update your `.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/cloudcart?retryWrites=true&w=majority
```

7. Remove the `mongodb` service from `docker-compose.yml`
8. Remove the `depends_on` from the `backend` service

**Benefits of Atlas:**
- Automated backups
- Scaling and replication
- Monitoring and alerts
- No manual database management

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ using the MERN Stack, Docker, and AWS**
