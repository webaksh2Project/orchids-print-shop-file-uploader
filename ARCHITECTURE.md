# PrintShare - Architecture Documentation

## 🏗️ System Architecture

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for WebSocket connections
- **Authentication**: JWT with HTTP-only cookies
- **UI**: Shadcn/UI + Tailwind CSS
- **Runtime**: Node.js

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Landing Page  │  Auth Pages  │  Dashboard  │  Upload Page  │
└────────┬────────────────┬────────────┬──────────────┬────────┘
         │                │            │              │
         └────────────────┴────────────┴──────────────┘
                          │
         ┌────────────────┴────────────────┐
         │      API Layer (Next.js)        │
         ├─────────────────────────────────┤
         │  /api/auth/*   │  /api/upload   │
         │  /api/files/*  │                │
         └────────┬────────────────┬────────┘
                  │                │
         ┌────────┴────────┐   ┌──┴───────────────┐
         │   MongoDB       │   │  Socket.IO       │
         │   (Mongoose)    │   │  (Real-time)     │
         └─────────────────┘   └──────────────────┘
```

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  shopName: String,
  shopId: String (unique, indexed),
  createdAt: Date,
  updatedAt: Date
}
```

### File Collection
```javascript
{
  _id: ObjectId,
  shopId: String (indexed),
  customerName: String,
  fileName: String,
  originalName: String,
  fileSize: Number,
  mimeType: String,
  fileData: Buffer (binary),
  uploadedAt: Date (indexed),
  expiresAt: Date (indexed, TTL)
}
```

**Indexes**:
- `shopId`: For fast file queries per shop
- `uploadedAt`: For sorting files by time
- `expiresAt`: TTL index for automatic deletion

## 🔐 Security Features

### Authentication
- JWT tokens stored in HTTP-only cookies
- Passwords hashed with bcryptjs (10 rounds)
- Token expiration: 7 days
- Session validation on protected routes

### File Upload Security
- **Rate Limiting**: 5 uploads per minute per shop
- **File Size Limit**: 10MB maximum
- **Allowed MIME Types**: 
  - Documents: PDF, DOC, DOCX, XLS, XLSX, TXT
  - Images: JPEG, JPG, PNG, GIF
- **File Validation**: Server-side MIME type checking
- **Auto-deletion**: Files expire after 24 hours

### Data Privacy
- Files stored in MongoDB (not filesystem)
- No customer accounts required
- Automatic cleanup of expired files
- Shop IDs are non-sequential (nanoid)

## 🔄 Real-time Updates (Socket.IO)

### Connection Flow
```
1. Shop owner logs in → Dashboard loads
2. Dashboard connects to Socket.IO
3. Client joins room: `shop-${shopId}`
4. Customer uploads file
5. Server emits `file-uploaded` event to room
6. Dashboard receives event → Updates UI instantly
```

### Socket Events
- **Client → Server**:
  - `join-shop`: Join shop-specific room
  - `leave-shop`: Leave shop room
  
- **Server → Client**:
  - `file-uploaded`: New file uploaded (with metadata)

## 🛣️ API Routes

### Authentication Routes

#### POST `/api/auth/register`
Create new shop owner account
```json
Request: {
  "email": "shop@example.com",
  "password": "password123",
  "shopName": "My Print Shop"
}

Response: {
  "success": true,
  "user": {
    "id": "...",
    "email": "shop@example.com",
    "shopName": "My Print Shop",
    "shopId": "abc123xyz"
  }
}
```

#### POST `/api/auth/login`
Sign in existing user
```json
Request: {
  "email": "shop@example.com",
  "password": "password123"
}

Response: {
  "success": true,
  "user": { ... }
}
```

#### POST `/api/auth/logout`
Clear authentication cookie
```json
Response: { "success": true }
```

#### GET `/api/auth/me`
Get current authenticated user
```json
Response: {
  "user": { ... }
}
```

### File Management Routes

#### POST `/api/upload`
Upload file from customer (multipart/form-data)
```
Fields:
- shopId: string
- customerName: string
- file: File
```

#### GET `/api/files`
Get all files for authenticated shop
```json
Response: {
  "files": [
    {
      "id": "...",
      "customerName": "John Doe",
      "fileName": "document.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "uploadedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### GET `/api/files/[id]`
Download specific file (returns binary)

#### DELETE `/api/files/[id]`
Delete specific file
```json
Response: { "success": true }
```

## 📱 Frontend Structure

### Pages
- `/` - Landing page
- `/register` - Shop owner registration
- `/login` - Shop owner login
- `/dashboard` - Shop owner dashboard (protected)
- `/upload/[shopId]` - Customer upload page (public)

### Key Components
- Authentication forms (register/login)
- Dashboard with QR code display
- Real-time file list with Socket.IO
- File upload form with validation
- File management actions (download, print, delete)

## 🔄 User Workflows

### Shop Owner Workflow
1. Register account → Auto-generate unique shopId
2. Login → Redirect to dashboard
3. View QR code → Display in shop
4. Receive files in real-time → No refresh needed
5. Download/Print/Delete files

### Customer Workflow
1. Scan QR code → Opens upload page
2. Enter name
3. Select file
4. Upload → Instant confirmation
5. Proceed to counter

## ⚙️ Background Jobs

### File Cleanup
- **Schedule**: Every 1 hour
- **Function**: Delete files where `expiresAt < now()`
- **Implementation**: MongoDB TTL index + manual cleanup
- **Location**: `src/lib/cleanup.ts`

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or self-hosted MongoDB)

### Environment Variables
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
NODE_ENV=production
```

### Build & Deploy Steps

1. **Build the application**
```bash
npm install
npm run build
```

2. **Start production server**
```bash
npm start
```

3. **Using PM2 (recommended)**
```bash
npm install -g pm2
pm2 start server.js --name printshare
pm2 save
pm2 startup
```

4. **Deploy to Vercel/Railway/Render**
- Connect GitHub repository
- Add environment variables
- Deploy (auto-detects Next.js)

### Custom Server Configuration
The app uses a custom Node.js server (`server.js`) for Socket.IO integration:
- Development: `npm run dev` (runs custom server)
- Production: `npm start` (runs custom server)

## 📈 Performance Considerations

### Database Optimization
- Indexed fields for fast queries
- TTL index for automatic cleanup
- Lean queries (exclude fileData when listing)

### File Storage
- Files stored in MongoDB GridFS-style
- Max file size: 10MB
- Binary storage in Buffer format

### Rate Limiting
- In-memory rate limiter (5 uploads/min)
- Per-shop tracking using shopId
- Prevents abuse and spam

## 🔧 Maintenance

### Monitoring
- Check MongoDB connections
- Monitor file storage size
- Review rate limit logs
- Track Socket.IO connections

### Scaling Considerations
- Use Redis for rate limiting (multi-instance)
- Consider S3/cloud storage for files
- Implement horizontal scaling with load balancer
- Use MongoDB replica set for reliability

## 🛠️ Development

### Local Setup
```bash
npm install
npm run dev
```

### File Structure
```
src/
├── app/                 # Next.js pages
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard page
│   ├── login/          # Login page
│   ├── register/       # Register page
│   └── upload/[shopId] # Customer upload page
├── components/         # React components
│   └── ui/            # Shadcn UI components
├── lib/               # Utilities
│   ├── mongodb.ts     # Database connection
│   ├── auth.ts        # JWT auth utilities
│   ├── socket.ts      # Socket.IO server
│   ├── socket-client.ts # Socket.IO client
│   ├── ratelimit.ts   # Rate limiting
│   └── cleanup.ts     # File cleanup job
├── models/            # Mongoose models
│   ├── User.ts        # User model
│   └── File.ts        # File model
server.js              # Custom Node.js server
```

## 🎯 Future Enhancements

- [ ] Email notifications for shop owners
- [ ] File preview in dashboard
- [ ] Multi-shop support for franchises
- [ ] Analytics dashboard
- [ ] Custom branding per shop
- [ ] WhatsApp/SMS notifications
- [ ] Payment integration
- [ ] File compression
- [ ] Multiple file upload
- [ ] QR code customization
