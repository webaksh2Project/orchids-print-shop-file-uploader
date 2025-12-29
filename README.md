# 🖨️ PrintShare - File Sharing for Print Shops & Cybercafes

A modern, production-ready web application that enables seamless file transfers between customers and print shops using QR codes and real-time WebSocket technology.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-green?style=flat-square&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-black?style=flat-square&logo=socket.io)

## ✨ Features

### For Shop Owners
- ✅ **Quick Registration** - Create account in 30 seconds
- 🔐 **Secure Authentication** - JWT-based with HTTP-only cookies
- 📱 **QR Code Generation** - Unique QR code per shop
- ⚡ **Real-time Updates** - Files appear instantly (Socket.IO)
- 📥 **Download Files** - One-click download
- 🖨️ **Print Direct** - Open files in print dialog
- 🗑️ **Delete Files** - Remove processed files
- 📊 **Dashboard Stats** - Total files and storage

### For Customers
- 📷 **Scan QR Code** - No app installation required
- 📝 **Simple Upload** - Enter name + select file
- 🚀 **Instant Delivery** - File sent to shop in seconds
- ✅ **Upload Confirmation** - Clear success message
- 🔒 **No Account Needed** - Frictionless experience

### Security Features
- 🔐 Password hashing with bcryptjs
- 🛡️ Rate limiting (5 uploads/min per shop)
- 📏 File size limit (10MB max)
- 🎯 MIME type validation
- ⏰ Auto-delete after 24 hours
- 🔑 Non-sequential shop IDs

## 🏗️ Architecture

**Tech Stack:**
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Custom Node.js Server
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Auth**: JWT (jose library)
- **UI**: Shadcn/UI Components

**Key Components:**
- Custom Node.js server for Socket.IO integration
- MongoDB for user and file storage
- Real-time WebSocket connections
- Rate-limited file uploads
- Automatic file cleanup job

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB database (Atlas or self-hosted)

### Installation

1. **Clone repository**
```bash
git clone <your-repo-url>
cd printshare
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key-here
```

4. **Start development server**
```bash
npm run dev
```

Visit: http://localhost:3000

## 📱 Usage Workflow

### Shop Owner Setup
1. Go to `/register` and create account
2. Login and view dashboard
3. Display QR code in shop for customers

### Customer Upload
1. Scan shop QR code with phone camera
2. Enter your name
3. Select file (PDF, DOC, JPG, etc.)
4. Click "Send File"
5. Wait for confirmation
6. Proceed to counter

### Shop Owner Receives File
- File appears instantly in dashboard (real-time)
- View customer name, filename, size, timestamp
- Download, print, or delete file

## 🔐 Security

- **Authentication**: JWT tokens in HTTP-only cookies
- **Password Security**: bcryptjs with 10 rounds
- **Rate Limiting**: 5 uploads per minute per shop
- **File Validation**: 
  - Max size: 10MB
  - Allowed types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT
- **Auto-Cleanup**: Files deleted after 24 hours
- **Shop IDs**: Non-sequential using nanoid

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── files/         # File management
│   │   │   └── upload/        # File upload
│   │   ├── dashboard/         # Shop owner dashboard
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── upload/[shopId]/   # Customer upload page
│   │   └── page.tsx           # Landing page
│   ├── components/ui/         # Shadcn UI components
│   ├── lib/                   # Utilities
│   │   ├── mongodb.ts         # Database connection
│   │   ├── auth.ts            # JWT utilities
│   │   ├── socket.ts          # Socket.IO server
│   │   ├── socket-client.ts   # Socket.IO client
│   │   ├── ratelimit.ts       # Rate limiting
│   │   └── cleanup.ts         # Auto-delete job
│   └── models/                # Mongoose models
│       ├── User.ts            # User schema
│       └── File.ts            # File schema
├── server.js                  # Custom Node server
├── ARCHITECTURE.md            # Architecture docs
├── DEPLOYMENT.md              # Deployment guide
└── package.json
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Files
- `POST /api/upload` - Upload file (public)
- `GET /api/files` - List shop files (protected)
- `GET /api/files/[id]` - Download file (protected)
- `DELETE /api/files/[id]` - Delete file (protected)

### WebSocket
- `/api/socket` - Socket.IO endpoint
  - `join-shop` - Join shop room
  - `file-uploaded` - File upload event

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide covering:
- Railway (recommended)
- Render
- DigitalOcean
- VPS (Ubuntu + PM2 + Nginx)
- MongoDB Atlas setup

**Quick Deploy to Railway:**
1. Push to GitHub
2. Connect to Railway
3. Add environment variables
4. Deploy automatically

## 🧪 Testing Checklist

- [ ] Shop owner registration
- [ ] Login and authentication
- [ ] QR code generation
- [ ] Customer file upload
- [ ] Real-time file reception
- [ ] File download
- [ ] File print
- [ ] File deletion
- [ ] Rate limiting (6th upload fails)
- [ ] Large file rejection (>10MB)
- [ ] Invalid file type rejection
- [ ] 24-hour auto-deletion

## 📊 Performance

- **Real-time Updates**: <100ms latency via WebSocket
- **File Upload**: ~1-3 seconds for typical documents
- **Database Queries**: Indexed for fast retrieval
- **Rate Limiting**: In-memory (consider Redis for scale)
- **File Storage**: MongoDB binary storage

## 🔧 Configuration

### File Upload Settings
```typescript
// src/app/api/upload/route.ts
MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  // ... add more
];
```

### Auto-Delete Duration
```typescript
// src/app/api/upload/route.ts
expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
```

### Rate Limiting
```typescript
// src/lib/ratelimit.ts
points: 5,      // Max uploads
duration: 60,   // Per 60 seconds
```

## 🐛 Troubleshooting

**MongoDB Connection Fails:**
- Check MongoDB URI format
- Verify IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

**Socket.IO Not Working:**
- Verify custom server is running (`node server.js`)
- Check WebSocket support on hosting platform
- Review browser console for connection errors

**Files Not Uploading:**
- Check file size (<10MB)
- Verify file type is allowed
- Check rate limiting (5/min)

## 📈 Future Enhancements

- [ ] Email notifications
- [ ] File preview in dashboard
- [ ] Multi-shop franchises
- [ ] Analytics dashboard
- [ ] Custom branding
- [ ] Payment integration
- [ ] File compression
- [ ] Batch file upload
- [ ] Mobile apps (iOS/Android)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📄 License

MIT License - See LICENSE file

## 📞 Support

For issues and questions:
- Review [ARCHITECTURE.md](./ARCHITECTURE.md)
- Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- Open GitHub issue

## 🎯 Built For

- Print shops
- Cybercafes
- Copy centers
- Document services
- Any business receiving customer files

---

**Made with ❤️ for print shops everywhere**

Start using PrintShare today and streamline your file transfer process!
