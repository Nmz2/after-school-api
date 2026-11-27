# After School Group – CST3144 Full Stack Development Coursework

Student: Nnamdi Odogwu (M01087852)

## Vue.js App (front-end)
- GitHub repository: https://github.com/Nmz2/after-school-group
- GitHub Pages (live app): https://nmz2.github.io/after-school-group/

## Express.js App (back-end)
- GitHub repository: https://github.com/Nmz2/after-school-api
- Render route that returns all the lessons: https://m01087852-after-school.onrender.com/lessons

## Other routes
- `POST /orders` – save a new order
- `PUT /lessons/:id` – update any field of a lesson
- `GET /search?q=term` – search lessons by subject, location, price or spaces
- `GET /enrolment/:lessonid` – number of spaces bought for a lesson
- `GET /teachers` – list all teachers
- `GET /teachers/:id/lessons` – lessons taught by one teacher
- `GET /images/<file>` – lesson images (404 error message if the image does not exist)

Note: the Render server is on the free plan and may take about a minute to wake up on the first request.
