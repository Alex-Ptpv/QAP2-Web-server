const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('3607435865114665999d9ffdbe7b643d');

// Create a folder for log files (if it doesn't exist)
const logFolder = path.join(__dirname, 'logs');
fs.mkdirSync(logFolder, { recursive: true });

// Function to format the current date (e.g., '2023-10-10')
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const server = http.createServer((req, res) => {
  const { url } = req;
  const requestUrl = url;

  // Define the base path to the 'views' folder
  const basePath = path.join(__dirname, 'views');

  // Check if the request is for the "news" page
  if (url === '/news.html') {
    // Fetch news from the NewsAPI
    newsapi.v2.topHeadlines({
      country: 'ca'
    })
      .then(response => {
        const articles = response.articles;
        let newsHtml = '';
        articles.forEach(article => {
          newsHtml += `<h2>${article.title}</h2>`;
          newsHtml += `<p>${article.description}</p>`;
          newsHtml += `<a href="${article.url}" target="_blank">Read more</a>`;
        });

        // Create a simple news page HTML
        const newsPage = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>News</title>
          </head>
          <body>
            <nav><a href="/index.html">Go to Home page</a><br>
            <a href="/about.html">Go to About</a><br>
            <a href="/contact.html">Go to Contact</a><br>
            <a href="/subscribe.html">Go to Subscribe</a><br></nav>
            <h1>Latest News</h1>
            <div id="news-container">${newsHtml}</div>
          </body>
          </html>
        `;

        // Set the response headers with content type
        res.writeHead(200, { 'Content-Type': 'text/html' });

        // Write the news page HTML to the response
        res.write(newsPage);

        // Finish the response to send the data to the client
        res.end();
      })
      .catch(error => {
        console.error('Error fetching news:', error);
        // Handle the error, e.g., send an error response to the client
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error fetching news');
      });
  } else {
    // Handle other routes as before
    const pagePath = url === '/' ? '/index.html' : url;
    const filePath = path.join(basePath, pagePath);

    if (fs.existsSync(filePath)) {
      // Read the HTML content from the file
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        } else {
          // Set the response headers with content type
          res.writeHead(200, { 'Content-Type': 'text/html' });

          // Write the HTML content to the response
          res.write(data);

          // Finish the response to send the data to the client
          res.end();
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
