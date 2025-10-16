# Shared Meal Manager

A web application to manage shared meal expenses, helping you easily track finances for your group, mess, or household.

This application provides a secure, private space for each registered user to manage their own group's finances. Data is not shared between users, ensuring that your group's information remains confidential.

## Key Features

- **Secure User Authentication**: Sign up, log in, and reset your password securely. Each user's data is isolated and protected.
- **Member Management**: Easily add and manage members of your meal-sharing group.
- **Expense Tracking**: Log individual grocery purchases with details like item name, price, date, and purchaser.
- **Deposit Management**: Record deposits made by members to the shared fund.
- **Bulk CSV Import**: Quickly add multiple expenses at once by uploading a CSV file with `date`, `item`, `price`, and `purchased by` headers.
- **Dynamic Data Filtering**: Filter all financial records by date range, expense amount, or the member who made the purchase.
- **Comprehensive Summaries**:
    - **Main Balance Summary**: Get an at-a-glance overview of total expenses, deposits, and the final balance for each member.
    - **Individual Accounts**: View a detailed breakdown of all purchases made by each member.
- **Export to CSV**: Download the main balance summary as a CSV file for your records or for sharing.
- **Admin Customization**: An admin user can customize the application's title, description, and logo via the settings page.

## How to Use

1.  **Sign Up**: Create a new account using your email address. A simple math problem is used for verification to prevent bots.
2.  **Add Members**: Navigate to the **Member & Deposit Management** section on your dashboard. Use the "Add New Member" form to add everyone in your group.
3.  **Log Expenses**: In the **Total Grocery Bill** section, click "Add Expense" to log individual purchases. You can also use the **Import CSV** button for bulk entries.
4.  **Log Deposits**: In the **Member & Deposit Management** section, find the member in the "Current Members" list and click "Add Deposit" to record their contribution.
5.  **Analyze Balances**:
    - Use the **Main Balance Summary** to see who owes money and who is owed.
    - Check the **Individual Accounts** tables to see a detailed list of who bought what.
6.  **Filter and Export**: Use the filter controls at the top of the dashboard to view data for a specific period. When you're ready, click **Download CSV** in the Main Balance Summary to export the data.

## For Administrators

An administrator account (e.g., `aimctgbd@gmail.com`) has special privileges:
- Navigate to the **Settings** page by clicking the button in the header.
- In the "Site Management (Admin)" panel, you can:
    - Change the **Site Title** that appears in the browser tab.
    - Update the **Site Description** for search engines.
    - Upload a new **Site Logo**.

## Technical Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **Backend & Database**: Firebase (Authentication, Firestore, Cloud Storage)
-   **Deployment**: This application is designed to be deployed as a static web app.

---

*This application was built to simplify shared expense tracking, making financial management transparent and hassle-free.*
