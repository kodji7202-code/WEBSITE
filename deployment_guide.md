# Ghid Deplasare (Safe Mode / Test Mode)

Acest ghid explică cum să pui site-ul online (live) astfel încât prietenii să îl poată accesa, dar păstrând plățile în **Test Mode** (fără bani reali).

## Partea 1: Backend (Supabase Edge Functions)

Funcțiile Edge (cele care procesează plata și download-ul securizat) trebuie să fie urcate pe serverele Supabase. Ele nu rulează pe Vercel.

1.  **Login în Supabase CLI** (dacă nu ești deja logat):
    ```bash
    npx supabase login
    ```

2.  **Deploy la Funcții**:
    Rulează această comandă pentru a urca funcțiile `checkout` și `secure-download` în proiectul tău Supabase:
    ```bash
    npx supabase functions deploy checkout
    npx supabase functions deploy secure-download
    ```
    *(Dacă te întreabă de "Project Reference", selectează proiectul asociat site-ului).*

3.  **Setare Secrete (Environment Variables)**:
    Funcțiile au nevoie de cheile Stripe pentru a funcționa în cloud.
    ```bash
    npx supabase secrets set STRIPE_SECRET_KEY=sk_test_... 
    ```
    *(Înlocuiește `sk_test_...` cu cheia ta secretă. O găsești în **Stripe Dashboard -> Developers -> API Keys -> Secret key**).*

---

## Partea 2: Frontend (Vercel)

Vercel este cea mai simplă metodă pentru a găzdui site-ul (React/Vite).

1.  **Pregătire Cod**:
    *   Asigură-te că tot codul este salvat și urcat pe GitHub (sau GitLab/Bitbucket).

2.  **Configurare Vercel**:
    *   Mergi pe [vercel.com](https://vercel.com) și fă-ți cont (poți intra cu GitHub).
    *   Apasă "Add New Project" -> Selectează repository-ul tău GitHub `sonicsphere-store`.
    *   Vercel va detecta automat că e un proiect Vite. **Nu schimba "Build Command" sau "Output Directory".**

3.  **Variabile de Mediu (Environment Variables)**:
    În ecranul de configurare Vercel, înainte de a apăsa "Deploy", caută secțiunea **"Environment Variables"**. Adaugă variabilele din fișierul tău `.env` local:

    | Nume | Valoare |
    | :--- | :--- |
    | `VITE_SUPABASE_URL` | `https://...supabase.co` (URL-ul tău din .env) |
    | `VITE_SUPABASE_ANON_KEY` | `eyJ...` (Cheia anonimă publică din .env) |
    | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (Cheia publică Stripe de test din .env) |

4.  **Deploy**:
    *   Apasă **"Deploy"**.
    *   Așteaptă 1-2 minute. Vercel va construi site-ul și îți va da un link (ex: `sonicsphere.vercel.app`).

## Verificare

1.  Intră pe link-ul generat de Vercel.
2.  Încearcă să cumperi un beat folosind datele de test Stripe:
    *   **Card**: `4242 4242 4242 4242`
    *   **Data**: Orice dată din viitor (ex: 12/30)
    *   **CVC**: 123
    *   **Zip**: 12345
3.  Dacă plata trece și primești link-ul de download, totul funcționează! 🎉

---

## FAQ: Cum urc site-ul pe GitHub?

**NU** urca un fișier `.zip`. Trebuie să urci fișierele de cod sursă.

1.  **Fă-ți cont pe GitHub** și creează un **New Repository** (gol).
2.  Deschide terminalul în folderul proiectului tău (`sonicsphere-store`) și rulează comenzile pe care ți le dă GitHub, de obicei:

    ```bash
    # Inițializează Git (dacă nu e deja)
    git init

    # Adaugă toate fișierele
    git add .

    # Salvează modificările
    git commit -m "First commit"

    # Schimbă ramura principală în 'main'
    git branch -M main

    # Conectează la GitHub (înlocuiește URL-ul cu al tău!)
    git remote add origin https://github.com/USER_TAU/NUME_REPO.git

    # Trimite codul
    git push -u origin main
    ```
3.  După ce codul apare pe site-ul GitHub, Vercel îl va prelua automat (dacă ai făcut legătura la pasul "Frontend").
