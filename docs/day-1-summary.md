# Day 1 Summary — URL Shortener

## What We Did Today
today i build the foundation of url shortner using node.js, Express.js, MongoDB

## Project Structure
URL-SHORTNER
    backend
        config
            db.js
        controllers
            .gitkeep
            url.controller.js
        middkeware
        models
            Click.js
            Url.js
            User.js
        routes
            Url.routes.js
        utils
            genrateShortCode.js
        .env

        app.js
        server.js

### Why Separate Files?
<!-- Explain why we don't put everything in one file -->
to improve readability of code 
debugging will be easy in seprate files
good for scalability



### File Roles
<!-- Explain what each file does in ONE line -->
- .env → stores environment variables like database URI and port
- config/db.js → connect server to db
- app.js → create the express app
- server.js → start server 
- models/User.js → User schema in DB
- models/Url.js → Url schema and maintaine connection b/w long url and shord code
- models/Click.js → tracks analytics for every link visit
- utils/generateShortCode.js → useable code to genrate 6 letter random code
- controllers/url.controller.js → contains logic for creating and redirecting URLs
- routes/url.routes.js → efines API endpoints 

## API Flow
### POST /api/urls (Shorten a URL)
<!-- Draw the step-by-step flow -->
<!-- Request comes in → what happens → what is returned -->
clinet -> urlRouter-> urlController -> validateUrl -> gerateShortCode -> Save { longUrl, shortCode } to MongoDB -> return shortcode

### GET /:shortCode (Redirect)
<!-- Draw the step-by-step flow -->
click on short URL -> exprss Router -> Controller Extract shord Code -> check coresponding long url in DB -> validate -> and redirect to LongUrl

## Database Design

### Why 3 Collections Instead of 1?
<!-- Explain in your own words -->
Using separate collections keeps the database organized and scalable.
if we dont sapreate db wil become messy

### Relationships
<!-- How are User, Url, Click connected? -->
User → creates many URLs

Url → belongs to a user

Click → belongs to a specific URL

## Key Concepts I Learned
<!-- List at least 5 concepts -->
1. project folder structure for backend systems
2. how to connect mondoDb with node.js
3. genrating random code
4. Building REST api
5. how url redirection works

## Mistakes I Made and What I Learned
<!-- Be honest. List the errors you hit -->
1. connecting mondoDB string i forgot to remove <> along password
2. using dotenv trying to import ...
3. require() always string require(express) not work, require("express") does
4. schema validation error
5. not doing url validation