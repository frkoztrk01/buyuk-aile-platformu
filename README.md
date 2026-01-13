This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, set up your environment variables. Copy `.env.example` to `.env.local` and fill in your configuration:

```bash
cp .env.example .env.local
```

### Required Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `AWS_REGION`: AWS region (e.g., `us-east-1`)
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
- `AWS_S3_BUCKET_NAME`: Your S3 bucket name

### AWS S3 Setup

1. Create an S3 bucket in your AWS account
2. Configure bucket permissions to allow public read access for uploaded files
3. Set up IAM user with S3 upload permissions
4. Add the credentials to your `.env.local` file

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- File uploads to AWS S3 (PDFs and images)
- Admin panel for content management
- PostgreSQL database with Drizzle ORM

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
