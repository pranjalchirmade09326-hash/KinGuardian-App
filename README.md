# KinGuardian AI 🛡️
### AI-Native Cross-Border Elder Care & Telemetry Health Platform

**KinGuardian AI** is an AI-assisted cross-border elder care platform designed to support real-time health monitoring of aging parents in India, explain vital anomalies, automate family care workflows, and bridge the timezone gap for diaspora coordinators abroad.

The platform supports NRI family coordinators, elderly parents, local caregivers, and consulting clinicians through integrated wearable telemetry, AI clinical translation, automated WhatsApp care loops, and emergency triage workflows.

---

## ✨ Key Features

- **Dual Experience Architecture**: High-contrast, simplified single-tap interface for elderly parents in India alongside deep clinical analytics dashboards for diaspora coordinators abroad.
- **Wearable Telemetry Ingestion**: Real-time telemetry ingestion from smartwatches (Garmin, Apple Watch, Fitbit) and Bluetooth medical devices (Omron BP monitors, Accu-Chek glucose meters).
- **AI Clinical Translation**: Gemini-powered translation of raw telemetry, vital spikes, and lab documents into plain-English and regional summaries with actionable advice.
- **Direct WhatsApp Care Loops**: Automated daily digests, medication reminders, and vital spike alerts dispatched directly to WhatsApp family groups without forcing parents to learn complex apps.
- **Emergency & Anomaly Triage**: Multi-threshold vital spike detection with automated family escalations, SOS protocols, and local emergency coordination.
- **Document Vault & Clinical Notes**: Secure medical record storage, AI-assisted doctor visit preparation notes, and 1-click PDF clinical summaries formatted for physicians.
- **Patient Autonomy & Privacy**: Granular consent controls allowing parents to pause telemetry sharing at any time, backed by HIPAA-grade security standards.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React Native 0.81** | Cross-platform native mobile application engine |
| **Expo 54 & Expo Router 6** | File-based declarative routing & universal web/mobile build system |
| **TypeScript 5.9** | Strict type safety and robust interface contracts |
| **NativeWind & Tailwind CSS** | High-contrast elder-accessible design system & UI styling |
| **Google Gemini API (`@google/genai`)** | AI clinical telemetry analysis, document summaries & health concierge |
| **AsyncStorage** | Offline-first local session caching and persistent state management |
| **Zod & React Hook Form** | Runtime schema validation and form handling |
| **Jest & Testing Library** | Automated unit, component, and regression test suites |

---

## 🏗️ Architecture

The project follows a modular, offline-first universal architecture with separate role-tailored viewports (`(coordinator)` and `(parent)`), an intelligent authentication gateway, proactive telemetry ingestion adapters, and cross-platform communication bridges.

### Core Workflow:
```text
Wearable Sync ➔ Telemetry Ingestion ➔ AI Anomaly Detection ➔ WhatsApp Family Loop ➔ Clinical Action ➔ Resolution
```

1. **Wearable Ingestion**: Connects to smartwatches and health peripherals via Bluetooth and Health Connect adapters.
2. **Telemetry Evaluation**: Local rules and AI engines monitor heart rate, blood pressure, SPO2, steps, and sleep trends.
3. **Clinical Translation**: Converts clinical data into human-readable digests with clear action steps.
4. **WhatsApp Care Loops**: Generates and dispatches deep-links and notifications directly to family WhatsApp groups.
5. **Emergency Escalation**: Immediate SOS protocol dispatch to diaspora coordinators and local caregivers upon critical spike detection.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **Git**

### Installation

```bash
# Clone the repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd KinGuardian

# Install dependencies
npm install --legacy-peer-deps

# Configure environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Run type check and verify integrity
npm run tsc

# Start the local development server (Web & Mobile Metro)
npm run web
```

### Access the Application

- **Web Portal (Default)**: [http://localhost:3000/](http://localhost:3000/)
- **Landing & Marketing Page**: [http://localhost:3000/(auth)/landing](http://localhost:3000/(auth)/landing)
- **Sign-In Flow**: [http://localhost:3000/(auth)/sign-in](http://localhost:3000/(auth)/sign-in)
- **Sign-Up Flow**: [http://localhost:3000/(auth)/sign-up](http://localhost:3000/(auth)/sign-up)

> **💡 Quick Demo Accounts (Pre-Seeded):**
> - **Care Coordinator (London)**: `anjali@kinguardian.com` | `password123`
> - **Elderly Parent (Chennai)**: `ramesh@kinguardian.com` | `password123`

---

## 🧪 Testing

```bash
# Run all automated unit and integration tests
npm test

# Run targeted authentication and WhatsApp tests
npx jest __tests__/auth.test.ts __tests__/whatsapp.test.ts

# Run static TypeScript type verification
npm run tsc

# Run code linter
npm run lint
```

---

## 🔐 Clinical Safety & Privacy

- **Clinical Decision Support**: KinGuardian AI is designed as a preventive care coordination and communication aid, not an autonomous diagnostic medical device.
- **Vital Risk Stratification**: Automated anomaly alerts represent statistical metric spikes and trends, not definitive clinical diagnoses.
- **Human-in-the-Loop**: All clinical decisions, medication changes, and emergency interventions require direct verification by licensed physicians or caregivers.
- **Parent Consent Autonomy**: Parents hold unconditional authority over their health telemetry and can pause data streaming with a single tap.
- **Data Protection**: Personal health identifiers (PHI) are encrypted at rest and in transit with 256-bit encryption.

---

## 📂 Project Structure

```text
KinGuardian/
├── app/                        # Expo Router file-based pages & routes
│   ├── (auth)/                 # Public auth flows: Landing, Sign-In, Sign-Up
│   ├── (coordinator)/          # Diaspora coordinator analytics, chat & records
│   ├── (parent)/               # Simplified elder-friendly check-in & device UI
│   ├── _layout.tsx             # Root layout with global providers
│   └── index.tsx               # Auth gateway routing visitors to landing or dashboard
├── src/                        # Core application source code
│   ├── components/             # Reusable UI widgets, Modals & Wearable sheets
│   │   ├── ui/                 # Buttons, Badges, Cards & WhatsAppButton
│   │   └── wearables/          # Wearable connection & sync status cards
│   ├── hooks/                  # Custom React hooks (useAuth, useAI, useFamily)
│   ├── services/               # Telemetry, Wearable adapters, API & Gemini AIService
│   ├── store/                  # Global state (AuthProvider, AuthContext, AppContext)
│   ├── types/                  # TypeScript interface contracts (auth, health, user)
│   └── utils/                  # WhatsApp deep-link generators, timezone & validation
├── __tests__/                  # Automated Jest unit, integration & regression tests
├── tailwind.config.js          # NativeWind Tailwind CSS design token configuration
├── metro.config.js             # Metro Bundler asset & style configuration
└── package.json                # Project dependencies and npm execution scripts
```

---

## 📜 Open-Source Attribution

Third-party libraries, SDKs, and icons used in KinGuardian:
- **Expo & React Native**: Open-source framework under the MIT License.
- **Lucide Icons**: Beautiful & consistent iconography under the ISC License.
- **NativeWind & Tailwind CSS**: Utility-first styling engine under the MIT License.
- **Google Gen AI SDK**: Official Google Gemini model client under the Apache-2.0 License.

---

## ⚠️ Disclaimer

This project is intended for elder care assistance, wellness tracking, family coordination, and demonstration purposes. It is not a substitute for professional medical advice, clinical diagnosis, or emergency dispatch services. In life-threatening emergencies, always dial your local emergency services (112 in India / 999 in UK / 911 in US) immediately.

---

**Project**: KinGuardian AI • **Focus**: Cross-Border Elder Care • Wearable Telemetry • AI Clinical Translation • WhatsApp Loops
