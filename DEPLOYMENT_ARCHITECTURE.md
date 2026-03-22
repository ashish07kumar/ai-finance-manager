# Production Deployment Architecture

## Recommended Stack

- Frontend: Vercel (React/Vite)
- Backend API: Render Web Service (or AWS ECS/Fargate)
- Workers: Separate Render Worker Service (or ECS worker service)
- Database: MongoDB Atlas
- Cache + Queue: Redis Cloud
- Email: SMTP provider or SendGrid
- File Storage: Cloudinary

## Service Separation

- API service runs `npm start`
- Worker service runs `npm run worker`
- Both services point to the same MongoDB Atlas and Redis Cloud instances

## Environment Variables

### Shared (API + Worker)

- `NODE_ENV=production`
- `MONGO_URI=<atlas-uri>`
- `REDIS_URL=<redis-cloud-uri>`
- `JWT_SECRET=<secret>`
- `JWT_ACCESS_SECRET=<secret>`
- `JWT_REFRESH_SECRET=<secret>`
- `CLIENT_URL=<vercel-domain>`
- `CLOUDINARY_CLOUD_NAME=<name>`
- `CLOUDINARY_API_KEY=<key>`
- `CLOUDINARY_API_SECRET=<secret>`
- `SMTP_HOST=<host>`
- `SMTP_PORT=<port>`
- `SMTP_USER=<user>`
- `SMTP_PASS=<pass>`
- `EMAIL_FROM=<from-email>`

## Scaling Notes

- Scale API horizontally based on request rate.
- Scale workers independently based on queue depth.
- Use Redis monitoring to tune worker concurrency and retry policies.
- Keep cron scheduling enabled only on one API instance or shift scheduling to a dedicated scheduler service.
