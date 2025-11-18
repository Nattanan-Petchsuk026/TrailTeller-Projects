
# TrailTeller 

TrailTeller is an AI-powered mobile prototype that helps users create  personalized travel itineraries. Built for MFU Software Engineering Case 
Study, this app focuses on demonstrating AI workflow and mobile UX  without backend deployment.
TrailTeller is a **mobile travel-planning prototype** built with **React Native** and powered by **LLM + LangChain**.
It demonstrates an intelligent workflow for creating personalized itineraries, including destination recommendations, daily plans, budget estimates, and browsing flight/hotel suggestions.

This prototype is developed for **SW Case Study (Mae Fah Luang University)** and does **not** include deployed backend services or a production database.

---

## Features

 

### Travel Planning Interface

* Trip setup: budget, dates, travelers, interests
* AI-recommended destination
* View hotel, flight, and restaurant suggestions
* Editable day-by-day itinerary

### Prototype Data Handling

* Uses **mock JSON** for flights, hotels, and activities
* Partial, experimental use of **RapidAPI**
* No backend API or cloud database

### Basic Local Authentication

* Simple login / register
* Stored using **AsyncStorage**
* No JWT / OAuth (prototype only)

---

## Tech Stack

| Layer         | Technology               | Purpose                                                          |
|---------------|--------------------------|------------------------------------------------------------------|
| Backend       | **Node.js + Express/Nest.js** | Planned backend architecture for future expansion; suitable for I/O-heavy API operations (not implemented in this prototype) |
| Frontend      | **React Native (Expo)**       | Cross-platform mobile UI for Android/iOS                         |
| AI Engine     | **LLM API + LangChain**       | AI itinerary & recommendation generation                          |
| Data Layer    | **Mock JSON + RapidAPI**      | Simulated travel data (flights/hotels/activities)                 |
| Local Storage | **AsyncStorage**              | Stores trips, preferences, and user data locally on device       |
| State Mgmt    | **React Hooks**               | Lightweight state and logic handling                              |


> **Note:**
> Backend components (Node.js, PostgreSQL, Redis, Stripe, Microservices) mentioned in the Final Report are **target architecture for future expansion**, **not implemented** in this prototype.

---

## Installation

### 1. Clone Repository

```sh
git clone https://github.com/Nattanan-Petchsuk026/TrailTeller-Projects.git
cd TrailTeller-Projects
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Run the App

**Android Emulator / Device:**

```sh
npm run android
```

**iOS (macOS only):**

```sh
npm run ios
```

**Start with Expo:**

```sh
npm start
```

Scan QR code to open the app.

---

## External APIs (Prototype)

The prototype integrates partially with:

* Skyscanner API
* Amadeus API
* Booking.com API
* RapidAPI Travel Endpoints

Used only for *demonstration*:

✔ Sample / mock data
✔ Testing the UI flow
✘ No real-time pricing
✘ No real booking flow

---

## How the AI Works

TrailTeller uses **LLM + LangChain**:

1. User inputs:

   * Budget
   * Dates & duration
   * Number of travelers
   * Interests & travel style

2. LangChain builds structured prompts

3. The LLM generates:

   * Destination recommendation
   * Daily itinerary
   * Hotels, restaurants, and activities

4. App displays formatted results

Example files:

```
ai/promptTemplate.js
ai/itineraryChain.js
ai/formatter.js
```

---

## Environment Variables

Create a `.env` file:

```
LLM_API_KEY=your_llm_key
RAPIDAPI_KEY=your_rapidapi_key
```

If missing, the app falls back to **mock data**.

---

##  Notes for Instructors / Reviewers

* This is an **academic prototype** for **SW Case Study, MFU**
* Core development focuses on:

  * AI itinerary generation
  * UI/UX mobile flow
  * Prototype-level travel data
* Backend architecture is planned but **not implemented**
* All trip data is stored locally using AsyncStorage

---

##  Useful Links

**Figma Prototype:**
[https://www.figma.com/design/Y4nRacs4hpnDgKaIFihhBX/Trailteller?node-id=0-1](https://www.figma.com/design/Y4nRacs4hpnDgKaIFihhBX/Trailteller?node-id=0-1)

**Repository:**
[https://github.com/Nattanan-Petchsuk026/TrailTeller-Projects](https://github.com/Nattanan-Petchsuk026/TrailTeller-Projects)

 **Final Project Report:**
Available via LMS submission



