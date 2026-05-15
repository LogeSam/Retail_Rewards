# Retail Rewards
A React JS application that calculates and displays customer reward points based on retail purchase transactions over a three-month period.
The application simulates asynchronous API calls, processes transaction-based reward calculations, and provides monthly as well as total reward summaries for each customer.

Reward Calculation Rules:
  2 points for every dollar spent over $100
  1 point for every dollar spent between $50 and $100

Example:
  A $120 purchase earns:
  2 × $20 = 40 points
  1 × $50 = 50 points
  Total = 90 reward points

Key Features:
  React JS with functional components and hooks
  Simulated async API data fetching
  Customer monthly and total reward calculations
  Dynamic sorting and pagination
  Responsive and reusable table components
  Loading skeletons and error handling
  Mock transaction dataset for multiple customers
  Unit testing with Jest
  Clean project structure and reusable utility functions
  No Redux or TypeScript used

This project focuses on clean architecture, maintainable code practices, reusable components, and optimized data processing while ensuring a smooth user experience.
