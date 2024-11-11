const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// CORS middleware დამატება
app.use(cors({
  origin: '*', // ყველა წყაროსგან დაშვებული, მაგრამ შეიძლება კონკრეტული URL-საც მიუთითოთ
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Multer-ის კონფიგურაცია ფაილების ატვირთვისთვის
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ატვირთული ფაილის ფოლდერის შექმნა, თუ არ არსებობს
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // ფოლდერის შექმნა
    }
    cb(null, uploadDir); // ფაილების ატვირთვა ამ ფოლდერში
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // უნიკალური სახელის მინიჭება
  }
});
const upload = multer({ storage });

// სერვერის მხარდაჭერა JSON ფორმატის მონაცემებისთვის
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ატვირთული პოსტების შენახვა JSON ფაილში
const postsFile = 'posts.json';

// ატვირთვის ფუნქცია
app.post('/upload', upload.single('image'), (req, res) => {
  const post = {
    title: req.body.title,
    content: req.body.content,
    image: req.file ? req.file.filename : null,
  };

  // პოსტების კითხვა და დამატება
  fs.readFile(postsFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading posts file');
    }
    const posts = data ? JSON.parse(data) : [];
    posts.push(post);

    // პოსტების ჩაწერა ფაილში
    fs.writeFile(postsFile, JSON.stringify(posts, null, 2), err => {
      if (err) {
        return res.status(500).send('Error saving post');
      }
      res.send('Post uploaded successfully');
    });
  });
});

// პოსტების ჩვენება
app.get('/posts', (req, res) => {
  fs.readFile(postsFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading posts');
    }
    const posts = data ? JSON.parse(data) : [];
    res.json(posts);
  });
});

// სერვერის გაშვება
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});