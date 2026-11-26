(Activity 8 Reflection)
1. What was the most challenging part of building this boilerplate? How did you overcome it?
The hardest part was connecting all the different layers together (routes, controllers, services, database, and error handling) and making sure the local server ran smoothly without port conflicts. I overcame it by organizing each feature into its own clean folder, testing each endpoint one by one in EchoAPI, and checking the terminal logs and open ports whenever a request failed.  

2. How does this boilerplate differ from your Midterm project? What specific improvements did you make?
In a basic Midterm CRUD project, most of the logic is often mixed together inside routes or controllers. In this boilerplate, I separated the code into clear layers (routes, controllers, services, and entities) and added real-world tools like Joi validation, a global error handler, Winston logging, and database migrations.  

3. Why is centralized error handling better than try-catch in every controller?
Writing try-catch in every controller repeats the same code over and over and makes it easy to forget error checks. Using an asyncHandler wrapper with one central errorHandler sends all errors to a single place, keeping controllers short and ensuring the API always sends back the same clean JSON error format.   

4. How does request validation with Joi improve security and code quality?
Joi checks incoming data (like emails, names, and passwords) before it ever reaches the controller or database. This improves security by blocking bad or malicious input early, and it improves code quality because the controller and service don't have to be cluttered with manual if/else checks.  

5. What's the difference between synchronize: true and migrations? Why are migrations essential for production?
synchronize: true tells TypeORM to automatically change your database tables every time you edit your code, while migrations are saved step-by-step scripts that update the database only when you run them. Migrations are essential in production because synchronize: true can accidentally drop columns or delete real user data, whereas migrations let you update tables safely and undo changes (migration:revert) if something goes wrong.   

6. How does structured logging (Winston) help in production debugging compared to console.log?
console.log only prints plain text to the screen and disappears if the server restarts. Winston saves logs in a structured JSON format with timestamps and severity levels (like info and error), making it much easier to search, filter, and track down bugs after an error happens in production.   

7. If you had to add a new feature (e.g., Product CRUD), how would you use this boilerplate? What would you need to add?
I would follow the exact same folder structure used for the User feature. Specifically, I would add:   A Product entity (database table model) and generate a migration for it.   A Joi validation schema for creating/updating products.   A productService for the database logic.A productController to handle requests and responses.A productRoutes file and register /api/products in src/index.ts.

8. What additional features would you add to make this boilerplate even more production-ready?
To make it even safer and ready for real users, I would add:   Authentication and Authorization (like JWT login and role checks) so only authorized users can edit or delete data.Rate limiting and Helmet to protect the API from spam requests and common web attacks.Automated tests (unit and integration tests) to verify endpoints automatically before deploying updates.#



(Activity 9 Reflection)
Authentication and Authorization – Answers
1. What is the difference between authentication and authorization? Give a real-world example of each.

Authentication is the process of verifying a user's identity. It checks whether the person logging in is really who they claim to be. For example, when logging in to a Facebook account using an email and password, the system checks if the credentials are correct.

Authorization determines what an authenticated user is allowed to access or do. For example, a regular employee can view their own records, while an administrator can manage employee information. In short, authentication verifies identity, while authorization controls access.

2. Why is JWT considered "stateless" and how does that benefit scalability?

JWT is considered stateless because the server does not need to store a separate session for every logged-in user. Instead, the token contains the necessary user information, which the server can verify using a secret key.

This benefits scalability because multiple servers can verify the same token without sharing session information. It makes the application easier to manage when the number of users increases.

3. What are the three parts of a JWT token and what does each part do?

A JWT token has three parts:
- Header: Contains information about the token type and the signing algorithm used.
- Payload: Contains information about the user, such as their ID, email, and role.
- Signature: Verifies that the token is valid and has not been modified.
These three parts work together to help the server verify the user's identity and protect the token from unauthorized changes.

4. Why should you never put sensitive data (like passwords) in the JWT payload?

We should never put passwords or other sensitive information in the JWT payload because it is encoded but not encrypted by default. Anyone who gets the token can decode and read its contents.

For example, if a password is included in the payload, an attacker who steals the token could see that information. It is better to include only necessary information, such as the user ID and email.

5. How does bcrypt protect user passwords? What is the purpose of the "salt" and "rounds"?

Bcrypt protects passwords by converting them into a secure hash before storing them in the database. It uses a one-way hashing process, meaning the original password cannot simply be recovered from the hash.

The salt is a random value added during hashing to make identical passwords produce different hashes. The rounds determine how much processing is needed to create the hash. More rounds make password guessing more difficult because hashing takes longer.

6. What happens if someone steals a JWT token? How can you mitigate this risk?

If someone steals a JWT token, they may be able to access the user's account and protected resources while the token is still valid. The server may recognize the stolen token as a legitimate authentication credential.

We can reduce this risk by using HTTPS, setting short expiration times, storing tokens securely, and implementing refresh token rotation and revocation. We should also avoid exposing tokens in URLs or application logs.

7. Why is it important to use HTTPS when transmitting JWT tokens?

HTTPS is important because it encrypts the communication between the client and the server. Without HTTPS, attackers may intercept network traffic and steal JWT tokens.

If an attacker gets a valid token, they could use it to access protected resources. Using HTTPS helps protect tokens and other sensitive information during transmission.

8. What is the difference between a short-lived access token and a long-lived refresh token? When would you use each?

An access token is used to access protected API endpoints and usually has a short expiration time. A refresh token has a longer expiration time and is used to request a new access token when the previous one expires.

For example, an access token might be valid for 15 minutes, while a refresh token might be valid for 7 days. We use access tokens for normal API requests and refresh tokens to keep users logged in without requiring them to enter their passwords repeatedly.

9. How does the auth middleware know which user is making the request?

The authentication middleware identifies the user by reading the JWT from the Authorization header of an HTTP request.

First, it extracts the token and verifies it using the JWT secret key. If the token is valid, the middleware decodes the payload to get the user's information, such as their user ID and email. It can then attach this information to the request object using req.user.

In our backend, the user ID can also be used to find the corresponding user in the database. This allows the application to identify who is making the request.

10. If you had to implement role-based authorization (e.g., admin vs. regular user), how would you modify your current setup?

I would implement role-based authorization by adding a role field to the User entity, with values such as admin and user. I would then create an authorization middleware that checks the user's role before allowing access to specific routes.

For example, only users with the admin role would be allowed to access administrative endpoints, while regular users would only access normal user features. If a user does not have the required permission, the system would return a 403 Forbidden response.

This would improve our current backend by making sure that users can only access the features and information allowed for their roles.




(Activity 10 Reflection) 
1. It confirms the user owns the email address, preventing unauthorized account signups with someone else's email, spam/bot registrations, and failed password-reset or notification delivery.

2. It responds with a generic success message regardless of whether the email exists, preventing attackers from discovering valid registered accounts.

3. A verification token proves email ownership at signup, while a reset token authorizes changing a password; reset tokens usually expire shorter because password-reset access is higher risk if intercepted.

4. crypto.randomBytes(32) uses a cryptographically secure pseudo-random generator with high entropy, whereas Math.random() and Date.now() are predictable and vulnerable to guessing.

5. Their account remains unverified (isVerified false) and AuthService.login blocks login with an UnauthorizedError asking them to verify their email first.

6. Clearing or invalidating tokens after use prevents replay attacks where a leaked, cached, or browser-history token could be reused again.

7. Email enumeration is probing login, registration, or forgot-password endpoints to see which emails exist; returning uniform responses/messages for non-existent and existing emails prevents leaking account existence.

8. Add a second factor (like TOTP via an authenticator app or one-time codes) checked after password verification before issuing the final auth token, along with recovery codes and device/session controls.

9. Ethereal is free and safe for local/dev testing without sending real emails, whereas SendGrid delivers to real inboxes with analytics and scale at a cost and requires domain/API setup.

10. Configure SPF, DKIM, and DMARC records, use a reputable sending domain/provider, keep email content clean and expected, and offer a resend-verification option.