# Deployment Guide

This guide explains how to deploy the TutorAI application to Vercel.

## Prerequisites

- A Vercel account
- Node.js and npm installed
- Git installed

## Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy the Application

You can deploy the application using our deployment script:

```bash
./deploy.sh
```

Or manually with these steps:

```bash
# Build the frontend
npm run build

# Deploy to Vercel
vercel --prod
```

### 4. Environment Variables

Make sure to set the following environment variables in your Vercel project settings:

- `OPENAI_API_KEY`: Your OpenAI API key
- `VITE_SUPABASE_URL`: Your Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_API_URL`: Set to `/api` for production

### 5. Vercel Configuration

The project includes a `vercel.json` file that configures:
- Build commands
- Output directory
- API routes
- Serverless functions

## Project Structure

- `src/`: Frontend code (React/Vite)
- `api/`: Serverless functions for backend
- `dist/`: Built frontend code (generated)

## Troubleshooting

If you encounter issues with the deployment:

1. Check the Vercel deployment logs
2. Verify that all environment variables are set correctly
3. Make sure the API endpoints are configured correctly in the frontend code

## Local Development

To run the project locally:

```bash
# Install dependencies
npm install

# Run the frontend
npm run dev

# Run the backend (in a separate terminal)
cd backend
python main.py
``` 