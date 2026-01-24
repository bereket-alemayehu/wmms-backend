import mongoose from "mongoose";
import { Server } from "socket.io";
import Notification, { INotification } from "../models/notification.model";
import User from "../models/user.model";

/**
 * Create a notification and emit it via Socket.IO
 */
export const createNotification = async (
  userId: string | mongoose.Types.ObjectId,
  type: INotification["type"],
  title: string,
  message: string,
  relatedId?: string | mongoose.Types.ObjectId,
  relatedType?: "ticket" | "outage",
  io?: Server
): Promise<void> => {
  try {
    // Ensure userId is a string/ObjectId, not a populated object
    const userIdStr = typeof userId === "string" 
      ? userId 
      : (userId as any)._id?.toString() || userId.toString();
    
    const notification = await Notification.create({
      userId: userIdStr,
      type,
      title,
      message,
      relatedId,
      relatedType,
      read: false,
    });

    // Emit notification via Socket.IO if available
    if (io) {
      const userRoom = `user_${userIdStr}`;
      io.to(userRoom).emit("notification", {
        _id: notification._id.toString(),
        userId: notification.userId.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedId: notification.relatedId?.toString(),
        relatedType: notification.relatedType,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      });
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    // Don't throw - notifications shouldn't break the main flow
  }
};

/**
 * Create notifications for multiple users
 */
export const createNotificationsForUsers = async (
  userIds: (string | mongoose.Types.ObjectId)[],
  type: INotification["type"],
  title: string,
  message: string,
  relatedId?: string | mongoose.Types.ObjectId,
  relatedType?: "ticket" | "outage",
  io?: Server
): Promise<void> => {
  try {
    // Normalize userIds to strings and remove duplicates
    const normalizedUserIds = userIds.map((userId) => {
      if (typeof userId === "string") {
        return userId;
      }
      return (userId as any)._id?.toString() || userId.toString();
    });
    
    const uniqueUserIds = [...new Set(normalizedUserIds)];
    
    const notifications = await Promise.all(
      uniqueUserIds.map((userId) =>
        Notification.create({
          userId,
          type,
          title,
          message,
          relatedId,
          relatedType,
          read: false,
        })
      )
    );

    // Emit notifications via Socket.IO if available
    if (io) {
      notifications.forEach((notification) => {
        const userIdStr = notification.userId.toString();
        const userRoom = `user_${userIdStr}`;
        io.to(userRoom).emit("notification", {
          _id: notification._id.toString(),
          userId: userIdStr,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          relatedId: notification.relatedId?.toString(),
          relatedType: notification.relatedType,
          read: notification.read,
          createdAt: notification.createdAt.toISOString(),
          updatedAt: notification.updatedAt.toISOString(),
        });
      });
    }
  } catch (error) {
    console.error("Error creating notifications for users:", error);
    // Don't throw - notifications shouldn't break the main flow
  }
};

/**
 * Notify technician when ticket is assigned
 */
export const notifyTicketAssigned = async (
  technicianId: string | mongoose.Types.ObjectId,
  ticketId: string | mongoose.Types.ObjectId,
  ticketCategory: string,
  io?: Server
): Promise<void> => {
  await createNotification(
    technicianId,
    "ticket_assigned",
    "New Ticket Assigned",
    `You have been assigned a new ${ticketCategory} ticket.`,
    ticketId,
    "ticket",
    io
  );
};

/**
 * Notify customer when ticket is resolved
 */
export const notifyTicketResolved = async (
  customerId: string | mongoose.Types.ObjectId,
  ticketId: string | mongoose.Types.ObjectId,
  io?: Server
): Promise<void> => {
  await createNotification(
    customerId,
    "ticket_resolved",
    "Ticket Resolved",
    "Your ticket has been resolved. Please confirm if the issue is fixed.",
    ticketId,
    "ticket",
    io
  );
};

/**
 * Notify manager when customer closes ticket
 */
export const notifyTicketClosed = async (
  managerIds: (string | mongoose.Types.ObjectId)[],
  ticketId: string | mongoose.Types.ObjectId,
  io?: Server
): Promise<void> => {
  await createNotificationsForUsers(
    managerIds,
    "ticket_closed",
    "Ticket Closed",
    "A customer has closed their ticket.",
    ticketId,
    "ticket",
    io
  );
};

/**
 * Notify technician and supervisor when ticket is marked as unresolved
 */
export const notifyTicketUnresolved = async (
  technicianId: string | mongoose.Types.ObjectId,
  supervisorId: string | mongoose.Types.ObjectId,
  ticketId: string | mongoose.Types.ObjectId,
  io?: Server
): Promise<void> => {
  await createNotificationsForUsers(
    [technicianId, supervisorId],
    "ticket_unresolved",
    "Ticket Marked as Unresolved",
    "A customer has marked their ticket as unresolved. Please review and take action.",
    ticketId,
    "ticket",
    io
  );
};

/**
 * Notify all users in an office when outage is created
 */
export const notifyOutageCreated = async (
  officeId: string | mongoose.Types.ObjectId,
  outageId: string | mongoose.Types.ObjectId,
  outageTitle: string,
  io?: Server
): Promise<void> => {
  try {
    // Find ALL users in the office (technician, supervisor, customer, manager)
    const users = await User.find({
      officeId,
    }).select("_id");

    const userIds = users.map((user) => user._id.toString());

    if (userIds.length > 0) {
      // Remove duplicates (in case of any)
      const uniqueUserIds = [...new Set(userIds)];
      
      await createNotificationsForUsers(
        uniqueUserIds,
        "outage_created",
        "New Outage Reported",
        `A new outage has been reported: ${outageTitle}`,
        outageId,
        "outage",
        io
      );
    }
  } catch (error) {
    console.error("Error notifying outage creation:", error);
  }
};

/**
 * Notify all users in an office when outage is resolved
 */
export const notifyOutageResolved = async (
  officeId: string | mongoose.Types.ObjectId,
  outageId: string | mongoose.Types.ObjectId,
  outageTitle: string,
  io?: Server
): Promise<void> => {
  try {
    // Find ALL users in the office (technician, supervisor, customer, manager)
    const users = await User.find({
      officeId,
    }).select("_id");

    const userIds = users.map((user) => user._id.toString());

    if (userIds.length > 0) {
      // Remove duplicates (in case of any)
      const uniqueUserIds = [...new Set(userIds)];
      
      await createNotificationsForUsers(
        uniqueUserIds,
        "outage_resolved",
        "Outage Resolved",
        `The outage "${outageTitle}" has been resolved.`,
        outageId,
        "outage",
        io
      );
    }
  } catch (error) {
    console.error("Error notifying outage resolution:", error);
  }
};


