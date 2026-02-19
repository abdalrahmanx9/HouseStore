# Google OAuth 2.0 Setup Guide

Follow these steps to generate the `Client ID` and `Client Secret` needed for "Sign in with Google".

## Step 1: Create a Project
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Click on the project dropdown (top left) and select **"New Project"**.
3.  Name it (e.g., `StoreWeb`) and click **Create**.

## Step 2: Configure Consent Screen
1.  In the left sidebar, go to **APIs & Services** > **OAuth consent screen**.
2.  Select **External** (unless you have a Google Workspace organization) and click **Create**.
3.  **App Information:**
    *   **App name:** StoreWeb
    *   **User support email:** Your email.
    *   **Developer contact information:** Your email.
4.  Click **Save and Continue** through the "Scopes" section (default scopes `email`, `profile`, `openid` are fine for now).
5.  **Test Users:** Add your own email addresses to test the login before publishing.

## Step 3: Create Credentials
1.  Go to **APIs & Services** > **Credentials**.
2.  Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
3.  **Application type:** Select **Web application**.
4.  **Name:** `StoreWeb Frontend`.
5.  **Authorized JavaScript origins:**
    *   `http://localhost:5173` (For local React development)
    *   `http://127.0.0.1:5173`
6.  **Authorized redirect URIs:**
    *   `http://127.0.0.1:8000/api/v1/auth/callback/google` (FastAPI Callback)
    *   `http://localhost:8000/api/v1/auth/callback/google`
7.  Click **Create**.

## Step 4: Get Keys
1.  Copy the **Client ID** and **Client Secret**.
2.  Paste them into your `backend/.env` file:
    ```env
    GOOGLE_CLIENT_ID=your_client_id_here
    GOOGLE_CLIENT_SECRET=your_client_secret_here
    ```
