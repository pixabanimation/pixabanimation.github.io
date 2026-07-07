# Admin Panel

Accessible at `#/admin`. Requires admin account (`is_admin: true`)

## Dashboard

- **Stats cards** — Revenue, orders, products, users with growth indicators
- **Sales chart** — 7-day bar chart
- **Orders by status** — Pie chart legend
- **Top products** — Table of best-selling products
- **Recent orders** — Latest order list

## Products Management

- **Product table** — ID, product (image + name), category, type (physical/digital/video), price, stock, rating, featured toggle, actions
- **Add/Edit product form** with fields:
  - Name, slug (auto-generated from name)
  - Product type selector (physical, digital, video)
  - Description, price, compare price, stock
  - Category dropdown
  - Image URL with media library browser
  - Conditional: Video fields (video URL, preview URL, preview description, file size, duration) — only shown when type is "video"
  - Featured toggle
- **Featured toggle** — Click to toggle
- **Delete** — Confirmation modal before deletion

## Categories Management

- **Category table** — ID, image, name, slug, description, product count, actions
- **Add/Edit form** — Name, slug, description, image URL with media library browser
- **Delete** — Unlinks products (does not delete them)

## Orders Management

- **Orders table** — Order #, date, customer, items count, total, payment method, transaction ID (truncated), status badge, actions
- **Filter** — By status (pending, confirmed, delivered, cancelled)
- **Pending Transactions** — Filter to show only unapproved transactions
- **Order detail modal** — Full order info, items, payment details
- **Approve transaction** — Mark transaction as verified
- **Reject transaction** — Mark as cancelled
- **Send download link** — For digital/video products, input URL and send to customer
- **Cancel order**

## Users Management

- **Users table** — ID, avatar, name, email, additional email, phone, role (admin/user), joined date, actions
- **Add/Edit user form** — Name, email, phone, additional email, avatar URL, admin toggle
- **Self-edit awareness** — Shows warning when editing own account
- **Self-delete prevention** — Cannot delete own account
- **Delete** — Unlinks related records

## Coupons Management

- **Coupons table** — Code, discount %, min purchase, usage (current/max), expiration, status (active/expired/used_up)
- Read-only display (seed data only)

## Media Library (`AdminMedia`)

- **Upload** — Drag-and-drop or click to browse, Cloudinary unsigned upload
- **Filter** — All / Images / Videos
- **Media grid** — Thumbnails with video player for videos
- **Actions** — Copy URL, use as image/video URL, delete
- **Auto-configure** — Cloudinary config hardcoded for deployment

## Newsletter Subscribers

- **Subscribers table** — ID, email, name, active status, subscribed date, delete action
- **Delete subscriber**

## Reviews Management

- **Reviews table** — ID, product, author, rating stars, comment (truncated), date, delete action
- **Delete review** — Confirmation modal

## Messages (Inbox)

- **Messages table** — ID, from (name + email), subject, message preview, status (new/replied/read), reply preview, date, actions
- **View & Reply** — Modal with full message + reply textarea
- **Mark as read** — Auto-marked when opened
- **Delete message**

## Settings (`AdminSettings`)

- **Profile Picture** — URL input with Media Library browser
- **Account Information** — Name, email, additional email, phone
- **Change Password** — Current, new, confirm
- **Security Question** — Dropdown with answer + optional recovery email
- **Danger Zone** — Sign out button
