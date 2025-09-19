import express from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all books
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM books ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// Get books for logged-in counselor
router.get("/my-books", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM books WHERE counselor_id = $1 ORDER BY created_at DESC",
      [req.user.counselorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching counselor books:", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// Add new book
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, author, price_cents, pickup_station } = req.body;
    
    console.log("Creating book:", { title, author, price_cents, pickup_station, counselorId: req.user.counselorId });
    
    const result = await pool.query(
      `INSERT INTO books (counselor_id, title, author, price_cents, pickup_station) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.counselorId, title, author, price_cents, pickup_station]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating book:", err);
    res.status(500).json({ error: "Failed to add book: " + err.message });
  }
});

// Update book
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, author, price_cents, pickup_station } = req.body;
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE books 
       SET title = $1, author = $2, price_cents = $3, pickup_station = $4 
       WHERE id = $5 AND counselor_id = $6 RETURNING *`,
      [title, author, price_cents, pickup_station, id, req.user.counselorId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating book:", err);
    res.status(500).json({ error: "Failed to update book" });
  }
});

// Delete book
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      "DELETE FROM books WHERE id = $1 AND counselor_id = $2 RETURNING id",
      [id, req.user.counselorId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    
    res.json({ success: true, message: "Book deleted successfully" });
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

export default router;