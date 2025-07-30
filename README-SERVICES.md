# 📸 Image Upload & 🧹 Tasks Services

## 🚀 Servicios Agregados

### 1. **ImageUploadService** - Subida de Imágenes a Cloudinary
### 2. **TasksService** - Limpieza Automática de Bookings

---

## 📸 **Image Upload Service**

### **Configuración**

Agrega estas variables a tu archivo `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### **Características**

- ✅ **Conversión automática a WebP** con Sharp
- ✅ **Optimización de calidad** (80% por defecto)
- ✅ **Subida individual y múltiple**
- ✅ **Eliminación de imágenes**
- ✅ **Manejo de errores robusto**

### **Endpoints Disponibles**

#### **Subir imagen individual**
```http
POST /companion/upload-cloudinary
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: 
- image: [archivo de imagen]
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://res.cloudinary.com/...",
    "publicId": "companion-123-1234567890-image",
    "originalName": "photo.jpg",
    "size": 1024000
  },
  "message": "Imagen subida exitosamente a Cloudinary"
}
```

#### **Subir múltiples imágenes**
```http
POST /companion/upload-multiple-cloudinary
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: 
- images: [array de archivos de imagen, máximo 5]
```

#### **Eliminar imagen**
```http
DELETE /companion/delete-cloudinary-image/:publicId
Authorization: Bearer <token>
```

### **Uso en el Código**

```typescript
// Inyectar el servicio
constructor(private readonly imageUploadService: ImageUploadService) {}

// Subir una imagen
const result = await this.imageUploadService.uploadImage(
  fileBuffer,
  'mi-imagen-unica'
);

// Subir múltiples imágenes
const files = [{ buffer: Buffer, originalname: string }];
const results = await this.imageUploadService.uploadMultipleImages(files);

// Eliminar imagen
await this.imageUploadService.deleteImage('public_id');
```

---

## 🧹 **Tasks Service**

### **Funcionalidad**

- 🕛 **Limpieza automática diaria** a medianoche (zona horaria Lima)
- 🗑️ **Elimina bookings PENDING** con más de 24 horas
- 📊 **Estadísticas y logs detallados**
- 🔧 **Ejecución manual disponible**

### **Configuración Automática**

El servicio se ejecuta automáticamente todos los días a las **00:00 (medianoche)** en zona horaria de Lima.

### **Endpoints Manuales**

#### **Ejecutar limpieza manual**
```http
POST /tasks/cleanup-pending-bookings
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 5,
    "deletedIds": [1, 2, 3, 4, 5]
  },
  "message": "Limpieza de bookings pendientes ejecutada"
}
```

#### **Obtener estadísticas**
```http
GET /tasks/pending-bookings-stats
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalPending": 10,
    "oldPending": 3,
    "oldestPendingDate": "2024-01-15T10:30:00.000Z"
  },
  "message": "Estadísticas de bookings pendientes"
}
```

### **Logs del Sistema**

El servicio genera logs detallados:

```
[TasksService] Iniciando tarea: Eliminar bookings pendientes antiguos...
[TasksService] Bookings pendientes a eliminar (IDs): 1, 2, 3
[TasksService] Tarea completada: 3 bookings pendientes antiguos eliminados.
```

---

## 🛠️ **Instalación y Configuración**

### **1. Variables de Entorno**

Copia el archivo `.env.template` a `.env` y configura:

```env
# Cloudinary (obligatorio para ImageUploadService)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key  
CLOUDINARY_API_SECRET=tu_api_secret
```

### **2. Dependencias**

Las dependencias ya están instaladas en tu `package.json`:
- `cloudinary` - Cliente de Cloudinary
- `sharp` - Procesamiento de imágenes
- `@nestjs/schedule` - Tareas programadas

### **3. Módulos Importados**

Los módulos ya están configurados en `app.module.ts`:
- `ImageUploadModule`
- `TasksModule`
- `ScheduleModule.forRoot()`

---

## 📋 **Formatos de Imagen Soportados**

- ✅ **JPEG** (.jpg, .jpeg)
- ✅ **PNG** (.png)
- ✅ **WebP** (.webp)
- 🔄 **Conversión automática** a WebP optimizado

---

## 🔒 **Seguridad**

- 🛡️ **Autenticación JWT** requerida
- 📏 **Límite de tamaño**: 10MB por imagen
- 🚫 **Filtros de tipo de archivo**
- 🔍 **Validación de archivos**

---

## 🚨 **Manejo de Errores**

Ambos servicios incluyen manejo robusto de errores:

```typescript
try {
  const result = await this.imageUploadService.uploadImage(buffer, filename);
} catch (error) {
  throw new BadRequestException(`Error al subir imagen: ${error.message}`);
}
```

---

## 📈 **Monitoreo**

### **Logs de Imágenes**
- Subidas exitosas y fallidas
- Tamaños de archivo
- Tiempos de procesamiento

### **Logs de Tareas**
- Ejecución de limpieza automática
- Cantidad de bookings eliminados
- Errores en el proceso

---

¡Los servicios están listos para usar! 🎉