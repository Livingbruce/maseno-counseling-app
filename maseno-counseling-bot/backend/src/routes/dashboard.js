import express from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Appointments routes
router.get("/appointments", async (req, res) => {
  try {
    console.log("Fetching appointments for counselor ID:", req.counselor.id);
    
  const result = await pool.query(
      `SELECT a.*, s.name as student_name, s.admission_no, s.phone, s.year_of_study as year
       FROM appointments a
       LEFT JOIN students s ON a.student_id = s.id
       WHERE a.counselor_id = $1
       ORDER BY a.start_ts DESC`,
      [req.counselor.id]
    );
    
    console.log("Appointments fetched:", result.rows.length);
    console.log("Appointments data:", result.rows.map(a => ({
      id: a.id,
      start_ts: a.start_ts,
      end_ts: a.end_ts,
      status: a.status,
      student_name: a.student_name
    })));
    
  res.json(result.rows);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

router.post("/appointments/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE appointments SET status = 'cancelled' WHERE id = $1 AND counselor_id = $2 RETURNING *",
      [id, req.counselor.id] // Changed from req.counselor.id
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

// Delete cancelled appointment permanently
router.delete("/appointments/:id/delete", async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if the appointment exists and is cancelled
    const checkResult = await pool.query(
      "SELECT id, status FROM appointments WHERE id = $1 AND counselor_id = $2",
      [id, req.counselor.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    if (checkResult.rows[0].status !== 'cancelled') {
      return res.status(400).json({ error: "Only cancelled appointments can be deleted" });
    }
    
    // Delete the appointment permanently
    const result = await pool.query(
      "DELETE FROM appointments WHERE id = $1 AND counselor_id = $2 AND status = 'cancelled' RETURNING *",
      [id, req.counselor.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found or not cancelled" });
    }
    
    res.json({ message: "Appointment deleted successfully", deletedAppointment: result.rows[0] });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

router.post("/appointments/:id/postpone", async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;
    
    console.log("=== POSTPONE DEBUG ===");
    console.log("Appointment ID:", id);
    console.log("New Date:", newDate);
    console.log("Counselor ID:", req.counselor.id);
    console.log("Counselor:", req.counselor);
    
    // Check if appointment exists and get its current data
    const existingAppointment = await pool.query(
      "SELECT * FROM appointments WHERE id = $1",
      [id]
    );
    
    console.log("Existing appointment:", existingAppointment.rows[0]);
    
    if (existingAppointment.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    // Clean the date string - remove any extra characters
    const cleanDate = newDate.replace(/[()]/g, '').trim();
    
    // Validate the date format
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!dateRegex.test(cleanDate)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD HH:mm" });
    }
    
    // Convert newDate to ISO string for database
    // Parse the date as Nairobi time (database stores Nairobi time)
    const [datePart, timePart] = cleanDate.split(' ');
    const [yearStr, monthStr, dayStr] = datePart.split('-');
    const [hourStr, minuteStr] = timePart.split(':');
    
    // Create date in Nairobi time
    const appointmentDate = new Date(
      parseInt(yearStr), 
      parseInt(monthStr) - 1, // Month is 0-indexed
      parseInt(dayStr), 
      parseInt(hourStr), 
      parseInt(minuteStr)
    );
    
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ error: "Invalid date value" });
    }
    
    // Store as Nairobi time string (same format as bot)
    const year = appointmentDate.getFullYear();
    const month = (appointmentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = appointmentDate.getDate().toString().padStart(2, '0');
    const hour = appointmentDate.getHours().toString().padStart(2, '0');
    const minute = appointmentDate.getMinutes().toString().padStart(2, '0');
    const second = appointmentDate.getSeconds().toString().padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    const endHour = (parseInt(hour) + 1).toString().padStart(2, '0');
    const endDate = `${year}-${month}-${day} ${endHour}:${minute}:${second}`;
    
    console.log("Formatted dates:", { formattedDate, endDate });
    
    const result = await pool.query(
      "UPDATE appointments SET start_ts = $1, end_ts = $2, status = 'pending', updated_at = NOW() WHERE id = $3 AND counselor_id = $4 RETURNING *",
      [formattedDate, endDate, id, req.counselor.id]
    );
    
    console.log("Postpone update result:", result.rows);
    console.log("Rows affected:", result.rowCount);
    
    if (result.rows.length === 0) {
      console.log("❌ No appointment found with ID:", id, "for counselor:", req.counselor.id);
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    console.log("✅ Appointment postponed successfully:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error postponing appointment:", err);
    res.status(500).json({ error: "Failed to postpone appointment" });
  }
});

// Books routes
router.get("/books", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM books WHERE counselor_id = $1 ORDER BY created_at DESC",
      [req.counselor.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

router.post("/books", async (req, res) => {
  try {
    const { title, author, price_cents, pickup_station } = req.body;
    const result = await pool.query(
      "INSERT INTO books (title, author, price_cents, pickup_station, counselor_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, author, price_cents, pickup_station, req.counselor.id] // Changed from req.counselor.id
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating book:", err);
    res.status(500).json({ error: "Failed to create book" });
  }
});

router.put("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, price_cents, pickup_station } = req.body;
    const result = await pool.query(
      "UPDATE books SET title = $1, author = $2, price_cents = $3, pickup_station = $4 WHERE id = $5 AND counselor_id = $6 RETURNING *",
      [title, author, price_cents, pickup_station, id, req.counselor.id] // Changed from req.counselor.id
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

router.delete("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM books WHERE id = $1 AND counselor_id = $2 RETURNING *",
      [id, req.counselor.id] // Changed from req.counselor.id
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

// Announcements routes
router.get("/announcements", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM announcements WHERE counselor_id = $1 ORDER BY created_at DESC",
      [req.counselor.id] // Changed from req.counselor.id
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.post("/announcements", async (req, res) => {
  try {
    const { message } = req.body;
    const result = await pool.query(
      "INSERT INTO announcements (message, counselor_id) VALUES ($1, $2) RETURNING *",
      [message, req.counselor.id] // Changed from req.counselor.id
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating announcement:", err);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

router.delete("/announcements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the announcement details before deleting
    const announcementResult = await pool.query(
      "SELECT * FROM announcements WHERE id = $1 AND counselor_id = $2",
      [id, req.counselor.id]
    );
    
    if (announcementResult.rows.length === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    
    const announcement = announcementResult.rows[0];
    
    // Delete the announcement
    const result = await pool.query(
      "DELETE FROM announcements WHERE id = $1 AND counselor_id = $2 RETURNING *",
      [id, req.counselor.id]
    );
    
    // If it was a force announcement, notify students that it was deleted
    if (announcement.is_force && announcement.sent_to_all) {
      try {
        const { sendMessageToUser } = await import('../utils/botSender.js');
        
        // Get all registered users
        const usersResult = await pool.query(
          "SELECT telegram_user_id, first_name, last_name, telegram_username FROM user_sessions WHERE telegram_user_id IS NOT NULL"
        );
        const users = usersResult.rows;
        
        const deletionMessage = `Previous announcement has been removed by the counseling department.`;
        
        // Send deletion notification to all users
        for (const user of users) {
          try {
            await sendMessageToUser(user.telegram_user_id, deletionMessage);
          } catch (err) {
            console.error(`Failed to notify user ${user.telegram_user_id} about announcement deletion:`, err);
          }
        }
        
        console.log(`Announcement deletion notification sent to ${users.length} users`);
      } catch (err) {
        console.error("Error sending deletion notification:", err);
        // Don't fail the deletion if notification fails
      }
    }
    
    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("Error deleting announcement:", err);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

// Absence routes
router.get("/absence", async (req, res) => {
  try {
  const result = await pool.query(
      "SELECT * FROM absence_days WHERE counselor_id = $1 ORDER BY date DESC",
      [req.counselor.id] // Changed from req.counselor.id
  );
  res.json(result.rows);
  } catch (err) {
    console.error("Error fetching absence days:", err);
    res.status(500).json({ error: "Failed to fetch absence days" });
  }
});

router.post("/absence", async (req, res) => {
  try {
    const { date } = req.body;
    const result = await pool.query(
      "INSERT INTO absence_days (date, counselor_id) VALUES ($1, $2) RETURNING *",
      [date, req.counselor.id] // Changed from req.counselor.id
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error marking absence:", err);
    res.status(500).json({ error: "Failed to mark absence" });
  }
});

router.delete("/absence/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM absence_days WHERE id = $1 AND counselor_id = $2 RETURNING *",
      [id, req.counselor.id] // Changed from req.counselor.id
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Absence day not found" });
    }
    res.json({ message: "Absence day removed" });
  } catch (err) {
    console.error("Error removing absence day:", err);
    res.status(500).json({ error: "Failed to remove absence day" });
  }
});

// Force announcement endpoint - sends to all registered users
router.post("/announcements/force", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // First, save the announcement to the database
    const announcementResult = await pool.query(
      "INSERT INTO announcements (message, counselor_id, is_force, sent_to_all) VALUES ($1, $2, true, true) RETURNING *",
      [message.trim(), req.counselor.id]
    );

    // Get all registered users from user_sessions table (Telegram users)
    const usersResult = await pool.query(
      "SELECT telegram_user_id, first_name, last_name, telegram_username FROM user_sessions WHERE telegram_user_id IS NOT NULL"
    );
    const users = usersResult.rows;

    console.log(`🚨 Force announcement sent by ${req.counselor.name}: "${message}"`);
    console.log(`📊 Sending to ${users.length} registered users`);

    // Import bot sender utility
    const { sendMessageToUser } = await import('../utils/botSender.js');

    // Send to all registered users via Telegram bot
    let successCount = 0;
    let failCount = 0;
    const failedUsers = [];

    // Format the announcement message
    const announcementMessage = message.trim();

    for (const user of users) {
      try {
        const sent = await sendMessageToUser(user.telegram_user_id, announcementMessage);
        if (sent) {
          console.log(`✅ Sent to ${user.first_name || user.telegram_username || 'User'} (${user.telegram_user_id})`);
          successCount++;
        } else {
          console.log(`❌ Failed to send to ${user.first_name || user.telegram_username || 'User'} (${user.telegram_user_id})`);
          failCount++;
          failedUsers.push({
            name: user.first_name || user.telegram_username || 'Unknown',
            telegram_id: user.telegram_user_id
          });
        }
      } catch (err) {
        console.error(`❌ Error sending to user ${user.telegram_user_id}:`, err);
        failCount++;
        failedUsers.push({
          name: user.first_name || user.telegram_username || 'Unknown',
          telegram_id: user.telegram_user_id,
          error: err.message
        });
      }
    }

    // Log summary
    console.log(`📊 Force announcement summary:`);
    console.log(`   Total users: ${users.length}`);
    console.log(`   Sent successfully: ${successCount}`);
    console.log(`   Failed: ${failCount}`);

    if (failedUsers.length > 0) {
      console.log(`   Failed users:`, failedUsers);
    }

    res.json({
      success: true,
      message: "Force announcement sent successfully",
      announcement: announcementResult.rows[0],
      stats: {
        total_users: users.length,
        sent_successfully: successCount,
        failed: failCount,
        failed_users: failedUsers
      }
    });

  } catch (err) {
    console.error("Error sending force announcement:", err);
    res.status(500).json({ error: "Failed to send force announcement" });
  }
});

// Support tickets routes with pagination
router.get("/support/tickets", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const priority = req.query.priority;
    const offset = (page - 1) * limit;

    // Build dynamic query
    let whereClause = "";
    let queryParams = [];
    let paramCount = 0;

    if (status) {
      whereClause += ` WHERE st.status = $${++paramCount}`;
      queryParams.push(status);
    }

    if (priority) {
      whereClause += whereClause ? ` AND st.priority = $${++paramCount}` : ` WHERE st.priority = $${++paramCount}`;
      queryParams.push(priority);
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM support_tickets st${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalTickets = parseInt(countResult.rows[0].total);

    // Get paginated tickets
    const ticketsQuery = `
      SELECT st.*, 
             COALESCE(st.student_name, 'Unknown') as student_name,
             COALESCE(st.admission_no, 'N/A') as admission_no
      FROM support_tickets st
      ${whereClause}
      ORDER BY st.updated_at DESC, st.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    queryParams.push(limit, offset);
    const result = await pool.query(ticketsQuery, queryParams);
    
    // Only fetch replies for tickets on current page (not all tickets)
    const ticketsWithReplies = await Promise.all(
      result.rows.map(async (ticket) => {
        const repliesResult = await pool.query(
          `SELECT sm.*, c.name as counselor_name
           FROM support_messages sm
           LEFT JOIN counselors c ON sm.sender_id = c.id AND sm.sender_type = 'counselor'
           WHERE sm.ticket_id = $1
           ORDER BY sm.created_at ASC
           LIMIT 50`,
          [ticket.id]
        );
        
        return {
          ...ticket,
          replies: repliesResult.rows
        };
      })
    );
    
    const totalPages = Math.ceil(totalTickets / limit);
    
    res.json({ 
      success: true, 
      tickets: ticketsWithReplies,
      pagination: {
        currentPage: page,
        totalPages,
        totalTickets,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error("Error fetching support tickets:", err);
    res.status(500).json({ error: "Failed to fetch support tickets" });
  }
});

router.post("/support/tickets/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // Get ticket details including student's telegram info
    const ticketResult = await pool.query(
      "SELECT * FROM support_tickets WHERE id = $1",
      [id]
    );
    
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    const ticket = ticketResult.rows[0];
    
    // Add reply to ticket
    const result = await pool.query(
      `INSERT INTO support_messages (ticket_id, sender_type, sender_id, message, is_internal)
       VALUES ($1, 'counselor', $2, $3, false)
       RETURNING *`,
      [id, req.counselor.id, message.trim()]
    );
    
    // Update ticket status to 'replied'
    await pool.query(
      "UPDATE support_tickets SET status = 'replied', updated_at = NOW() WHERE id = $1",
      [id]
    );
    
    // Send reply to student via Telegram bot
    try {
      const { sendMessageToUser } = await import('../utils/botSender.js');
      const isDM = req.body.isDM || false;
      
      let replyMessage;
      if (isDM) {
        replyMessage = `Message from ${req.counselor.name} (Ticket #${ticket.id}):\n\n${message.trim()}\n\nTo reply, just type: dm ${ticket.id} [your message]`;
      } else {
        replyMessage = `Reply from ${req.counselor.name} (Ticket #${ticket.id}):\n\n${message.trim()}\n\nDid this help you? Type "satisfied ${ticket.id}" if yes, or "not satisfied ${ticket.id}" if you need more help.\n\nYou can also just reply naturally - I'll understand and add it to your ticket!`;
      }
      
      const sent = await sendMessageToUser(ticket.telegram_user_id, replyMessage);
      if (sent) {
        console.log(`✅ ${isDM ? 'DM' : 'Support reply'} sent to student ${ticket.telegram_user_id} for ticket #${ticket.id}`);
      } else {
        console.log(`❌ Failed to send ${isDM ? 'DM' : 'Support reply'} to student ${ticket.telegram_user_id} for ticket #${ticket.id}`);
      }
    } catch (botError) {
      console.error("Error sending reply via bot:", botError);
      // Don't fail the request if bot message fails
    }
    
    res.json({ success: true, message: result.rows[0] });
  } catch (err) {
    console.error("Error replying to ticket:", err);
    res.status(500).json({ error: "Failed to reply to ticket" });
  }
});

router.patch("/support/tickets/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['open', 'replied', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const result = await pool.query(
      "UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    res.json({ success: true, ticket: result.rows[0] });
  } catch (err) {
    console.error("Error updating ticket status:", err);
    res.status(500).json({ error: "Failed to update ticket status" });
  }
});

// Delete a reply
router.delete("/support/tickets/:ticketId/replies/:replyId", async (req, res) => {
  try {
    const { ticketId, replyId } = req.params;
    
    const result = await pool.query(
      "DELETE FROM support_messages WHERE id = $1 AND ticket_id = $2 RETURNING *",
      [replyId, ticketId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Reply not found" });
    }
    
    res.json({ success: true, message: "Reply deleted successfully" });
  } catch (err) {
    console.error("Error deleting reply:", err);
    res.status(500).json({ error: "Failed to delete reply" });
  }
});

// Clear all support tickets (admin only)
router.delete("/support/tickets/clear-all", async (req, res) => {
  try {
    // Check if user is admin
    if (!req.counselor.is_admin) {
      return res.status(403).json({ error: "Only administrators can clear all tickets" });
    }
    
    // Delete all support messages first (due to foreign key constraint)
    await pool.query("DELETE FROM support_messages");
    
    // Delete all support tickets
    const result = await pool.query("DELETE FROM support_tickets RETURNING *");
    
    res.json({
      success: true,
      message: `Successfully cleared ${result.rows.length} support tickets`,
      clearedCount: result.rows.length
    });
  } catch (err) {
    console.error("Error clearing all support tickets:", err);
    res.status(500).json({ error: "Failed to clear all support tickets" });
  }
});

// Clear individual support ticket
router.delete("/support/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ticket exists
    const ticketResult = await pool.query("SELECT * FROM support_tickets WHERE id = $1", [id]);
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    // Delete support messages first (due to foreign key constraint)
    await pool.query("DELETE FROM support_messages WHERE ticket_id = $1", [id]);
    
    // Delete the ticket
    const result = await pool.query("DELETE FROM support_tickets WHERE id = $1 RETURNING *", [id]);
    
    res.json({
      success: true,
      message: "Support ticket deleted successfully",
      ticket: result.rows[0]
    });
  } catch (err) {
    console.error("Error deleting support ticket:", err);
    res.status(500).json({ error: "Failed to delete support ticket" });
  }
});

// Clear old support tickets (older than specified days)
router.delete("/support/tickets/clear-old", async (req, res) => {
  try {
    const { days = 30 } = req.body; // Default to clear tickets older than 30 days
    
    // Get tickets to be deleted
    const ticketsToDelete = await pool.query(
      "SELECT id FROM support_tickets WHERE created_at < CURRENT_TIMESTAMP - INTERVAL $1 days",
      [days]
    );
    
    if (ticketsToDelete.rows.length === 0) {
      return res.json({
        success: true,
        message: "No old tickets found to clear",
        clearedCount: 0
      });
    }
    
    const ticketIds = ticketsToDelete.rows.map(row => row.id);
    
    // Delete support messages first
    await pool.query(
      "DELETE FROM support_messages WHERE ticket_id = ANY($1)",
      [ticketIds]
    );
    
    // Delete old tickets
    const result = await pool.query(
      "DELETE FROM support_tickets WHERE id = ANY($1) RETURNING *",
      [ticketIds]
    );
    
    res.json({
      success: true,
      message: `Successfully cleared ${result.rows.length} old support tickets`,
      clearedCount: result.rows.length,
      daysCleared: days
    });
  } catch (err) {
    console.error("Error clearing old support tickets:", err);
    res.status(500).json({ error: "Failed to clear old support tickets" });
  }
});

// Get messages for a specific ticket with pagination
router.get("/support/tickets/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    // Get total message count
    const countResult = await pool.query(
      "SELECT COUNT(*) as total FROM support_messages WHERE ticket_id = $1",
      [id]
    );
    const totalMessages = parseInt(countResult.rows[0].total);
    
    // Get paginated messages
    const result = await pool.query(
      `SELECT sm.*, c.name as counselor_name
       FROM support_messages sm
       LEFT JOIN counselors c ON sm.sender_id = c.id AND sm.sender_type = 'counselor'
       WHERE sm.ticket_id = $1
       ORDER BY sm.created_at ASC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );
    
    const totalPages = Math.ceil(totalMessages / limit);
    
    res.json({
      success: true,
      messages: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalMessages,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error("Error fetching ticket messages:", err);
    res.status(500).json({ error: "Failed to fetch ticket messages" });
  }
});

// Clear messages for a specific ticket
router.delete("/support/tickets/:id/clear-messages", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ticket exists
    const ticketResult = await pool.query("SELECT * FROM support_tickets WHERE id = $1", [id]);
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    // Delete all messages for this ticket
    const result = await pool.query(
      "DELETE FROM support_messages WHERE ticket_id = $1 RETURNING *",
      [id]
    );
    
    res.json({
      success: true,
      message: `Successfully cleared ${result.rows.length} messages`,
      clearedCount: result.rows.length
    });
  } catch (err) {
    console.error("Error clearing ticket messages:", err);
    res.status(500).json({ error: "Failed to clear ticket messages" });
  }
});

export default router;