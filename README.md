# 💊 Medbill – Smart Pharmacy Billing System

[![Team: Bill Wizards](https://img.shields.io/badge/Team-Bill%20Wizards-blueviolet)](#-about-the-team--bill-wizards)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Medbill** is a mobile-based pharmacy billing system designed to replace traditional manual processes and complex POS hardware with a fast, AI-powered solution. By leveraging QR scanning and machine learning, we turn raw transaction data into actionable business intelligence.

---

## 👨‍💻 Team: Bill Wizards
We are **Bill Wizards** because we transform traditional pharmacy billing into a fast, intelligent, and almost magical experience.

| Name | Enrollment ID |
| :--- | :--- |
| **Het Limbani** | 1AUA23BCS063 |
| **Shriman Dasadiya** | 1AUA23BCS174 |
| **Kaloliya Gaurav** | 1AUA24BCS906 |
| **Saiyam Shah** | 1AUA23BCS166 |

---

## 🚀 Project Overview
Medbill bridges the gap between healthcare and technology. It automates the checkout process, minimizes human error, and provides pharmacy owners with deep insights into their inventory and sales trends.

### ✨ Key Objectives
* **Automate Billing:** Rapid QR-based entry.
* **Accuracy:** Eliminate manual calculation errors.
* **AI Insights:** Use ML to predict demand and stock requirements.
* **Data-Driven Decisions:** Transition from "guessing" to "knowing" based on analytics.

---

## 🧩 System Workflow
The following diagram illustrates the seamless transition from medicine scanning to AI-driven reporting:

```mermaid
flowchart TD
    A[Start] --> B[Shopkeeper opens Mobile App]
    B --> C{Scan Medicine QR Code?}
    
    C -- Yes --> D[Extract Medicine Details]
    D --> E[Fetch Price & Tax from DB]
    E --> F{Is Bill Completed?}
    
    F -- No --> C
    F -- Yes --> G[Generate Bill & Receipt]
    
    C -- No --> H[Manual Medicine Entry]
    H --> G
    
    G --> I[Payment Cash/Digital]
    I --> J[Store Transaction Data]
    J --> K[AI/ML Demand Analysis]
    K --> L[Insights to Shopkeeper]
    L --> M[End]