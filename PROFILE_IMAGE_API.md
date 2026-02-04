# Profile Image API Documentation

## User-Specific Profile Images

Profile images are now **user-specific**. Each user has their own profile image stored in the database and file system, completely isolated from other users.

---

## How It Works

### Database Storage
- Each user has a `profileImageUrl` field in their database record
- The URL is unique per user and stored in the `users` table
- When a user uploads an image, only their record is updated

### File Storage
- Files are stored in `./uploads/profile-images/`
- File naming convention: `user-{userId}-{timestamp}-{random}.{ext}`
- Example: `user-123-1706543210000-987654321.jpg`
- This ensures files are user-specific and collision-free

### User Isolation
- JWT authentication identifies which user is making the request
- Upload endpoint uses `req.user.userId` to ensure only the authenticated user's profile is updated
- Each user can only modify their own profile image
- When users log in or refresh tokens, they receive their own profile image URL

---

## API Endpoints

### 1. Upload Profile Image
**Endpoint:** `POST /api/auth/profile-image`

**Authentication:** Required (JWT Bearer token)

**Content-Type:** `multipart/form-data`

**Request:**
```
Field name: profileImage
File types: jpg, jpeg, png, gif, webp
Max size: 5MB
```

**Response:**
```json
{
  "message": "Profile image uploaded successfully",
  "profileImageUrl": "/uploads/profile-images/user-123-1706543210000-987654321.jpg",
  "userId": 123
}
```

---

### 2. Login (Returns User Profile)
**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user",
    "profileImageUrl": "/uploads/profile-images/user-123-1706543210000-987654321.jpg"
  }
}
```

---

### 3. Get Current User Profile
**Endpoint:** `GET /api/auth/profile`

**Authentication:** Required (JWT Bearer token)

**Response:**
```json
{
  "id": 123,
  "email": "user@example.com",
  "username": "johndoe",
  "role": "user",
  "profileImageUrl": "/uploads/profile-images/user-123-1706543210000-987654321.jpg"
}
```

---

### 4. Refresh Tokens (Returns User Profile)
**Endpoint:** `POST /api/auth/refresh`

**Request:**
```json
{
  "userId": 123,
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user",
    "profileImageUrl": "/uploads/profile-images/user-123-1706543210000-987654321.jpg"
  }
}
```

---

### 5. Get User by ID
**Endpoint:** `GET /api/users/:id`

**Response:**
```json
{
  "id": 123,
  "email": "user@example.com",
  "username": "johndoe",
  "role": "user",
  "profileImageUrl": "/uploads/profile-images/user-123-1706543210000-987654321.jpg"
}
```

---

## User Isolation Features

### ✅ What's Isolated:
1. **Database Records**: Each user has their own `profileImageUrl` field
2. **File Names**: Files include user ID in the name (e.g., `user-123-...`)
3. **Authentication**: Only the authenticated user can update their profile image
4. **Retrieval**: Login and profile endpoints return only the user's own image URL

### ✅ Automatic Behavior:
- When User A logs in → receives User A's profile image URL
- When User B logs in → receives User B's profile image URL
- When User A uploads an image → only User A's database record is updated
- When User B uploads an image → only User B's database record is updated
- Previous user's images remain unchanged and accessible via their URL

---

## Frontend Integration

### On Login:
```dart
// After successful login
final response = await apiService.login(email, password);
final user = response['user'];
final profileImageUrl = user['profileImageUrl'];

// Save user-specific profile image
await prefs.setString('profile_image_url_${user['id']}', profileImageUrl ?? '');
await prefs.setInt('current_user_id', user['id']);
```

### On Profile Page Load:
```dart
// Load current user's profile image
final currentUserId = prefs.getInt('current_user_id');
final profileImageUrl = prefs.getString('profile_image_url_$currentUserId');
```

### On Upload:
```dart
final response = await apiService.uploadProfileImage(imageFile);
final profileImageUrl = response['profileImageUrl'];
final userId = response['userId'];

// Save the new image URL for this specific user
await prefs.setString('profile_image_url_$userId', profileImageUrl);
```

---

## Security Notes

- Profile images are accessible via HTTP (served as static files)
- JWT authentication protects the upload endpoint
- Only the authenticated user can update their own profile image
- User IDs in filenames help identify which user uploaded the file
- Sensitive user data (password, refreshToken) is never returned in responses
