@echo off
cd /d "C:\Users\SamaaSenthil\OneDrive\Documents\GitHub\lawmate\Law_Mate-main"
echo === Setting Vercel env vars ===
echo mongodb+srv://Samaa:Samaa-12@cluster0.abcd1.mongodb.net/lawmate | vercel env add MONGO_URI production --force
echo lawmate_secret_key_2024 | vercel env add JWT_SECRET production --force
echo https://lawmate-wf6f.vercel.app | vercel env add REACT_APP_API_URL production --force
echo true | vercel env add DISABLE_ESLINT_PLUGIN production --force
echo false | vercel env add GENERATE_SOURCEMAP production --force
echo === Pushing to GitHub ===
git add -A
git commit -m "Deploy: final vercel config, api handler, env setup"
git push origin main
echo === DONE. Check https://lawmate-wf6f.vercel.app in ~2 minutes ===
pause
