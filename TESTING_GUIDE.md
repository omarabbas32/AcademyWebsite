# دليل الاختبار - Testing Guide

## خطوات الاختبار السريع

### 1. التأكد من تثبيت المكتبات
```bash
npm install
```

### 2. تشغيل السيرفر
```bash
# للتطوير (مع إعادة التشغيل التلقائي)
npx nodemon server.js

# أو للتشغيل العادي
npm start
```

يجب أن ترى رسالة:
```
Connected to MongoDB successfully!
Server running on port 5000
```

### 3. فتح الداشبورد
افتح المتصفح واذهب إلى:
```
http://localhost:5000/dashboard.html
```

## اختبار رفع الصور

### الطريقة 1: من الداشبورد (الأسهل)
1. افتح `http://localhost:5000/dashboard.html`
2. اضغط على تبويب "Team Members"
3. املأ البيانات:
   - Name: اسم العضو
   - Job Title: المسمى الوظيفي
   - Image: اختر صورة
4. اضغط "Add Member"
5. يجب أن ترى رسالة نجاح والصورة تظهر في القائمة

### الطريقة 2: اختبار API مباشرة

#### اختبار GET (جلب جميع الأعضاء)
```bash
curl http://localhost:5000/api/team-members
```

#### اختبار POST (إضافة عضو جديد مع صورة)
```bash
curl -X POST http://localhost:5000/api/team-members \
  -F "name=Ahmed Ali" \
  -F "jobTitle=Developer" \
  -F "image=@/path/to/your/image.jpg"
```

**ملاحظة:** استبدل `/path/to/your/image.jpg` بمسار الصورة على جهازك

#### اختبار PUT (تحديث عضو)
```bash
curl -X PUT http://localhost:5000/api/team-members/MEMBER_ID \
  -F "name=Ahmed Ali Updated" \
  -F "jobTitle=Senior Developer" \
  -F "image=@/path/to/new/image.jpg"
```

#### اختبار DELETE (حذف عضو)
```bash
curl -X DELETE http://localhost:5000/api/team-members/MEMBER_ID
```

## استكشاف الأخطاء

### المشكلة: السيرفر لا يعمل
**الحل:**
- تأكد من أن MongoDB يعمل
- تأكد من وجود ملف `.env` مع `MONGO_URL`
- تحقق من أن البورت 5000 غير مستخدم

### المشكلة: خطأ في رفع الصورة
**الحل:**
- تأكد من أن بيانات Cloudinary صحيحة في `src/config/cloudinary.js`
- تأكد من أن الصورة أقل من 5MB
- تأكد من أن الصورة بصيغة صحيحة (jpg, png, gif, webp)

### المشكلة: الداشبورد لا يظهر
**الحل:**
- تأكد من أن السيرفر يعمل
- تأكد من وجود ملف `public/dashboard.html`
- افتح Developer Tools في المتصفح (F12) وتحقق من الأخطاء

### المشكلة: الصور لا تظهر
**الحل:**
- تحقق من أن Cloudinary يعمل
- افتح Developer Tools (F12) > Network tab
- تحقق من أن رابط الصورة من Cloudinary يعمل

## اختبار Projects API

### GET جميع المشاريع
```bash
curl http://localhost:5000/api/projects
```

### POST إضافة مشروع جديد
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Name",
    "brief": "Project brief description",
    "solution": "Solution description",
    "results": "Results description"
  }'
```

## نصائح للاختبار

1. استخدم Postman أو Insomnia لاختبار API بسهولة
2. افتح Developer Tools في المتصفح لرؤية الأخطاء
3. تحقق من Console في السيرفر لرؤية رسائل الخطأ
4. تأكد من أن جميع المكتبات مثبتة: `npm install`

