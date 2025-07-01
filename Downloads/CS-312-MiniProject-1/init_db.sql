DROP TABLE IF EXISTS blogs;

CREATE TABLE blogs (
  blog_id SERIAL PRIMARY KEY,
  creator_name VARCHAR(255),
  creator_user_id VARCHAR(255),
  title VARCHAR(255),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
