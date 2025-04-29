**AI-Powered Travel Booking Website**

## Overview

This project is a full-stack web application designed to simplify the travel booking process through the integration of modern web technologies and AI functionality. Developed using Node.js, Express, and CouchDB, the system enables users to explore travel destinations, book trips, interact with an AI-based chatbot, and receive booking confirmations in real-time. It also features an administrative panel for backend management.

## Features

- **User Authentication**  
  Secure login and registration for users and administrators using session-based authentication.

- **Travel Booking System**  
  Users can browse travel destinations, check vehicle availability, and make bookings.

- **Admin Dashboard**  
  Provides tools for administrators to manage user data, destinations, bookings, and monitor platform activity.

- **AI Chatbot Integration**  
  The chatbot assists users with trip planning, answering queries, and recommending destinations.

- **Real-Time Email Notifications**  
  Automated emails are sent to users for booking confirmations and contact form responses through EmailJS.

- **Booking Confirmation PDF**  
  Upon successful booking, a confirmation PDF is automatically generated and downloaded.

- **Contact Form Support**  
  Users can submit issues or inquiries, which are sent directly to the admin via email.

- **Responsive UI**  
  Built using HTML, CSS, and JavaScript for an optimized experience across all devices.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **Database:** CouchDB  
- **AI Module:** Custom-trained logic or integration with AI APIs  
- **Email Integration:** EmailJS  
- **PDF Generation:** jsPDF or equivalent  
- **Development Tools:** Visual Studio Code, Postman

## Installation & Setup

### Prerequisites

- Node.js and npm installed  
- CouchDB installed and running  
- Visual Studio Code or another IDE

Install project dependencies:
npm install

Start CouchDB and configure the necessary databases (e.g., users, bookings, destinations).

Configure environment settings as required (e.g., EmailJS credentials and CouchDB connection strings).

Start the application:
Copy code
node app.js
