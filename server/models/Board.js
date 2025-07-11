import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  labels: [String],
  deadline: Date,
  comments: [commentSchema],
});

const columnSchema = new mongoose.Schema({
  title: String,
  tasks: [taskSchema]
});

const boardSchema = new mongoose.Schema({
  title: String,
  columns: [columnSchema],
  users: [String],
  activity: [String],
});

export default mongoose.model('Board', boardSchema);
