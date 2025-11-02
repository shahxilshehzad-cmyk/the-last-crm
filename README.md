# White Glove CRM - Deployment Guide

Congratulations on building your White Glove CRM application! This guide will walk you through the simple steps to deploy it to the web so you can access it from anywhere.

## Current Architecture

Your application is built using modern web technologies (React with JSX/TSX) but without a traditional build step (like Webpack or Vite). It uses `importmap` in `index.html` to load modules directly in the browser. This makes it very lightweight and easy to deploy on any static hosting service.

---

## Pre-Deployment Setup: Adding Your API Keys

Before you can deploy, you **must** add two separate Google API keys to the application.

### 1. Gemini API Key (for AI features)

This key enables the AI-powered address validation for the map feature.

*   **Get your Key:** Go to the **[Google AI Studio](https://aistudio.google.com/app/apikey)** to create and copy your API key. You may need to enable billing on your Google Cloud project.
*   **Update the Code:**
    *   Open the `App.tsx` file.
    *   Find the line: `const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';`
    *   **Replace** the placeholder with your actual Gemini API key.

### 2. Google Maps Platform API Key (for satellite view)

This key is required to display the Google Maps satellite imagery.

*   **Get your Key:**
    1.  Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
    2.  Select your project (or create a new one).
    3.  In the navigation menu, go to **APIs & Services > Library**.
    4.  Search for and **enable** the **"Maps Embed API"**.
    5.  Go to **APIs & Services > Credentials**.
    6.  Click **"+ CREATE CREDENTIALS"** and select **"API key"**.
    7.  Copy the generated key.
*   **Important (Security):** Click on your new key in the list and restrict it to the "Maps Embed API" to prevent unauthorized use.
*   **Update the Code:**
    *   In the `App.tsx` file, find the line: `const MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';`
    *   **Replace** the placeholder with your new Google Maps Platform API key.

---

## Deployment Instructions

You can host your CRM on any service that supports static websites. Here are a few popular and easy-to-use options:

### Option 1: Vercel (Recommended)

Vercel offers a fast, free, and incredibly simple way to deploy static sites.

1.  **Prepare your files:** Make sure all your application files (`index.html`, `index.tsx`, `README.md`, `metadata.json`, `types.ts`, `constants.ts`, and the `components` folder) are in a single project folder on your computer.
2.  **Sign up:** Create a free account at [vercel.com](https://vercel.com).
3.  **Deploy:**
    *   Go to your Vercel dashboard.
    *   Click "Add New..." -> "Project".
    *   Simply **drag and drop your project folder** onto the page.
    *   Vercel will automatically detect the project type.
    *   Click the **"Deploy"** button.
4.  **Done!** In about a minute, your CRM will be live on a public URL provided by Vercel.

### Option 2: Netlify

Netlify is another excellent, free option with a similar drag-and-drop deployment process.

1.  **Prepare your files:** Ensure all your project files are in one folder.
2.  **Sign up:** Create a free account at [netlify.com](https://netlify.com).
3.  **Deploy:**
    *   Log in to your Netlify account.
    *   Navigate to the "Sites" page.
    *   **Drag and drop your project folder** into the deployment area.
4.  **Done!** Netlify will build and deploy your site, providing you with a live URL.

---

After deploying with any of these methods, your White Glove CRM will be live and accessible from any device with an internet connection.